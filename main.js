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
        if (typeof syncRotationAvailability === 'function') {
            syncRotationAvailability();
        }
        if (typeof updateFloatingToolsCount === 'function') {
            updateFloatingToolsCount();
        }
        if (typeof updateToolModeFeedback === 'function') {
            updateToolModeFeedback();
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
    const toolModeIndicator = document.getElementById('tool-mode-indicator');
    const toolModeIcon = document.getElementById('tool-mode-icon');
    const toolModeTitle = document.getElementById('tool-mode-title');
    const toolModeDesc = document.getElementById('tool-mode-desc');
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
    const tutorialDialogueClose = document.getElementById('tutorial-dialogue-close');
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
    const settingsLowPowerBtn = document.getElementById('settings-low-power-btn');
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
    const dawnChatWindow = document.getElementById('dawn-chat-window');
    const dawnChatCloseBtn = document.getElementById('dawn-chat-close-btn');
    const dawnChatLog = document.getElementById('dawn-chat-log');
    const dawnChatNextBtn = document.getElementById('dawn-chat-next-btn');
    const dawnChatFreeInputContainer = document.getElementById('dawn-chat-free-input-container');
    const dawnKaomojiDock = document.getElementById('dawn-kaomoji-dock');
    const dawnChatStatusTag = document.getElementById('dawn-chat-status-tag');

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
    const FREE_CHAT_ENABLED = false;
    const TRUST_UI_ENABLED = false;
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
        lowPowerMode: localStorage.getItem('dawnCubeLowPowerMode') === 'true',
        devMode: localStorage.getItem('dimensionHackDevMode') === 'true',
        playerMoveMs: Math.max(360, Math.min(900, Number(localStorage.getItem('dawnCubePlayerMoveMs') || 600))),
        enemySpeedScale: Math.max(0.5, Math.min(1.8, Number(localStorage.getItem('dawnCubeEnemySpeedScale') || 1))),
        keybinds: {
            ...defaultKeybinds,
            ...safeParseObject('dawnCubeKeybinds', defaultKeybinds)
        }
    };
    let listeningKeybindAction = null;
    let phoneWaveFrameId = null;
    let lastPhoneWaveFrameAt = 0;
    let ledMascotFrameId = null;
    let lastLedMascotFrameAt = 0;
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
    let tutorialCommsNotice = false;
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
    let toolsMenuUserCollapsed = false;
    let lastTutorialNoticeKey = '';

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
            title: { zh: '折叠机', en: 'Folding Machine' },
            body: {
                zh: '这座牢房会记录逃亡方式。它不像监狱，更像一台把人当训练数据的机器。',
                en: 'This cell records escape methods. It feels less like a prison and more like a machine training on people.'
            }
        },
        {
            id: 'protagonistE7',
            title: { zh: 'E-7', en: 'E-7' },
            body: {
                zh: '十八岁左右的人类女孩，从床上坠入魔方牢笼。她害怕，但强撑；嘴硬，是因为她想回家。',
                en: 'A human girl around eighteen, dropped from her bed into a cube prison. She is scared, stubborn, and trying hard to get home.'
            }
        },
        {
            id: 'outsideOperator',
            title: { zh: '外侧的人', en: 'The Outside Operator' },
            body: {
                zh: '你能点格、拧空间、悔棋。她看不见你的世界，只知道你下一步会不会乱来。',
                en: 'You can click tiles, twist space, and undo mistakes. Dawn cannot see your side, only whether your next move is reckless.'
            }
        },
        {
            id: 'guardian',
            title: { zh: '守钥者', en: 'Key Guardian' },
            body: {
                zh: '它不会再站到钥匙或门上。它守的是局势：钥匙没拿前可被引诱，钥匙拿走后会变得更急。',
                en: 'It no longer stands on keys or exits. It guards the position: lure it before the key, then expect it to grow more urgent.'
            }
        },
        {
            id: 'rotationRule',
            title: { zh: '空间折叠', en: 'Spatial Folding' },
            body: {
                zh: '旋转不是按钮技能，而是世界规则。钥匙、门、敌人和人都会被一起拧走。',
                en: 'Twisting is not a button skill. It is a world rule. Keys, exits, enemies, and people rotate together.'
            }
        },
        {
            id: 'actTwoShell',
            title: { zh: '第二层外壳', en: 'Second Shell' },
            body: {
                zh: '门后不是出口。折叠机变大了，说明它开始学习我们怎么逃。',
                en: 'The door was not an exit. The folding machine grew larger, which means it is learning how we escape.'
            }
        },
        {
            id: 'bridgePortal',
            title: { zh: '传送裂缝', en: 'Portal Rift' },
            body: {
                zh: '一组公开的折叠通道。它能省路，也可能让敌人更快靠近。好用，但不慈善。',
                en: 'A shared folding passage. It can shorten your route, or bring enemies closer. Useful, never merciful.'
            }
        },
        {
            id: 'voidCells',
            title: { zh: '虚空缺口', en: 'Void Gaps' },
            body: {
                zh: '魔方外壳被咬掉的格子。不能走，也会随层旋转。黑洞洞的地方真的没有地。',
                en: 'Missing cells bitten out of the cube shell. You cannot walk there, and the gaps rotate with their layer.'
            }
        },
        {
            id: 'patchTool',
            title: { zh: '临时补片', en: 'Temporary Patch' },
            body: {
                zh: '一次性薄地板。E-7 可以踩过去，离开后碎掉；追捕者默认不能借这块碎片追上来。',
                en: 'A one-use floor tile. E-7 can cross it, then it breaks after she steps off. Pursuers cannot normally borrow it.'
            }
        },
        {
            id: 'beaconTool',
            title: { zh: '诱饵信标', en: 'Decoy Beacon' },
            body: {
                zh: '一次性调敌工具。放在空地上，敌人会按正常路线被吸引过去，不会瞬移。',
                en: 'A one-use enemy lure. Place it on open floor; enemies path toward it normally instead of teleporting.'
            }
        },
        {
            id: 'breakTool',
            title: { zh: '主动碎解', en: 'Manual Break' },
            body: {
                zh: '把一格安全地板打碎，切断追捕路线。救命时很好用，乱用时也很会害人。',
                en: 'Break a safe tile to cut a chase route. Excellent in emergencies; dangerous when used carelessly.'
            }
        }
    ];
    const achievements = [
        {
            id: 'firstEscape',
            title: { zh: '第一次逃脱', en: 'First Escape' },
            body: { zh: '完成任意一局。她嘴上不服，心里记了一笔。', en: 'Complete any level. Dawn complains, but she remembers it.' }
        },
        {
            id: 'closeEscape',
            title: { zh: '惊险逃脱', en: 'Close Escape' },
            body: { zh: '敌人贴到一步内后仍然成功撤离。', en: 'Escape after an enemy gets within one step.' }
        },
        {
            id: 'cleanRoute',
            title: { zh: '最短速通', en: 'Clean Route' },
            body: { zh: '在推荐回合数内完成一局。', en: 'Finish a level within the recommended turn count.' }
        },
        {
            id: 'actOneClear',
            title: { zh: '门后不是门', en: 'The Door Was Not a Door' },
            body: { zh: '完成 L12「出口？」并进入第二幕。', en: 'Clear L12 "Exit?" and reach Act II.' }
        },
        {
            id: 'portalCut',
            title: { zh: '折叠捷径', en: 'Folding Shortcut' },
            body: { zh: '使用传送裂缝完成逃脱。', en: 'Escape by using a portal rift.' }
        }
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
        feel.note(window.t?.('prologue.linkReady') || '链路已接通', 'info');
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
        const floatCommsCount = Math.max(commsCount, tutorialCommsNotice ? 1 : 0);
        if (commsFloatBadge) {
            commsFloatBadge.textContent = floatCommsCount > 9 ? '9+' : String(floatCommsCount);
            commsFloatBadge.classList.toggle('is-hidden', floatCommsCount <= 0);
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

    function setCommsTutorialNotice(active) {
        tutorialCommsNotice = Boolean(active);
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

    function formatText(key, fallback, params = {}) {
        const template = window.t?.(key) || fallback || key;
        return Object.entries(params).reduce(
            (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
            template
        );
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
        const keyCount = level.key !== null && level.key !== undefined && !level.hasKeyStart ? 1 : 0;
        const exitCount = level.exit !== null && level.exit !== undefined ? 1 : 0;
        const newMechanics = [];
        const firstRotationIndex = getFirstLevelIndex(item => item.rotationEnabled);
        const firstBridgeIndex = getFirstLevelIndex(item => item.bridges?.length);
        const firstVoidIndex = getFirstLevelIndex(item => item.voids?.length);
        const firstPatchIndex = getFirstLevelIndex(item => item.patchCharges);
        const firstBeaconIndex = getFirstLevelIndex(item => item.beaconCharges);
        const firstBreakIndex = getFirstLevelIndex(item => item.breakCharges);
        const levelIndex = game.levels.indexOf(level);
        if (level.rotationEnabled && levelIndex === firstRotationIndex) newMechanics.push(window.t?.('mechanic.rotation') || '空间折叠');
        if (level.bridges?.length && levelIndex === firstBridgeIndex) newMechanics.push(window.t?.('mechanic.bridge') || '传送裂缝');
        if (level.voids?.length && levelIndex === firstVoidIndex) newMechanics.push(window.t?.('mechanic.void') || '缺面');
        if (level.patchCharges && levelIndex === firstPatchIndex) newMechanics.push(window.t?.('mechanic.patch') || '补片');
        if (level.beaconCharges && levelIndex === firstBeaconIndex) newMechanics.push(window.t?.('mechanic.beacon') || '诱饵');
        if (level.breakCharges && levelIndex === firstBreakIndex) newMechanics.push(window.t?.('mechanic.break') || '碎解');
        return { enemyCounts, totalEnemies, keyCount, exitCount, newMechanics };
    }

    function renderScannerChips(level, index, { compact = false } = {}) {
        const stats = getLevelStats(level);
        const enemyText = Object.entries(stats.enemyCounts)
            .map(([type, count]) => {
                const meta = enemyMeta[type];
                const label = meta?.labelKey ? (window.t?.(meta.labelKey) || meta.fallback) : (meta?.fallback || type);
                return `${label} x${count}`;
            })
            .join(' / ') || (window.t?.('scanner.noEnemies') || '无敌人');
        const chips = [
            `<span class="scanner-chip ${stats.totalEnemies ? 'danger' : 'safe'}">${escapeHtml(window.t?.('scanner.enemy') || '敌')} ${stats.totalEnemies}</span>`,
            `<span class="scanner-chip key">${escapeHtml(window.t?.('scanner.key') || '钥')} ${stats.keyCount}</span>`,
            `<span class="scanner-chip">${escapeHtml(window.t?.('scanner.exit') || '门')} ${stats.exitCount}</span>`
        ];
        if (!compact) {
            chips.push(`<span class="scanner-chip wide">${escapeHtml(enemyText)}</span>`);
        }
        stats.newMechanics.forEach(name => {
            chips.push(`<span class="scanner-chip new">NEW ${escapeHtml(name)}</span>`);
        });
        if (!level.rotationEnabled) {
            chips.push(`<span class="scanner-chip no-twist">${escapeHtml(window.t?.('scanner.noTwist') || '无旋转')}</span>`);
        }
        return chips.join('');
    }

    function setCompanionBubble(text, tone = 'info', options = {}) {
        const line = textOf(text) || '';
        if (companionBubble) companionBubble.textContent = line;
        if (!options.suppressHeadBubble && options.allowHeadBubble) render.setPlayerSpeechBubble?.(line, tone);
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
        document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
            node.setAttribute('placeholder', window.t?.(node.dataset.i18nPlaceholder) || node.getAttribute('placeholder') || '');
        });
        document.querySelectorAll('[data-i18n-title]').forEach(node => {
            node.setAttribute('title', window.t?.(node.dataset.i18nTitle) || node.getAttribute('title') || '');
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(node => {
            node.setAttribute('aria-label', window.t?.(node.dataset.i18nAriaLabel) || node.getAttribute('aria-label') || '');
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
        audio.updateToggle();
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
                        <span>${escapeHtml(textOf(entry.title))}</span>
                        <p>${escapeHtml(textOf(entry.body))}</p>
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
                                <strong>${escapeHtml(textOf(achievement.title))}</strong>
                                <p>${escapeHtml(unlocked ? textOf(achievement.body) : (window.t?.('archive.locked') || '未解锁'))}</p>
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
                        <strong>${unlocked ? '◆' : '◇'} ${escapeHtml(textOf(achievement.title))}</strong>
                        <p>${escapeHtml(unlocked ? textOf(achievement.body) : (window.t?.('archive.locked') || '未解锁'))}</p>
                    </article>`;
                })
                .join('');
        }
        if (archiveRoomEntries) {
            const unlockedEntries = archiveEntries.filter(entry => archiveState.entries.has(entry.id));
            archiveRoomEntries.innerHTML = unlockedEntries
                .map(entry => `<article class="archive-room-item">
                    <strong>▣ ${escapeHtml(textOf(entry.title))}</strong>
                    <p>${escapeHtml(textOf(entry.body))}</p>
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

    function isUiElementVisible(element) {
        if (!element || !element.isConnected) return false;
        if (element.closest('.is-hidden, [aria-hidden="true"]')) return false;
        return element.getClientRects().length > 0;
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

    function schedulePhoneWaveLoop() {
        if (phoneWaveFrameId !== null || document.hidden) return;
        if (!isUiElementVisible(voiceWaveCanvas)) return;
        phoneWaveFrameId = requestAnimationFrame(startPhoneWaveLoop);
    }

    function startPhoneWaveLoop(now = performance.now()) {
        phoneWaveFrameId = null;
        if (document.hidden || !isUiElementVisible(voiceWaveCanvas)) return;
        updatePhoneClock();
        const frameInterval = settingsState.lowPowerMode ? 1000 / 8 : 1000 / 30;
        if (!lastPhoneWaveFrameAt || now - lastPhoneWaveFrameAt >= frameInterval) {
            drawVoiceWave(phonePanel?.classList.contains('is-talking'));
            lastPhoneWaveFrameAt = now;
        }
        schedulePhoneWaveLoop();
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
        const en = window.currentLang === 'en';
        if (total <= 0) return en ? 'Sync: unknown' : '同步：未知';
        if (warm >= steady && warm >= tease) return en ? 'Sync: gentle' : '同步：偏温柔';
        if (tease >= steady && tease >= warm) return en ? 'Sync: mutual teasing' : '同步：互相吐槽';
        return en ? 'Sync: steady' : '同步：稳定';
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
                    ? `${textOf(game.currentLevel.title)} · ${textOf(game.currentLevel.chapter)}. ${window.t?.('comms.contextShort') || '玩家只回表情；她会慢慢讲。'}`
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
            ? (window.t?.('comms.statusSignalJitter') || '信号抖动')
            : (detail.type === 'victory'
                ? (window.t?.('comms.statusBriefSafe') || '短暂安全')
                : (window.t?.('comms.statusReaction') || '现场反应'));
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
                        ? `${textOf(currentGame.currentLevel.title)} · ${textOf(currentGame.currentLevel.chapter)}. ${window.t?.('comms.contextShort') || '玩家只回表情；她会慢慢讲。'}`
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
        chaser: { symbol: '×', labelKey: 'ai.name.chaser', fallback: '追击者' },
        guardian: { symbol: '◆', labelKey: 'ai.name.guardian', fallback: '守钥者' },
        ambusher: { symbol: '◇', labelKey: 'ai.name.ambusher', fallback: '伏击者' }
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
        if (level.guardianAggro === 'afterKey') return window.t?.('guardianRule.afterKey') || '拿钥匙后狂暴';
        if (level.guardianAggro === 'guardDoor') return window.t?.('guardianRule.guardDoor') || '拿钥匙后守门';
        return window.t?.('guardianRule.sameFace') || '同面引诱';
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
            const meta = enemyMeta[type] || { symbol: '?', fallback: type };
            const label = meta.labelKey ? (window.t?.(meta.labelKey) || meta.fallback) : meta.fallback;
            icons.push(makeMetaToken({
                type: `enemy enemy-${type}`,
                symbol: meta.symbol,
                count,
                label: `${label} x${count}`
            }));
        });

        if (level.rotationEnabled && (includeAlwaysTools || index === firstRotationIndex)) {
            icons.push(makeMetaToken({
                type: 'tool tool-rotation',
                symbol: '⟳',
                label: window.t?.('mechanic.rotationOpen') || '空间折叠已开放'
            }));
        } else if (!level.rotationEnabled && includeAlwaysTools) {
            icons.push(makeMetaToken({
                type: 'rule rule-no-twist',
                symbol: '—',
                label: window.t?.('scanner.noTwist') || '无旋转'
            }));
        }
        if (level.bridges?.length && (includeAlwaysTools || index === firstBridgeIndex)) {
            icons.push(makeMetaToken({
                type: 'tool tool-bridge',
                symbol: '◉',
                label: window.t?.('mechanic.bridgeFirst') || '传送裂缝首次出现'
            }));
        }
        if (level.voids?.length) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: '∅',
                count: level.voids.length,
                label: formatText('mechanic.voidCount', '虚空缺口 x{count}', { count: level.voids.length })
            }));
        }
        if (level.patchCharges) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: '+',
                count: level.patchCharges,
                label: formatText('mechanic.patchCount', '临时补片 x{count}', { count: level.patchCharges })
            }));
        }
        if (level.beaconCharges) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: 'B',
                count: level.beaconCharges,
                label: formatText('mechanic.beaconCount', '诱饵信标 x{count}', { count: level.beaconCharges })
            }));
        }
        if (level.breakCharges) {
            icons.push(makeMetaToken({
                type: 'tool',
                symbol: '×',
                count: level.breakCharges,
                label: formatText('mechanic.breakCount', '碎解次数 x{count}', { count: level.breakCharges })
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
                feel.note(`${textOf(level.title)} ${window.t?.('setup.selectedNote') || '已选中'}`, 'info');
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
                <span>${escapeHtml(window.t?.('setup.bestTurns') || '最佳回合')} ${level.bestTurns}</span>
                <span>${escapeHtml(window.t?.('setup.bestRotations') || '最佳旋转')} ${level.bestRotations}</span>
                ${renderLevelMetaIcons(level, selectedLevelIndex, { includeAlwaysTools: true })}
            </div>
        `;
    }

    function renderInspectOverlay() {
        const level = game.levels[selectedLevelIndex];
        if (!level) return;
        const stats = getLevelStats(level);
        if (inspectTitle) inspectTitle.textContent = window.t?.('inspect.title') || '战术简报';
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
                        ${renderLevelMetaIcons(level, selectedLevelIndex, { includeAlwaysTools: true }) || `<span class="scanner-chip safe">${escapeHtml(window.t?.('inspect.basicEscape') || '基础逃生')}</span>`}
                    </div>
                </article>
                <article class="briefing-log">
                    <span>BRIEFING LOG</span>
                    <p>${escapeHtml(textOf(level.concept))}</p>
                    <small>${escapeHtml(window.t?.('scanner.recommendedTurns') || '建议回合')} ${Number(level.bestTurns || 0)} · ${escapeHtml(window.t?.('scanner.recommendedRotations') || '建议折叠')} ${Number(level.bestRotations || 0)}</small>
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
        setTwistMode(false, { silent: true });
        setupOverlay.classList.remove('active');
        gameoverOverlay.classList.remove('active', 'jump-alert', 'signal-lost');
        victoryOverlay.classList.remove('active');
        gameContainer.style.display = 'grid';
        gameContainer.classList.add('preplay-stage', 'inspect-stage');
        game.initLevel(index, true);
        syncRotationAvailability();
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

            let label = formatText('fold.layerNumber', '{n}层', { n: i + 1 });
            if (i === 0) label += ` ${window.t?.('fold.layerBottom') || '底/左/后'}`;
            else if (i === size - 1) label += ` ${window.t?.('fold.layerTop') || '顶/右/前'}`;
            else label += ` ${window.t?.('fold.layerMiddle') || '中'}`;

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
            feel.note(window.t?.('archive.syncedNote') || '档案矩阵已同步到右侧手机，进入残局后可查看', 'info');
        } else {
            feel.note(window.t?.('setup.openNote') || '残局目录已打开', 'info');
        }
    }

    function syncRotationAvailability() {
        const hasRotation = Boolean(game?.rotationEnabled);
        btnTwistMode?.classList.toggle('is-hidden', !hasRotation);
        btnTwistMode?.setAttribute('aria-hidden', String(!hasRotation));
        document.body?.classList.toggle('rotation-level-enabled', hasRotation);
        document.body?.classList.toggle('rotation-level-disabled', !hasRotation);
        if (!hasRotation && twistMode) {
            setTwistMode(false, { silent: true });
        } else if (!hasRotation) {
            render.clearLayerHighlight?.();
            render.clearTwistControlRings?.();
        }
        return hasRotation;
    }

    function resetLevelModeChrome() {
        toolsMenuUserCollapsed = false;
        setTwistMode(false, { silent: true });
        syncRotationAvailability();
        updateFloatingToolsCount();
    }

    function setTwistMode(enabled, options = {}) {
        const shouldEnable = Boolean(enabled);
        if (shouldEnable && !game.rotationEnabled) {
            twistMode = false;
            btnTwistMode?.classList.remove('active');
            btnTwistMode?.setAttribute('aria-pressed', 'false');
            document.body?.classList.remove('twist-interaction-active');
            render.setInteractionMode?.('route');
            render.clearLayerHighlight?.();
            render.clearTwistControlRings?.();
            if (!options.silent) {
                feel.note(window.t?.('note.rotationMissing') || '本关暂未引入旋转', 'warn');
            }
            return false;
        }

        twistMode = shouldEnable;
        btnTwistMode?.classList.toggle('active', twistMode);
        btnTwistMode?.setAttribute('aria-pressed', String(twistMode));
        document.body?.classList.toggle('twist-interaction-active', twistMode);
        render.setInteractionMode?.(twistMode ? 'twist' : 'route');
        if (twistMode) {
            game.clearPlannedPath();
            if (!options.silent) feel.note(window.t?.('note.twistOn') || '空间折叠：拖拽魔方面拧当前层，世界流速放慢', 'info');
        } else if (!options.silent) {
            render.clearLayerHighlight?.();
            feel.note(
                game.realtimeMode
                    ? (window.t?.('note.directMode') || '直控模式：点击相邻格移动')
                    : (window.t?.('note.routeMode') || '路线模式：在 3D 表面画路'),
                'info'
            );
        } else {
            render.clearLayerHighlight?.();
        }
        return true;
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
        if (game.tutorialActive) {
            const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
            if (step) {
                if (shouldOpen && step.type === 'esc') {
                    advanceTutorialStep();
                } else if (!shouldOpen && step.type === 'closeEsc') {
                    advanceTutorialStep();
                }
            }
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
        localStorage.setItem('dawnCubeLowPowerMode', String(settingsState.lowPowerMode));
        localStorage.setItem('dimensionHackDevMode', String(settingsState.devMode));
        localStorage.setItem('dawnCubePlayerMoveMs', String(settingsState.playerMoveMs));
        localStorage.setItem('dawnCubeEnemySpeedScale', String(settingsState.enemySpeedScale));
        localStorage.setItem('dawnCubeKeybinds', JSON.stringify(settingsState.keybinds));
        window.dawnCubeSettings = settingsState;
        applyPerformanceMode();
        game.applyRealtimeTuning?.(settingsState);
    }

    function applyPerformanceMode() {
        const lowPower = Boolean(settingsState.lowPowerMode);
        document.body?.classList.toggle('low-power-mode', lowPower);
        document.body?.classList.toggle('page-hidden-motion-paused', document.hidden);
        render.applyPerformanceSettings?.({ lowPowerMode: lowPower });
        if (!document.hidden) {
            schedulePhoneWaveLoop();
            scheduleLedMascotLoop();
        }
    }

    function renderSettingsPanel() {
        settingsLangBtns.forEach(btn => {
            const active = btn.dataset.settingsLang === window.currentLang;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
            btn.textContent = window.currentLang === 'en' && btn.dataset.settingsLang === 'zh'
                ? 'ZH'
                : (btn.dataset.settingsLang === 'zh' ? '中' : 'EN');
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
        if (settingsLowPowerBtn) {
            settingsLowPowerBtn.classList.toggle('active', settingsState.lowPowerMode);
            settingsLowPowerBtn.setAttribute('aria-pressed', String(settingsState.lowPowerMode));
            settingsLowPowerBtn.textContent = settingsState.lowPowerMode
                ? (window.t?.('settings.lowPowerOn') || '低功耗中')
                : (window.t?.('settings.lowPowerOff') || '标准画质');
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
            feel.note(`${target.textContent.replace(/\s+/g, ' ').trim()} ${window.t?.('tool.modeSuffix') || '模式'}`, 'info');
            return true;
        }
        return false;
    }

    function triggerWaitKeybind() {
        if (!isGameActive || render.isAnimating || game.gameState !== 'playing') return false;
        feel.note(
            game.realtimeMode
                ? (window.t?.('note.waitRealtime') || '原地稳住半拍')
                : (window.t?.('note.waitTurn') || '跳过回合，敌人行动'),
            game.realtimeMode ? 'info' : 'danger'
        );
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
            if (phase === 'down' && !game.tutorialActive) feel.note(window.t?.('note.bulletLocked') || '第二幕才解锁慢放。', 'info');
            return true;
        }
        setBulletTimeActive(phase === 'down');
        return true;
    }

    function handleGameplayKeybind(event, phase = 'down') {
        if (settingsOverlay?.classList.contains('active')) return false;
        if (escConsole?.classList.contains('active')) return false;
        if (game && game.l03CutsceneActive) return false;

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
                        game.showFeel?.(window.t?.('note.guidedMoveOnly') || '当前步骤强引导中。请按照指示移动！', 'warn');
                        return true;
                    }
                }
                if (step.type === 'twist') {
                    if (code === keybinds.patch || code === keybinds.beacon || code === keybinds.break || code === keybinds.wait) {
                        game.playFeel?.('invalid');
                        game.showFeel?.(window.t?.('note.guidedTwistOnly') || '当前步骤强引导中。请按照指示进行空间旋转！', 'warn');
                        return true;
                    }
                }
                if (step.type === 'tool') {
                    const targetTool = step.tool;
                    if (code === keybinds.twist || code === keybinds.wait || (code === keybinds.patch && targetTool !== 'patch') || (code === keybinds.beacon && targetTool !== 'beacon') || (code === keybinds.break && targetTool !== 'break')) {
                        game.playFeel?.('invalid');
                        const toolNames = {
                            patch: window.t?.('tool.patchTitle') || '补片',
                            beacon: window.t?.('tool.beaconTitle') || '信标',
                            break: window.t?.('tool.breakTitle') || '碎解'
                        };
                        game.showFeel?.(formatText('note.useTool', '当前步骤强引导中。请使用 [{tool}] 工具。', {
                            tool: toolNames[targetTool] || targetTool
                        }), 'warn');
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
                return setTwistMode(true);
            }
        } else {
            if (code === keybinds.wait) return triggerTemporalKeybind('up');
            if (code === keybinds.twist && isGameActive) {
                return setTwistMode(false);
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
            phoneNotch.setAttribute('aria-label', collapsed
                ? (window.t?.('phone.expand') || '展开 E-7 手机')
                : (window.t?.('phone.collapse') || '收起 E-7 手机'));
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

    function openDawnChatWindow({ clearNotice = true } = {}) {
        dawnChatWindow?.classList.remove('is-hidden');
        positionDawnChatWindow();
        if (clearNotice) {
            setCommsTutorialNotice(false);
            clearUnread('comms');
        }
    }

    function closeDawnChatWindow({ clearNotice = false } = {}) {
        dawnChatWindow?.classList.add('is-hidden');
        dawnChatWindow?.classList.remove('is-tutorial-active');
        setDawnChatFollowingBubble(false);
        dawnChatNextBtn?.classList.add('is-hidden');
        if (clearNotice) setCommsTutorialNotice(false);
    }

    function positionDawnChatWindow() {
        if (!dawnChatWindow || !commsFloatBubble) return;
        const bubbleRect = commsFloatBubble.getBoundingClientRect();
        const spacing = 12;
        const margin = 10;
        const chatWidth = dawnChatWindow.offsetWidth || 264;
        const chatHeight = dawnChatWindow.offsetHeight || 304;
        let left = bubbleRect.left + bubbleRect.width / 2 - chatWidth / 2;
        left = Math.max(margin, Math.min(window.innerWidth - chatWidth - margin, left));
        let top = bubbleRect.top - chatHeight - spacing;
        dawnChatWindow.classList.toggle('is-below-bubble', top < margin);
        if (top < margin) {
            top = bubbleRect.bottom + spacing;
        }
        top = Math.max(margin, Math.min(window.innerHeight - chatHeight - margin, top));
        dawnChatWindow.style.left = `${left}px`;
        dawnChatWindow.style.top = `${top}px`;
        dawnChatWindow.style.setProperty('--chat-anchor-x', `${bubbleRect.left + bubbleRect.width / 2 - left}px`);
    }

    function setDawnChatFollowingBubble(active) {
        dawnChatWindow?.classList.toggle('is-following-bubble', Boolean(active));
    }

    function cleanupDawnBubbleDragState() {
        setDawnChatFollowingBubble(false);
        positionDawnChatWindow();
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
            if (btn.id === 'comms-float-bubble') {
                setDawnChatFollowingBubble(true);
                positionDawnChatWindow();
            }
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
            } else if (btn.id === 'comms-float-bubble') {
                positionDawnChatWindow();
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
            if (btn.id === 'comms-float-bubble') {
                setDawnChatFollowingBubble(false);
                positionDawnChatWindow();
            }
            if (!wasDrag) onClick?.();
        });
        btn.addEventListener('pointercancel', () => {
            drag = null;
            btn.classList.remove('is-dragging');
            if (btn.id === 'comms-float-bubble') {
                cleanupDawnBubbleDragState();
            }
        });
        if (btn.id === 'comms-float-bubble') {
            window.addEventListener('pointerup', cleanupDawnBubbleDragState, true);
            window.addEventListener('pointercancel', cleanupDawnBubbleDragState, true);
            window.addEventListener('blur', cleanupDawnBubbleDragState);
        }
    }

    function positionFloatingToolboxMenu() {
        const menu = document.getElementById('floating-toolbox-menu');
        if (!menu) return;
        menu.style.left = '';
        menu.style.bottom = '';
        menu.style.right = 'clamp(1rem, 2.2vw, 2rem)';
        menu.style.top = '50%';
    }

    function toggleFloatingToolboxMenu(force = null) {
        const menu = document.getElementById('floating-toolbox-menu');
        if (!menu) return;
        const shouldShow = force === null
            ? menu.classList.contains('is-hidden')
            : Boolean(force);
        toolsMenuUserCollapsed = !shouldShow;
        menu.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
            positionFloatingToolboxMenu();
        }
    }

    function getToolModeMeta(mode = 'route') {
        const meta = {
            route: {
                icon: '➜',
                title: window.t?.('tool.mode.routeTitle') || '移动模式',
                desc: window.t?.('tool.mode.routeDesc') || '点击 Dawn 周围的发亮格。'
            },
            patch: {
                icon: '▣',
                title: window.t?.('tool.mode.patchTitle') || '补片模式',
                desc: window.t?.('tool.mode.patchDesc') || '选择一个缺口，临时铺出可走格。'
            },
            beacon: {
                icon: '◆',
                title: window.t?.('tool.mode.beaconTitle') || '诱饵模式',
                desc: window.t?.('tool.mode.beaconDesc') || '选择格子放置信标，吸引威胁源。'
            },
            break: {
                icon: '✕',
                title: window.t?.('tool.mode.breakTitle') || '碎解模式',
                desc: window.t?.('tool.mode.breakDesc') || '选择可碎解格，打开一条短路。'
            }
        };
        return meta[mode] || meta.route;
    }

    function updateToolModeFeedback() {
        const mode = game.toolMode || 'route';
        const meta = getToolModeMeta(mode);
        document.body.dataset.toolMode = mode;

        if (toolModeIcon) toolModeIcon.textContent = meta.icon;
        if (toolModeTitle) toolModeTitle.textContent = meta.title;
        if (toolModeDesc) toolModeDesc.textContent = meta.desc;
        if (toolModeIndicator) {
            toolModeIndicator.dataset.mode = mode;
            toolModeIndicator.classList.toggle('is-tool-active', mode !== 'route');
        }
        if (toolsFloatBubble) {
            toolsFloatBubble.classList.toggle('is-tool-active', mode !== 'route');
            toolsFloatBubble.setAttribute('aria-pressed', String(mode !== 'route'));
        }

        const menu = document.getElementById('floating-toolbox-menu');
        if (menu && !menu.classList.contains('is-hidden')) {
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
            toolsFloatBubble.classList.toggle('is-tool-active', hasTools && game.toolMode !== 'route');
            toolsFloatBubble.setAttribute('aria-expanded', String(hasTools && !toolsMenuUserCollapsed));
            const menu = document.getElementById('floating-toolbox-menu');
            if (!hasTools) {
                menu?.classList.add('is-hidden');
                toolsMenuUserCollapsed = false;
            } else if (menu && !toolsMenuUserCollapsed) {
                menu.classList.remove('is-hidden');
                positionFloatingToolboxMenu();
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
        setCompanionBubble(window.t?.('comms.routeSeen') || '我看到了。你先别把我往奇怪地方带。', 'info');
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
        setTwistMode(false, { silent: true });
        setBulletTimeActive(false);
        isGameActive = true;

        await showLoadingSequence(game.levels[selectedLevelIndex]);
        game.initLevel(selectedLevelIndex, false);
        resetLevelModeChrome();
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
        const delayL03TutorialUntilRollback = selectedLevelIndex === 2 && game.tutorialActive && !game.l03RollbackTriggered;
        if (game.tutorialActive) {
            if (delayL03TutorialUntilRollback) {
                hideTutorialDialogue();
                render.hideTutorialPointer?.();
                lastTutorialNoticeKey = '';
                game.setRealtimePaused?.(false);
            } else {
                updateTutorialUI();
                game.setRealtimePaused?.(true);
            }
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

        // L03 Automated Cutscene
        if (selectedLevelIndex === 2) {
            game.l03CutsceneActive = true;
            const showL03TutorialAfterRollback = () => {
                game.l03CutsceneActive = false;
                if (game.currentLevelIndex === 2 && game.tutorialActive && game.l03RollbackTriggered) {
                    updateTutorialUI();
                    game.setRealtimePaused?.(true);
                }
            };
            setTimeout(async () => {
                if (game.currentLevelIndex !== 2 || game.gameState !== 'playing') {
                    game.l03CutsceneActive = false;
                    return;
                }

                // Let Dawn speak
                setCompanionBubble(window.t?.('comms.l03Curious') || "咦，那边好像有个发光的小人？……这鬼地方闷死了，我过去跟它打个招呼，万一它是能带我出去的管理员呢？", "info");

                // Wait 2.8 seconds for speech bubble to show, then move
                await new Promise(resolve => setTimeout(resolve, 2800));

                if (game.currentLevelIndex !== 2 || game.gameState !== 'playing') {
                    game.l03CutsceneActive = false;
                    return;
                }

                // Step 1: Move Dawn to at(0, 1, 0)
                const targetCell1 = game.resolveCoord({ face: 0, row: 1, col: 0 });
                game.movePlayerRealtime(targetCell1);

                // Wait 1.5 seconds for the move animation to complete and enemy turn to run
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (game.currentLevelIndex !== 2 || game.gameState !== 'playing' || game.l03RollbackTriggered) {
                    showL03TutorialAfterRollback();
                    return;
                }

                // Step 2: Dawn keeps going to the monster's cell at(0, 0, 0)
                const targetCell2 = game.resolveCoord({ face: 0, row: 0, col: 0 });
                game.movePlayerRealtime(targetCell2);

                // The contact will occur, triggering rollback.
                setTimeout(showL03TutorialAfterRollback, 1200);

            }, 1000);
        }
    }

    function resetCurrentLevel() {
        const levelId = game.currentLevel?.id;
        if (levelId) localStorage.removeItem(`dawnCubeTutorialDismissed:${levelId}`);
        setBulletTimeActive(false);
        game.initLevel(game.currentLevelIndex, false);
        resetLevelModeChrome();
        game.setRealtimeMode?.(true);
        game.startRealtime?.();
        renderUnreadBadges();
        render.buildCube3D();
        render.spawnEntities3D();
        render.resetCamera?.();
        if (render.plannedLine && render.scene) render.scene.remove(render.plannedLine);
        audio.setTension('calm');
        feel.note(window.t?.('note.resetLevel') || '残局已重置', 'warn');
        feel.flashScreen('warn');
        if (game.tutorialActive) {
            updateTutorialUI();
            game.setRealtimePaused?.(true);
        }
    }

    function returnToLevelBook() {
        isGameActive = false;
        setBulletTimeActive(false);
        setTwistMode(false, { silent: true });
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
        feel.note(window.t?.('note.backLevelBook') || '回到残局册', 'info');
    }

    function updateRotationHighlight() {
        const rotationPreviewChip = document.getElementById('rotation-preview-chip');
        if (rotationPreviewChip) {
            const layerNumber = Number(rotateLayerSelect.value || 0) + 1;
            const layerText = rotateLayerSelect.selectedOptions?.[0]?.textContent?.replace(/\s+/g, ' ')
                || (window.t?.('fold.layerLabel') || '第 {n} 层').replace('{n}', String(layerNumber));
            rotationPreviewChip.innerText = `${rotateAxisSelect.value || 'X'} · ${layerText} · ↻ / ↺`;
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
    document.addEventListener('visibilitychange', () => {
        applyPerformanceMode();
        if (document.hidden) {
            if (phoneWaveFrameId !== null) {
                cancelAnimationFrame(phoneWaveFrameId);
                phoneWaveFrameId = null;
            }
            if (ledMascotFrameId !== null) {
                cancelAnimationFrame(ledMascotFrameId);
                ledMascotFrameId = null;
            }
        } else {
            lastPhoneWaveFrameAt = 0;
            lastLedMascotFrameAt = 0;
            drawVoiceWave(phonePanel?.classList.contains('is-talking'));
            schedulePhoneWaveLoop();
            scheduleLedMascotLoop();
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
    dawnKaomojiDock?.addEventListener('click', event => {
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
            appendCommandBubble(formatText('command.rotate', '指令：旋转 {axis} 轴第 {layer} 层 [{direction}]', {
                axis: detail.axis,
                layer: Number(detail.layer || 0) + 1,
                direction: detail.direction === 'CW'
                    ? (window.t?.('command.clockwise') || '顺时针')
                    : (window.t?.('command.counterClockwise') || '逆时针')
            }));
            renderStoryEvent(detail, eventScenes.firstRotation, 'firstRotation');
            pulseCompanionReaction(detail);
        } else if (detail.type === 'patchPlaced') {
            appendCommandBubble(formatText('command.patch', '指令：在 {cell} 部署补片', { cell: game.describeCell(detail.at) }));
            pulseCompanionReaction(detail);
        } else if (detail.type === 'beaconPlaced') {
            appendCommandBubble(formatText('command.beacon', '指令：在 {cell} 部署诱饵', { cell: game.describeCell(detail.at) }));
            pulseCompanionReaction(detail);
        } else if (detail.type === 'patchBroken') {
            appendCommandBubble(formatText('command.break', '指令：碎解 {cell}', { cell: game.describeCell(detail.at) }));
            pulseCompanionReaction(detail);
        } else if (detail.type === 'breakPlaced') {
            appendCommandBubble(formatText('command.break', '指令：碎解 {cell}', { cell: game.describeCell(detail.at) }));
            pulseCompanionReaction(detail);
        } else if (detail.type === 'skip') {
            appendCommandBubble(window.t?.('command.skip') || '指令：原地待命 (跳过回合)');
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
            feel.note(window.t?.('note.realtimeNoSend') || '实时模式不用发送路线，直接点相邻格。', 'info');
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
            feel.note(
                game.realtimeMode
                    ? (window.t?.('note.waitRealtime') || '原地稳住半拍')
                    : (window.t?.('note.waitTurn') || '跳过回合，敌人行动'),
                game.realtimeMode ? 'info' : 'danger'
            );
            if (!game.realtimeMode) feel.flashScreen('danger');
            game.skipTurn();
        }
    });

    btnUndo.addEventListener('click', () => {
        if (!render.isAnimating) {
            if (game.undoTurn()) {
                feel.note(
                    game.realtimeMode
                        ? (window.t?.('note.undoRealtime') || '已倒回 3 秒')
                        : (window.t?.('note.undoStep') || '已悔棋一步'),
                    'info'
                );
            }
        }
    });

    btnReset.addEventListener('click', () => {
        if (confirm(window.t?.('confirm.resetLevel') || '确定要重置当前残局吗？')) {
            resetCurrentLevel();
        }
    });

    btnMainMenu?.addEventListener('click', () => {
        if (confirm(window.t?.('confirm.backLevelBook') || '回到残局册？当前本局会暂停在这里，不会自动保存路线。')) {
            returnToLevelBook();
        }
    });

    btnEscMenu?.addEventListener('click', () => toggleEscConsole(true));
    btnConsoleResume?.addEventListener('click', () => toggleEscConsole(false));
    btnConsoleReset?.addEventListener('click', () => {
        if (confirm(window.t?.('confirm.resetLevel') || '确定要重置当前残局吗？')) {
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
        feel.note(audio.muted ? (window.t?.('audio.offNote') || '声音已关闭') : (window.t?.('audio.onNote') || '声音已开启'), audio.muted ? 'warn' : 'good');
        if (!audio.muted) audio.start().then(() => audio.play('uiConfirm'));
    });
    settingsLowPowerBtn?.addEventListener('click', () => {
        settingsState.lowPowerMode = !settingsState.lowPowerMode;
        persistSettings();
        renderSettingsPanel();
        const note = settingsState.lowPowerMode
            ? (window.currentLang === 'en' ? 'Low power mode on' : '低功耗/屏幕共享模式已开启')
            : (window.currentLang === 'en' ? 'Standard visuals restored' : '已恢复标准画质');
        feel.note(note, settingsState.lowPowerMode ? 'good' : 'info');
    });
    settingsDevModeBtn?.addEventListener('click', () => {
        settingsState.devMode = !settingsState.devMode;
        persistSettings();
        renderSettingsPanel();
        renderLevelCards();
        renderLevelBrief();
        feel.note(
            settingsState.devMode
                ? (window.t?.('settings.devOnNote') || '开发者模式：关卡全解锁')
                : (window.t?.('settings.devOffNote') || '开发者模式已关闭'),
            settingsState.devMode ? 'good' : 'info'
        );
    });
    settingsResetTutorialsBtn?.addEventListener('click', () => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('dawnCubeTutorialDismissed:')) {
                localStorage.removeItem(key);
            }
        });
        audio.play('uiConfirm');
        feel.note(window.t?.('settings.resetTutorialsNote') || '所有教学提示已恢复', 'good');
        if (game.currentLevel && game.currentLevel.tutorialSteps?.length > 0) {
            game.initLevel(game.currentLevelIndex, false);
            updateTutorialUI();
            if (typeof render !== 'undefined') {
                render.buildCube3D();
                render.spawnEntities3D();
            }
        }
    });
    settingsClearProgressBtn?.addEventListener('click', () => {
        const confirmed = window.confirm(window.t?.('settings.clearConfirm') || '清除所有关卡进度、档案和成就？这个操作不能撤销。');
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
        feel.note(window.t?.('settings.clearDone') || '进度已清除，回到第一关。', 'warn');
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
        const tutorialStep = game.activeTutorialSteps?.[game.currentTutorialStepIndex];
        if (game.tutorialActive && isSystemTutorialStep(tutorialStep)) {
            setCommsTutorialNotice(true);
            audio.play('invalid');
            feel.note(
                window.currentLang === 'en'
                    ? 'Finish the system guide first. Dawn will wait.'
                    : '先完成系统引导，Dawn 的消息会等你。',
                'info'
            );
            return;
        }
        if (dawnChatWindow?.classList.contains('is-hidden')) {
            openDawnChatWindow({ clearNotice: true });
        } else {
            closeDawnChatWindow();
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
        positionDawnChatWindow();
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
        if (render.isAnimating && !twistMode) return;
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
        if (!isSystemTutorialStep(step)) return;
        event.preventDefault();
        event.stopPropagation();
        advanceTutorialStep();
    });
    dawnChatNextBtn?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
    });
    dawnChatCloseBtn?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        closeDawnChatWindow();
    });
    tutorialDialogueClose?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        skipTutorial();
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

            // 6. 如果正在使用旋转/工具，Esc 先回到普通移动，避免误操作
            if (isGameActive && twistMode) {
                setTwistMode(false);
                return;
            }
            if (isGameActive && game.toolMode && game.toolMode !== 'route') {
                game.setToolMode('route');
                toggleFloatingToolboxMenu(false);
                return;
            }

            // 7. 如果在游戏活跃状态下，切换暂停控制台的显示与隐藏
            if (isGameActive) {
                toggleEscConsole();
                return;
            }

            // 8. 在主菜单无额外层时，Esc 忽略
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
            toggleFloatingToolboxMenu(game.toolMode !== 'route');
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
            feel.note(
                game.realtimeMode
                    ? (window.t?.('note.undoRealtimeReview') || '倒回 3 秒，重新推演')
                    : (window.t?.('note.undoStepReview') || '回到上一步，重新推演'),
                'info'
            );
        }
    });

    btnToggleAnalysis?.addEventListener('click', () => {
        if (!failureAnalysis) return;
        const shouldShow = failureAnalysis.classList.contains('is-hidden');
        failureAnalysis.classList.toggle('is-hidden', !shouldShow);
        btnToggleAnalysis.innerText = shouldShow
            ? (window.t?.('gameover.hideReview') || '收起残局复盘')
            : (window.t?.('gameover.review') || '查看残局复盘');
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
            setTwistMode(false, { silent: true });
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
        feel.note(audio.muted ? (window.t?.('audio.offNote') || '声音已关闭') : (window.t?.('audio.onNote') || '声音已开启'), audio.muted ? 'warn' : 'good');
        if (!audio.muted) {
            audio.start().then(() => audio.play('uiConfirm'));
        }
    });

    // ----------------------------------------------------
    // MILESTONE 7: INTERACTIVE TUTORIAL ENGINE
    // ----------------------------------------------------
    let tutorialTypingTimer = null;
    let lastDawnTutorialMessageKey = '';
    let tutorialUiArrow = null;
    let tutorialSecondaryFocusTimer = null;
    let tutorialSecondaryFocusRetryTimer = null;

    function getTutorialStepText(step) {
        return step?.text?.[window.currentLang || 'zh'] || step?.text?.zh || '';
    }

    function isSystemTutorialStep(step) {
        if (!step) return false;
        return step.type !== 'dialog' || step.tone === 'system' || step.speaker === '系统广播';
    }

    function ensureTutorialUiArrow() {
        if (!tutorialUiArrow) {
            tutorialUiArrow = document.createElement('div');
            tutorialUiArrow.className = 'tutorial-ui-arrow is-hidden';
            tutorialUiArrow.setAttribute('aria-hidden', 'true');
            document.body.appendChild(tutorialUiArrow);
        }
        return tutorialUiArrow;
    }

    function hideTutorialUiArrow() {
        tutorialUiArrow?.classList.add('is-hidden');
    }

    function showTutorialUiArrow(targetEl) {
        if (!targetEl) {
            hideTutorialUiArrow();
            return;
        }
        const rect = targetEl.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            hideTutorialUiArrow();
            return;
        }
        const arrow = ensureTutorialUiArrow();
        const targetOnRight = rect.left > window.innerWidth * 0.52;
        const x = targetOnRight ? rect.left - 42 : rect.right + 10;
        const y = rect.top + rect.height / 2;
        arrow.textContent = '➜';
        arrow.classList.toggle('points-left', !targetOnRight);
        arrow.style.left = `${Math.max(10, Math.min(window.innerWidth - 44, x))}px`;
        arrow.style.top = `${Math.max(10, Math.min(window.innerHeight - 44, y))}px`;
        arrow.classList.remove('is-hidden');
    }

    function getTutorialUiTarget(step) {
        if (!step) return null;
        if (step.uiTarget === 'twist') return btnTwistMode || toolsFloatBubble;
        if (step.uiTarget === 'tools') return toolsFloatBubble;
        if (step.uiTarget === 'esc') return btnEscMenu;
        if (step.type === 'esc') return btnEscMenu;
        if (step.type === 'closeEsc') return btnConsoleResume || escConsole;
        if (step.type === 'tool' && step.tool) {
            return document.querySelector(`#floating-toolbox-menu [data-tool-mode="${step.tool}"]`)
                || document.querySelector(`#tool-section [data-tool-mode="${step.tool}"]`)
                || toolsFloatBubble;
        }
        if (step.openTools) return toolsFloatBubble;
        if (step.type === 'twist') return btnTwistMode || toolsFloatBubble;
        return null;
    }

    function updateTutorialControlTargets(step, isSystemStep) {
        btnTwistMode?.classList.toggle('tutorial-target', step?.type === 'twist' || step?.uiTarget === 'twist');
        btnEscMenu?.classList.toggle('tutorial-target', step?.type === 'esc' || step?.uiTarget === 'esc');
        commsFloatBubble?.classList.remove('tutorial-target');
        toolsFloatBubble?.classList.toggle('tutorial-target', step?.openTools || step?.type === 'tool' || step?.uiTarget === 'tools');
        document.querySelectorAll('[data-tool-mode]').forEach(btn => {
            btn.classList.toggle('tutorial-target', step?.type === 'tool' && btn.dataset.toolMode === step.tool);
        });
        const uiTarget = getTutorialUiTarget(step);
        showTutorialUiArrow(uiTarget);
    }

    function clearTutorialControlTargets() {
        btnTwistMode?.classList.remove('tutorial-target');
        btnEscMenu?.classList.remove('tutorial-target');
        commsFloatBubble?.classList.remove('tutorial-target');
        toolsFloatBubble?.classList.remove('tutorial-target');
        document.querySelectorAll('[data-tool-mode]').forEach(btn => btn.classList.remove('tutorial-target'));
        hideTutorialUiArrow();
    }

    function clearTutorialSecondaryFocusTimers() {
        if (tutorialSecondaryFocusTimer) {
            clearTimeout(tutorialSecondaryFocusTimer);
            tutorialSecondaryFocusTimer = null;
        }
        if (tutorialSecondaryFocusRetryTimer) {
            clearTimeout(tutorialSecondaryFocusRetryTimer);
            tutorialSecondaryFocusRetryTimer = null;
        }
    }

    function scheduleTutorialSecondaryFocus(step) {
        if (!step || step.secondaryFocusCellId === null || step.secondaryFocusCellId === undefined) return;
        const expectedLevel = game.currentLevel?.id;
        const expectedStep = game.currentTutorialStepIndex;
        const secondaryStep = {
            ...step,
            highlightTarget: step.secondaryHighlightTarget || step.highlightTarget
        };
        const focusSecondary = () => {
            if (!game.tutorialActive || game.currentLevel?.id !== expectedLevel || game.currentTutorialStepIndex !== expectedStep) return;
            render.showTutorialPointer?.(step.secondaryFocusCellId, secondaryStep);
            render.flyToTutorialFocus?.(step.secondaryFocusCellId, 850, Number(step.lockInputMs || 0));
        };
        tutorialSecondaryFocusTimer = setTimeout(() => {
            tutorialSecondaryFocusTimer = null;
            focusSecondary();
            tutorialSecondaryFocusRetryTimer = setTimeout(() => {
                tutorialSecondaryFocusRetryTimer = null;
                focusSecondary();
            }, 700);
        }, 1000);
    }
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

    function scheduleLedMascotLoop() {
        if (ledMascotFrameId !== null || document.hidden) return;
        if (!isUiElementVisible(tutorialLedMascot)) return;
        ledMascotFrameId = requestAnimationFrame(startLedMascotLoop);
    }

    function startLedMascotLoop(now = performance.now()) {
        ledMascotFrameId = null;
        if (document.hidden || !isUiElementVisible(tutorialLedMascot)) return;
        const frameInterval = settingsState.lowPowerMode ? 1000 / 6 : 1000 / 18;
        if (!lastLedMascotFrameAt || now - lastLedMascotFrameAt >= frameInterval) {
            renderLedMascotFrame(now);
            lastLedMascotFrameAt = now;
        }
        scheduleLedMascotLoop();
    }

    function hideSystemTutorialDialogue() {
        window.clearInterval(tutorialTypingTimer);
        drawLedMascot('steady', false);
        tutorialDialogueConsole?.classList.add('is-hidden');
        if (ledMascotFrameId !== null) {
            cancelAnimationFrame(ledMascotFrameId);
            ledMascotFrameId = null;
        }
    }

    function setTutorialDialogue(step) {
        if (!tutorialDialogueConsole || !tutorialDialogueText) return;
        const text = getTutorialStepText(step);
        const tone = step?.tone || 'steady';
        const isSystem = isSystemTutorialStep(step);
        const speaker = textOf(step?.speaker) || (isSystem ? (window.t?.('console.systemSpeaker') || '系统广播') : 'Dawn');
        tutorialDialogueConsole.classList.remove('is-hidden');
        tutorialDialogueConsole.classList.toggle('is-system', isSystem);
        tutorialDialogueConsole.classList.toggle('is-dawn', !isSystem);
        scheduleLedMascotLoop();
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

    function setDawnTutorialMessage(step, noticeKey) {
        const text = getTutorialStepText(step);
        if (!text) return;
        hideSystemTutorialDialogue();
        setCommsTutorialNotice(true);
        if (dawnChatStatusTag) {
            const tone = step?.tone || 'steady';
            dawnChatStatusTag.className = `dawn-status-tag ${tone}`;
            dawnChatStatusTag.textContent = tone === 'panic'
                ? (window.t?.('dawn.chatStatusPanic') || '[状态: 紧张]')
                : tone === 'worry'
                    ? (window.t?.('dawn.chatStatusWorry') || '[状态: 不安]')
                    : (window.t?.('dawn.chatStatusFocused') || '[状态: 专注]');
        }
        if (!dawnChatLog || lastDawnTutorialMessageKey === noticeKey) return;
        lastDawnTutorialMessageKey = noticeKey;
        const bubble = document.createElement('p');
        bubble.className = 'dawn-message-bubble dawn tutorial-message';
        bubble.textContent = text;
        dawnChatLog.appendChild(bubble);
        const bubbles = dawnChatLog.querySelectorAll('.dawn-message-bubble');
        if (bubbles.length > 30) bubbles[0].remove();
        if (!dawnChatWindow?.classList.contains('is-hidden')) {
            dawnChatLog.scrollTop = dawnChatLog.scrollHeight;
        }
    }

    function hideTutorialDialogue({ clearCommsNotice = true } = {}) {
        window.clearInterval(tutorialTypingTimer);
        drawLedMascot('steady', false);
        tutorialDialogueConsole?.classList.add('is-hidden');
        dawnChatNextBtn?.classList.add('is-hidden');
        dawnChatWindow?.classList.remove('is-tutorial-active');
        if (clearCommsNotice) setCommsTutorialNotice(false);
        hideTutorialUiArrow();
        tutorialBlackout?.classList.remove('active');
        tutorialLookGesture?.classList.add('is-hidden');
        tutorialLookProgress?.style.setProperty('--look-progress', '0%');
        gameContainer.classList.remove('tutorial-vignette');
    }

    function completeTutorial({ clearCommsNotice = false } = {}) {
        const levelId = game.currentLevel?.id;
        if (levelId) localStorage.setItem(`dawnCubeTutorialDismissed:${levelId}`, 'true');
        game.tutorialActive = false;
        lastTutorialNoticeKey = '';
        lastDawnTutorialMessageKey = '';
        clearTutorialSecondaryFocusTimers();
        game.setRealtimePaused?.(false);
        clearTutorialControlTargets();
        if (typeof render !== 'undefined') render.hideTutorialPointer?.();
        hideTutorialDialogue({ clearCommsNotice });
        const card = document.getElementById('tutorial-helper-card');
        card?.classList.add('is-hidden');
        if (game.currentLevelIndex !== undefined) {
            renderLevelComms(game.currentLevelIndex);
        }
    }

    function setTutorialVignette(active, focus = { x: 50, y: 48 }, { flat = false } = {}) {
        gameContainer.classList.toggle('tutorial-vignette', Boolean(active));
        tutorialBlackout?.classList.toggle('active', Boolean(active));
        tutorialBlackout?.classList.toggle('is-flat', Boolean(active && flat));
        tutorialBlackout?.style.setProperty('--focus-x', `${focus.x}%`);
        tutorialBlackout?.style.setProperty('--focus-y', `${focus.y}%`);
    }

    function updateTutorialUI() {
        lastStepAdvancedTime = Date.now();
        clearTutorialSecondaryFocusTimers();
        const card = document.getElementById('tutorial-helper-card');
        if (!card) return;

        if (!game.tutorialActive) {
            card.classList.add('is-hidden');
            hideTutorialDialogue();
            clearTutorialControlTargets();
            if (typeof render !== 'undefined') render.hideTutorialPointer?.();
            return;
        }

        const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
        if (!step) {
            completeTutorial({ clearCommsNotice: false });
            return;
        }
        const noticeKey = `${game.currentLevel?.id || 'level'}:${game.currentTutorialStepIndex}:${step.type}`;
        const isNewTutorialNotice = noticeKey !== lastTutorialNoticeKey;
        if (isNewTutorialNotice) {
            lastTutorialNoticeKey = noticeKey;
        }
        const isSystemStep = isSystemTutorialStep(step);
        if (!isSystemStep) {
            if (isNewTutorialNotice) audio.play('commsTick');
            setDawnTutorialMessage(step, noticeKey);
            game.currentTutorialStepIndex++;
            window.setTimeout(updateTutorialUI, 0);
            return;
        }

        updateTutorialControlTargets(step, isSystemStep);
        if (isNewTutorialNotice) {
            audio.play('routeTick');
        }

        if (step.openTools || step.type === 'tool' || step.type === 'twist') {
            openPhonePanel('tasks');
            if (step.openTools || step.type === 'tool') {
                toolsMenuUserCollapsed = false;
                toggleFloatingToolboxMenu(true);
            }
        }

        card.classList.add('is-hidden');
        card.dataset.levelId = game.currentLevel?.id;
        render.setPlayerSpeechBubble?.('');
        closeDawnChatWindow({ clearNotice: false });
        setTutorialDialogue(step);
        const pointerCellId = step.targetCellId ?? step.focusCellId;
        setTutorialVignette(false);
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
                const lang = window.currentLang === 'en' ? 'en' : 'zh';
                const labels = {
                    look: { zh: '按住鼠标拖动旋转视角', en: 'Hold and drag to rotate' },
                    zoom: { zh: '滚动或捏合缩放视野', en: 'Scroll or pinch to zoom' }
                };
                textEl.textContent = labels[step.type]?.[lang] || labels.look[lang];
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

        render.setPlayerSpeechBubble?.('');

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
            if (pointerCellId !== undefined) {
                render.showTutorialPointer?.(pointerCellId, step);
            } else {
                render.hideTutorialPointer?.();
            }
            render.focusTutorialStep?.(step);
            if (step.type === 'twist' && step.axis && Number.isInteger(step.layer)) {
                render.highlightLayer?.(step.axis, step.layer);
            }
            scheduleTutorialSecondaryFocus(step);
        }
    }

    function advanceTutorialStep() {
        if (!game.tutorialActive) return;
        const step = game.activeTutorialSteps[game.currentTutorialStepIndex];
        if (!step) return;

        if (step.type === 'dialog' || step.type === 'look' || step.type === 'zoom' || step.type === 'esc' || step.type === 'closeEsc') {
            game.currentTutorialStepIndex++;
            audio.play('uiConfirm');
            feel.note(window.currentLang === 'en' ? 'Step confirmed' : '步骤完成', 'good');
            updateTutorialUI();
        }
    }

    function skipTutorial() {
        if (!game.tutorialActive) return;
        const levelId = game.currentLevel?.id;
        if (levelId) localStorage.setItem(`dawnCubeTutorialDismissed:${levelId}`, 'true');

        game.tutorialActive = false;
        lastTutorialNoticeKey = '';
        lastDawnTutorialMessageKey = '';
        clearTutorialSecondaryFocusTimers();
        game.setRealtimePaused?.(false);
        clearTutorialControlTargets();
        closeDawnChatWindow({ clearNotice: true });
        if (typeof render !== 'undefined') render.hideTutorialPointer?.();
        hideTutorialDialogue();

        const card = document.getElementById('tutorial-helper-card');
        card?.classList.add('is-hidden');

        if (game.currentLevelIndex !== undefined) {
            renderLevelComms(game.currentLevelIndex);
        }
        audio.play('routeUndo');
        feel.note(window.t?.('note.skipTutorial') || '已跳过本关教程', 'warn');
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
            if (step && step.type === 'dialog' && isSystemTutorialStep(step)) {
                if (Date.now() - lastStepAdvancedTime < 180) {
                    return;
                }
                const moved = Math.hypot(event.clientX - pointerdownStartCoords.x, event.clientY - pointerdownStartCoords.y);
                if (moved > 6) {
                    return; // Ignore drags/swipes
                }
                const skipBtn = event.target.closest('#btn-skip-tutorial, #tutorial-helper-close');
                const systemBtn = event.target.closest('#btn-esc-menu, #audio-toggle, #landing-settings-btn, #btn-console-resume, #btn-console-reset, #btn-console-settings');
                const interactiveTarget = event.target.closest('#tools-float-bubble, #floating-toolbox-menu, [data-tool-mode], #dawn-chat-window, #dawn-chat-close-btn, #dawn-chat-next-btn');
                if (skipBtn) {
                    skipTutorial();
                    return;
                }
                if (systemBtn || interactiveTarget) {
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
                toolsMenuUserCollapsed = true;
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
    schedulePhoneWaveLoop();
    scheduleLedMascotLoop();
    window.setInterval(updatePhoneClock, 30000);

    // A+B Comms free chat input initialization
    function appendDawnMessage(text, isDawn, tone = 'steady') {
        if (!dawnChatLog) return;

        const bubble = document.createElement('p');
        bubble.className = `dawn-message-bubble ${isDawn ? 'dawn' : 'protagonist'}`;

        if (tone === 'system') {
            bubble.style.color = '#ff3b30';
            bubble.style.fontFamily = 'monospace';
        }

        dawnChatLog.appendChild(bubble);

        const bubbles = dawnChatLog.querySelectorAll('.dawn-message-bubble');
        if (bubbles.length > 30) {
            bubbles[0].remove();
        }

        if (!isDawn) {
            bubble.textContent = text;
            dawnChatLog.scrollTop = dawnChatLog.scrollHeight;
        } else {
            let cursor = 0;
            window.clearInterval(tutorialTypingTimer);
            audio.play('commsTick');
            tutorialTypingTimer = window.setInterval(() => {
                cursor += 1;
                bubble.textContent = text.slice(0, cursor);
                dawnChatLog.scrollTop = dawnChatLog.scrollHeight;
                if (cursor >= text.length) {
                    window.clearInterval(tutorialTypingTimer);
                }
            }, 32);
        }
    }

    // A+B Comms free chat input initialization
    const initGeminiChat = () => {
        const apiKey = localStorage.getItem('GEMINI_API_KEY') || window.GEMINI_API_KEY;
        const chatContainer = document.getElementById('comms-chat-input-container');
        const chatInput = document.getElementById('comms-chat-input');
        const sendBtn = document.getElementById('btn-send-chat');

        const dawnChatInput = document.getElementById('dawn-chat-free-input');
        const dawnSendBtn = document.getElementById('btn-dawn-send-chat');

        // Settings UI binding
        const settingsKeyInput = document.getElementById('settings-gemini-key');
        const settingsSaveBtn = document.getElementById('settings-save-gemini-btn');
        if (settingsKeyInput) {
            settingsKeyInput.value = localStorage.getItem('GEMINI_API_KEY') || '';
        }
        if (settingsSaveBtn && !settingsSaveBtn.dataset.bound) {
            settingsSaveBtn.dataset.bound = 'true';
            settingsSaveBtn.addEventListener('click', () => {
                const keyVal = settingsKeyInput?.value.trim();
                if (keyVal) {
                    localStorage.setItem('GEMINI_API_KEY', keyVal);
                    feel.note(window.t?.('settings.geminiSaved') || 'Gemini API 密钥已保存', 'good');
                } else {
                    localStorage.removeItem('GEMINI_API_KEY');
                    feel.note(window.t?.('settings.geminiCleared') || 'Gemini API 密钥已清除', 'warn');
                }
                initGeminiChat();
            });
        }

        const settingsGeminiCard = document.getElementById('settings-gemini-card');
        settingsGeminiCard?.classList.toggle('is-hidden', !FREE_CHAT_ENABLED);

        // Trust/free chat are parked for the current prototype pass. Keep code paths intact.
        if (dawnChatFreeInputContainer) {
            dawnChatFreeInputContainer.classList.toggle('is-hidden', !FREE_CHAT_ENABLED);
        }
        if (chatContainer) {
            chatContainer.classList.toggle('is-hidden', !FREE_CHAT_ENABLED || !apiKey);
        }
        const commsLog = document.querySelector('#phone-panel .terminal-panel[data-terminal-panel="comms"] .comms-log');
        if (commsLog) {
            commsLog.style.setProperty('display', FREE_CHAT_ENABLED && apiKey ? 'flex' : 'none', 'important');
        }

        const handleSend = async (fromInput) => {
            if (!FREE_CHAT_ENABLED) {
                feel.note(window.currentLang === 'en' ? 'Free chat is parked for this build.' : '自由聊天本版暂时关闭', 'info');
                return;
            }
            const inputEl = fromInput === 'dawn' ? dawnChatInput : chatInput;
            const text = inputEl?.value.trim();
            if (!text) return;
            inputEl.value = '';

            // Play send sound
            audio.play('uiConfirm');

            // Append player line
            if (commsStoryLines) {
                const playerLine = document.createElement('p');
                playerLine.className = 'comms-line player';
                playerLine.textContent = text;
                commsStoryLines.appendChild(playerLine);
                commsStoryLines.scrollTo?.({ top: commsStoryLines.scrollHeight, behavior: 'smooth' });
            }

            // Append to Scheme G chat window
            appendDawnMessage(text, false);

            // Intercept if no API key is configured
            if (!apiKey) {
                setTimeout(() => {
                    const fallbackMsg = window.currentLang === 'en'
                        ? 'Connection failed. Please configure your Gemini API Key in the Settings menu (☰ -> Settings) to unlock AI Chat.'
                        : '连接失败。请在『游戏暂停菜单 ☰ -> 设置』中配置您的 Gemini API Key 以激活自由对话链路。';

                    if (commsStoryLines) {
                        const replyEl = document.createElement('p');
                        replyEl.className = 'comms-line system';
                        replyEl.textContent = fallbackMsg;
                        commsStoryLines.appendChild(replyEl);
                    }
                    if (commsLiveLine) {
                        commsLiveLine.className = 'comms-line system';
                        commsLiveLine.textContent = fallbackMsg;
                    }
                    appendDawnMessage(fallbackMsg, true, 'system');
                    audio.play('routeUndo');
                    if (companionStatus) companionStatus.textContent = window.t?.('comms.noApiStatus') || '未配置密钥';
                    if (dawnChatStatusTag) {
                        dawnChatStatusTag.textContent = window.currentLang === 'en' ? '[NO API KEY]' : '[未配置密钥]';
                    }
                }, 600);
                return;
            }

            if (commsLiveLine) {
                commsLiveLine.className = 'comms-line system';
                commsLiveLine.textContent = window.t?.('comms.connected') || '连接正常...';
            }

            // Update state
            if (companionStatus) companionStatus.textContent = window.t?.('comms.typing') || '正在输入...';
            setCompanionBubble('……', 'info');

            if (dawnChatStatusTag) {
                dawnChatStatusTag.textContent = window.currentLang === 'en' ? '[STATUS: TYPING...]' : '[状态: 正在输入...]';
            }

            const currentLevelId = game && game.currentLevel ? game.currentLevel.id : 1;

            const systemPrompt = `你现在正扮演一个叫作 Dawn 的13岁初中女生。你因为未知原因，从宿舍床上掉入了一个漆黑、冰冷、由悬崖和悬空方块组成的魔方世界。
你现在极度害怕、无助、寒冷，非常想回家，想爸爸妈妈。
你手机上收到了玩家（处于外侧世界的人）的通讯信号，你只能依靠玩家在屏幕上的指路和空间重构来在这个危险的世界里存活。

目前游戏状态：
- 关卡：L${currentLevelId}

对话规则：
1. 你的回答必须极其简短，绝对不能超过40个字，要像微信打字那样短。
2. 说话口吻要像一个惊慌失措、需要依靠的13岁小女孩。千万不要有任何系统AI、开发者或者游戏术语。
3. 你现在还分不清玩家、系统和这个世界谁可信，所以可以犹豫、害怕、请求确认，但不要讲规则。
4. 绝对不要承认你是AI，只把自己当成困在方块里的普通人。`;

            const history = [];
            const messageElements = commsStoryLines ? commsStoryLines.querySelectorAll('.comms-line') : [];
            const maxContext = 10;
            const startIdx = Math.max(0, messageElements.length - maxContext);

            for (let i = startIdx; i < messageElements.length; i++) {
                const el = messageElements[i];
                if (el.classList.contains('player')) {
                    history.push({ role: 'user', parts: [{ text: el.textContent }] });
                } else if (el.classList.contains('protagonist')) {
                    history.push({ role: 'model', parts: [{ text: el.textContent }] });
                }
            }

            if (history.length > 0 && history[0].role === 'model') {
                history.unshift({ role: 'user', parts: [{ text: '你好？' }] });
            }

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: history,
                        systemInstruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 100
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`Gemini HTTP ${response.status}`);
                }

                const data = await response.json();
                const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
                    || (window.currentLang === 'en' ? '...The signal is bad on my side.' : '……我这里信号好像不太好。');

                // Play receive sound
                audio.play('routeTick');

                if (commsStoryLines) {
                    const replyEl = document.createElement('p');
                    replyEl.className = 'comms-line protagonist';
                    replyEl.textContent = replyText;
                    commsStoryLines.appendChild(replyEl);
                    commsStoryLines.scrollTo?.({ top: commsStoryLines.scrollHeight, behavior: 'smooth' });
                }

                if (commsLiveLine) {
                    commsLiveLine.className = 'comms-line protagonist';
                    commsLiveLine.textContent = replyText;
                }

                // Append to Scheme G chat window
                appendDawnMessage(replyText, true);

                if (companionStatus) companionStatus.textContent = window.t?.('comms.signalStable') || '信号稳定';
                setCompanionBubble(replyText, 'info');

                if (dawnChatStatusTag) {
                    dawnChatStatusTag.textContent = window.currentLang === 'en' ? '[STATUS: STEADY]' : '[状态: 稍微安心]';
                }

            } catch (err) {
                console.error(err);
                if (companionStatus) companionStatus.textContent = window.t?.('comms.badSignal') || '连接波动';
                setCompanionBubble(window.t?.('comms.badSignalBubble') || '……信号好像被干扰了。', 'warn');

                if (dawnChatStatusTag) {
                    dawnChatStatusTag.textContent = window.currentLang === 'en' ? '[STATUS: NO SIGNAL]' : '[状态: 连接波动]';
                }
            }
        };

        if (sendBtn && !sendBtn.dataset.bound) {
            sendBtn.dataset.bound = 'true';
            sendBtn.addEventListener('click', () => handleSend('phone'));
        }
        if (chatInput && !chatInput.dataset.bound) {
            chatInput.dataset.bound = 'true';
            chatInput.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    handleSend('phone');
                }
            });
        }

        if (dawnSendBtn && !dawnSendBtn.dataset.bound) {
            dawnSendBtn.dataset.bound = 'true';
            dawnSendBtn.addEventListener('click', () => handleSend('dawn'));
        }
        if (dawnChatInput && !dawnChatInput.dataset.bound) {
            dawnChatInput.dataset.bound = 'true';
            dawnChatInput.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    handleSend('dawn');
                }
            });
        }
    };
    initGeminiChat();
    window.initGeminiChat = initGeminiChat; // Expose for runtime triggering
});
