/**
 * 黎明魔方：立方体逃亡残局
 * 核心游戏逻辑、拓扑图计算、全局展开图与手动画路交互
 */

class GameEngine {
    constructor() {
        this.N = 3;
        this.cells = [];
        this.playerPos = 0;
        this.playerLastPos = 0;
        this.playerAP = 2;
        this.maxAP = 2;
        this.rotationEnabled = false;
        this.rotationsUsed = 0;
        this.turn = 1;
        this.ais = [];
        this.keyPos = null;
        this.hasKey = false;
        this.exitPos = null;
        this.gameState = 'setup'; // 'setup', 'playing', 'win', 'gameover'
        this.plannedPath = [];
        this.historyStack = [];
        this.eventLog = [];
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.lastFailure = null;
        this.minimapGrid = null;
        this.minimapMetrics = null;
        this.lastInputCell = null;
        this.trackingEnabled = false;
        this.trackerCell = null;
        this.trackerMode = false;
        this.bridges = [];
        this.voidCells = new Set();
        this.activePatchCells = new Set();
        this.patchCharges = 0;
        this.beaconCharges = 0;
        this.breakCharges = 0;
        this.beaconCell = null;
        this.beaconTTL = 0;
        this.toolMode = 'route';
        this.trust = 80;
        this.realtimeMode = false;
        this.realtimePaused = false;
        this.realtimeLastTick = null;
        this.playerMoveCooldownMs = 600;
        this.playerCooldownRemaining = 0;
        this.bufferedMoveCell = null;
        this.realtimeAIClocks = {};
        this.realtimeEdges = { player: null, ai: {} };
        this.realtimeHistoryBuffer = [];
        this.realtimeLastHistoryAt = 0;
        this.enemySpeedScale = 1;
        this.bulletTimeActive = false;
        this.tutorialInputDismissed = false;

        this.DIR = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };
        this.rotationPermutations = { X: {}, Y: {}, Z: {} };

