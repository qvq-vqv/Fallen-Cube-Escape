/**
 * 黎明魔方关卡书
 * 关卡数据独立于 GameEngine，方便扩展到 100 关并做批量校验。
 */

(function () {
    function getActForLevel(number) {
        if (number <= 12) return 1;
        if (number <= 40) return 2;
        if (number <= 60) return 3;
        if (number <= 80) return 4;
        return 5;
    }

    function inferMechanicTags(level) {
        const tags = new Set(level.mechanicTags || []);
        if (level.rotationEnabled) tags.add('rotation');
        if (level.key) tags.add('key');
        if (level.exit) tags.add('exit');
        if (level.bridges?.length) tags.add('portal');
        if (level.voids?.length) tags.add('void');
        if (level.patchCharges) tags.add('patch');
        if (level.beaconCharges) tags.add('beacon');
        if (level.breakCharges) tags.add('break');
        if (level.ais?.some(ai => ai.type === 'chaser')) tags.add('chaser');
        if (level.ais?.some(ai => ai.type === 'guardian')) tags.add('guardian');
        if (level.guardianAggro === 'guardDoor') tags.add('guard-door');
        if (level.hasKeyStart) tags.add('start-with-key');
        if (level.actFinale) tags.add('act-finale');
        return [...tags];
    }

    function inferDifficulty(level, number) {
        const enemyScore = (level.ais || []).reduce((score, ai) => {
            if (ai.type === 'guardian') return score + 2;
            if (ai.type === 'ambusher') return score + 2;
            return score + 1;
        }, 0);
        const toolScore = (level.bridges?.length || 0) +
            (level.voids?.length ? 1 : 0) +
            (level.patchCharges ? 1 : 0) +
            (level.beaconCharges ? 1 : 0) +
            (level.breakCharges ? 1 : 0);
        const rotationScore = level.rotationEnabled ? 1 : 0;
        return level.difficulty || Math.max(1, Math.min(10, Math.ceil(number / 12) + enemyScore + toolScore + rotationScore - 1));
    }

    function createFingerprint(level) {
        const enemySig = (level.ais || [])
            .map(ai => ai.type)
            .sort()
            .join('+') || 'none';
        const tags = (level.mechanicTags || []).join('+') || 'basic';
        return [
            `N${level.size || 3}`,
            tags,
            enemySig,
            `b${level.bridges?.length || 0}`,
            `v${level.voids?.length || 0}`,
            `p${level.patchCharges || 0}`,
            `q${level.beaconCharges || 0}`,
            `x${level.breakCharges || 0}`,
            `r${level.rotationEnabled ? 1 : 0}`,
            level.guardianAggro || 'none'
        ].join('|');
    }

    function normalizeLevels(levels) {
        return levels.map((level, index) => {
            const number = Number(level.title.match(/L(\d+)/)?.[1] || index + 1);
            const mechanicTags = inferMechanicTags(level);
            const normalized = {
                id: `L${String(number).padStart(2, '0')}`,
                number,
                act: level.act || getActForLevel(number),
                ...level,
                mechanicTags,
                difficulty: inferDifficulty({ ...level, mechanicTags }, number)
            };
            normalized.fingerprint = level.fingerprint || createFingerprint(normalized);
            return normalized;
        });
    }

    function createLevelBook() {
        const at = (face, row, col) => ({ face, row, col });
            return normalizeLevels([
                {
                    title: 'L01 逃生线',
                    chapter: '读图与画路',
                    concept: '你已经持有钥匙。只需要在全局展开图上画到逃生门。',
                    tutorial: {
                        icon: '➜',
                        cue: '拖到门',
                        goal: '从绿色棋子拖到出口。',
                        tip: '画线→执行',
                        visual: 'dragExit'
                    },
                    bestTurns: 1,
                    bestRotations: 0,
                    hasKeyStart: true,
                    player: at(0, 1, 1),
                    key: null,
                    exit: at(0, 2, 1),
                    rotationEnabled: true,
                    validation: { solvable: true, mustDrawRoute: true, mustUseRotation: false, hasThreats: false },
                    ais: []
                },
                {
                    title: 'L02 钥匙在前',
                    chapter: '钥匙与门',
                    concept: '先拿钥匙，再去门。没有敌人，专心读目标顺序。',
                    tutorial: {
                        icon: '◇',
                        cue: '钥匙→出口',
                        goal: '先踩钥匙，再进出口。',
                        tip: '没钥匙，门不开',
                        visual: 'keyDoor'
                    },
                    bestTurns: 2,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: false,
                    validation: { solvable: true, mustCollectKey: true, mustUseRotation: false, hasThreats: false },
                    ais: []
                },
                {
                    title: 'L03 追击者',
                    chapter: '公开威胁',
                    concept: '红色追击者会逼近你。沿安全路线去拿钥匙，别踩进下一步威胁。',
                    tutorial: {
                        icon: '!',
                        cue: '红格会追上',
                        goal: '避开红色预告格。',
                        tip: '先看红，再画线',
                        visual: 'threat'
                    },
                    bestTurns: 4,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 2),
                    exit: at(1, 1, 1),
                    rotationEnabled: false,
                    validation: {
                        solvable: true,
                        mustReadThreat: true,
                        mustUseRotation: false,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [{ type: 'chaser', pos: at(0, 0, 0) }]
                },
                {
                    title: 'L04 夹击拧门',
                    chapter: '旋转目标',
                    concept: '钥匙被断层孤立。旋转整层立方体，将钥匙所在的平台带到你的面前。',
                    tutorial: {
                        icon: '⟳',
                        cue: '旋转孤岛',
                        goal: '通过旋转将钥匙带到可达区域。',
                        tip: '有时候不是你在走，是路在走',
                        visual: 'rotateLayer'
                    },
                    bestTurns: 4,
                    bestRotations: 1,
                    player: at(0, 1, 1),
                    key: at(4, 1, 1),
                    exit: at(1, 1, 1),
                    rotationEnabled: true,
                    voids: [
                        at(4, 0, 1),
                        at(4, 2, 1),
                        at(4, 1, 0),
                        at(4, 1, 2)
                    ],
                    validation: { solvable: true, mustUseRotation: true, rotatesKey: true, hasThreats: true },
                    ais: [
                        { type: 'chaser', pos: at(5, 1, 1) }
                    ]
                },
                {
                    title: 'L05 钥匙也会动',
                    chapter: '旋转目标',
                    concept: '前方面被纵向切断。拧水平中层，让左侧钥匙接回可走路线。',
                    tutorial: {
                        icon: '◇',
                        cue: '转动钥匙',
                        goal: '把钥匙转进路线。',
                        tip: '目标跟着层移动',
                        visual: 'rotateKey'
                    },
                    bestTurns: 5,
                    bestRotations: 1,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: true,
                    voids: [
                        at(4, 0, 1),
                        at(4, 1, 1),
                        at(4, 2, 1),
                        at(4, 2, 0)
                    ],
                    validation: { solvable: true, mustUseRotation: true, rotatesKey: true, hasThreats: true },
                    ais: [
                        { type: 'chaser', pos: at(2, 1, 1) },
                        { type: 'chaser', pos: at(2, 2, 2) }
                    ]
                },
                {
                    title: 'L06 守钥者',
                    chapter: '守路不堵门',
                    concept: '进入钥匙面会引诱守钥者 1 格追来。拿到边缘钥匙后，立刻撤离。',
                    tutorial: {
                        icon: '!',
                        cue: '把它引走',
                        goal: '进钥匙面，引开守钥者。',
                        tip: '守钥者会追你 1 格',
                        visual: 'guardianLure'
                    },
                    bestTurns: 4,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: true,
                    guardianAggro: 'lure',
                    validation: {
                        solvable: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        keyAvoidsCenter: true,
                        noOpeningWait: true,
                        maxKeyPickupAction: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(5, 0, 0) }
                    ]
                },
                {
                    title: 'L07 碎解阻断',
                    chapter: '主动拆路',
                    concept: '守钥者会沿中路压回来。先碎解它的必经格，再取钥匙撤离。',
                    tutorial: {
                        icon: '✕',
                        cue: '拆掉追路',
                        goal: '碎解守钥者会经过的格子。',
                        tip: '拆路，不是拆自己',
                        visual: 'break'
                    },
                    bestTurns: 5,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: false,
                    guardianAggro: 'guardDoor',
                    breakCharges: 1,
                    validation: {
                        solvable: true,
                        breakTool: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        keyAvoidsCenter: true,
                        maxKeyPickupAction: 1,
                        hasThreats: true
                    },
                    ais: [{ type: 'guardian', pos: at(4, 1, 2) }]
                },
                {
                    title: 'L08 取钥即逃',
                    chapter: '撤离压力',
                    concept: '钥匙一到手，守钥者立刻变成 2 格追击。别贪步，拿了就撤。',
                    tutorial: {
                        icon: '2',
                        cue: '拿钥匙后 2 格',
                        goal: '拿钥匙后立刻撤。',
                        tip: '守钥者会走 2 格',
                        visual: 'guardianRage'
                    },
                    bestTurns: 4,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 0, 1),
                    exit: at(1, 1, 1),
                    rotationEnabled: true,
                    guardianAggro: 'afterKey',
                    validation: {
                        solvable: true,
                        guardianOnKey: false,
                        guardianRage: true,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianPostKeyStepBudget: 2,
                        keyAvoidsCenter: true,
                        noOpeningWait: true,
                        maxKeyPickupAction: 1,
                        hasThreats: true
                    },
                    ais: [{ type: 'guardian', pos: at(4, 2, 2) }]
                },
                {
                    title: 'L09 正式开跑',
                    chapter: '第一幕实战',
                    concept: '没有新规则了。看红格、拿钥匙、进门，把前面学的路线判断用起来。',
                    tutorial: {
                        icon: '✓',
                        cue: '真题开始',
                        goal: '拿钥匙，避追击，进门。',
                        tip: '别直冲，先看红格',
                        visual: 'threat'
                    },
                    bestTurns: 4,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: true,
                    validation: {
                        solvable: true,
                        mustReadThreat: true,
                        mustUseRotation: false,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(0, 0, 0) },
                        { type: 'chaser', pos: at(1, 1, 0) }
                    ]
                },
                {
                    title: 'L10 隐藏考：碎解突围',
                    chapter: '隐藏疯狂关',
                    concept: '双追击者夹击，守钥者拿钥匙后守门。碎解一格，把追捕路线切断。',
                    tutorial: {
                        icon: '✕',
                        cue: '疯狂小考',
                        goal: '碎解关键格，别让三方围住你。',
                        tip: '这是隐藏题，别硬冲',
                        visual: 'break'
                    },
                    hiddenUntilActOneClear: true,
                    bestTurns: 6,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: false,
                    guardianAggro: 'guardDoor',
                    breakCharges: 1,
                    validation: {
                        solvable: true,
                        breakTool: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        keyAvoidsCenter: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 1) },
                        { type: 'chaser', pos: at(5, 0, 0) },
                        { type: 'chaser', pos: at(2, 2, 0) },
                        { type: 'chaser', pos: at(3, 2, 2) }
                    ]
                },
                {
                    title: 'L11 守门预演',
                    chapter: '第一幕实战',
                    concept: '这次守钥者不只追人。钥匙到手后，它会朝出口封门，逼你提前规划撤离线。',
                    tutorial: {
                        icon: '▣',
                        cue: '拿钥匙后守门',
                        goal: '拿钥匙前先想好撤离门线。',
                        tip: '它会去堵门',
                        visual: 'guardianLure'
                    },
                    bestTurns: 5,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: true,
                    guardianAggro: 'guardDoor',
                    validation: {
                        solvable: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        keyAvoidsCenter: true,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(0, 2, 2) }
                    ]
                },
                {
                    title: 'L12 出口？',
                    chapter: '第一幕毕业考',
                    concept: '像出口，但太安静了。追击者压近，守钥者挡路，先拧开局面再冲门。',
                    tutorial: {
                        icon: '★',
                        cue: '出口？',
                        goal: '旋转、引诱、取钥、撤离。',
                        tip: '如果这真是出口就好了',
                        visual: 'guardianSplit'
                    },
                    bestTurns: 5,
                    bestRotations: 1,
                    player: at(0, 1, 1),
                    key: at(4, 0, 1),
                    exit: at(1, 1, 1),
                    rotationEnabled: true,
                    guardianAggro: 'lure',
                    actFinale: true,
                    validation: {
                        solvable: true,
                        mustUseRotation: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        keyAvoidsCenter: true,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 1) },
                        { type: 'chaser', pos: at(1, 1, 0) }
                    ]
                },
                {
                    title: 'L13 孤岛补片',
                    chapter: '第二幕 · 外壳',
                    concept: '更大的 4x4 外壳打开。钥匙被断层完全包围，你必须使用补片搭桥才能进入孤岛。',
                    tutorial: {
                        icon: '4',
                        cue: '孤岛与补片',
                        goal: '用补片跨越缺口，拿取钥匙。',
                        tip: '补片踩过后会碎',
                        visual: 'patch'
                    },
                    size: 4,
                    bestTurns: 6,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 2, 2),
                    exit: at(1, 2, 2),
                    rotationEnabled: true,
                    patchCharges: 2,
                    voids: [
                        at(4, 1, 2),
                        at(4, 3, 2),
                        at(4, 2, 1),
                        at(4, 2, 3)
                    ],
                    validation: {
                        solvable: true,
                        patchTool: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L14 宽场夹击',
                    chapter: '第二幕 · 宽场',
                    concept: '四阶给了更多空间，也给了追击者更多包抄角度。别复读三阶走法，要利用宽场换线。',
                    tutorial: {
                        icon: '!',
                        cue: '宽场换线',
                        goal: '利用 4x4 的空间避开双追击。',
                        tip: '空间变大，追击也变宽',
                        visual: 'rotateThreat'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: true,
                    player: at(0, 1, 1),
                    key: at(4, 1, 2),
                    exit: at(1, 2, 2),
                    validation: {
                        solvable: true,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(3, 0, 0) }
                    ]
                },
                {
                    title: 'L15 宽场遛锁',
                    chapter: '第二幕 · 宽场',
                    concept: '守钥者进入四阶后不该只是站岗。更大的空间意味着你可以遛它，也意味着追击者有时间包过来。',
                    tutorial: {
                        icon: '!',
                        cue: '大空间遛锁',
                        goal: '利用 4x4 空间调动守钥者，再拿钥匙撤离。',
                        tip: '能绕，不代表能拖',
                        visual: 'guardianLure'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: true,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 2, 2),
                    guardianAggro: 'lure',
                    validation: {
                        solvable: true,
                        mustUseRotation: false,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L16 偷门不遛锁',
                    chapter: '第二幕工具',
                    concept: '传送门第一次登场就要有用：不用先把守钥者遛开，直接借门端切进钥匙线。',
                    tutorial: {
                        icon: '◉',
                        cue: '穿门偷钥',
                        goal: '借传送门绕过守钥者的正面压力。',
                        tip: '不用先遛，也别久留',
                        visual: 'bridgeThreat'
                    },
                    size: 4,
                    bestTurns: 3,
                    bestRotations: 0,
                    rotationEnabled: true,
                    player: at(0, 0, 3),
                    key: at(4, 1, 0),
                    exit: at(4, 0, 3),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        minBridgeTurnGain: 1,
                        hasThreats: true
                    },
                    guardianAggro: 'lure',
                    ais: [
                        { type: 'guardian', pos: at(4, 0, 1) }
                    ]
                },
                {
                    title: 'L17 门边追击',
                    chapter: '第二幕组合',
                    concept: '传送门不是免费捷径。你会缩短路，但追击压力也会逼你更早做决定。',
                    tutorial: {
                        icon: '◉',
                        cue: '门边有追击',
                        goal: '判断何时穿门，别在门端附近被追上。',
                        tip: '传送门两端都公开',
                        visual: 'bridgeThreat'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: true,
                    player: at(0, 0, 3),
                    key: at(4, 1, 0),
                    exit: at(4, 0, 3),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) }
                    ],
                validation: {
                    solvable: true,
                    bridgeTool: true,
                    minBridgeTurnGain: 1,
                    hasThreats: true
                },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L18 传送门小考',
                    chapter: '第二幕小考',
                    concept: '双追击压缩了绕路空间。传送门不是装饰，它就是当前最快、最稳的逃生线。',
                    tutorial: {
                        icon: '◉',
                        cue: '穿门抢拍',
                        goal: '别绕远路，借传送门切进钥匙线。',
                        tip: '绕路会丢拍',
                        visual: 'bridgeThreat'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: true,
                    player: at(0, 0, 3),
                    key: at(4, 1, 0),
                    exit: at(4, 0, 3),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        minBridgeTurnGain: 1,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) }
                    ]
                },
                {
                    title: 'L19 少了一格',
                    chapter: '第二幕 · 断面',
                    concept: '黑色缺口不是装饰，它就是没地了。绕开缺口拿钥匙，别把追击者也绕丢了。',
                    tutorial: {
                        icon: '裂',
                        cue: '缺口不能走',
                        goal: '绕开黑色缺口，拿钥匙进门。',
                        tip: '黑洞洞的格子不能走',
                        visual: 'void'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: true,
                    player: at(4, 0, 0),
                    key: at(4, 1, 2),
                    exit: at(4, 2, 3),
                    voids: [
                        at(4, 0, 1)
                    ],
                    validation: {
                        solvable: true,
                        voidTool: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(3, 0, 3) }
                    ]
                },
                {
                    title: 'L20 裂面旋转',
                    chapter: '第二幕 · 断面',
                    concept: '缺口属于魔方结构。旋转层时，洞也会跟着移动，既能为你铺路，也能阻挡追击。',
                    tutorial: {
                        icon: '⟳',
                        cue: '转动缺口',
                        goal: '旋转包含缺口的层，挡住追击者并连通路线。',
                        tip: '洞会跟着层移动',
                        visual: 'voidRotate'
                    },
                    size: 4,
                    bestTurns: 6,
                    bestRotations: 2,
                    rotationEnabled: true,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(4, 3, 3),
                    voids: [
                        at(4, 0, 1),
                        at(4, 1, 1),
                        at(0, 3, 1),
                        at(0, 2, 1)
                    ],
                    validation: {
                        solvable: true,
                        voidTool: true,
                        mustUseRotation: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) }
                    ]
                },
                {
                    title: 'L21 临时补片',
                    chapter: '第二幕工具',
                    concept: '补片只能让 E-7 走一次。她踩过去后补片碎掉，追捕者不能跟着踩同一块。',
                    tutorial: {
                        icon: '+',
                        cue: '补一次洞',
                        goal: '先点补片，再点缺口，踩过去拿钥匙。',
                        tip: '补片不能停，只能过',
                        visual: 'patch'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: true,
                    patchCharges: 1,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(4, 3, 3),
                    voids: [
                        at(4, 0, 1),
                        at(1, 0, 1),
                        at(0, 0, 1),
                        at(3, 0, 1),
                        at(2, 0, 1),
                        at(4, 2, 0),
                        at(0, 3, 0),
                        at(4, 1, 0),
                        at(2, 0, 3)
                    ],
                    validation: {
                        solvable: true,
                        patchTool: true,
                        minPatchTurnGain: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(2, 3, 3) }
                    ]
                },
                {
                    title: 'L22 断角与守卫',
                    chapter: '第二幕组合',
                    concept: '断掉的角会限制路线，也会限制守卫。利用缺口制造窄门，再取钥匙。',
                    tutorial: {
                        icon: '角',
                        cue: '缺口遛锁',
                        goal: '利用缺口绕开守卫，拿钥匙撤离。',
                        tip: '缺口也能挡敌人',
                        visual: 'voidGuardian'
                    },
                    size: 4,
                    bestTurns: 6,
                    bestRotations: 1,
                    rotationEnabled: true,
                    guardianAggro: 'lure',
                    player: at(4, 1, 0),
                    key: at(4, 1, 3),
                    exit: at(1, 2, 2),
                    voids: [
                        at(4, 0, 1),
                        at(4, 2, 1),
                        at(0, 3, 0),
                        at(2, 0, 3)
                    ],
                    validation: {
                        solvable: true,
                        voidTool: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 0, 2) },
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) }
                    ]
                },
                {
                    title: 'L23 诱饵信标',
                    chapter: '第二幕工具',
                    concept: '诱饵可以放在任意合法空地。它会把敌人的下一次目标拽走，但不能替你走路。',
                    tutorial: {
                        icon: '诱',
                        cue: '骗走一个',
                        goal: '放诱饵调走守钥者，再冲钥匙线。',
                        tip: '诱饵只能用一次',
                        visual: 'beacon'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: false,
                    beaconCharges: 1,
                    beaconDuration: 1,
                    guardianAggro: 'lure',
                    player: at(4, 1, 0),
                    key: at(4, 1, 3),
                    exit: at(4, 2, 3),
                    voids: [
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2)
                    ],
                    validation: {
                        solvable: true,
                        beaconTool: true,
                        minBeaconTurnGain: 1,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L24 破面小考',
                    chapter: '第二幕小考',
                    concept: '缺口、补片、诱饵同时出现。别急着全用，先判断哪一个是真正救命的。',
                    tutorial: {
                        icon: '考',
                        cue: '破面残局',
                        goal: '用补片断追击，用诱饵调开守钥者。',
                        tip: '强工具也要用准',
                        visual: 'voidExam'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: false,
                    patchCharges: 1,
                    beaconCharges: 1,
                    beaconDuration: 1,
                    guardianAggro: 'lure',
                    player: at(4, 0, 0),
                    key: at(4, 1, 3),
                    exit: at(1, 2, 2),
                    voids: [
                        at(4, 0, 1),
                        at(4, 2, 1),
                        at(0, 3, 1)
                    ],
                    validation: {
                        solvable: true,
                        voidTool: true,
                        comboPractice: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L25 双门择路',
                    chapter: '第二幕组合',
                    concept: '传送门不止一对。别看到门就钻，先判断哪一对能把钥匙线和门线接成同一拍。',
                    tutorial: {
                        icon: '◉',
                        cue: '两对门',
                        goal: '选择正确传送门端，抢在双追击合围前撤离。',
                        tip: '门多了，错门也会快',
                        visual: 'bridgeChoice'
                    },
                    size: 4,
                    bestTurns: 3,
                    bestRotations: 0,
                    rotationEnabled: true,
                    mechanicTags: ['portal-choice'],
                    player: at(0, 0, 3),
                    key: at(4, 1, 1),
                    exit: at(4, 0, 3),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) },
                        { a: at(2, 3, 3), b: at(4, 1, 0) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        minBridgeTurnGain: 1,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) }
                    ]
                },
                {
                    title: 'L26 碎桥断尾',
                    chapter: '第二幕组合',
                    concept: '补片不是铺路砖，是断尾刀。E-7 过洞后补片碎掉，追击者会被留在另一边。',
                    tutorial: {
                        icon: '+',
                        cue: '过洞断追',
                        goal: '用一次性补片穿过缺口，让追击者绕远。',
                        tip: '补片碎了反而是好事',
                        visual: 'patchChase'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: true,
                    mechanicTags: ['patch-tailcut'],
                    patchCharges: 1,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(4, 3, 3),
                    voids: [
                        at(4, 0, 1),
                        at(4, 1, 1),
                        at(4, 2, 1),
                        at(1, 0, 1),
                        at(0, 0, 1),
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2)
                    ],
                    validation: {
                        solvable: true,
                        patchTool: true,
                        minPatchTurnGain: 1,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(2, 3, 3) }
                    ]
                },
                {
                    title: 'L27 诱饵换岗',
                    chapter: '第二幕组合',
                    concept: '诱饵的价值不是暂停敌人，而是让守钥者离开关键线一拍。骗错对象就等于白送。',
                    tutorial: {
                        icon: '诱',
                        cue: '骗开守钥者',
                        goal: '用诱饵调走守钥者，抢钥匙后立刻撤。',
                        tip: '诱饵只买一拍',
                        visual: 'beaconGuardian'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: false,
                    mechanicTags: ['beacon-guardian'],
                    beaconCharges: 1,
                    beaconDuration: 2,
                    guardianAggro: 'lure',
                    player: at(4, 1, 0),
                    key: at(4, 1, 3),
                    exit: at(4, 2, 3),
                    voids: [
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2)
                    ],
                    validation: {
                        solvable: true,
                        beaconTool: true,
                        minBeaconTurnGain: 1,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L28 破面传送',
                    chapter: '第二幕组合',
                    concept: '缺口会切断普通路线，传送门负责补上节奏。绕路能走，但追击者不会等你参观破洞。',
                    tutorial: {
                        icon: '裂',
                        cue: '缺口 + 门',
                        goal: '借传送门跨过破面造成的长绕路。',
                        tip: '破洞逼你看门端',
                        visual: 'voidPortal'
                    },
                    size: 4,
                    bestTurns: 3,
                    bestRotations: 0,
                    rotationEnabled: false,
                    mechanicTags: ['void-portal'],
                    player: at(4, 0, 0),
                    key: at(4, 2, 0),
                    exit: at(4, 3, 3),
                    bridges: [
                        { a: at(4, 0, 0), b: at(4, 2, 0) }
                    ],
                    voids: [
                        at(4, 0, 1),
                        at(4, 1, 0),
                        at(4, 1, 1),
                        at(4, 2, 1)
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        minBridgeTurnGain: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 2) },
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L29 补片换门',
                    chapter: '第二幕组合',
                    concept: '守钥者压着钥匙线，缺口压着撤离线。补片要用在撤离，不是看见第一个洞就手痒。',
                    tutorial: {
                        icon: '+',
                        cue: '补撤离线',
                        goal: '引开守钥者后，把补片留给门前缺口。',
                        tip: '补早了会亏',
                        visual: 'patchGuardian'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: false,
                    mechanicTags: ['patch-exit'],
                    patchCharges: 1,
                    guardianAggro: 'lure',
                    player: at(4, 1, 0),
                    key: at(4, 1, 3),
                    exit: at(4, 3, 3),
                    voids: [
                        at(4, 2, 3),
                        at(4, 0, 1),
                        at(0, 3, 1),
                        at(3, 1, 0),
                        at(3, 2, 0),
                        at(3, 3, 0)
                    ],
                    validation: {
                        solvable: true,
                        patchTool: true,
                        minPatchTurnGain: 1,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(5, 3, 3) }
                    ]
                },
                {
                    title: 'L30 双追穿门',
                    chapter: '第二幕小考',
                    concept: '两个追击者压缩普通路线。传送门能省路，但门端也会成为红色压力的交汇点。',
                    tutorial: {
                        icon: '考',
                        cue: '双追穿门',
                        goal: '借门抢钥匙，但别落在门端威胁里。',
                        tip: '门端不是安全屋',
                        visual: 'portalPincer'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: true,
                    mechanicTags: ['portal-pincer'],
                    player: at(0, 0, 3),
                    key: at(4, 1, 0),
                    exit: at(4, 0, 3),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        minBridgeTurnGain: 1,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) },
                        { type: 'chaser', pos: at(3, 0, 0) }
                    ]
                },
                {
                    title: 'L31 多维解法',
                    chapter: '第二幕组合',
                    concept: '缺口、补片、诱饵与传送门同时出现。判断哪个工具用来拿钥匙，哪个用来逃生。',
                    tutorial: {
                        icon: '考',
                        cue: '工具组合',
                        goal: '组合使用所有道具，突破防线。',
                        tip: '不要用错工具对象',
                        visual: 'comboExam'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: false,
                    mechanicTags: ['combo-advanced'],
                    patchCharges: 1,
                    beaconCharges: 1,
                    beaconDuration: 2,
                    guardianAggro: 'lure',
                    player: at(4, 1, 0),
                    key: at(4, 0, 3),
                    exit: at(1, 2, 2),
                    bridges: [
                        { a: at(4, 3, 3), b: at(1, 2, 2) }
                    ],
                    voids: [
                        at(4, 1, 1),
                        at(4, 0, 2),
                        at(4, 2, 2),
                        at(1, 0, 0),
                        at(1, 1, 0),
                        at(1, 2, 0),
                        at(1, 3, 0),
                        at(3, 3, 3),
                        at(5, 0, 3)
                    ],
                    validation: {
                        solvable: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 2) }
                    ]
                },
                {
                    title: 'L32 信标穿门',
                    chapter: '第二幕组合',
                    concept: '诱饵不是万能钥匙。它把追击者拉偏一拍，你再用传送门把这一拍变成距离。',
                    tutorial: {
                        icon: '诱',
                        cue: '骗开门端',
                        goal: '先放诱饵改写追击目标，再穿门撤离。',
                        tip: '骗一拍，穿一拍',
                        visual: 'beaconPortal'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: false,
                    mechanicTags: ['beacon-portal'],
                    beaconCharges: 1,
                    beaconDuration: 2,
                    player: at(0, 0, 3),
                    key: at(4, 2, 0),
                    exit: at(4, 0, 0),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        beaconTool: true,
                        minBridgeTurnGain: 1,
                        minBeaconTurnGain: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(4, 0, 1) },
                        { type: 'chaser', pos: at(4, 1, 1) }
                    ]
                },
                {
                    title: 'L33 补片穿门',
                    chapter: '第二幕组合',
                    concept: '补片解决脚下的断面，传送门解决远处的距离。两个工具各做一件事，别互相替代。',
                    tutorial: {
                        icon: '+',
                        cue: '补洞再穿门',
                        goal: '用补片接上钥匙线，再借传送门撤离。',
                        tip: '一块补片，一次机会',
                        visual: 'patchPortal'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: false,
                    mechanicTags: ['patch-portal'],
                    patchCharges: 1,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(1, 2, 2),
                    bridges: [
                        { a: at(4, 0, 3), b: at(1, 2, 2) }
                    ],
                    voids: [
                        at(4, 0, 1),
                        at(4, 1, 1),
                        at(0, 0, 1),
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2)
                    ],
                    validation: {
                        solvable: true,
                        patchTool: true,
                        bridgeTool: true,
                        minPatchTurnGain: 1,
                        minBridgeTurnGain: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L34 错门陷阱',
                    chapter: '第二幕组合',
                    concept: '最快的门不一定是安全的门。门端旁边有追击压力时，选择顺序比选择门更重要。',
                    tutorial: {
                        icon: '◉',
                        cue: '先后顺序',
                        goal: '避开危险门端，走能连到出口的那条。',
                        tip: '错门也很快',
                        visual: 'portalTrap'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 1,
                    rotationEnabled: true,
                    mechanicTags: ['portal-trap'],
                    player: at(0, 3, 3),
                    key: at(4, 1, 0),
                    exit: at(1, 2, 2),
                    bridges: [
                        { a: at(0, 3, 3), b: at(4, 2, 0) },
                        { a: at(4, 1, 3), b: at(1, 2, 1) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        minBridgeTurnGain: 2,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) },
                        { type: 'chaser', pos: at(3, 0, 0) }
                    ]
                },
                {
                    title: 'L35 绝境防线',
                    chapter: '第二幕组合',
                    concept: '守钥者拿钥匙后会去堵门，缺面又限制绕路。你必须在多名追击者的夹击下，利用所有环境完成撤离。',
                    tutorial: {
                        icon: '★',
                        cue: '绝境撤离',
                        goal: '在守卫封门前撤离，避开层层缺口与追捕。',
                        tip: '门线会被抢',
                        visual: 'voidGate'
                    },
                    size: 4,
                    bestTurns: 7,
                    bestRotations: 2,
                    rotationEnabled: true,
                    mechanicTags: ['void-guard-door', 'act-two-finale'],
                    beaconCharges: 1,
                    beaconDuration: 2,
                    guardianAggro: 'guardDoor',
                    player: at(4, 1, 0),
                    key: at(4, 1, 3),
                    exit: at(4, 3, 3),
                    bridges: [],
                    voids: [
                        at(4, 2, 1),
                        at(4, 2, 2),
                        at(4, 3, 2),
                        at(0, 3, 1),
                        at(1, 2, 2)
                    ],
                    validation: {
                        solvable: true,
                        voidTool: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 2) },
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) },
                        { type: 'chaser', pos: at(2, 0, 0) }
                    ]
                },
                {
                    title: 'L36 诱饵断尾',
                    chapter: '第二幕组合',
                    concept: '诱饵不能让所有敌人失明。它只拽走最关键的一只，剩下的压力仍然要靠路线处理。',
                    tutorial: {
                        icon: '诱',
                        cue: '骗一只',
                        goal: '用诱饵改写一只追击者的路线，再从另一侧撤。',
                        tip: '别指望一骗三',
                        visual: 'beaconPincer'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    rotationEnabled: true,
                    mechanicTags: ['beacon-pincer'],
                    beaconCharges: 1,
                    beaconDuration: 2,
                    player: at(4, 0, 0),
                    key: at(4, 1, 2),
                    exit: at(4, 3, 3),
                    validation: {
                        solvable: true,
                        beaconTool: true,
                        minBeaconTurnGain: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(3, 0, 0) }
                    ]
                },
                {
                    title: 'L37 补片救场',
                    chapter: '第二幕小考',
                    concept: '这关不是“看到洞就补”。你只有一块补片，要决定它是用来抢钥匙，还是用来救撤离。',
                    tutorial: {
                        icon: '考',
                        cue: '一块补片',
                        goal: '判断唯一补片应该补哪一个缺口。',
                        tip: '补错还能悔棋',
                        visual: 'patchExam'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: true,
                    mechanicTags: ['patch-choice'],
                    patchCharges: 1,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(4, 3, 3),
                    voids: [
                        at(4, 0, 1),
                        at(4, 1, 1),
                        at(4, 2, 1),
                        at(1, 0, 1),
                        at(0, 0, 1),
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2)
                    ],
                    validation: {
                        solvable: true,
                        patchTool: true,
                        minPatchTurnGain: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(2, 3, 3) }
                    ]
                },
                {
                    title: 'L38 门后钓锁',
                    chapter: '第二幕组合',
                    concept: '传送门可以绕过守钥者，也可能把你送进它下一步能封住的门线。先钓开，再穿。',
                    tutorial: {
                        icon: '◉',
                        cue: '钓开再穿',
                        goal: '调动守钥者后，用传送门切进撤离线。',
                        tip: '别把自己送门口',
                        visual: 'portalGuardian'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: true,
                    mechanicTags: ['portal-guardian'],
                    guardianAggro: 'guardDoor',
                    player: at(0, 0, 3),
                    key: at(4, 2, 0),
                    exit: at(4, 0, 0),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        guardianOnKey: false,
                        guardianLure: true,
                        guardianPreKeyStepBudget: 1,
                        guardianRage: true,
                        guardianPostKeyStepBudget: 2,
                        minBridgeTurnGain: 2,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'guardian', pos: at(4, 1, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) }
                    ]
                },
                {
                    title: 'L39 诱饵夹击考',
                    chapter: '第二幕小考',
                    concept: '诱饵只能骗走一条压力线。它救不了所有路线，所以剩下的追击还要靠你自己画。',
                    tutorial: {
                        icon: '考',
                        cue: '诱饵小考',
                        goal: '用诱饵拉偏关键追击者，再从另一侧撤离。',
                        tip: '骗一只，跑全局',
                        visual: 'beaconExam'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 0,
                    rotationEnabled: true,
                    mechanicTags: ['beacon-exam'],
                    beaconCharges: 1,
                    beaconDuration: 2,
                    player: at(4, 0, 0),
                    key: at(4, 1, 2),
                    exit: at(4, 3, 3),
                    voids: [
                        at(4, 0, 1),
                        at(4, 2, 2),
                        at(0, 3, 1)
                    ],
                    validation: {
                        solvable: true,
                        beaconTool: true,
                        minBeaconTurnGain: 1,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(4, 3, 0) },
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(3, 0, 0) },
                        { type: 'chaser', pos: at(2, 3, 3) }
                    ]
                },
                {
                    title: 'L40 第二层出口？',
                    chapter: '第二幕毕业考',
                    concept: '第二层外壳给足空间，也给足敌人。传送门是唯一能把钥匙线和出口线接住的捷径，但门端也有追击压力。',
                    tutorial: {
                        icon: '★',
                        cue: '第二幕终局',
                        goal: '在破面、传送和多敌压力下带 E-7 离开第二层。',
                        tip: '看门端，也看红格',
                        visual: 'actTwoFinale'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 1,
                    rotationEnabled: true,
                    mechanicTags: ['act-two-finale', 'portal-finale'],
                    actFinale: true,
                    player: at(0, 0, 3),
                    key: at(4, 1, 0),
                    exit: at(4, 0, 3),
                    bridges: [
                        { a: at(0, 0, 3), b: at(4, 3, 0) }
                    ],
                    validation: {
                        solvable: true,
                        bridgeTool: true,
                        minBridgeTurnGain: 1,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(5, 0, 3) },
                        { type: 'chaser', pos: at(1, 3, 3) },
                        { type: 'chaser', pos: at(3, 0, 0) }
                    ]
                }
            ]);
    }

    window.createLevelBook = createLevelBook;
})();
