#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {
    window: {},
    document: { getElementById: () => null },
    console,
    CustomEvent: class CustomEvent {
        constructor(type, init = {}) {
            this.type = type;
            this.detail = init.detail;
        }
    },
    setTimeout,
    clearTimeout
};
context.window.dispatchEvent = () => {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'levels.js'), 'utf8'), context, { filename: 'levels.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'game.js'), 'utf8'), context, { filename: 'game.js' });

const GameEngine = context.window.GameEngine;
const allLevels = new GameEngine().levels;
const rawArgs = process.argv.slice(2);
const options = {
    summary: rawArgs.includes('--summary'),
    json: rawArgs.includes('--json'),
    markdown: rawArgs.includes('--markdown'),
    output: null
};
const outputIndex = rawArgs.indexOf('--output');
if (outputIndex >= 0 && rawArgs[outputIndex + 1]) {
    options.output = path.resolve(root, rawArgs[outputIndex + 1]);
}
const patternArg = rawArgs.find(arg => !arg.startsWith('--') && rawArgs[rawArgs.indexOf(arg) - 1] !== '--output');
const targetPattern = patternArg ? new RegExp(patternArg, 'i') : null;

function textOf(field) {
    if (field && typeof field === 'object') {
        return field.zh || field.en || '';
    }
    return field || '';
}

const COLORS = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m'
};

function createEngine(size = 3) {
    const engine = new GameEngine();
    engine.N = size;
    engine.resetRuntimeState();
    engine.buildTopology();
    engine.precomputeRotations();
    return engine;
}

function createLevelEngine(level, index) {
    const engine = createEngine(level.size || 3);
    engine.currentLevel = level;
    engine.currentLevelIndex = index;
    engine.resetRuntimeState();
    engine.buildTopology();
    engine.precomputeRotations();
    engine.spawnEntities(level.ais || []);
    return engine;
}

function cloneState(state, action = null) {
    return {
        player: state.player,
        key: state.key,
        hasKey: state.hasKey,
        exit: state.exit,
        ais: state.ais.map(ai => ({ ...ai })),
        bridges: state.bridges.map(link => ({ ...link })),
        voids: new Set(state.voids),
        patches: new Set(state.patches),
        patchCharges: state.patchCharges,
        beaconCharges: state.beaconCharges,
        breakCharges: state.breakCharges,
        beaconCell: state.beaconCell,
        beaconTTL: state.beaconTTL,
        beaconDuration: state.beaconDuration,
        usedRotation: state.usedRotation,
        usedBridge: state.usedBridge,
        usedPatch: state.usedPatch,
        usedBeacon: state.usedBeacon,
        usedBreak: state.usedBreak,
        keyMovedByRotation: false,
        log: action ? [...state.log, action] : [...state.log]
    };
}

function serializeSet(values) {
    return [...values].sort((a, b) => a - b).join(',');
}

function serializeLinks(links) {
    return links
        .map(link => `${Math.min(link.a, link.b)}-${Math.max(link.a, link.b)}`)
        .sort()
        .join(',');
}

function stateKey(state) {
    return [
        state.player,
        state.key,
        state.hasKey ? 1 : 0,
        state.exit,
        state.ais.map(ai => `${ai.type}:${ai.pos}:${ai.aggro || ''}`).join(','),
        serializeLinks(state.bridges),
        serializeSet(state.voids),
        serializeSet(state.patches),
        state.patchCharges,
        state.beaconCharges,
        state.breakCharges,
        state.beaconCell ?? -1,
        state.beaconTTL,
        state.usedRotation ? 1 : 0,
        state.usedBridge ? 1 : 0,
        state.usedPatch ? 1 : 0,
        state.usedBeacon ? 1 : 0,
        state.usedBreak ? 1 : 0
    ].join('|');
}

