/**
 * 维度黑客：魔方追逃 (Dimension Hack: Rubik's Pursuit)
 * WebGL 3D 渲染与物理动画引擎
 */

class RenderEngine {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.cublets = []; // 27 个子立方体 meshes
        this.playerMesh = null;
        this.aiMeshes = {}; // ID -> mesh
        this.chipMeshes = {}; // cellId -> mesh
        this.exitMesh = null;
        
        // 游戏引擎实例引用
        this.game = null;
        
        // 缩放因子
        this.cubeRadius = 3.5; // 魔方外接圆弧半径
        
        // 动画队列与状态
        this.isAnimating = false;
        
        // 路径规划线条
        this.plannedLine = null;
    }

    // 初始化 3D 场景
    init(containerId, gameInstance) {
        this.container = document.getElementById(containerId);
        this.game = gameInstance;
        
        // 1. 初始化 Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x08090f, 0.04);
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(7, 7, 10);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // 2. 摄像机轨道控制器
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 20;
        this.controls.minDistance = 5;
        
        // 3. 添加光源 (赛博霓虹环境光 + 点光源)
        const ambientLight = new THREE.AmbientLight(0x0e1420);
        this.scene.add(ambientLight);
        
        const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 0.6);
        dirLight1.position.set(5, 10, 7);
        this.scene.add(dirLight1);
        
        const dirLight2 = new THREE.DirectionalLight(0xbd00ff, 0.4);
        dirLight2.position.set(-5, -5, -5);
        this.scene.add(dirLight2);
        
        // 4. 重绘魔方与实体
        this.buildCube3D();
        this.spawnEntities3D();
        
        // 创建路径终点高亮指示器 (黄框)
        const indicatorGeo = new THREE.BoxGeometry(2.05, 2.05, 2.05);
        const indicatorMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        this.targetIndicator = new THREE.Mesh(indicatorGeo, indicatorMat);
        this.targetIndicator.visible = false;
        this.scene.add(this.targetIndicator);
        
        // 5. 绑定窗口尺寸自适应
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // 6. 开启渲染主循环
        this.animate();
    }

    // 构建 3D 魔方
    buildCube3D() {
        const N = this.game.N;
        const cubletSize = 1.95; // 子方块边长
        
        // 材质库 (黑色底座 + 半透霓虹贴面)
        const createFaceMaterial = (colorHex) => {
            return new THREE.MeshPhongMaterial({
                color: 0x11131a,
                emissive: colorHex,
                emissiveIntensity: 0.15,
                shininess: 30,
                transparent: true,
                opacity: 0.95
            });
        };
        
        // 默认暗色材质
        const darkMaterial = new THREE.MeshPhongMaterial({ color: 0x0c0d12, shininess: 10 });
        
        // 各个面的高亮贴色：U, D, L, R, F, B
        const faceColors = {
            0: 0x00f0ff, // U (Cyan)
            1: 0xbd00ff, // D (Purple)
            2: 0xff7700, // L (Orange)
            3: 0xff0055, // R (Pink/Red)
            4: 0x00ff88, // F (Neon Green)
            5: 0xffdd00  // B (Yellow)
        };
        
        // 清理旧物体
        this.cublets.forEach(c => this.scene.remove(c));
        this.cublets = [];
        
        // 魔方坐标范围 [-H, H]，步长为 2
        const H = (N - 1) / 2;
        
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                for (let z = 0; z < N; z++) {
                    // 只渲染外壳块，跳过最中心块
                    if (x > 0 && x < N - 1 && y > 0 && y < N - 1 && z > 0 && z < N - 1) {
                        continue;
                    }
                    
                    // 计算子立方体 3D 相对中心位置
                    const posX = (x - H) * 2;
                    const posY = (y - H) * 2;
                    const posZ = -(z - H) * 2; // Three.js -Z 为后方
                    
                    // 确定每个子立方体 6 个面的材质
                    const materials = Array(6).fill(darkMaterial);
                    
                    // 检查子方块是否暴露在外面，如果是，赋予对应的霓虹材质
                    if (x === N - 1) materials[0] = createFaceMaterial(faceColors[3]); // R (+X)
                    if (x === 0)     materials[1] = createFaceMaterial(faceColors[2]); // L (-X)
                    if (y === N - 1) materials[2] = createFaceMaterial(faceColors[0]); // U (+Y)
                    if (y === 0)     materials[3] = createFaceMaterial(faceColors[1]); // D (-Y)
                    if (z === 0)     materials[4] = createFaceMaterial(faceColors[4]); // F (+Z)
                    if (z === N - 1) materials[5] = createFaceMaterial(faceColors[5]); // B (-Z)
                    
                    const geometry = new THREE.BoxGeometry(cubletSize, cubletSize, cubletSize);
                    const mesh = new THREE.Mesh(geometry, materials);
                    mesh.position.set(posX, posY, posZ);
                    
                    // 增加赛博霓虹边缘框线
                    const edges = new THREE.EdgesGeometry(geometry);
                    const lineMaterial = new THREE.LineBasicMaterial({ 
                        color: 0x00f0ff, 
                        transparent: true, 
                        opacity: 0.25 
                    });
                    const line = new THREE.LineSegments(edges, lineMaterial);
                    mesh.add(line);
                    
                    // 挂载局部网格索引以便旋转计算
                    mesh.userData = { gridX: x, gridY: y, gridZ: z };
                    
                    this.scene.add(mesh);
                    this.cublets.push(mesh);
                }
            }
        }
    }

    // 渲染角色、芯片与出口
    spawnEntities3D() {
        // 清理旧物体
        if (this.playerMesh) this.scene.remove(this.playerMesh);
        Object.values(this.aiMeshes).forEach(m => this.scene.remove(m));
        Object.values(this.chipMeshes).forEach(m => this.scene.remove(m));
        if (this.exitMesh) this.scene.remove(this.exitMesh);
        
        this.aiMeshes = {};
        this.chipMeshes = {};
        this.exitMesh = null;
        
        // 1. 玩家 (绿光双锥体)
        const playerGeo = new THREE.OctahedronGeometry(0.35, 0);
        const playerMat = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.8,
            shininess: 100
        });
        this.playerMesh = new THREE.Mesh(playerGeo, playerMat);
        const playerPos3D = this.getCellWorldPosition(this.game.playerPos);
        this.playerMesh.position.copy(playerPos3D);
        
        // 玩家光晕
        const playerLight = new THREE.PointLight(0x00ff88, 1, 3);
        this.playerMesh.add(playerLight);
        this.scene.add(this.playerMesh);
        
        // 2. AI 敌人
        this.game.ais.forEach(ai => {
            let aiGeo;
            if (ai.type === 'chaser') {
                // 追猎者 (尖锐的四角锥)
                aiGeo = new THREE.ConeGeometry(0.32, 0.7, 4);
            } else if (ai.type === 'ambusher') {
                // 伏击者 (圆环结构)
                aiGeo = new THREE.TorusGeometry(0.22, 0.08, 8, 24);
            } else {
                // 守护者 (六角柱/圆柱)
                aiGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 6);
            }
            
            const aiMat = new THREE.MeshPhongMaterial({
                color: ai.color,
                emissive: ai.color,
                emissiveIntensity: 0.7,
                shininess: 80
            });
            const mesh = new THREE.Mesh(aiGeo, aiMat);
            // 调整锥体方向朝上
            if (ai.type === 'chaser') mesh.rotation.x = Math.PI / 2;
            
            const aiPos3D = this.getCellWorldPosition(ai.pos);
            mesh.position.copy(aiPos3D);
            
            // AI 光晕
            const aiLight = new THREE.PointLight(ai.color, 0.8, 2.5);
            mesh.add(aiLight);
            
            this.scene.add(mesh);
            this.aiMeshes[ai.id] = mesh;
        });
        
        // 3. 数据芯片 (蓝色悬浮宝石)
        const chipGeo = new THREE.OctahedronGeometry(0.24, 0);
        const chipMat = new THREE.MeshPhongMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.9,
            shininess: 100
        });
        
        this.game.chips.forEach(chipId => {
            const mesh = new THREE.Mesh(chipGeo, chipMat);
            const pos3D = this.getCellWorldPosition(chipId);
            mesh.position.copy(pos3D);
            
            // 芯片轻微脉冲发光
            const chipLight = new THREE.PointLight(0x00f0ff, 0.6, 2);
            mesh.add(chipLight);
            
            this.scene.add(mesh);
            this.chipMeshes[chipId] = mesh;
        });
    }

    // 绘制规划路径引导线 (绿色光带) 与终点高亮
    drawPlannedPath(path) {
        if (this.plannedLine) this.scene.remove(this.plannedLine);
        
        if (path.length === 0) {
            if (this.targetIndicator) this.targetIndicator.visible = false;
            return;
        }
        
        // 收集路径世界坐标
        const points = [this.getCellWorldPosition(this.game.playerPos)];
        path.forEach(cellId => {
            points.push(this.getCellWorldPosition(cellId));
        });
        
        // 使用 CatmullRomCurve3 生成平滑曲线
        const curve = new THREE.CatmullRomCurve3(points);
        // 让线条略微悬浮在球体上方
        const curvePoints = curve.getPoints(50).map(p => {
            return p.clone().normalize().multiplyScalar(this.cubeRadius * 1.05);
        });
        
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ff88, 
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        
        this.plannedLine = new THREE.Line(geometry, material);
        this.scene.add(this.plannedLine);

        // 更新终点高亮指示器
        const targetId = path[path.length - 1];
        const targetPos = this.getCellWorldPosition(targetId);
        this.targetIndicator.position.copy(targetPos);
        
        const cell = this.game.cells[targetId];
        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        this.targetIndicator.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        this.targetIndicator.visible = true;
    }

    // 生成激活的出口 (绿色光环传送门)
    spawnExitPortal(exitPos) {
        const portalGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 32);
        const portalMat = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 1.0,
            shininess: 100
        });
        this.exitMesh = new THREE.Mesh(portalGeo, portalMat);
        
        const pos3D = this.getCellWorldPosition(exitPos);
        this.exitMesh.position.copy(pos3D);
        
        // 调整光环贴着面呈平行状态
        const cell = this.game.cells[exitPos];
        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        this.exitMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        
        const portalLight = new THREE.PointLight(0x00ff88, 1, 3);
        this.exitMesh.add(portalLight);
        this.scene.add(this.exitMesh);
    }

    // 芯片收集溶解特效
    collectChipEffect(chipId) {
        const mesh = this.chipMeshes[chipId];
        if (!mesh) return;
        
        // 播放渐隐和浮空效果
        let opacity = 1;
        const fade = () => {
            opacity -= 0.1;
            mesh.position.addScaledVector(new THREE.Vector3(0, 0.1, 0), 1);
            mesh.scale.multiplyScalar(0.9);
            
            if (opacity > 0) {
                requestAnimationFrame(fade);
            } else {
                this.scene.remove(mesh);
                delete this.chipMeshes[chipId];
            }
        };
        fade();
    }

    // 计算格子的 3D 世界坐标 (略微悬浮在面之上)
    getCellWorldPosition(cellId) {
        const cell = this.game.cells[cellId];
        if (!cell) return new THREE.Vector3(0,0,0);
        
        const base = new THREE.Vector3(cell.pos.x, cell.pos.y, cell.pos.z);
        // 按魔方半径缩放
        base.multiplyScalar(this.cubeRadius / Math.max(Math.abs(cell.pos.x), Math.abs(cell.pos.y), Math.abs(cell.pos.z)));
        
        // 向外平移，使其悬浮在地表上
        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        base.addScaledVector(normal, 0.3); // 悬浮高度 0.3
        
        return base;
    }

    // 平滑位移棋子 (带球面弧度插值)
    movePlayer(targetCellId) {
        this.interpolateMeshPosition(this.playerMesh, targetCellId);
    }

    moveAI(aiId, targetCellId) {
        const mesh = this.aiMeshes[aiId];
        if (mesh) {
            this.interpolateMeshPosition(mesh, targetCellId);
        }
    }

    // 核心球面插值算法：实现棋子沿着球形地表平滑滑行的 3D 动画
    interpolateMeshPosition(mesh, targetCellId) {
        this.isAnimating = true;
        
        const startPos = mesh.position.clone();
        const endPos = this.getCellWorldPosition(targetCellId);
        
        const cell = this.game.cells[targetCellId];
        
        let progress = 0;
        const duration = 200; // 动画时长 200ms
        const startTime = performance.now();
        
        const animatePos = (time) => {
            progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;
            
            // A. 球面线性插值 (Slerp-like Lerp)
            const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, progress);
            
            // B. 强制投影到球体表面，保持恒定悬浮高度
            currentPos.normalize().multiplyScalar(this.cubeRadius + 0.3);
            mesh.position.copy(currentPos);
            
            // C. 调整棋子姿态使其法线对齐地面
            const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
            mesh.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal), 0.1);
            
            if (progress < 1) {
                requestAnimationFrame(animatePos);
            } else {
                mesh.position.copy(endPos);
                this.isAnimating = false;
            }
        };
        
        requestAnimationFrame(animatePos);
    }

    // ==========================================
    // 💡 三维魔方扭动物理动画 (Dynamic Layer Twisting)
    // ==========================================
    playRotateAnimation(axis, layerIdx, direction, callback) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const N = this.game.N;
        const perm = this.game.rotationPermutations[axis][layerIdx][direction];
        
        // 创建临时旋转组
        const pivotGroup = new THREE.Group();
        this.scene.add(pivotGroup);
        
        // 定位属于该旋转层的所有 3D 物体
        const rotatingMeshes = [];
        
        this.cublets.forEach(cublet => {
            // 注意：当魔方旋转后，子块的位置发生了物理改变，我们需要根据其当前 3D position 来确定层
            const currentLayer = this.getLayerVal(cublet.position, axis);
            if (currentLayer === layerIdx) {
                rotatingMeshes.push(cublet);
            }
        });
        
        // B. 判定实体（玩家、AI、芯片、出口）是否在旋转层内
        // 实体的位置由它们所站在的 cell 的 index 确定。我们直接查阅 perm 置换表，
        // 凡是在置换表中 index 发生变化的实体，都属于该旋转层！
        const checkEntityInLayer = (cellId) => {
            return perm[cellId] !== cellId;
        };
        
        if (checkEntityInLayer(this.game.playerPos)) rotatingMeshes.push(this.playerMesh);
        
        this.game.ais.forEach(ai => {
            if (checkEntityInLayer(ai.pos)) {
                rotatingMeshes.push(this.aiMeshes[ai.id]);
            }
        });
        
        this.game.chips.forEach(chipId => {
            if (checkEntityInLayer(chipId)) {
                rotatingMeshes.push(this.chipMeshes[chipId]);
            }
        });
        
        if (this.exitMesh && checkEntityInLayer(this.game.exitPos)) {
            rotatingMeshes.push(this.exitMesh);
        }
        
        // C. 将所有选中的 Mesh 挂载到临时旋转组上
        rotatingMeshes.forEach(mesh => {
            if (mesh) {
                pivotGroup.attach(mesh);
            }
        });
        
        // D. 扭动插值动画
        let progress = 0;
        const duration = 500; // 500ms 旋转动画
        const startTime = performance.now();
        
        // 确定旋转轴向量与弧度
        const rotAxisVec = new THREE.Vector3();
        rotAxisVec[axis.toLowerCase()] = 1;
        
        // 顺时针/逆时针对应的弧度
        const totalAngle = (direction === 'CW') ? -Math.PI / 2 : Math.PI / 2;
        
        const animateRotation = (time) => {
            progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;
            
            // Easing: Cubic Out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // 设置当前旋转量
            const currentAngle = totalAngle * easeProgress;
            
            if (axis === 'X') pivotGroup.rotation.x = currentAngle;
            if (axis === 'Y') pivotGroup.rotation.y = currentAngle;
            if (axis === 'Z') pivotGroup.rotation.z = currentAngle;
            
            if (progress < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                // E. 旋转结束，将所有 Mesh 重新挂载回 Scene 节点下
                const tempArray = [...pivotGroup.children];
                tempArray.forEach(mesh => {
                    this.scene.attach(mesh);
                });
                
                // 销毁临时组
                this.scene.remove(pivotGroup);
                
                this.isAnimating = false;
                
                // 回调 game.js 触发核心数组置换更新
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animateRotation);
    }

    // 窗口尺寸自适应
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    // 渲染主循环
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // 更新 OrbitControls 摄像机控制器
        if (this.controls) this.controls.update();
        
        // 自转动画，增加精致感
        // A. 悬浮芯片自转
        Object.values(this.chipMeshes).forEach(mesh => {
            mesh.rotation.y += 0.02;
            mesh.rotation.x += 0.01;
            // 漂浮正弦动画
            mesh.position.y += Math.sin(Date.now() * 0.003) * 0.002;
        });
        
        // B. 出口环的自转
        if (this.exitMesh) {
            this.exitMesh.rotation.z += 0.01;
        }
        
        // C. 玩家呼吸发光
        if (this.playerMesh) {
            this.playerMesh.rotation.y += 0.01;
        }
        
        // 执行 WebGL 渲染
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    // 获取子块当前坐标在指定轴向上的层数索引
    getLayerVal(pos, ax) {
        const N = this.game.N;
        const val = pos[ax.toLowerCase()];
        const H = (N - 1) / 2;
        // 将真实 3D 坐标映射回 [0, N-1] 的格数索引
        const idx = Math.round((val / 2) + H);
        return Math.min(N - 1, Math.max(0, idx));
    }

    // 旋转层高亮 (Visual Layer Highlight)
    highlightLayer(axis, layerIdx) {
        this.cublets.forEach(cublet => {
            const currentLayer = this.getLayerVal(cublet.position, axis);
            const line = cublet.children[0]; // 边缘线
            const isTargetLayer = (currentLayer === layerIdx);
            
            if (isTargetLayer) {
                // 高亮该旋转层网格边缘
                if (line && line.material) {
                    line.material.color.setHex(0xffd700); // 亮金色
                    line.material.opacity = 0.85;
                }
                
                // 仅高亮该层发光面贴色，避免更改黑色底座的共享材质
                cublet.material.forEach(mat => {
                    if (mat && mat.emissive && mat.emissive.getHex() !== 0) {
                        mat.emissiveIntensity = 0.45; // 增加发光亮度
                    }
                });
            } else {
                // 恢复普通层状态
                if (line && line.material) {
                    line.material.color.setHex(0x00f0ff); // 默认青色
                    line.material.opacity = 0.25;
                }
                cublet.material.forEach(mat => {
                    if (mat && mat.emissive && mat.emissive.getHex() !== 0) {
                        mat.emissiveIntensity = 0.15; // 恢复默认亮度
                    }
                });
            }
        });
    }
}

// 挂载到全局
window.RenderEngine = RenderEngine;
