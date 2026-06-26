#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const levelSource = fs.readFileSync(path.join(root, 'levels.js'), 'utf8');
const source = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
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
vm.runInContext(levelSource, context, { filename: 'levels.js' });
vm.runInContext(source, context, { filename: 'game.js' });

const GameEngine = context.window.GameEngine;
const levelBook = new GameEngine().levels;
const topologyCache = new Map();
const levelPattern = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;

function textOf(field) {
    if (field && typeof field === 'object') {
        return field.zh || field.en || '';
    }
    return field || '';
}

function createEngine(size = 3) {
    const engine = new GameEngine();
    engine.N = size;
    engine.resetRuntimeState();
    engine.buildTopology();
    engine.precomputeRotations();
    return engine;
}

function getTopology(source = 3) {
    const engine = typeof source === 'number' ? createEngine(source) : source;
    const bridgeKey = (engine.bridges || [])
        .map(link => `${Math.min(link.a, link.b)}-${Math.max(link.a, link.b)}`)
        .sort()
        .join(',');
    const voidKey = [...(engine.voidCells || [])].sort((a, b) => a - b).join(',');
    const patchKey = [...(engine.activePatchCells || [])].sort((a, b) => a - b).join(',');
    const cacheKey = `${engine.N}|${bridgeKey}|v:${voidKey}|p:${patchKey}`;
    if (topologyCache.has(cacheKey)) return topologyCache.get(cacheKey);

    const neighbors = engine.cells.map((_, id) =>
        typeof engine.getNeighbors === 'function'
            ? engine.getNeighbors(id, { actor: 'player' })
            : Object.values(engine.cells[id].neighbors).filter(cellId => cellId !== null && cellId !== undefined)
    );

    const moveSequences = engine.cells.map((_, id) => {
        const sequences = [[]];
        for (const first of neighbors[id]) {
            sequences.push([first]);
            for (const second of neighbors[first]) {
                sequences.push([first, second]);
            }
        }
        return sequences;
    });

    const nextStep = Array.from({ length: engine.cells.length }, () =>
        Array(engine.cells.length).fill(null)
    );

    for (let start = 0; start < engine.cells.length; start++) {
        const queue = [start];
        const seen = Array(engine.cells.length).fill(false);
        const prev = Array(engine.cells.length).fill(-1);
        seen[start] = true;

        for (let head = 0; head < queue.length; head++) {
            for (const next of neighbors[queue[head]]) {
                if (seen[next]) continue;
                seen[next] = true;
                prev[next] = queue[head];
                queue.push(next);
            }
        }

        for (let target = 0; target < engine.cells.length; target++) {
            if (target === start || !seen[target]) continue;
            let cursor = target;
            while (prev[cursor] !== start) cursor = prev[cursor];
            nextStep[start][target] = cursor;
        }
    }

    const topology = { engine, neighbors, moveSequences, nextStep };
    topologyCache.set(cacheKey, topology);
    return topology;
}

function createLevelEngine(level, levelIndex) {
    const engine = createEngine(level.size || 3);
    engine.currentLevel = level;
    engine.currentLevelIndex = levelIndex;
    engine.resetRuntimeState();
    engine.buildTopology();
    engine.precomputeRotations();
    engine.spawnEntities(level.ais || []);
    return engine;
}

function describeCell(engine, cellId) {
    const cell = engine.cells[cellId];
    return `${engine.faceLabels[cell.face]}${cell.row + 1}-${cell.col + 1}`;
}

function serializeSetLike(values) {
    return [...(values || [])].sort((a, b) => a - b).join(',');
}

function serializeLinks(links = []) {
    return links
        .map(link => `${Math.min(link.a, link.b)}-${Math.max(link.a, link.b)}`)
        .sort()
        .join(',');
}

function cloneState(state, action = null) {
    return {
        player: state.player,
        key: state.key,
        hasKey: state.hasKey,
        exit: state.exit,
        rotationEnabled: state.rotationEnabled,
        ais: state.ais.map(ai => ({ ...ai })),
        bridges: state.bridges.map(link => ({ ...link })),
        voids: new Set(state.voids),
        activePatches: new Set(state.activePatches),
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
        keyPickupAction: state.keyPickupAction,
        log: action ? [...state.log, action] : [...state.log]
    };
}

function getBridgeDestinationState(state, cellId) {
    const bridge = state.bridges.find(link => link.a === cellId || link.b === cellId);
    if (!bridge) return null;
    return bridge.a === cellId ? bridge.b : bridge.a;
}

function isBridgeStepState(state, fromId, toId) {
    return getBridgeDestinationState(state, fromId) === toId;
}

function isWalkableForPlayerState(engine, state, cellId) {
    if (cellId === null || cellId === undefined || !engine.cells[cellId]) return false;
    return !state.voids.has(cellId) || state.activePatches.has(cellId);
}

function isWalkableForAIState(engine, state, cellId) {
    if (cellId === null || cellId === undefined || !engine.cells[cellId]) return false;
    if (state.voids.has(cellId)) return false;
    if (state.activePatches.has(cellId)) return false;
    return true;
}