function describeCell(engine, cellId) {
    const cell = engine.cells[cellId];
    return `${engine.faceLabels[cell.face]}${cell.row + 1}-${cell.col + 1}`;
}

function bridgeDestination(state, cellId) {
    const link = state.bridges.find(item => item.a === cellId || item.b === cellId);
    if (!link) return null;
    return link.a === cellId ? link.b : link.a;
}

function isBridgeStep(state, from, to) {
    return bridgeDestination(state, from) === to;
}

function isPlayerWalkable(engine, state, cellId) {
    if (cellId === null || cellId === undefined || !engine.cells[cellId]) return false;
    return !state.voids.has(cellId) || state.patches.has(cellId);
}

function isAIWalkable(engine, state, cellId) {
    if (cellId === null || cellId === undefined || !engine.cells[cellId]) return false;
    if (state.voids.has(cellId)) return false;
    if (state.patches.has(cellId)) return false;
    return true;
}

function neighbors(engine, state, cellId, actor = 'player') {
    const canEnter = actor === 'ai'
        ? next => isAIWalkable(engine, state, next)
        : next => isPlayerWalkable(engine, state, next);
    const base = Object.values(engine.cells[cellId].neighbors)
        .filter(next => next !== null && next !== undefined && canEnter(next));
    const bridge = bridgeDestination(state, cellId);
    if (bridge !== null && bridge !== undefined && canEnter(bridge)) base.push(bridge);
    return [...new Set(base)];
}

function shortestDistance(engine, state, start, target, actor = 'player') {
    if (start === target) return 0;
    const queue = [start];
    const distance = new Map([[start, 0]]);
    for (let head = 0; head < queue.length; head++) {
        const current = queue[head];
        for (const next of neighbors(engine, state, current, actor)) {
            if (distance.has(next)) continue;
            const value = distance.get(current) + 1;
            if (next === target) return value;
            distance.set(next, value);
            queue.push(next);
        }
    }
    return Infinity;
}

function nextStepToward(engine, state, start, target) {
    let best = null;
    let bestScore = Infinity;
    for (const next of neighbors(engine, state, start, 'ai')) {
        const score = shortestDistance(engine, state, next, target, 'ai');
        if (score < bestScore) {
            bestScore = score;
            best = next;
        }
    }
    return best;
}

function aiTarget(engine, state, ai) {
    if (state.beaconCell !== null &&
        state.beaconTTL > 0 &&
        isAIWalkable(engine, state, state.beaconCell)) {
        return state.beaconCell;
    }
    if (ai.type === 'guardian') {
        if (state.hasKey) return ai.aggro === 'guardDoor' ? state.exit : state.player;
        if (state.keyMovedByRotation) return state.key;
        if (engine.cells[state.player].face === engine.cells[state.key].face) return state.player;
        return state.key;
    }
    return state.player;
}

function aiBudget(state, ai) {
    return ai.type === 'guardian'
        ? (state.hasKey ? 2 : 1)
        : 2;
}

function forbiddenForAI(engine, state, cellId) {
    if (!isAIWalkable(engine, state, cellId)) return true;
    if (!state.hasKey && state.key >= 0 && cellId === state.key) return true;
    if (state.exit >= 0 && cellId === state.exit) return true;
    return false;
}

function advanceAI(engine, state) {
    for (const ai of state.ais) {
        for (let step = 0; step < aiBudget(state, ai); step++) {
            const target = aiTarget(engine, state, ai);
            const next = nextStepToward(engine, state, ai.pos, target);
            if (next !== null && !forbiddenForAI(engine, state, next)) ai.pos = next;
            if (state.beaconCell !== null && ai.pos === state.beaconCell) {
                state.beaconCell = null;
                state.beaconTTL = 0;
            }
            if (ai.pos === state.player) return true;
        }
    }
    if (state.beaconCell !== null && state.beaconTTL > 0) {
        state.beaconTTL -= 1;
        if (state.beaconTTL <= 0) state.beaconCell = null;
    }
    state.keyMovedByRotation = false;
    return false;
}

