/**
 * 黎明魔方：立方体逃亡残局
 * UI 控制器与生命周期整合
 */

document.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    const render = new RenderEngine();
    const audio = new AudioFeedback();
    const feel = new GameFeel(audio);

    window.gameEngine = game;
    window.renderEngine = render;
    window.audioFeedback = audio;
    window.gameFeel = feel;
    feel.init();

    const prologueOverlay = document.getElementById('prologue-overlay');
    const btnPrologueStart = document.getElementById('btn-prologue-start');
    const btnPrologueSkip = document.getElementById('btn-prologue-skip');
    const setupOverlay = document.getElementById('setup-overlay');
    const gameContainer = document.getElementById('game-container');
    const startBtn = document.getElementById('start-game-btn');
    const levelListEl = document.getElementById('level-list');
    const levelBriefEl = document.getElementById('level-brief');
    const actPageTabs = document.querySelectorAll('[data-act-page]');

    const rotateAxisSelect = document.getElementById('rotate-axis');
    const rotateLayerSelect = document.getElementById('rotate-layer');
    const btnRotateCw = document.getElementById('btn-rotate-cw');
    const btnRotateCcw = document.getElementById('btn-rotate-ccw');
    const btnConfirmPath = document.getElementById('btn-confirm-path');
    const btnEndTurn = document.getElementById('btn-end-turn');
    const btnUndo = document.getElementById('btn-undo');
    const btnReset = document.getElementById('btn-reset');
    const btnMainMenu = document.getElementById('btn-main-menu');
    const btnEscMenu = document.getElementById('btn-esc-menu');
    const escConsole = document.getElementById('esc-console');
    const btnConsoleResume = document.getElementById('btn-console-resume');
    const btnConsoleReset = document.getElementById('btn-console-reset');
    const btnConsoleAudio = document.getElementById('btn-console-audio');
    const btnTwistMode = document.getElementById('btn-twist-mode');
    const phonePanel = document.getElementById('phone-panel');
    const phoneNotch = document.getElementById('phone-notch');
    const tutorialHelperClose = document.getElementById('tutorial-helper-close');
    const toolModeBtns = document.querySelectorAll('[data-tool-mode]');
    const btnToggleTracker = document.getElementById('btn-toggle-tracker');
    const btnClearTracker = document.getElementById('btn-clear-tracker');
    const audioToggle = document.getElementById('audio-toggle');

    const gameoverOverlay = document.getElementById('gameover-overlay');
    const victoryOverlay = document.getElementById('victory-overlay');
    const btnGameoverUndo = document.getElementById('btn-gameover-undo');
    const btnToggleAnalysis = document.getElementById('btn-toggle-analysis');
    const analysisToneSelect = document.getElementById('analysis-tone');
    const failureAnalysis = document.getElementById('failure-analysis');
    const restartBtns = document.querySelectorAll('.btn-restart');
    const minimapCanvas = document.getElementById('minimap-canvas');
    const terminalTabs = document.querySelectorAll('[data-terminal-tab]');
    const terminalPanels = document.querySelectorAll('[data-terminal-panel]');
    const terminalBadges = document.querySelectorAll('[data-tab-badge]');
    const companionBubble = document.getElementById('companion-bubble');
    const companionStatus = document.getElementById('companion-status');
    const commsSceneTitle = document.getElementById('comms-scene-title');
    const commsBondLabel = document.getElementById('comms-bond-label');
    const commsStoryLines = document.getElementById('comms-story-lines');
    const commsLiveLine = document.getElementById('comms-live-line');
    const commsContextLine = document.getElementById('comms-context-line');
    const routeCommandPreview = document.getElementById('route-command-preview');
    const commsChoicesEl = document.querySelector('.comms-choices');
    const archiveUnlockList = document.getElementById('archive-unlock-list');
    const achievementList = document.getElementById('achievement-list');

    const safeParseArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    };

    let selectedLevelIndex = 0;
    let selectedActPage = 1;
    let isDrawingRoute = false;
    const unlockedActs = new Set(safeParseArray('dimensionHackUnlockedActs').filter(Number.isFinite));
    unlockedActs.add(1);
    if (localStorage.getItem('dimensionHackActTwoUnlocked') === 'true') unlockedActs.add(2);
    const completedLevels = new Set(safeParseArray('dimensionHackCompletedLevels').filter(Number.isFinite));
    const unreadCounts = { comms: 0, tasks: 0, archive: 0 };
    const dialogueScript = window.DIALOGUE_SCRIPT || { defaultScene: 'fallback', levelScenes: {}, eventScenes: {}, scenes: {} };
    const storyModule = window.STORY_MODULE || null;
    const storyState = storyModule?.createState ? storyModule.createState() : {
        tones: { steady: 0, warm: 0, tease: 0 },
        seenEvents: new Set()
    };
    const commsState = {
        ...storyState,
        activeSceneId: null,
        lastReply: ''
    };
    if (!(commsState.seenEvents instanceof Set)) {
        commsState.seenEvents = new Set(commsState.seenEvents || []);
    }

    const archiveState = {
        entries: new Set(safeParseArray('dimensionHackArchiveEntries')),
        achievements: new Set(safeParseArray('dimensionHackAchievements'))
    };
    let twistMode = false;

    function persistUnlockedActs() {
        localStorage.setItem('dimensionHackUnlockedActs', JSON.stringify([...unlockedActs].sort((a, b) => a - b)));
        if (unlockedActs.has(2)) {
            localStorage.setItem('dimensionHackActTwoUnlocked', 'true');
        }
    }

    function persistCompletedLevels() {
        localStorage.setItem('dimensionHackCompletedLevels', JSON.stringify([...completedLevels].sort((a, b) => a - b)));
    }

    function markLevelCompleted(index) {
        if (!Number.isFinite(index)) return;
        completedLevels.add(index);
        persistCompletedLevels();
    }

    function isHiddenCrazyUnlocked() {
        const requiredNumbers = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]);
        game.levels.forEach((level, index) => {
            if (completedLevels.has(index)) requiredNumbers.delete(level.number || index + 1);
        });
        return requiredNumbers.size === 0;
    }

    function isLevelVisible(level) {
        return !level.hiddenUntilActOneClear || isHiddenCrazyUnlocked();
    }

    function unlockActPage(act) {
        if (!Number.isFinite(act) || act <= 1) return false;
        const hadAct = unlockedActs.has(act);
        unlockedActs.add(act);
        persistUnlockedActs();
        if (act === 2) unlockArchive('actTwoShell');
        return !hadAct;
    }

    function selectFirstLevelInAct(act) {
        const nextIndex = game.levels.findIndex(level => (level.act || 1) === act);
        if (nextIndex < 0) return false;
        selectedActPage = act;
        selectedLevelIndex = nextIndex;
        return true;
    }

    const highestUnlockedAct = [...unlockedActs]
        .filter(act => game.levels.some(level => (level.act || 1) === act))
        .sort((a, b) => b - a)[0];
    if (highestUnlockedAct > 1) {
        selectFirstLevelInAct(highestUnlockedAct);
    }
    const archiveEntries = [
        {
            id: 'foldingMachine',
            title: '折叠机',
            body: '这座牢房会记录逃亡方式。它不像监狱，更像一台把人当训练数据的机器。'
        },
        {
            id: 'protagonistE7',
            title: 'E-7',
            body: '十八岁左右的人类女孩，从床上坠入魔方牢笼。她害怕，但强撑；嘴硬，是因为她想回家。'
        },
        {
            id: 'outsideOperator',
            title: '外侧的人',
            body: '你能画路、拧空间、悔棋。她看不见你的世界，只知道你会不会把线画稳。'
        },
        {
            id: 'guardian',
            title: '守钥者',
            body: '它不会再站到钥匙或门上。它守的是局势：钥匙没拿前可被引诱，钥匙拿走后会变得更急。'
        },
        {
            id: 'rotationRule',
            title: '空间折叠',
            body: '旋转不是按钮技能，而是世界规则。钥匙、门、敌人和人都会被一起拧走。'
        },
        {
            id: 'actTwoShell',
            title: '第二层外壳',
            body: '门后不是出口。折叠机变大了，说明它开始学习我们怎么逃。'
        },
        {
            id: 'bridgePortal',
            title: '传送裂缝',
            body: '一组公开的折叠通道。它能省路，也可能让敌人更快靠近。好用，但不慈善。'
        },
        {
            id: 'voidCells',
            title: '虚空缺口',
            body: '魔方外壳被咬掉的格子。不能走，也会随层旋转。黑洞洞的地方真的没有地。'
        },
        {
            id: 'patchTool',
            title: '临时补片',
            body: '一次性薄地板。E-7 可以踩过去，离开后碎掉；追捕者默认不能借这块碎片追上来。'
        },
        {
            id: 'beaconTool',
            title: '诱饵信标',
            body: '一次性调敌工具。放在空地上，敌人会按正常路线被吸引过去，不会瞬移。'
        },
        {
            id: 'breakTool',
            title: '主动碎解',
            body: '把一格安全地板打碎，切断追捕路线。救命时很好用，乱用时也很会害人。'
        }
    ];
    const achievements = [
        { id: 'firstEscape', title: '第一次逃脱', body: '完成任意一局。她嘴上不服，心里记了一笔。' },
        { id: 'closeEscape', title: '惊险逃脱', body: '敌人贴到一步内后仍然成功撤离。' },
        { id: 'cleanRoute', title: '最短速通', body: '在推荐回合数内完成一局。' },
        { id: 'actOneClear', title: '门后不是门', body: '完成 L12「出口？」并进入第二幕。' },
        { id: 'portalCut', title: '折叠捷径', body: '使用传送裂缝完成逃脱。' }
    ];

    audio.updateToggle();

    function wakeAudio() {
        audio.start();
    }

    document.addEventListener('pointerdown', wakeAudio, { once: true });

    function closePrologue() {
        prologueOverlay?.classList.remove('active');
        setupOverlay.classList.add('active');
        renderCommsScene(dialogueScript.defaultScene, { force: true });
        feel.note('残局册已打开', 'info');
    }

    function getActiveTerminalTab() {
        return Array.from(terminalTabs).find(tab => tab.classList.contains('active'))?.dataset.terminalTab || 'comms';
    }

    function renderUnreadBadges() {
        terminalBadges.forEach(badge => {
            const tabName = badge.dataset.tabBadge;
            const count = unreadCounts[tabName] || 0;
            badge.textContent = count > 9 ? '9+' : String(count);
            badge.classList.toggle('is-hidden', count <= 0);
        });
    }

    function clearUnread(tabName) {
        if (!Object.prototype.hasOwnProperty.call(unreadCounts, tabName)) return;
        unreadCounts[tabName] = 0;
        renderUnreadBadges();
    }

    function markUnread(tabName, amount = 1) {
        if (!Object.prototype.hasOwnProperty.call(unreadCounts, tabName)) return;
        if (getActiveTerminalTab() === tabName) return;
        if (gameContainer.style.display === 'none') return;
        unreadCounts[tabName] = Math.min(99, unreadCounts[tabName] + amount);
        renderUnreadBadges();
    }

    function setTerminalTab(tabName) {
        terminalTabs.forEach(tab => {
            const isActive = tab.dataset.terminalTab === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });
        terminalPanels.forEach(panel => {
            const isActive = panel.dataset.terminalPanel === tabName;
            panel.classList.toggle('active', isActive);
            panel.setAttribute('aria-hidden', String(!isActive));
        });
        clearUnread(tabName);
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function persistArchive() {
        localStorage.setItem('dimensionHackArchiveEntries', JSON.stringify([...archiveState.entries]));
        localStorage.setItem('dimensionHackAchievements', JSON.stringify([...archiveState.achievements]));
    }

    function renderArchive() {
        if (archiveUnlockList) {
            archiveUnlockList.innerHTML = archiveEntries
                .filter(entry => archiveState.entries.has(entry.id))
                .map(entry => `
                    <article class="archive-card">
                        <span>${escapeHtml(entry.title)}</span>
                        <p>${escapeHtml(entry.body)}</p>
                    </article>
                `)
                .join('') || '<p class="archive-empty">还没有新档案。先活过这一局。</p>';
        }
        if (achievementList) {
            achievementList.innerHTML = achievements
                .map(achievement => {
                    const unlocked = archiveState.achievements.has(achievement.id);
                    return `
                        <article class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                            <span class="achievement-icon">${unlocked ? '◆' : '◇'}</span>
                            <div>
                                <strong>${escapeHtml(achievement.title)}</strong>
                                <p>${escapeHtml(unlocked ? achievement.body : '未解锁')}</p>
                            </div>
                        </article>
                    `;
                })
                .join('');
        }
    }

    function unlockArchive(id) {
        if (!id || archiveState.entries.has(id)) return false;
        archiveState.entries.add(id);
        persistArchive();
        renderArchive();
        markUnread('archive');
        return true;
    }

    function unlockAchievement(id) {
        if (!id || archiveState.achievements.has(id)) return false;
        archiveState.achievements.add(id);
        persistArchive();
        renderArchive();
        markUnread('archive');
        return true;
    }

    function getBondLabel() {
        if (storyModule?.getBondLabel) {
            return storyModule.getBondLabel(commsState);
        }
        const { steady, warm, tease } = commsState.tones;
        const total = steady + warm + tease;
        if (total <= 0) return '同步：未知';
        if (warm >= steady && warm >= tease) return '同步：偏温柔';
        if (tease >= steady && tease >= warm) return '同步：互相吐槽';
        return '同步：稳定';
    }

    function renderCommsScene(sceneId, options = {}) {
        const scene = dialogueScript.scenes[sceneId] || dialogueScript.scenes[dialogueScript.defaultScene];
        if (!scene) return;
        if (!options.force && commsState.activeSceneId === sceneId) return;

        commsState.activeSceneId = sceneId;
        commsState.lastReply = '';

        if (commsSceneTitle) commsSceneTitle.textContent = scene.title || '通讯';
        if (commsBondLabel) commsBondLabel.textContent = getBondLabel();
        if (companionStatus) companionStatus.textContent = scene.status || '信号稳定';
        if (companionBubble) companionBubble.textContent = scene.bubble || scene.lines?.[0] || '我在。';
        if (commsContextLine) {
            commsContextLine.textContent = storyModule?.getContextLine?.(scene, commsState, game)
                || (game.currentLevel
                    ? `${game.currentLevel.title} · ${game.currentLevel.chapter}。玩家只回表情；她会慢慢讲。`
                    : '通讯只在安全间隙展开；路线直接在 3D 魔方上画。');
        }

        if (commsStoryLines) {
            commsStoryLines.innerHTML = (scene.lines || [])
                .map(line => `<p class="comms-line protagonist">${escapeHtml(line)}</p>`)
                .join('');
        }
        if (commsLiveLine) {
            commsLiveLine.textContent = '选择一个表情回她。';
            commsLiveLine.className = 'comms-line system';
        }
        if (commsChoicesEl) {
            commsChoicesEl.innerHTML = (scene.replies || [])
                .map((reply, index) => `
                    <button class="terminal-choice" type="button" data-comms-choice="${index}" aria-label="${escapeHtml(reply.aria || '颜文字回应')}">
                        ${escapeHtml(reply.face)}
                    </button>
                `)
                .join('');
        }
        markUnread('comms');
    }

    function chooseCommsReply(choiceIndex) {
        const scene = dialogueScript.scenes[commsState.activeSceneId];
        const reply = scene?.replies?.[choiceIndex];
        if (!reply) return;

        if (storyModule?.applyReply) {
            storyModule.applyReply(commsState, reply, commsState.activeSceneId);
        } else if (reply.tone && commsState.tones[reply.tone] !== undefined) {
            commsState.tones[reply.tone] += 1;
        }
        if (reply.tone === 'warm') {
            game.adjustTrust(1, 'warmReply');
        } else if (reply.tone === 'tease') {
            game.adjustTrust(-2, 'teaseReply');
        }
        commsState.lastReply = reply.face;

        if (commsBondLabel) commsBondLabel.textContent = getBondLabel();
        if (commsStoryLines) {
            const playerLine = document.createElement('p');
            playerLine.className = 'comms-line player';
            playerLine.textContent = reply.face;
            commsStoryLines.appendChild(playerLine);
        }
        if (commsLiveLine) {
            commsLiveLine.className = 'comms-line protagonist';
            commsLiveLine.textContent = reply.response;
        }
        if (companionBubble) {
            companionBubble.textContent = reply.bubble || reply.response;
        }
            if (commsContextLine) {
                commsContextLine.textContent = game.currentLevel
                ? `${game.currentLevel.title}：通讯已记录。路线直接在 3D 魔方上画。`
                : '通讯已记录。';
        }
        audio.play('uiConfirm');
    }

    function renderLevelComms(levelIndex) {
        const sceneId = dialogueScript.levelScenes[levelIndex] || dialogueScript.defaultScene;
        renderCommsScene(sceneId, { force: true });
    }

    function renderEventComms(sceneId, eventKey) {
        if (!sceneId) return;
        if (eventKey && commsState.seenEvents.has(eventKey)) return;
        if (eventKey) commsState.seenEvents.add(eventKey);
        renderCommsScene(sceneId, { force: true });
    }

    function pulseCompanionReaction(detail) {
        const line = storyModule?.getMicroReaction?.(detail, game, commsState);
        if (!line) return;
        if (companionStatus) companionStatus.textContent = detail.type === 'gameOver'
            ? '信号抖动'
            : (detail.type === 'victory' ? '短暂安全' : '现场反应');
        if (companionBubble) companionBubble.textContent = line;
        markUnread('comms');
    }

    window.commsController = {
        syncFromGame(currentGame) {
            const scene = dialogueScript.scenes[commsState.activeSceneId];
            if (!scene || commsState.lastReply) return;
            if (companionStatus) companionStatus.textContent = scene.status || '信号稳定';
            if (companionBubble) {
                companionBubble.textContent = storyModule?.getAmbientBubble?.({
                    scene,
                    state: commsState,
                    game: currentGame
                }) || scene.bubble || '我在。';
            }
            if (commsContextLine) {
                commsContextLine.textContent = storyModule?.getContextLine?.(scene, commsState, currentGame)
                    || (currentGame?.currentLevel
                        ? `${currentGame.currentLevel.title} · ${currentGame.currentLevel.chapter}。玩家只回表情；她会慢慢讲。`
                        : '通讯只在安全间隙展开；路线直接在 3D 魔方上画。');
            }
        }
    };

    document.addEventListener('pointerover', event => {
        const target = event.target.closest('button, select');
        if (!target || target.disabled) return;
        audio.play('uiHover');
    });

    document.addEventListener('click', event => {
        const target = event.target.closest('button, select');
        if (!target || target.disabled || target.id === 'audio-toggle') return;
        audio.play('uiConfirm');
    });

    const enemyMeta = {
        chaser: { symbol: '×', label: '追击者' },
        guardian: { symbol: '◆', label: '守钥者' },
        ambusher: { symbol: '◇', label: '伏击者' }
    };

    function getFirstLevelIndex(predicate) {
        return game.levels.findIndex(predicate);
    }

    function getEnemyCounts(level) {
        return (level.ais || []).reduce((acc, ai) => {
            acc[ai.type] = (acc[ai.type] || 0) + 1;
            return acc;
        }, {});
    }

    function summarizeGuardianRule(level) {
        if (!level.ais || !level.ais.some(ai => ai.type === 'guardian')) return null;
        if (level.guardianAggro === 'afterKey') return '拿钥匙后狂暴';
        if (level.guardianAggro === 'guardDoor') return '拿钥匙后守门';
        return '同面引诱';
    }

    function makeMetaToken({ type = 'tool', symbol, count = 1, label, muted = false }) {
        const safeLabel = escapeHtml(label);
        return `
            <span class="meta-token ${type} ${muted ? 'muted' : ''}" title="${safeLabel}" aria-label="${safeLabel}">
                <b>${escapeHtml(symbol)}</b>${count > 1 ? `<small>x${count}</small>` : ''}
            </span>
        `;
    }

    function renderLevelMetaIcons(level, index, { includeAlwaysTools = false } = {}) {
        const firstRotationIndex = getFirstLevelIndex(item => item.rotationEnabled);
        const firstBridgeIndex = getFirstLevelIndex(item => item.bridges?.length);
        const icons = [];
        Object.entries(getEnemyCounts(level)).forEach(([type, count]) => {
            const meta = enemyMeta[type] || { symbol: '?', label: type };
            icons.push(makeMetaToken({
                type: `enemy enemy-${type}`,
                symbol: meta.symbol,
                count,
                label: `${meta.label} x${count}`
            }));
        });

        if (level.rotationEnabled && (includeAlwaysTools || index === firstRotationIndex)) {
            icons.push(makeMetaToken({
                type: 'tool tool-rotation',
                symbol: '⟳',
                label: '空间折叠已开放'
            }));
        }
        if (level.bridges?.length && (includeAlwaysTools || index === firstBridgeIndex)) {
            icons.push(makeMetaToken({
                type: 'tool tool-bridge',
                symbol: '◉',
                label: '传送裂缝首次出现'
            }));
        }
        if (level.voids?.length) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: '裂',
                count: level.voids.length,
                label: `虚空缺口 x${level.voids.length}`
            }));
        }
        if (level.patchCharges) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: '+',
                count: level.patchCharges,
                label: `临时补片 x${level.patchCharges}`
            }));
        }
        if (level.beaconCharges) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: '诱',
                count: level.beaconCharges,
                label: `诱饵信标 x${level.beaconCharges}`
            }));
        }
        if (level.breakCharges) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: '碎',
                count: level.breakCharges,
                label: `碎解次数 x${level.breakCharges}`
            }));
        }

        const guardianRule = summarizeGuardianRule(level);
        if (guardianRule && includeAlwaysTools) {
            icons.push(makeMetaToken({
                type: 'rule',
                symbol: level.guardianAggro === 'guardDoor' ? '▣' : '!',
                label: guardianRule
            }));
        }

        return icons.join('');
    }

    function updateActPageTabs() {
        actPageTabs.forEach(tab => {
            const page = Number(tab.dataset.actPage);
            const hasLevels = game.levels.some(level => (level.act || 1) === page);
            tab.classList.toggle('is-hidden', !hasLevels || !unlockedActs.has(page));
            tab.classList.toggle('active', page === selectedActPage);
            tab.setAttribute('aria-selected', String(page === selectedActPage));
        });
    }

    function renderLevelCards() {
        levelListEl.innerHTML = '';
        if (!unlockedActs.has(selectedActPage)) {
            selectedActPage = 1;
        }

        const visibleLevels = game.levels
            .map((level, index) => ({ level, index }))
            .filter(item => (item.level.act || 1) === selectedActPage && isLevelVisible(item.level));
        if (!visibleLevels.some(item => item.index === selectedLevelIndex)) {
            selectedLevelIndex = visibleLevels[0]?.index || 0;
        }
        updateActPageTabs();

        visibleLevels.forEach(({ level, index }) => {
            const actClass = `act-${level.act || 1}`;
            const card = document.createElement('button');
            card.className = `level-card ${actClass} ${index === selectedLevelIndex ? 'active' : ''}`;
            card.type = 'button';
            card.dataset.levelIndex = index;
            card.innerHTML = `
                <span class="level-card-title">${level.title}</span>
                <span class="level-card-chapter">${level.chapter}</span>
                <span class="level-card-meta">
                    ${renderLevelMetaIcons(level, index)}
                </span>
                <span class="level-card-concept">${level.concept}</span>
            `;
            card.addEventListener('click', () => {
                selectedLevelIndex = index;
                renderLevelCards();
                renderLevelBrief();
                feel.note(`${level.title} 已选中`, 'info');
            });
            levelListEl.appendChild(card);
        });
    }

    function renderLevelBrief() {
        const selectedAct = game.levels[selectedLevelIndex]?.act || 1;
        if (!unlockedActs.has(selectedAct)) {
            selectedLevelIndex = 0;
            selectedActPage = 1;
        }
        updateActPageTabs();
        const level = game.levels[selectedLevelIndex];
        levelBriefEl.innerHTML = `
            <div class="brief-title">${level.title} · ${level.chapter}</div>
            <p>${level.concept}</p>
            <div class="brief-meta">
                <span>最佳回合 ${level.bestTurns}</span>
                <span>最佳旋转 ${level.bestRotations}</span>
                ${renderLevelMetaIcons(level, selectedLevelIndex, { includeAlwaysTools: true })}
            </div>
        `;
    }

    function updateLayerDropdown(size) {
        rotateLayerSelect.innerHTML = '';
        for (let i = 0; i < size; i++) {
            const opt = document.createElement('option');
            opt.value = i;

            let label = `${i + 1}层`;
            if (i === 0) label += ' 底/左/后';
            else if (i === size - 1) label += ' 顶/右/前';
            else label += ' 中';

            opt.innerText = label;
            rotateLayerSelect.appendChild(opt);
        }
    }

    function syncArchiveForLevelStart(levelIndex) {
        unlockArchive('foldingMachine');
        unlockArchive('protagonistE7');
        unlockArchive('outsideOperator');
        const level = game.levels[levelIndex];
        if (!level) return;
        if (level.ais?.some(ai => ai.type === 'guardian')) unlockArchive('guardian');
        if (level.rotationEnabled) unlockArchive('rotationRule');
        if (level.bridges?.length) unlockArchive('bridgePortal');
        if (level.voids?.length) unlockArchive('voidCells');
        if (level.patchCharges) unlockArchive('patchTool');
        if (level.beaconCharges) unlockArchive('beaconTool');
        if (level.breakCharges) unlockArchive('breakTool');
        if ((level.act || 1) >= 2) unlockArchive('actTwoShell');
    }

    function hasRecentCloseThreat() {
        return game.eventLog
            .slice(-8)
            .some(entry => entry.type === 'aiMove' && Number.isFinite(entry.distanceAfter) && entry.distanceAfter <= 1);
    }

    function syncAchievementsForVictory(detail) {
        markLevelCompleted(game.currentLevelIndex);
        unlockAchievement('firstEscape');
        if (detail?.actFinale) unlockAchievement('actOneClear');
        if (game.turn <= game.currentLevel?.bestTurns) unlockAchievement('cleanRoute');
        if (hasRecentCloseThreat()) unlockAchievement('closeEscape');
        if (game.eventLog.some(entry => entry.type === 'playerMove' && entry.usedBridge)) unlockAchievement('portalCut');
    }

    function initRenderScene() {
        render.init('canvas-container', game);
        render.setInteractionMode?.(twistMode ? 'twist' : 'route');
        setTimeout(updateRotationHighlight, 100);
    }

    function setTwistMode(enabled) {
        twistMode = Boolean(enabled);
        btnTwistMode?.classList.toggle('active', twistMode);
        btnTwistMode?.setAttribute('aria-pressed', String(twistMode));
        render.setInteractionMode?.(twistMode ? 'twist' : 'route');
        if (twistMode) {
            game.clearPlannedPath();
            feel.note('Twist 模式：拖拽魔方面拧当前层', 'info');
        } else {
            render.clearLayerHighlight?.();
            feel.note('路线模式：在 3D 表面画路', 'info');
        }
    }

    function toggleEscConsole(force = null) {
        const shouldOpen = force === null
            ? !escConsole?.classList.contains('active')
            : Boolean(force);
        escConsole?.classList.toggle('active', shouldOpen);
        escConsole?.setAttribute('aria-hidden', String(!shouldOpen));
        if (shouldOpen) {
            game.updateUI();
            audio.play('uiConfirm');
        }
    }

    function setPhoneCollapsed(collapsed) {
        phonePanel?.classList.toggle('is-collapsed', collapsed);
        if (phoneNotch) {
            phoneNotch.innerText = collapsed ? '◀' : '▶';
            phoneNotch.setAttribute('aria-label', collapsed ? '展开 E-7 手机' : '收起 E-7 手机');
        }
    }

    function appendRouteBubble() {
        if (!routeCommandPreview || !commsStoryLines || game.plannedPath.length === 0) return;
        const playerLine = document.createElement('p');
        playerLine.className = 'comms-line player command-bubble';
        playerLine.textContent = routeCommandPreview.textContent.replace(/^走向：/, '路线：');
        commsStoryLines.appendChild(playerLine);
        commsStoryLines.scrollTo?.({ top: commsStoryLines.scrollHeight, behavior: 'smooth' });
        if (companionBubble) companionBubble.textContent = game.trust < 55
            ? '我会看。但我不保证每次都乖乖照做。'
            : '行，我照这条线走。你最好是对的。';
    }

    function appendCommandBubble(text) {
        if (!text || !commsStoryLines) return;
        const playerLine = document.createElement('p');
        playerLine.className = 'comms-line player command-bubble';
        playerLine.textContent = text;
        commsStoryLines.appendChild(playerLine);
        commsStoryLines.scrollTo?.({ top: commsStoryLines.scrollHeight, behavior: 'smooth' });
        markUnread('comms');
    }

    function startSelectedLevel() {
        setupOverlay.classList.remove('active');
        gameoverOverlay.classList.remove('active');
        victoryOverlay.classList.remove('active');
        gameContainer.style.display = 'grid';
        setTerminalTab('comms');
        setPhoneCollapsed(false);
        setTwistMode(false);

        game.initLevel(selectedLevelIndex);
        renderLevelComms(selectedLevelIndex);
        syncArchiveForLevelStart(selectedLevelIndex);
        updateLayerDropdown(game.N);
        initRenderScene();
        audio.start();
        audio.setTension('calm');
        feel.note(`${game.currentLevel.title} · ${game.currentLevel.chapter}`, 'info');
        feel.flashScreen('info');
    }

    function resetCurrentLevel() {
        game.initLevel(game.currentLevelIndex);
        render.buildCube3D();
        render.spawnEntities3D();
        render.resetCamera?.();
        if (render.plannedLine && render.scene) render.scene.remove(render.plannedLine);
        audio.setTension('calm');
        feel.note('残局已重置', 'warn');
        feel.flashScreen('warn');
    }

    function returnToLevelBook() {
        gameContainer.style.display = 'none';
        gameoverOverlay.classList.remove('active', 'jump-alert');
        victoryOverlay.classList.remove('active');
        setupOverlay.classList.add('active');
        audio.setTension('calm');
        setTerminalTab('comms');
        renderLevelCards();
        renderLevelBrief();
        feel.note('回到残局册', 'info');
    }

    function updateRotationHighlight() {
        const rotationPreviewChip = document.getElementById('rotation-preview-chip');
        if (rotationPreviewChip) {
            const layerText = rotateLayerSelect.selectedOptions?.[0]?.textContent?.replace(/\s+/g, ' ') || `第 ${Number(rotateLayerSelect.value || 0) + 1} 层`;
            rotationPreviewChip.innerText = `${rotateAxisSelect.value || 'X'} 轴 · ${layerText} · ↻ / ↺`;
        }

        if (!game.rotationEnabled) {
            if (render && render.clearLayerHighlight) render.clearLayerHighlight();
            return;
        }
        if (render && render.highlightLayer && rotateLayerSelect.value !== '') {
            render.highlightLayer(rotateAxisSelect.value, parseInt(rotateLayerSelect.value, 10));
        }
    }

    renderArchive();
    renderUnreadBadges();
    renderLevelCards();
    renderLevelBrief();
    updateLayerDropdown(3);
    if (analysisToneSelect) {
        analysisToneSelect.value = localStorage.getItem('failureAnalysisTone') || 'coach';
    }

    btnPrologueStart?.addEventListener('click', closePrologue);
    btnPrologueSkip?.addEventListener('click', closePrologue);

    terminalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setTerminalTab(tab.dataset.terminalTab);
            audio.play('routeTick');
        });
    });

    actPageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const page = Number(tab.dataset.actPage);
            if (!unlockedActs.has(page)) return;
            selectedActPage = page;
            renderLevelCards();
            renderLevelBrief();
            audio.play('routeTick');
        });
    });

    commsChoicesEl?.addEventListener('click', event => {
        const btn = event.target.closest('[data-comms-choice]');
        if (!btn) return;
        chooseCommsReply(Number(btn.dataset.commsChoice));
    });

    function renderStoryEvent(detail, baseSceneId, fallbackKey) {
        const sceneId = storyModule?.getEventSceneId?.(detail, game, baseSceneId) || baseSceneId;
        const eventKey = storyModule?.getEventKey?.(detail, game, sceneId) || fallbackKey;
        renderEventComms(sceneId, eventKey);
    }

    window.addEventListener('dimensionhack:event', event => {
        const detail = event.detail || {};
        const eventScenes = dialogueScript.eventScenes || {};
        if (detail.type === 'keyCollected') {
            markUnread('tasks');
            const hasGuardianPressure = Array.isArray(detail.guardianPressure) && detail.guardianPressure.length > 0;
            renderStoryEvent(
                detail,
                hasGuardianPressure ? eventScenes.guardianRage : eventScenes.keyCollected,
                hasGuardianPressure ? 'guardianRage' : 'firstKey'
            );
            pulseCompanionReaction(detail);
        } else if (detail.type === 'rotate') {
            appendCommandBubble(`指令：旋转 ${detail.axis} 轴第 ${Number(detail.layer || 0) + 1} 层 [${detail.direction === 'CW' ? '顺时针' : '逆时针'}]`);
            renderStoryEvent(detail, eventScenes.firstRotation, 'firstRotation');
            pulseCompanionReaction(detail);
        } else if (detail.type === 'patchPlaced') {
            appendCommandBubble(`指令：在 ${game.describeCell(detail.at)} 部署补片`);
            pulseCompanionReaction(detail);
        } else if (detail.type === 'beaconPlaced') {
            appendCommandBubble(`指令：在 ${game.describeCell(detail.at)} 部署诱饵`);
            pulseCompanionReaction(detail);
        } else if (detail.type === 'patchBroken') {
            appendCommandBubble(`指令：碎解 ${game.describeCell(detail.at)}`);
            pulseCompanionReaction(detail);
        } else if (detail.type === 'breakPlaced') {
            appendCommandBubble(`指令：碎解 ${game.describeCell(detail.at)}`);
            pulseCompanionReaction(detail);
        } else if (detail.type === 'skip') {
            appendCommandBubble('指令：原地待命 (跳过回合)');
            pulseCompanionReaction(detail);
        } else if (detail.type === 'gameOver') {
            markUnread('tasks');
            renderStoryEvent(detail, eventScenes.gameOver, `gameOver-${game.currentLevelIndex}-${game.turn}`);
            pulseCompanionReaction(detail);
        } else if (detail.type === 'victory') {
            markUnread('tasks');
            syncAchievementsForVictory(detail);
            if (detail.actFinale) {
                const nextAct = (game.currentLevel?.act || 1) + 1;
                unlockActPage(nextAct);
                selectFirstLevelInAct(nextAct);
            }
            renderStoryEvent(
                detail,
                detail.actFinale ? eventScenes.actFinale : eventScenes.normalVictory,
                detail.actFinale ? 'actFinale' : `victory-${game.currentLevelIndex}`
            );
            pulseCompanionReaction(detail);
        } else {
            pulseCompanionReaction(detail);
        }
    });

    startBtn.addEventListener('click', startSelectedLevel);

    btnConfirmPath.addEventListener('click', () => {
        if (!render.isAnimating) {
            feel.pulse(btnConfirmPath, 'good');
            appendRouteBubble();
            game.executePlannedPath();
        }
    });

    btnEndTurn.addEventListener('click', () => {
        if (!render.isAnimating && game.gameState === 'playing') {
            feel.note('跳过回合，敌人行动', 'danger');
            feel.flashScreen('danger');
            game.skipTurn();
        }
    });

    btnUndo.addEventListener('click', () => {
        if (!render.isAnimating) {
            if (game.undoTurn()) {
                feel.note('已悔棋一步', 'info');
            }
        }
    });

    btnReset.addEventListener('click', () => {
        if (confirm('确定要重置当前残局吗？')) {
            resetCurrentLevel();
        }
    });

    btnMainMenu?.addEventListener('click', () => {
        if (confirm('回到残局册？当前本局会暂停在这里，不会自动保存路线。')) {
            returnToLevelBook();
        }
    });

    btnEscMenu?.addEventListener('click', () => toggleEscConsole(true));
    btnConsoleResume?.addEventListener('click', () => toggleEscConsole(false));
    btnConsoleReset?.addEventListener('click', () => {
        if (confirm('确定要重置当前残局吗？')) {
            toggleEscConsole(false);
            resetCurrentLevel();
        }
    });
    btnConsoleAudio?.addEventListener('click', () => {
        audioToggle?.click();
    });
    phoneNotch?.addEventListener('click', () => {
        setPhoneCollapsed(!phonePanel?.classList.contains('is-collapsed'));
    });
    btnTwistMode?.addEventListener('click', () => {
        if (render.isAnimating) return;
        setTwistMode(!twistMode);
    });
    tutorialHelperClose?.addEventListener('click', () => {
        const card = document.getElementById('tutorial-helper-card');
        const levelId = card?.dataset.levelId;
        if (levelId) localStorage.setItem(`dawnCubeTutorialDismissed:${levelId}`, 'true');
        card?.classList.add('is-hidden');
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            toggleEscConsole();
        }
        if (event.key === 'Shift' && !event.repeat && gameContainer.style.display !== 'none') {
            setTwistMode(true);
        }
    });
    document.addEventListener('keyup', event => {
        if (event.key === 'Shift' && gameContainer.style.display !== 'none') {
            setTwistMode(false);
        }
    });

    btnToggleTracker?.addEventListener('click', () => {
        if (render.isAnimating) return;
        feel.pulse(btnToggleTracker, 'info');
        game.toggleTrackerMode();
    });

    btnClearTracker?.addEventListener('click', () => {
        if (render.isAnimating) return;
        game.clearTracker();
    });

    btnRotateCw.addEventListener('click', () => {
        if (render.isAnimating) return;
        feel.pulse(btnRotateCw, 'info');
        game.rotateLayer(rotateAxisSelect.value, parseInt(rotateLayerSelect.value, 10), 'CW');
    });

    btnRotateCcw.addEventListener('click', () => {
        if (render.isAnimating) return;
        feel.pulse(btnRotateCcw, 'info');
        game.rotateLayer(rotateAxisSelect.value, parseInt(rotateLayerSelect.value, 10), 'CCW');
    });

    toolModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (render.isAnimating) return;
            game.setToolMode(btn.dataset.toolMode);
        });
    });

    rotateAxisSelect.addEventListener('change', () => {
        audio.play('routeTick');
        updateRotationHighlight();
    });
    rotateLayerSelect.addEventListener('change', () => {
        audio.play('routeTick');
        updateRotationHighlight();
    });

    minimapCanvas?.addEventListener('pointerdown', e => {
        if (game.gameState === 'playing' && !render.isAnimating) {
            const wasPickingTracker = game.trackerMode;
            isDrawingRoute = !wasPickingTracker;
            minimapCanvas.setPointerCapture(e.pointerId);
            audio.start();
            game.handleMinimapPointer(e, true);
        }
    });

    minimapCanvas?.addEventListener('pointermove', e => {
        if (isDrawingRoute && game.gameState === 'playing' && !render.isAnimating) {
            game.handleMinimapPointer(e, false);
        }
    });

    minimapCanvas?.addEventListener('pointerup', e => {
        isDrawingRoute = false;
        if (minimapCanvas?.hasPointerCapture(e.pointerId)) {
            minimapCanvas.releasePointerCapture(e.pointerId);
        }
    });

    minimapCanvas?.addEventListener('pointerleave', () => {
        isDrawingRoute = false;
    });

    btnGameoverUndo.addEventListener('click', () => {
        if (!render.isAnimating && game.undoTurn()) {
            gameoverOverlay.classList.remove('active', 'jump-alert');
            feel.note('回到上一步，重新推演', 'info');
        }
    });

    btnToggleAnalysis?.addEventListener('click', () => {
        if (!failureAnalysis) return;
        const shouldShow = failureAnalysis.classList.contains('is-hidden');
        failureAnalysis.classList.toggle('is-hidden', !shouldShow);
        btnToggleAnalysis.innerText = shouldShow ? '收起残局复盘' : '查看残局复盘';
        if (shouldShow) {
            game.renderFailureAnalysis(analysisToneSelect?.value || 'coach');
            audio.play('uiConfirm');
        }
    });

    analysisToneSelect?.addEventListener('change', () => {
        localStorage.setItem('failureAnalysisTone', analysisToneSelect.value);
        game.renderFailureAnalysis(analysisToneSelect.value);
        audio.play('routeTick');
    });

    restartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const shouldEnterNextAct = game.gameState === 'win' && Boolean(game.currentLevel?.actFinale);
            if (shouldEnterNextAct) {
                const nextAct = (game.currentLevel?.act || 1) + 1;
                unlockActPage(nextAct);
                if (!selectFirstLevelInAct(nextAct)) {
                    selectedActPage = game.currentLevel?.act || 1;
                    selectedLevelIndex = Math.max(0, game.currentLevelIndex);
                }
            }
            gameoverOverlay.classList.remove('active', 'jump-alert');
            victoryOverlay.classList.remove('active');
            setupOverlay.classList.add('active');
            gameContainer.style.display = 'none';
            setTerminalTab('comms');
            renderLevelCards();
            renderLevelBrief();
            audio.setTension('calm');
        });
    });

    audioToggle.addEventListener('click', () => {
        const nextMuted = !audio.muted;
        audio.setMuted(nextMuted);
        feel.note(audio.muted ? '声音已关闭' : '声音已开启', audio.muted ? 'warn' : 'good');
        if (!audio.muted) {
            audio.start().then(() => audio.play('uiConfirm'));
        }
    });
});
