#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');
const markdown = process.argv.includes('--markdown');
const failOnWarnings = process.argv.includes('--fail-on-warnings');
const outputIndex = process.argv.indexOf('--output');
const outputPath = outputIndex >= 0 && process.argv[outputIndex + 1]
    ? path.resolve(root, process.argv[outputIndex + 1])
    : null;

const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'levels.js'), 'utf8'), context, { filename: 'levels.js' });
const levels = context.window.createLevelBook();

function runBotSummary() {
    const raw = execFileSync(process.execPath, [
        path.join(root, 'tools/playtest_bot.js'),
        '--json'
    ], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 12
    });
    return JSON.parse(raw).levels;
}

function levelById(id) {
    return levels.find(level => level.id === id);
}

function expectedTools(level) {
    const tools = [];
    if ((level.bridges || []).length > 0 || level.validation?.bridgeTool) tools.push('bridge');
    if (level.patchCharges || level.validation?.patchTool) tools.push('patch');
    if (level.beaconCharges || level.validation?.beaconTool) tools.push('beacon');
    if (level.validation?.mustUseRotation) tools.push('rotation');
    return tools;
}

function minimumTarget(row, level, toolList) {
    const act = level.act || 1;
    if (act <= 1) return row.number >= 9 ? 5 : 3;
    if (toolList.length >= 2) return 5;
    if (toolList.length === 1) return 4;
    return 5;
}

function makeFinding(severity, code, message, action) {
    return { severity, code, message, action };
}

function analyze(row) {
    const level = levelById(row.id);
    const findings = [];
    if (!row.solved) {
        findings.push(makeFinding(
            'error',
            'unsolved',
            'Bot 未解出',
            '先修可解性；不要继续叠加敌人或缺口。'
        ));
        return { level, row, findings };
    }

    const act = level.act || 1;
    const toolList = expectedTools(level);
    toolList.forEach(tool => {
        if (!row.used?.[tool]) {
            findings.push(makeFinding(
                'error',
                'tool-not-used',
                `${tool} 存在/被要求但 Bot 最优解未使用`,
                '改地形或敌人压力，让该工具自然成为最优路线的一部分。'
            ));
        }
    });

    if (act >= 2 && row.turns <= 2) {
        findings.push(makeFinding(
            'error',
            'act2-button-flow',
            '第二幕关卡 <= 2 回合，像按钮流程而不是残局',
            '必须重构：至少加入一次路线判断、敌人压力或目标转移。'
        ));
    } else if (act >= 2 && row.turns <= 3 && toolList.length <= 1) {
        findings.push(makeFinding(
            'warning',
            'act2-short-single-tool',
            '第二幕 3 回合短关，需要人工确认是否只是教学节拍',
            '若不是首次教学，应合并、加压或改成需要先判断再使用工具。'
        ));
    }

    if (act >= 2 && toolList.length === 0 && row.turns <= 4) {
        findings.push(makeFinding(
            'warning',
            'act2-short-no-tool',
            '第二幕无工具短关，可能与“四阶提供更多变化”的目标冲突',
            '检查是否只是三阶放大；若是主线关，应加入四阶空间压力或移到节奏过渡。'
        ));
    }

    const targetTurns = minimumTarget(row, level, toolList);
    if (act >= 2 && row.turns < targetTurns) {
        findings.push(makeFinding(
            'info',
            'below-target-turns',
            `Bot 回合数 ${row.turns} 低于建议目标 ${targetTurns}`,
            '不一定要硬拉长，但必须确认玩家有选择、判断或风险管理。'
        ));
    }

    if (level.validation?.minBridgeTurnGain && !row.used.bridge) {
        findings.push(makeFinding(
            'error',
            'bridge-gain-mismatch',
            '声明 bridge 收益但 Bot 解未走传送门',
            '修正传送门位置或删除错误验证声明。'
        ));
    }
    if (level.validation?.minPatchTurnGain && !row.used.patch) {
        findings.push(makeFinding(
            'error',
            'patch-gain-mismatch',
            '声明 patch 收益但 Bot 解未用补片',
            '让补片成为真实断点，不能只在规则里点名。'
        ));
    }
    if (level.validation?.minBeaconTurnGain && !row.used.beacon) {
        findings.push(makeFinding(
            'error',
            'beacon-gain-mismatch',
            '声明 beacon 收益但 Bot 解未用诱饵',
            '调整敌人目标与时间窗，让诱饵改变路线结果。'
        ));
    }

    if (row.expanded > 50000) {
        findings.push(makeFinding(
            'warning',
            'search-heavy',
            '搜索状态数偏高，可能说明谜题可读性或 Bot 启发式需要优化',
            '优先检查是否存在过多等价旋转或无意义绕路。'
        ));
    }

    return { level, row, findings };
}

function renderMarkdown(results) {
    const lines = [
        '# 黎明魔方自动关卡质量审计',
        '',
        '| 关卡 | 回合 | 使用机制 | 最高等级 | 发现 | 建议动作 |',
        '| :--- | ---: | :--- | :--- | :--- | :--- |'
    ];
    results.forEach(item => {
        const used = item.row.solved
            ? Object.entries(item.row.used).filter(([, value]) => value).map(([key]) => key).join(' + ') || 'route'
            : '-';
        const highest = highestSeverity(item.findings);
        const messages = item.findings.map(finding => `${finding.severity}:${finding.message}`).join('<br>') || 'ok';
        const actions = item.findings.map(finding => finding.action).join('<br>') || 'ok';
        lines.push(`| ${item.row.title} | ${item.row.solved ? item.row.turns : 'FAIL'} | ${used} | ${highest} | ${messages} | ${actions} |`);
    });
    return `${lines.join('\n')}\n`;
}

function highestSeverity(findings) {
    if (findings.some(finding => finding.severity === 'error')) return 'error';
    if (findings.some(finding => finding.severity === 'warning')) return 'warning';
    if (findings.some(finding => finding.severity === 'info')) return 'info';
    return 'ok';
}

const rows = runBotSummary();
const results = rows.map(analyze);
const issueCount = results.reduce((sum, item) => sum + item.findings.filter(finding => finding.severity === 'error').length, 0);
const warningCount = results.reduce((sum, item) => sum + item.findings.filter(finding => finding.severity === 'warning').length, 0);
const infoCount = results.reduce((sum, item) => sum + item.findings.filter(finding => finding.severity === 'info').length, 0);

if (markdown) {
    const text = renderMarkdown(results);
    if (outputPath) fs.writeFileSync(outputPath, text);
    else console.log(text);
} else {
    console.log(JSON.stringify({
        generatedAt: new Date().toISOString(),
        issueCount,
        warningCount,
        infoCount,
        issues: results
            .filter(item => item.findings.length)
            .map(item => ({
                id: item.row.id,
                title: item.row.title,
                turns: item.row.turns,
                used: item.row.used,
                severity: highestSeverity(item.findings),
                findings: item.findings
            }))
    }, null, 2));
}

if ((strict && issueCount > 0) || (failOnWarnings && (issueCount > 0 || warningCount > 0))) {
    process.exit(1);
}