function reservedBeaconCell(state, cellId) {
    return cellId === state.player ||
        (!state.hasKey && cellId === state.key) ||
        cellId === state.exit ||
        state.ais.some(ai => ai.pos === cellId) ||
        state.bridges.some(link => link.a === cellId || link.b === cellId) ||
        state.patches.has(cellId);
}

function generateBeaconActions(engine, state) {
    if (state.beaconCharges <= 0 || state.log.length > 4) return [];
    const candidates = new Set();
    const add = cellId => {
        if (isPlayerWalkable(engine, state, cellId) && !reservedBeaconCell(state, cellId)) {
            candidates.add(cellId);
        }
    };
    state.ais.forEach(ai => {
        neighbors(engine, state, ai.pos, 'player').forEach(add);
        const target = aiTarget(engine, state, ai);
        neighbors(engine, state, target, 'player').forEach(add);
    });
    [state.player, state.key, state.exit].forEach(cellId => {
        if (cellId >= 0) neighbors(engine, state, cellId, 'player').forEach(add);
    });
    return [...candidates].slice(0, 16).map(cell => ({ type: 'beacon', cell }));
}

function generatePatchActions(state) {
    if (state.patchCharges <= 0) return [];
    return [...state.voids]
        .filter(cell => !state.patches.has(cell))
        .map(cell => ({ type: 'patch', cell }));
}

function isReservedBreakCell(state, cellId) {
    return cellId === state.player ||
        (!state.hasKey && state.key >= 0 && cellId === state.key) ||
        cellId === state.exit ||
        state.ais.some(ai => ai.pos === cellId) ||
        state.bridges.some(link => link.a === cellId || link.b === cellId);
}

function isLegalBreakTarget(engine, state, cellId) {
    if (state.breakCharges <= 0 || !engine.cells[cellId]) return false;
    if (isReservedBreakCell(state, cellId)) return false;
    return !state.voids.has(cellId) || state.patches.has(cellId);
}

function generateBreakActions(engine, state) {
    if (state.breakCharges <= 0) return [];
    const candidates = new Set();
    const add = cellId => {
        if (isLegalBreakTarget(engine, state, cellId)) candidates.add(cellId);
    };
    state.ais.forEach(ai => {
        const target = aiTarget(engine, state, ai);
        const queue = [[ai.pos]];
        const seen = new Set([ai.pos]);
        for (let head = 0; head < queue.length && head < 8; head++) {
            const path = queue[head];
            const current = path[path.length - 1];
            if (current === target || path.length > 4) continue;
            for (const next of neighbors(engine, state, current, 'ai')) {
                if (seen.has(next)) continue;
                seen.add(next);
                const nextPath = [...path, next];
                nextPath.slice(1).forEach(add);
                queue.push(nextPath);
            }
        }
        neighbors(engine, state, ai.pos, 'ai').forEach(add);
    });
    [state.player, state.key, state.exit]
        .filter(cellId => cellId !== null && cellId !== undefined && cellId >= 0)
        .forEach(cellId => neighbors(engine, state, cellId, 'player').forEach(add));
    return [...candidates].slice(0, 18).map(cell => ({ type: 'break', cell }));
}

function generateMoveActions(engine, state) {
    const actions = [{ type: 'move', sequence: [], usesBridge: false }];
    const walk = (current, stepsLeft, patches, sequence, usesBridge) => {
        if (stepsLeft <= 0) return;
        const local = { ...state, patches };
        for (const destination of neighbors(engine, local, current, 'player')) {
            if (destination === state.player || sequence.includes(destination)) continue;
            const nextPatches = new Set(patches);
            if (nextPatches.has(current)) nextPatches.delete(current);
            actions.push({
                type: 'move',
                sequence: [...sequence, destination],
                usesBridge: usesBridge || isBridgeStep(state, current, destination)
            });
            walk(destination, stepsLeft - 1, nextPatches, [...sequence, destination], usesBridge || isBridgeStep(state, current, destination));
        }
    };
    walk(state.player, 2, new Set(state.patches), [], false);
    return actions;
}

