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

    let lastStepAdvancedTime = 0;
    let pointerdownStartCoords = { x: 0, y: 0 };
    document.addEventListener('pointerdown', event => {
        pointerdownStartCoords = { x: event.clientX, y: event.clientY };
    }, true);

    const originalUpdateUI = game.updateUI;
    game.updateUI = function() {
        originalUpdateUI.call(game);
        if (typeof updateFloatingToolsCount === 'function') {
            updateFloatingToolsCount();
        }
    };
    feel.init();

    const prologueOverlay = document.getElementById('prologue-overlay');
    const btnPrologueStart = document.getElementById('btn-prologue-start');
    const btnPrologueSkip = document.getElementById('btn-prologue-skip');
    const prologueFeed = document.getElementById('prologue-feed');
    const prologueReplies = document.getElementById('prologue-replies');
    const landingOverlay = document.getElementById('landing-overlay');
    const landingStartBtn = document.getElementById('landing-start-btn');
    const landingLevelsBtn = document.getElementById('landing-levels-btn');
    const landingArchiveBtn = document.getElementById('landing-archive-btn');
    const landingSettingsBtn = document.getElementById('landing-settings-btn');
    const landingCreditsBtn = document.getElementById('landing-credits-btn');
    const setupOverlay = document.getElementById('setup-overlay');
    const gameContainer = document.getElementById('game-container');
    const startBtn = document.getElementById('start-game-btn');
    const setupBackBtn = document.getElementById('setup-back-btn');
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
    const btnConsoleSettings = document.getElementById('btn-console-settings');
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
    const tutorialBlackout = document.getElementById('tutorial-blackout');
    const tutorialDialogueConsole = document.getElementById('tutorial-dialogue-console');
    const tutorialLedMascot = document.getElementById('tutorial-led-mascot');
    const tutorialSpeakerLabel = document.getElementById('tutorial-speaker-label');
    const tutorialDialogueText = document.getElementById('tutorial-dialogue-text');
    const tutorialDialogueNext = document.getElementById('tutorial-dialogue-next');
    const tutorialLookGesture = document.getElementById('tutorial-look-gesture');
    const tutorialLookProgress = document.getElementById('tutorial-look-progress');
    const commsFloatBubble = document.getElementById('comms-float-bubble');
    const toolsFloatBubble = document.getElementById('tools-float-bubble');
    const commsFloatBadge = document.getElementById('comms-float-badge');
    const toolsFloatBadge = document.getElementById('tools-float-badge');
    const levelHoverCard = document.getElementById('level-hover-card');
    const commsSceneTitle = document.getElementById('comms-scene-title');
    const commsBondLabel = document.getElementById('comms-bond-label');
    const commsStoryLines = document.getElementById('comms-story-lines');
    const commsLiveLine = document.getElementById('comms-live-line');
    const commsContextLine = document.getElementById('comms-context-line');
    const routeCommandPreview = document.getElementById('route-command-preview');
    const commsChoicesEl = document.querySelector('.comms-choices');
    const archiveUnlockList = document.getElementById('archive-unlock-list');
    const achievementList = document.getElementById('achievement-list');
    const langToggleBtns = document.querySelectorAll('[data-lang-toggle]');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const settingsAudioBtn = document.getElementById('settings-audio-btn');
    const settingsDevModeBtn = document.getElementById('settings-devmode-btn');
    const settingsResetTutorialsBtn = document.getElementById('settings-reset-tutorials-btn');
    const settingsClearProgressBtn = document.getElementById('settings-clear-progress-btn');
    const settingsLangBtns = document.querySelectorAll('[data-settings-lang]');
    const settingsPrecisionBtns = document.querySelectorAll('[data-settings-precision]');
    const settingsDevTuning = document.getElementById('settings-dev-tuning');
    const settingsPlayerSpeed = document.getElementById('settings-player-speed');
    const settingsEnemySpeed = document.getElementById('settings-enemy-speed');
    const settingsPlayerSpeedValue = document.getElementById('settings-player-speed-value');
    const settingsEnemySpeedValue = document.getElementById('settings-enemy-speed-value');
    const keybindButtons = document.querySelectorAll('[data-keybind-action]');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingLog = document.getElementById('loading-log');
    const loadingProgressFill = document.getElementById('loading-progress-fill');
    const bulletTimeOverlay = document.getElementById('bullet-time-overlay');
    const inspectOverlay = document.getElementById('inspect-overlay');
    const inspectTitle = document.getElementById('inspect-title');
    const inspectGoal = document.getElementById('inspect-goal');
    const inspectMeta = document.getElementById('inspect-meta');
    const inspectStartBtn = document.getElementById('inspect-start-btn');
    const inspectBackBtn = document.getElementById('inspect-back-btn');
    const archiveOverlay = document.getElementById('archive-overlay');
    const archiveCloseBtn = document.getElementById('archive-close-btn');
    const archiveRoomAchievements = document.getElementById('archive-room-achievements');
    const archiveRoomEntries = document.getElementById('archive-room-entries');
    const creditsOverlay = document.getElementById('credits-overlay');
    const creditsCloseBtn = document.getElementById('credits-close-btn');
    const phoneClock = document.getElementById('phone-clock');
    const voiceWaveCanvas = document.getElementById('voice-wave-canvas');

    const safeParseArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    };
    const safeParseObject = (key, fallback = {}) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '{}');
            return value && typeof value === 'object' && !Array.isArray(value)
                ? value
                : { ...fallback };
        } catch (error) {
            return { ...fallback };
        }
    };

    const defaultKeybinds = {
        route: 'Digit1',
        patch: 'Digit2',
        beacon: 'Digit3',
        break: 'Digit4',
        wait: 'Space',
        twist: 'Shift'
    };
    const keybindLabels = {
        Digit1: '1',
        Digit2: '2',
        Digit3: '3',
        Digit4: '4',
        Space: 'Space',
        Shift: 'Shift',
        Escape: 'Esc'
    };
    const settingsState = {
        precision: Math.max(0, Math.min(2, Number(localStorage.getItem('dawnCubeTimerPrecision') || 1))),
        devMode: localStorage.getItem('dimensionHackDevMode') === 'true',
        playerMoveMs: Math.max(360, Math.min(900, Number(localStorage.getItem('dawnCubePlayerMoveMs') || 600))),
        enemySpeedScale: Math.max(0.5, Math.min(1.8, Number(localStorage.getItem('dawnCubeEnemySpeedScale') || 1))),
        keybinds: {
            ...defaultKeybinds,
            ...safeParseObject('dawnCubeKeybinds', defaultKeybinds)
        }
    };
    let listeningKeybindAction = null;
    window.dawnCubeSettings = settingsState;

    let selectedLevelIndex = 0;
    let selectedActPage = 1;
    let isDrawingRoute = false;
    let isGameActive = false;
    const PHONE_COLLAPSED_KEY = 'dawnCubePhoneCollapsed';
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
        lastReply: '',
        currentChoices: []
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
        if (settingsState.devMode) return true;
        const requiredNumbers = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]);
        game.levels.forEach((level, index) => {
            if (completedLevels.has(index)) requiredNumbers.delete(level.number || index + 1);
        });
        return requiredNumbers.size === 0;
    }

    function isLevelVisible(level) {
        if (settingsState.devMode) return true;
        return !level.hiddenUntilActOneClear || isHiddenCrazyUnlocked();
    }

    function isLevelUnlockedForStar(index) {
        if (settingsState.devMode) return true;
        if (completedLevels.has(index)) return true;
        const sameAct = game.levels[index]?.act || 1;
        const visibleActLevels = game.levels
            .map((level, levelIndex) => ({ level, index: levelIndex }))
            .filter(item => (item.level.act || 1) === sameAct && isLevelVisible(item.level));
        const firstIncomplete = visibleActLevels.find(item => !completedLevels.has(item.index));
        return firstIncomplete?.index === index;
    }

    const leoStarMap = [
        [14, 54], [23, 38], [34, 27], [47, 22], [61, 30], [72, 44],
        [63, 58], [50, 63], [40, 75], [27, 80], [18, 70], [36, 48]
    ];

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
            body: '你能点格、拧空间、悔棋。她看不见你的世界，只知道你下一步会不会乱来。'
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
        clearPrologueTimers();
        prologueOverlay?.classList.remove('active');
        landingOverlay?.classList.add('active');
        setupOverlay.classList.remove('active');
        gameContainer.classList.add('preplay-stage');
        render.setPresentationMode?.('landing');
        renderCommsScene(dialogueScript.defaultScene, { force: true });
        feel.note('链路已接通', 'info');
    }

    const prologueScripts = {
        zh: [
            { who: 'sys', text: 'LINK SELF-CHECK... failed twice, trying anyway.' },
            { who: 'sys', text: '未知坐标: CUBE_SURFACE / 呼吸信号: 1' },
            { who: 'dawn', text: '……喂？谁在我手机里？' },
            { who: 'dawn', text: '我刚刚还在床上。现在床没了，地面也很可疑。' },
            { who: 'dawn', text: '那个发亮的格子是你点的？先说好，我不随便跟陌生信号走。' },
            { who: 'dawn', text: '……但我想回家。所以你最好真的会带路。' }
        ],
        en: [
            { who: 'sys', text: 'LINK SELF-CHECK... failed twice, trying anyway.' },
            { who: 'sys', text: 'Unknown coordinate: CUBE_SURFACE / heartbeat: 1' },
            { who: 'dawn', text: '...Hello? Who is inside my phone?' },
            { who: 'dawn', text: 'I was in bed five seconds ago. The bed is gone. The floor is also suspicious.' },
            { who: 'dawn', text: 'Did you light up that tile? Great. I do not follow strange signals for free.' },
            { who: 'dawn', text: '...But I want to go home. So you had better know where you are pointing.' }
        ]
    };

    const prologueReplyText = {
        zh: {
            steady: '行。你先证明你不是那种越救越乱的热心人。',
            warm: '别用那种表情。好吧，有人看着也比没人强。',
            tease: '试营业？你们外侧的人都这么欠吗。算了，先救我。'
        },
        en: {
            steady: 'Fine. Prove you are not a disaster with a cursor.',
            warm: 'Do not make that face. Fine. Being watched beats being alone.',
            tease: 'Trial run? Are all outside people this annoying? Whatever. Rescue first.'
        }
    };
    const prologueTimers = new Set();
    let prologueRenderedLines = [];

    function clearPrologueTimers() {
        prologueTimers.forEach(timer => {
            window.clearTimeout(timer);
            window.clearInterval(timer);
        });
        prologueTimers.clear();
    }

    function schedulePrologue(fn, delay) {
        const timer = window.setTimeout(() => {
            prologueTimers.delete(timer);
            fn();
        }, delay);
        prologueTimers.add(timer);
        return timer;
    }

    function getProloguePrefix(who) {
        if (who === 'sys') return '> ';
        if (who === 'you') return window.currentLang === 'en' ? 'You: ' : '你：';
        return 'Dawn: ';
    }

    function appendPrologueLine(line, options = {}) {
        if (!prologueFeed) return;
        if (options.remember !== false) {
            prologueRenderedLines.push({ ...line });
        }
        const row = document.createElement('p');
        row.className = `prologue-line ${line.who}`;
        const prefix = getProloguePrefix(line.who);
        const text = textOf(line.text);
        row.textContent = prefix;
        prologueFeed.appendChild(row);
        prologueFeed.scrollTo?.({ top: prologueFeed.scrollHeight, behavior: 'smooth' });
        if (options.instant) {
            row.textContent = `${prefix}${text}`;
            return;
        }
        let index = 0;
        const timer = window.setInterval(() => {
            index += 1;
            row.textContent = `${prefix}${text.slice(0, index)}`;
            prologueFeed.scrollTo?.({ top: prologueFeed.scrollHeight, behavior: 'smooth' });
            if (index >= text.length) {
                window.clearInterval(timer);
                prologueTimers.delete(timer);
            }
        }, line.who === 'sys' ? 12 : 18);
        prologueTimers.add(timer);
    }

    function runPrologueSequence() {
        if (!prologueFeed) return;
        clearPrologueTimers();
        prologueRenderedLines = [];
        prologueFeed.innerHTML = '';
        prologueReplies?.classList.add('is-disabled');
        btnPrologueStart?.classList.add('is-hidden');
        const lines = prologueScripts[window.currentLang === 'en' ? 'en' : 'zh'];
        lines.forEach((line, index) => {
            schedulePrologue(() => appendPrologueLine({ ...line, scriptIndex: index }), 280 + index * 620);
        });
        schedulePrologue(() => prologueReplies?.classList.remove('is-disabled'), 520 + lines.length * 620);
    }

    function translateStoredPrologueLine(line) {
        const lang = window.currentLang === 'en' ? 'en' : 'zh';
        if (Number.isInteger(line.scriptIndex)) {
            return { ...prologueScripts[lang][line.scriptIndex], scriptIndex: line.scriptIndex };
        }
        if (line.replyTone) {
            if (line.who === 'you') {
                return { ...line, text: window.t?.(`prologue.reply.${line.replyTone}`) || line.replyTone };
            }
            if (line.who === 'dawn') {
                return { ...line, text: prologueReplyText[lang][line.replyTone] || prologueReplyText[lang].steady };
            }
        }
        return line;
    }

    function rerenderPrologueLanguageInPlace() {
        if (!prologueFeed) return;
        clearPrologueTimers();
        const rendered = prologueRenderedLines.map(translateStoredPrologueLine);
        prologueRenderedLines = [];
        prologueFeed.innerHTML = '';
        rendered.forEach(line => appendPrologueLine(line, { instant: true }));
    }

    function handlePrologueReply(tone) {
        const lang = window.currentLang === 'en' ? 'en' : 'zh';
        appendPrologueLine({ who: 'you', replyTone: tone, text: window.t?.(`prologue.reply.${tone}`) || tone });
        appendPrologueLine({ who: 'dawn', replyTone: tone, text: prologueReplyText[lang][tone] || prologueReplyText[lang].steady });
        prologueReplies?.classList.add('is-disabled');
        btnPrologueStart?.classList.remove('is-hidden');
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
        const commsCount = unreadCounts.comms || 0;
        if (commsFloatBadge) {
            commsFloatBadge.textContent = commsCount > 9 ? '9+' : String(commsCount);
            commsFloatBadge.classList.toggle('is-hidden', commsCount <= 0);
        }
        const toolCount = game.currentLevel
            ? Number(Boolean(game.rotationEnabled)) + Number(game.patchCharges > 0) + Number(game.beaconCharges > 0) + Number(game.breakCharges > 0)
            : 0;
        if (toolsFloatBadge) {
            toolsFloatBadge.textContent = String(toolCount);
            toolsFloatBadge.classList.toggle('is-hidden', toolCount <= 0);
        }
        toolsFloatBubble?.classList.toggle('has-tools', toolCount > 0);
    }

    function clearUnread(tabName) {
        if (!Object.prototype.hasOwnProperty.call(unreadCounts, tabName)) return;
        unreadCounts[tabName] = 0;
        renderUnreadBadges();
    }

    function markUnread(tabName, amount = 1) {
        if (!Object.prototype.hasOwnProperty.call(unreadCounts, tabName)) return;
        if (getActiveTerminalTab() === tabName) return;
        if (!isGameActive) return;
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

    function textOf(value) {
        return window.getText ? window.getText(value) : (value ?? '');
    }

    function getDefaultPhoneCollapsed() {
        const stored = localStorage.getItem(PHONE_COLLAPSED_KEY);
        return stored === null ? true : stored === 'true';
    }

    function escapeHtml(value) {
        return String(textOf(value))
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getLevelStats(level) {
        const enemyCounts = getEnemyCounts(level);
        const totalEnemies = Object.values(enemyCounts).reduce((sum, count) => sum + count, 0);
        const keyCount = level.keyCell !== null && level.keyCell !== undefined ? 1 : 0;
        const newMechanics = [];
        const firstRotationIndex = getFirstLevelIndex(item => item.rotationEnabled);
        const firstBridgeIndex = getFirstLevelIndex(item => item.bridges?.length);
        const firstVoidIndex = getFirstLevelIndex(item => item.voids?.length);
        const firstPatchIndex = getFirstLevelIndex(item => item.patchCharges);
        const firstBeaconIndex = getFirstLevelIndex(item => item.beaconCharges);
        const firstBreakIndex = getFirstLevelIndex(item => item.breakCharges);
        const levelIndex = game.levels.indexOf(level);
        if (level.rotationEnabled && levelIndex === firstRotationIndex) newMechanics.push('空间折叠');
        if (level.bridges?.length && levelIndex === firstBridgeIndex) newMechanics.push('传送裂缝');
        if (level.voids?.length && levelIndex === firstVoidIndex) newMechanics.push('缺面');
        if (level.patchCharges && levelIndex === firstPatchIndex) newMechanics.push('补片');
        if (level.beaconCharges && levelIndex === firstBeaconIndex) newMechanics.push('诱饵');
        if (level.breakCharges && levelIndex === firstBreakIndex) newMechanics.push('碎解');
        return { enemyCounts, totalEnemies, keyCount, newMechanics };
    }

    function renderScannerChips(level, index, { compact = false } = {}) {
        const stats = getLevelStats(level);
        const enemyText = Object.entries(stats.enemyCounts)
            .map(([type, count]) => `${enemyMeta[type]?.label || type} x${count}`)
            .join(' / ') || '无敌人';
        const chips = [
            `<span class="scanner-chip ${stats.totalEnemies ? 'danger' : 'safe'}">敌 ${stats.totalEnemies}</span>`,
            `<span class="scanner-chip key">钥 ${stats.keyCount}</span>`,
            `<span class="scanner-chip">门 1</span>`
        ];
        if (!compact) {
            chips.push(`<span class="scanner-chip wide">${escapeHtml(enemyText)}</span>`);
        }
        stats.newMechanics.forEach(name => {
            chips.push(`<span class="scanner-chip new">NEW ${escapeHtml(name)}</span>`);
        });
        return chips.join('');
    }

    function setCompanionBubble(text, tone = 'info', options = {}) {
        const line = textOf(text) || '';
        if (companionBubble) companionBubble.textContent = line;
        if (!options.suppressHeadBubble) render.setPlayerSpeechBubble?.(line, tone);
        pulsePhoneVoice(tone === 'danger' ? 1300 : 900);
    }

    function pickKaomoji(tone, fallbackFace) {
        const lib = window.KAOMOJI_LIB?.[tone] || [];
        if (!lib.length) {
            return {
                face: fallbackFace,
                label: { zh: tone || '回应', en: tone || 'Reply' },
                aria: { zh: '颜文字回应', en: 'Emoji reply' }
            };
        }
        const index = Math.floor(Math.random() * lib.length);
        return lib[index];
    }

    function applyLanguage() {
        document.documentElement.lang = window.currentLang === 'en' ? 'en' : 'zh-CN';
        document.querySelectorAll('[data-i18n]').forEach(node => {
            node.textContent = window.t?.(node.dataset.i18n) || node.textContent;
            if (node.classList.contains('glitch-text')) {
                node.dataset.text = node.textContent;
            }
        });
        langToggleBtns.forEach(btn => {
            btn.textContent = window.currentLang === 'en' ? 'EN / 中' : '中 / EN';
            btn.setAttribute('aria-label', window.currentLang === 'en' ? 'Switch to Chinese' : '切换到英文');
        });

        // 就地翻译四大主控按钮的 title 批注说明
        const btnMenu = document.getElementById('btn-esc-menu');
        const btnUndo = document.getElementById('btn-undo');
        const btnReset = document.getElementById('btn-reset');
        const btnTwist = document.getElementById('btn-twist-mode');

        if (btnMenu) btnMenu.setAttribute('title', window.t?.('meta.menu') || '控制台菜单 (Esc)');
        if (btnUndo) btnUndo.setAttribute('title', window.t?.('meta.undo') || '逆熵悔棋：回退一步 (↶)');
        if (btnReset) btnReset.setAttribute('title', window.t?.('meta.reset') || '时空重构：重置本局 (⟲)');
        if (btnTwist) btnTwist.setAttribute('title', window.t?.('meta.twist') || '空间折叠：拖拽控制环旋转一层魔方 (Shift)');

        renderArchive();
        renderLevelCards();
        renderLevelBrief();
        renderSettingsPanel();
        game.updateUI?.();
    }
    window.updateUILanguage = applyLanguage;

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
                .join('') || `<p class="archive-empty">${escapeHtml(window.t?.('archive.empty') || '还没有新档案。先活过这一局。')}</p>`;
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
                                <p>${escapeHtml(unlocked ? achievement.body : (window.t?.('archive.locked') || '未解锁'))}</p>
                            </div>
                        </article>
                    `;
                })
                .join('');
        }
        renderArchiveRoom();
    }

    function renderArchiveRoom() {
        if (archiveRoomAchievements) {
            archiveRoomAchievements.innerHTML = achievements
                .map(achievement => {
                    const unlocked = archiveState.achievements.has(achievement.id);
                    return `<article class="archive-room-item ${unlocked ? 'unlocked' : 'locked'}">
                        <strong>${unlocked ? '◆' : '◇'} ${escapeHtml(achievement.title)}</strong>
                        <p>${escapeHtml(unlocked ? achievement.body : (window.t?.('archive.locked') || '未解锁'))}</p>
                    </article>`;
                })
                .join('');
        }
        if (archiveRoomEntries) {
            const unlockedEntries = archiveEntries.filter(entry => archiveState.entries.has(entry.id));
            archiveRoomEntries.innerHTML = unlockedEntries
                .map(entry => `<article class="archive-room-item">
                    <strong>▣ ${escapeHtml(entry.title)}</strong>
                    <p>${escapeHtml(entry.body)}</p>
                </article>`)
                .join('') || `<p class="archive-empty">${escapeHtml(window.t?.('archive.empty') || '还没有新档案。先活过这一局。')}</p>`;
        }
    }

    function openArchiveRoom() {
        renderArchiveRoom();
        landingOverlay?.classList.remove('active');
        archiveOverlay?.classList.add('active');
        archiveOverlay?.setAttribute('aria-hidden', 'false');
        audio.play('uiConfirm');
    }

    function closeArchiveRoom() {
        archiveOverlay?.classList.remove('active');
        archiveOverlay?.setAttribute('aria-hidden', 'true');
        landingOverlay?.classList.add('active');
    }

    function openCredits() {
        landingOverlay?.classList.remove('active');
        creditsOverlay?.classList.add('active');
        creditsOverlay?.setAttribute('aria-hidden', 'false');
        audio.play('uiConfirm');
    }

    function closeCredits() {
        creditsOverlay?.classList.remove('active');
        creditsOverlay?.setAttribute('aria-hidden', 'true');
        landingOverlay?.classList.add('active');
    }

    function updatePhoneClock() {
        if (!phoneClock) return;
        const now = new Date();
        phoneClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function drawVoiceWave(talking = false) {
        const canvas = voiceWaveCanvas;
        const ctx = canvas?.getContext?.('2d');
        if (!ctx) return;
        const width = canvas.width;
        const height = canvas.height;
        const time = performance.now() / 1000;
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = talking ? 5 : 3;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(0.55, '#00ff88');
        gradient.addColorStop(1, '#ff00a1');
        ctx.strokeStyle = gradient;
        ctx.shadowColor = talking ? '#ff00a1' : '#00f0ff';
        ctx.shadowBlur = talking ? 16 : 9;
        ctx.beginPath();
        const amp = talking ? 16 : 7;
        const freq = talking ? 0.075 : 0.04;
        for (let x = 0; x <= width; x += 4) {
            const y = height / 2
                + Math.sin(x * freq + time * (talking ? 7 : 2.2)) * amp
                + Math.sin(x * freq * 0.43 + time * 1.7) * amp * 0.35;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function pulsePhoneVoice(duration = 950) {
        phonePanel?.classList.add('is-talking');
        window.clearTimeout(pulsePhoneVoice.timer);
        pulsePhoneVoice.timer = window.setTimeout(() => phonePanel?.classList.remove('is-talking'), duration);
    }

    function startPhoneWaveLoop() {
        updatePhoneClock();
        drawVoiceWave(phonePanel?.classList.contains('is-talking'));
        requestAnimationFrame(startPhoneWaveLoop);
    }

    async function showLoadingSequence(level) {
        if (!loadingOverlay || !loadingLog || !loadingProgressFill) return;
        const lines = [
            '> ESTABLISHING D-LINK TO E-7... [OK]',
            `> TARGET: ${textOf(level?.title) || 'UNKNOWN'} ... [SYNC]`,
            '> SYNCHRONIZING SPATIAL MATRIX... 67%',
            '> WARNING: TRACKING THREAT ENGINES...',
            '> HANDOFF READY.'
        ];
        loadingLog.innerHTML = '';
        loadingProgressFill.style.setProperty('--loading-progress', '0%');
        loadingOverlay.classList.add('active');
        loadingOverlay.setAttribute('aria-hidden', 'false');
        for (let i = 0; i < lines.length; i += 1) {
            const row = document.createElement('p');
            row.textContent = lines[i];
            loadingLog.appendChild(row);
            loadingProgressFill.style.setProperty('--loading-progress', `${Math.round(((i + 1) / lines.length) * 100)}%`);
            audio.play(i === lines.length - 1 ? 'uiConfirm' : 'routeTick');
            await new Promise(resolve => window.setTimeout(resolve, 110));
        }
        await new Promise(resolve => window.setTimeout(resolve, 120));
        loadingOverlay.classList.remove('active');
        loadingOverlay.setAttribute('aria-hidden', 'true');
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
        commsState.currentChoices = (scene.replies || []).map(reply => {
            const tone = reply.tone || 'steady';
            const emoji = pickKaomoji(tone, reply.face);
            return {
                ...reply,
                originalFace: reply.face,
                face: emoji.face || reply.face,
                label: emoji.label || reply.label || { zh: tone, en: tone },
                aria: emoji.aria || reply.aria || { zh: '颜文字回应', en: 'Emoji reply' }
            };
        });

        if (commsSceneTitle) commsSceneTitle.textContent = textOf(scene.title) || window.t?.('comms.scene') || '通讯';
        if (commsBondLabel) commsBondLabel.textContent = getBondLabel();
        if (companionStatus) companionStatus.textContent = textOf(scene.status) || window.t?.('comms.signalStable') || '信号稳定';
        setCompanionBubble(textOf(scene.bubble) || textOf(scene.lines?.[0]) || window.t?.('comms.live') || '我在。');
        if (commsContextLine) {
            commsContextLine.textContent = storyModule?.getContextLine?.(scene, commsState, game)
                || (game.currentLevel
                    ? `${textOf(game.currentLevel.title)} · ${textOf(game.currentLevel.chapter)}。${window.t?.('comms.contextShort') || '玩家只回表情；她会慢慢讲。'}`
                    : (window.t?.('comms.context') || '通讯只在安全间隙展开；路线直接在 3D 魔方上画。'));
        }

        if (commsStoryLines) {
            commsStoryLines.innerHTML = (scene.lines || [])
                .map(line => `<p class="comms-line protagonist">${escapeHtml(textOf(line))}</p>`)
                .join('');
        }
        if (commsLiveLine) {
            commsLiveLine.textContent = window.t?.('comms.chooseEmoji') || '选择一个表情回她。';
            commsLiveLine.className = 'comms-line system';
        }
        if (commsChoicesEl) {
            commsChoicesEl.innerHTML = commsState.currentChoices
                .map((reply, index) => `
                    <button class="terminal-choice kaomoji-choice" type="button" data-comms-choice="${index}" aria-label="${escapeHtml(textOf(reply.aria) || '颜文字回应')}">
                        <span class="kaomoji-face">${escapeHtml(reply.face)}</span>
                        <small>[ ${escapeHtml(textOf(reply.label) || reply.tone || '回应')} ]</small>
                    </button>
                `)
                .join('');
        }
        markUnread('comms');
    }

    function chooseCommsReply(choiceIndex) {
        const scene = dialogueScript.scenes[commsState.activeSceneId];
        const reply = commsState.currentChoices?.[choiceIndex] || scene?.replies?.[choiceIndex];
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
            commsLiveLine.textContent = textOf(reply.response);
        }
        setCompanionBubble(textOf(reply.bubble) || textOf(reply.response), reply.tone === 'warm' ? 'info' : (reply.tone === 'tease' ? 'warn' : 'info'));
            if (commsContextLine) {
                commsContextLine.textContent = game.currentLevel
                ? `${textOf(game.currentLevel.title)}：${window.t?.('comms.recordedRoute') || '通讯已记录。路线直接在 3D 魔方上画。'}`
                : (window.t?.('comms.recorded') || '通讯已记录。');
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
        setCompanionBubble(line, detail.type === 'gameOver' ? 'danger' : (detail.type === 'victory' ? 'info' : 'warn'));
        markUnread('comms');
    }

    window.commsController = {
        syncFromGame(currentGame) {
            const scene = dialogueScript.scenes[commsState.activeSceneId];
            if (!scene || commsState.lastReply) return;
            if (companionStatus) companionStatus.textContent = textOf(scene.status) || window.t?.('comms.signalStable') || '信号稳定';
            setCompanionBubble(storyModule?.getAmbientBubble?.({
                scene,
                state: commsState,
                game: currentGame
            }) || textOf(scene.bubble) || window.t?.('comms.live') || '我在。');
            if (commsContextLine) {
                commsContextLine.textContent = storyModule?.getContextLine?.(scene, commsState, currentGame)
                    || (currentGame?.currentLevel
                        ? `${textOf(currentGame.currentLevel.title)} · ${textOf(currentGame.currentLevel.chapter)}。${window.t?.('comms.contextShort') || '玩家只回表情；她会慢慢讲。'}`
                        : (window.t?.('comms.context') || '通讯只在安全间隙展开；路线直接在 3D 魔方上画。'));
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

    function showLevelHover(card, level, index, event) {
        if (!levelHoverCard) return;
        const stats = getLevelStats(level);
        levelHoverCard.innerHTML = `
            <span class="hover-kicker">TACTICAL SCAN</span>
            <strong>${escapeHtml(textOf(level.title))}</strong>
            <small>${escapeHtml(textOf(level.chapter))}</small>
            <div class="hover-chip-row">${renderScannerChips(level, index, { compact: true })}</div>
            ${stats.newMechanics.length ? `<div class="hover-new">⚠ NEW ${escapeHtml(stats.newMechanics.join(' / '))}</div>` : ''}
            <p>${escapeHtml(textOf(level.concept))}</p>
        `;
        levelHoverCard.classList.add('active');
        levelHoverCard.setAttribute('aria-hidden', 'false');
        moveLevelHover(event);
    }

    function moveLevelHover(event) {
        if (!levelHoverCard?.classList.contains('active')) return;
        const offset = 18;
        const rect = levelHoverCard.getBoundingClientRect();
        const x = Math.min(window.innerWidth - rect.width - 12, event.clientX + offset);
        const y = Math.min(window.innerHeight - rect.height - 12, event.clientY + offset);
        levelHoverCard.style.setProperty('--hover-x', `${Math.max(12, x)}px`);
        levelHoverCard.style.setProperty('--hover-y', `${Math.max(12, y)}px`);
    }

    function hideLevelHover() {
        levelHoverCard?.classList.remove('active');
        levelHoverCard?.setAttribute('aria-hidden', 'true');
    }

    function updateActPageTabs() {
        actPageTabs.forEach(tab => {
            const page = Number(tab.dataset.actPage);
            const hasLevels = game.levels.some(level => (level.act || 1) === page);
            tab.classList.toggle('is-hidden', !hasLevels || (!settingsState.devMode && !unlockedActs.has(page)));
            tab.classList.toggle('active', page === selectedActPage);
            tab.setAttribute('aria-selected', String(page === selectedActPage));
        });
    }

    function renderLevelCards() {
        levelListEl.innerHTML = '';
        if (!settingsState.devMode && !unlockedActs.has(selectedActPage)) {
            selectedActPage = 1;
        }

        const visibleLevels = game.levels
            .map((level, index) => ({ level, index }))
            .filter(item => (item.level.act || 1) === selectedActPage && isLevelVisible(item.level) && isLevelUnlockedForStar(item.index));
        if (!visibleLevels.some(item => item.index === selectedLevelIndex)) {
            selectedLevelIndex = visibleLevels[0]?.index || 0;
        }
        updateActPageTabs();

        const starPoints = [];
        visibleLevels.forEach(({ level, index }) => {
            const actClass = `act-${level.act || 1}`;
            const card = document.createElement('button');
            card.className = `level-card ${actClass} ${index === selectedLevelIndex ? 'active' : ''}`;
            card.type = 'button';
            card.dataset.levelIndex = index;
            const localIndex = visibleLevels.findIndex(item => item.index === index);
            const t = visibleLevels.length <= 1 ? 0.5 : localIndex / (visibleLevels.length - 1);
            const leo = leoStarMap[localIndex % leoStarMap.length];
            const x = leo ? leo[0] : 50 + Math.sin(t * Math.PI * 2) * 30;
            const y = leo ? leo[1] : 12 + t * 76;
            const starX = Math.max(12, Math.min(88, x));
            const starY = Math.max(10, Math.min(90, y));
            card.style.setProperty('--star-x', `${starX.toFixed(2)}%`);
            card.style.setProperty('--star-y', `${starY.toFixed(2)}%`);
            card.classList.toggle('completed', completedLevels.has(index));
            card.classList.toggle('frontier', !completedLevels.has(index));
            card.classList.toggle('dev-unlocked', settingsState.devMode);
            starPoints.push({
                x: starX,
                y: starY,
                completed: completedLevels.has(index),
                frontier: !completedLevels.has(index)
            });
            const levelCode = textOf(level.title).split(' ')[0] || `L${index + 1}`;
            card.innerHTML = `
                <span class="level-card-title">${escapeHtml(levelCode)}</span>
                <span class="level-card-chapter">${escapeHtml(textOf(level.chapter))}</span>
                <span class="level-card-meta">
                    ${renderLevelMetaIcons(level, index)}
                </span>
                <span class="level-card-concept">${escapeHtml(textOf(level.concept))}</span>
            `;
            card.removeAttribute('title');
            card.addEventListener('mouseenter', event => showLevelHover(card, level, index, event));
            card.addEventListener('mousemove', moveLevelHover);
            card.addEventListener('mouseleave', hideLevelHover);
            card.addEventListener('focus', event => {
                const rect = card.getBoundingClientRect();
                showLevelHover(card, level, index, { clientX: rect.right, clientY: rect.top });
            });
            card.addEventListener('blur', hideLevelHover);
            card.addEventListener('click', () => {
                hideLevelHover();
                selectedLevelIndex = index;
                renderLevelCards();
                renderLevelBrief();
                enterInspectPreview(index);
                feel.note(`${textOf(level.title)} 已选中`, 'info');
            });
            levelListEl.appendChild(card);
        });

        starPoints.slice(1).forEach((point, i) => {
            const previous = starPoints[i];
            const line = document.createElement('span');
            line.className = 'leo-star-line';
            const dx = point.x - previous.x;
            const dy = point.y - previous.y;
            const length = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            line.style.setProperty('--line-x', `${previous.x.toFixed(2)}%`);
            line.style.setProperty('--line-y', `${previous.y.toFixed(2)}%`);
            line.style.setProperty('--line-length', `${length.toFixed(2)}%`);
            line.style.setProperty('--line-angle', `${angle.toFixed(2)}deg`);
            line.classList.toggle('completed', previous.completed && point.completed);
            line.classList.toggle('frontier', previous.completed && point.frontier);
            levelListEl.prepend(line);
        });
    }

    function renderLevelBrief() {
        if (!levelBriefEl) return;
        const selectedAct = game.levels[selectedLevelIndex]?.act || 1;
        if (!settingsState.devMode && !unlockedActs.has(selectedAct)) {
            selectedLevelIndex = 0;
            selectedActPage = 1;
        }
        updateActPageTabs();
        const level = game.levels[selectedLevelIndex];
        levelBriefEl.innerHTML = `
            <div class="brief-title">${escapeHtml(textOf(level.title))} · ${escapeHtml(textOf(level.chapter))}</div>
            <p>${escapeHtml(textOf(level.concept))}</p>
            <div class="brief-meta">
                <span>最佳回合 ${level.bestTurns}</span>
                <span>最佳旋转 ${level.bestRotations}</span>
                ${renderLevelMetaIcons(level, selectedLevelIndex, { includeAlwaysTools: true })}
            </div>
        `;
    }

    function renderInspectOverlay() {
        const level = game.levels[selectedLevelIndex];
        if (!level) return;
        const stats = getLevelStats(level);
        if (inspectTitle) inspectTitle.textContent = '战术简报';
        if (inspectGoal) {
            inspectGoal.innerHTML = `
                <span class="briefing-kicker">${escapeHtml(textOf(level.title))} · ${escapeHtml(textOf(level.chapter))}</span>
                <b>${escapeHtml(textOf(level.tutorial?.goal || level.concept))}</b>
            `;
        }
        if (inspectMeta) {
            inspectMeta.innerHTML = `
                <article class="scanner-card">
                    <div class="scanner-card-head">
                        <span>SCANNER CARD</span>
                        ${stats.newMechanics.length ? '<b>⚠ NEW</b>' : '<em>CLEAR</em>'}
                    </div>
                    <div class="scanner-grid">
                        ${renderScannerChips(level, selectedLevelIndex)}
                    </div>
                    <div class="scanner-icons">
                        ${renderLevelMetaIcons(level, selectedLevelIndex, { includeAlwaysTools: true }) || '<span class="scanner-chip safe">基础逃生</span>'}
                    </div>
                </article>
                <article class="briefing-log">
                    <span>BRIEFING LOG</span>
                    <p>${escapeHtml(textOf(level.concept))}</p>
                    <small>建议回合 ${Number(level.bestTurns || 0)} · 建议折叠 ${Number(level.bestRotations || 0)}</small>
                </article>
            `;
        }
    }

    function enterInspectPreview(index = selectedLevelIndex) {
        const level = game.levels[index];
        if (!level) return;
        selectedLevelIndex = index;
        isGameActive = false;
        setBulletTimeActive(false);
        setTwistMode(false);
        setupOverlay.classList.remove('active');
        gameoverOverlay.classList.remove('active', 'jump-alert', 'signal-lost');
        victoryOverlay.classList.remove('active');
        gameContainer.style.display = 'grid';
        gameContainer.classList.add('preplay-stage', 'inspect-stage');
        game.initLevel(index, true);
        hideTutorialDialogue();
        game.setRealtimeMode?.(false);
        game.stopRealtime?.();
        game.gameState = 'setup';
        updateLayerDropdown(game.N);
        initRenderScene();
        render.setPresentationMode?.('setup');
        renderInspectOverlay();
        inspectOverlay?.classList.add('active');
        inspectOverlay?.setAttribute('aria-hidden', 'false');
        audio.setTension('calm');
    }

    function exitInspectPreview() {
        inspectOverlay?.classList.remove('active');
        inspectOverlay?.setAttribute('aria-hidden', 'true');
        game.stopRealtime?.();
        game.gameState = 'menu';
        gameContainer.classList.add('preplay-stage');
        gameContainer.classList.remove('inspect-stage');
        setupOverlay.classList.add('active');
        render.setPresentationMode?.('constellation');
        renderLevelCards();
        renderLevelBrief();
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

    function showLanding() {
        isGameActive = false;
        landingOverlay?.classList.add('active');
        setupOverlay.classList.remove('active');
        inspectOverlay?.classList.remove('active');
        inspectOverlay?.setAttribute('aria-hidden', 'true');
        gameoverOverlay?.classList.remove('active', 'jump-alert', 'signal-lost');
        victoryOverlay?.classList.remove('active');
        gameContainer.classList.add('preplay-stage');
        gameContainer.classList.remove('inspect-stage');
        render.setPresentationMode?.('landing');
        audio.setTension('calm');
    }

    function showLevelBook({ openArchive = false } = {}) {
        isGameActive = false;
        landingOverlay?.classList.remove('active');
        setupOverlay.classList.add('active');
        inspectOverlay?.classList.remove('active');
        inspectOverlay?.setAttribute('aria-hidden', 'true');
        gameContainer.classList.add('preplay-stage');
        gameContainer.classList.remove('inspect-stage');
        render.setPresentationMode?.('constellation');
        renderLevelCards();
        renderLevelBrief();
        if (openArchive) {
            unlockArchive('foldingMachine');
            unlockArchive('protagonistE7');
            feel.note('档案矩阵已同步到右侧手机，进入残局后可查看', 'info');
        } else {
            feel.note('残局目录已打开', 'info');
        }
    }

    function setTwistMode(enabled) {
        twistMode = Boolean(enabled);
        btnTwistMode?.classList.toggle('active', twistMode);
        btnTwistMode?.setAttribute('aria-pressed', String(twistMode));
        render.setInteractionMode?.(twistMode ? 'twist' : 'route');
        if (twistMode) {
            game.clearPlannedPath();
            feel.note('空间折叠：拖拽魔方面拧当前层，世界流速放慢', 'info');
        } else {
            render.clearLayerHighlight?.();
            feel.note(game.realtimeMode ? '直控模式：点击相邻格移动' : '路线模式：在 3D 表面画路', 'info');
        }
    }

    function toggleEscConsole(force = null) {
        const shouldOpen = force === null
            ? !escConsole?.classList.contains('active')
            : Boolean(force);
        escConsole?.classList.toggle('active', shouldOpen);
        escConsole?.setAttribute('aria-hidden', String(!shouldOpen));
        game.setRealtimePaused?.(shouldOpen);
        if (shouldOpen) setBulletTimeActive(false);
        if (shouldOpen) {
            game.updateUI();
            audio.play('uiConfirm');
        }
    }

    function keyLabel(code) {
        if (!code) return '?';
        if (keybindLabels[code]) return keybindLabels[code];
        return code.replace(/^Key/, '').replace(/^Digit/, '');
    }

    function normalizeKeyCode(event) {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') return 'Shift';
        if (event.code === 'ControlLeft' || event.code === 'ControlRight') return 'Control';
        if (event.code === 'AltLeft' || event.code === 'AltRight') return 'Alt';
        if (event.code === 'MetaLeft' || event.code === 'MetaRight') return 'Meta';
        return event.code || event.key;
    }

    function persistSettings() {
        localStorage.setItem('dawnCubeTimerPrecision', String(settingsState.precision));
        localStorage.setItem('dimensionHackDevMode', String(settingsState.devMode));
        localStorage.setItem('dawnCubePlayerMoveMs', String(settingsState.playerMoveMs));
        localStorage.setItem('dawnCubeEnemySpeedScale', String(settingsState.enemySpeedScale));
        localStorage.setItem('dawnCubeKeybinds', JSON.stringify(settingsState.keybinds));
        window.dawnCubeSettings = settingsState;
        game.applyRealtimeTuning?.(settingsState);
    }

    function renderSettingsPanel() {
        settingsLangBtns.forEach(btn => {
            const active = btn.dataset.settingsLang === window.currentLang;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        settingsPrecisionBtns.forEach(btn => {
            const active = Number(btn.dataset.settingsPrecision) === settingsState.precision;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        keybindButtons.forEach(btn => {
            const action = btn.dataset.keybindAction;
            btn.textContent = listeningKeybindAction === action
                ? '...'
                : keyLabel(settingsState.keybinds[action]);
            btn.classList.toggle('is-listening', listeningKeybindAction === action);
        });
        if (settingsAudioBtn) {
            settingsAudioBtn.classList.toggle('active', !audio.muted);
            settingsAudioBtn.setAttribute('aria-pressed', String(!audio.muted));
            settingsAudioBtn.textContent = audio.muted
                ? (window.t?.('settings.soundOff') || '关闭')
                : (window.t?.('settings.soundOn') || '开启');
        }
        if (settingsDevModeBtn) {
            settingsDevModeBtn.classList.toggle('active', settingsState.devMode);
            settingsDevModeBtn.setAttribute('aria-pressed', String(settingsState.devMode));
        }
        settingsDevTuning?.classList.toggle('is-hidden', !settingsState.devMode);
        if (settingsPlayerSpeed) settingsPlayerSpeed.value = String(settingsState.playerMoveMs);
        if (settingsEnemySpeed) settingsEnemySpeed.value = String(Math.round(settingsState.enemySpeedScale * 100));
        if (settingsPlayerSpeedValue) settingsPlayerSpeedValue.textContent = `${(settingsState.playerMoveMs / 1000).toFixed(2)}s`;
        if (settingsEnemySpeedValue) settingsEnemySpeedValue.textContent = `${settingsState.enemySpeedScale.toFixed(2)}x`;
    }

    function openSettings() {
        listeningKeybindAction = null;
        settingsOverlay?.classList.add('active');
        settingsOverlay?.setAttribute('aria-hidden', 'false');
        setBulletTimeActive(false);
        game.setRealtimePaused?.(true);
        renderSettingsPanel();
        audio.play('uiConfirm');
    }

    function closeSettings() {
        listeningKeybindAction = null;
        settingsOverlay?.classList.remove('active');
        settingsOverlay?.setAttribute('aria-hidden', 'true');
        game.setRealtimePaused?.(escConsole?.classList.contains('active'));
        renderSettingsPanel();
    }

    function applyToolKeybind(action) {
        if (!isGameActive || render.isAnimating) return false;
        if (game.realtimeMode) game.tutorialInputDismissed = true;
        const target = document.querySelector(`[data-tool-mode="${action}"]`);
        if (target && !target.disabled) {
            game.setToolMode(action);
            if (game.realtimeMode && game.canAutoResumeRealtimeFromInput?.()) {
                game.setRealtimePaused?.(false);
            }
            feel.note(`${target.textContent.replace(/\s+/g, ' ').trim()} 模式`, 'info');
            return true;
        }
        return false;
    }

    function triggerWaitKeybind() {
        if (!isGameActive || render.isAnimating || game.gameState !== 'playing') return false;
        feel.note(game.realtimeMode ? '原地稳住半拍' : '原地待命，敌人行动', game.realtimeMode ? 'info' : 'danger');
        if (!game.realtimeMode) feel.flashScreen('danger');
        game.skipTurn();
        return true;
    }

    function canUseBulletTime() {
        const level = game.currentLevel;
        return Boolean(isGameActive && game.realtimeMode && game.gameState === 'playing' && level && (level.act >= 2 || game.currentLevelIndex >= 12));
    }

    function setBulletTimeActive(active) {
        const enabled = Boolean(active && canUseBulletTime());
        game.bulletTimeActive = enabled;
        bulletTimeOverlay?.classList.toggle('active', enabled);
        bulletTimeOverlay?.setAttribute('aria-hidden', enabled ? 'false' : 'true');
        audio.setTension(enabled ? 'threat' : 'calm');
    }

    function triggerTemporalKeybind(phase = 'down') {
        if (!isGameActive || render.isAnimating || game.gameState !== 'playing') return false;
        if (!game.realtimeMode) {
            if (phase === 'down') return triggerWaitKeybind();
            return true;
        }
        if (!canUseBulletTime()) {
            if (phase === 'down' && !game.tutorialActive) feel.note('第二幕才解锁慢放。', 'info');
            return true;
        }
        setBulletTimeActive(phase === 'down');
        return true;
    }

    function handleGameplayKeybind(event, phase = 'down') {
        if (settingsOverlay?.classList.contains('active')) return false;
        if (escConsole?.classList.contains('active')) return false;

        if (game.tutorialActive) {
            const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
            if (step) {
                const code = normalizeKeyCode(event);
                const { keybinds } = settingsState;
                if (step.type === 'dialog') {
                    return false;
                }
                if (step.type === 'move') {
                    if (code === keybinds.twist || code === keybinds.patch || code === keybinds.beacon || code === keybinds.break || code === keybinds.wait) {
                        game.playFeel?.('invalid');
                        game.showFeel?.('当前步骤强引导中。请按照指示移动！', 'warn');
                        return true;
                    }
                }
                if (step.type === 'twist') {
                    if (code === keybinds.patch || code === keybinds.beacon || code === keybinds.break || code === keybinds.wait) {
                        game.playFeel?.('invalid');
                        game.showFeel?.('当前步骤强引导中。请按照指示进行空间旋转！', 'warn');
                        return true;
                    }
                }
                if (step.type === 'tool') {
                    const targetTool = step.tool;
                    if (code === keybinds.twist || code === keybinds.wait || (code === keybinds.patch && targetTool !== 'patch') || (code === keybinds.beacon && targetTool !== 'beacon') || (code === keybinds.break && targetTool !== 'break')) {
                        game.playFeel?.('invalid');
                        const toolNames = { patch: '补片', beacon: '信标', break: '碎解' };
                        game.showFeel?.(`当前步骤强引导中。请使用 [${toolNames[targetTool] || targetTool}] 工具！`, 'warn');
                        return true;
                    }
                }
            }
        }

        const { keybinds } = settingsState;
        const code = normalizeKeyCode(event);
        if (phase === 'down') {
            if (code === keybinds.route) return applyToolKeybind('route');
            if (code === keybinds.patch) return applyToolKeybind('patch');
            if (code === keybinds.beacon) return applyToolKeybind('beacon');
            if (code === keybinds.break) return applyToolKeybind('break');
            if (code === keybinds.wait) return triggerTemporalKeybind('down');
            if (code === keybinds.twist && !event.repeat && isGameActive) {
                setTwistMode(true);
                return true;
            }
        } else {
            if (code === keybinds.wait) return triggerTemporalKeybind('up');
            if (code === keybinds.twist && isGameActive) {
                setTwistMode(false);
                return true;
            }
        }
        return false;
    }

    function setPhoneCollapsed(collapsed, options = {}) {
        const { persist = true } = options;
        phonePanel?.classList.toggle('is-collapsed', collapsed);
        render.setGameViewportBias?.(!collapsed);
        if (phoneNotch) {
            phoneNotch.innerText = collapsed ? '◀' : '▶';
            phoneNotch.setAttribute('aria-label', collapsed ? '展开 E-7 手机' : '收起 E-7 手机');
        }
        if (persist) localStorage.setItem(PHONE_COLLAPSED_KEY, collapsed ? 'true' : 'false');
    }

    function openPhonePanel(tabName = 'comms') {
        setPhoneCollapsed(false);
        setTerminalTab(tabName);
        phonePanel?.classList.toggle('tool-focus', tabName !== 'comms');
        if (tabName !== 'comms') {
            document.getElementById('phone-action-dock')?.scrollIntoView?.({ block: 'nearest' });
        }
    }

    function placeFloatBubble(btn, key, fallback) {
        if (!btn) return;
        const saved = safeParseObject(key, fallback);
        const x = Number.isFinite(saved.x) ? saved.x : fallback.x;
        const y = Number.isFinite(saved.y) ? saved.y : fallback.y;
        btn.style.setProperty('--bubble-x', `${Math.max(8, Math.min(window.innerWidth - 72, x))}px`);
        btn.style.setProperty('--bubble-y', `${Math.max(8, Math.min(window.innerHeight - 72, y))}px`);
    }

    function setupDraggableBubble(btn, storageKey, fallback, onClick) {
        if (!btn) return;
        placeFloatBubble(btn, storageKey, fallback);
        let drag = null;
        const getPoint = event => ({ x: event.clientX, y: event.clientY });
        btn.addEventListener('pointerdown', event => {
            const p = getPoint(event);
            const rect = btn.getBoundingClientRect();
            drag = {
                startX: p.x,
                startY: p.y,
                offsetX: p.x - rect.left,
                offsetY: p.y - rect.top,
                moved: false
            };
            btn.setPointerCapture?.(event.pointerId);
            btn.classList.add('is-dragging');
            event.preventDefault();
        });
        btn.addEventListener('pointermove', event => {
            if (!drag) return;
            const p = getPoint(event);
            const moved = Math.hypot(p.x - drag.startX, p.y - drag.startY);
            if (moved > 5) drag.moved = true;
            if (!drag.moved) return;
            const nextX = Math.max(8, Math.min(window.innerWidth - btn.offsetWidth - 8, p.x - drag.offsetX));
            const nextY = Math.max(8, Math.min(window.innerHeight - btn.offsetHeight - 8, p.y - drag.offsetY));
            btn.style.setProperty('--bubble-x', `${nextX}px`);
            btn.style.setProperty('--bubble-y', `${nextY}px`);
            if (btn.id === 'tools-float-bubble') {
                positionFloatingToolboxMenu();
            }
        });
        btn.addEventListener('pointerup', event => {
            if (!drag) return;
            const p = getPoint(event);
            const moved = Math.hypot(p.x - drag.startX, p.y - drag.startY);
            btn.releasePointerCapture?.(event.pointerId);
            btn.classList.remove('is-dragging');
            const rect = btn.getBoundingClientRect();
            localStorage.setItem(storageKey, JSON.stringify({ x: rect.left, y: rect.top }));
            const wasDrag = drag.moved || moved > 5;
            drag = null;
            if (!wasDrag) onClick?.();
        });
        btn.addEventListener('pointercancel', () => {
            drag = null;
            btn.classList.remove('is-dragging');
        });
    }

    function positionFloatingToolboxMenu() {
        const menu = document.getElementById('floating-toolbox-menu');
        if (!menu || !toolsFloatBubble) return;
        const rect = toolsFloatBubble.getBoundingClientRect();
        menu.style.left = `${rect.left + rect.width / 2 - menu.offsetWidth / 2}px`;
        menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
    }

    function toggleFloatingToolboxMenu(force = null) {
        const menu = document.getElementById('floating-toolbox-menu');
        if (!menu) return;
        const shouldShow = force === null
            ? menu.classList.contains('is-hidden')
            : Boolean(force);
        menu.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
            positionFloatingToolboxMenu();
        }
    }

    function updateFloatingToolsCount() {
        const floatingBreak = document.getElementById('floating-break-count');
        const floatingPatch = document.getElementById('floating-patch-count');
        const floatingBeacon = document.getElementById('floating-beacon-count');
        
        if (floatingBreak) floatingBreak.textContent = game.breakCharges;
        if (floatingPatch) floatingPatch.textContent = game.patchCharges;
        if (floatingBeacon) floatingBeacon.textContent = game.beaconCharges;

        const badgeCount = (game.breakCharges || 0) + (game.patchCharges || 0) + (game.beaconCharges || 0);
        const toolsFloatBadge = document.getElementById('tools-float-badge');
        if (toolsFloatBadge) {
            toolsFloatBadge.textContent = badgeCount > 9 ? '9+' : String(badgeCount);
            const showBadge = badgeCount > 0 && (game.patchCharges > 0 || game.beaconCharges > 0 || game.breakCharges > 0);
            toolsFloatBadge.classList.toggle('is-hidden', !showBadge);
        }

        const hasTools = game.patchCharges > 0 || game.beaconCharges > 0 || game.breakCharges > 0 || game.activePatchCells.size > 0 || game.beaconCell !== null;
        if (toolsFloatBubble) {
            toolsFloatBubble.classList.toggle('is-hidden', !hasTools);
            toolsFloatBubble.classList.toggle('has-tools', hasTools);
            if (!hasTools) {
                const menu = document.getElementById('floating-toolbox-menu');
                menu?.classList.add('is-hidden');
            }
        }
    }

    function appendRouteBubble() {
        if (!routeCommandPreview || !commsStoryLines || game.plannedPath.length === 0) return;
        const playerLine = document.createElement('p');
        playerLine.className = 'comms-line player command-bubble';
        playerLine.textContent = routeCommandPreview.textContent.replace(/^走向：/, '路线：');
        commsStoryLines.appendChild(playerLine);
        commsStoryLines.scrollTo?.({ top: commsStoryLines.scrollHeight, behavior: 'smooth' });
        setCompanionBubble(game.trust < 55
            ? '我会看。但我不保证每次都乖乖照做。'
            : '行，我照这条线走。你最好是对的。', game.trust < 55 ? 'warn' : 'info');
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

    async function startSelectedLevel() {
        setupOverlay.classList.remove('active');
        inspectOverlay?.classList.remove('active');
        inspectOverlay?.setAttribute('aria-hidden', 'true');
        landingOverlay?.classList.remove('active');
        gameoverOverlay.classList.remove('active');
        victoryOverlay.classList.remove('active');
        gameContainer.classList.add('is-entering');
        gameContainer.classList.remove('preplay-stage', 'inspect-stage');
        gameContainer.style.display = 'grid';
        setTerminalTab('comms');
        setPhoneCollapsed(getDefaultPhoneCollapsed(), { persist: false });
        setTwistMode(false);
        setBulletTimeActive(false);
        isGameActive = true;

        await showLoadingSequence(game.levels[selectedLevelIndex]);
        game.initLevel(selectedLevelIndex, false);
        game.applyRealtimeTuning?.(settingsState);
        game.setRealtimeMode?.(true);
        game.stopRealtime?.();
        renderUnreadBadges();
        renderLevelComms(selectedLevelIndex);
        syncArchiveForLevelStart(selectedLevelIndex);
        updateLayerDropdown(game.N);
        initRenderScene();
        await render.flyToGameCamera?.(980);
        game.startRealtime?.();
        if (game.tutorialActive) {
            updateTutorialUI();
            game.setRealtimePaused?.(true);
        } else {
            if (!document.getElementById('tutorial-helper-card')?.classList.contains('is-hidden')) {
                game.setRealtimePaused?.(true);
            }
        }
        gameContainer.classList.remove('is-entering');
        audio.start();
        audio.setTension('calm');
        feel.note(`${textOf(game.currentLevel.title)} · ${textOf(game.currentLevel.chapter)}`, 'info');
        feel.flashScreen('info');
    }

    function resetCurrentLevel() {
        const levelId = game.currentLevel?.id;
        if (levelId) localStorage.removeItem(`dawnCubeTutorialDismissed:${levelId}`);
        setBulletTimeActive(false);
        game.initLevel(game.currentLevelIndex, false);
        game.setRealtimeMode?.(true);
        game.startRealtime?.();
        renderUnreadBadges();
        render.buildCube3D();
        render.spawnEntities3D();
        render.resetCamera?.();
        if (render.plannedLine && render.scene) render.scene.remove(render.plannedLine);
        audio.setTension('calm');
        feel.note('残局已重置', 'warn');
        feel.flashScreen('warn');
        if (game.tutorialActive) {
            updateTutorialUI();
            game.setRealtimePaused?.(true);
        }
    }

    function returnToLevelBook() {
        isGameActive = false;
        setBulletTimeActive(false);
        gameContainer.style.display = 'grid';
        gameContainer.classList.add('preplay-stage');
        gameContainer.classList.remove('inspect-stage');
        escConsole?.classList.remove('active');
        escConsole?.setAttribute('aria-hidden', 'true');
        settingsOverlay?.classList.remove('active');
        settingsOverlay?.setAttribute('aria-hidden', 'true');
        inspectOverlay?.classList.remove('active');
        inspectOverlay?.setAttribute('aria-hidden', 'true');
        gameoverOverlay.classList.remove('active', 'jump-alert', 'signal-lost');
        victoryOverlay.classList.remove('active');
        game.stopRealtime?.();
        game.gameState = 'menu';
        render.setGameViewportBias?.(false);
        setupOverlay.classList.add('active');
        landingOverlay?.classList.remove('active');
        render.setPresentationMode?.('constellation');
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
    game.initLevel(selectedLevelIndex, true);
    initRenderScene();
    render.setPresentationMode?.('landing');
    applyLanguage();
    runPrologueSequence();
    if (analysisToneSelect) {
        analysisToneSelect.value = localStorage.getItem('failureAnalysisTone') || 'coach';
    }

    btnPrologueStart?.addEventListener('click', closePrologue);
    btnPrologueSkip?.addEventListener('click', closePrologue);
    prologueReplies?.addEventListener('click', event => {
        if (prologueReplies.classList.contains('is-disabled')) return;
        const btn = event.target.closest('[data-prologue-reply]');
        if (!btn) return;
        handlePrologueReply(btn.dataset.prologueReply);
    });
    langToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.setLanguage?.(window.currentLang === 'en' ? 'zh' : 'en');
        });
    });
    window.addEventListener('languageChanged', () => {
        applyLanguage();
        if (prologueOverlay?.classList.contains('active')) {
            rerenderPrologueLanguageInPlace();
        }
        if (commsState.activeSceneId) {
            renderCommsScene(commsState.activeSceneId, { force: true });
        }
    });

    terminalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setTerminalTab(tab.dataset.terminalTab);
            audio.play('routeTick');
        });
    });

    actPageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const page = Number(tab.dataset.actPage);
            if (!settingsState.devMode && !unlockedActs.has(page)) return;
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

    landingStartBtn?.addEventListener('click', () => {
        audio.play('uiConfirm');
        startSelectedLevel();
    });
    landingLevelsBtn?.addEventListener('click', () => {
        audio.play('routeTick');
        showLevelBook();
    });
    landingSettingsBtn?.addEventListener('click', () => {
        openSettings();
    });

    startBtn?.addEventListener('click', startSelectedLevel);
    inspectStartBtn?.addEventListener('click', startSelectedLevel);
    inspectBackBtn?.addEventListener('click', () => {
        audio.play('routeTick');
        exitInspectPreview();
    });
    setupBackBtn?.addEventListener('click', () => {
        audio.play('routeTick');
        showLanding();
    });

    btnConfirmPath.addEventListener('click', () => {
        if (game.realtimeMode) {
            feel.note('实时模式不用发送路线，直接点相邻格。', 'info');
            return;
        }
        if (!render.isAnimating) {
            feel.pulse(btnConfirmPath, 'good');
            appendRouteBubble();
            game.executePlannedPath();
        }
    });

    btnEndTurn.addEventListener('click', () => {
        if (!render.isAnimating && game.gameState === 'playing') {
            feel.note(game.realtimeMode ? '原地稳住半拍' : '跳过回合，敌人行动', game.realtimeMode ? 'info' : 'danger');
            if (!game.realtimeMode) feel.flashScreen('danger');
            game.skipTurn();
        }
    });

    btnUndo.addEventListener('click', () => {
        if (!render.isAnimating) {
            if (game.undoTurn()) {
                feel.note(game.realtimeMode ? '已倒回 3 秒' : '已悔棋一步', 'info');
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
    btnConsoleSettings?.addEventListener('click', openSettings);
    settingsCloseBtn?.addEventListener('click', closeSettings);
    settingsOverlay?.addEventListener('click', event => {
        if (event.target === settingsOverlay) closeSettings();
    });
    settingsLangBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.setLanguage?.(btn.dataset.settingsLang);
            audio.play('routeTick');
        });
    });
    settingsPrecisionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            settingsState.precision = Math.max(0, Math.min(2, Number(btn.dataset.settingsPrecision || 0)));
            persistSettings();
            renderSettingsPanel();
            audio.play('routeTick');
        });
    });
    settingsPlayerSpeed?.addEventListener('input', () => {
        settingsState.playerMoveMs = Math.max(360, Math.min(900, Number(settingsPlayerSpeed.value || 600)));
        persistSettings();
        renderSettingsPanel();
    });
    settingsEnemySpeed?.addEventListener('input', () => {
        settingsState.enemySpeedScale = Math.max(0.5, Math.min(1.8, Number(settingsEnemySpeed.value || 100) / 100));
        persistSettings();
        renderSettingsPanel();
    });
    settingsAudioBtn?.addEventListener('click', () => {
        audio.setMuted(!audio.muted);
        renderSettingsPanel();
        feel.note(audio.muted ? '声音已关闭' : '声音已开启', audio.muted ? 'warn' : 'good');
        if (!audio.muted) audio.start().then(() => audio.play('uiConfirm'));
    });
    settingsDevModeBtn?.addEventListener('click', () => {
        settingsState.devMode = !settingsState.devMode;
        persistSettings();
        renderSettingsPanel();
        renderLevelCards();
        renderLevelBrief();
        feel.note(settingsState.devMode ? '开发者模式：关卡全解锁' : '开发者模式已关闭', settingsState.devMode ? 'good' : 'info');
    });
    settingsResetTutorialsBtn?.addEventListener('click', () => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('dawnCubeTutorialDismissed:')) {
                localStorage.removeItem(key);
            }
        });
        audio.play('uiConfirm');
        feel.note('所有教学提示已恢复', 'good');
        if (game.currentLevel && game.currentLevel.tutorialSteps?.length > 0) {
            game.initLevel(game.currentLevelIndex, false);
            updateTutorialUI();
            if (typeof render !== 'undefined') {
                render.initLevelVisuals();
            }
        }
    });
    settingsClearProgressBtn?.addEventListener('click', () => {
        const confirmed = window.confirm('清除所有关卡进度、档案、成就和信任值？这个操作不能撤销。');
        if (!confirmed) return;
        [
            'dimensionHackCompletedLevels',
            'dimensionHackUnlockedActs',
            'dimensionHackActTwoUnlocked',
            'dimensionHackArchiveEntries',
            'dimensionHackAchievements',
            'dimensionHackTrust'
        ].forEach(key => localStorage.removeItem(key));
        completedLevels.clear();
        unlockedActs.clear();
        unlockedActs.add(1);
        archiveState.entries.clear();
        archiveState.achievements.clear();
        commsState.seenEvents.clear?.();
        game.trust = 80;
        selectedActPage = 1;
        selectedLevelIndex = 0;
        persistUnlockedActs();
        persistCompletedLevels();
        persistArchive();
        renderLevelCards();
        renderLevelBrief();
        renderArchive();
        renderArchiveRoom();
        renderSettingsPanel();
        audio.play('uiConfirm');
        feel.note('进度已清除，回到第一关。', 'warn');
    });
    keybindButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            listeningKeybindAction = btn.dataset.keybindAction;
            renderSettingsPanel();
            audio.play('routeTick');
        });
    });
    phoneNotch?.addEventListener('click', () => {
        setPhoneCollapsed(!phonePanel?.classList.contains('is-collapsed'));
    });
    setupDraggableBubble(commsFloatBubble, 'dawnCubeCommsBubblePos', { x: window.innerWidth - 156, y: window.innerHeight - 92 }, () => {
        const dialogueConsole = document.getElementById('tutorial-dialogue-console');
        if (dialogueConsole) {
            dialogueConsole.classList.toggle('is-hidden');
        }
        audio.play('uiConfirm');
    });
    setupDraggableBubble(toolsFloatBubble, 'dawnCubeToolsBubblePos', { x: window.innerWidth - 82, y: window.innerHeight - 92 }, () => {
        toggleFloatingToolboxMenu();
        audio.play('uiConfirm');
    });
    window.addEventListener('resize', () => {
        placeFloatBubble(commsFloatBubble, 'dawnCubeCommsBubblePos', { x: window.innerWidth - 156, y: window.innerHeight - 92 });
        placeFloatBubble(toolsFloatBubble, 'dawnCubeToolsBubblePos', { x: window.innerWidth - 82, y: window.innerHeight - 92 });
        positionFloatingToolboxMenu();
    });
    landingArchiveBtn?.addEventListener('click', openArchiveRoom);
    landingCreditsBtn?.addEventListener('click', openCredits);
    archiveCloseBtn?.addEventListener('click', closeArchiveRoom);
    archiveOverlay?.addEventListener('click', event => {
        if (event.target === archiveOverlay) closeArchiveRoom();
    });
    creditsCloseBtn?.addEventListener('click', closeCredits);
    creditsOverlay?.addEventListener('click', event => {
        if (event.target === creditsOverlay) closeCredits();
    });
    btnTwistMode?.addEventListener('click', () => {
        if (render.isAnimating) return;
        setTwistMode(!twistMode);
    });
    tutorialHelperClose?.addEventListener('click', () => {
        if (game.tutorialActive) {
            skipTutorial();
        } else {
            const card = document.getElementById('tutorial-helper-card');
            const levelId = card?.dataset.levelId;
            if (levelId) localStorage.setItem(`dawnCubeTutorialDismissed:${levelId}`, 'true');
            card?.classList.add('is-hidden');
            if (game.realtimeMode && !settingsOverlay?.classList.contains('active') && !escConsole?.classList.contains('active')) {
                game.setRealtimePaused?.(false);
            }
        }
    });
    tutorialDialogueNext?.addEventListener('click', event => {
        if (!game.tutorialActive) return;
        const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
        if (step?.type !== 'dialog') return;
        event.preventDefault();
        event.stopPropagation();
        advanceTutorialStep();
    });
    document.addEventListener('keydown', event => {
        if (game.tutorialActive) {
            const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
            if (step && step.type === 'dialog') {
                if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
                    advanceTutorialStep();
                    return;
                }
            }
        }
        if (listeningKeybindAction) {
            event.preventDefault();
            if (event.code !== 'Escape') {
                settingsState.keybinds[listeningKeybindAction] = normalizeKeyCode(event);
                persistSettings();
                audio.play('uiConfirm');
            }
            listeningKeybindAction = null;
            renderSettingsPanel();
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            
            // 1. 如果设置页面活跃，则直接关闭设置
            if (settingsOverlay?.classList.contains('active')) {
                closeSettings();
                return;
            }
            
            // 2. 如果档案矩阵活跃，则关闭并回到主菜单
            if (archiveOverlay?.classList.contains('active')) {
                closeArchiveRoom();
                return;
            }
            
            // 3. 如果制作名单活跃，则关闭并回到主菜单
            if (creditsOverlay?.classList.contains('active')) {
                closeCredits();
                return;
            }
            
            // 4. 如果选关册活跃，则关闭选关册，回到主菜单
            if (setupOverlay?.classList.contains('active')) {
                showLanding();
                return;
            }
            
            // 5. 如果处于战术检视 (Inspect Mode)，退出检视返回选关册
            if (inspectOverlay?.classList.contains('active')) {
                exitInspectPreview();
                return;
            }
            
            // 6. 如果在游戏活跃状态下，切换暂停控制台的显示与隐藏
            if (isGameActive) {
                toggleEscConsole();
                return;
            }
            
            // 7. 在主菜单无额外层时，Esc 忽略
            return;
        }
        if (handleGameplayKeybind(event, 'down')) {
            event.preventDefault();
        }
    });
    document.addEventListener('keyup', event => {
        if (handleGameplayKeybind(event, 'up')) {
            event.preventDefault();
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
            const menu = document.getElementById('floating-toolbox-menu');
            menu?.classList.add('is-hidden');
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
            gameoverOverlay.classList.remove('active', 'jump-alert', 'signal-lost');
            feel.note(game.realtimeMode ? '倒回 3 秒，重新推演' : '回到上一步，重新推演', 'info');
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
            gameoverOverlay.classList.remove('active', 'jump-alert', 'signal-lost');
            victoryOverlay.classList.remove('active');
            setupOverlay.classList.add('active');
            landingOverlay?.classList.remove('active');
            gameContainer.style.display = 'grid';
            gameContainer.classList.add('preplay-stage');
            isGameActive = false;
            render.setPresentationMode?.('constellation');
            render.setGameViewportBias?.(false);
            setTerminalTab('comms');
            renderLevelCards();
            renderLevelBrief();
            audio.setTension('calm');
        });
    });

    audioToggle.addEventListener('click', () => {
        const nextMuted = !audio.muted;
        audio.setMuted(nextMuted);
        renderSettingsPanel();
        feel.note(audio.muted ? '声音已关闭' : '声音已开启', audio.muted ? 'warn' : 'good');
        if (!audio.muted) {
            audio.start().then(() => audio.play('uiConfirm'));
        }
    });

    // ----------------------------------------------------
    // MILESTONE 7: INTERACTIVE TUTORIAL ENGINE
    // ----------------------------------------------------
    let tutorialTypingTimer = null;
    const ledMascotState = {
        tone: 'steady',
        speaking: false,
        lastBlinkAt: 0,
        nextBlinkAt: 1800 + Math.random() * 2200,
        blinkUntil: 0
    };

    function drawLedMascot(tone = 'steady', speaking = false) {
        const canvas = tutorialLedMascot;
        const ctx = canvas?.getContext?.('2d');
        if (!ctx) return;
        ledMascotState.tone = tone;
        ledMascotState.speaking = Boolean(speaking);
    }

    function renderLedMascotFrame(now = performance.now()) {
        const canvas = tutorialLedMascot;
        const ctx = canvas?.getContext?.('2d');
        if (!ctx) return;
        const size = 24;
        const unit = canvas.width / size;
        const tone = ledMascotState.tone || 'steady';
        const speaking = ledMascotState.speaking;
        if (now >= ledMascotState.nextBlinkAt) {
            ledMascotState.blinkUntil = now + 150;
            ledMascotState.nextBlinkAt = now + 3000 + Math.random() * 2000;
        }
        const blinking = now < ledMascotState.blinkUntil;
        const active = tone === 'panic' ? '#8bdcff' : (tone === 'anger' ? '#ff4d7d' : '#74ff9b');
        const breath = 1 + Math.sin(now * 0.0016) * 0.035;
        const voltage = 0.99 + Math.random() * 0.02;
        const mouthOpen = speaking ? 1 + Math.round((Math.sin(now * 0.018) + 1) * 1.5) : 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#02060a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const points = [];
        const dot = (x, y) => points.push([x, y]);
        const line = (x1, y1, x2, y2) => {
            const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
            for (let i = 0; i <= steps; i += 1) {
                dot(Math.round(x1 + (x2 - x1) * i / steps), Math.round(y1 + (y2 - y1) * i / steps));
            }
        };

        for (let x = 5; x <= 18; x += 1) {
            dot(x, 4);
            dot(x, 19);
        }
        for (let y = 5; y <= 18; y += 1) {
            dot(4, y);
            dot(19, y);
        }

        if (tone === 'panic') {
            if (blinking) {
                line(7, 10, 10, 10);
                line(14, 10, 17, 10);
            } else {
                line(8, 8, 8, 12);
                line(15, 8, 15, 12);
            }
            line(9, 16, 14, 16 + mouthOpen);
        } else if (tone === 'anger') {
            if (blinking) {
                line(7, 10, 10, 10);
                line(14, 10, 17, 10);
            } else {
                line(7, 8, 10, 10);
                line(16, 8, 13, 10);
            }
            line(9, 16, 15, 15 + Math.max(0, mouthOpen - 1));
        } else if (tone === 'worry') {
            if (blinking) {
                line(7, 10, 10, 10);
                line(14, 10, 17, 10);
            } else {
                line(7, 9, 10, 8);
                line(14, 8, 17, 9);
            }
            line(9, 16, 14, 17 + Math.max(0, mouthOpen - 1));
        } else {
            if (blinking) {
                line(7, 10, 10, 10);
                line(14, 10, 17, 10);
            } else {
                line(7, 9, 10, 9);
                line(14, 9, 17, 9);
            }
            line(9, 16, 15, 16 + Math.max(0, mouthOpen - 1));
        }

        const jitter = speaking ? Math.sin(now * 0.08) * 0.7 : 0;
        ctx.shadowColor = active;
        ctx.shadowBlur = (speaking ? 14 : 8) * voltage;
        points.forEach(([x, y], index) => {
            const flicker = speaking && index % 5 === 0 ? 0.62 + Math.random() * 0.38 : 1;
            ctx.globalAlpha = flicker;
            ctx.fillStyle = active;
            const dotSize = Math.max(2, (unit - 2) * breath);
            ctx.fillRect(x * unit + 1 + jitter, y * unit + 1, dotSize, dotSize);
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    function startLedMascotLoop() {
        renderLedMascotFrame(performance.now());
        requestAnimationFrame(startLedMascotLoop);
    }

    function setTutorialDialogue(step) {
        if (!tutorialDialogueConsole || !tutorialDialogueText) return;
        const text = step?.text?.[window.currentLang || 'zh'] || step?.text?.zh || '';
        const tone = step?.tone || 'steady';
        const speaker = step?.speaker || (tone === 'system' ? '引导系统' : 'E-7');
        tutorialDialogueConsole.classList.remove('is-hidden');
        tutorialSpeakerLabel && (tutorialSpeakerLabel.textContent = speaker);
        tutorialDialogueNext?.classList.toggle('is-hidden', step?.type !== 'dialog');
        tutorialDialogueText.textContent = '';
        window.clearInterval(tutorialTypingTimer);
        let cursor = 0;
        drawLedMascot(tone, true);
        tutorialTypingTimer = window.setInterval(() => {
            cursor += 1;
            tutorialDialogueText.textContent = text.slice(0, cursor);
            drawLedMascot(tone, cursor < text.length);
            if (cursor >= text.length) {
                window.clearInterval(tutorialTypingTimer);
                drawLedMascot(tone, false);
            }
        }, 18);
    }

    function hideTutorialDialogue() {
        window.clearInterval(tutorialTypingTimer);
        drawLedMascot('steady', false);
        tutorialDialogueConsole?.classList.add('is-hidden');
        tutorialBlackout?.classList.remove('active');
        tutorialLookGesture?.classList.add('is-hidden');
        tutorialLookProgress?.style.setProperty('--look-progress', '0%');
        gameContainer.classList.remove('tutorial-vignette');
    }

    function setTutorialVignette(active, focus = { x: 50, y: 48 }) {
        gameContainer.classList.toggle('tutorial-vignette', Boolean(active));
        tutorialBlackout?.classList.toggle('active', Boolean(active));
        tutorialBlackout?.style.setProperty('--focus-x', `${focus.x}%`);
        tutorialBlackout?.style.setProperty('--focus-y', `${focus.y}%`);
    }

    function updateTutorialUI() {
        lastStepAdvancedTime = Date.now();
        const card = document.getElementById('tutorial-helper-card');
        if (!card) return;

        if (!game.tutorialActive) {
            card.classList.add('is-hidden');
            hideTutorialDialogue();
            btnTwistMode?.classList.remove('tutorial-target');
            if (typeof render !== 'undefined') render.hideTutorialPointer?.();
            return;
        }

        const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
        if (!step) {
            skipTutorial();
            return;
        }
        btnTwistMode?.classList.toggle('tutorial-target', step.type === 'twist');
        commsFloatBubble?.classList.toggle('tutorial-target', step.openComms || step.type === 'dialog');
        toolsFloatBubble?.classList.toggle('tutorial-target', step.openTools || step.type === 'tool' || step.type === 'twist');
        if (step.openComms) openPhonePanel('comms');
        if (step.openTools || step.type === 'tool' || step.type === 'twist') openPhonePanel('tasks');

        card.classList.add('is-hidden');
        card.dataset.levelId = game.currentLevel?.id;
        render.setPlayerSpeechBubble?.('');
        setTutorialDialogue(step);
        setTutorialVignette(true, step.focus || { x: 50, y: step.type === 'dialog' ? 52 : 45 });
        const showGesture = step.type === 'look' || step.type === 'zoom';
        tutorialLookGesture?.classList.toggle('is-hidden', !showGesture);
        if (showGesture) {
            const svgCircle = document.getElementById('tutorial-look-progress-svg');
            if (svgCircle) {
                svgCircle.style.strokeDashoffset = '326.7';
            }
            const lookSvg = document.getElementById('tutorial-gesture-look-svg');
            const zoomSvg = document.getElementById('tutorial-gesture-zoom-svg');
            const textEl = document.getElementById('tutorial-gesture-text');
            
            if (lookSvg) lookSvg.classList.toggle('is-hidden', step.type !== 'look');
            if (zoomSvg) zoomSvg.classList.toggle('is-hidden', step.type !== 'zoom');
            if (textEl) {
                textEl.textContent = step.type === 'zoom'
                    ? 'SCROLL TO ZOOM / 滚动鼠标滚轮缩放'
                    : 'DRAG TO ROTATE / 拖拽旋转视角';
            }
        }

        const titleEl = document.getElementById('tutorial-helper-title');
        const bodyEl = document.getElementById('tutorial-helper-body');
        const iconEl = document.getElementById('tutorial-helper-icon');

        if (iconEl) {
            const icons = { dialog: '💬', look: '👁', move: '➜', twist: '⟳', tool: '⚙️', zoom: '🔍' };
            iconEl.textContent = icons[step.type] || '➜';
        }

        if (titleEl) {
            const stepNum = game.currentTutorialStepIndex + 1;
            const totalSteps = game.activeTutorialSteps.length;
            titleEl.textContent = window.currentLang === 'en' 
                ? `Tutorial Step ${stepNum}/${totalSteps}` 
                : `教程步骤 ${stepNum}/${totalSteps}`;
        }

        if (bodyEl) {
            const txt = step.text[window.currentLang || 'zh'] || step.text['zh'];
            bodyEl.textContent = txt;
            
            // Re-render Skip Tutorial button if needed
            let skipBtn = document.getElementById('btn-skip-tutorial');
            if (!skipBtn) {
                skipBtn = document.createElement('button');
                skipBtn.id = 'btn-skip-tutorial';
                skipBtn.className = 'btn-skip-tutorial';
                skipBtn.type = 'button';
                bodyEl.parentNode.appendChild(skipBtn);
                skipBtn.addEventListener('click', skipTutorial);
            }
            skipBtn.textContent = window.currentLang === 'en' ? 'Skip Tutorial' : '跳过教程';
        }

        game.setRealtimePaused?.(true);

        const stepText = step.text[window.currentLang || 'zh'] || step.text['zh'];
        setCompanionBubble(stepText, step.tone || 'info', { suppressHeadBubble: true });

        if (commsStoryLines) {
            const lastLine = commsStoryLines.lastElementChild;
            if (!lastLine || lastLine.textContent !== stepText) {
                const p = document.createElement('p');
                p.className = 'comms-line protagonist';
                p.textContent = stepText;
                commsStoryLines.appendChild(p);
                commsStoryLines.scrollTo?.({ top: commsStoryLines.scrollHeight, behavior: 'smooth' });
            }
        }

        if (commsChoicesEl) {
            const lockText = window.currentLang === 'en' 
                ? '【System Protocol: Gated Onboarding】' 
                : '【系统协议：强引导中】';
            const subText = window.currentLang === 'en'
                ? '[ Gated Onboarding ]'
                : '[ 强引导中 ]';
            commsChoicesEl.innerHTML = `
                <button class="terminal-choice kaomoji-choice" type="button" disabled style="opacity: 0.6; cursor: not-allowed; width: 100%; border: 1px dashed rgba(255,255,255,0.2); background: rgba(0,0,0,0.25);">
                    <span class="kaomoji-face" style="font-size: 13px; color: #8bdcff;">${lockText}</span>
                    <small style="color: rgba(216,236,255,0.5);">${subText}</small>
                </button>
            `;
        }

        if (typeof render !== 'undefined') {
            if (step.targetCellId !== undefined) {
                render.showTutorialPointer?.(step.targetCellId);
            } else {
                render.hideTutorialPointer?.();
            }
            render.focusTutorialStep?.(step);
        }
    }

    function advanceTutorialStep() {
        if (!game.tutorialActive) return;
        const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
        if (!step) return;

        if (step.type === 'dialog' || step.type === 'look' || step.type === 'zoom') {
            game.currentTutorialStepIndex++;
            audio.play('uiConfirm');
            updateTutorialUI();
        }
    }

    function skipTutorial() {
        if (!game.tutorialActive) return;
        const levelId = game.currentLevel?.id;
        if (levelId) localStorage.setItem(`dawnCubeTutorialDismissed:${levelId}`, 'true');
        
        game.tutorialActive = false;
        game.setRealtimePaused?.(false);
        btnTwistMode?.classList.remove('tutorial-target');
        commsFloatBubble?.classList.remove('tutorial-target');
        toolsFloatBubble?.classList.remove('tutorial-target');
        if (typeof render !== 'undefined') render.hideTutorialPointer?.();
        hideTutorialDialogue();
        
        const card = document.getElementById('tutorial-helper-card');
        card?.classList.add('is-hidden');

        if (game.currentLevelIndex !== undefined) {
            renderLevelComms(game.currentLevelIndex);
        }
        audio.play('routeUndo');
        feel.note('已跳过本关教程', 'warn');
    }

    window.updateTutorialUI = updateTutorialUI;
    window.advanceTutorialStep = advanceTutorialStep;
    window.skipTutorial = skipTutorial;
    window.updateTutorialLookProgress = progress => {
        const p = Math.max(0, Math.min(1, Number(progress || 0)));
        const svgCircle = document.getElementById('tutorial-look-progress-svg');
        if (svgCircle) {
            const offset = 326.7 * (1 - p);
            svgCircle.style.strokeDashoffset = offset;
        }
        tutorialLookGesture?.classList.toggle('is-complete', p >= 1);
    };

    // Listen to global click/pointerup events to advance dialog step in capturing phase
    document.addEventListener('pointerup', event => {
        if (game.tutorialActive) {
            const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
            if (step && step.type === 'dialog') {
                if (Date.now() - lastStepAdvancedTime < 180) {
                    return;
                }
                const moved = Math.hypot(event.clientX - pointerdownStartCoords.x, event.clientY - pointerdownStartCoords.y);
                if (moved > 6) {
                    return; // Ignore drags/swipes
                }
                const skipBtn = event.target.closest('#btn-skip-tutorial, #tutorial-helper-close');
                const systemBtn = event.target.closest('#btn-esc-menu, #audio-toggle, #landing-settings-btn, #btn-console-resume, #btn-console-reset, #btn-console-settings');
                if (skipBtn) {
                    skipTutorial();
                    return;
                }
                if (systemBtn) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                advanceTutorialStep();
            }
        }
    }, true);

    // Close floating panels when clicking outside
    document.addEventListener('pointerdown', event => {
        const menu = document.getElementById('floating-toolbox-menu');
        if (menu && !menu.classList.contains('is-hidden')) {
            if (!event.target.closest('#tools-float-bubble') && !event.target.closest('#floating-toolbox-menu')) {
                menu.classList.add('is-hidden');
            }
        }
        if (game && !game.tutorialActive) {
            const dialogueConsole = document.getElementById('tutorial-dialogue-console');
            if (dialogueConsole && !dialogueConsole.classList.contains('is-hidden')) {
                if (!event.target.closest('#comms-float-bubble') && !event.target.closest('#tutorial-dialogue-console')) {
                    dialogueConsole.classList.add('is-hidden');
                }
            }
        }
    });

    persistSettings();
    startPhoneWaveLoop();
    startLedMascotLoop();
    window.setInterval(updatePhoneClock, 30000);
});