function getNeighborsForState(engine, state, cellId, actor = 'player') {
    if (cellId === null || cellId === undefined || !engine.cells[cellId]) return [];
    const canEnter = actor === 'ai'
        ? next => isWalkableForAIState(engine, state, next)
        : next => isWalkableForPlayerState(engine, state, next);
    const baseNeighbors = Object.values(engine.cells[cellId].neighbors)
        .filter(next => next !== null && next !== undefined && canEnter(next));
    const bridgeTarget = getBridgeDestinationState(state, cellId);
    if (bridgeTarget === null || bridgeTarget === undefined || !canEnter(bridgeTarget)) {
        return baseNeighbors;
    }
    return [...new Set([...baseNeighbors, bridgeTarget])];
}

function findPathForState(engine, state, startId, targetId, actor = 'player') {
    if (startId === targetId) return [startId];
    const canStand = actor === 'ai' ? isWalkableForAIState : isWalkableForPlayerState;
    if (!canStand(engine, state, startId) || !canStand(engine, state, targetId)) return null;

    const queue = [[startId]];
    const seen = new Set([startId]);
    for (let head = 0; head < queue.length; head++) {
        const path = queue[head];
        const current = path[path.length - 1];
        for (const next of getNeighborsForState(engine, state, current, actor)) {
            if (seen.has(next)) continue;
            const nextPath = [...path, next];
            if (next === targetId) return nextPath;
            seen.add(next);
            queue.push(nextPath);
        }
    }
    return null;
}

function getNextStepForState(engine, state, startId, targetId, actor = 'ai') {
    const path = findPathForState(engine, state, startId, targetId, actor);
    return path && path.length > 1 ? path[1] : null;
}

function getAITarget(engine, state, ai) {
    if (state.beaconCell !== null &&
        state.beaconCell !== undefined &&
        state.beaconTTL > 0 &&
        isWalkableForAIState(engine, state, state.beaconCell)) {
        return state.beaconCell;
    }

    if (ai.type === 'guardian') {
        if (state.hasKey) {
            return ai.aggro === 'guardDoor'
                ? state.exit
                : state.player;
        }
        if (state.keyMovedByRotation) {
            return state.key;
        }
        if (state.key < 0) return ai.pos;
        if (engine.cells[state.player].face === engine.cells[state.key].face) {
            return state.player;
        }
        return state.key;
    }

    return state.player;
}

function getAIStepBudget(state, ai) {
    if (ai.type === 'guardian') {
        return state.hasKey ? 2 : 1;
    }
    return 2;
}

function isForbiddenForAI(engine, state, cellId) {
    if (!isWalkableForAIState(engine, state, cellId)) return true;
    if (!state.hasKey && state.key >= 0 && cellId === state.key) return true;
    if (state.exit >= 0 && cellId === state.exit) return true;
    return false;
}

function sequenceUsesBridge(state, origin, sequence) {
    let previous = origin;
    for (const destination of sequence) {
        if (isBridgeStepState(state, previous, destination)) {
            return true;
        }
        previous = destination;
    }
    return false;
}