function generateRotationActions(engine, state) {
    if (!state.rotationEnabled) return [];
    const actions = [];
    for (const axis of ['X', 'Y', 'Z']) {
        for (let layer = 0; layer < engine.N; layer++) {
            actions.push({ type: 'rotate', axis, layer, direction: 'CW' });
            actions.push({ type: 'rotate', axis, layer, direction: 'CCW' });
        }
    }
    return actions;
}

function applyAction(engine, state, action) {
    const next = cloneState(state, action);
    let dead = false;
    let win = false;
    if (action.type === 'patch') {
        if (next.patchCharges <= 0 || !next.voids.has(action.cell)) return null;
        next.patchCharges -= 1;
        next.patches.add(action.cell);
        next.usedPatch = true;
        return next;
    }
    if (action.type === 'beacon') {
        if (next.beaconCharges <= 0 || reservedBeaconCell(next, action.cell)) return null;
        next.beaconCharges -= 1;
        next.beaconCell = action.cell;
        next.beaconTTL = next.beaconDuration;
        next.usedBeacon = true;
        return next;
    }
    if (action.type === 'break') {
        if (!isLegalBreakTarget(engine, next, action.cell)) return null;
        next.breakCharges -= 1;
        next.patches.delete(action.cell);
        next.voids.add(action.cell);
        next.usedBreak = true;
        return next;
    }
    if (action.type === 'move') {
        next.usedBridge = next.usedBridge || action.usesBridge;
        for (const destination of action.sequence) {
            const previous = next.player;
            if (!isPlayerWalkable(engine, next, destination)) return null;
            next.player = destination;
            if (next.patches.has(previous)) next.patches.delete(previous);
            if (!next.hasKey && next.player === next.key) {
                next.hasKey = true;
                next.key = -1;
            }
            if (next.ais.some(ai => ai.pos === next.player)) {
                dead = true;
                break;
            }
            if (next.hasKey && next.player === next.exit) {
                win = true;
                break;
            }
        }
    } else if (action.type === 'rotate') {
        const perm = engine.rotationPermutations[action.axis][action.layer][action.direction];
        const oldKey = next.key;
        next.player = perm[next.player];
        next.ais.forEach(ai => { ai.pos = perm[ai.pos]; });
        next.bridges = next.bridges.map(link => ({ a: perm[link.a], b: perm[link.b] }));
        next.voids = new Set([...next.voids].map(cell => perm[cell]));
        next.patches = new Set([...next.patches].map(cell => perm[cell]));
        if (next.beaconCell !== null) next.beaconCell = perm[next.beaconCell];
        if (!next.hasKey && next.key >= 0) {
            next.key = perm[next.key];
            next.keyMovedByRotation = oldKey !== next.key;
        }
        next.exit = perm[next.exit];
        next.usedRotation = true;
        if (!next.hasKey && next.player === next.key) {
            next.hasKey = true;
            next.key = -1;
        }
        dead = next.ais.some(ai => ai.pos === next.player);
        win = next.hasKey && next.player === next.exit;
    }
    if (dead) return null;
    if (win) return { ...next, win: true };
    if (advanceAI(engine, next)) return null;
    return next;
}

function heuristic(engine, state) {
    const target = state.hasKey ? state.exit : state.key;
    const distance = shortestDistance(engine, state, state.player, target, 'player');
    const danger = Math.min(...state.ais.map(ai => shortestDistance(engine, state, ai.pos, state.player, 'ai')));
    const threatPenalty = danger <= 1 ? 80 : (danger <= 2 ? 24 : 0);
    const keyPenalty = state.hasKey ? 0 : 4;
    return (Number.isFinite(distance) ? distance : 999) + threatPenalty + keyPenalty;
}

