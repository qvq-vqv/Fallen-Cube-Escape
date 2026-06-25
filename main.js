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
    const prologueFeed = document.getElementById('prologue-feed');
    const prologueReplies = document.getElementById('prologue-replies');
    const landingOverlay = document.getElementById('landing-overlay');
    const landingStartBtn = document.getElementById('landing-start-btn');
    const landingLevelsBtn = document.getElementById('landing-levels-btn');
    const landingArchiveBtn = document.getElementById('landing-archive-btn');
    const landingSettingsBtn = document.getElementById('landing-settings-btn');
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
    const settingsLangBtns = document.querySelectorAll('[data-settings-lang]');
    const settingsPrecisionBtns = document.querySelectorAll('[data-settings-precision]');
    const keybindButtons = document.querySelectorAll('[data-keybind-action]');

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
            { who: 'dawn', text: '那条线是你画的？先说好，我不随便跟陌生信号走。' },
            { who: 'dawn', text: '……但我想回家。所以你最好真的会带路。' }
        ],
        en: [
            { who: 'sys', text: 'LINK SELF-CHECK... failed twice, trying anyway.' },
            { who: 'sys', text: 'Unknown coordinate: CUBE_SURFACE / heartbeat: 1' },
            { who: 'dawn', text: '...Hello? Who is inside my phone?' },
            { who: 'dawn', text: 'I was in bed five seconds ago. The bed is gone. The floor is also suspicious.' },
            { who: 'dawn', text: 'Did you draw that line? Great. I do not follow strange signals for free.' },
            { who: 'dawn', text: '...But I want to go home. So you had better know where you are pointing.' }
        ]
    };

    const prologueReplyText = {
        zh: {
            steady: '行。你先证明你不是会画线的灾难现场。',
            warm: '别用那种表情。好吧，有人看着也比没人强。',
            tease: '试营业？你们外侧的人都这么欠吗。算了，先救我。'
        },
        en: {
            steady: 'Fine. Prove you are not a disaster with a cursor.',
            warm: 'Do not make that face. Fine. Being watched beats being alone.',
            tease: 'Trial run? Are all outside people this annoying? Whatever. Rescue first.'
        }
    };

    function getProloguePrefix(who) {
        if (who === 'sys') return '> ';
        if (who === 'you') return window.currentLang === 'en' ? 'You: ' : '你：';
        return 'Dawn: ';
    }

    function appendPrologueLine(line) {
        if (!prologueFeed) return;
        const row = document.createElement('p');
        row.className = `prologue-line ${line.who}`;
        const prefix = getProloguePrefix(line.who);
        const text = textOf(line.text);
        row.textContent = prefix;
        prologueFeed.appendChild(row);
        prologueFeed.scrollTo?.({ top: prologueFeed.scrollHeight, behavior: 'smooth' });
        let index = 0;
        const timer = window.setInterval(() => {
            index += 1;
            row.textContent = `${prefix}${text.slice(0, index)}`;
            prologueFeed.scrollTo?.({ top: prologueFeed.scrollHeight, behavior: 'smooth' });
            if (index >= text.length) {
                window.clearInterval(timer);
            }
        }, line.who === 'sys' ? 12 : 18);
    }

    function runPrologueSequence() {
        if (!prologueFeed) return;
        prologueFeed.innerHTML = '';
        prologueReplies?.classList.add('is-disabled');
        btnPrologueStart?.classList.add('is-hidden');
        const lines = prologueScripts[window.currentLang === 'en' ? 'en' : 'zh'];
        lines.forEach((line, index) => {
            setTimeout(() => appendPrologueLine(line), 280 + index * 620);
        });
        setTimeout(() => prologueReplies?.classList.remove('is-disabled'), 520 + lines.length * 620);
    }

    function handlePrologueReply(tone) {
        const lang = window.currentLang === 'en' ? 'en' : 'zh';
        appendPrologueLine({ who: 'you', text: window.t?.(`prologue.reply.${tone}`) || tone });
        appendPrologueLine({ who: 'dawn', text: prologueReplyText[lang][tone] || prologueReplyText[lang].steady });
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

    function escapeHtml(value) {
        return String(textOf(value))
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
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
        if (companionBubble) companionBubble.textContent = textOf(scene.bubble) || textOf(scene.lines?.[0]) || window.t?.('comms.live') || '我在。';
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
        if (companionBubble) {
            companionBubble.textContent = textOf(reply.bubble) || textOf(reply.response);
        }
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
        if (companionBubble) companionBubble.textContent = line;
        markUnread('comms');
    }

    window.commsController = {
        syncFromGame(currentGame) {
            const scene = dialogueScript.scenes[commsState.activeSceneId];
            if (!scene || commsState.lastReply) return;
            if (companionStatus) companionStatus.textContent = textOf(scene.status) || window.t?.('comms.signalStable') || '信号稳定';
            if (companionBubble) {
                companionBubble.textContent = storyModule?.getAmbientBubble?.({
                    scene,
                    state: commsState,
                    game: currentGame
                }) || textOf(scene.bubble) || window.t?.('comms.live') || '我在。';
            }
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
            const localIndex = visibleLevels.findIndex(item => item.index === index);
            const t = visibleLevels.length <= 1 ? 0.5 : localIndex / (visibleLevels.length - 1);
            const side = localIndex % 2 === 0 ? 1 : -1;
            const x = 50 + side * (22 + Math.sin(t * Math.PI * 2) * 8);
            const y = 10 + t * 78 + Math.sin(localIndex * 1.35) * 5;
            card.style.setProperty('--star-x', `${Math.max(12, Math.min(88, x)).toFixed(2)}%`);
            card.style.setProperty('--star-y', `${Math.max(10, Math.min(90, y)).toFixed(2)}%`);
            card.classList.toggle('completed', completedLevels.has(index));
            card.classList.toggle('dev-unlocked', settingsState.devMode);
            card.innerHTML = `
                <span class="level-card-title">${escapeHtml(textOf(level.title))}</span>
                <span class="level-card-chapter">${escapeHtml(textOf(level.chapter))}</span>
                <span class="level-card-meta">
                    ${renderLevelMetaIcons(level, index)}
                </span>
                <span class="level-card-concept">${escapeHtml(textOf(level.concept))}</span>
            `;
            card.addEventListener('click', () => {
                selectedLevelIndex = index;
                renderLevelCards();
                renderLevelBrief();
                feel.note(`${textOf(level.title)} 已选中`, 'info');
            });
            levelListEl.appendChild(card);
        });
    }

    function renderLevelBrief() {
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
        gameoverOverlay?.classList.remove('active', 'jump-alert');
        victoryOverlay?.classList.remove('active');
        gameContainer.classList.add('preplay-stage');
        render.setPresentationMode?.('landing');
        audio.setTension('calm');
    }

    function showLevelBook({ openArchive = false } = {}) {
        isGameActive = false;
        landingOverlay?.classList.remove('active');
        setupOverlay.classList.add('active');
        gameContainer.classList.add('preplay-stage');
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
        localStorage.setItem('dawnCubeKeybinds', JSON.stringify(settingsState.keybinds));
        window.dawnCubeSettings = settingsState;
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
    }

    function openSettings() {
        listeningKeybindAction = null;
        settingsOverlay?.classList.add('active');
        settingsOverlay?.setAttribute('aria-hidden', 'false');
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
        const target = document.querySelector(`[data-tool-mode="${action}"]`);
        if (target && !target.disabled) {
            game.setToolMode(action);
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

    function handleGameplayKeybind(event, phase = 'down') {
        if (settingsOverlay?.classList.contains('active')) return false;
        const { keybinds } = settingsState;
        const code = normalizeKeyCode(event);
        if (phase === 'down') {
            if (code === keybinds.route) return applyToolKeybind('route');
            if (code === keybinds.patch) return applyToolKeybind('patch');
            if (code === keybinds.beacon) return applyToolKeybind('beacon');
            if (code === keybinds.break) return applyToolKeybind('break');
            if (code === keybinds.wait) return triggerWaitKeybind();
            if (code === keybinds.twist && !event.repeat && isGameActive) {
                setTwistMode(true);
                return true;
            }
        } else if (code === keybinds.twist && isGameActive) {
            setTwistMode(false);
            return true;
        }
        return false;
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

    async function startSelectedLevel() {
        setupOverlay.classList.remove('active');
        landingOverlay?.classList.remove('active');
        gameoverOverlay.classList.remove('active');
        victoryOverlay.classList.remove('active');
        gameContainer.classList.add('is-entering');
        gameContainer.classList.remove('preplay-stage');
        gameContainer.style.display = 'grid';
        setTerminalTab('comms');
        setPhoneCollapsed(false);
        setTwistMode(false);
        isGameActive = true;

        game.initLevel(selectedLevelIndex);
        game.setRealtimeMode?.(true);
        game.startRealtime?.();
        renderLevelComms(selectedLevelIndex);
        syncArchiveForLevelStart(selectedLevelIndex);
        updateLayerDropdown(game.N);
        initRenderScene();
        await render.flyToGameCamera?.(980);
        gameContainer.classList.remove('is-entering');
        audio.start();
        audio.setTension('calm');
        feel.note(`${textOf(game.currentLevel.title)} · ${textOf(game.currentLevel.chapter)}`, 'info');
        feel.flashScreen('info');
    }

    function resetCurrentLevel() {
        game.initLevel(game.currentLevelIndex);
        game.setRealtimeMode?.(true);
        game.startRealtime?.();
        render.buildCube3D();
        render.spawnEntities3D();
        render.resetCamera?.();
        if (render.plannedLine && render.scene) render.scene.remove(render.plannedLine);
        audio.setTension('calm');
        feel.note('残局已重置', 'warn');
        feel.flashScreen('warn');
    }

    function returnToLevelBook() {
        isGameActive = false;
        gameContainer.style.display = 'grid';
        gameContainer.classList.add('preplay-stage');
        gameoverOverlay.classList.remove('active', 'jump-alert');
        victoryOverlay.classList.remove('active');
        game.stopRealtime?.();
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
    game.initLevel(selectedLevelIndex);
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
            runPrologueSequence();
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
    landingArchiveBtn?.addEventListener('click', () => {
        audio.play('routeTick');
        showLevelBook({ openArchive: true });
    });
    landingSettingsBtn?.addEventListener('click', () => {
        openSettings();
    });

    startBtn.addEventListener('click', startSelectedLevel);
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
            if (settingsOverlay?.classList.contains('active')) {
                closeSettings();
            } else {
                toggleEscConsole();
            }
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
            gameoverOverlay.classList.remove('active', 'jump-alert');
            victoryOverlay.classList.remove('active');
            setupOverlay.classList.add('active');
            landingOverlay?.classList.remove('active');
            gameContainer.style.display = 'grid';
            gameContainer.classList.add('preplay-stage');
            isGameActive = false;
            render.setPresentationMode?.('constellation');
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
});
