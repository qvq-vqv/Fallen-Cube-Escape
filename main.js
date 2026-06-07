/**
 * 维度黑客：魔方追逃 (Dimension Hack: Rubik's Pursuit)
 * UI 控制器与生命周期整合
 */

document.addEventListener('DOMContentLoaded', () => {
    // 实例化核心组件
    const game = new GameEngine();
    const render = new RenderEngine();
    
    // 挂载到全局以供跨脚本引用
    window.gameEngine = game;
    window.renderEngine = render;

    // DOM 元素引用
    const setupOverlay = document.getElementById('setup-overlay');
    const gameContainer = document.getElementById('game-container');
    const startBtn = document.getElementById('start-game-btn');
    const aiListEl = document.getElementById('ai-list');
    const addAiBtn = document.getElementById('add-ai-btn');
    const removeAiBtn = document.getElementById('remove-ai-btn');
    const mapSizeGroup = document.getElementById('map-size-group');
    
    const rotateAxisSelect = document.getElementById('rotate-axis');
    const rotateLayerSelect = document.getElementById('rotate-layer');
    const btnRotateCw = document.getElementById('btn-rotate-cw');
    const btnRotateCcw = document.getElementById('btn-rotate-ccw');
    const btnConfirmPath = document.getElementById('btn-confirm-path');
    const btnEndTurn = document.getElementById('btn-end-turn');
    const btnReset = document.getElementById('btn-reset');
    
    const gameoverOverlay = document.getElementById('gameover-overlay');
    const victoryOverlay = document.getElementById('victory-overlay');
    const restartBtns = document.querySelectorAll('.btn-restart');
    
    const minimapCanvas = document.getElementById('minimap-canvas');

    // 默认配置
    let currentMapSize = 3;
    let aiCount = 1;
    const maxAIs = 3;

    // ==========================================
    // 1. 开局配置面板交互
    // ==========================================

    // 选择地图大小
    mapSizeGroup.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-size')) {
            document.querySelectorAll('.btn-size').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentMapSize = parseInt(e.target.getAttribute('data-size'));
            updateLayerDropdown(currentMapSize);
        }
    });

    // 动态生成层选择下拉框
    function updateLayerDropdown(size) {
        rotateLayerSelect.innerHTML = '';
        for (let i = 0; i < size; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            
            let label = `第 ${i+1} 层`;
            if (i === 0) label += " (底/左/后)";
            else if (i === size - 1) label += " (顶/右/前)";
            else label += " (中间层)";
            
            opt.innerText = label;
            rotateLayerSelect.appendChild(opt);
        }
    }
    updateLayerDropdown(currentMapSize);

    // 动态管理 AI 配置
    function renderAIConfigs() {
        aiListEl.innerHTML = '';
        for (let i = 0; i < aiCount; i++) {
            const aiItem = document.createElement('div');
            aiItem.className = 'ai-item';
            aiItem.setAttribute('data-index', i);
            
            // 设定类型名称与颜色
            let typeLabel = `AI #${i+1}`;
            let colorClass = 'ai-chaser';
            let defaultType = 'chaser';
            let defaultSpawn = 'opposite';
            
            if (i === 1) {
                colorClass = 'ai-ambusher';
                defaultType = 'ambusher';
                defaultSpawn = 'random';
            } else if (i === 2) {
                colorClass = 'ai-guardian';
                defaultType = 'guardian';
                defaultSpawn = 'random';
            }
            
            aiItem.innerHTML = `
                <span class="ai-label ${colorClass}">${typeLabel}</span>
                <select class="ai-type cyber-select" style="width: auto;">
                    <option value="chaser" ${defaultType === 'chaser' ? 'selected' : ''}>Chaser (追猎者)</option>
                    <option value="ambusher" ${defaultType === 'ambusher' ? 'selected' : ''}>Ambusher (伏击者)</option>
                    <option value="guardian" ${defaultType === 'guardian' ? 'selected' : ''}>Guardian (守护者)</option>
                </select>
                <select class="ai-spawn cyber-select" style="width: auto;">
                    <option value="opposite" ${defaultSpawn === 'opposite' ? 'selected' : ''}>对立角点生成</option>
                    <option value="random" ${defaultSpawn === 'random' ? 'selected' : ''}>全图随机生成</option>
                </select>
            `;
            aiListEl.appendChild(aiItem);
        }
        
        // 按钮显示状态
        addAiBtn.style.display = aiCount < maxAIs ? 'inline-block' : 'none';
        removeAiBtn.style.display = aiCount > 1 ? 'inline-block' : 'none';
    }
    renderAIConfigs();

    addAiBtn.addEventListener('click', () => {
        if (aiCount < maxAIs) {
            aiCount++;
            renderAIConfigs();
        }
    });

    removeAiBtn.addEventListener('click', () => {
        if (aiCount > 1) {
            aiCount--;
            renderAIConfigs();
        }
    });

    // ==========================================
    // 2. 启动游戏连接
    // ==========================================
    startBtn.addEventListener('click', () => {
        // 读取 AI 配置
        const aiConfigs = [];
        const aiItems = document.querySelectorAll('.ai-item');
        aiItems.forEach(item => {
            const type = item.querySelector('.ai-type').value;
            const spawn = item.querySelector('.ai-spawn').value;
            aiConfigs.push({ type, spawn });
        });

        // 切换 UI 状态
        setupOverlay.classList.remove('active');
        gameContainer.style.display = 'grid';

        // 初始化游戏逻辑
        game.init(currentMapSize, aiConfigs);

        // 初始化 3D 场景
        // 先清理 canvas 容器
        const canvasContainer = document.getElementById('canvas-container');
        const canvas = canvasContainer.querySelector('canvas');
        if (canvas) canvas.remove();
        
        render.init('canvas-container', game);
    });

    // ==========================================
    // 3. 战术 HUD 动作绑定
    // ==========================================

    // 执行规划移动
    btnConfirmPath.addEventListener('click', () => {
        if (!render.isAnimating) {
            game.executePlannedPath();
        }
    });

    // 跳过回合 / 直接执行 AI
    btnEndTurn.addEventListener('click', () => {
        if (!render.isAnimating && game.gameState === 'playing') {
            game.playerAP = 0; // 清空 AP
            game.triggerAITurn();
        }
    });

    // 重置本局
    btnReset.addEventListener('click', () => {
        if (confirm("确定要重置当前战局吗？")) {
            // 获取开局配置
            const aiConfigs = game.ais.map(ai => ({ type: ai.type, spawn: 'opposite' }));
            game.init(game.N, aiConfigs);
            render.buildCube3D();
            render.spawnEntities3D();
            if (render.plannedLine) render.scene.remove(render.plannedLine);
        }
    });

    // 旋转层控制 (CW)
    btnRotateCw.addEventListener('click', () => {
        if (render.isAnimating) return;
        const axis = rotateAxisSelect.value;
        const layer = parseInt(rotateLayerSelect.value);
        game.rotateLayer(axis, layer, 'CW');
    });

    // 旋转层控制 (CCW)
    btnRotateCcw.addEventListener('click', () => {
        if (render.isAnimating) return;
        const axis = rotateAxisSelect.value;
        const layer = parseInt(rotateLayerSelect.value);
        game.rotateLayer(axis, layer, 'CCW');
    });

    // ==========================================
    // 4. 雷达 2D 点选与交互
    // ==========================================
    minimapCanvas.addEventListener('click', (e) => {
        if (game.gameState === 'playing' && !render.isAnimating) {
            game.handleMinimapClick(e);
        }
    });

    // ==========================================
    // 5. 重新游戏结算 overlays 绑定
    // ==========================================
    restartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gameoverOverlay.classList.remove('active');
            victoryOverlay.classList.remove('active');
            setupOverlay.classList.add('active');
            gameContainer.style.display = 'none';
        });
    });
});