function actionCost(action) {
    if (action.type === 'rotate') return 2.2;
    if (action.type === 'patch' || action.type === 'beacon' || action.type === 'break') return 0.8;
    return Math.max(1, action.sequence.length || 1);
}

function solve(level, index) {
    const engine = createLevelEngine(level, index);
    const start = {
        player: engine.playerPos,
        key: engine.keyPos ?? -1,
        hasKey: engine.hasKey,
        exit: engine.exitPos,
        rotationEnabled: engine.rotationEnabled,
        ais: engine.ais.map(ai => ({ pos: ai.pos, type: ai.type, aggro: ai.aggro })),
        bridges: engine.bridges.map(link => ({ ...link })),
        voids: new Set(engine.voidCells || []),
        patches: new Set(engine.activePatchCells || []),
        patchCharges: engine.patchCharges,
        beaconCharges: engine.beaconCharges,
        breakCharges: engine.breakCharges,
        beaconCell: null,
        beaconTTL: 0,
        beaconDuration: Math.max(1, Number(level.beaconDuration || 1)),
        usedRotation: false,
        usedBridge: false,
        usedPatch: false,
        usedBeacon: false,
        usedBreak: false,
        keyMovedByRotation: false,
        log: []
    };
    const maxStates = engine.N > 3 ? 90000 : 50000;
    const maxTurns = engine.N > 3 ? 9 : 11;
    const open = [{ state: start, score: heuristic(engine, start), cost: 0 }];
    const best = new Map([[stateKey(start), 0]]);
    let expanded = 0;
    while (open.length > 0 && expanded < maxStates) {
        open.sort((a, b) => a.score - b.score);
        const current = open.shift();
        expanded += 1;
        if (current.state.log.length >= maxTurns) continue;
        const actions = [
            ...generatePatchActions(current.state),
            ...generateBeaconActions(engine, current.state),
            ...generateBreakActions(engine, current.state),
            ...generateRotationActions(engine, current.state),
            ...generateMoveActions(engine, current.state)
        ];
        for (const action of actions) {
            const next = applyAction(engine, current.state, action);
            if (!next) continue;
            if (next.win) return { state: next, engine, expanded };
            const cost = current.cost + actionCost(action);
            const key = stateKey(next);
            if (best.has(key) && best.get(key) <= cost) continue;
            best.set(key, cost);
            open.push({ state: next, score: cost + heuristic(engine, next), cost });
        }
    }
    return { state: null, engine, expanded, failed: true };
}

function formatAction(engine, action) {
    if (action.type === 'rotate') return `${COLORS.magenta}${action.axis}${action.layer}${action.direction}${COLORS.reset}`;
    if (action.type === 'patch') return `${COLORS.yellow}patch ${describeCell(engine, action.cell)}${COLORS.reset}`;
    if (action.type === 'beacon') return `${COLORS.blue}beacon ${describeCell(engine, action.cell)}${COLORS.reset}`;
    if (action.type === 'break') return `${COLORS.red}break ${describeCell(engine, action.cell)}${COLORS.reset}`;
    if (!action.sequence.length) return `${COLORS.dim}wait${COLORS.reset}`;
    const prefix = action.usesBridge ? 'bridge move' : 'move';
    return `${prefix} ${action.sequence.map(cell => describeCell(engine, cell)).join('>')}`;
}

function formatActionPlain(engine, action) {
    if (action.type === 'rotate') return `${action.axis}${action.layer}${action.direction}`;
    if (action.type === 'patch') return `patch ${describeCell(engine, action.cell)}`;
    if (action.type === 'beacon') return `beacon ${describeCell(engine, action.cell)}`;
    if (action.type === 'break') return `break ${describeCell(engine, action.cell)}`;
    if (!action.sequence.length) return 'wait';
    const prefix = action.usesBridge ? 'bridge move' : 'move';
    return `${prefix} ${action.sequence.map(cell => describeCell(engine, cell)).join('>')}`;
}

