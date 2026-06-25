#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const markdown = process.argv.includes('--markdown');
const outputIndex = process.argv.indexOf('--output');
const outputPath = outputIndex >= 0 && process.argv[outputIndex + 1]
    ? path.resolve(root, process.argv[outputIndex + 1])
    : null;

const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'levels.js'), 'utf8'), context, { filename: 'levels.js' });
const levels = context.window.createLevelBook();

function textOf(field) {
    if (field && typeof field === 'object') {
        return field.zh || field.en || '';
    }
    return field || '';
}

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

function usedList(row) {
    return Object.entries(row.used || {})
        .filter(([, value]) => value)
        .map(([key]) => key);
}

function mechanicSignature(row) {
    const list = usedList(row);
    return list.length ? list.join('+') : 'route';
}

function classify(row, level) {
    const tools = usedList(row).filter(tool => tool !== 'rotation');
    if (!row.solved) return 'broken';
    if ((level.act || 1) >= 2 && row.turns <= 3) return 'short';
    if ((level.act || 1) >= 2 && row.turns <= 4 && tools.length === 0) return 'thin';
    if (row.turns >= 8 || tools.length >= 2) return 'meaty';
    return 'normal';
}

function buildReport() {
    const rows = runBotSummary();
    const byId = new Map(levels.map(level => [level.id, level]));
    const entries = rows.map(row => {
        const level = byId.get(row.id);
        return {
            id: row.id,
            number: row.number,
            title: textOf(row.title),
            act: level?.act || row.act || 1,
            chapter: textOf(level?.chapter || ''),
            turns: row.turns,
            solved: row.solved,
            mechanic: mechanicSignature(row),
            classification: classify(row, level || {}),
            firsts: []
        };
    });

    const seenMechanics = new Set();
    entries.forEach(entry => {
        entry.mechanic.split('+').forEach(mechanic => {
            if (!mechanic || mechanic === 'route') return;
            if (!seenMechanics.has(mechanic)) {
                entry.firsts.push(mechanic);
                seenMechanics.add(mechanic);
            }
        });
    });

    const fatigueRuns = [];
    let run = [];
    entries.forEach(entry => {
        if (!run.length || run[run.length - 1].mechanic === entry.mechanic) {
            run.push(entry);
        } else {
            if (run.length >= 3) fatigueRuns.push(run);
            run = [entry];
        }
    });
    if (run.length >= 3) fatigueRuns.push(run);

    const shortClusters = [];
    run = [];
    entries.forEach(entry => {
        if (entry.classification === 'short' || entry.classification === 'thin') {
            run.push(entry);
        } else {
            if (run.length >= 2) shortClusters.push(run);
            run = [];
        }
    });
    if (run.length >= 2) shortClusters.push(run);

    const actStats = [...new Set(entries.map(entry => entry.act))].map(act => {
        const scoped = entries.filter(entry => entry.act === act);
        const averageTurns = scoped.reduce((sum, entry) => sum + entry.turns, 0) / Math.max(1, scoped.length);
        return {
            act,
            count: scoped.length,
            averageTurns: Number(averageTurns.toFixed(2)),
            shortOrThin: scoped.filter(entry => ['short', 'thin'].includes(entry.classification)).map(entry => entry.id)
        };
    });

    return { generatedAt: new Date().toISOString(), actStats, fatigueRuns, shortClusters, entries };
}

function renderMarkdown(report) {
    const lines = [
        '# 黎明魔方难度曲线报告',
        '',
        '## 幕统计',
        '',
        '| 幕 | 关卡数 | 平均 Bot 回合 | 短/薄关 |',
        '| :--- | ---: | ---: | :--- |'
    ];
    report.actStats.forEach(stat => {
        lines.push(`| Act ${stat.act} | ${stat.count} | ${stat.averageTurns} | ${stat.shortOrThin.join(', ') || 'ok'} |`);
    });

    lines.push('', '## 关卡曲线', '', '| 关卡 | 回合 | 机制 | 分类 | 首次机制 |', '| :--- | ---: | :--- | :--- | :--- |');
    report.entries.forEach(entry => {
        lines.push(`| ${entry.id} ${entry.title.replace(/^L\\d+\\s*/, '')} | ${entry.turns} | ${entry.mechanic} | ${entry.classification} | ${entry.firsts.join(', ') || ''} |`);
    });

    lines.push('', '## 连续风险');
    if (!report.shortClusters.length && !report.fatigueRuns.length) {
        lines.push('', '- 暂无连续短关或连续同机制疲劳。');
    }
    report.shortClusters.forEach(cluster => {
        lines.push(`- 短/薄关簇：${cluster.map(entry => entry.id).join(' -> ')}`);
    });
    report.fatigueRuns.forEach(cluster => {
        lines.push(`- 同机制疲劳：${cluster[0].mechanic}，${cluster.map(entry => entry.id).join(' -> ')}`);
    });

    return `${lines.join('\n')}\n`;
}

const report = buildReport();
if (markdown) {
    const text = renderMarkdown(report);
    if (outputPath) fs.writeFileSync(outputPath, text);
    else console.log(text);
} else {
    console.log(JSON.stringify(report, null, 2));
}