        this.faceLabels = { 0: 'U', 1: 'D', 2: 'L', 3: 'R', 4: 'F', 5: 'B' };
        this.faceNames = { 0: '上', 1: '下', 2: '左', 3: '右', 4: '前', 5: '后' };
        this.faceMarks = { 0: '▲', 1: '◆', 2: '▥', 3: '×', 4: '●', 5: '≈' };
        this.faceColors = {
            0: '#00f0ff',
            1: '#bd00ff',
            2: '#ff7700',
            3: '#ff0055',
            4: '#00ff88',
            5: '#ffdd00'
        };
        this.netLayout = {
            0: { x: 1, y: 0 }, // U
            2: { x: 0, y: 1 }, // L
            4: { x: 1, y: 1 }, // F
            3: { x: 2, y: 1 }, // R
            5: { x: 3, y: 1 }, // B
            1: { x: 1, y: 2 }  // D
        };
        this.levels = this.createLevelBook();
    }

    init(N, aiConfigs) {
        // 第一版锁定 3x3，避免在核心读图还未稳定时增加脑内负担。
        this.N = 3;
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.resetRuntimeState();
        this.buildTopology();
        this.precomputeRotations();
        this.spawnEntities(aiConfigs);

        this.gameState = 'playing';
        this.updateUI();
    }

    initLevel(levelIndex = 0, isInspect = false) {
        this.currentLevelIndex = Math.max(0, Math.min(this.levels.length - 1, levelIndex));
        this.currentLevel = this.levels[this.currentLevelIndex];
        this.N = this.currentLevel.size || 3;
        this.resetRuntimeState();
        this.buildTopology();
        this.precomputeRotations();
        this.spawnEntities(this.currentLevel.ais);
        this.recordEvent('levelStart', {
            levelTitle: this.currentLevel.title,
            playerAt: this.playerPos,
            keyAt: this.keyPos,
            exitAt: this.exitPos
        });

        // Initialize tutorial state
        const dismissed = typeof localStorage !== 'undefined' &&
            localStorage.getItem(`dawnCubeTutorialDismissed:${this.currentLevel.id}`) === 'true';
        if (!isInspect && this.currentLevel.tutorialSteps && this.currentLevel.tutorialSteps.length > 0 && !dismissed && typeof document !== 'undefined') {
            this.activeTutorialSteps = this.currentLevel.tutorialSteps.map(step => {
                const s = { ...step };
                if (step.targetCell) {
                    s.targetCellId = this.resolveCoord(step.targetCell);
                }
                if (step.focusCell) {
                    s.focusCellId = this.resolveCoord(step.focusCell);
                }
                return s;
            });
            this.currentTutorialStepIndex = 0;
            this.tutorialActive = true;
            this.realtimePaused = true;
        } else {
            this.activeTutorialSteps = [];
            this.currentTutorialStepIndex = -1;
            this.tutorialActive = false;
        }

        this.gameState = isInspect ? 'setup' : 'playing';
        this.updateUI();
    }

    resetRuntimeState() {
        this.cells = [];
        this.ais = [];
        this.keyPos = null;
        this.hasKey = false;
        this.exitPos = null;
        this.playerAP = this.maxAP;
        this.rotationEnabled = false;
        this.rotationsUsed = 0;
        this.turn = 1;
        this.plannedPath = [];
        this.historyStack = [];
        this.eventLog = [];
        this.lastFailure = null;
        this.lastInputCell = null;
        this.trackingEnabled = false;
        this.trackerCell = null;
        this.trackerMode = false;
        this.bridges = [];
        this.voidCells = new Set();
        this.activePatchCells = new Set();
        this.patchCharges = 0;
        this.beaconCharges = 0;
        this.breakCharges = 0;
        this.beaconCell = null;
        this.beaconTTL = 0;
        this.toolMode = 'route';
        this.trust = this.loadTrust();
        this.bulletTimeActive = false;
        this.resetRealtimeState();
        this.gameState = 'setup';
        this.activeTutorialSteps = [];
        this.currentTutorialStepIndex = -1;
        this.tutorialActive = false;
    }

    resetRealtimeState() {
        this.realtimePaused = false;
        this.realtimeLastTick = null;
        this.playerCooldownRemaining = 0;
        this.bufferedMoveCell = null;
        this.realtimeAIClocks = {};
        this.realtimeEdges = { player: null, ai: {} };
        this.realtimeHistoryBuffer = [];
        this.realtimeLastHistoryAt = 0;
    }

    applyRealtimeTuning(settings = {}) {
        const playerMoveMs = Number(settings.playerMoveMs);
        const enemySpeedScale = Number(settings.enemySpeedScale);
        if (Number.isFinite(playerMoveMs)) {
            this.playerMoveCooldownMs = Math.max(360, Math.min(900, playerMoveMs));
        }
        if (Number.isFinite(enemySpeedScale)) {
            this.enemySpeedScale = Math.max(0.5, Math.min(1.8, enemySpeedScale));
        }
        Object.entries(this.realtimeAIClocks || {}).forEach(([aiId, clock]) => {
            if (!clock) return;
            const progress = clock.intervalMs > 0 ? 1 - (clock.remainingMs / clock.intervalMs) : 0;
            const numericId = Number(aiId);
            const ai = this.ais.find(item => item.id === numericId);
            clock.intervalMs = this.getAIRealtimeIntervalMs(ai || {});
            clock.remainingMs = Math.max(0, clock.intervalMs * (1 - Math.max(0, Math.min(1, progress))));
        });
    }

    loadTrust() {
        if (typeof localStorage === 'undefined') return 80;
        const stored = Number(localStorage.getItem('dimensionHackTrust'));
        if (!Number.isFinite(stored)) return 80;
        return Math.max(0, Math.min(100, Math.round(stored)));
    }

    setTrust(value, reason = 'sync') {
        const next = Math.max(0, Math.min(100, Math.round(value)));
        const previous = this.trust;
        this.trust = next;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dimensionHackTrust', String(next));
        }
        if (previous !== next) {
            this.recordEvent('trustChanged', { previous, next, reason });
        }
        return next;
    }

    adjustTrust(delta, reason = 'event') {
        return this.setTrust(this.trust + delta, reason);
    }

    createLevelBook() {
        if (typeof window !== 'undefined' && typeof window.createLevelBook === 'function') {
            return window.createLevelBook();
        }
        throw new Error('Level book is not loaded. Include levels.js before game.js.');
    }

    resolveCoord(coord) {
        if (!coord) return null;
        return this.cellId(coord.face, coord.row, coord.col);
    }

    cellId(face, row, col) {
        return face * this.N * this.N + row * this.N + col;
    }

    getFaceCenter(face) {
        const mid = Math.floor(this.N / 2);
        return this.cellId(face, mid, mid);
    }

    buildTopology() {
        const N = this.N;
        const totalCells = 6 * N * N;

        for (let f = 0; f < 6; f++) {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const id = this.cellId(f, r, c);
                    const u = -1 + (2 * c + 1) / N;
                    const v = 1 - (2 * r + 1) / N;

                    let pos = { x: 0, y: 0, z: 0 };
                    let normal = { x: 0, y: 0, z: 0 };

                    switch (f) {
                        case 0: // U
                            pos = { x: u, y: 1, z: -v };
                            normal = { x: 0, y: 1, z: 0 };
                            break;
                        case 1: // D
                            pos = { x: u, y: -1, z: v };
                            normal = { x: 0, y: -1, z: 0 };
                            break;
                        case 2: // L
                            pos = { x: -1, y: v, z: u };
                            normal = { x: -1, y: 0, z: 0 };
                            break;
                        case 3: // R
                            pos = { x: 1, y: v, z: -u };
                            normal = { x: 1, y: 0, z: 0 };
                            break;
                        case 4: // F
                            pos = { x: u, y: v, z: 1 };
                            normal = { x: 0, y: 0, z: 1 };
                            break;
                        case 5: // B
                            pos = { x: -u, y: v, z: -1 };
                            normal = { x: 0, y: 0, z: -1 };
                            break;
                    }

                    this.cells[id] = {
                        id,
                        face: f,
                        row: r,
                        col: c,
                        pos,
                        normal,
                        neighbors: {}
                    };
                }
            }
        }

        for (let id = 0; id < totalCells; id++) {
            const cell = this.cells[id];
            const f = cell.face;
            const r = cell.row;
            const c = cell.col;

            let up = (r > 0) ? this.cellId(f, r - 1, c) : null;
            let down = (r < N - 1) ? this.cellId(f, r + 1, c) : null;
            let left = (c > 0) ? this.cellId(f, r, c - 1) : null;
            let right = (c < N - 1) ? this.cellId(f, r, c + 1) : null;

            if (r === 0) {
                switch (f) {
                    case 0: up = this.cellId(5, 0, N - 1 - c); break;
                    case 1: up = this.cellId(4, N - 1, c); break;
                    case 2: up = this.cellId(0, c, 0); break;
                    case 3: up = this.cellId(0, N - 1 - c, N - 1); break;
                    case 4: up = this.cellId(0, N - 1, c); break;
                    case 5: up = this.cellId(0, 0, N - 1 - c); break;
                }
            }
            if (r === N - 1) {
                switch (f) {
                    case 0: down = this.cellId(4, 0, c); break;
                    case 1: down = this.cellId(5, N - 1, N - 1 - c); break;
                    case 2: down = this.cellId(1, N - 1 - c, 0); break;
                    case 3: down = this.cellId(1, c, N - 1); break;
                    case 4: down = this.cellId(1, 0, c); break;
                    case 5: down = this.cellId(1, N - 1, N - 1 - c); break;
                }
            }
            if (c === 0) {
                switch (f) {
                    case 0: left = this.cellId(2, 0, r); break;
                    case 1: left = this.cellId(2, N - 1, N - 1 - r); break;
                    case 2: left = this.cellId(5, r, N - 1); break;
                    case 3: left = this.cellId(4, r, N - 1); break;
                    case 4: left = this.cellId(2, r, N - 1); break;
                    case 5: left = this.cellId(3, r, N - 1); break;
                }
            }
            if (c === N - 1) {
                switch (f) {
                    case 0: right = this.cellId(3, 0, N - 1 - r); break;
                    case 1: right = this.cellId(3, N - 1, r); break;
                    case 2: right = this.cellId(4, r, 0); break;
                    case 3: right = this.cellId(5, r, 0); break;
                    case 4: right = this.cellId(3, r, 0); break;
                    case 5: right = this.cellId(2, r, 0); break;
                }
            }

            cell.neighbors[this.DIR.UP] = up;
            cell.neighbors[this.DIR.DOWN] = down;
            cell.neighbors[this.DIR.LEFT] = left;
            cell.neighbors[this.DIR.RIGHT] = right;
        }
    }

    precomputeRotations() {
        const N = this.N;
        const totalCells = 6 * N * N;
        const axes = ['X', 'Y', 'Z'];
        const directions = ['CW', 'CCW'];

        const getLayerIndex = (pos, axis) => {
            const val = pos[axis.toLowerCase()];
            const clamped = Math.max(-1, Math.min(1, val));
            const idx = Math.floor((clamped + 1) / 2 * N);
            return Math.min(N - 1, idx);
        };

        for (const axis of axes) {
            this.rotationPermutations[axis] = {};
            for (let layer = 0; layer < N; layer++) {
                this.rotationPermutations[axis][layer] = { CW: [], CCW: [] };

                for (const dir of directions) {
                    const perm = new Array(totalCells);

                    for (let id = 0; id < totalCells; id++) {
                        const cell = this.cells[id];
                        const cellLayer = getLayerIndex(cell.pos, axis);

                        if (cellLayer !== layer) {
                            perm[id] = id;
                            continue;
                        }

                        const rotatedPos = { ...cell.pos };
                        const rotatedNormal = { ...cell.normal };
                        const angle = (dir === 'CW') ? -Math.PI / 2 : Math.PI / 2;
                        const cos = Math.cos(angle);
                        const sin = Math.sin(angle);

                        if (axis === 'X') {
                            rotatedPos.y = cell.pos.y * cos - cell.pos.z * sin;
                            rotatedPos.z = cell.pos.y * sin + cell.pos.z * cos;
                            rotatedNormal.y = cell.normal.y * cos - cell.normal.z * sin;
                            rotatedNormal.z = cell.normal.y * sin + cell.normal.z * cos;
                        } else if (axis === 'Y') {
                            rotatedPos.x = cell.pos.x * cos + cell.pos.z * sin;
                            rotatedPos.z = -cell.pos.x * sin + cell.pos.z * cos;
                            rotatedNormal.x = cell.normal.x * cos + cell.normal.z * sin;
                            rotatedNormal.z = -cell.normal.x * sin + cell.normal.z * cos;
                        } else if (axis === 'Z') {
                            rotatedPos.x = cell.pos.x * cos - cell.pos.y * sin;
                            rotatedPos.y = cell.pos.x * sin + cell.pos.y * cos;
                            rotatedNormal.x = cell.normal.x * cos - cell.normal.y * sin;
                            rotatedNormal.y = cell.normal.x * sin + cell.normal.y * cos;
                        }

                        let bestMatch = -1;
                        let minDistance = Infinity;
                        for (let searchId = 0; searchId < totalCells; searchId++) {
                            const targetCell = this.cells[searchId];
                            const dist = Math.hypot(
                                rotatedPos.x - targetCell.pos.x,
                                rotatedPos.y - targetCell.pos.y,
                                rotatedPos.z - targetCell.pos.z
                            );
                            const normalDot = rotatedNormal.x * targetCell.normal.x +
                                rotatedNormal.y * targetCell.normal.y +
                                rotatedNormal.z * targetCell.normal.z;

                            if (dist < minDistance && normalDot > 0.9) {
                                minDistance = dist;
                                bestMatch = searchId;
                            }
                        }

                        perm[id] = (bestMatch !== -1 && minDistance < 0.2) ? bestMatch : id;
                    }

                    this.rotationPermutations[axis][layer][dir] = perm;
                }
            }
        }
    }

    spawnEntities(aiConfigs) {
        const N = this.N;
        const totalCells = 6 * N * N;

        this.playerPos = this.currentLevel ? this.resolveCoord(this.currentLevel.player) : this.getFaceCenter(0);
        this.playerLastPos = this.playerPos;
        this.hasKey = Boolean(this.currentLevel && this.currentLevel.hasKeyStart);
        this.keyPos = this.currentLevel ? this.resolveCoord(this.currentLevel.key) : this.getFaceCenter(4);
        if (this.hasKey) this.keyPos = null;
        this.exitPos = this.currentLevel ? this.resolveCoord(this.currentLevel.exit) : this.getFaceCenter(1);
        this.rotationEnabled = this.currentLevel
            ? Boolean(this.currentLevel.rotationEnabled)
            : true;
        this.trackingEnabled = this.currentLevel
            ? Boolean(this.currentLevel.trackingEnabled)
            : false;
        this.trackerCell = this.currentLevel?.trackerStart
            ? this.resolveCoord(this.currentLevel.trackerStart)
            : null;
        this.trackerMode = false;
        this.voidCells = new Set(this.normalizeCellList(this.currentLevel?.voids || []));
        this.activePatchCells = new Set();
        this.patchCharges = Number(this.currentLevel?.patchCharges || 0);
        this.beaconCharges = Number(this.currentLevel?.beaconCharges || 0);
        this.breakCharges = Number(this.currentLevel?.breakCharges || 0);
        this.beaconCell = null;
        this.beaconTTL = 0;
        this.toolMode = 'route';
        this.bridges = (this.currentLevel?.bridges || [])
            .map(link => ({
                a: this.resolveCoord(link.a),
                b: this.resolveCoord(link.b)
            }))
            .filter(link => link.a !== null && link.b !== null && link.a !== link.b);
        this.rotationsUsed = 0;

        const configs = this.currentLevel
            ? (aiConfigs || [])
            : ((aiConfigs && aiConfigs.length > 0) ? aiConfigs : [{ type: 'chaser', spawn: 'opposite' }]);

        const getAvailablePositions = (exclude = []) => {
            const list = [];
            for (let i = 0; i < totalCells; i++) {
                if (!exclude.includes(i) && this.isWalkableForAI(i)) list.push(i);
            }
            return list;
        };

        configs.forEach((config, idx) => {
            const excludePool = [
                this.playerPos,
                ...(this.keyPos !== null ? [this.keyPos] : []),
                this.exitPos,
                ...this.ais.map(ai => ai.pos)
            ];
            let spawnPos;

            if (config.pos) {
                spawnPos = this.resolveCoord(config.pos);
                if (excludePool.includes(spawnPos) || !this.isWalkableForAI(spawnPos)) {
                    spawnPos = this.findGuardianGuardPost(excludePool) || getAvailablePositions(excludePool)[0];
                }
            } else if (config.type === 'guardian') {
                spawnPos = this.findGuardianGuardPost(excludePool) || getAvailablePositions(excludePool)[0];
            } else if (config.spawn === 'opposite') {
                const oppositeCornerPool = [
                    this.cellId(1, 0, 0),
                    this.cellId(1, 0, N - 1),
                    this.cellId(1, N - 1, 0),
                    this.cellId(1, N - 1, N - 1)
                ].filter(id => !excludePool.includes(id));
                spawnPos = oppositeCornerPool[Math.floor(Math.random() * oppositeCornerPool.length)] ||
                    getAvailablePositions(excludePool)[0];
            } else {
                const pool = getAvailablePositions(excludePool)
                    .filter(id => this.cells[id].face !== 0);
                spawnPos = pool[Math.floor(Math.random() * pool.length)] ||
                    getAvailablePositions(excludePool)[0];
            }

            this.ais.push({
                id: idx,
                pos: spawnPos,
                type: config.type,
                state: config.type === 'guardian' ? 'guard' : 'alert',
                aggro: config.aggro || (config.type === 'guardian' && this.currentLevel
                    ? this.currentLevel.guardianAggro || 'sameFace'
                    : 'always'),
                guardPost: spawnPos,
                color: config.type === 'chaser' ? '#ff0055' :
                    (config.type === 'ambusher' ? '#bd00ff' : '#ffb700')
            });
        });
    }

    findGuardianGuardPost(excludePool) {
        if (this.keyPos === null) return null;
        const keyCell = this.cells[this.keyPos];
        const sameFaceCorners = [
            this.cellId(keyCell.face, 0, 0),
            this.cellId(keyCell.face, 0, this.N - 1),
            this.cellId(keyCell.face, this.N - 1, 0),
            this.cellId(keyCell.face, this.N - 1, this.N - 1)
        ].filter(id => id !== this.keyPos && !excludePool.includes(id) && this.isWalkableForAI(id));
        if (sameFaceCorners.length > 0) return sameFaceCorners[0];

        const keyNeighbors = Object.values(this.cells[this.keyPos].neighbors)
            .filter(id => id !== null && id !== this.keyPos && !excludePool.includes(id) && this.isWalkableForAI(id));
        return keyNeighbors[0] || null;
    }

    normalizeCellList(coords = []) {
        return coords
            .map(coord => this.resolveCoord(coord))
            .filter(cellId => cellId !== null && cellId !== undefined);
    }

    isVoidCell(cellId) {
        return this.voidCells.has(cellId);
    }

    isActivePatchCell(cellId) {
        return this.activePatchCells.has(cellId);
    }

    isWalkableForPlayer(cellId) {
        if (cellId === null || cellId === undefined || !this.cells[cellId]) return false;
        return !this.isVoidCell(cellId) || this.isActivePatchCell(cellId);
    }

    isWalkableForAI(cellId) {
        if (cellId === null || cellId === undefined || !this.cells[cellId]) return false;
        if (this.isVoidCell(cellId)) return false;
        if (this.isActivePatchCell(cellId)) return false;
        return true;
    }

    isReservedCell(cellId) {
        if (cellId === null || cellId === undefined) return true;
        if (cellId === this.playerPos) return true;
        if (!this.hasKey && this.keyPos !== null && cellId === this.keyPos) return true;
        if (this.exitPos !== null && cellId === this.exitPos) return true;
        if (this.ais.some(ai => ai.pos === cellId)) return true;
        if ((this.bridges || []).some(link => link.a === cellId || link.b === cellId)) return true;
        if (this.activePatchCells.has(cellId)) return true;
        return false;
    }

    isLegalPatchTarget(cellId) {
        return this.patchCharges > 0 &&
            this.isVoidCell(cellId) &&
            !this.isActivePatchCell(cellId);
    }

    isLegalBeaconTarget(cellId) {
        return this.beaconCharges > 0 &&
            this.isWalkableForPlayer(cellId) &&
            !this.isReservedCell(cellId);
    }

    isLegalBreakTarget(cellId) {
        return this.breakCharges > 0 &&
            cellId !== null &&
            cellId !== undefined &&
            this.cells[cellId] &&
            (!this.isVoidCell(cellId) || this.isActivePatchCell(cellId)) &&
            cellId !== this.playerPos &&
            !this.ais.some(ai => ai.pos === cellId) &&
            (this.hasKey || this.keyPos === null || cellId !== this.keyPos) &&
            cellId !== this.exitPos &&
            !(this.bridges || []).some(link => link.a === cellId || link.b === cellId);
    }

    getBridgeDestination(cellId) {
        const bridge = this.bridges.find(link => link.a === cellId || link.b === cellId);
        if (!bridge) return null;
        return bridge.a === cellId ? bridge.b : bridge.a;
    }

    isBridgeStep(fromId, toId) {
        if (fromId === null || fromId === undefined || toId === null || toId === undefined) return false;
        return this.getBridgeDestination(fromId) === toId;
    }

    getNeighbors(cellId, options = {}) {
        if (cellId === null || cellId === undefined || !this.cells[cellId]) return [];
        const actor = options.actor || 'player';
        const canEnter = actor === 'ai'
            ? cellIdToCheck => this.isWalkableForAI(cellIdToCheck)
            : cellIdToCheck => this.isWalkableForPlayer(cellIdToCheck);

        const baseNeighbors = Object.values(this.cells[cellId].neighbors)
            .filter(id => id !== null && id !== undefined && canEnter(id));
        const bridgeTarget = this.getBridgeDestination(cellId);
        if (bridgeTarget === null || bridgeTarget === undefined || !canEnter(bridgeTarget)) {
            return baseNeighbors;
        }
        return [...new Set([...baseNeighbors, bridgeTarget])];
    }

    findPath(startId, endId, options = {}) {
        if (startId === endId) return [startId];
        const actor = options.actor || 'player';
        if (actor === 'ai' && (!this.isWalkableForAI(startId) || !this.isWalkableForAI(endId))) return null;
        if (actor !== 'ai' && (!this.isWalkableForPlayer(startId) || !this.isWalkableForPlayer(endId))) return null;

        const queue = [[startId]];
        const visited = new Set([startId]);

        while (queue.length > 0) {
            const path = queue.shift();
            const curr = path[path.length - 1];

            for (const neighborId of this.getNeighbors(curr, options)) {
                if (!visited.has(neighborId)) {
                    const newPath = [...path, neighborId];
                    if (neighborId === endId) return newPath;
                    visited.add(neighborId);
                    queue.push(newPath);
                }
            }
        }

        return null;
    }

    isAdjacent(fromId, toId) {
        if (fromId === null || toId === null) return false;
        return this.getNeighbors(fromId).includes(toId);
    }

    clearPlannedPath() {
        const hadPath = this.plannedPath.length > 0;
        this.plannedPath = [];
        this.lastInputCell = null;
        if (window.renderEngine) window.renderEngine.drawPlannedPath([]);
        this.updateActionButtons();
        this.drawMinimap();
        if (hadPath) {
            this.playFeel('routeUndo');
        }
    }

    playFeel(soundName) {
        if (window.audioFeedback) window.audioFeedback.play(soundName);
    }

    showFeel(text, tone = 'info', flash = false) {
        if (window.gameFeel) {
            window.gameFeel.note(text, tone);
            if (flash) window.gameFeel.flashScreen(tone);
        }
    }

    recordEvent(type, data = {}) {
        const event = {
            type,
            turn: this.turn,
            playerPos: this.playerPos,
            hasKey: this.hasKey,
            ...data
        };
        this.eventLog.push(event);
        if (this.eventLog.length > 32) {
            this.eventLog.shift();
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('dimensionhack:event', { detail: event }));
        }
    }

    distanceBetween(fromId, toId) {
        if (fromId === null || fromId === undefined || toId === null || toId === undefined) return null;
        if (fromId === toId) return 0;
        const path = this.findPath(fromId, toId);
        return path ? path.length - 1 : null;
    }

    createSnapshot(reason) {
        return {
            reason,
            playerPos: this.playerPos,
            playerLastPos: this.playerLastPos,
            playerAP: this.playerAP,
            rotationEnabled: this.rotationEnabled,
            rotationsUsed: this.rotationsUsed,
            turn: this.turn,
            ais: this.ais.map(ai => ({ ...ai })),
            keyPos: this.keyPos,
            hasKey: this.hasKey,
            exitPos: this.exitPos,
            trackingEnabled: this.trackingEnabled,
            trackerCell: this.trackerCell,
            trackerMode: this.trackerMode,
            bridges: this.bridges.map(link => ({ ...link })),
            voidCells: [...this.voidCells],
            activePatchCells: [...this.activePatchCells],
            patchCharges: this.patchCharges,
            beaconCharges: this.beaconCharges,
            breakCharges: this.breakCharges,
            beaconCell: this.beaconCell,
            beaconTTL: this.beaconTTL,
            toolMode: this.toolMode,
            trust: this.trust,
            gameState: this.gameState,
            plannedPath: [...this.plannedPath],
            realtimeMode: this.realtimeMode,
            realtimePaused: this.realtimePaused,
            playerCooldownRemaining: this.playerCooldownRemaining,
            bufferedMoveCell: this.bufferedMoveCell,
            realtimeAIClocks: JSON.parse(JSON.stringify(this.realtimeAIClocks || {})),
            realtimeEdges: JSON.parse(JSON.stringify(this.realtimeEdges || { player: null, ai: {} })),
            lastFailure: this.lastFailure ? { ...this.lastFailure } : null,
            eventLog: this.eventLog.map(event => ({ ...event })),
            currentLevelIndex: this.currentLevelIndex
        };
    }

    pushHistory(reason) {
        this.historyStack.push(this.createSnapshot(reason));
        if (this.historyStack.length > 80) {
            this.historyStack.shift();
        }
        this.updateActionButtons();
    }

    canUndo() {
        if (this.realtimeMode) return this.realtimeHistoryBuffer.length > 0;
        return this.historyStack.length > 0;
    }

    undoTurn() {
        if (!this.canUndo()) return false;
        if (this.realtimeMode) return this.rollbackRealtime(3000);
        const snapshot = this.historyStack.pop();
        this.restoreSnapshot(snapshot);
        this.playFeel('undo');
        return true;
    }

    restoreSnapshot(snapshot) {
        this.playerPos = snapshot.playerPos;
        this.playerLastPos = snapshot.playerLastPos;
        this.playerAP = snapshot.playerAP;
        this.rotationEnabled = Boolean(snapshot.rotationEnabled);
        this.rotationsUsed = snapshot.rotationsUsed ?? 0;
        this.turn = snapshot.turn;
        this.ais = snapshot.ais.map(ai => ({ ...ai }));
        this.keyPos = snapshot.keyPos;
        this.hasKey = snapshot.hasKey;
        this.exitPos = snapshot.exitPos;
        this.trackingEnabled = Boolean(snapshot.trackingEnabled);
        this.trackerCell = snapshot.trackerCell ?? null;
        this.trackerMode = Boolean(snapshot.trackerMode);
        this.bridges = (snapshot.bridges || []).map(link => ({ ...link }));
        this.voidCells = new Set(snapshot.voidCells || []);
        this.activePatchCells = new Set(snapshot.activePatchCells || []);
        this.patchCharges = snapshot.patchCharges ?? 0;
        this.beaconCharges = snapshot.beaconCharges ?? 0;
        this.breakCharges = snapshot.breakCharges ?? 0;
        this.beaconCell = snapshot.beaconCell ?? null;
        this.beaconTTL = snapshot.beaconTTL ?? 0;
        this.toolMode = snapshot.toolMode || 'route';
        this.trust = snapshot.trust ?? this.trust;
        this.gameState = snapshot.gameState === 'gameover' ? 'playing' : snapshot.gameState;
        this.plannedPath = snapshot.plannedPath || [];
        this.realtimeMode = Boolean(snapshot.realtimeMode);
        this.realtimePaused = Boolean(snapshot.realtimePaused);
        this.realtimeLastTick = null;
        this.playerCooldownRemaining = snapshot.playerCooldownRemaining ?? 0;
        this.bufferedMoveCell = snapshot.bufferedMoveCell ?? null;
        this.realtimeAIClocks = JSON.parse(JSON.stringify(snapshot.realtimeAIClocks || {}));
        this.realtimeEdges = JSON.parse(JSON.stringify(snapshot.realtimeEdges || { player: null, ai: {} }));
        this.lastFailure = snapshot.lastFailure || null;
        this.eventLog = (snapshot.eventLog || []).map(event => ({ ...event }));
        this.currentLevelIndex = snapshot.currentLevelIndex ?? this.currentLevelIndex;
        this.currentLevel = this.levels[this.currentLevelIndex] || this.currentLevel;
        this.lastInputCell = null;
        this.tutorialInputDismissed = false;

        document.getElementById('gameover-overlay')?.classList.remove('active', 'jump-alert', 'signal-lost');
        document.getElementById('victory-overlay')?.classList.remove('active');

        if (window.renderEngine) {
            window.renderEngine.isAnimating = false;
            window.renderEngine.buildCube3D();
            window.renderEngine.spawnEntities3D();
            window.renderEngine.drawPlannedPath(this.plannedPath);
        }

        this.updateUI();
    }

    skipTurn() {
        if (this.gameState !== 'playing') return;
        if (this.realtimeMode) {
            this.recordEvent('wait', { cooldown: this.playerCooldownRemaining });
            this.playerCooldownRemaining = Math.max(this.playerCooldownRemaining, this.playerMoveCooldownMs * 0.45);
            this.bufferedMoveCell = null;
            this.playFeel('routeTick');
            this.showFeel('原地稳住半拍', 'info');
            this.updateUI();
            return;
        }
        this.pushHistory('skip');
        this.recordEvent('skip', { apBefore: this.playerAP });
        this.playerAP = 0;
        this.clearPlannedPath();
        this.triggerAITurn();
    }

    toggleTrackerMode() {
        if (!this.trackingEnabled) {
            this.playFeel('invalid');
            this.showFeel('该标记工具已从主线移除', 'warn');
            return;
        }

        this.trackerMode = !this.trackerMode;
        if (this.trackerMode) {
            this.clearPlannedPath();
            this.showFeel('标记工具已退居档案；现在直接操作 3D 魔方', 'info');
        } else {
            this.showFeel('已取消标记', 'info');
        }
        this.updateUI();
    }

    setTrackerCell(cellId) {
        if (!this.trackingEnabled || cellId === null || cellId === undefined) return;

        this.trackerCell = cellId;
        this.trackerMode = false;
        this.recordEvent('trackerSet', { cell: cellId });
        this.playFeel('uiConfirm');
        this.showFeel(`标记：${this.describeCell(cellId)}`, 'good');
        this.updateUI();
    }

    clearTracker() {
        if (!this.trackingEnabled) return;
        const hadMarker = this.trackerCell !== null && this.trackerCell !== undefined;
        this.trackerCell = null;
        this.trackerMode = false;
        if (hadMarker) {
            this.recordEvent('trackerClear');
            this.playFeel('routeUndo');
            this.showFeel('标记已清除', 'info');
        }
        this.updateUI();
    }

    setToolMode(mode = 'route') {
        const nextMode = ['route', 'patch', 'beacon', 'break'].includes(mode) ? mode : 'route';
        if (this.tutorialActive) {
            const step = this.activeTutorialSteps[this.currentTutorialStepIndex];
            if (step && step.type === 'tool') {
                if (nextMode !== step.tool && nextMode !== 'route') {
                    this.playFeel('invalid');
                    const toolNames = { patch: '补片', beacon: '信标', break: '碎解' };
                    this.showFeel(`当前步骤强引导中。请使用 [${toolNames[step.tool] || step.tool}] 工具。`, 'warn');
                    return;
                }
            } else {
                if (nextMode !== 'route') {
                    this.playFeel('invalid');
                    this.showFeel('当前步骤强引导中，暂时无法使用工具。', 'warn');
                    return;
                }
            }
        }
        if (nextMode === 'patch' && this.patchCharges <= 0) {
            this.playFeel('invalid');
            this.showFeel('没有可用补片', 'warn');
            return;
        }
        if (nextMode === 'beacon' && this.beaconCharges <= 0) {
            this.playFeel('invalid');
            this.showFeel('没有可用诱饵', 'warn');
            return;
        }
        if (nextMode === 'break' && this.breakCharges <= 0) {
            this.playFeel('invalid');
            this.showFeel('没有可用碎解点数', 'warn');
            return;
        }
        this.toolMode = nextMode;
        const labels = { route: '点击下一格', patch: '选择缺口放补片', beacon: '选择格子放诱饵', break: '选择格子碎解' };
        this.showFeel(labels[nextMode], nextMode === 'route' ? 'info' : 'good');
        this.updateUI();
    }

    placePatch(cellId) {
        if (this.gameState !== 'playing') return false;
        if (this.tutorialActive) {
            const step = this.activeTutorialSteps[this.currentTutorialStepIndex];
            if (step && step.type === 'tool' && step.tool === 'patch' && cellId === step.targetCellId) {
                // Allowed
            } else {
                this.playFeel('invalid');
                this.showFeel('请按照指示使用补片！', 'warn');
                return false;
            }
        }
        if (!this.isLegalPatchTarget(cellId)) {
            this.playFeel('invalid');
            this.showFeel('补片只能铺在黑色缺口上', 'warn');
            return false;
        }

        this.pushHistory('patch');
        this.patchCharges -= 1;
        this.activePatchCells.add(cellId);
        this.toolMode = 'route';
        this.recordEvent('patchPlaced', { at: cellId });
        this.playFeel('patchPlace');
        this.showFeel('临时补片已铺好。别停在上面。', 'good', true);
        if (window.renderEngine) {
            window.renderEngine.spawnEntities3D();
            window.renderEngine.spawnCellPulse(cellId, '#8bdcff', 1.2);
        }
        this.updateUI();
        if (this.tutorialActive) {
            this.currentTutorialStepIndex++;
            if (typeof window !== 'undefined' && window.updateTutorialUI) {
                window.updateTutorialUI();
            }
        }
        return true;
    }

    placeBeacon(cellId) {
        if (this.gameState !== 'playing') return false;
        if (this.tutorialActive) {
            const step = this.activeTutorialSteps[this.currentTutorialStepIndex];
            if (step && step.type === 'tool' && step.tool === 'beacon' && cellId === step.targetCellId) {
                // Allowed
            } else {
                this.playFeel('invalid');
                this.showFeel('请按照指示使用信标！', 'warn');
                return false;
            }
        }
        if (!this.isLegalBeaconTarget(cellId)) {
            this.playFeel('invalid');
            this.showFeel('诱饵要放在空的安全格上', 'warn');
            return false;
        }

        this.pushHistory('beacon');
        this.beaconCharges -= 1;
        this.beaconCell = cellId;
        this.beaconTTL = Math.max(1, Number(this.currentLevel?.beaconDuration || 1));
        this.toolMode = 'route';
        this.recordEvent('beaconPlaced', { at: cellId, ttl: this.beaconTTL });
        this.playFeel('beaconPlace');
        this.showFeel('诱饵信标已投放', 'good', true);
        if (window.renderEngine) {
            window.renderEngine.spawnEntities3D();
            window.renderEngine.spawnCellPulse(cellId, '#ffb700', 1.2);
        }
        this.updateUI();
        if (this.tutorialActive) {
            this.currentTutorialStepIndex++;
            if (typeof window !== 'undefined' && window.updateTutorialUI) {
                window.updateTutorialUI();
            }
        }
        return true;
    }

    placeBreak(cellId) {
        if (this.gameState !== 'playing') return false;
        if (this.tutorialActive) {
            const step = this.activeTutorialSteps[this.currentTutorialStepIndex];
            if (step && step.type === 'tool' && step.tool === 'break' && cellId === step.targetCellId) {
                // Allowed
            } else {
                this.playFeel('invalid');
                this.showFeel('请按照指示碎解格子！', 'warn');
                return false;
            }
        }
        if (!this.isLegalBreakTarget(cellId)) {
            this.playFeel('invalid');
            this.showFeel('不能碎解关键物、敌人、传送门或已缺失格', 'warn');
            return false;
        }

        const resumeRealtime = this.realtimeMode && !this.realtimePaused;
        if (this.realtimeMode) {
            this.snapRealtimeEntitiesToGrid('break');
            this.setRealtimePaused(true);
        }
        this.pushHistory('break');
        this.breakCharges -= 1;
        this.activePatchCells.delete(cellId);
        this.voidCells.add(cellId);
        this.toolMode = 'route';
        this.recordEvent('breakPlaced', { at: cellId });
        this.playFeel('patchBreak');
        this.showFeel(`已碎解 ${this.describeCell(cellId)}`, 'warn', true);
        if (window.renderEngine) {
            window.renderEngine.buildCube3D();
            window.renderEngine.spawnEntities3D();
            window.renderEngine.spawnCellPulse(cellId, '#ff0055', 1.25);
        }
        this.updateUI();
        if (this.tutorialActive) {
            this.currentTutorialStepIndex++;
            if (typeof window !== 'undefined' && window.updateTutorialUI) {
                window.updateTutorialUI();
            }
        }
        if (resumeRealtime && typeof window !== 'undefined') {
            window.setTimeout(() => {
                if (this.gameState === 'playing') this.setRealtimePaused(false);
            }, 420);
        } else if (resumeRealtime) {
            this.setRealtimePaused(false);
        }
        return true;
    }

    handleBoardCellClick(cellId) {
        if (cellId === null || cellId === undefined) return false;
        if (this.toolMode === 'patch') return this.placePatch(cellId);
        if (this.toolMode === 'beacon') return this.placeBeacon(cellId);
        if (this.toolMode === 'break') return this.placeBreak(cellId);
        if (this.realtimeMode) return this.requestRealtimeMove(cellId);
        this.appendPathCell(cellId);
        return true;
    }

    setRealtimeMode(enabled) {
        this.realtimeMode = Boolean(enabled);
        this.clearPlannedPath();
        this.resetRealtimeState();
        if (this.realtimeMode) {
            this.primeRealtimeClocks();
            this.realtimeLastTick = this.nowMs();
        }
        this.updateUI();
    }

    startRealtime() {
        if (!this.realtimeMode) this.setRealtimeMode(true);
        if (typeof window !== 'undefined') this.applyRealtimeTuning(window.dawnCubeSettings || {});
        this.realtimePaused = false;
        this.realtimeLastTick = this.nowMs();
        this.primeRealtimeClocks();
        this.recordRealtimeSnapshot(this.realtimeLastTick, true);
    }

    stopRealtime() {
        this.realtimePaused = true;
        this.realtimeLastTick = null;
    }

    setRealtimePaused(paused) {
        this.realtimePaused = Boolean(paused);
        this.realtimeLastTick = this.realtimePaused ? null : this.nowMs();
    }

    nowMs() {
        if (typeof performance !== 'undefined' && performance.now) return performance.now();
        return Date.now();
    }

    getRealtimeTimeScale() {
        if (this.realtimePaused || this.gameState !== 'playing') return 0;
        if (this.tutorialActive) {
            const step = this.activeTutorialSteps?.[this.currentTutorialStepIndex];
            if (step?.type === 'dialog') return 0;
        }
        if (typeof window !== 'undefined' && window.renderEngine?.interactionMode === 'twist') return 0.2;
        const level = this.currentLevel;
        if (this.bulletTimeActive && (level?.act >= 2 || this.currentLevelIndex >= 12)) return 0.2;
        return 1;
    }

    primeRealtimeClocks() {
        this.ais.forEach(ai => {
            if (!this.realtimeAIClocks[ai.id]) {
                this.realtimeAIClocks[ai.id] = {
                    intervalMs: this.getAIRealtimeIntervalMs(ai),
                    remainingMs: this.getAIRealtimeIntervalMs(ai),
                    nextCell: this.computeAIMovement(ai)
                };
            }
        });
    }

    getAIRealtimeIntervalMs(ai) {
        const difficulty = Number(this.currentLevel?.difficulty || 3);
        const base = difficulty <= 3 ? 2500 : (difficulty <= 7 ? 1500 : 900);
        const scaled = base / Math.max(0.5, Math.min(1.8, this.enemySpeedScale || 1));
        if (ai.type === 'guardian' && this.hasKey) return Math.max(520, scaled * 0.72);
        if (ai.type === 'ambusher') return Math.max(560, scaled * 0.82);
        return Math.max(420, scaled);
    }

    requestRealtimeMove(targetId) {
        if (this.gameState !== 'playing') return false;
        if (this.tutorialActive) {
            const step = this.activeTutorialSteps[this.currentTutorialStepIndex];
            if (step && step.type === 'move') {
                if (targetId === step.targetCellId) {
                    const res = this.movePlayerRealtime(targetId);
                    if (res) {
                        this.currentTutorialStepIndex++;
                        if (typeof window !== 'undefined' && window.updateTutorialUI) {
                            window.updateTutorialUI();
                        }
                    }
                    return res;
                } else {
                    this.playFeel?.('invalid');
                    this.showFeel?.('当前步骤强引导中。请按照指示移动！', 'warn');
                    return false;
                }
            } else {
                return false;
            }
        }
        if (this.realtimeMode && this.realtimePaused && this.canAutoResumeRealtimeFromInput()) {
            this.setRealtimePaused(false);
        }
        if (targetId === this.playerPos) return false;
        if (!this.isWalkableForPlayer(targetId)) {
            this.playFeel('invalid');
            this.showFeel(this.isVoidCell(targetId) ? '这里是缺口，先铺补片' : '这格不能落脚', 'warn');
            return false;
        }
        if (!this.isAdjacent(this.playerPos, targetId)) {
            this.playFeel('invalid');
            this.showFeel('实时模式只接相邻格。别隔空指挥，我会怀疑你也在掉帧。', 'warn');
            return false;
        }
        if (this.maybeRefuseRoute({ realtime: true })) {
            this.bufferedMoveCell = null;
            return true;
        }
        if (this.playerCooldownRemaining > 0) {
            this.bufferedMoveCell = targetId;
            this.playFeel('routeTick');
            this.showFeel('已预输入下一步', 'info');
            this.updateUI();
            return true;
        }
        return this.movePlayerRealtime(targetId);
    }

    canAutoResumeRealtimeFromInput() {
        if (typeof document === 'undefined') return true;
        const settingsOpen = document.getElementById('settings-overlay')?.classList.contains('active');
        const consoleOpen = document.getElementById('esc-console')?.classList.contains('active');
        const gameoverOpen = document.getElementById('gameover-overlay')?.classList.contains('active');
        const victoryOpen = document.getElementById('victory-overlay')?.classList.contains('active');
        return !settingsOpen && !consoleOpen && !gameoverOpen && !victoryOpen;
    }

    movePlayerRealtime(targetId) {
        if (this.gameState !== 'playing') return false;
        const fromCell = this.playerPos;
        if (!this.isAdjacent(fromCell, targetId) || !this.isWalkableForPlayer(targetId)) return false;
        this.pushHistory('realtimeMove');
        this.tutorialInputDismissed = true;
        this.playerLastPos = fromCell;
        this.playerPos = targetId;
        this.playerCooldownRemaining = this.playerMoveCooldownMs;
        this.realtimeEdges.player = {
            from: fromCell,
            to: targetId,
            remainingMs: this.playerMoveCooldownMs,
            durationMs: this.playerMoveCooldownMs
        };
        this.recordEvent('playerMove', {
            from: fromCell,
            to: targetId,
            remainingAP: 'realtime',
            usedBridge: this.isBridgeStep(fromCell, targetId)
        });
        const usedBridge = this.isBridgeStep(fromCell, targetId);
        this.playFeel(usedBridge ? 'bridgeStep' : 'playerStep');
        this.consumePatchBehind(fromCell, targetId);
        this.checkKeyCollection();
        if (typeof window !== 'undefined' && window.renderEngine) {
            if (usedBridge && window.renderEngine.animateBridgeTransit) {
                window.renderEngine.animateBridgeTransit('player', null, fromCell, targetId);
            } else {
                window.renderEngine.movePlayer(targetId);
            }
            window.renderEngine.drawPlannedPath([]);
            window.renderEngine.spawnCellPulse(targetId, '#8bdcff', 0.45);
        }
        this.checkCollisions();
        this.updateUI();
        return true;
    }

    consumePatchBehind(fromCell, toCell) {
        if (!this.activePatchCells.has(fromCell)) return;
        this.activePatchCells.delete(fromCell);
        this.recordEvent('patchBroken', { at: fromCell, afterStepTo: toCell });
        this.playFeel('patchBreak');
        this.showFeel('补片碎了。好消息：它很听话；坏消息：一次性的。', 'warn');
        if (typeof window !== 'undefined' && window.renderEngine) {
            window.renderEngine.spawnCellPulse(fromCell, '#8bdcff', 1.35);
            window.renderEngine.spawnEntities3D();
        }
    }

    updateRealtime(now = this.nowMs()) {
        if (!this.realtimeMode) return;
        if (this.gameState !== 'playing') {
            this.realtimeLastTick = now;
            return;
        }
        const scale = this.getRealtimeTimeScale();
        if (scale <= 0) {
            this.realtimeLastTick = now;
            return;
        }
        if (this.realtimeLastTick === null) {
            this.realtimeLastTick = now;
            return;
        }
        const rawDelta = Math.max(0, Math.min(120, now - this.realtimeLastTick));
        this.realtimeLastTick = now;
        const deltaMs = rawDelta * scale;

        this.tickRealtimePlayer(deltaMs);
        this.tickRealtimeAI(deltaMs);
        Object.keys(this.realtimeEdges.ai || {}).forEach(aiId => {
            const edge = this.realtimeEdges.ai[aiId];
            if (!edge) return;
            edge.remainingMs = Math.max(0, edge.remainingMs - deltaMs);
            if (edge.remainingMs <= 0) delete this.realtimeEdges.ai[aiId];
        });
        this.recordRealtimeSnapshot(now);
        this.checkRealtimeCollisions();
    }

    recordRealtimeSnapshot(now = this.nowMs(), force = false) {
        if (!this.realtimeMode || this.gameState !== 'playing') return;
        if (!force && now - this.realtimeLastHistoryAt < 120) return;
        const snapshot = this.createSnapshot('realtime');
        snapshot.realtimeTimestamp = now;
        this.realtimeHistoryBuffer.push(snapshot);
        this.realtimeLastHistoryAt = now;
        const minTime = now - 6500;
        while (this.realtimeHistoryBuffer.length > 0
            && this.realtimeHistoryBuffer[0].realtimeTimestamp < minTime) {
            this.realtimeHistoryBuffer.shift();
        }
        if (this.realtimeHistoryBuffer.length > 80) {
            this.realtimeHistoryBuffer.splice(0, this.realtimeHistoryBuffer.length - 80);
        }
        this.updateActionButtons();
    }

    rollbackRealtime(ms = 3000) {
        if (!this.realtimeMode || this.realtimeHistoryBuffer.length === 0) return false;
        const now = this.nowMs();
        const targetTime = now - ms;
        let target = this.realtimeHistoryBuffer[0];
        for (const snapshot of this.realtimeHistoryBuffer) {
            if (snapshot.realtimeTimestamp <= targetTime) {
                target = snapshot;
            } else {
                break;
            }
        }
        const retained = this.realtimeHistoryBuffer
            .filter(snapshot => snapshot.realtimeTimestamp <= target.realtimeTimestamp)
            .map(snapshot => ({ ...snapshot }));
        this.restoreSnapshot(target);
        this.playerPos = Number.isFinite(target.playerPos) ? target.playerPos : this.playerPos;
        this.playerLastPos = this.playerPos;
        this.ais = this.ais.map(ai => ({ ...ai, lastPos: ai.pos }));
        this.realtimeMode = true;
        this.realtimePaused = false;
        this.realtimeLastTick = now;
        this.realtimeHistoryBuffer = retained;
        this.realtimeLastHistoryAt = now;
        this.playerCooldownRemaining = 0;
        this.bufferedMoveCell = null;
        this.realtimeEdges = { player: null, ai: {} };
        this.recordRealtimeSnapshot(now, true);
        this.playFeel('undo');
        this.showFeel('倒回 3 秒。Dawn：又格式化？脑子会痛的。', 'info', true);
        this.recordEvent('rollback', { seconds: 3, target: target.realtimeTimestamp });
        this.updateUI();
        return true;
    }

    tickRealtimePlayer(deltaMs) {
        if (this.playerCooldownRemaining > 0) {
            this.playerCooldownRemaining = Math.max(0, this.playerCooldownRemaining - deltaMs);
            if (this.realtimeEdges.player) {
                this.realtimeEdges.player.remainingMs = Math.max(0, this.realtimeEdges.player.remainingMs - deltaMs);
                if (this.realtimeEdges.player.remainingMs <= 0) this.realtimeEdges.player = null;
            }
        }
        if (this.playerCooldownRemaining <= 0 && this.bufferedMoveCell !== null) {
            const buffered = this.bufferedMoveCell;
            this.bufferedMoveCell = null;
            this.requestRealtimeMove(buffered);
        }
    }

    tickRealtimeAI(deltaMs) {
        this.primeRealtimeClocks();
        this.ais.forEach(ai => {
            const clock = this.realtimeAIClocks[ai.id];
            if (!clock) return;
            clock.intervalMs = this.getAIRealtimeIntervalMs(ai);
            clock.remainingMs -= deltaMs;
            let safety = 0;
            while (clock.remainingMs <= 0 && safety < 2 && this.gameState === 'playing') {
                this.moveAIRealtime(ai);
                clock.remainingMs += clock.intervalMs;
                safety++;
            }
            clock.nextCell = this.computeAIMovement(ai);
        });
    }

    moveAIRealtime(ai) {
        const fromCell = ai.pos;
        const nextCell = this.computeAIMovement(ai);
        if (nextCell === null || nextCell === fromCell) return false;
        ai.pos = nextCell;
        this.realtimeEdges.ai[ai.id] = {
            from: fromCell,
            to: nextCell,
            remainingMs: Math.min(420, this.getAIRealtimeIntervalMs(ai) * 0.35),
            durationMs: Math.min(420, this.getAIRealtimeIntervalMs(ai) * 0.35)
        };
        this.recordEvent('aiMove', {
            aiId: ai.id,
            aiType: ai.type,
            aiState: ai.state,
            from: fromCell,
            to: nextCell,
            stepIndex: 1,
            stepBudget: 1,
            distanceBefore: this.distanceBetween(fromCell, this.playerPos),
            distanceAfter: this.distanceBetween(nextCell, this.playerPos),
            target: this.getAIPreviewTarget({ ...ai })
        });
        this.playFeel(ai.type === 'guardian' && ai.state === 'rage' ? 'guardianRage' : 'enemyStep');
        if (typeof window !== 'undefined' && window.renderEngine) {
            if (this.isBridgeStep(fromCell, nextCell) && window.renderEngine.animateBridgeTransit) {
                window.renderEngine.animateBridgeTransit('ai', ai.id, fromCell, nextCell);
            } else {
                window.renderEngine.moveAI(ai.id, nextCell);
            }
            window.renderEngine.spawnCellPulse(nextCell, ai.color || '#ff0055', 0.75);
        }
        if (this.beaconCell !== null && nextCell === this.beaconCell) {
            this.recordEvent('beaconTriggered', { at: this.beaconCell, aiId: ai.id, aiType: ai.type });
            this.playFeel('beaconTrigger');
            this.beaconCell = null;
            this.beaconTTL = 0;
            this.showFeel('诱饵被吃掉了', 'warn');
            if (typeof window !== 'undefined' && window.renderEngine) window.renderEngine.spawnEntities3D();
        }
        this.checkCollisions();
        this.updateUI();
        return true;
    }

    snapRealtimeEntitiesToGrid(reason = 'stun') {
        if (!this.realtimeMode) return;
        this.playerCooldownRemaining = 0;
        this.bufferedMoveCell = null;
        this.playerLastPos = this.playerPos;
        this.realtimeEdges.player = null;
        this.ais = this.ais.map(ai => ({ ...ai, lastPos: ai.pos }));
        this.realtimeEdges.ai = {};
        if (typeof window !== 'undefined' && window.renderEngine) {
            window.renderEngine.movePlayer(this.playerPos);
            this.ais.forEach(ai => window.renderEngine.moveAI(ai.id, ai.pos));
            if (reason === 'break') window.renderEngine.spawnCellPulse(this.playerPos, '#ffb700', 0.42);
        }
    }

    checkRealtimeCollisions() {
        if (this.gameState !== 'playing') return;
        const crossing = this.ais.find(ai => {
            const aiEdge = this.realtimeEdges.ai?.[ai.id];
            const playerEdge = this.realtimeEdges.player;
            return aiEdge && playerEdge
                && aiEdge.from === playerEdge.to
                && aiEdge.to === playerEdge.from;
        });
        if (crossing) {
            this.triggerGameOver(crossing);
            return;
        }

        if (typeof window !== 'undefined' && window.renderEngine?.getRealtimeEntityDistance) {
            const caught = this.ais.find(ai => {
                const distance = window.renderEngine.getRealtimeEntityDistance(ai.id);
                return Number.isFinite(distance) && distance < 0.8;
            });
            if (caught) {
                this.triggerGameOver(caught);
                return;
            }
        }

        this.checkCollisions();
    }

    getRealtimeVisualState() {
        const precision = Math.max(0, Math.min(2, Number(
            typeof window !== 'undefined' ? window.dawnCubeSettings?.precision : 1
        )));
        const format = (ms) => {
            const seconds = Math.max(0, ms || 0) / 1000;
            return precision === 0 ? String(Math.ceil(seconds)) : seconds.toFixed(precision);
        };
        const playerProgress = 1 - (this.playerCooldownRemaining / this.playerMoveCooldownMs);
        return {
            player: {
                remainingMs: this.playerCooldownRemaining,
                progress: Math.max(0, Math.min(1, playerProgress)),
                label: this.playerCooldownRemaining > 0 ? format(this.playerCooldownRemaining) : 'GO'
            },
            ais: this.ais.map(ai => {
                const clock = this.realtimeAIClocks[ai.id] || {
                    intervalMs: this.getAIRealtimeIntervalMs(ai),
                    remainingMs: this.getAIRealtimeIntervalMs(ai),
                    nextCell: this.computeAIMovement(ai)
                };
                const progress = 1 - (clock.remainingMs / Math.max(1, clock.intervalMs));
                return {
                    id: ai.id,
                    color: ai.color || '#ff0055',
                    remainingMs: clock.remainingMs,
                    intervalMs: clock.intervalMs,
                    progress: Math.max(0, Math.min(1, progress)),
                    label: format(clock.remainingMs),
                    nextCell: clock.nextCell
                };
            })
        };
    }

    appendPathCell(targetId) {
        if (this.gameState !== 'playing') return;
        if (this.playerAP <= 0) {
            this.playFeel('invalid');
            this.showFeel('行动点不足，先确认或结束回合', 'warn');
            return;
        }
        if (targetId === null || targetId === undefined) return;
        if (!this.isWalkableForPlayer(targetId)) {
            this.playFeel('invalid');
            this.showFeel(this.isVoidCell(targetId) ? '这里是缺口，先铺补片' : '这个格子不能走', 'warn');
            return;
        }

        if (targetId === this.playerPos) {
            const hadPath = this.plannedPath.length > 0;
            this.clearPlannedPath();
            if (hadPath) this.showFeel('路线已清空', 'info');
            return;
        }

        const existingIndex = this.plannedPath.indexOf(targetId);
        if (existingIndex !== -1) {
            this.plannedPath = this.plannedPath.slice(0, existingIndex + 1);
            this.playFeel('routeUndo');
            this.showFeel('路线回退到已选格', 'info');
            this.syncPlannedPath();
            return;
        }

        const origin = this.plannedPath.length > 0
            ? this.plannedPath[this.plannedPath.length - 1]
            : this.playerPos;

        if (!this.isAdjacent(origin, targetId)) {
            if (this.tryAppendSkippedCell(origin, targetId)) return;
            this.playFeel('invalid');
            this.showFeel('路线必须连接相邻格', 'warn');
            return;
        }
        if (this.plannedPath.length >= this.playerAP) {
            this.playFeel('invalid');
            this.showFeel('本回合行动点已用完', 'warn');
            return;
        }

        const viaBridge = this.isBridgeStep(origin, targetId);
        this.plannedPath.push(targetId);
        this.playFeel('routeTick');
        if (viaBridge) {
            this.showFeel('传送门已接入路线', 'info');
        }
        this.syncPlannedPath();
    }

    tryAppendSkippedCell(origin, targetId) {
        const remainingAP = this.playerAP - this.plannedPath.length;
        if (remainingAP < 2) return false;

        const catchUpPath = this.findPath(origin, targetId);
        if (!catchUpPath || catchUpPath.length !== 3) return false;

        const [, skippedCell, finalCell] = catchUpPath;
        if (this.plannedPath.includes(skippedCell) || this.plannedPath.includes(finalCell)) {
            return false;
        }

        this.plannedPath.push(skippedCell, finalCell);
        this.playFeel('routeTick');
        const usedBridge = this.isBridgeStep(origin, skippedCell) || this.isBridgeStep(skippedCell, finalCell);
        this.showFeel(usedBridge ? '已补上传送后落点' : '已补上中间格', 'info');
        this.syncPlannedPath();
        return true;
    }

    syncPlannedPath() {
        if (window.renderEngine) {
            window.renderEngine.drawPlannedPath(this.plannedPath);
        }
        this.updateActionButtons();
        this.drawMinimap();
    }

    executePlannedPath() {
        if (this.plannedPath.length === 0 || this.playerAP <= 0) return;
        const finalCell = this.plannedPath[this.plannedPath.length - 1];
        if (this.isActivePatchCell(finalCell)) {
            this.playFeel('invalid');
            this.showFeel('补片只能踩过去，不能停在上面', 'warn', true);
            return;
        }

        if (this.maybeRefuseRoute()) {
            return;
        }

        this.pushHistory('move');
        this.playFeel('execute');
        this.showFeel(`发送路线：${this.plannedPath.length} 格`, 'good');
        const pathToExecute = [...this.plannedPath];
        const steps = pathToExecute.length;
        this.recordEvent('route', {
            from: this.playerPos,
            path: [...pathToExecute],
            steps
        });
        this.playerAP -= steps;
        this.plannedPath = [];
        this.lastInputCell = null;
        this.updateActionButtons();

        let delay = 0;
        pathToExecute.forEach(cellId => {
            setTimeout(() => {
                const fromCell = this.playerPos;
                this.playerLastPos = this.playerPos;
                this.playerPos = cellId;
                if (this.activePatchCells.has(fromCell)) {
                    this.activePatchCells.delete(fromCell);
                    this.recordEvent('patchBroken', { at: fromCell, afterStepTo: cellId });
                    this.playFeel('patchBreak');
                    if (window.renderEngine) {
                        window.renderEngine.spawnCellPulse(fromCell, '#8bdcff', 1.35);
                        window.renderEngine.spawnEntities3D();
                    }
                    this.showFeel('补片碎了，后路断开', 'warn');
                }
                const usedBridge = this.isBridgeStep(fromCell, cellId);
                this.recordEvent('playerMove', {
                    from: fromCell,
                    to: cellId,
                    remainingAP: this.playerAP,
                    usedBridge
                });
                this.playFeel(usedBridge ? 'bridgeStep' : 'playerStep');
                this.checkKeyCollection();
                this.checkCollisions();

                if (window.renderEngine) {
                    window.renderEngine.movePlayer(cellId);
                    window.renderEngine.drawPlannedPath([]);
                }
                this.updateUI();
            }, delay);
            delay += 250;
        });

        setTimeout(() => {
            if (this.playerAP === 0 && this.gameState === 'playing') {
                this.triggerAITurn();
            }
        }, delay + 100);
    }

    maybeRefuseRoute(options = {}) {
        const realtime = Boolean(options.realtime);
        const trust = Number.isFinite(this.trust) ? this.trust : 80;
        const refusalChance = Math.max(0, Math.min(0.3, (100 - trust) * 0.003));
        if (Math.random() >= refusalChance) return false;

        this.pushHistory(realtime ? 'realtimeRefusal' : 'refusal');
        const origin = this.playerPos;
        const threatCells = this.getThreatCells();
        const safeOptions = this.getNeighbors(origin)
            .filter(cellId => this.isWalkableForPlayer(cellId)
                && !this.ais.some(ai => ai.pos === cellId)
                && !threatCells.has(cellId));
        const shouldWander = safeOptions.length > 0 && Math.random() < 0.5;
        const target = shouldWander
            ? safeOptions[Math.floor(Math.random() * safeOptions.length)]
            : origin;

        if (realtime) {
            this.playerCooldownRemaining = Math.max(260, this.playerMoveCooldownMs * 0.55);
        } else {
            this.playerAP = Math.max(0, this.playerAP - 1);
        }
        this.plannedPath = [];
        this.lastInputCell = null;
        if (target !== origin) {
            this.playerLastPos = origin;
            this.playerPos = target;
            if (realtime) {
                this.realtimeEdges.player = {
                    from: origin,
                    to: target,
                    remainingMs: this.playerCooldownRemaining,
                    durationMs: this.playerCooldownRemaining
                };
            }
            if (window.renderEngine) {
                window.renderEngine.drawPlannedPath([]);
                window.renderEngine.movePlayer(target);
                window.renderEngine.spawnCellPulse(target, '#ffb700', 1.1);
            }
        } else if (window.renderEngine) {
            window.renderEngine.drawPlannedPath([]);
            window.renderEngine.spawnCellPulse(origin, '#ffb700', 0.85);
        }

        this.adjustTrust(-3, 'routeRefusal');
        this.recordEvent('routeRefused', {
            from: origin,
            to: target,
            wandered: target !== origin,
            trust: this.trust
        });
        this.playFeel('invalid');
        this.showFeel(target === origin
            ? 'E-7 犹豫了，路线被取消'
            : 'E-7 没照线走，局面偏移了',
            'warn',
            true);
        this.checkKeyCollection();
        this.checkCollisions();
        this.updateUI();
        if (!realtime && this.playerAP === 0 && this.gameState === 'playing') {
            this.triggerAITurn();
        }
        return true;
    }

    rotateLayer(axis, layerIdx, direction) {
        if (this.gameState !== 'playing') return;
        if (this.tutorialActive) {
            const step = this.activeTutorialSteps[this.currentTutorialStepIndex];
            if (step && step.type === 'twist') {
                if (axis === step.axis && layerIdx === step.layer && direction === step.direction) {
                    // Allowed
                } else {
                    this.playFeel?.('invalid');
                    this.showFeel?.('当前步骤强引导中。请按照指示进行空间旋转！', 'warn');
                    return;
                }
            } else {
                return;
            }
        }
        if (!this.rotationEnabled) {
            this.playFeel('invalid');
            this.showFeel('本关暂未引入旋转', 'warn', true);
            return;
        }
        if (!this.realtimeMode && this.playerAP < 1) {
            this.playFeel('invalid');
            this.showFeel('Twist 需要 1 AP', 'warn', true);
            return;
        }
        if (typeof window !== 'undefined' && window.renderEngine?.isAnimating) {
            this.playFeel('invalid');
            this.showFeel('空间还没锁定，等这一拧结束', 'warn', true);
            return;
        }

        const resumeRealtime = this.realtimeMode && !this.realtimePaused;
        if (this.realtimeMode) {
            this.snapRealtimeEntitiesToGrid('rotate');
            this.setRealtimePaused(true);
        }
        this.pushHistory('rotate');
        this.playFeel('rotateStart');
        this.showFeel(this.realtimeMode
            ? `空间折叠 ${axis}${layerIdx + 1}`
            : `旋转 ${axis} 轴第 ${layerIdx + 1} 层`, 'info');
        this.recordEvent('rotate', {
            axis,
            layer: layerIdx,
            direction,
            playerBefore: this.playerPos,
            keyBefore: this.keyPos,
            exitBefore: this.exitPos,
            trackerBefore: this.trackerCell
        });
        if (!this.realtimeMode) this.playerAP -= 1;
        this.rotationsUsed += 1;
        this.plannedPath = [];
        this.lastInputCell = null;

        const perm = this.rotationPermutations[axis][layerIdx][direction];
        const settle = () => {
            this.applyPermutation(perm);
            const rotateEvent = this.eventLog[this.eventLog.length - 1];
            if (rotateEvent && rotateEvent.type === 'rotate') {
                rotateEvent.playerAfter = this.playerPos;
                rotateEvent.keyAfter = this.keyPos;
                rotateEvent.exitAfter = this.exitPos;
                rotateEvent.trackerAfter = this.trackerCell;
            }
            this.checkKeyCollection();
            this.checkCollisions();
            this.updateUI();
            this.playFeel('rotateLock');
            this.showFeel('空间已锁定', 'info');
            if (window.renderEngine) {
                window.renderEngine.spawnEntities3D();
            }
            if (resumeRealtime && this.gameState === 'playing') {
                this.setRealtimePaused(false);
            }

            if (!this.realtimeMode && this.playerAP === 0 && this.gameState === 'playing') {
                this.triggerAITurn();
            }

            if (this.tutorialActive) {
                const step = this.activeTutorialSteps[this.currentTutorialStepIndex];
                if (step && step.type === 'twist') {
                    this.currentTutorialStepIndex++;
                    if (typeof window !== 'undefined' && window.updateTutorialUI) {
                        window.updateTutorialUI();
                    }
                }
            }
        };

        if (window.renderEngine) {
            window.renderEngine.drawPlannedPath([]);
            window.renderEngine.playRotateAnimation(axis, layerIdx, direction, settle);
        } else {
            settle();
        }
    }

    applyPermutation(perm) {
        this.playerLastPos = this.playerPos;
        this.playerPos = perm[this.playerPos];

        this.ais.forEach(ai => {
            ai.pos = perm[ai.pos];
            if (ai.guardPost !== null && ai.guardPost !== undefined) {
                ai.guardPost = perm[ai.guardPost];
            }
        });

        if (!this.hasKey && this.keyPos !== null) {
            this.keyPos = perm[this.keyPos];
        }
        if (this.exitPos !== null) {
            this.exitPos = perm[this.exitPos];
        }
        if (this.trackerCell !== null && this.trackerCell !== undefined) {
            this.trackerCell = perm[this.trackerCell];
        }
        this.bridges = this.bridges.map(link => ({
            a: perm[link.a],
            b: perm[link.b]
        }));
        this.voidCells = new Set([...this.voidCells].map(cellId => perm[cellId]));
        this.activePatchCells = new Set([...this.activePatchCells].map(cellId => perm[cellId]));
        if (this.beaconCell !== null && this.beaconCell !== undefined) {
            this.beaconCell = perm[this.beaconCell];
        }
    }

    triggerAITurn() {
        if (this.gameState !== 'playing') return;

        if (window.renderEngine) {
            window.renderEngine.drawPlannedPath([]);
        }

        let aiPromise = Promise.resolve();

        this.ais.forEach(ai => {
            aiPromise = aiPromise.then(() => new Promise(resolve => {
                let steps = this.getAIStepBudget(ai);
                const totalSteps = steps;
                let stepIndex = 0;

                const takeSingleStep = () => {
                    if (steps <= 0 || this.gameState !== 'playing') {
                        resolve();
                        return;
                    }

                    const fromCell = ai.pos;
                    const distanceBefore = this.distanceBetween(fromCell, this.playerPos);
                    const nextCell = this.computeAIMovement(ai);
                    if (nextCell !== null && nextCell !== ai.pos) {
                        ai.pos = nextCell;
                        stepIndex++;
                        this.recordEvent('aiMove', {
                            aiId: ai.id,
                            aiType: ai.type,
                            aiState: ai.state,
                            from: fromCell,
                            to: nextCell,
                            stepIndex,
                            stepBudget: totalSteps,
                            distanceBefore,
                            distanceAfter: this.distanceBetween(nextCell, this.playerPos),
                            target: this.getAIPreviewTarget({ ...ai })
                        });
                        if (ai.type === 'guardian' && ai.state === 'rage') {
                            this.playFeel('guardianRage');
                        } else if (ai.type === 'guardian' && ai.state === 'lure') {
                            this.playFeel('guardianLure');
                        } else {
                            this.playFeel('enemyStep');
                        }
                        if (window.renderEngine) {
                            window.renderEngine.moveAI(ai.id, nextCell);
                            window.renderEngine.spawnCellPulse(nextCell, ai.color || '#ff0055', 0.75);
                        }
                        if (this.beaconCell !== null && nextCell === this.beaconCell) {
                            this.recordEvent('beaconTriggered', { at: this.beaconCell, aiId: ai.id, aiType: ai.type });
                            this.playFeel('beaconTrigger');
                            this.beaconCell = null;
                            this.beaconTTL = 0;
                            this.showFeel('诱饵被吃掉了', 'warn');
                            if (window.renderEngine) window.renderEngine.spawnEntities3D();
                        }
                        this.checkCollisions();
                        this.updateUI();
                        steps--;
                        setTimeout(takeSingleStep, 250);
                    } else {
                        resolve();
                    }
                };

                takeSingleStep();
            }));
        });

        aiPromise.then(() => {
            if (this.gameState === 'playing') {
                if (this.beaconCell !== null && this.beaconTTL > 0) {
                    this.beaconTTL -= 1;
                    if (this.beaconTTL <= 0) {
                        this.recordEvent('beaconExpired', { at: this.beaconCell });
                        this.beaconCell = null;
                        if (window.renderEngine) window.renderEngine.spawnEntities3D();
                    }
                }
                this.turn++;
                this.playerAP = this.maxAP;
                this.updateUI();
            }
        });
    }

    computeAIMovement(ai) {
        const target = this.getAITarget(ai);
        const path = this.findPath(ai.pos, target, { actor: 'ai' });
        if (!path || path.length <= 1) return ai.pos;

        const nextCell = path[1];
        return this.isForbiddenForAI(ai, nextCell) ? ai.pos : nextCell;
    }

    getAIStepBudget(ai) {
        if (ai.type === 'guardian') {
            return this.hasKey ? 2 : 1;
        }
        return 2;
    }

    getAITarget(ai) {
        if (this.beaconCell !== null && this.beaconTTL > 0 && this.isWalkableForAI(this.beaconCell)) {
            ai.state = ai.type === 'guardian' ? 'lure' : 'bait';
            return this.beaconCell;
        }

        if (ai.type === 'guardian') {
            if (this.hasKey) {
                if (ai.aggro === 'guardDoor') {
                    ai.state = 'gate';
                    return this.exitPos ?? this.playerPos;
                }
                ai.state = 'rage';
                return this.playerPos;
            }

            if (this.keyPos === null) {
                ai.state = 'guard';
                return ai.pos;
            }

            const lastEvent = this.eventLog[this.eventLog.length - 1];
            const keyMovedByRotation = lastEvent?.type === 'rotate' &&
                lastEvent.keyBefore !== null &&
                lastEvent.keyAfter !== null &&
                lastEvent.keyBefore !== lastEvent.keyAfter;
            if (keyMovedByRotation) {
                ai.state = 'seekKey';
                return this.keyPos;
            }

            const playerFace = this.cells[this.playerPos].face;
            const keyFace = this.cells[this.keyPos].face;
            if (playerFace === keyFace) {
                ai.state = 'lure';
                return this.playerPos;
            }

            ai.state = 'guard';
            return this.keyPos;
        }

        if (ai.type === 'ambusher' && this.plannedPath.length > 0) {
            return this.plannedPath[this.plannedPath.length - 1];
        }

        ai.state = 'alert';
        return this.playerPos;
    }

    isForbiddenForAI(ai, cellId) {
        if (cellId === null || cellId === undefined) return true;
        if (!this.isWalkableForAI(cellId)) return true;
        if (!this.hasKey && this.keyPos !== null && cellId === this.keyPos) return true;
        if (this.exitPos !== null && cellId === this.exitPos) return true;
        return false;
    }

    previewAIMovement(ai, steps = null) {
        const ghost = { ...ai };
        const path = [];
        const previewSteps = steps ?? this.getAIStepBudget(ai);

        for (let i = 0; i < previewSteps; i++) {
            const target = this.getAIPreviewTarget(ghost);
            const nextPath = this.findPath(ghost.pos, target, { actor: 'ai' });
            const next = (nextPath && nextPath.length > 1) ? nextPath[1] : ghost.pos;
            if (this.isForbiddenForAI(ghost, next)) break;
            if (next === ghost.pos) break;
            ghost.pos = next;
            path.push(next);
        }

        return path;
    }

    getAIPreviewTarget(ai) {
        if (this.beaconCell !== null && this.beaconTTL > 0 && this.isWalkableForAI(this.beaconCell)) {
            return this.beaconCell;
        }

        if (ai.type === 'guardian') {
            if (this.hasKey) {
                return ai.aggro === 'guardDoor'
                    ? this.exitPos ?? this.playerPos
                    : this.playerPos;
            }
            if (this.keyPos === null) return ai.pos;
            if (this.cells[this.playerPos].face === this.cells[this.keyPos].face) {
                return this.playerPos;
            }
            return this.keyPos;
        }
        if (ai.type === 'ambusher' && this.plannedPath.length > 0) {
            return this.plannedPath[this.plannedPath.length - 1];
        }
        return this.playerPos;
    }

    getThreatCells() {
        const threatCells = new Set();
        this.ais.forEach(ai => {
            this.previewAIMovement(ai).forEach(cellId => threatCells.add(cellId));
        });
        return threatCells;
    }

    getRouteOrigin() {
        return this.plannedPath.length > 0
            ? this.plannedPath[this.plannedPath.length - 1]
            : this.playerPos;
    }

    getNextStepCandidates() {
        if (this.gameState !== 'playing' || this.playerAP <= 0) return new Set();
        if (this.plannedPath.length >= this.playerAP) return new Set();

        const origin = this.getRouteOrigin();
        return new Set(this.getNeighbors(origin));
    }

    checkKeyCollection() {
        if (!this.hasKey && this.keyPos !== null && this.playerPos === this.keyPos) {
            const guardianPressure = this.ais
                .filter(ai => ai.type === 'guardian')
                .map(ai => ({
                    aiId: ai.id,
                    pos: ai.pos,
                    distance: this.distanceBetween(ai.pos, this.playerPos),
                    beforeBudget: 1,
                    afterBudget: 2
                }));
            this.hasKey = true;
            const collectedKey = this.keyPos;
            this.keyPos = null;
            this.recordEvent('keyCollected', {
                at: collectedKey,
                guardianPressure
            });
            this.playFeel('key');
            this.showFeel('钥匙已取得，逃生门解锁', 'good', true);

            if (window.renderEngine) {
                window.renderEngine.collectKeyEffect(collectedKey);
                window.renderEngine.updateDoorState();
            }
        }
    }

    checkCollisions() {
        const caughtBy = this.ais.find(ai => ai.pos === this.playerPos);
        if (caughtBy) {
            this.triggerGameOver(caughtBy);
            return;
        }

        if (this.hasKey && this.playerPos === this.exitPos) {
            this.triggerVictory();
        }
    }

    buildFailureReview(caughtBy = null) {
        const recent = this.eventLog.slice(-14);
        const reversed = [...recent].reverse();
        const caughtCell = this.playerPos;
        const caughtName = caughtBy ? this.getAIName(caughtBy.type) : '威胁源';
        const lastAIMove = caughtBy
            ? reversed.find(event => event.type === 'aiMove' && event.aiId === caughtBy.id && event.to === caughtCell)
            : null;
        const lastPlayerMove = reversed.find(event => event.type === 'playerMove');
        const lastKey = reversed.find(event => event.type === 'keyCollected');
        const lastRotate = reversed.find(event => event.type === 'rotate');
        const points = [];

        if (lastPlayerMove) {
            points.push(`你最后把逃脱者从 ${this.describeCell(lastPlayerMove.from)} 带到 ${this.describeCell(lastPlayerMove.to)}。`);
        }

        if (lastKey && caughtBy?.type === 'guardian') {
            const guardianInfo = (lastKey.guardianPressure || []).find(item => item.aiId === caughtBy.id)
                || (lastKey.guardianPressure || [])[0];
            if (guardianInfo) {
                points.push(`钥匙拿到时，守钥者在 ${this.describeCell(guardianInfo.pos)}，离你 ${guardianInfo.distance} 格；拿钥匙后它每次能走 ${guardianInfo.afterBudget} 格。`);
            } else {
                points.push('钥匙拿到后，守钥者进入狂暴追击，每次行动会变成 2 格。');
            }
        }

        if (lastAIMove) {
            const before = lastAIMove.distanceBefore ?? '?';
            const after = lastAIMove.distanceAfter ?? '?';
            points.push(`${caughtName}这回合第 ${lastAIMove.stepIndex}/${lastAIMove.stepBudget} 步，从 ${this.describeCell(lastAIMove.from)} 走到 ${this.describeCell(lastAIMove.to)}，距离从 ${before} 格压到 ${after} 格。`);
        } else if (caughtBy) {
            points.push(`${caughtName}已经在 ${this.describeCell(caughtBy.pos)}；你移动或旋转后和它撞到同一格。`);
        }

        if (lastRotate) {
            points.push(`最近一次旋转是 ${lastRotate.axis} 轴第 ${lastRotate.layer + 1} 层 ${lastRotate.direction}，旋转后门、钥匙和敌人的相对位置都重新结算。`);
        }

        if (points.length === 0) {
            points.push('这次记录到的信息不多。先悔棋一步，观察敌人预告格怎么变化。');
        }

        let coachHeadline = `第 ${this.turn} 回合被 ${caughtName} 抓到。`;
        let coachNote = '下次先别急着走满 AP，留意敌人这一轮到底能走几格。';
        let cuteHeadline = `啊哦，第 ${this.turn} 回合被抓包了。`;
        let cuteNote = '悔一步吧，这局还能抢救一下。';

        if (lastAIMove) {
            coachHeadline = `${caughtName}不是突然出现的，它这一轮从 ${this.describeCell(lastAIMove.from)} 贴到了 ${this.describeCell(lastAIMove.to)}。`;
            coachNote = '下次看红色预告时，重点看“它这一轮会走几格”，不要只看自己能不能拿到目标。';
            cuteHeadline = `不是你手慢，是 ${caughtName} 这步贴得太近了。`;
            cuteNote = '先把距离留出来，再去拿钥匙或冲门，会稳很多。';
        }

        if (lastKey && caughtBy?.type === 'guardian') {
            coachHeadline = '钥匙拿到了，但守钥者离你太近了。';
            coachNote = '这类局面要先把守钥者拉远，或者先旋转拆位，再吃钥匙撤。';
            cuteHeadline = '钥匙是香的，但守钥者也醒了。';
            cuteNote = '下次先遛它一下，再回头拿钥匙。';
        }

        return {
            coachHeadline,
            cuteHeadline,
            points,
            coachNote,
            cuteNote
        };
    }

    escapeHtml(value) {
        return String(this.textOf(value))
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    textOf(value) {
        return typeof window !== 'undefined' && window.getText
            ? window.getText(value)
            : (value ?? '');
    }

    renderFailureAnalysis(tone = 'coach') {
        const analysisEl = document.getElementById('failure-analysis');
        if (!analysisEl || !this.lastFailure?.review) return;

        const review = this.lastFailure.review;
        const isCute = tone === 'cute';
        const headline = isCute ? review.cuteHeadline : review.coachHeadline;
        const note = isCute ? review.cuteNote : review.coachNote;
        const title = isCute ? '可爱陪练复盘' : '残局复盘';
        const points = review.points
            .map(point => `<li>${this.escapeHtml(point)}</li>`)
            .join('');

        analysisEl.innerHTML = `
            <h3>${this.escapeHtml(title)}</h3>
            <p>${this.escapeHtml(headline)}</p>
            <ul>${points}</ul>
            <p class="review-note">${this.escapeHtml(note)}</p>
        `;
    }

    triggerGameOver(caughtBy = null) {
        this.gameState = 'gameover';
        this.playFeel('failure');
        this.showFeel('被威胁源捕获', 'danger', true);
        if (window.renderEngine) {
            window.renderEngine.spawnCellPulse(this.playerPos, '#ff0055', 1.4);
        }
        const caughtName = caughtBy
            ? `AI #${caughtBy.id + 1} [${this.getAIName(caughtBy.type)}]`
            : '未知威胁源';
        const caughtState = caughtBy
            ? this.getAIStateLabel(caughtBy.state)
            : '捕获';
        const caughtCell = this.describeCell(this.playerPos);
        const review = this.buildFailureReview(caughtBy);

        this.lastFailure = {
            turn: this.turn,
            hasKey: this.hasKey,
            caughtBy: caughtName,
            caughtState,
            cell: caughtCell,
            review
        };
        this.adjustTrust(-10, 'gameOver');
        this.recordEvent('gameOver', {
            caughtBy: caughtName,
            caughtState,
            caughtCell: this.playerPos
        });

        document.getElementById('failure-summary').innerHTML = `
            <div><span>生存回合:</span><span class="s-val">${this.turn}</span></div>
            <div><span>钥匙状态:</span><span class="s-val">${this.hasKey ? '已取得' : '未取得'}</span></div>
            <div><span>捕获者:</span><span class="s-val">${caughtName}</span></div>
            <div><span>捕获位置:</span><span class="s-val">${caughtCell}</span></div>
            <div><span>敌人状态:</span><span class="s-val">${caughtState}</span></div>
        `;
        const analysisEl = document.getElementById('failure-analysis');
        const toggleBtn = document.getElementById('btn-toggle-analysis');
        if (analysisEl) analysisEl.classList.add('is-hidden');
        if (toggleBtn) toggleBtn.innerText = '查看残局复盘';
        const tone = document.getElementById('analysis-tone')?.value || 'coach';
        this.renderFailureAnalysis(tone);
        const undoBtn = document.getElementById('btn-gameover-undo');
        if (undoBtn) undoBtn.disabled = !this.canUndo();
        const catchSticker = document.getElementById('catch-sticker');
        if (catchSticker) {
            catchSticker.innerText = caughtBy?.type === 'guardian'
                ? '锁'
                : (caughtBy?.type === 'ambusher' ? '×' : '!');
        }
        const overlay = document.getElementById('gameover-overlay');
        if (overlay) {
            overlay.classList.remove('jump-alert', 'signal-lost');
            void overlay.offsetWidth;
            overlay.classList.add('active', 'signal-lost');
            setTimeout(() => overlay.classList.remove('signal-lost'), 900);
        }
        const container = document.getElementById('game-container');
        if (container) {
            container.classList.remove('glitch-capture');
            void container.offsetWidth;
            container.classList.add('glitch-capture');
            setTimeout(() => container.classList.remove('glitch-capture'), 820);
        }
        this.updateCompanionTerminal();
    }

    triggerVictory() {
        this.gameState = 'win';
        this.playFeel('victory');
        this.showFeel('逃生成功', 'good', true);
        const isActFinale = Boolean(this.currentLevel?.actFinale);
        this.recordEvent('victory', {
            actFinale: isActFinale,
            levelTitle: this.currentLevel?.title,
            rotationsUsed: this.rotationsUsed
        });
        const victoryMessage = document.getElementById('victory-message');
        const victoryTitle = document.querySelector('#victory-overlay .glitch-text');
        if (victoryTitle) {
            const title = isActFinale ? 'SIGNAL EXPANDED' : 'MISSION ACCOMPLISHED';
            victoryTitle.innerText = title;
            victoryTitle.dataset.text = title;
        }
        if (victoryMessage) {
            victoryMessage.innerText = isActFinale
                ? '门开了。坏消息：外面还有一个更大的立方体。'
                : '钥匙已取得，逃生门已开启，意识体安全撤离！';
        }
        document.getElementById('act-ending-comic')?.classList.toggle('is-hidden', !isActFinale);
        const victoryButton = document.querySelector('#victory-overlay .btn-restart');
        if (victoryButton) {
            victoryButton.innerText = isActFinale ? '进入第二幕' : '再接再厉';
        }
        const nextTrust = this.adjustTrust(3, 'victory');
        document.getElementById('victory-summary').innerHTML = `
            <div><span>通关回合:</span><span class="s-val">${this.turn}</span></div>
            <div><span>使用旋转:</span><span class="s-val">${this.rotationsUsed}</span></div>
            <div><span>信任值:</span><span class="s-val">${nextTrust}</span></div>
        `;
        const showVictoryOverlay = () => document.getElementById('victory-overlay')?.classList.add('active');
        if (isActFinale) {
            setTimeout(showVictoryOverlay, 1500);
        } else {
            showVictoryOverlay();
        }
        this.updateCompanionTerminal();
    }

    updateCompanionTerminal() {
        if (typeof window !== 'undefined' && window.commsController?.syncFromGame) {
            window.commsController.syncFromGame(this);
            return;
        }
        const statusEl = document.getElementById('companion-status');
        const bubbleEl = document.getElementById('companion-bubble');
        const commsLiveEl = document.getElementById('comms-live-line');
        const commsContextEl = document.getElementById('comms-context-line');
        if (!statusEl && !bubbleEl && !commsContextEl) return;

        let status = '信号稳定';
        let bubble = '我在。手机别收太久。';
        let liveLine = '我还在。你别突然消失。';

        if (this.gameState === 'gameover') {
            status = '信号抖了一下';
            bubble = '刚才那段可以假装没发生。';
            liveLine = '刚才那段我们可以假装没发生。';
        } else if (this.gameState === 'win') {
            status = '门已开启';
            bubble = this.currentLevel?.actFinale ? '出口还带下一层，挺礼貌。' : '这次算你带路成功。';
            liveLine = this.currentLevel?.actFinale
                ? '出口的意思原来是下一层入口。行，挺有礼貌。'
                : '门开了。我承认，这一步还行。';
        } else if (this.toolMode === 'patch') {
            status = '补片待铺';
            bubble = '可以补洞，但别让我停在上面。';
            liveLine = '可以补洞，但别让我停在上面。我对试用版地板没有信仰。';
        } else if (this.toolMode === 'beacon') {
            status = '诱饵待投';
            bubble = '骗谁？这题我喜欢。';
            liveLine = '骗谁？这题我喜欢。先声明，我没有说自己很坏。';
        } else if (this.plannedPath.length > 0) {
            status = '路线草稿';
            bubble = '线画好了？我先不发表意见。';
            liveLine = '线画好了？我先不发表意见，免得显得我很急。';
        } else if (this.hasKey) {
            status = '钥匙在手';
            bubble = '钥匙有了。现在可以稍微慌一下。';
            liveLine = '钥匙有了。现在可以稍微慌一下，但只准稍微。';
        } else if (this.ais.some(ai => ai.state === 'rage')) {
            status = '对面急了';
            bubble = '它急了。不是我说的。';
            liveLine = '它急了。不是我说的，是它自己跑两格的。';
        } else if (this.ais.length > 0) {
            status = '有人在追';
            bubble = '先看红格，别看我。';
            liveLine = '先看红格，别看我。我现在也不太想被看见。';
        } else if (this.turn === 0) {
            status = '等待指令';
            bubble = '盯——';
            liveLine = '盯——';
        }

        if (statusEl) statusEl.innerText = status;
        if (bubbleEl) bubbleEl.innerText = bubble;
        if (typeof window !== 'undefined' && window.renderEngine?.setPlayerSpeechBubble) {
            window.renderEngine.setPlayerSpeechBubble(bubble, this.gameState === 'gameover' ? 'danger' : 'info');
        }
        if (commsLiveEl && this.gameState !== 'playing') {
            commsLiveEl.innerText = liveLine;
        }
        if (commsContextEl && this.currentLevel) {
            commsContextEl.innerText = `${this.currentLevel.title} · ${this.currentLevel.chapter}。需要聊天就点通讯；要活命就在 3D 魔方上画稳。`;
        }
    }

    getTutorialHelperCopy() {
        const levelId = this.currentLevel?.id || `L${String(this.currentLevelIndex + 1).padStart(2, '0')}`;
        const copies = {
            L01: ['直接点下一格', '点 Dawn 周围发亮的格子，她会立刻走过去。别连点太猛，她会卡壳。'],
            L02: ['钥匙先于出口', '先踩钥匙，再进门。门亮绿才算能回家。'],
            L03: ['红格不是装饰', '红色威胁格代表下一轮会被贴近，别把 Dawn 送进去。'],
            L04: ['空间折叠', 'Shift 进入 Twist，拖一层魔方，让目标换到能走的位置。'],
            L05: ['钥匙也会动', '钥匙会跟着层旋转。先拧局，再点格。'],
            L07: ['主动碎解', '碎解敌人的必经格，切断追捕路线。不要拆自己的脚下。'],
            L13: ['更大的外壳', '4x4 不是更远而已，它给道具和敌人更多绕法。'],
            L21: ['临时补片', '补片只能踩一次。走过后碎掉，也能帮你甩掉追击。'],
            L23: ['诱饵信标', '把敌人引向空格，换来一回合喘息。'],
            L29: ['补片不是桥梁皮肤', '没有补片就进不了孤岛；用了以后要立刻撤。']
        };
        const fallback = [
            this.currentLevel?.tutorial?.goal || this.getCurrentGoalText(),
            this.currentLevel?.tutorial?.tip || '看清敌人下一步，再决定路线。'
        ];
        const [title, body] = copies[levelId] || fallback;
        return {
            levelId,
            title,
            body,
            icon: this.currentLevel?.tutorial?.icon || '➜'
        };
    }

    updateTutorialHelper() {
        if (this.tutorialActive) {
            if (typeof window !== 'undefined' && window.updateTutorialUI) {
                window.updateTutorialUI();
            }
            return;
        }
        const card = document.getElementById('tutorial-helper-card');
        if (!card || !this.currentLevel) return;
        const copy = this.getTutorialHelperCopy();
        const dismissed = typeof localStorage !== 'undefined' &&
            localStorage.getItem(`dawnCubeTutorialDismissed:${copy.levelId}`) === 'true';
        const iconEl = document.getElementById('tutorial-helper-icon');
        const titleEl = document.getElementById('tutorial-helper-title');
        const bodyEl = document.getElementById('tutorial-helper-body');
        if (iconEl) iconEl.innerText = copy.icon;
        if (titleEl) titleEl.innerText = copy.title;
        if (bodyEl) bodyEl.innerText = copy.body;
        card.dataset.levelId = copy.levelId;
        const shouldShow = !dismissed && !this.tutorialInputDismissed && this.gameState === 'playing';
        card.classList.toggle('is-hidden', !shouldShow);
        if (this.realtimeMode && shouldShow) {
            this.setRealtimePaused(true);
        }
    }

    updateUI() {
        const levelTitle = document.getElementById('current-level-title');
        const levelGoal = document.getElementById('current-level-goal');
        const routeTip = document.getElementById('route-tip');
        const tutorialSticker = document.getElementById('tutorial-sticker');
        const tutorialCue = document.getElementById('tutorial-cue');
        const tutorial = this.currentLevel?.tutorial || {};
        if (levelTitle && this.currentLevel) {
            levelTitle.innerText = `${this.textOf(this.currentLevel.title)} · ${this.textOf(this.currentLevel.chapter)}`;
        }
        if (levelGoal && this.currentLevel) {
            levelGoal.innerText = this.getCurrentGoalText();
        }
        if (tutorialSticker) {
            tutorialSticker.innerText = tutorial.icon || '➜';
        }
        if (tutorialCue) {
            tutorialCue.innerText = this.textOf(tutorial.cue) || '看图行动';
        }
        if (routeTip) {
            routeTip.innerText = this.getCurrentRouteTip();
        }
        this.updateTutorialHelper();

        const turnCountEl = document.getElementById('turn-count');
        const apDisplayEl = document.getElementById('ap-display');
        const apBarEl = document.getElementById('ap-bar-fill');
        if (turnCountEl) turnCountEl.innerText = this.realtimeMode ? 'RT' : this.turn;
        if (apDisplayEl) {
            apDisplayEl.innerText = this.realtimeMode
                ? (this.playerCooldownRemaining > 0
                    ? `${(this.playerCooldownRemaining / 1000).toFixed(1)}s`
                    : 'READY')
                : `${this.playerAP} / ${this.maxAP}`;
        }
        if (apBarEl) {
            const fill = this.realtimeMode
                ? (1 - this.playerCooldownRemaining / this.playerMoveCooldownMs)
                : (this.playerAP / this.maxAP);
            apBarEl.style.width = `${Math.max(0, Math.min(1, fill)) * 100}%`;
        }
        document.getElementById('rotation-charge').innerText = '1 AP';
        document.getElementById('trust-display') && (document.getElementById('trust-display').innerText = this.trust);
        document.getElementById('console-trust-display') && (document.getElementById('console-trust-display').innerText = this.trust);
        document.getElementById('console-rotation-display') && (document.getElementById('console-rotation-display').innerText = this.rotationsUsed);
        document.getElementById('console-turn-display') && (document.getElementById('console-turn-display').innerText = this.realtimeMode ? '实时' : this.turn);
        document.getElementById('console-ap-display') && (document.getElementById('console-ap-display').innerText = this.realtimeMode ? '移动 CD' : `${this.playerAP} / ${this.maxAP}`);
        document.getElementById('esc-level-title') && (document.getElementById('esc-level-title').innerText = this.textOf(this.currentLevel?.title) || '当前残局');
        document.getElementById('esc-level-desc') && (document.getElementById('esc-level-desc').innerText = this.textOf(this.currentLevel?.concept) || this.getCurrentGoalText());

        const hasRotation = this.rotationEnabled;
        const hasThreats = this.ais.length > 0;
        const hasTracker = this.trackingEnabled;
        const hasTools = this.patchCharges > 0 || this.beaconCharges > 0 || this.breakCharges > 0 || this.activePatchCells.size > 0 || this.beaconCell !== null;
        document.getElementById('rotation-status')?.classList.toggle('is-hidden', !hasRotation);
        document.getElementById('rotation-budget-hint')?.classList.toggle('is-hidden', !hasRotation);
        document.getElementById('rotation-section')?.classList.toggle('is-hidden', !hasRotation);
        document.getElementById('rotation-preview-chip')?.classList.toggle('is-hidden', !hasRotation);
        document.getElementById('tracker-section')?.classList.toggle('is-hidden', !hasTracker);
        document.getElementById('tool-section')?.classList.toggle('is-hidden', !hasTools);
        document.getElementById('patch-count') && (document.getElementById('patch-count').innerText = this.patchCharges);
        document.getElementById('beacon-count') && (document.getElementById('beacon-count').innerText = this.beaconCharges);
        document.getElementById('break-count') && (document.getElementById('break-count').innerText = this.breakCharges);
        document.querySelectorAll('[data-tool-mode]').forEach(btn => {
            const mode = btn.dataset.toolMode;
            btn.classList.toggle('active', this.toolMode === mode);
            if (mode === 'patch') btn.disabled = this.patchCharges <= 0;
            if (mode === 'beacon') btn.disabled = this.beaconCharges <= 0;
            if (mode === 'break') btn.disabled = this.breakCharges <= 0;
            if (mode === 'route') btn.disabled = false;
        });
        const axisEl = document.getElementById('rotate-axis');
        const layerEl = document.getElementById('rotate-layer');
        const rotationPreviewChip = document.getElementById('rotation-preview-chip');
        if (rotationPreviewChip && axisEl && layerEl) {
            const layerText = layerEl.selectedOptions?.[0]?.textContent?.replace(/\s+/g, ' ') || `第 ${Number(layerEl.value || 0) + 1} 层`;
            rotationPreviewChip.innerText = `${axisEl.value || 'X'} 轴 · ${layerText} · ↻ / ↺`;
        }
        const trackerStatusChip = document.getElementById('tracker-status-chip');
        const trackerToggleBtn = document.getElementById('btn-toggle-tracker');
        const trackerClearBtn = document.getElementById('btn-clear-tracker');
        if (trackerStatusChip) {
            trackerStatusChip.innerText = this.trackerCell !== null && this.trackerCell !== undefined
                ? `标记 ${this.describeCell(this.trackerCell)}`
                : (this.trackerMode ? '点 3D 格标记' : '未标记');
            trackerStatusChip.classList.toggle('is-active', this.trackerCell !== null && this.trackerCell !== undefined);
            trackerStatusChip.classList.toggle('is-picking', this.trackerMode);
        }
        if (trackerToggleBtn) {
            trackerToggleBtn.innerText = this.trackerMode ? '取消标记' : '放置标记';
            trackerToggleBtn.classList.toggle('is-active', this.trackerMode);
        }
        if (trackerClearBtn) {
            trackerClearBtn.disabled = this.trackerCell === null || this.trackerCell === undefined;
        }
        document.getElementById('btn-confirm-path')?.classList.toggle('is-hidden', this.realtimeMode);
        const endTurnBtn = document.getElementById('btn-end-turn');
        endTurnBtn?.classList.toggle('is-hidden', !hasThreats && !this.realtimeMode);
        if (endTurnBtn) {
            endTurnBtn.innerText = this.realtimeMode ? '待命' : (window.t?.('phone.skip') || '跳过');
        }
        document.getElementById('threat-panel')?.classList.toggle('is-hidden', !hasThreats);

        const keyText = document.getElementById('obj-key-text');
        const keyDot = document.getElementById('obj-key-dot');
        const exitText = document.getElementById('obj-exit-text');
        const exitDot = document.getElementById('obj-exit-dot');

        if (keyText && keyDot) {
            keyText.innerText = this.hasKey
                ? (window.currentLang === 'en' ? 'Key: secured' : '钥匙状态: 已取得')
                : (window.t?.('console.key') || '钥匙状态: 未取得');
            keyText.classList.toggle('text-neon-yellow', !this.hasKey);
            keyText.classList.toggle('text-neon-green', this.hasKey);
            keyDot.className = this.hasKey ? 'obj-dot active-green' : 'obj-dot active-yellow';
        }

        if (exitText && exitDot) {
            exitText.innerText = this.hasKey
                ? (window.currentLang === 'en' ? 'Exit: open' : '逃生门: 已解锁')
                : (window.t?.('console.exit') || '逃生门: 需要钥匙');
            exitText.classList.toggle('text-neon-green', this.hasKey);
            exitDot.className = this.hasKey ? 'obj-dot active-green' : 'obj-dot';
        }

        const aiListEl = document.getElementById('ai-status-list');
        aiListEl.innerHTML = '';
        this.ais.forEach(ai => this.getAITarget(ai));
        if (window.audioFeedback) {
            const hasRage = this.ais.some(ai => ai.state === 'rage');
            const hasThreat = this.ais.some(ai => ai.state === 'alert' || ai.state === 'lure' || ai.state === 'gate');
            window.audioFeedback.setTension(this.gameState === 'playing'
                ? (hasRage ? 'rage' : (hasThreat ? 'danger' : 'calm'))
                : 'calm');
        }
        this.ais.forEach(ai => {
            const row = document.createElement('div');
            row.className = `ai-status-row ${ai.type}`;

            const nameSpan = document.createElement('span');
            nameSpan.innerText = `AI #${ai.id + 1} [${this.getAIName(ai.type)}]`;

            const intentSpan = document.createElement('span');
            const stateClass = ai.state === 'guard' || ai.state === 'gate'
                ? 'patrol'
                : (ai.state === 'rage' ? 'rage' : (ai.state === 'lure' ? 'lure' : 'alert'));
            intentSpan.className = `ai-state ${stateClass}`;
            const preview = this.previewAIMovement(ai, 1)[0];
            const stateLabel = this.getAIStateLabel(ai.state);
            intentSpan.innerText = preview !== undefined
                ? `${stateLabel}: ${this.describeCell(preview)}`
                : `${stateLabel}: 原地`;

            row.appendChild(nameSpan);
            row.appendChild(intentSpan);
            aiListEl.appendChild(row);
        });

        if (window.renderEngine && window.renderEngine.updateDoorState) {
            window.renderEngine.updateDoorState();
        }

        this.updateActionButtons();
        this.drawMinimap();
        this.updateCompanionTerminal();

        if (window.renderEngine && !hasRotation && window.renderEngine.clearLayerHighlight) {
            window.renderEngine.clearLayerHighlight();
        } else if (window.renderEngine && window.renderEngine.highlightLayer) {
            const axisEl = document.getElementById('rotate-axis');
            const layerEl = document.getElementById('rotate-layer');
            if (axisEl && layerEl && layerEl.value !== '') {
                window.renderEngine.highlightLayer(axisEl.value, parseInt(layerEl.value, 10));
            }
        }
    }

    getCurrentGoalText() {
        if (this.gameState === 'win') return '已逃离。可以回到选关继续下一组残局。';
        if (this.gameState === 'gameover') return '这一步被抓了。可以悔棋，或者展开残局复盘看距离怎么被压近。';
        const tutorialGoal = this.textOf(this.currentLevel?.tutorial?.goal);
        if (tutorialGoal) return tutorialGoal;
        if (!this.hasKey && this.keyPos !== null) {
            return `先去 ${this.describeCell(this.keyPos)} 取钥匙，再撤到 ${this.describeCell(this.exitPos)}。`;
        }
        return `钥匙已到手，撤到 ${this.describeCell(this.exitPos)}。`;
    }

    getCurrentRouteTip() {
        const tutorialTip = this.textOf(this.currentLevel?.tutorial?.tip);
        if (this.toolMode === 'patch') {
            return '点黑色缺口铺补片。E-7 可以踩过去一次，但不能停在上面。';
        }
        if (this.toolMode === 'beacon') {
            return '点任意空地放诱饵。敌人会按正常路线被吸引过去。';
        }
        if (this.toolMode === 'break') {
            return '点非关键格碎解。它会立刻变成缺口，阻断追击路线。';
        }
        if (this.trackerMode) {
            return '标记模式：点一格标记。蓝圈仍是下一步可走格。';
        }
        if (this.plannedPath.length > 0) {
            const end = this.plannedPath[this.plannedPath.length - 1];
            return `路线终点：${this.describeCell(end)}。确认前可以继续拖，也可以点已选格回退。`;
        }
        if (this.trackerCell !== null && this.trackerCell !== undefined) {
            return `标记在 ${this.describeCell(this.trackerCell)}。它只帮你记格，不会自动走路。`;
        }
        if (tutorialTip) return tutorialTip;
        if (this.rotationEnabled && this.playerAP >= 2) {
            return '3D 表面负责走路；按 Shift 进入 Twist 模式，拖拽表面拧动当前层。';
        }
        if (this.ais.length > 0) {
            return '蓝色是下一步可走格，红色是敌人本轮会压到的位置。先看红，再点格。';
        }
        return '按住 3D 魔方表面拖过相邻格，手机里会生成路线指令。';
    }

    getAIName(type) {
        if (type === 'guardian') return '守钥者';
        if (type === 'ambusher') return '伏击者';
        return '追击者';
    }

    getAIStateLabel(state) {
        if (state === 'guard') return '守路';
        if (state === 'lure') return '引诱追击';
        if (state === 'rage') return '狂暴追击';
        if (state === 'gate') return '守门';
        if (state === 'seekKey') return '找钥匙';
        if (state === 'bait') return '被诱导';
        if (state === 'alert') return '追击';
        return '待机';
    }

    describeCell(cellId) {
        const cell = this.cells[cellId];
        if (!cell) return '未知格';
        const faceColorNames = {
            0: '蓝',
            1: '紫',
            2: '橙',
            3: '红',
            4: '绿',
            5: '黄'
        };
        const cols = 'abcdefghijklmnopqrstuvwxyz';
        return `${faceColorNames[cell.face] || this.faceLabels[cell.face]}${cols[cell.col] || cell.col + 1}${cell.row + 1}`;
    }

    updateActionButtons() {
        const confirmBtn = document.getElementById('btn-confirm-path');
        const undoBtn = document.getElementById('btn-undo');
        if (!confirmBtn) return;

        const finalCell = this.plannedPath[this.plannedPath.length - 1];
        const endsOnPatch = this.plannedPath.length > 0 && this.isActivePatchCell(finalCell);
        confirmBtn.disabled = this.realtimeMode || this.plannedPath.length === 0 || this.playerAP <= 0 || endsOnPatch;
        confirmBtn.innerText = this.realtimeMode
            ? '直控中'
            : (this.plannedPath.length > 0
            ? (endsOnPatch ? '别停补片' : `发送 ${this.plannedPath.length}AP`)
            : '发送路线');
        const previewEl = document.getElementById('route-command-preview');
        if (previewEl) {
            const commandCells = [this.playerPos, ...this.plannedPath]
                .map(cellId => this.describeCell(cellId));
            previewEl.innerText = this.realtimeMode
                ? `当前位置：${this.describeCell(this.playerPos)} · 蓝圈=下一步可走`
                : (this.plannedPath.length > 0
                ? `走向：${commandCells.join(' -> ')}`
                : '走向：未规划');
        }

        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
        }

        const gameoverUndoBtn = document.getElementById('btn-gameover-undo');
        if (gameoverUndoBtn) {
            gameoverUndoBtn.disabled = !this.canUndo();
        }
    }

    drawMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const N = this.N;
        const cols = 4 * N;
        const rows = 3 * N;
        const padding = 18;
        const cellSize = Math.floor(Math.min(
            (canvas.width - padding * 2) / cols,
            (canvas.height - padding * 2) / rows
        ));
        const offsetX = Math.floor((canvas.width - cols * cellSize) / 2);
        const offsetY = Math.floor((canvas.height - rows * cellSize) / 2);

        const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
        this.minimapGrid = grid;
        this.minimapMetrics = { cols, rows, cellSize, offsetX, offsetY };

        Object.entries(this.netLayout).forEach(([faceKey, origin]) => {
            const face = parseInt(faceKey, 10);
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    grid[origin.y * N + r][origin.x * N + c] = this.cellId(face, r, c);
                }
            }
        });

        const threatCells = this.getThreatCells();
        const nextStepCells = this.getNextStepCandidates();
        const pathCells = new Set(this.plannedPath);
        const plannedEndpoint = this.plannedPath.length > 0
            ? this.plannedPath[this.plannedPath.length - 1]
            : this.playerPos;

        Object.entries(this.netLayout).forEach(([faceKey, origin]) => {
            const face = parseInt(faceKey, 10);
            const x = offsetX + origin.x * N * cellSize;
            const y = offsetY + origin.y * N * cellSize;

            const faceGradient = ctx.createLinearGradient(x, y, x + N * cellSize, y + N * cellSize);
            faceGradient.addColorStop(0, this.hexToRgba(this.faceColors[face], 0.22));
            faceGradient.addColorStop(1, this.hexToRgba(this.faceColors[face], 0.08));
            ctx.fillStyle = faceGradient;
            ctx.strokeStyle = this.hexToRgba(this.faceColors[face], 0.82);
            ctx.lineWidth = 2.4;
            ctx.fillRect(x, y, N * cellSize, N * cellSize);
            ctx.strokeRect(x + 0.5, y + 0.5, N * cellSize - 1, N * cellSize - 1);

            ctx.fillStyle = this.hexToRgba(this.faceColors[face], 0.9);
            ctx.font = 'bold 11px Orbitron, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`${this.faceMarks[face]} ${this.faceLabels[face]} ${this.faceNames[face]}`, x + 4, y + 4);
        });

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const id = grid[y][x];
                if (id === null) continue;

                const drawX = offsetX + x * cellSize;
                const drawY = offsetY + y * cellSize;
                const cell = this.cells[id];
                const isVoid = this.isVoidCell(id);
                const isPatch = this.isActivePatchCell(id);

                ctx.fillStyle = this.hexToRgba(this.faceColors[cell.face], 0.09);
                ctx.strokeStyle = this.hexToRgba(this.faceColors[cell.face], 0.2);
                ctx.lineWidth = 1;

                if (isVoid && !isPatch) {
                    ctx.fillStyle = 'rgba(2, 4, 8, 0.94)';
                    ctx.strokeStyle = 'rgba(139, 220, 255, 0.32)';
                    ctx.lineWidth = 1.5;
                } else if (isPatch) {
                    ctx.fillStyle = 'rgba(139, 220, 255, 0.24)';
                    ctx.strokeStyle = '#8bdcff';
                    ctx.lineWidth = 1.8;
                }

                if (nextStepCells.has(id)) {
                    ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
                    ctx.strokeStyle = '#00f0ff';
                    ctx.lineWidth = 1.5;
                }
                if (threatCells.has(id)) {
                    ctx.fillStyle = 'rgba(255, 0, 85, 0.22)';
                    ctx.strokeStyle = 'rgba(255, 0, 85, 0.5)';
                }
                if (pathCells.has(id)) {
                    ctx.fillStyle = 'rgba(0, 255, 136, 0.28)';
                    ctx.strokeStyle = '#00ff88';
                }
                if (id === plannedEndpoint && this.plannedPath.length > 0) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                }

                ctx.fillRect(drawX, drawY, cellSize - 1, cellSize - 1);
                ctx.strokeRect(drawX + 0.5, drawY + 0.5, cellSize - 1, cellSize - 1);
                if (isVoid && !isPatch) {
                    this.drawVoidCellOnMap(ctx, drawX, drawY, cellSize);
                } else if (isPatch) {
                    this.drawPatchCellOnMap(ctx, drawX, drawY, cellSize);
                }
                if (!isVoid && cell.row === Math.floor(N / 2) && cell.col === Math.floor(N / 2)) {
                    this.drawMinimapCellPattern(ctx, cell.face, drawX, drawY, cellSize, true);
                }

                if (nextStepCells.has(id) && !pathCells.has(id)) {
                    ctx.strokeStyle = '#00f0ff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(drawX + cellSize / 2, drawY + cellSize / 2, Math.max(4, cellSize * 0.25), 0, Math.PI * 2);
                    ctx.stroke();
                }

                ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
                ctx.font = '8px Inter, sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`${cell.row + 1}${cell.col + 1}`, drawX + cellSize - 3, drawY + cellSize - 2);
            }
        }

        this.drawPlannedPathOnMap(ctx, cellSize, offsetX, offsetY);
        this.drawBridgeLinks(ctx, cellSize, offsetX, offsetY);
        this.drawToolTargets(ctx, cellSize, offsetX, offsetY);
        this.drawTutorialCues(ctx, cellSize, offsetX, offsetY);
        this.drawTrackerMarker(ctx, cellSize, offsetX, offsetY);
        this.drawMapEntities(ctx, cellSize, offsetX, offsetY);
    }

    drawVoidCellOnMap(ctx, x, y, size) {
        ctx.save();
        ctx.strokeStyle = 'rgba(139, 220, 255, 0.62)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#8bdcff';
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.22, y + size * 0.18);
        ctx.lineTo(x + size * 0.8, y + size * 0.78);
        ctx.moveTo(x + size * 0.78, y + size * 0.18);
        ctx.lineTo(x + size * 0.18, y + size * 0.82);
        ctx.stroke();
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x + size * 0.18, y + size * 0.18, size * 0.64, size * 0.64);
        ctx.restore();
    }

    drawPatchCellOnMap(ctx, x, y, size) {
        ctx.save();
        ctx.fillStyle = 'rgba(139, 220, 255, 0.35)';
        ctx.strokeStyle = '#8bdcff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#8bdcff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.22, y + size * 0.28);
        ctx.lineTo(x + size * 0.72, y + size * 0.18);
        ctx.lineTo(x + size * 0.82, y + size * 0.72);
        ctx.lineTo(x + size * 0.32, y + size * 0.84);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawToolTargets(ctx, cellSize, offsetX, offsetY) {
        if (this.toolMode === 'patch' && this.patchCharges > 0) {
            this.voidCells.forEach(cellId => {
                if (!this.isActivePatchCell(cellId)) {
                    this.drawTargetRing(ctx, cellId, '#8bdcff', cellSize, offsetX, offsetY);
                    this.drawMapSticker(ctx, cellId, '+', '#8bdcff', cellSize, offsetX, offsetY);
                }
            });
        }

        if (this.toolMode === 'beacon' && this.beaconCharges > 0) {
            this.cells.forEach(cell => {
                if (this.isLegalBeaconTarget(cell.id)) {
                    const center = this.getMinimapCellCenter(cell.id, cellSize, offsetX, offsetY);
                    if (!center) return;
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 183, 0, 0.52)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, Math.max(4, cellSize * 0.18), 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        }

        if (this.beaconCell !== null) {
            this.drawTargetRing(ctx, this.beaconCell, '#ffb700', cellSize, offsetX, offsetY);
            this.drawMapSticker(ctx, this.beaconCell, '诱', '#ffb700', cellSize, offsetX, offsetY);
        }

        if (this.toolMode === 'break' && this.breakCharges > 0) {
            this.cells.forEach(cell => {
                if (this.isLegalBreakTarget(cell.id)) {
                    this.drawTargetRing(ctx, cell.id, '#ff0055', cellSize, offsetX, offsetY);
                    this.drawMapSticker(ctx, cell.id, '碎', '#ff0055', cellSize, offsetX, offsetY);
                }
            });
        }
    }

    drawMinimapCellPattern(ctx, face, x, y, size, badge = false) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        const r = Math.max(3.5, size * (badge ? 0.28 : 0.16));

        ctx.save();
        ctx.strokeStyle = badge ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.42)';
        ctx.fillStyle = badge ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.42)';
        ctx.lineWidth = badge ? 2.4 : 1.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (face === 0) {
            ctx.beginPath();
            ctx.moveTo(cx - r * 1.25, cy + r * 0.65);
            ctx.lineTo(cx, cy - r * 1.05);
            ctx.lineTo(cx + r * 1.25, cy + r * 0.65);
            ctx.stroke();
        } else if (face === 1) {
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r, cy);
            ctx.lineTo(cx, cy + r);
            ctx.lineTo(cx - r, cy);
            ctx.closePath();
            ctx.stroke();
        } else if (face === 2) {
            [-r * 0.85, 0, r * 0.85].forEach((offset, index) => {
                ctx.lineWidth = badge && index === 1 ? 3.6 : (badge ? 2.2 : 1.4);
                ctx.beginPath();
                ctx.moveTo(cx + offset, cy - r);
                ctx.lineTo(cx + offset, cy + r);
                ctx.stroke();
            });
        } else if (face === 3) {
            ctx.lineWidth = badge ? 3.6 : 1.4;
            ctx.beginPath();
            ctx.moveTo(cx - r, cy - r);
            ctx.lineTo(cx + r, cy + r);
            ctx.moveTo(cx + r, cy - r);
            ctx.lineTo(cx - r, cy + r);
            ctx.stroke();
        } else if (face === 4) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.lineWidth = badge ? 2.4 : 1.4;
            ctx.beginPath();
            ctx.moveTo(cx - r * 1.1, cy);
            ctx.quadraticCurveTo(cx - r * 0.55, cy - r, cx, cy);
            ctx.quadraticCurveTo(cx + r * 0.55, cy + r, cx + r * 1.1, cy);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawPlannedPathOnMap(ctx, cellSize, offsetX, offsetY) {
        if (this.plannedPath.length === 0) return;

        const points = [this.playerPos, ...this.plannedPath]
            .map(id => this.getMinimapCellCenter(id, cellSize, offsetX, offsetY))
            .filter(Boolean);

        if (points.length < 2) return;

        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }

    drawBridgeLinks(ctx, cellSize, offsetX, offsetY) {
        if (!this.bridges.length) return;

        this.bridges.forEach((link, index) => {
            const a = this.getMinimapCellCenter(link.a, cellSize, offsetX, offsetY);
            const b = this.getMinimapCellCenter(link.b, cellSize, offsetX, offsetY);
            if (!a || !b) return;

            ctx.save();
            const entryColor = '#35e6ff';
            const exitColor = '#ffb700';
            const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            gradient.addColorStop(0, entryColor);
            gradient.addColorStop(1, exitColor);

            ctx.strokeStyle = gradient;
            ctx.fillStyle = 'rgba(53, 230, 255, 0.14)';
            ctx.shadowColor = entryColor;
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.6;
            ctx.setLineDash([8, 5]);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.setLineDash([]);

            [
                { point: a, color: entryColor, label: 'A' },
                { point: b, color: exitColor, label: 'B' }
            ].forEach(({ point, color, label }) => {
                const r = Math.max(8, cellSize * 0.42);
                ctx.strokeStyle = color;
                ctx.fillStyle = color === entryColor
                    ? 'rgba(53, 230, 255, 0.16)'
                    : 'rgba(255, 183, 0, 0.16)';
                ctx.shadowColor = color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = color;
                ctx.font = `900 ${Math.max(10, cellSize * 0.5)}px Orbitron, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, point.x, point.y + 1);
            });

            this.drawFloatingSticker(ctx, (a.x + b.x) / 2, (a.y + b.y) / 2, '门', entryColor, cellSize);
            ctx.restore();
        });
    }

    drawTutorialCues(ctx, cellSize, offsetX, offsetY) {
        const tutorial = this.currentLevel?.tutorial;
        if (!tutorial || this.gameState !== 'playing') return;

        const visual = tutorial.visual;
        const guardian = this.ais.find(ai => ai.type === 'guardian');

        if (visual === 'dragExit') {
            this.drawMapArrow(ctx, this.playerPos, this.exitPos, '#00ff88', '拖', cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, '#00ff88', cellSize, offsetX, offsetY);
        } else if (visual === 'keyDoor') {
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, this.hasKey ? '#00ff88' : '#ffb700', cellSize, offsetX, offsetY);
            if (!this.hasKey) {
                this.drawMapArrow(ctx, this.keyPos, this.exitPos, '#ffb700', '→', cellSize, offsetX, offsetY);
            }
        } else if (visual === 'threat') {
            this.ais.forEach(ai => this.drawThreatPreviewPath(ctx, ai, cellSize, offsetX, offsetY, '!'));
        } else if (visual === 'rotateExit') {
            this.drawRotationLayerHint(ctx, cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, '#00ff88', cellSize, offsetX, offsetY);
            this.drawMapSticker(ctx, this.exitPos, '⟳', '#00ff88', cellSize, offsetX, offsetY);
        } else if (visual === 'rotateKey') {
            this.drawRotationLayerHint(ctx, cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            this.drawMapSticker(ctx, this.keyPos, '⟳', '#ffb700', cellSize, offsetX, offsetY);
        } else if (visual === 'guardianLure') {
            if (guardian) {
                this.drawTargetRing(ctx, guardian.pos, '#ffb700', cellSize, offsetX, offsetY);
                this.drawMapSticker(ctx, guardian.pos, '!', '#ffb700', cellSize, offsetX, offsetY);
            }
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
        } else if (visual === 'guardianSplit') {
            this.drawRotationLayerHint(ctx, cellSize, offsetX, offsetY);
            if (guardian) {
                this.drawTargetRing(ctx, guardian.pos, '#ffb700', cellSize, offsetX, offsetY);
                this.drawMapSticker(ctx, guardian.pos, '⇄', '#ffb700', cellSize, offsetX, offsetY);
            }
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
        } else if (visual === 'guardianRage') {
            if (guardian) {
                this.drawThreatPreviewPath(ctx, guardian, cellSize, offsetX, offsetY, '2');
                this.drawMapSticker(ctx, guardian.pos, '2', '#ff0055', cellSize, offsetX, offsetY);
            }
            if (!this.hasKey) {
                this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            }
        } else if (visual === 'tracker') {
            const target = this.trackerCell ?? this.keyPos ?? this.exitPos;
            this.drawRotationLayerHint(ctx, cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, target, '#8bdcff', cellSize, offsetX, offsetY);
            this.drawMapSticker(ctx, target, '◎', '#8bdcff', cellSize, offsetX, offsetY);
            if ((this.trackerCell === null || this.trackerCell === undefined) && this.keyPos !== null) {
                this.drawMapArrow(ctx, this.playerPos, this.keyPos, '#8bdcff', '标', cellSize, offsetX, offsetY);
            }
        } else if (visual === 'rotateThreat') {
            this.drawRotationLayerHint(ctx, cellSize, offsetX, offsetY);
            this.ais.forEach(ai => this.drawThreatPreviewPath(ctx, ai, cellSize, offsetX, offsetY, '!'));
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, this.hasKey ? '#00ff88' : '#ffb700', cellSize, offsetX, offsetY);
        } else if (visual === 'bridge' || visual === 'bridgeThreat') {
            if (visual === 'bridgeThreat') {
                this.ais.forEach(ai => this.drawThreatPreviewPath(ctx, ai, cellSize, offsetX, offsetY, '!'));
            }
            const firstBridge = this.bridges[0];
            if (firstBridge) {
                this.drawTargetRing(ctx, firstBridge.a, '#c6ff5c', cellSize, offsetX, offsetY);
                this.drawTargetRing(ctx, firstBridge.b, '#c6ff5c', cellSize, offsetX, offsetY);
                this.drawMapArrow(ctx, firstBridge.a, firstBridge.b, '#35e6ff', '门', cellSize, offsetX, offsetY);
            }
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, this.hasKey ? '#00ff88' : '#ffb700', cellSize, offsetX, offsetY);
        } else if (visual === 'void' || visual === 'voidRotate' || visual === 'voidGuardian' || visual === 'voidExam') {
            if (visual === 'voidRotate' || visual === 'voidExam') this.drawRotationLayerHint(ctx, cellSize, offsetX, offsetY);
            this.voidCells.forEach(cellId => {
                this.drawTargetRing(ctx, cellId, '#8bdcff', cellSize, offsetX, offsetY);
                this.drawMapSticker(ctx, cellId, '裂', '#8bdcff', cellSize, offsetX, offsetY);
            });
            this.ais.forEach(ai => this.drawThreatPreviewPath(ctx, ai, cellSize, offsetX, offsetY, '!'));
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, this.hasKey ? '#00ff88' : '#ffb700', cellSize, offsetX, offsetY);
        } else if (visual === 'patch') {
            this.voidCells.forEach(cellId => {
                this.drawTargetRing(ctx, cellId, '#8bdcff', cellSize, offsetX, offsetY);
                this.drawMapSticker(ctx, cellId, '+', '#8bdcff', cellSize, offsetX, offsetY);
            });
            this.ais.forEach(ai => this.drawThreatPreviewPath(ctx, ai, cellSize, offsetX, offsetY, '!'));
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, this.hasKey ? '#00ff88' : '#ffb700', cellSize, offsetX, offsetY);
        } else if (visual === 'beacon') {
            if (guardian) {
                this.drawThreatPreviewPath(ctx, guardian, cellSize, offsetX, offsetY, '!');
                this.drawTargetRing(ctx, guardian.pos, '#ffb700', cellSize, offsetX, offsetY);
            }
            this.drawTargetRing(ctx, this.keyPos, '#ffb700', cellSize, offsetX, offsetY);
            this.drawTargetRing(ctx, this.exitPos, this.hasKey ? '#00ff88' : '#ffb700', cellSize, offsetX, offsetY);
        }
    }

    drawTrackerMarker(ctx, cellSize, offsetX, offsetY) {
        if (!this.trackingEnabled) return;

        const target = this.trackerCell;
        if (target === null || target === undefined) {
            if (!this.trackerMode) return;
            const origin = this.keyPos ?? this.exitPos;
            this.drawTargetRing(ctx, origin, '#8bdcff', cellSize, offsetX, offsetY);
            this.drawMapSticker(ctx, origin, '◎', '#8bdcff', cellSize, offsetX, offsetY);
            return;
        }

        const center = this.getMinimapCellCenter(target, cellSize, offsetX, offsetY);
        if (!center) return;

        const r = Math.max(10, cellSize * 0.58);
        ctx.save();
        ctx.strokeStyle = '#8bdcff';
        ctx.fillStyle = 'rgba(139, 220, 255, 0.12)';
        ctx.shadowColor = '#8bdcff';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = 0.9;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(center.x, center.y, r + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#8bdcff';
        ctx.font = `900 ${Math.max(11, cellSize * 0.55)}px Orbitron, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◎', center.x, center.y + 1);
        ctx.restore();
    }

    drawTargetRing(ctx, cellId, color, cellSize, offsetX, offsetY) {
        if (cellId === null || cellId === undefined) return;
        const center = this.getMinimapCellCenter(cellId, cellSize, offsetX, offsetY);
        if (!center) return;

        const r = Math.max(9, cellSize * 0.52);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.48;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawMapArrow(ctx, fromCell, toCell, color, label, cellSize, offsetX, offsetY) {
        if (fromCell === null || fromCell === undefined || toCell === null || toCell === undefined) return;
        const from = this.getMinimapCellCenter(fromCell, cellSize, offsetX, offsetY);
        const to = this.getMinimapCellCenter(toCell, cellSize, offsetX, offsetY);
        if (!from || !to) return;

        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const startPad = Math.max(8, cellSize * 0.45);
        const endPad = Math.max(10, cellSize * 0.55);
        const sx = from.x + Math.cos(angle) * startPad;
        const sy = from.y + Math.sin(angle) * startPad;
        const ex = to.x - Math.cos(angle) * endPad;
        const ey = to.y - Math.sin(angle) * endPad;
        const head = Math.max(6, cellSize * 0.32);

        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2.4;
        ctx.shadowColor = color;
        ctx.shadowBlur = 9;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - Math.cos(angle - 0.55) * head, ey - Math.sin(angle - 0.55) * head);
        ctx.lineTo(ex - Math.cos(angle + 0.55) * head, ey - Math.sin(angle + 0.55) * head);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (label) {
            this.drawFloatingSticker(ctx, (from.x + to.x) / 2, (from.y + to.y) / 2, label, color, cellSize);
        }
    }

    drawThreatPreviewPath(ctx, ai, cellSize, offsetX, offsetY, label = '!') {
        const preview = this.previewAIMovement(ai);
        if (!preview.length) {
            this.drawMapSticker(ctx, ai.pos, label, ai.color || '#ff0055', cellSize, offsetX, offsetY);
            return;
        }

        const points = [ai.pos, ...preview]
            .map(id => this.getMinimapCellCenter(id, cellSize, offsetX, offsetY))
            .filter(Boolean);
        if (points.length < 2) return;

        ctx.save();
        ctx.strokeStyle = ai.type === 'guardian' && this.hasKey ? '#ff0055' : (ai.color || '#ff0055');
        ctx.lineWidth = 2.4;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();

        const last = preview[preview.length - 1];
        this.drawMapSticker(ctx, last, label, ai.color || '#ff0055', cellSize, offsetX, offsetY);
    }

    drawRotationLayerHint(ctx, cellSize, offsetX, offsetY) {
        const axisEl = document.getElementById('rotate-axis');
        const layerEl = document.getElementById('rotate-layer');
        if (!axisEl || !layerEl || layerEl.value === '') return;

        const axis = axisEl.value || 'X';
        const layer = parseInt(layerEl.value, 10);
        if (!Number.isFinite(layer)) return;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 183, 0, 0.16)';
        ctx.strokeStyle = 'rgba(255, 183, 0, 0.62)';
        ctx.lineWidth = 1.6;
        this.cells.forEach(cell => {
            if (this.getCellLayerIndex(cell.id, axis) !== layer) return;
            const center = this.getMinimapCellCenter(cell.id, cellSize, offsetX, offsetY);
            if (!center) return;
            const x = center.x - cellSize / 2 + 1;
            const y = center.y - cellSize / 2 + 1;
            ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
            ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);
        });
        ctx.restore();
    }

    getCellLayerIndex(cellId, axis) {
        const cell = this.cells[cellId];
        if (!cell) return -1;
        const value = cell.pos[String(axis).toLowerCase()];
        const ratio = (value + 1) / 2;
        return Math.min(this.N - 1, Math.max(0, Math.round(ratio * (this.N - 1))));
    }

    drawMapSticker(ctx, cellId, text, color, cellSize, offsetX, offsetY) {
        const center = this.getMinimapCellCenter(cellId, cellSize, offsetX, offsetY);
        if (!center) return;
        this.drawFloatingSticker(ctx, center.x + cellSize * 0.34, center.y - cellSize * 0.36, text, color, cellSize);
    }

    drawFloatingSticker(ctx, x, y, text, color, cellSize) {
        const size = Math.max(15, cellSize * 0.72);
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(5, 8, 14, 0.92)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x - size / 2, y - size / 2, size, size, 5);
        } else {
            ctx.rect(x - size / 2, y - size / 2, size, size);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = `900 ${Math.max(10, size * 0.58)}px Orbitron, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y + 1);
        ctx.restore();
    }

    drawMapEntities(ctx, cellSize, offsetX, offsetY) {
        const drawToken = (cellId, type, color, variant = null) => {
            if (cellId === null || cellId === undefined) return;
            const center = this.getMinimapCellCenter(cellId, cellSize, offsetX, offsetY);
            if (!center) return;

            const r = Math.max(6, Math.min(9, cellSize * 0.32));
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 7;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            if (type === 'player') {
                ctx.fillStyle = 'rgba(5, 8, 14, 0.9)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(center.x - r * 0.72, center.y + r * 0.45);
                ctx.lineTo(center.x, center.y - r * 0.72);
                ctx.lineTo(center.x + r * 0.72, center.y + r * 0.45);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(center.x, center.y - r * 0.55);
                ctx.lineTo(center.x, center.y + r * 0.72);
                ctx.stroke();
            } else if (type === 'key') {
                ctx.fillStyle = color;
                ctx.strokeStyle = '#fff0a8';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(center.x, center.y - r);
                ctx.lineTo(center.x + r, center.y);
                ctx.lineTo(center.x, center.y + r);
                ctx.lineTo(center.x - r, center.y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = '#08090f';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(center.x - r * 0.35, center.y);
                ctx.lineTo(center.x + r * 0.45, center.y);
                ctx.moveTo(center.x + r * 0.2, center.y);
                ctx.lineTo(center.x + r * 0.2, center.y + r * 0.35);
                ctx.stroke();
            } else if (type === 'exit') {
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeRect(center.x - r, center.y - r, r * 2, r * 2);
                ctx.fillStyle = this.hasKey ? 'rgba(0,255,136,0.18)' : 'rgba(255,183,0,0.15)';
                ctx.fillRect(center.x - r + 1, center.y - r + 1, r * 2 - 2, r * 2 - 2);
                ctx.beginPath();
                ctx.moveTo(center.x - r * 0.45, center.y + r * 0.45);
                ctx.lineTo(center.x + r * 0.45, center.y - r * 0.45);
                ctx.stroke();
            } else {
                ctx.fillStyle = 'rgba(5, 8, 14, 0.92)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                if (variant === 'guardian') {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();
                    ctx.arc(center.x, center.y - r * 0.18, r * 0.42, Math.PI, 0);
                    ctx.stroke();
                    ctx.fillStyle = color;
                    ctx.fillRect(center.x - r * 0.5, center.y - r * 0.05, r, r * 0.68);
                    ctx.fillStyle = '#08090f';
                    ctx.beginPath();
                    ctx.arc(center.x, center.y + r * 0.18, r * 0.15, 0, Math.PI * 2);
                    ctx.fill();
                } else if (variant === 'ambusher') {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, r * 0.5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(center.x - r * 0.72, center.y);
                    ctx.lineTo(center.x + r * 0.72, center.y);
                    ctx.moveTo(center.x, center.y - r * 0.72);
                    ctx.lineTo(center.x, center.y + r * 0.72);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y - r * 0.85);
                    ctx.lineTo(center.x + r * 0.78, center.y + r * 0.78);
                    ctx.lineTo(center.x, center.y + r * 0.35);
                    ctx.lineTo(center.x - r * 0.78, center.y + r * 0.78);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(center.x, center.y - r * 0.08, r * 0.18, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
        };

        drawToken(this.exitPos, 'exit', this.hasKey ? '#00ff88' : '#ffb700');
        if (!this.hasKey) drawToken(this.keyPos, 'key', '#ffb700');
        this.ais.forEach(ai => drawToken(ai.pos, 'ai', ai.color, ai.type));
        drawToken(this.playerPos, 'player', '#00ff88');
    }

    getMinimapCellCenter(cellId, cellSize, offsetX, offsetY) {
        const cell = this.cells[cellId];
        const layout = this.netLayout[cell.face];
        if (!layout) return null;

        return {
            x: offsetX + (layout.x * this.N + cell.col) * cellSize + cellSize / 2,
            y: offsetY + (layout.y * this.N + cell.row) * cellSize + cellSize / 2
        };
    }

    getCellFromMinimapEvent(event) {
        if (!this.minimapGrid || !this.minimapMetrics) return null;

        const canvas = document.getElementById('minimap-canvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;
        const { cellSize, offsetX, offsetY, cols, rows } = this.minimapMetrics;

        const gridX = Math.floor((mouseX - offsetX) / cellSize);
        const gridY = Math.floor((mouseY - offsetY) / cellSize);

        if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
            return this.minimapGrid[gridY][gridX];
        }

        return null;
    }

    handleMinimapPointer(event, isNewStroke = false) {
        if (isNewStroke) {
            this.lastInputCell = null;
        }

        const cellId = this.getCellFromMinimapEvent(event);
        if (cellId === null || cellId === this.lastInputCell) return;

        if (this.trackerMode) {
            if (isNewStroke) this.setTrackerCell(cellId);
            this.lastInputCell = cellId;
            return;
        }

        if (this.toolMode === 'patch' || this.toolMode === 'beacon') {
            if (isNewStroke) this.handleBoardCellClick(cellId);
            this.lastInputCell = cellId;
            return;
        }

        this.appendPathCell(cellId);
        this.lastInputCell = cellId;
    }

    handleMinimapClick(event) {
        this.handleMinimapPointer(event, true);
    }

    hexToRgba(hex, alpha) {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

window.GameEngine = GameEngine;