function collectRouteCells(solution) {
    const cells = new Set();
    solution.log.forEach(action => {
        if (action.type === 'move') action.sequence.forEach(cell => cells.add(cell));
    });
    return cells;
}

function renderNet(engine, solution) {
    const route = collectRouteCells(solution);
    const ais = new Map(solution.ais.map(ai => [ai.pos, ai.type === 'guardian' ? 'G' : 'C']));
    const startCell = engine.playerPos;
    const keyCell = engine.keyPos;
    const exitCell = engine.exitPos;
    const layout = [
        [null, 0, null, null],
        [2, 4, 3, 5],
        [null, 1, null, null]
    ];
    const lines = [];
    for (const rowFaces of layout) {
        for (let r = 0; r < engine.N; r++) {
            const chunks = rowFaces.map(face => {
                if (face === null) return ' '.repeat(engine.N * 3 + 2);
                const cells = [];
                for (let c = 0; c < engine.N; c++) {
                    const cellId = engine.cells.find(cell => cell.face === face && cell.row === r && cell.col === c).id;
                    let mark = '.';
                    let color = COLORS.dim;
                    if (route.has(cellId)) {
                        mark = '*';
                        color = COLORS.cyan;
                    }
                    if (cellId === startCell) {
                        mark = 'P';
                        color = COLORS.green;
                    }
                    if (cellId === keyCell) {
                        mark = 'K';
                        color = COLORS.yellow;
                    }
                    if (cellId === exitCell) {
                        mark = 'E';
                        color = COLORS.green;
                    }
                    if (ais.has(cellId)) {
                        mark = ais.get(cellId);
                        color = COLORS.red;
                    }
                    cells.push(`${color}${mark}${COLORS.reset}`);
                }
                return `${engine.faceLabels[face]} ${cells.join(' ')}`;
            });
            lines.push(chunks.join('  '));
        }
        lines.push('');
    }
    return lines.join('\n');
}

const failures = [];
const summaries = [];
const targets = allLevels
    .map((level, index) => ({ level, index }))
    .filter(({ level }) => !targetPattern || targetPattern.test(textOf(level.title)));

targets.forEach(({ level, index }) => {
    const result = solve(level, index);
    if (!result.state) {
        const failure = {
            level: textOf(level.title),
            reason: 'playtest_bot could not find a solution',
            expanded: result.expanded
        };
        failures.push(failure);
        summaries.push({
            id: level.id,
            number: level.number,
            title: textOf(level.title),
            act: level.act,
            size: level.size || 3,
            solved: false,
            expanded: result.expanded,
            risks: ['unsolved-by-playtest-bot']
        });
        if (!options.json && !options.markdown && !options.summary) {
            console.log(`\n${COLORS.cyan}# ${textOf(level.title)}${COLORS.reset}`);
            console.log(`${COLORS.red}FAILED${COLORS.reset} expanded=${result.expanded}`);
        }
        return;
    }
    const actions = result.state.log.map(action => formatActionPlain(result.engine, action));
    const turns = result.state.log.length;
    const used = {
        rotation: result.state.usedRotation,
        bridge: result.state.usedBridge,
        patch: result.state.usedPatch,
        beacon: result.state.usedBeacon,
        break: result.state.usedBreak
    };
    const risks = [];
    if ((level.act || 1) >= 2 && turns <= 3) risks.push('too-short-for-act-2');
    if ((level.bridges || []).length > 0 && !used.bridge) risks.push('bridge-present-unused');
    if (level.patchCharges && !used.patch) risks.push('patch-present-unused');
    if (level.beaconCharges && !used.beacon) risks.push('beacon-present-unused');
    if (level.breakCharges && !used.break) risks.push('break-present-unused');
    if (level.validation?.mustUseRotation && !used.rotation) risks.push('rotation-required-but-unused');

    summaries.push({
        id: level.id,
        number: level.number,
        title: textOf(level.title),
        act: level.act,
        chapter: textOf(level.chapter),
        size: level.size || 3,
        solved: true,
        turns,
        expanded: result.expanded,
        used,
        risks,
        actions
    });

    if (!options.json && !options.markdown && !options.summary) {
        console.log(`\n${COLORS.cyan}# ${textOf(level.title)}${COLORS.reset}`);
        console.log(`${COLORS.green}SOLVED${COLORS.reset} turns=${turns} expanded=${result.expanded}`);
        result.state.log.forEach((action, actionIndex) => {
            console.log(`${String(actionIndex + 1).padStart(2, '0')}. ${formatAction(result.engine, action)}`);
        });
        console.log(renderNet(result.engine, result.state));
    }
});

