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

    function textOf(field) {
        if (field && typeof field === 'object') {
            return field.zh || field.en || '';
        }
        return field || '';
    }

    const tutorialStepsConfig = {
        L01: [
            {
                type: 'look',
                text: {
                    zh: '……别急着救我。先看清楚，这地方会骗人。',
                    en: '...Do not rush to save me. Look first. This place lies.'
                },
                threshold: 3.0,
                focusCell: { face: 1, row: 1, col: 1 },
                focus: { x: 50, y: 46 },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '那扇亮门看起来像出口。拜托，它最好真的是。',
                    en: 'That glowing door looks like an exit. Please let it actually be one.'
                },
                focusCell: { face: 0, row: 2, col: 1 },
                focus: { x: 52, y: 42 },
                tone: 'steady'
            },
            {
                type: 'zoom',
                text: {
                    zh: '滚动鼠标滚轮（或触控板双指捏合），可以放大或缩小视图。试试看。',
                    en: 'Scroll the mouse wheel or pinch to zoom in/out. Try it.'
                },
                threshold: 0.8,
                focusCell: { face: 1, row: 1, col: 1 },
                focus: { x: 50, y: 46 },
                tone: 'steady'
            },
            {
                type: 'move',
                text: {
                    zh: '前面亮了。行吧，我赌你一次。',
                    en: 'The tile lit up. Fine. I will trust you once.'
                },
                targetCell: { face: 1, row: 0, col: 1 },
                focusCell: { face: 1, row: 0, col: 1 },
                focus: { x: 50, y: 43 },
                tone: 'steady'
            }
        ],
        L02: [
            {
                type: 'dialog',
                text: {
                    zh: '前面悬浮着一把发光的……钥匙？还有一扇看起来像安全出口的门。虽然很荒谬，但看来我得先去把那玩意儿捞到手。这难道是什么密室逃脱的测试吗？',
                    en: 'There\'s a glowing... key floating ahead? And a door that looks like an emergency exit. Absurd, but I guess I have to grab that thing first. Is this some kind of escape room test?'
                },
                openComms: true,
                focusCell: { face: 4, row: 1, col: 0 },
                focus: { x: 48, y: 42 },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '等等，你发现了吗？我头顶上好像亮起了一个情绪状态指示灯（Trust）……对，它在实时监控我的服从度。',
                    en: 'Wait, did you notice? Some emotional indicator (Trust) lit up above my head... Yeah, it\'s monitoring my obedience in real-time.'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '我要是心情太差、或者极其讨厌你，我就可能会拒绝执行你的指令，甚至在格子上随机乱走！',
                    en: 'If my mood goes to trash or I absolutely detest you, I might refuse to follow your directions or even wander around randomly!'
                },
                tone: 'steady'
            },
            {
                type: 'esc',
                text: {
                    zh: '按下 ESC 键（或者点击左上角的 ☰ 按钮）打开面板，看看我的当前信任值是多少。',
                    en: 'Press the ESC key (or click the top-left ☰ button) to open the console and check my current trust value.'
                },
                tone: 'steady'
            },
            {
                type: 'closeEsc',
                text: {
                    zh: '看，我的信任值目前是 80（已在面板中闪烁高亮）。千方百计地哄好我，别让它掉光。现在关闭面板开始行动吧！',
                    en: 'Look, my trust value is currently at 80 (pulsing in the panel). Keep me happy, don\'t let it drain. Now close the panel and action!'
                },
                tone: 'steady'
            }
        ],
        L03: [
            {
                type: 'dialog',
                text: {
                    zh: '红色那个在看我。好消息：我讨厌被看。',
                    en: 'The red one is watching me. Great news: I hate being watched.'
                },
                focusCell: { face: 0, row: 0, col: 1 },
                focus: { x: 52, y: 40 },
                warning: true,
                tone: 'panic'
            },
            {
                type: 'dialog',
                text: {
                    zh: '红光就是坏消息。这个世界至少在恶意上很诚实。',
                    en: 'Red light means bad news. At least this world is honest about danger.'
                },
                tone: 'panic'
            },
            {
                type: 'move',
                text: {
                    zh: '我不想和它贴脸。亮哪儿我走哪儿。',
                    en: 'I do not want a close-up with it. Light the way.'
                },
                targetCell: { face: 0, row: 1, col: 0 },
                tone: 'steady'
            }
        ],
        L04: [
            {
                type: 'dialog',
                text: {
                    zh: '卧槽！！！——刚才整层地面是不是突然转过去了？！',
                    en: 'What the hell!!! Did the entire floor just rotate?!'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '我差点直接大头朝下栽下去！你……你居然能直接转动这个空间？！',
                    en: 'I almost fell off head-first! You... you can actually rotate this space?!'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '不过钥匙在对面，路被断开悬空了。快，用折叠面板把这层拧过去！',
                    en: 'But the key is opposite, and the path is broken. Quick, open the panel and twist the layer!'
                },
                openTools: true,
                tone: 'steady'
            },
            {
                type: 'twist',
                text: {
                    zh: '试试把最顶部（我站的这层）水平向右拧90度，把路直接拼通！',
                    en: 'Try horizontally rotating the very top layer (where I am standing) to the right by 90 degrees to align the path!'
                },
                axis: 'Y',
                layer: 0,
                direction: 'CW',
                focusCell: { face: 4, row: 1, col: 1 },
                focus: { x: 50, y: 40 },
                tone: 'steady'
            }
        ],
        L05: [
            {
                type: 'dialog',
                text: {
                    zh: '等等，你转动那一层的时候，那把钥匙也跟着转走了？！',
                    en: 'Wait, when you rotated that layer, the key rotated with it too?!'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '原来物体是跟着地板一起转的。你能旋转一下中间那一层，把对面的路接上吗？',
                    en: 'So items ride with the floor. Can you rotate the middle layer to connect the path?'
                },
                openTools: true,
                tone: 'steady'
            },
            {
                type: 'twist',
                text: {
                    zh: '试试逆时针拧动中间层（Y1）来把路对齐！',
                    en: 'Try counter-clockwise rotating the middle layer (Y1) to align the path!'
                },
                axis: 'Y',
                layer: 1,
                direction: 'CCW',
                focusCell: { face: 4, row: 1, col: 0 },
                focus: { x: 48, y: 42 },
                tone: 'steady'
            }
        ],
        L06: [
            {
                type: 'dialog',
                text: {
                    zh: '那个黄色的铁壳怪是什么？它一直绕着钥匙打转……它看起来像是这把钥匙的‘贴身保安’。',
                    en: 'What is that yellow iron monster? It keeps circling the key... Looks like a personal bodyguard.'
                },
                focusCell: { face: 4, row: 1, col: 2 },
                focus: { x: 52, y: 40 },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '它发现我了！只要踩进同一面它就会追我一步。我去当诱饵，你负责让我别白死！',
                    en: 'It spotted me! It chases me by 1 tile if I enter its face. I\'ll be the bait, don\'t let me die!'
                },
                tone: 'panic'
            },
            {
                type: 'move',
                text: {
                    zh: '往左下角移一步，把黄色守卫引开！',
                    en: 'Step to the bottom-left to lure the yellow keeper away!'
                },
                targetCell: { face: 4, row: 2, col: 1 },
                tone: 'steady'
            }
        ],
        L07: [
            {
                type: 'dialog',
                text: {
                    zh: '那黄色的大家伙堵在那里守门。我们可没法强攻过去。',
                    en: 'That yellow giant is guarding the gate. We cannot headbutt our way through.'
                },
                focusCell: { face: 4, row: 1, col: 2 },
                focus: { x: 50, y: 40 },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '但我终端的控制面板上亮起了一个叫『碎解』的东西。只要把它的必经之路砸成虚空，它就被困住了！',
                    en: 'But a tool called "Break" just lit up on my terminal. Smash its path into a void to trap it!'
                },
                tone: 'steady'
            },
            {
                type: 'tool',
                tool: 'break',
                targetCell: { face: 4, row: 0, col: 2 },
                text: {
                    zh: '打开工具箱，把大家伙上方的这一格拆掉！',
                    en: 'Open the toolbox and shatter the cell directly above him!'
                },
                openTools: true,
                tone: 'steady'
            },
            {
                type: 'tool',
                tool: 'break',
                targetCell: { face: 4, row: 2, col: 2 },
                text: {
                    zh: '干得漂亮！再把大家伙下方这一格也敲碎，彻底困住他！',
                    en: 'Nice! Now shatter the cell directly below him to trap him completely!'
                },
                openTools: true,
                tone: 'steady'
            },
            {
                type: 'move',
                targetCell: { face: 4, row: 1, col: 1 },
                text: {
                    zh: '他现在沦为单格孤岛守卫了。绕后走，拿上钥匙！',
                    en: 'He is now trapped on a single island cell. Loop around and grab the key!'
                },
                tone: 'steady'
            }
        ],
        L08: [
            {
                type: 'dialog',
                text: {
                    zh: '黄色保安今天气色不太对。总之先拿到钥匙再说。',
                    en: 'The yellow keeper looks angry today. Regardless, let\'s grab the key first.'
                },
                tone: 'worry'
            },
            {
                type: 'move',
                targetCell: { face: 4, row: 0, col: 1 },
                text: {
                    zh: '踩上钥匙格，拿取钥匙！',
                    en: 'Step on the key tile to collect it!'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '它……它刚才是不是尖叫了一声？我拿到钥匙之后，它进入狂暴状态，移动速度变成 2 格了！快跑！',
                    en: 'Did... did it just scream? Once I got the key, it enraged and its speed doubled to 2 tiles! Run!'
                },
                tone: 'panic'
            }
        ],
        L09: [
            {
                type: 'dialog',
                text: {
                    zh: '好吧，看来‘新手训练’结束了。前面有红光怪，还有那个黄色保安，路也被切断了。',
                    en: 'Okay, tutorial phase ends here. Red chasers, yellow keeper, and path cut.'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '这大概是第一阶段的综合实战。加油，别在最关键的时候把我送掉！',
                    en: 'This is the stage final test. Guide me well, don\'t get me killed!'
                },
                tone: 'steady'
            }
        ],
        L10: [
            {
                type: 'dialog',
                text: {
                    zh: '两只红色追击者把我夹在中间，而且黄色守卫一开始就往门口靠？',
                    en: 'Two red chasers are pinching me, and the yellow guard moves to block the exit?'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '我们只有一次碎解地板的机会。你必须要找个最致命的关隘把它砸断，不然死定了！',
                    en: 'We have only one break charge. Find the most critical path and break it, or we\'re dead!'
                },
                tone: 'steady'
            }
        ],
        L11: [
            {
                type: 'dialog',
                text: {
                    zh: '那黄色怪物居然守在门上！它是怎么做到这么有灵性的？',
                    en: 'That yellow keeper is actually guarding the door! How is it so intelligent?'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '这地表能转，能不能想办法在它彻底把门口堵死之前，把它拧到别的面去？',
                    en: 'The floor is rotatable. Can we twist it to another face before it chokes the exit?'
                },
                tone: 'steady'
            }
        ],
        L12: [
            {
                type: 'dialog',
                text: {
                    zh: '终于……门开了！我们要离开这一层了。',
                    en: 'Finally... the door opened! We\'re leaving this layer.'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '但这扇门后面感觉安静得很可疑……如果这扇门后面不是出口，你绝对不许笑！',
                    en: 'But it feels suspiciously quiet behind this door... If it\'s not the exit, don\'t you dare laugh!'
                },
                tone: 'steady'
            }
        ],
        L13: [
            {
                type: 'dialog',
                text: {
                    zh: '果然门后面不是什么出口……外壳展开后，格子变成了 4x4。',
                    en: 'Of course the door wasn\'t an exit... the shell expanded to 4x4.'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '不过我终端上亮起了一个叫『补片』的工具。这地板……它能用贴纸补上？',
                    en: 'But a tool called "Patch" lit up on my terminal. Can we... patch this floor with stickers?'
                },
                tone: 'steady'
            },
            {
                type: 'tool',
                tool: 'patch',
                targetCell: { face: 4, row: 1, col: 2 },
                text: {
                    zh: '把路补在亮的缺口上。别补成纪念品。',
                    en: 'Patch the lit gap. Do not make it decorative.'
                },
                openTools: true,
                tone: 'steady'
            }
        ],
        L16: [
            {
                type: 'dialog',
                text: {
                    zh: '等下，我两边脚下亮起了两个泛着蓝光的传送圆环。',
                    en: 'Wait, two glowing blue teleportation rings just lit up on both sides.'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '它们好像把空间直接对折了，踩进去能瞬间飞到另一端。希望我被传送过去时零件还是全的。',
                    en: 'They seem to fold space directly, warping me to the other side. Hopefully in one piece.'
                },
                tone: 'steady'
            },
            {
                type: 'move',
                targetCell: { face: 4, row: 3, col: 0 },
                text: {
                    zh: '踩进蓝圈，飞到对面去！',
                    en: 'Step into the blue ring to warp to the other side!'
                },
                tone: 'steady'
            }
        ],
        L23: [
            {
                type: 'dialog',
                text: {
                    zh: '那个红光怪物把出路堵得死死的。直接过去就是给它送货上门。',
                    en: 'That red light monster is choking the exit. Walking straight in is delivery service.'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '但我手上的终端亮起了『诱饵信标』。扔出去它就会傻傻挪过去。',
                    en: 'But the "Decoy Beacon" lit up on my terminal. Throw it and it dumbly moves towards it.'
                },
                tone: 'steady'
            },
            {
                type: 'tool',
                tool: 'beacon',
                targetCell: { face: 1, row: 0, col: 0 },
                text: {
                    zh: '把诱饵丢到亮的位置。别站在原地看它被骗。',
                    en: 'Drop the decoy on the lit spot. Don\'t stand and watch it get tricked.'
                },
                openTools: true,
                tone: 'steady'
            }
        ]
    };

    function normalizeLevels(levels) {
        return levels.map((level, index) => {
            const number = Number(textOf(level.title).match(/L(\d+)/)?.[1] || index + 1);
            const mechanicTags = inferMechanicTags(level);
            const normalized = {
                id: `L${String(number).padStart(2, '0')}`,
                number,
                act: level.act || getActForLevel(number),
                ...level,
                mechanicTags,
                difficulty: inferDifficulty({ ...level, mechanicTags }, number)
            };
            normalized.tutorialSteps = tutorialStepsConfig[normalized.id] || [];
            normalized.fingerprint = level.fingerprint || createFingerprint(normalized);
            return normalized;
        });
    }

    function createLevelBook() {
        const at = (face, row, col) => ({ face, row, col });
            return normalizeLevels([
                {
                    title: { zh: 'L01 逃生线', en: 'L01 Escape Line' },
                    chapter: { zh: '读图与点格', en: 'Reading the Board' },
                    concept: { zh: '通信链路已建立。E-7 手里已经有钥匙了——点她旁边的格子，引导她走到逃生门。', en: 'Uplink established. E-7 has the key — click neighboring cells to walk her to the exit.' },
                    tutorial: {
                        icon: '➜',
                        cue: { zh: '点到门', en: 'Click to exit' },
                        goal: { zh: '从绿色棋子拖到出口。', en: 'Guide Dawn from the green piece to the exit.' },
                        tip: { zh: '点击相邻格', en: 'Click adjacent tiles' },
                        visual: 'dragExit'
                    },
                    bestTurns: 5,
                    bestRotations: 0,
                    hasKeyStart: true,
                    player: at(1, 1, 1),
                    key: null,
                    exit: at(0, 2, 1),
                    rotationEnabled: false,
                    validation: { solvable: true, mustDrawRoute: true, mustUseRotation: false, hasThreats: false },
                    ais: []
                },
                {
                    title: { zh: 'L02 钥匙在前', en: 'L02 Key First' },
                    chapter: { zh: '钥匙与门', en: 'Key, Then Door' },
                    concept: { zh: '先钥匙，后门。没有敌人，只有一个很朴素的问题：这破地方到底认不认钥匙。', en: 'Key first, door second. No monsters yet, just prove the cube is not smarter than us.' },
                    tutorial: {
                        icon: '◇',
                        cue: { zh: '钥匙→出口', en: 'Key -> Exit' },
                        goal: { zh: '先踩钥匙，再进出口。', en: 'Step on the key before touching the exit.' },
                        tip: { zh: '没钥匙，门不开', en: 'No key, no door' },
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
                    title: { zh: 'L03 追击者', en: 'L03 Chaser' },
                    chapter: { zh: '公开威胁', en: 'Visible Threat' },
                    concept: { zh: '有追击者在向这里靠拢。红色标记的格子代表它下一步会踩过来——先看红，再落脚。', en: 'A chaser is closing in. Red-marked cells are where it steps next — read red, then move.' },
                    tutorial: {
                        icon: '!',
                        cue: { zh: '红格会追上', en: 'Red catches' },
                        goal: { zh: '避开红色预告格。', en: 'Avoid the red preview cells.' },
                        tip: { zh: '先看红，再点格', en: 'Read red first' },
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
                    title: { zh: 'L04 夹击拧门', en: 'L04 Twist the Door' },
                    chapter: { zh: '旋转目标', en: 'Moving Targets' },
                    concept: { zh: '钥匙被孤岛卡住了。别让 Dawn 跳，她不是弹簧人；拧一层，把路转过来。', en: 'The key is stranded. Twist the layer and bring the platform to Dawn instead of pretending she can jump through physics.' },
                    tutorial: {
                        icon: '⟳',
                        cue: { zh: '旋转孤岛', en: 'Twist island' },
                        goal: { zh: '通过旋转将钥匙带到可达区域。', en: 'Twist the key into reach.' },
                        tip: { zh: '有时候不是你在走，是路在走', en: 'Sometimes the road moves' },
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
                    validation: { solvable: true, mustUseRotation: true, rotatesKey: true, hasThreats: false },
                    ais: []
                },
                {
                    title: { zh: 'L05 钥匙也会动', en: 'L05 The Key Moves Too' },
                    chapter: { zh: '旋转目标', en: 'Moving Targets' },
                    concept: { zh: '前面的路被切开了。拧中层，让钥匙自己回到能走的路上。', en: 'The front face is split. Twist the middle layer so the key rejoins a route Dawn can actually survive.' },
                    tutorial: {
                        icon: '◇',
                        cue: { zh: '转动钥匙', en: 'Move the key' },
                        goal: { zh: '把钥匙转进路线。', en: 'Rotate the key into the route.' },
                        tip: { zh: '目标跟着层移动', en: 'Targets ride layers' },
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
                    title: { zh: 'L06 守钥者', en: 'L06 Key Keeper' },
                    chapter: { zh: '守路不堵门', en: 'Guard, Not Wall' },
                    concept: { zh: '踩进钥匙那一面，守钥者会跟一格。把它骗偏，拿钥匙，别站着发表获奖感言。', en: 'Step onto the key face and the keeper follows by one cell. Bait it, grab the key, leave before it gets opinions.' },
                    tutorial: {
                        icon: '!',
                        cue: { zh: '把它引走', en: 'Bait it away' },
                        goal: { zh: '进钥匙面，引开守钥者。', en: 'Enter the key face and pull the keeper off-line.' },
                        tip: { zh: '守钥者会追你 1 格', en: 'Keeper moves 1' },
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
                    title: { zh: 'L07 碎解阻断', en: 'L07 Break the Chase' },
                    chapter: { zh: '主动拆路', en: 'Break the Road' },
                    concept: { zh: '守钥者要从中路压回来。先把它必经的格子碎掉，再拿钥匙跑路。', en: 'The keeper wants the center lane. Break the cell it needs, then take the key while it recalculates its bad life choices.' },
                    tutorial: {
                        icon: '✕',
                        cue: { zh: '拆掉追路', en: 'Break chase lane' },
                        goal: { zh: '碎解守钥者会经过的格子。', en: 'Break the keeper\'s route cell.' },
                        tip: { zh: '拆路，不是拆自己', en: 'Break the road, not Dawn' },
                        visual: 'break'
                    },
                    bestTurns: 7,
                    bestRotations: 0,
                    player: at(0, 1, 1),
                    key: at(4, 1, 0),
                    exit: at(1, 1, 1),
                    rotationEnabled: false,
                    guardianAggro: 'guardDoor',
                    breakCharges: 2,
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
                    title: { zh: 'L08 取钥即逃', en: 'L08 Grab and Run' },
                    chapter: { zh: '撤离压力', en: 'Exit Pressure' },
                    concept: { zh: '钥匙到手后，守钥者会连走两格。Dawn 可以嘴硬，但腿最好诚实一点。', en: 'Once Dawn takes the key, the keeper moves two cells. Do not celebrate on the board. Run.' },
                    tutorial: {
                        icon: '2',
                        cue: { zh: '拿钥匙后 2 格', en: 'Two after key' },
                        goal: { zh: '拿钥匙后立刻撤。', en: 'Leave right after the key.' },
                        tip: { zh: '守钥者会走 2 格', en: 'Keeper moves 2' },
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
                    title: { zh: 'L09 正式开跑', en: 'L09 Real Run' },
                    chapter: { zh: '第一幕实战', en: 'Act I Trial' },
                    concept: { zh: '教学关到此结束。接下来怎么走完全看你了。', en: 'Tutorial phase ends here. From now on, the board does not hold your hand.' },
                    tutorial: {
                        icon: '✓',
                        cue: { zh: '真题开始', en: 'Real test' },
                        goal: { zh: '拿钥匙，避追击，进门。', en: 'Get key, dodge pressure, exit.' },
                        tip: { zh: '别直冲，先看红格', en: 'Do not autopilot' },
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
                    title: { zh: 'L10 隐藏考：碎解突围', en: 'L10 Hidden: Breakout' },
                    chapter: { zh: '隐藏疯狂关', en: 'Hidden Trial' },
                    concept: { zh: '双追击夹击，守钥者还会守门。碎掉关键格，让它们的计划现场丢人。', en: 'Two chasers squeeze the board and the keeper guards the exit after key pickup. Break one cell to make their plan less smug.' },
                    tutorial: {
                        icon: '✕',
                        cue: { zh: '疯狂小考', en: 'Hidden heat' },
                        goal: { zh: '碎解关键格，别让三方围住你。', en: 'Break the key cell in their chase net.' },
                        tip: { zh: '这是隐藏题，别硬冲', en: 'Hidden means rude' },
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
                    title: { zh: 'L11 守门预演', en: 'L11 Door Block Preview' },
                    chapter: { zh: '第一幕实战', en: 'Act I Trial' },
                    concept: { zh: '这次守钥者不只追人。钥匙一拿，它就去堵门，所以撤离线要先想好。', en: 'This keeper does not just chase. After the key, it moves to choke the exit, because apparently doors needed a bodyguard.' },
                    tutorial: {
                        icon: '▣',
                        cue: { zh: '拿钥匙后守门', en: 'Guards exit' },
                        goal: { zh: '拿钥匙前先想好撤离门线。', en: 'Plan the exit line before grabbing the key.' },
                        tip: { zh: '它会去堵门', en: 'It blocks the door' },
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
                    title: { zh: 'L12 出口？', en: 'L12 Exit?' },
                    chapter: { zh: '第一幕毕业考', en: 'Act I Exam' },
                    concept: { zh: '它看起来像出口。太安静了，反而很可疑。先拧开局面，再冲门。', en: 'It looks like an exit, which is exactly why Dawn does not trust it. Twist, bait, take the key, then run anyway.' },
                    tutorial: {
                        icon: '★',
                        cue: { zh: '出口？', en: 'Exit?' },
                        goal: { zh: '旋转、引诱、取钥、撤离。', en: 'Twist, bait, key, exit.' },
                        tip: { zh: '如果这真是出口就好了', en: 'If only it were that easy' },
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
                    title: { zh: 'L13 孤岛补片', en: 'L13 Island Patch' },
                    chapter: { zh: '第二幕 · 外壳', en: 'Act II · Outer Shell' },
                    concept: { zh: '4x4 外壳打开。钥匙被缺口圈住了，给 Dawn 补一块临时地板，别让她和重力单挑。', en: 'The cube grows to 4x4. The key is sealed off by missing ground, so patch the gap before Dawn starts negotiating with gravity.' },
                    tutorial: {
                        icon: '4',
                        cue: { zh: '孤岛与补片', en: 'Island patch' },
                        goal: { zh: '用补片跨越缺口，拿取钥匙。', en: 'Patch the gap and reach the key.' },
                        tip: { zh: '补片踩过后会碎', en: 'Patch breaks after use' },
                        visual: 'patch'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 0,
                    player: at(4, 0, 2),
                    key: at(4, 2, 2),
                    exit: at(4, 2, 0),
                    rotationEnabled: false,
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
                        minPatchTurnGain: 1,
                        hasThreats: false
                    },
                    ais: []
                },
                {
                    title: { zh: 'L14 宽场夹击', en: 'L14 Wide Pincer' },
                    chapter: { zh: '第二幕 · 宽场', en: 'Act II · Wide Field' },
                    concept: { zh: '四阶空间更大，包抄角度也更多。别复读三阶走法，换线才是活路。', en: 'The 4x4 board gives more room and more ways to get cornered. Use the width; do not replay Act I with extra squares.' },
                    tutorial: {
                        icon: '!',
                        cue: { zh: '宽场换线', en: 'Use the width' },
                        goal: { zh: '利用 4x4 的空间避开双追击。', en: 'Use 4x4 space to dodge double chase.' },
                        tip: { zh: '空间变大，追击也变宽', en: 'Bigger board, wider hunt' },
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
                    title: { zh: 'L15 宽场遛锁', en: 'L15 Wide Keeper Kite' },
                    chapter: { zh: '第二幕 · 宽场', en: 'Act II · Wide Field' },
                    concept: { zh: '四阶里的守钥者不只是站岗。你能遛它，追击者也有时间绕你。', en: 'The keeper has room now. Kite it, but do not admire your own route while the chaser wraps around.' },
                    tutorial: {
                        icon: '!',
                        cue: { zh: '大空间遛锁', en: 'Kite in 4x4' },
                        goal: { zh: '利用 4x4 空间调动守钥者，再拿钥匙撤离。', en: 'Use the wider board to pull the keeper aside.' },
                        tip: { zh: '能绕，不代表能拖', en: 'Room is not time' },
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
                    title: { zh: 'L16 偷门不遛锁', en: 'L16 Portal Theft' },
                    chapter: { zh: '第二幕工具', en: 'Act II Tool' },
                    concept: { zh: '传送门第一次登场就得真有用。别先遛守钥者，借门端直接切进钥匙线。', en: 'First portal lesson: stop politely kiting the keeper. Cut through the portal and steal tempo.' },
                    tutorial: {
                        icon: '◉',
                        cue: { zh: '穿门偷钥', en: 'Portal steal' },
                        goal: { zh: '借传送门绕过守钥者的正面压力。', en: 'Use the portal to bypass keeper pressure.' },
                        tip: { zh: '不用先遛，也别久留', en: 'Cut in, do not camp' },
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
                    title: { zh: 'L17 门边追击', en: 'L17 Chased at the Gate' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '传送门不是免费捷径。你省路，追击压力也会更快贴脸。', en: 'A portal is not a safe room. It shortens distance, including the distance between Dawn and trouble.' },
                    tutorial: {
                        icon: '◉',
                        cue: { zh: '门边有追击', en: 'Portal pressure' },
                        goal: { zh: '判断何时穿门，别在门端附近被追上。', en: 'Time the portal before the gate becomes a trap.' },
                        tip: { zh: '传送门两端都公开', en: 'Both ends are public' },
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
                    title: { zh: 'L18 传送门小考', en: 'L18 Portal Quiz' },
                    chapter: { zh: '第二幕小考', en: 'Act II Quiz' },
                    concept: { zh: '双追击把绕路空间压没了。传送门不是装饰，它就是这局的正路。', en: 'Double chasers crush the long route. The portal is not decoration; it is the route.' },
                    tutorial: {
                        icon: '◉',
                        cue: { zh: '穿门抢拍', en: 'Portal tempo' },
                        goal: { zh: '别绕远路，借传送门切进钥匙线。', en: 'Do not take the scenic route. Portal into tempo.' },
                        tip: { zh: '绕路会丢拍', en: 'Detours lose tempo' },
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
                    title: { zh: 'L19 少了一格', en: 'L19 Missing Cell' },
                    chapter: { zh: '第二幕 · 断面', en: 'Act II · Broken Face' },
                    concept: { zh: '黑色缺口不是氛围灯，是没地了。绕过去，别让 Dawn 用脚验证。', en: 'Black gaps are not moody flooring. They are no floor. Route around them without donating turns.' },
                    tutorial: {
                        icon: '裂',
                        cue: { zh: '缺口不能走', en: 'Gap means no floor' },
                        goal: { zh: '绕开黑色缺口，拿钥匙进门。', en: 'Avoid gaps, get key, exit.' },
                        tip: { zh: '黑洞洞的格子不能走', en: 'Dark cells are not cells' },
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
                    title: { zh: 'L20 裂面旋转', en: 'L20 Rotating Gaps' },
                    chapter: { zh: '第二幕 · 断面', en: 'Act II · Broken Face' },
                    concept: { zh: '缺口也是魔方结构的一部分。你拧层，洞也会动；离谱，但有用。', en: 'Gaps belong to the cube. Twist the layer and the hole moves too, which is rude but useful.' },
                    tutorial: {
                        icon: '⟳',
                        cue: { zh: '转动缺口', en: 'Move the gap' },
                        goal: { zh: '旋转包含缺口的层，挡住追击者并连通路线。', en: 'Twist the broken layer to connect route and block pursuit.' },
                        tip: { zh: '洞会跟着层移动', en: 'Holes ride layers' },
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
                    title: { zh: 'L21 临时补片', en: 'L21 Temporary Patch' },
                    chapter: { zh: '第二幕工具', en: 'Act II Tool' },
                    concept: { zh: '补片只撑 Dawn 走一次。她过去后碎掉，追捕者没有售后服务。', en: 'A patch holds for Dawn once, then breaks. Great news: the monsters do not get a courtesy bridge.' },
                    tutorial: {
                        icon: '+',
                        cue: { zh: '补一次洞', en: 'Patch once' },
                        goal: { zh: '先点补片，再点缺口，踩过去拿钥匙。', en: 'Place a patch on the gap, then cross it.' },
                        tip: { zh: '补片不能停，只能过', en: 'Cross, do not park' },
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
                    title: { zh: 'L22 断角与守卫', en: 'L22 Broken Corner' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '断角限制 Dawn，也限制守卫。把缺口当窄门用，别只把它当麻烦。', en: 'A broken corner limits Dawn and the keeper. Use that ugly geometry as a gate.' },
                    tutorial: {
                        icon: '角',
                        cue: { zh: '缺口遛锁', en: 'Gap kite' },
                        goal: { zh: '利用缺口绕开守卫，拿钥匙撤离。', en: 'Use the gap to route around the keeper.' },
                        tip: { zh: '缺口也能挡敌人', en: 'Gaps block them too' },
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
                    title: { zh: 'L23 诱饵信标', en: 'L23 Decoy Beacon' },
                    chapter: { zh: '第二幕工具', en: 'Act II Tool' },
                    concept: { zh: '诱饵能放在合法空地。它能拽走敌人的目标，但不会替你思考。', en: 'A beacon can be placed on any legal empty cell. It pulls a target; it does not play the game for you.' },
                    tutorial: {
                        icon: '诱',
                        cue: { zh: '骗走一个', en: 'Bait one' },
                        goal: { zh: '放诱饵调走守钥者，再冲钥匙线。', en: 'Place a beacon, pull the keeper, then take key line.' },
                        tip: { zh: '诱饵只能用一次', en: 'One bait, one beat' },
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
                    title: { zh: 'L24 破面小考', en: 'L24 Broken Face Quiz' },
                    chapter: { zh: '第二幕小考', en: 'Act II Quiz' },
                    concept: { zh: '缺口、补片、诱饵都在场。别把工具当烟花放，先判断哪一个真救命。', en: 'Gap, patch, beacon. Do not mash every tool like a nervous intern. Pick the one that saves the position.' },
                    tutorial: {
                        icon: '考',
                        cue: { zh: '破面残局', en: 'Broken setup' },
                        goal: { zh: '用补片断追击，用诱饵调开守钥者。', en: 'Patch to cut pursuit, bait to move the keeper.' },
                        tip: { zh: '强工具也要用准', en: 'Strong tools still need aim' },
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
                    title: { zh: 'L25 双门择路', en: 'L25 Two Portal Choice' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '传送门不止一对。别看到亮圈就钻，先看哪一对能接住钥匙线和门线。', en: 'Two portal pairs. Do not jump into the shiny one. Pick the pair that links key and exit in tempo.' },
                    tutorial: {
                        icon: '◉',
                        cue: { zh: '两对门', en: 'Two portal pairs' },
                        goal: { zh: '选择正确传送门端，抢在双追击合围前撤离。', en: 'Choose the portal pair before the pincer closes.' },
                        tip: { zh: '门多了，错门也会快', en: 'Wrong portals are fast too' },
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
                    title: { zh: 'L26 碎桥断尾', en: 'L26 Patch Tail-Cut' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '补片不是铺路砖，是断尾刀。Dawn 过去，它碎掉，追击者留在另一边干瞪眼。', en: 'The patch is not flooring; it is a tail-cut. Cross, break it, leave the chaser with paperwork.' },
                    tutorial: {
                        icon: '+',
                        cue: { zh: '过洞断追', en: 'Cut the tail' },
                        goal: { zh: '用一次性补片穿过缺口，让追击者绕远。', en: 'Cross the one-use patch and force a detour.' },
                        tip: { zh: '补片碎了反而是好事', en: 'Breaking is the point' },
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
                    title: { zh: 'L27 诱饵换岗', en: 'L27 Bait the Guard' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '诱饵不是暂停键，它只买一拍。骗错对象，Dawn 就要替你买单。', en: 'The beacon does not pause enemies. It buys one wrong step. Bait the wrong target and Dawn gets the invoice.' },
                    tutorial: {
                        icon: '诱',
                        cue: { zh: '骗开守钥者', en: 'Bait the keeper' },
                        goal: { zh: '用诱饵调走守钥者，抢钥匙后立刻撤。', en: 'Move the keeper with bait, grab key, leave.' },
                        tip: { zh: '诱饵只买一拍', en: 'Bait buys one beat' },
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
                    title: { zh: 'L28 破面传送', en: 'L28 Broken Portal' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '缺口切断普通路线，传送门补节奏。绕路当然能走，追击者也当然不会等你。', en: 'The gap ruins the normal route. The portal restores tempo; the chaser is not waiting for your sightseeing tour.' },
                    tutorial: {
                        icon: '裂',
                        cue: { zh: '缺口 + 门', en: 'Gap plus portal' },
                        goal: { zh: '借传送门跨过破面造成的长绕路。', en: 'Use the portal to skip the broken detour.' },
                        tip: { zh: '破洞逼你看门端', en: 'Broken ground points to portal' },
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
                    title: { zh: 'L29 补片换门', en: 'L29 Patch for Exit' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '守钥者压钥匙线，缺口压撤离线。补片留给门前，不是看见洞就手痒。', en: 'The keeper pressures key line; the gap pressures exit line. Save the patch for escape, not for the first hole that looks dramatic.' },
                    tutorial: {
                        icon: '+',
                        cue: { zh: '补撤离线', en: 'Patch exit line' },
                        goal: { zh: '引开守钥者后，把补片留给门前缺口。', en: 'Pull the keeper, then patch the exit gap.' },
                        tip: { zh: '补早了会亏', en: 'Patch too early, lose tempo' },
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
                    title: { zh: 'L30 双追穿门', en: 'L30 Double Chase Portal' },
                    chapter: { zh: '第二幕小考', en: 'Act II Quiz' },
                    concept: { zh: '两个追击者压路。传送门能省路，但门端也可能是红色压力集合点。', en: 'Two chasers squeeze the route. The portal saves distance, but its endpoint is where bad news gathers.' },
                    tutorial: {
                        icon: '考',
                        cue: { zh: '双追穿门', en: 'Double chase portal' },
                        goal: { zh: '借门抢钥匙，但别落在门端威胁里。', en: 'Use the portal for key tempo, not for dying at the endpoint.' },
                        tip: { zh: '门端不是安全屋', en: 'Endpoint is not safe' },
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
                    title: { zh: 'L31 多维解法', en: 'L31 Multi-Tool Line' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '缺口、补片、诱饵、传送门全来了。哪个拿钥匙，哪个保命，想清楚再点。', en: 'Gap, patch, beacon, portal. Decide which tool earns the key and which one gets Dawn out alive.' },
                    tutorial: {
                        icon: '考',
                        cue: { zh: '工具组合', en: 'Tool combo' },
                        goal: { zh: '组合使用所有道具，突破防线。', en: 'Combine the tools to break the defense.' },
                        tip: { zh: '不要用错工具对象', en: 'Use tools on the right problem' },
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
                    title: { zh: 'L32 信标穿门', en: 'L32 Beacon Portal' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '诱饵不是万能钥匙。它只拉偏一拍，你要用传送门把这一拍变成距离。', en: 'The beacon is not a master key. It bends one chase line; the portal turns that one beat into distance.' },
                    tutorial: {
                        icon: '诱',
                        cue: { zh: '骗开门端', en: 'Bait portal edge' },
                        goal: { zh: '先放诱饵改写追击目标，再穿门撤离。', en: 'Bait first, then portal out.' },
                        tip: { zh: '骗一拍，穿一拍', en: 'Bait a beat, portal a beat' },
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
                    title: { zh: 'L33 补片穿门', en: 'L33 Patch Portal' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '补片管脚下，传送门管远处。两个工具各干一件事，别强迫它们兼职。', en: 'Patch fixes the floor under Dawn. Portal fixes distance. They are coworkers, not substitutes.' },
                    tutorial: {
                        icon: '+',
                        cue: { zh: '补洞再穿门', en: 'Patch then portal' },
                        goal: { zh: '用补片接上钥匙线，再借传送门撤离。', en: 'Patch the key line, then portal out.' },
                        tip: { zh: '一块补片，一次机会', en: 'One patch, one chance' },
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
                    title: { zh: 'L34 错门陷阱', en: 'L34 Wrong Portal Trap' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '最快的门不一定安全。门端旁边有红色压力时，顺序比门本身更重要。', en: 'The fastest portal is not always safe. When red pressure sits near the endpoint, order matters more than sparkle.' },
                    tutorial: {
                        icon: '◉',
                        cue: { zh: '先后顺序', en: 'Order matters' },
                        goal: { zh: '避开危险门端，走能连到出口的那条。', en: 'Avoid the dangerous endpoint and take the line to exit.' },
                        tip: { zh: '错门也很快', en: 'Wrong portals are fast' },
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
                    title: { zh: 'L35 绝境防线', en: 'L35 Last Defense' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '守钥者会堵门，缺面限制绕路，多名追击者夹击。好消息：至少规则都摆在脸上。', en: 'The keeper blocks the exit after key pickup, broken faces limit detours, and multiple chasers are being deeply unhelpful. Use everything.' },
                    tutorial: {
                        icon: '★',
                        cue: { zh: '绝境撤离', en: 'Last defense' },
                        goal: { zh: '在守卫封门前撤离，避开层层缺口与追捕。', en: 'Exit before the keeper seals the door.' },
                        tip: { zh: '门线会被抢', en: 'The door line gets stolen' },
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
                    title: { zh: 'L36 诱饵断尾', en: 'L36 Beacon Tail-Cut' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '诱饵不能让全场失明。它只拽走关键一只，剩下的还得靠路线。', en: 'A beacon does not blind the room. It pulls one key threat; the rest still need honest routing.' },
                    tutorial: {
                        icon: '诱',
                        cue: { zh: '骗一只', en: 'Bait one' },
                        goal: { zh: '用诱饵改写一只追击者的路线，再从另一侧撤。', en: 'Redirect one chaser, exit from the other side.' },
                        tip: { zh: '别指望一骗三', en: 'Do not expect one bait to solve three' },
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
                    title: { zh: 'L37 补片救场', en: 'L37 Patch Save' },
                    chapter: { zh: '第二幕小考', en: 'Act II Quiz' },
                    concept: { zh: '这关不是“看见洞就补”。只有一块补片，抢钥匙还是救撤离，选错就难看。', en: 'This is not “patch the first hole you see.” One patch, two possible disasters. Pick the useful one.' },
                    tutorial: {
                        icon: '考',
                        cue: { zh: '一块补片', en: 'One patch' },
                        goal: { zh: '判断唯一补片应该补哪一个缺口。', en: 'Choose which gap deserves the only patch.' },
                        tip: { zh: '补错还能悔棋', en: 'Undo exists, thankfully' },
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
                    title: { zh: 'L38 门后钓锁', en: 'L38 Portal Lure' },
                    chapter: { zh: '第二幕组合', en: 'Act II Combo' },
                    concept: { zh: '传送门能绕守钥者，也能把 Dawn 送到它下一步能堵死的地方。先钓开，再穿。', en: 'A portal can bypass the keeper or deliver Dawn straight into its next block. Lure first. Portal second.' },
                    tutorial: {
                        icon: '◉',
                        cue: { zh: '钓开再穿', en: 'Lure then portal' },
                        goal: { zh: '调动守钥者后，用传送门切进撤离线。', en: 'Move the keeper, then portal into exit line.' },
                        tip: { zh: '别把自己送门口', en: 'Do not deliver yourself to the door' },
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
                    title: { zh: 'L39 诱饵夹击考', en: 'L39 Beacon Pincer Exam' },
                    chapter: { zh: '第二幕小考', en: 'Act II Quiz' },
                    concept: { zh: '诱饵只能骗走一条压力线。剩下的追击不会因为你可爱就下班。', en: 'The beacon bends one pressure line. It does not file a complaint against the rest of them. Draw the remaining escape.' },
                    tutorial: {
                        icon: '考',
                        cue: { zh: '诱饵小考', en: 'Beacon exam' },
                        goal: { zh: '用诱饵拉偏关键追击者，再从另一侧撤离。', en: 'Pull the key chaser aside, then exit from the other side.' },
                        tip: { zh: '骗一只，跑全局', en: 'Bait one, route the rest' },
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
                    title: { zh: 'L40 第二层出口？', en: 'L40 Second Exit?' },
                    chapter: { zh: '第二幕毕业考', en: 'Act II Exam' },
                    concept: { zh: '第二层给足空间，也给足敌人。传送门能接住钥匙线和出口线，但门端照样会咬人。', en: 'The second shell gives room and enemies. The portal links key and exit, but its endpoint is not your emotional support chair.' },
                    tutorial: {
                        icon: '★',
                        cue: { zh: '第二幕终局', en: 'Act II finale' },
                        goal: { zh: '在破面、传送和多敌压力下带 E-7 离开第二层。', en: 'Get Dawn through broken faces, portals, and multi-enemy pressure.' },
                        tip: { zh: '看门端，也看红格', en: 'Watch endpoints and red cells' },
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