function stateKey(state) {
    return [
        state.player,
        state.key,
        state.hasKey ? 1 : 0,
        state.exit,
        state.ais.map(ai => `${ai.pos}:${ai.type}:${ai.aggro}:${ai.guardPost}`).join(','),
        serializeLinks(state.bridges),
        serializeSetLike(state.voids),
        serializeSetLike(state.activePatches),
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

function isFaceCenter(engine, cellId) {
    if (cellId === null || cellId === undefined || cellId < 0) return false;
    const cell = engine.cells[cellId];
    const middle = Math.floor(engine.N / 2);
    return cell.row === middle && cell.col === middle;
}

function findSameFaceLureCell(engine) {
    if (engine.keyPos === null) return null;
    const keyCell = engine.cells[engine.keyPos];
    return engine.cells.find(cell =>
        cell.face === keyCell.face &&
        cell.id !== engine.keyPos &&
        engine.isWalkableForPlayer(cell.id) &&
        !engine.ais.some(ai => ai.pos === cell.id) &&
        cell.id !== engine.exitPos
    )?.id ?? null;
}

function guardianLureWorks(engine) {
    const guardian = engine.ais.find(ai => ai.type === 'guardian');
    const lureCell = findSameFaceLureCell(engine);
    if (!guardian || lureCell === null || engine.keyPos === null) return false;

    const state = {
        player: lureCell,
        key: engine.keyPos,
        hasKey: false,
        exit: engine.exitPos,
        bridges: engine.bridges.map(link => ({ ...link })),
        voids: new Set(engine.voidCells || []),
        activePatches: new Set(),
        beaconCell: null,
        beaconTTL: 0
    };

    return getAITarget(engine, state, guardian) === lureCell;
}

function isReservedBeaconCell(state, cellId) {
    if (cellId === state.player) return true;
    if (!state.hasKey && state.key >= 0 && cellId === state.key) return true;
    if (state.exit >= 0 && cellId === state.exit) return true;
    if (state.ais.some(ai => ai.pos === cellId)) return true;
    if (state.bridges.some(link => link.a === cellId || link.b === cellId)) return true;
    if (state.activePatches.has(cellId)) return true;
    return false;
}

function isLegalBeaconTarget(engine, state, cellId) {
    return state.beaconCharges > 0 &&
        isWalkableForPlayerState(engine, state, cellId) &&
        !isReservedBeaconCell(state, cellId);
}

function generatePatchActions(state, options) {
    if (options.noPatch || state.patchCharges <= 0) return [];
    return [...state.voids]
        .filter(cellId => !state.activePatches.has(cellId))
        .map(cellId => ({ type: 'patch', cell: cellId }));
}

function generateBeaconActions(engine, state, options) {
    if (options.noBeacon || state.beaconCharges <= 0) return [];
    if (state.log.length > 3) return [];
    const candidates = new Set();
    const addCandidate = cellId => {
        if (isLegalBeaconTarget(engine, state, cellId)) candidates.add(cellId);
    };

    state.ais.forEach(ai => {
        getNeighborsForState(engine, state, ai.pos, 'player').forEach(addCandidate);
        const target = getAITarget(engine, state, ai);
        const pathToTarget = findPathForState(engine, state, ai.pos, target, 'ai') || [];
        pathToTarget.slice(1, 5).forEach(addCandidate);
    });

    [state.player, state.key, state.exit]
        .filter(cellId => cellId !== null && cellId !== undefined && cellId >= 0)
        .forEach(cellId => {
            getNeighborsForState(engine, state, cellId, 'player').forEach(addCandidate);
        });

    return [...candidates].slice(0, 12).map(cellId => ({ type: 'beacon', cell: cellId }));
}

function isReservedBreakCell(state, cellId) {
    if (cellId === state.player) return true;
    if (!state.hasKey && state.key >= 0 && cellId === state.key) return true;
    if (state.exit >= 0 && cellId === state.exit) return true;
    if (state.ais.some(ai => ai.pos === cellId)) return true;
    if (state.bridges.some(link => link.a === cellId || link.b === cellId)) return true;
    return false;
}

function isLegalBreakTarget(engine, state, cellId) {
    return state.breakCharges > 0 &&
        cellId !== null &&
        cellId !== undefined &&
        Boolean(engine.cells[cellId]) &&
        !isReservedBreakCell(state, cellId) &&
        (!state.voids.has(cellId) || state.activePatches.has(cellId));
}

function generateBreakActions(engine, state, options) {
    if (options.noBreak || state.breakCharges <= 0) return [];
    const candidates = new Set();
    const addCandidate = cellId => {
        if (isLegalBreakTarget(engine, state, cellId)) candidates.add(cellId);
    };

    state.ais.forEach(ai => {
        const target = getAITarget(engine, state, ai);
        const pathToTarget = findPathForState(engine, state, ai.pos, target, 'ai') || [];
        pathToTarget.slice(1, 6).forEach(addCandidate);
        getNeighborsForState(engine, state, ai.pos, 'ai').forEach(addCandidate);
    });

    [state.player, state.key, state.exit]
        .filter(cellId => cellId !== null && cellId !== undefined && cellId >= 0)
        .forEach(cellId => {
            getNeighborsForState(engine, state, cellId, 'player').forEach(addCandidate);
        });

    return [...candidates].slice(0, 16).map(cellId => ({ type: 'break', cell: cellId }));
}

function generateMoveActions(engine, state, options) {
    const actions = [{ type: 'move', sequence: [], usesBridge: false }];
    const maxSteps = 2;

    const walk = (current, stepsLeft, activePatches, sequence, usesBridge) => {
        if (stepsLeft <= 0) return;
        const localState = { ...state, activePatches };
        for (const destination of getNeighborsForState(engine, localState, current, 'player')) {
            if (destination === state.player || sequence.includes(destination)) continue;
            const nextActivePatches = new Set(activePatches);
            if (nextActivePatches.has(current)) {
                nextActivePatches.delete(current);
            }
            const nextSequence = [...sequence, destination];
            const nextUsesBridge = usesBridge || isBridgeStepState(state, current, destination);
            if (!nextActivePatches.has(destination)) {
                actions.push({
                    type: 'move',
                    sequence: nextSequence,
                    usesBridge: nextUsesBridge
                });
            }
            walk(destination, stepsLeft - 1, nextActivePatches, nextSequence, nextUsesBridge);
        }
    };

    walk(state.player, maxSteps, new Set(state.activePatches), [], false);

    return actions.filter(action => !(options.forbidPlayerBridge && action.usesBridge));
}

function advanceAI(engine, state) {
    let dead = false;

    for (const ai of state.ais) {
        const stepBudget = getAIStepBudget(state, ai);
        for (let step = 0; step < stepBudget; step++) {
            const target = getAITarget(engine, state, ai);
            const next = getNextStepForState(engine, state, ai.pos, target, 'ai');
            if (next !== null && !isForbiddenForAI(engine, state, next)) {
                ai.pos = next;
            }
            if (state.beaconCell !== null && ai.pos === state.beaconCell) {
                state.beaconCell = null;
                state.beaconTTL = 0;
            }
            if (ai.pos === state.player) {
                dead = true;
                break;
            }
        }
        if (dead) break;
    }

    if (!dead && state.beaconCell !== null && state.beaconTTL > 0) {
        state.beaconTTL -= 1;
        if (state.beaconTTL <= 0) {
            state.beaconCell = null;
        }
    }

    state.keyMovedByRotation = false;
    return dead;
}

function satisfiesRequirements(state, options) {
    if (options.requireBridge && !state.usedBridge) return false;
    if (options.requirePatch && !state.usedPatch) return false;
    if (options.requireBeacon && !state.usedBeacon) return false;
    if (options.requireBreak && !state.usedBreak) return false;
    return true;
}

function solveLevel(level, levelIndex, options = {}) {
    const engine = createLevelEngine(level, levelIndex);
    if (options.disableBridges) {
        engine.bridges = [];
    }
    const start = {
        player: engine.playerPos,
        key: engine.keyPos ?? -1,
        hasKey: engine.hasKey,
        exit: engine.exitPos,
        rotationEnabled: engine.rotationEnabled,
        bridges: engine.bridges.map(link => ({ ...link })),
        voids: new Set(engine.voidCells || []),
        activePatches: new Set(engine.activePatchCells || []),
        patchCharges: options.noPatch ? 0 : engine.patchCharges,
        beaconCharges: options.noBeacon ? 0 : engine.beaconCharges,
        breakCharges: options.noBreak ? 0 : engine.breakCharges,
        beaconCell: null,
        beaconTTL: 0,
        beaconDuration: Math.max(1, Number(level.beaconDuration || 1)),
        ais: engine.ais.map(ai => ({
            pos: ai.pos,
            type: ai.type,
            aggro: ai.aggro,
            guardPost: ai.guardPost
        })),
        usedRotation: false,
        usedBridge: false,
        usedPatch: false,
        usedBeacon: false,
        usedBreak: false,
        keyMovedByRotation: false,
        keyPickupAction: engine.hasKey ? 0 : -1,
        log: []
    };

    const maxTurns = options.maxTurns ?? (engine.N > 3 ? 8 : 10);
    const maxStates = options.maxStates ?? (engine.N > 3 ? 60000 : 40000);
    const queue = [start];
    const seen = new Set([stateKey(start)]);

    for (let head = 0; head < queue.length; head++) {
        if (head > maxStates) return null;
        const state = queue[head];
        if (state.log.length >= maxTurns) continue;

        const patchActions = generatePatchActions(state, options);
        const beaconActions = generateBeaconActions(engine, state, options);
        const breakActions = generateBreakActions(engine, state, options);
        const missingRequiredPatch = options.requirePatch && !state.usedPatch;
        const missingRequiredBeacon = options.requireBeacon && !state.usedBeacon;
        const missingRequiredBreak = options.requireBreak && !state.usedBreak;
        const toolActions = [
            ...patchActions,
            ...beaconActions,
            ...breakActions
        ];
        const moveActions = generateMoveActions(engine, state, options);
        const rotationActions = [];

        if (!options.noRotation && state.rotationEnabled) {
            for (const axis of ['X', 'Y', 'Z']) {
                for (let layer = 0; layer < engine.N; layer++) {
                    for (const direction of ['CW', 'CCW']) {
                        rotationActions.push({ type: 'rotate', axis, layer, direction });
                    }
                }
            }
        }

        const actions = (missingRequiredPatch || missingRequiredBeacon || missingRequiredBreak)
            ? [
                ...(missingRequiredPatch ? patchActions : []),
                ...(missingRequiredBeacon ? beaconActions : []),
                ...(missingRequiredBreak ? breakActions : [])
            ]
            : [...toolActions, ...rotationActions, ...moveActions];

        for (const action of actions) {
            const nextState = cloneState(state, action);

            let dead = false;
            let win = false;

            if (action.type === 'patch') {
                if (nextState.patchCharges <= 0 || !nextState.voids.has(action.cell) || nextState.activePatches.has(action.cell)) {
                    continue;
                }
                nextState.patchCharges -= 1;
                nextState.activePatches.add(action.cell);
                nextState.usedPatch = true;
            } else if (action.type === 'beacon') {
                if (!isLegalBeaconTarget(engine, nextState, action.cell)) continue;
                nextState.beaconCharges -= 1;
                nextState.beaconCell = action.cell;
                nextState.beaconTTL = nextState.beaconDuration;
                nextState.usedBeacon = true;
            } else if (action.type === 'break') {
                if (!isLegalBreakTarget(engine, nextState, action.cell)) continue;
                nextState.breakCharges -= 1;
                nextState.activePatches.delete(action.cell);
                nextState.voids.add(action.cell);
                nextState.usedBreak = true;
            } else if (action.type === 'move') {
                nextState.usedBridge = nextState.usedBridge || action.usesBridge;
                for (const destination of action.sequence) {
                    const previous = nextState.player;
                    nextState.player = destination;
                    if (nextState.activePatches.has(previous)) {
                        nextState.activePatches.delete(previous);
                    }
                    if (!nextState.hasKey && nextState.key >= 0 && nextState.player === nextState.key) {
                        nextState.hasKey = true;
                        nextState.key = -1;
                        nextState.keyPickupAction = nextState.log.length - 1;
                    }
                    if (nextState.ais.some(ai => ai.pos === nextState.player)) {
                        dead = true;
                        break;
                    }
                    if (nextState.hasKey && nextState.player === nextState.exit) {
                        win = true;
                        break;
                    }
                }
            } else {
                const perm = engine.rotationPermutations[action.axis][action.layer][action.direction];
                nextState.player = perm[nextState.player];
                nextState.ais.forEach(ai => {
                    ai.pos = perm[ai.pos];
                    if (ai.guardPost !== null && ai.guardPost !== undefined) {
                        ai.guardPost = perm[ai.guardPost];
                    }
                });
                nextState.bridges = nextState.bridges.map(link => ({
                    a: perm[link.a],
                    b: perm[link.b]
                }));
                nextState.voids = new Set([...nextState.voids].map(cellId => perm[cellId]));
                nextState.activePatches = new Set([...nextState.activePatches].map(cellId => perm[cellId]));
                if (nextState.beaconCell !== null && nextState.beaconCell !== undefined) {
                    nextState.beaconCell = perm[nextState.beaconCell];
                }
                if (!nextState.hasKey && nextState.key >= 0) {
                    const keyBeforeRotation = nextState.key;
                    nextState.key = perm[nextState.key];
                    nextState.keyMovedByRotation = keyBeforeRotation !== nextState.key;
                }
                nextState.exit = perm[nextState.exit];
                nextState.usedRotation = true;

                if (!nextState.hasKey && nextState.key >= 0 && nextState.player === nextState.key) {
                    nextState.hasKey = true;
                    nextState.key = -1;
                    nextState.keyPickupAction = nextState.log.length - 1;
                }
                if (nextState.ais.some(ai => ai.pos === nextState.player)) dead = true;
                if (nextState.hasKey && nextState.player === nextState.exit) win = true;
            }

            if (dead) continue;
            if (win) {
                if (satisfiesRequirements(nextState, options)) {
                    return { ...nextState, engine };
                }
                continue;
            }

            if (action.type === 'patch' || action.type === 'beacon' || action.type === 'break') {
                const key = stateKey(nextState);
                if (!seen.has(key)) {
                    seen.add(key);
                    queue.push(nextState);
                }
                continue;
            }

            dead = advanceAI(engine, nextState);
            if (dead) continue;
            const key = stateKey(nextState);
            if (!seen.has(key)) {
                seen.add(key);
                queue.push(nextState);
            }
        }
    }

    return null;
}

function formatAction(engine, action) {
    if (action.type === 'rotate') {
        return `${action.axis}${action.layer}${action.direction}`;
    }
    if (action.type === 'patch') {
        return `patch ${describeCell(engine, action.cell)}`;
    }
    if (action.type === 'beacon') {
        return `beacon ${describeCell(engine, action.cell)}`;
    }
    if (action.type === 'break') {
        return `break ${describeCell(engine, action.cell)}`;
    }
    const prefix = action.usesBridge ? 'bridge move' : 'move';
    return action.sequence.length === 0
        ? 'wait'
        : `${prefix} ${action.sequence.map(cellId => describeCell(engine, cellId)).join('>')}`;
}

function trackerFollowsPermutation(level, index) {
    if (!level.trackingEnabled) return null;
    const engine = createLevelEngine(level, index);
    const source = engine.keyPos ?? engine.exitPos ?? engine.playerPos;
    engine.trackerCell = source;
    const perm = engine.rotationPermutations.X[0].CW;
    const expected = perm[source];
    engine.applyPermutation(perm);
    return engine.trackerCell === expected;
}

function bridgeLinksWork(level, index) {
    if (!level.bridges || level.bridges.length === 0) return null;
    const engine = createLevelEngine(level, index);
    return engine.bridges.every(link =>
        engine.isAdjacent(link.a, link.b) &&
        engine.getBridgeDestination(link.a) === link.b &&
        engine.getBridgeDestination(link.b) === link.a
    );
}

function bridgeStepFromLinks(links, from, to) {
    return links.some(link =>
        (link.a === from && link.b === to) ||
        (link.b === from && link.a === to)
    );
}

function enemyUsesBridgeDuringSolution(level, index, solution) {
    if (!solution || !level.bridges || level.bridges.length === 0) return null;
    const engine = createLevelEngine(level, index);
    let bridges = engine.bridges.map(link => ({ ...link }));
    const state = {
        player: engine.playerPos,
        key: engine.keyPos ?? -1,
        hasKey: engine.hasKey,
        exit: engine.exitPos,
        bridges,
        voids: new Set(engine.voidCells || []),
        activePatches: new Set(),
        beaconCell: null,
        beaconTTL: 0,
        ais: engine.ais.map(ai => ({
            pos: ai.pos,
            type: ai.type,
            aggro: ai.aggro,
            guardPost: ai.guardPost
        }))
    };

    for (const action of solution.log) {
        if (action.type === 'patch' || action.type === 'beacon') {
            continue;
        }
        if (action.type === 'move') {
            for (const destination of action.sequence) {
                state.player = destination;
                if (!state.hasKey && state.key >= 0 && state.player === state.key) {
                    state.hasKey = true;
                    state.key = -1;
                }
            }
        } else {
            const perm = engine.rotationPermutations[action.axis][action.layer][action.direction];
            state.player = perm[state.player];
            state.ais.forEach(ai => {
                ai.pos = perm[ai.pos];
                if (ai.guardPost !== null && ai.guardPost !== undefined) {
                    ai.guardPost = perm[ai.guardPost];
                }
            });
            if (!state.hasKey && state.key >= 0) state.key = perm[state.key];
            state.exit = perm[state.exit];
            bridges = bridges.map(link => ({
                a: perm[link.a],
                b: perm[link.b]
            }));
            state.bridges = bridges.map(link => ({ ...link }));
            engine.bridges = bridges.map(link => ({ ...link }));
        }

        for (const ai of state.ais) {
            const stepBudget = getAIStepBudget(state, ai);
            for (let step = 0; step < stepBudget; step++) {
                const target = getAITarget(engine, state, ai);
                const next = getNextStepForState(engine, state, ai.pos, target, 'ai');
                if (next !== null && !isForbiddenForAI(engine, state, next)) {
                    if (bridgeStepFromLinks(bridges, ai.pos, next)) {
                        return true;
                    }
                    ai.pos = next;
                }
            }
        }
    }

    return false;
}

const report = [];
const failures = [];

levelBook.forEach((level, index) => {
    if (levelPattern && !levelPattern.test(textOf(level.title))) return;
    const engine = createLevelEngine(level, index);
    const validation = level.validation || {};
    const solution = solveLevel(level, index);
    const noRotationSolution = validation.mustUseRotation
        ? solveLevel(level, index, { noRotation: true })
        : null;
    const noPlayerBridgeSolution = engine.bridges.length > 0 && validation.bridgeTool
        ? solveLevel(level, index, { forbidPlayerBridge: true })
        : null;
    const bridgeSolution = engine.bridges.length > 0 && validation.bridgeTool
        ? solveLevel(level, index, { requireBridge: true })
        : null;
    const noPatchSolution = level.patchCharges && validation.patchTool
        ? solveLevel(level, index, { noPatch: true })
        : null;
    const patchSolution = level.patchCharges && validation.patchTool
        ? solveLevel(level, index, { requirePatch: true })
        : null;
    const noBeaconSolution = level.beaconCharges && validation.beaconTool
        ? solveLevel(level, index, { noBeacon: true })
        : null;
    const beaconSolution = level.beaconCharges && validation.beaconTool
        ? solveLevel(level, index, { requireBeacon: true })
        : null;
    const noBreakSolution = level.breakCharges && validation.breakTool
        ? solveLevel(level, index, { noBreak: true })
        : null;
    const breakSolution = level.breakCharges && validation.breakTool
        ? solveLevel(level, index, { requireBreak: true })
        : null;
    const patchBeaconSolution = level.patchCharges && level.beaconCharges && validation.patchTool && validation.beaconTool
        ? solveLevel(level, index, { requirePatch: true, requireBeacon: true })
        : null;
    const enemyOnKey = engine.keyPos !== null &&
        engine.ais.some(ai => ai.pos === engine.keyPos);
    const enemyOnExit = engine.exitPos !== null &&
        engine.ais.some(ai => ai.pos === engine.exitPos);
    const keyAtFaceCenter = isFaceCenter(engine, engine.keyPos);
    const guardian = engine.ais.find(ai => ai.type === 'guardian');
    const preKeyGuardianBudget = guardian
        ? getAIStepBudget({
            player: engine.playerPos,
            key: engine.keyPos ?? -1,
            hasKey: false,
            exit: engine.exitPos
        }, guardian)
        : null;
    const postKeyGuardianBudget = guardian
        ? getAIStepBudget({
            player: engine.playerPos,
            key: -1,
            hasKey: true,
            exit: engine.exitPos
        }, guardian)
        : null;
    const guardianCanLure = guardian ? guardianLureWorks(engine) : null;
    const trackerFollowsRotation = trackerFollowsPermutation(level, index);
    const bridgeLinksValid = bridgeLinksWork(level, index);
    const usesBridge = Boolean(solution && solution.log.some(action => action.usesBridge));
    const usesPatch = Boolean(solution && solution.usedPatch);
    const usesBeacon = Boolean(solution && solution.usedBeacon);
    const usesBreak = Boolean(solution && solution.usedBreak);
    const bridgeTurnGain = bridgeSolution && noPlayerBridgeSolution
        ? noPlayerBridgeSolution.log.length - bridgeSolution.log.length
        : null;
    const patchTurnGain = patchSolution && noPatchSolution
        ? noPatchSolution.log.length - patchSolution.log.length
        : null;
    const beaconTurnGain = beaconSolution && noBeaconSolution
        ? noBeaconSolution.log.length - beaconSolution.log.length
        : null;
    const enemyUsesBridge = validation.enemyUsesBridge
        ? enemyUsesBridgeDuringSolution(level, index, solution)
        : null;

    const row = {
        level: textOf(level.title),
        size: engine.N,
        trackingEnabled: Boolean(level.trackingEnabled),
        bridgeCount: engine.bridges.length,
        solvable: Boolean(solution),
        usesRotation: Boolean(solution && solution.usedRotation),
        usesBridge,
        usesPatch,
        usesBeacon,
        usesBreak,
        bridgeSolutionExists: Boolean(bridgeSolution),
        patchSolutionExists: Boolean(patchSolution),
        beaconSolutionExists: Boolean(beaconSolution),
        breakSolutionExists: Boolean(breakSolution),
        patchBeaconSolutionExists: Boolean(patchBeaconSolution),
        noPlayerBridgeSolvable: Boolean(noPlayerBridgeSolution),
        noPlayerBridgeTurns: noPlayerBridgeSolution ? noPlayerBridgeSolution.log.length : null,
        noPatchSolvable: Boolean(noPatchSolution),
        noPatchTurns: noPatchSolution ? noPatchSolution.log.length : null,
        noPatchSolution: noPatchSolution ? noPatchSolution.log.map(action => formatAction(engine, action)) : null,
        noBeaconSolvable: Boolean(noBeaconSolution),
        noBeaconTurns: noBeaconSolution ? noBeaconSolution.log.length : null,
        noBeaconSolution: noBeaconSolution ? noBeaconSolution.log.map(action => formatAction(engine, action)) : null,
        noBreakSolvable: Boolean(noBreakSolution),
        noBreakTurns: noBreakSolution ? noBreakSolution.log.length : null,
        noBreakSolution: noBreakSolution ? noBreakSolution.log.map(action => formatAction(engine, action)) : null,
        bridgeTurnGain,
        patchTurnGain,
        beaconTurnGain,
        enemyUsesBridge,
        noRotationSolvable: Boolean(noRotationSolution),
        noRotationSolution: noRotationSolution ? noRotationSolution.log.map(action => formatAction(engine, action)) : null,
        mustUseRotation: Boolean(level.validation && level.validation.mustUseRotation),
        openingWait: Boolean(solution && solution.log[0] && solution.log[0].type === 'move' &&
            solution.log[0].sequence.length === 0),
        keyPickupAction: solution ? solution.keyPickupAction : null,
        guardianCanLure,
        preKeyGuardianBudget,
        postKeyGuardianBudget,
        enemyOnKey,
        enemyOnExit,
        keyAtFaceCenter,
        trackerFollowsRotation,
        bridgeLinksValid,
        solution: solution ? solution.log.map(action => formatAction(engine, action)) : null,
        bridgeSolution: bridgeSolution ? bridgeSolution.log.map(action => formatAction(engine, action)) : null,
        patchSolution: patchSolution ? patchSolution.log.map(action => formatAction(engine, action)) : null,
        beaconSolution: beaconSolution ? beaconSolution.log.map(action => formatAction(engine, action)) : null,
        breakSolution: breakSolution ? breakSolution.log.map(action => formatAction(engine, action)) : null,
        patchBeaconSolution: patchBeaconSolution ? patchBeaconSolution.log.map(action => formatAction(engine, action)) : null
    };

    report.push(row);

    if (level.validation && level.validation.solvable && !solution) {
        failures.push(`${textOf(level.title)}: marked solvable but no solution found`);
    }
    if (row.mustUseRotation && row.noRotationSolvable) {
        const rotationTurns = solution ? solution.log.length : Infinity;
        const bypassTurns = noRotationSolution ? noRotationSolution.log.length : Infinity;
        if (bypassTurns <= rotationTurns + 1) {
            failures.push(`${textOf(level.title)}: marked mustUseRotation but a competitive no-rotation solution exists`);
        }
    }
    if (enemyOnKey) {
        failures.push(`${textOf(level.title)}: enemy starts on the key cell`);
    }
    if (enemyOnExit) {
        failures.push(`${textOf(level.title)}: enemy starts on the exit cell`);
    }
    if (engine.N === 3 && level.validation && level.validation.guardianRage && keyAtFaceCenter) {
        failures.push(`${textOf(level.title)}: 3x3 rage-key level should not place the key on a face center`);
    }
    if (level.validation && level.validation.noOpeningWait && row.openingWait) {
        failures.push(`${textOf(level.title)}: marked noOpeningWait but best solution starts with wait`);
    }
    if (level.validation && Number.isFinite(level.validation.maxKeyPickupAction) &&
        (row.keyPickupAction === null || row.keyPickupAction > level.validation.maxKeyPickupAction)) {
        failures.push(`${textOf(level.title)}: key pickup happens too late for this teaching beat`);
    }
    if (level.validation && level.validation.guardianLure && !guardianCanLure) {
        failures.push(`${textOf(level.title)}: guardian should be lureable on the key face`);
    }
    if (level.validation && Number.isFinite(level.validation.guardianPreKeyStepBudget) &&
        preKeyGuardianBudget !== level.validation.guardianPreKeyStepBudget) {
        failures.push(`${textOf(level.title)}: guardian pre-key step budget mismatch`);
    }
    if (level.validation && Number.isFinite(level.validation.guardianPostKeyStepBudget) &&
        postKeyGuardianBudget !== level.validation.guardianPostKeyStepBudget) {
        failures.push(`${textOf(level.title)}: guardian post-key step budget mismatch`);
    }
    if (level.validation && level.validation.secondActPrototype && engine.N !== 4) {
        failures.push(`${textOf(level.title)}: second act prototype should run on 4x4`);
    }
    if (level.validation && level.validation.trackingTool && !level.trackingEnabled) {
        failures.push(`${textOf(level.title)}: tracking tool validation requires trackingEnabled`);
    }
    if (level.validation && level.validation.trackingTool && engine.N < 4) {
        failures.push(`${textOf(level.title)}: tracking tool prototype should start on 4x4 or larger`);
    }
    if (level.validation && level.validation.trackingTool && trackerFollowsRotation !== true) {
        failures.push(`${textOf(level.title)}: tracker should follow layer permutations`);
    }
    if (level.validation && level.validation.bridgeTool && !level.bridges?.length) {
        failures.push(`${textOf(level.title)}: bridge tool validation requires at least one bridge`);
    }
    if (level.validation && level.validation.bridgeTool && bridgeLinksValid !== true) {
        failures.push(`${textOf(level.title)}: bridge endpoints should be mutually adjacent`);
    }
    if (level.validation && level.validation.bridgeTool && !bridgeSolution) {
        failures.push(`${textOf(level.title)}: no solution found that uses a bridge`);
    }
    if (level.validation && level.validation.patchTool && !patchSolution) {
        failures.push(`${textOf(level.title)}: no solution found that uses a patch`);
    }
    if (level.validation && level.validation.beaconTool && !beaconSolution) {
        failures.push(`${textOf(level.title)}: no solution found that uses a beacon`);
    }
    if (level.validation && level.validation.breakTool && !breakSolution) {
        failures.push(`${textOf(level.title)}: no solution found that uses break`);
    }
    if (level.validation && level.validation.patchTool && level.validation.beaconTool && !patchBeaconSolution) {
        failures.push(`${textOf(level.title)}: no solution found that combines patch and beacon`);
    }
    if (level.validation && Number.isFinite(level.validation.minBridgeTurnGain) &&
        noPlayerBridgeSolution && bridgeTurnGain < level.validation.minBridgeTurnGain) {
        failures.push(`${textOf(level.title)}: bridge should save at least ${level.validation.minBridgeTurnGain} turns`);
    }
    if (level.validation && Number.isFinite(level.validation.minBridgeTurnGain) &&
        !noPlayerBridgeSolution && !solution) {
        failures.push(`${textOf(level.title)}: cannot evaluate bridge turn gain without a solution`);
    }
    if (level.validation && Number.isFinite(level.validation.minPatchTurnGain) &&
        noPatchSolution && patchTurnGain < level.validation.minPatchTurnGain) {
        failures.push(`${textOf(level.title)}: patch should save at least ${level.validation.minPatchTurnGain} turns`);
    }
    if (level.validation && Number.isFinite(level.validation.minPatchTurnGain) &&
        !noPatchSolution && !patchSolution) {
        failures.push(`${textOf(level.title)}: cannot evaluate patch turn gain without a patch solution`);
    }
    if (level.validation && Number.isFinite(level.validation.minBeaconTurnGain) &&
        noBeaconSolution && beaconTurnGain < level.validation.minBeaconTurnGain) {
        failures.push(`${textOf(level.title)}: beacon should save at least ${level.validation.minBeaconTurnGain} turns`);
    }
    if (level.validation && Number.isFinite(level.validation.minBeaconTurnGain) &&
        !noBeaconSolution && !beaconSolution) {
        failures.push(`${textOf(level.title)}: cannot evaluate beacon turn gain without a beacon solution`);
    }
    if (level.validation && level.validation.enemyUsesBridge && enemyUsesBridge !== true) {
        failures.push(`${textOf(level.title)}: enemy should use the bridge in the best found solution`);
    }
});

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
    console.error('\nValidation failures:');
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}
