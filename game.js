/**
 * 维度黑客：魔方追逃 (Dimension Hack: Rubik's Pursuit)
 * 核心游戏逻辑与拓扑图计算
 */

class GameEngine {
    constructor() {
        this.N = 3; // 默认三阶魔方
        this.cells = [];
        this.playerPos = 0;
        this.playerLastPos = 0;
        this.playerAP = 2;
        this.maxAP = 2;
        this.rotationCharge = 1;
        this.maxRotationCharge = 1;
        this.turn = 1;
        this.ais = [];
        this.chips = [];
        this.exitPos = null;
        this.exitActivated = false;
        this.gameState = 'setup'; // 'setup', 'playing', 'win', 'gameover'
        
        // 动作枚举
        this.DIR = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };
        
        // 置换缓存
        // Format: rotationPermutations[axis][layer][direction] = Array of 6*N^2 indices
        this.rotationPermutations = {
            X: {},
            Y: {},
            Z: {}
        };
        
        // 规划路径 (玩家点击但尚未确认执行的路径)
        this.plannedPath = [];
    }

    // 初始化游戏
    init(N, aiConfigs) {
        this.N = N;
        this.cells = [];
        this.ais = [];
        this.chips = [];
        this.exitPos = null;
        this.exitActivated = false;
        this.playerAP = this.maxAP;
        this.rotationCharge = this.maxRotationCharge;
        this.turn = 1;
        this.plannedPath = [];
        
        this.buildTopology();
        this.precomputeRotations();
        this.spawnEntities(aiConfigs);
        
        this.gameState = 'playing';
        this.updateUI();
    }

    // 1. 建立 N*N*N 魔方表面拓扑图
    buildTopology() {
        const N = this.N;
        const totalCells = 6 * N * N;
        
        // 步骤 A: 生成每个格子的 3D 几何坐标与面法向量
        // U=0(上), D=1(下), L=2(左), R=3(右), F=4(前), B=5(后)
        for (let f = 0; f < 6; f++) {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const id = f * N * N + r * N + c;
                    
                    // 归一化网格坐标 [-1, 1]
                    const u = -1 + (2 * c + 1) / N;
                    const v = 1 - (2 * r + 1) / N;
                    
                    let pos = { x: 0, y: 0, z: 0 };
                    let normal = { x: 0, y: 0, z: 0 };
                    
                    switch (f) {
                        case 0: // U (Top, Y = +1)
                            pos = { x: u, y: 1, z: -v };
                            normal = { x: 0, y: 1, z: 0 };
                            break;
                        case 1: // D (Bottom, Y = -1)
                            pos = { x: u, y: -1, z: v };
                            normal = { x: 0, y: -1, z: 0 };
                            break;
                        case 2: // L (Left, X = -1)
                            pos = { x: -1, y: v, z: u };
                            normal = { x: -1, y: 0, z: 0 };
                            break;
                        case 3: // R (Right, X = +1)
                            pos = { x: 1, y: v, z: -u };
                            normal = { x: 1, y: 0, z: 0 };
                            break;
                        case 4: // F (Front, Z = +1)
                            pos = { x: u, y: v, z: 1 };
                            normal = { x: 0, y: 0, z: 1 };
                            break;
                        case 5: // B (Back, Z = -1)
                            pos = { x: -u, y: v, z: -1 };
                            normal = { x: 0, y: 0, z: -1 };
                            break;
                    }
                    
                    this.cells[id] = {
                        id: id,
                        face: f,
                        row: r,
                        col: c,
                        pos: pos,
                        normal: normal,
                        neighbors: {} // 待填充: { 0: nbId, 1: nbId, 2: nbId, 3: nbId }
                    };
                }
            }
        }
        
        // 步骤 B: 基于折叠连通性填充邻接网格表
        for (let id = 0; id < totalCells; id++) {
            const cell = this.cells[id];
            const f = cell.face;
            const r = cell.row;
            const c = cell.col;
            
            // 默认同平面邻居
            let up = (r > 0) ? (f * N * N + (r - 1) * N + c) : null;
            let down = (r < N - 1) ? (f * N * N + (r + 1) * N + c) : null;
            let left = (c > 0) ? (f * N * N + r * N + (c - 1)) : null;
            let right = (c < N - 1) ? (f * N * N + r * N + (c + 1)) : null;
            
            // 跨边界情况 (Portals)
            if (r === 0) { // 向上跨越
                switch (f) {
                    case 0: up = 5 * N * N + 0 * N + (N - 1 - c); break; // U-Up -> B-Top (inv col)
                    case 1: up = 4 * N * N + (N - 1) * N + c; break;    // D-Up -> F-Bottom
                    case 2: up = 0 * N * N + c * N + 0; break;          // L-Up -> U-Left
                    case 3: up = 0 * N * N + (N - 1 - c) * N + (N - 1); break; // R-Up -> U-Right
                    case 4: up = 0 * N * N + (N - 1) * N + c; break;    // F-Up -> U-Bottom
                    case 5: up = 0 * N * N + 0 * N + (N - 1 - c); break; // B-Up -> U-Top (inv col)
                }
            }
            if (r === N - 1) { // 向下跨越
                switch (f) {
                    case 0: down = 4 * N * N + 0 * N + c; break;         // U-Down -> F-Top
                    case 1: down = 5 * N * N + (N - 1) * N + (N - 1 - c); break; // D-Down -> B-Bottom (inv col)
                    case 2: down = 1 * N * N + (N - 1 - c) * N + 0; break;       // L-Down -> D-Left
                    case 3: down = 1 * N * N + c * N + (N - 1); break;          // R-Down -> D-Right
                    case 4: down = 1 * N * N + 0 * N + c; break;         // F-Down -> D-Top
                    case 5: down = 1 * N * N + (N - 1) * N + (N - 1 - c); break; // B-Down -> D-Bottom (inv col)
                }
            }
            if (c === 0) { // 向左跨越
                switch (f) {
                    case 0: left = 2 * N * N + 0 * N + r; break;         // U-Left -> L-Top
                    case 1: left = 2 * N * N + (N - 1) * N + (N - 1 - r); break; // D-Left -> L-Bottom (inv row)
                    case 2: left = 5 * N * N + r * N + (N - 1); break;   // L-Left -> B-Right
                    case 3: left = 4 * N * N + r * N + (N - 1); break;   // R-Left -> F-Right
                    case 4: left = 2 * N * N + r * N + (N - 1); break;   // F-Left -> L-Right
                    case 5: left = 3 * N * N + r * N + (N - 1); break;   // B-Left -> R-Right
                }
            }
            if (c === N - 1) { // 向右跨越
                switch (f) {
                    case 0: right = 3 * N * N + 0 * N + (N - 1 - r); break; // U-Right -> R-Top (inv row)
                    case 1: right = 3 * N * N + (N - 1) * N + r; break;   // D-Right -> R-Bottom
                    case 2: right = 4 * N * N + r * N + 0; break;        // L-Right -> F-Left
                    case 3: right = 5 * N * N + r * N + 0; break;        // R-Right -> B-Left
                    case 4: right = 3 * N * N + r * N + 0; break;        // F-Right -> R-Left
                    case 5: right = 2 * N * N + r * N + 0; break;        // B-Right -> L-Left
                }
            }
            
            cell.neighbors[this.DIR.UP] = up;
            cell.neighbors[this.DIR.DOWN] = down;
            cell.neighbors[this.DIR.LEFT] = left;
            cell.neighbors[this.DIR.RIGHT] = right;
        }
    }

    // 2. 使用 3D 向量空间几何旋转，预计算层旋转的节点置换表
    precomputeRotations() {
        const N = this.N;
        const totalCells = 6 * N * N;
        const axes = ['X', 'Y', 'Z'];
        const directions = ['CW', 'CCW'];
        
        // 浮点数安全比较
        const epsilon = 1e-4;
        
        // 定义各轴坐标切片 bin
        const getLayerIndex = (pos, axis) => {
            const val = pos[axis.toLowerCase()];
            // 归一化映射：[-1, 1] 映射到 [0, N-1] 的层索引
            // 边缘情况处理：若值在 [-1, 1] 外则限幅
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
                    
                    // 对 54 个格子的位置进行旋转变换
                    for (let id = 0; id < totalCells; id++) {
                        const cell = this.cells[id];
                        const cellLayer = getLayerIndex(cell.pos, axis);
                        
                        if (cellLayer === layer) {
                            // 旋转该单元的 pos 与 normal
                            let rotatedPos = { ...cell.pos };
                            let rotatedNormal = { ...cell.normal };
                            
                            // 旋转公式
                            if (axis === 'X') {
                                const angle = (dir === 'CW') ? -Math.PI / 2 : Math.PI / 2; // 右手法则
                                const cos = Math.cos(angle);
                                const sin = Math.sin(angle);
                                
                                rotatedPos.y = cell.pos.y * cos - cell.pos.z * sin;
                                rotatedPos.z = cell.pos.y * sin + cell.pos.z * cos;
                                
                                rotatedNormal.y = cell.normal.y * cos - cell.normal.z * sin;
                                rotatedNormal.z = cell.normal.y * sin + cell.normal.z * cos;
                            } else if (axis === 'Y') {
                                const angle = (dir === 'CW') ? -Math.PI / 2 : Math.PI / 2;
                                const cos = Math.cos(angle);
                                const sin = Math.sin(angle);
                                
                                rotatedPos.x = cell.pos.x * cos + cell.pos.z * sin;
                                rotatedPos.z = -cell.pos.x * sin + cell.pos.z * cos;
                                
                                rotatedNormal.x = cell.normal.x * cos + cell.normal.z * sin;
                                rotatedNormal.z = -cell.normal.x * sin + cell.normal.z * cos;
                            } else if (axis === 'Z') {
                                const angle = (dir === 'CW') ? -Math.PI / 2 : Math.PI / 2;
                                const cos = Math.cos(angle);
                                const sin = Math.sin(angle);
                                
                                rotatedPos.x = cell.pos.x * cos - cell.pos.y * sin;
                                rotatedPos.y = cell.pos.x * sin + cell.pos.y * cos;
                                
                                rotatedNormal.x = cell.normal.x * cos - cell.normal.y * sin;
                                rotatedNormal.y = cell.normal.x * sin + cell.normal.y * cos;
                            }
                            
                            // 在原始 cell 集合中寻找最匹配的新位置和新法线
                            let bestMatch = -1;
                            let minDistance = Infinity;
                            
                            for (let searchId = 0; searchId < totalCells; searchId++) {
                                const targetCell = this.cells[searchId];
                                
                                // 计算 3D 距离
                                const dist = Math.hypot(
                                    rotatedPos.x - targetCell.pos.x,
                                    rotatedPos.y - targetCell.pos.y,
                                    rotatedPos.z - targetCell.pos.z
                                );
                                
                                // 法线重合度
                                const normalDot = rotatedNormal.x * targetCell.normal.x +
                                                  rotatedNormal.y * targetCell.normal.y +
                                                  rotatedNormal.z * targetCell.normal.z;
                                
                                if (dist < minDistance && normalDot > 0.9) {
                                    minDistance = dist;
                                    bestMatch = searchId;
                                }
                            }
                            
                            perm[id] = (bestMatch !== -1 && minDistance < 0.2) ? bestMatch : id;
                        } else {
                            // 未参与旋转的层，索引保持不变
                            perm[id] = id;
                        }
                    }
                    
                    this.rotationPermutations[axis][layer][dir] = perm;
                }
            }
        }
    }

    // 3. 生成实体 (Entity Spawner)
    spawnEntities(aiConfigs) {
        const N = this.N;
        const totalCells = 6 * N * N;
        
        // 玩家固定在 U 面中心 (N=3 时是 4，即 U-中心)
        this.playerPos = Math.floor(N * N / 2); // U 的中心
        this.playerLastPos = this.playerPos;
        
        // 过滤掉不可用坐标（玩家位置）
        const getAvailablePositions = (exclude = []) => {
            const list = [];
            for (let i = 0; i < totalCells; i++) {
                if (i !== this.playerPos && !exclude.includes(i)) {
                    list.push(i);
                }
            }
            return list;
        };

        // 放置数据芯片 (随机在除 U 面以外的面上)
        const chipExclude = [this.playerPos];
        for (let i = 0; i < 3; i++) {
            const pool = getAvailablePositions(chipExclude).filter(id => {
                const cell = this.cells[id];
                // 优先生成在非 U 面，且互不相邻
                return cell.face !== 0;
            });
            const selected = pool[Math.floor(Math.random() * pool.length)] || getAvailablePositions(chipExclude)[0];
            this.chips.push(selected);
            chipExclude.push(selected);
        }
        
        // 生成 AI
        aiConfigs.forEach((config, idx) => {
            let spawnPos = 0;
            const excludePool = [this.playerPos, ...this.chips, ...this.ais.map(a => a.pos)];
            
            if (config.spawn === 'opposite') {
                // 对立面 D 面的四个角落
                const oppositeCornerPool = [
                    1 * N * N + 0 * N + 0,
                    1 * N * N + 0 * N + (N - 1),
                    1 * N * N + (N - 1) * N + 0,
                    1 * N * N + (N - 1) * N + (N - 1)
                ].filter(id => !excludePool.includes(id));
                
                spawnPos = oppositeCornerPool[Math.floor(Math.random() * oppositeCornerPool.length)] || getAvailablePositions(excludePool)[0];
            } else {
                // 随机位置
                const pool = getAvailablePositions(excludePool);
                spawnPos = pool[Math.floor(Math.random() * pool.length)];
            }
            
            this.ais.push({
                id: idx,
                pos: spawnPos,
                type: config.type, // 'chaser', 'ambusher', 'guardian'
                state: config.type === 'guardian' ? 'patrol' : 'alert',
                patrolTargetChipIndex: idx % this.chips.length, // 守护者绑定的巡逻芯片
                color: config.type === 'chaser' ? '#ff0055' : (config.type === 'ambusher' ? '#bd00ff' : '#ffb700')
            });
        });
    }

    // 4. 基于拓扑图的 BFS 广度优先最快路径搜索
    findPath(startId, endId) {
        if (startId === endId) return [startId];
        
        const queue = [[startId]];
        const visited = new Set();
        visited.add(startId);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const curr = path[path.length - 1];
            
            const nbs = this.cells[curr].neighbors;
            for (const dir in nbs) {
                const neighborId = nbs[dir];
                if (neighborId !== null && !visited.has(neighborId)) {
                    const newPath = [...path, neighborId];
                    if (neighborId === endId) return newPath;
                    visited.add(neighborId);
                    queue.push(newPath);
                }
            }
        }
        return null; // 无路径
    }

    // 5. 规划与执行路径操作
    planPathTo(targetId) {
        if (this.gameState !== 'playing' || this.playerAP <= 0) return;
        
        // 计算当前位置到目标位置的最短路径
        const path = this.findPath(this.playerPos, targetId);
        if (!path) return;
        
        // 限制在剩余 AP 步数之内
        const maxSteps = this.playerAP;
        this.plannedPath = path.slice(1, maxSteps + 1); // 排除起点
        
        // 触发 UI 渲染更新
        if (window.renderEngine) {
            window.renderEngine.drawPlannedPath(this.plannedPath);
        }
        this.updateActionButtons();
    }

    // 确认并执行移动路径
    executePlannedPath() {
        if (this.plannedPath.length === 0 || this.playerAP <= 0) return;
        
        const steps = this.plannedPath.length;
        this.playerAP -= steps;
        
        // 角色位移动画与坐标更新
        let delay = 0;
        this.plannedPath.forEach((cellId) => {
            setTimeout(() => {
                this.playerLastPos = this.playerPos;
                this.playerPos = cellId;
                
                // 收集芯片检测
                this.checkChipCollection();
                // 碰撞检测
                this.checkCollisions();
                
                // 同步 3D 模型
                if (window.renderEngine) {
                    window.renderEngine.movePlayer(cellId);
                }
                this.updateUI();
            }, delay);
            delay += 250; // 每格移动 0.25 秒
        });
        
        this.plannedPath = [];
        this.updateActionButtons();
        
        // 延迟触发 AI 回合
        setTimeout(() => {
            if (this.playerAP === 0 && this.gameState === 'playing') {
                this.triggerAITurn();
            }
        }, delay + 100);
    }

    // 6. 旋转魔方操作
    rotateLayer(axis, layerIdx, direction) {
        if (this.gameState !== 'playing') return;
        if (this.playerAP < 2) {
            alert("旋转魔方需要消耗 2 AP！");
            return;
        }
        if (this.rotationCharge <= 0) {
            alert("旋转能量不足，需等待充能！");
            return;
        }
        
        this.playerAP -= 2;
        this.rotationCharge -= 1;
        this.plannedPath = [];
        
        const perm = this.rotationPermutations[axis][layerIdx][direction];
        
        // 同步 3D 动画
        if (window.renderEngine) {
            // 播放魔方扭动特效，传入轴、层索引、旋转方向，以及更新映射表的 callback
            window.renderEngine.playRotateAnimation(axis, layerIdx, direction, () => {
                // 动画结束，应用置换表重写所有棋子与道具的逻辑位置
                this.applyPermutation(perm);
                this.checkChipCollection();
                this.checkCollisions();
                this.updateUI();
                
                // 触发 AI 回合
                if (this.playerAP === 0 && this.gameState === 'playing') {
                    this.triggerAITurn();
                }
            });
        } else {
            // 无渲染器时的直接结算
            this.applyPermutation(perm);
            this.checkChipCollection();
            this.checkCollisions();
            this.updateUI();
            if (this.playerAP === 0 && this.gameState === 'playing') {
                this.triggerAITurn();
            }
        }
    }

    // 应用置换表
    applyPermutation(perm) {
        // 玩家位置更新
        this.playerLastPos = this.playerPos;
        this.playerPos = perm[this.playerPos];
        
        // AI 位置更新
        this.ais.forEach(ai => {
            ai.pos = perm[ai.pos];
        });
        
        // 芯片位置更新
        this.chips = this.chips.map(chipId => perm[chipId]);
        
        // 出口位置更新
        if (this.exitPos !== null) {
            this.exitPos = perm[this.exitPos];
        }
    }

    // 7. 多智能 AI 决策与行为树 (AI Turn Execution)
    triggerAITurn() {
        if (this.gameState !== 'playing') return;
        
        // 隐藏绿色规划路径线
        if (window.renderEngine) {
            window.renderEngine.drawPlannedPath([]);
        }
        
        // 执行所有 AI 行动 (每个 AI 拥有 2 AP 移动力)
        let aiPromise = Promise.resolve();
        
        this.ais.forEach(ai => {
            aiPromise = aiPromise.then(() => {
                return new Promise((resolve) => {
                    let steps = 2; // 移动力 2 格
                    let moveDelay = 0;
                    
                    const takeSingleStep = () => {
                        if (steps <= 0 || this.gameState !== 'playing') {
                            resolve();
                            return;
                        }
                        
                        const nextCell = this.computeAIMovement(ai);
                        if (nextCell !== null && nextCell !== ai.pos) {
                            ai.pos = nextCell;
                            
                            // 同步渲染
                            if (window.renderEngine) {
                                window.renderEngine.moveAI(ai.id, nextCell);
                            }
                            
                            this.checkCollisions();
                            this.updateUI();
                            
                            steps--;
                            setTimeout(takeSingleStep, 250); // 每步平滑走 0.25 秒
                        } else {
                            // AI 无处可走或在原地
                            resolve();
                        }
                    };
                    
                    takeSingleStep();
                });
            });
        });
        
        // 所有 AI 走完，切换回玩家回合
        aiPromise.then(() => {
            if (this.gameState === 'playing') {
                this.turn++;
                this.playerAP = this.maxAP;
                
                // 旋转能充能计数
                if (this.turn % 3 === 1) {
                    this.rotationCharge = Math.min(this.maxRotationCharge, this.rotationCharge + 1);
                }
                
                this.updateUI();
            }
        });
    }

    // 核心 AI 决策逻辑
    computeAIMovement(ai) {
        const playerCell = this.cells[this.playerPos];
        const aiCell = this.cells[ai.pos];
        
        // 1. Guardian (守护者)：平面警觉机制
        if (ai.type === 'guardian') {
            const targetChipId = this.chips[ai.patrolTargetChipIndex];
            
            // 如果玩家进入守护者所在的同一个平面
            if (playerCell.face === aiCell.face) {
                ai.state = 'alert'; // 警觉追击
            } else {
                ai.state = 'patrol'; // 安全巡逻
            }
            
            if (ai.state === 'alert') {
                // 向玩家走最短路径
                const path = this.findPath(ai.pos, this.playerPos);
                return (path && path.length > 1) ? path[1] : ai.pos;
            } else {
                // 守护芯片：走向芯片或在芯片周围巡逻
                if (targetChipId !== undefined) {
                    if (ai.pos === targetChipId) {
                        // 已经在芯片上，随机选一个本平面上的邻居闲逛
                        const nbs = this.cells[ai.pos].neighbors;
                        const validNbs = [];
                        for (const dir in nbs) {
                            const nbId = nbs[dir];
                            // 限制守护者在同一平面巡逻
                            if (nbId !== null && this.cells[nbId].face === aiCell.face) {
                                validNbs.push(nbId);
                            }
                        }
                        return validNbs.length > 0 ? validNbs[Math.floor(Math.random() * validNbs.length)] : ai.pos;
                    } else {
                        // 寻找回家的路
                        const path = this.findPath(ai.pos, targetChipId);
                        return (path && path.length > 1) ? path[1] : ai.pos;
                    }
                }
                return ai.pos;
            }
        }
        
        // 2. Ambusher (伏击者)：前瞻路径拦截
        if (ai.type === 'ambusher') {
            let targetPos = this.playerPos;
            
            // 预测玩家上一动的方向
            if (this.playerPos !== this.playerLastPos) {
                let lastDir = null;
                const lastNbs = this.cells[this.playerLastPos].neighbors;
                for (const d in lastNbs) {
                    if (lastNbs[d] === this.playerPos) {
                        lastDir = parseInt(d);
                        break;
                    }
                }
                
                if (lastDir !== null) {
                    // 向前延展 2 格
                    let predCell = this.cells[this.playerPos];
                    for (let i = 0; i < 2; i++) {
                        const nextId = predCell.neighbors[lastDir];
                        if (nextId !== null) {
                            predCell = this.cells[nextId];
                        }
                    }
                    targetPos = predCell.id;
                }
            }
            
            const path = this.findPath(ai.pos, targetPos);
            return (path && path.length > 1) ? path[1] : ai.pos;
        }
        
        // 3. Chaser (追猎者)：最短路线 BFS 逼近
        if (ai.type === 'chaser') {
            const path = this.findPath(ai.pos, this.playerPos);
            return (path && path.length > 1) ? path[1] : ai.pos;
        }
        
        return ai.pos;
    }

    // 8. 规则判定
    checkChipCollection() {
        const idx = this.chips.indexOf(this.playerPos);
        if (idx !== -1) {
            this.chips.splice(idx, 1);
            
            // 声音或视觉提示
            if (window.renderEngine) {
                window.renderEngine.collectChipEffect(this.playerPos);
            }
            
            // 检测是否收集完，激活出口
            if (this.chips.length === 0 && !this.exitActivated) {
                this.activateExitPortal();
            }
        }
    }

    activateExitPortal() {
        this.exitActivated = true;
        // 出口随机在 D 面的某个格子上生成
        const N = this.N;
        const dFaceStart = 1 * N * N;
        const dFaceEnd = 2 * N * N - 1;
        // 排除被占用的格子
        const exclude = [this.playerPos, ...this.ais.map(a => a.pos)];
        const pool = [];
        for (let i = dFaceStart; i <= dFaceEnd; i++) {
            if (!exclude.includes(i)) pool.push(i);
        }
        this.exitPos = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : dFaceStart;
        
        if (window.renderEngine) {
            window.renderEngine.spawnExitPortal(this.exitPos);
        }
    }

    // 碰撞检测
    checkCollisions() {
        // A. 抓捕检测 (在同一格子)
        const caught = this.ais.some(ai => ai.pos === this.playerPos);
        if (caught) {
            this.triggerGameOver();
            return;
        }
        
        // B. 胜利检测 (抵达已激活的出口)
        if (this.exitActivated && this.playerPos === this.exitPos) {
            this.triggerVictory();
        }
    }

    triggerGameOver() {
        this.gameState = 'gameover';
        document.getElementById('failure-summary').innerHTML = `
            <div><span>生存回合:</span><span class="s-val">${this.turn}</span></div>
            <div><span>芯片收集:</span><span class="s-val">${3 - this.chips.length} / 3</span></div>
        `;
        document.getElementById('gameover-overlay').classList.add('active');
    }

    triggerVictory() {
        this.gameState = 'win';
        document.getElementById('victory-summary').innerHTML = `
            <div><span>通关回合:</span><span class="s-val">${this.turn}</span></div>
            <div><span>剩余 AP:</span><span class="s-val">${this.playerAP}</span></div>
        `;
        document.getElementById('victory-overlay').classList.add('active');
    }

    // 9. UI 信息绑定
    updateUI() {
        document.getElementById('turn-count').innerText = this.turn;
        document.getElementById('ap-display').innerText = `${this.playerAP} / ${this.maxAP}`;
        
        const apPercent = (this.playerAP / this.maxAP) * 100;
        document.getElementById('ap-bar-fill').style.width = `${apPercent}%`;
        
        document.getElementById('rotation-charge').innerText = `${this.rotationCharge} / ${this.maxRotationCharge}`;
        
        // 更新任务目标
        const chipText = document.getElementById('obj-chips-text');
        const chipDot = document.getElementById('obj-chips-dot');
        const exitText = document.getElementById('obj-exit-text');
        const exitDot = document.getElementById('obj-exit-dot');
        
        const totalChips = 3;
        const gathered = totalChips - this.chips.length;
        chipText.innerText = `数据芯片收集: ${gathered} / ${totalChips}`;
        
        if (gathered === totalChips) {
            chipText.classList.add('text-neon-blue');
            chipDot.className = 'obj-dot active-blue';
            
            exitText.innerText = "前往数据导出港 (已激活)";
            exitText.classList.add('text-neon-green');
            exitDot.className = 'obj-dot active-green';
        } else {
            chipText.classList.remove('text-neon-blue');
            chipDot.className = 'obj-dot';
            exitText.innerText = "前往数据导出港 (未激活)";
            exitText.classList.remove('text-neon-green');
            exitDot.className = 'obj-dot';
        }
        
        // 更新 AI 列表状态
        const aiListEl = document.getElementById('ai-status-list');
        aiListEl.innerHTML = '';
        this.ais.forEach(ai => {
            const row = document.createElement('div');
            row.className = `ai-status-row ${ai.type}`;
            
            const nameSpan = document.createElement('span');
            nameSpan.innerText = `AI #${ai.id} [${ai.type.toUpperCase()}]`;
            
            const stateSpan = document.createElement('span');
            stateSpan.className = `ai-state ${ai.state === 'alert' ? 'alert' : 'patrol'}`;
            stateSpan.innerText = ai.state === 'alert' ? '🔴 ALERT (追踪)' : '🟡 PATROL (巡逻)';
            
            row.appendChild(nameSpan);
            row.appendChild(stateSpan);
            aiListEl.appendChild(row);
        });
        
        this.updateActionButtons();
        
        // 同步绘制 2D 十字展开雷达
        this.drawMinimap();

        // 刷新魔方旋转层高亮
        if (window.renderEngine && window.renderEngine.highlightLayer) {
            const axisEl = document.getElementById('rotate-axis');
            const layerEl = document.getElementById('rotate-layer');
            if (axisEl && layerEl && layerEl.value !== "") {
                window.renderEngine.highlightLayer(axisEl.value, parseInt(layerEl.value));
            }
        }
    }

    updateActionButtons() {
        const confirmBtn = document.getElementById('btn-confirm-path');
        confirmBtn.disabled = (this.plannedPath.length === 0 || this.playerAP <= 0);
        if (this.plannedPath.length > 0) {
            confirmBtn.innerText = `执行移动 (${this.plannedPath.length} 步 / 扣除 ${this.plannedPath.length} AP)`;
        } else {
            confirmBtn.innerText = `执行规划路径`;
        }
    }

    // 10. 绘制 2D 相对 5 面局部雷达图 Canvas
    drawMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const N = this.N;
        const cellWidth = Math.floor((canvas.width - 20) / (3 * N)); // 适配画布大小
        const startOffset = 10;
        
        // 构造 3N x 3N 的局域网格映射
        const grid = Array(3 * N).fill(null).map(() => Array(3 * N).fill(null));
        this.minimapGrid = grid; // 缓存供点击事件查询
        
        const f_center = this.cells[this.playerPos].face;
        
        // 1. 中心面 (行 N~2N-1, 列 N~2N-1)
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                grid[N + r][N + c] = f_center * N * N + r * N + c;
            }
        }
        
        const getOppositeDir = (d) => {
            if (d === this.DIR.UP) return this.DIR.DOWN;
            if (d === this.DIR.DOWN) return this.DIR.UP;
            if (d === this.DIR.LEFT) return this.DIR.RIGHT;
            if (d === this.DIR.RIGHT) return this.DIR.LEFT;
            return null;
        };
        
        // 2. 顶面 (向上跨越)
        const topBoundary = [];
        for (let c = 0; c < N; c++) {
            topBoundary.push(grid[N][N + c]);
        }
        const topAdj = topBoundary.map(id => this.cells[id].neighbors[this.DIR.UP]);
        if (topAdj[0] !== null) {
            for (let c = 0; c < N; c++) {
                grid[N - 1][N + c] = topAdj[c];
            }
            let topBackDir = null;
            const topAdjCell = this.cells[topAdj[0]];
            for (const d in topAdjCell.neighbors) {
                if (topAdjCell.neighbors[d] === topBoundary[0]) {
                    topBackDir = parseInt(d);
                    break;
                }
            }
            const topOutDir = getOppositeDir(topBackDir);
            for (let c = 0; c < N; c++) {
                let curr = topAdj[c];
                for (let r = N - 2; r >= 0; r--) {
                    if (curr !== null) {
                        curr = this.cells[curr].neighbors[topOutDir];
                    }
                    grid[r][N + c] = curr;
                }
            }
        }
        
        // 3. 底面 (向下跨越)
        const btmBoundary = [];
        for (let c = 0; c < N; c++) {
            btmBoundary.push(grid[2 * N - 1][N + c]);
        }
        const btmAdj = btmBoundary.map(id => this.cells[id].neighbors[this.DIR.DOWN]);
        if (btmAdj[0] !== null) {
            for (let c = 0; c < N; c++) {
                grid[2 * N][N + c] = btmAdj[c];
            }
            let btmBackDir = null;
            const btmAdjCell = this.cells[btmAdj[0]];
            for (const d in btmAdjCell.neighbors) {
                if (btmAdjCell.neighbors[d] === btmBoundary[0]) {
                    btmBackDir = parseInt(d);
                    break;
                }
            }
            const btmOutDir = getOppositeDir(btmBackDir);
            for (let c = 0; c < N; c++) {
                let curr = btmAdj[c];
                for (let r = 2 * N + 1; r < 3 * N; r++) {
                    if (curr !== null) {
                        curr = this.cells[curr].neighbors[btmOutDir];
                    }
                    grid[r][N + c] = curr;
                }
            }
        }
        
        // 4. 左面 (向左跨越)
        const leftBoundary = [];
        // Logic for filling surrounding faces (simplified)
        const dirs = [this.DIR.UP, this.DIR.DOWN, this.DIR.LEFT, this.DIR.RIGHT];
        dirs.forEach(d => {
            const boundary = [];
            for (let i = 0; i < N; i++) {
                if (d === this.DIR.UP) boundary.push(grid[N][N + i]);
                else if (d === this.DIR.DOWN) boundary.push(grid[2 * N - 1][N + i]);
                else if (d === this.DIR.LEFT) boundary.push(grid[N + i][N]);
                else if (d === this.DIR.RIGHT) boundary.push(grid[N + i][2 * N - 1]);
            }
            
            const adj = boundary.map(id => this.cells[id].neighbors[d]);
            if (adj[0] !== null) {
                // Simplified filling of adjacent faces
                adj.forEach((id, i) => {
                    if (d === this.DIR.UP) grid[N - 1][N + i] = id;
                    else if (d === this.DIR.DOWN) grid[2 * N][N + i] = id;
                    else if (d === this.DIR.LEFT) grid[N + i][N - 1] = id;
                    else if (d === this.DIR.RIGHT) grid[N + i][2 * N] = id;
                });
            }
        });
        
        const labels = { 0: 'U', 1: 'D', 2: 'L', 3: 'R', 4: 'F', 5: 'B' };
        
        for (let y = 0; y < 3 * N; y++) {
            for (let x = 0; x < 3 * N; x++) {
                const id = grid[y][x];
                if (id === null) continue;
                
                const drawX = startOffset + x * cellWidth;
                const drawY = startOffset + y * cellWidth;
                
                ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
                ctx.lineWidth = 1;
                
                if (y >= N && y < 2 * N && x >= N && x < 2 * N) {
                    ctx.fillStyle = 'rgba(0, 240, 255, 0.09)';
                    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
                }
                
                if (this.plannedPath.includes(id)) {
                    ctx.fillStyle = 'rgba(0, 255, 136, 0.25)';
                    ctx.strokeStyle = 'var(--neon-green)';
                }
                
                ctx.fillRect(drawX, drawY, cellWidth - 1, cellWidth - 1);
                ctx.strokeRect(drawX, drawY, cellWidth - 1, cellWidth - 1);
                
                const cell = this.cells[id];
                if (cell.row === Math.floor(N / 2) && cell.col === Math.floor(N / 2)) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.font = 'bold 10px Orbitron';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(labels[cell.face], drawX + cellWidth / 2, drawY + cellWidth / 2);
                }
                
                if (id === this.playerPos) {
                    ctx.fillStyle = 'var(--neon-green)';
                    ctx.beginPath();
                    ctx.arc(drawX + cellWidth / 2, drawY + cellWidth / 2, 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                
                this.ais.forEach(ai => {
                    if (id === ai.pos) {
                        ctx.fillStyle = ai.color;
                        ctx.fillRect(drawX + cellWidth / 2 - 5, drawY + cellWidth / 2 - 5, 10, 10);
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(drawX + cellWidth / 2 - 5, drawY + cellWidth / 2 - 5, 10, 10);
                    }
                });
                
                if (this.chips.includes(id)) {
                    ctx.fillStyle = 'var(--neon-blue)';
                    ctx.beginPath();
                    ctx.moveTo(drawX + cellWidth / 2, drawY + 4);
                    ctx.lineTo(drawX + cellWidth - 4, drawY + cellWidth / 2);
                    ctx.lineTo(drawX + cellWidth / 2, drawY + cellWidth - 4);
                    ctx.lineTo(drawX + 4, drawY + cellWidth / 2);
                    ctx.closePath();
                    ctx.fill();
                }
                
                if (this.exitActivated && id === this.exitPos) {
                    ctx.strokeStyle = 'var(--neon-green)';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(drawX + 3, drawY + 3, cellWidth - 7, cellWidth - 7);
                    ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
                    ctx.fillRect(drawX + 3, drawY + 3, cellWidth - 7, cellWidth - 7);
                }
            }
        }
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(startOffset + N * cellWidth - 0.5, startOffset + N * cellWidth - 0.5, N * cellWidth, N * cellWidth);
    }

    handleMinimapClick(event) {
        if (!this.minimapGrid) return;
        const canvas = document.getElementById('minimap-canvas');
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const N = this.N;
        const cellWidth = Math.floor((canvas.width - 20) / (3 * N));
        const startOffset = 10;
        
        const gridX = Math.floor((mouseX - startOffset) / cellWidth);
        const gridY = Math.floor((mouseY - startOffset) / cellWidth);
        
        if (gridX >= 0 && gridX < 3 * N && gridY >= 0 && gridY < 3 * N) {
            const cellId = this.minimapGrid[gridY][gridX];
            if (cellId !== null) {
                this.planPathTo(cellId);
            }
        }
    }
}

// 绑定到 window 暴露给 render.js
window.GameEngine = GameEngine;