if (failures.length > 0) {
    const failureLog = {
        createdAt: new Date().toISOString(),
        tool: 'tools/playtest_bot.js',
        failures
    };
    fs.writeFileSync(path.join(root, 'failure_log.json'), JSON.stringify(failureLog, null, 2));
    process.exit(1);
}

function renderSummaryTable(rows) {
    const header = ['Level', 'Act', 'Turns', 'Used', 'Risks'];
    const body = rows.map(row => [
        textOf(row.title),
        String(row.act || 1),
        row.solved ? String(row.turns) : 'FAIL',
        row.solved ? Object.entries(row.used).filter(([, value]) => value).map(([key]) => key).join('+') || 'route' : '-',
        row.risks.join(', ') || 'ok'
    ]);
    const widths = header.map((item, index) =>
        Math.max(item.length, ...body.map(row => String(row[index]).length))
    );
    return [header, ...body]
        .map(row => row.map((cell, index) => String(cell).padEnd(widths[index])).join('  '))
        .join('\n');
}

function renderMarkdown(rows) {
    const lines = [
        '# 黎明魔方 L01-L40 自动 Walkthrough',
        '',
        '> 由 `tools/playtest_bot.js --markdown` 生成。用于设计审查，不代表唯一解。',
        '',
        '| 关卡 | 幕 | 回合 | 使用机制 | 风险 |',
        '| :--- | :--- | ---: | :--- | :--- |'
    ];
    rows.forEach(row => {
        const used = row.solved
            ? Object.entries(row.used).filter(([, value]) => value).map(([key]) => key).join(' + ') || 'route'
            : '-';
        lines.push(`| ${textOf(row.title)} | ${row.act || 1} | ${row.solved ? row.turns : 'FAIL'} | ${used} | ${row.risks.join(', ') || 'ok'} |`);
    });
    lines.push('');
    rows.forEach(row => {
        lines.push(`## ${textOf(row.title)}`);
        lines.push('');
        lines.push(`- 幕/章节：Act ${row.act || 1} / ${row.chapter || '未标注'}`);
        lines.push(`- Bot 回合数：${row.solved ? row.turns : '未解出'}`);
        lines.push(`- 设计风险：${row.risks.join(', ') || '暂无'}`);
        lines.push('');
        if (row.solved) {
            row.actions.forEach((action, index) => {
                lines.push(`${index + 1}. \`${action}\``);
            });
        }
        lines.push('');
    });
    return `${lines.join('\n')}\n`;
}

if (options.json) {
    const payload = JSON.stringify({ generatedAt: new Date().toISOString(), levels: summaries }, null, 2);
    if (options.output) fs.writeFileSync(options.output, payload);
    else console.log(payload);
} else if (options.markdown) {
    const markdown = renderMarkdown(summaries);
    if (options.output) fs.writeFileSync(options.output, markdown);
    else console.log(markdown);
} else if (options.summary) {
    console.log(renderSummaryTable(summaries));
}
