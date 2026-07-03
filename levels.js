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
                    zh: '系统提示：先拖动视角，看清 Dawn 所在的魔方表面。',
                    en: 'System: drag the view first and read the cube surface around Dawn.'
                },
                threshold: 3.0,
                focusCell: { face: 1, row: 1, col: 1 },
                focus: { x: 50, y: 46 },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '系统提示：这是逃生出口。记住绿色门框，带 Dawn 走到这里才算脱离本层。',
                    en: 'System: this is the exit. Remember the green frame; guide Dawn here to leave this layer.'
                },
                focusCell: { face: 0, row: 2, col: 1 },
                highlightTarget: 'exit',
                focus: { x: 52, y: 42 },
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'zoom',
                text: {
                    zh: '系统提示：滚轮或捏合拉远，看完整魔方。',
                    en: 'System: scroll or pinch out to see the full cube.'
                },
                threshold: 2.0,
                wheelThreshold: 2.0,
                focusCell: { face: 1, row: 1, col: 1 },
                focus: { x: 50, y: 46 },
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'move',
                text: {
                    zh: '系统提示：点击 Dawn 相邻的高亮格，她会移动过去。',
                    en: 'System: click the highlighted neighboring tile and Dawn will move there.'
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
                    zh: '系统提示：钥匙和出口同时出现。先看钥匙位置，再看出口路线。',
                    en: 'System: key and exit are both visible. Check the key first, then the exit route.'
                },
                openComms: true,
                focusCell: { face: 4, row: 1, col: 0 },
                highlightTarget: 'key',
                focus: { x: 48, y: 42 },
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'dialog',
                text: {
                    zh: '系统提示：再看绿色出口。钥匙点亮出口，先钥匙，后门。',
                    en: 'System: now check the green exit. The key powers it: key first, door second.'
                },
                focusCell: { face: 1, row: 1, col: 1 },
                highlightTarget: 'exit',
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'esc',
                text: {
                    zh: '系统提示：按 ESC 或左上角菜单，可暂停、重开、回选关。',
                    en: 'System: press ESC or the top-left menu to pause, restart, or return.'
                },
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'closeEsc',
                text: {
                    zh: '系统提示：现在关闭暂停面板，继续拿钥匙。',
                    en: 'System: close the pause panel and continue toward the key.'
                },
                tone: 'system',
                speaker: '系统广播'
            }
        ],
        L03: [
            {
                type: 'dialog',
                text: {
                    zh: '系统提示：红色追击者会预告下一步。先确认它和红格，再移动。',
                    en: 'System: the red chaser previews its next step. Check it and the red tile before moving.'
                },
                focusCell: { face: 0, row: 0, col: 1 },
                focus: { x: 52, y: 40 },
                warning: true,
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'dialog',
                text: {
                    zh: '系统提示：红格是它下一步。先看红，再落脚。',
                    en: 'System: red marks its next step. Read red, then move.'
                },
                tone: 'system',
                speaker: '系统广播'
            }
        ],
        L04: [
            {
                type: 'dialog',
                text: {
                    zh: '“刚才地面动了？我差点栽下去。”',
                    en: '"Did the floor just move? I nearly fell off."'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '“你能拧这个空间。很好，离谱但有用。”',
                    en: '"You can twist this space. Great. Absurd, but useful."'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '“钥匙在孤岛上。别让我跳，把路拧过来。”',
                    en: '"The key is stranded. Do not make me jump. Twist the road here."'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '系统提示：左下角是「旋转魔方」。点它进入拧层模式。',
                    en: 'System: the bottom-left Layer Twist button enters layer-twist mode.'
                },
                uiTarget: 'twist',
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'twist',
                text: {
                    zh: '系统提示：现在拖动 Dawn 最近的最上层，把路拧到钥匙旁。',
                    en: 'System: now drag the top layer closest to Dawn and bring the road beside the key.'
                },
                axis: 'Y',
                layer: 2,
                direction: 'CW',
                focusCell: { face: 4, row: 1, col: 1 },
                focus: { x: 50, y: 40 },
                tone: 'system',
                speaker: '系统广播'
            }
        ],


        L06: [
            {
                type: 'dialog',
                text: {
                    zh: '系统提示：黄色守卫会堵住关键路线。先看清它的位置，不要硬闯。',
                    en: 'System: the yellow keeper blocks key routes. Locate it first; do not charge in.'
                },
                focusCell: { face: 4, row: 1, col: 2 },
                focus: { x: 50, y: 40 },
                tone: 'system',
                speaker: '系统广播'
            }
        ],

        L07: [
            {
                type: 'dialog',
                text: {
                    zh: '“工具箱亮了个『碎解』。听起来很不安全，正好。”',
                    en: '"A Break tool lit up. Sounds unsafe. Perfect."'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '系统提示：碎解会移除指定地块。先拆关键格，再走路线。',
                    en: 'System: Break removes a target tile. Break the key cells first, then route around.'
                },
                tone: 'system',
                speaker: '系统广播'
            },
            {
                type: 'tool',
                tool: 'break',
                targetCell: { face: 4, row: 0, col: 2 },
                text: {
                    zh: '系统提示：选『碎解』，拆掉守卫上方那格。',
                    en: 'System: choose Break and remove the tile above the keeper.'
                },
                speaker: '系统广播',
                openTools: true,
                tone: 'system'
            },
            {
                type: 'tool',
                tool: 'break',
                targetCell: { face: 4, row: 2, col: 2 },
                text: {
                    zh: '系统提示：再拆下方那格，把它困住。',
                    en: 'System: remove the lower tile too and trap it.'
                },
                speaker: '系统广播',
                openTools: true,
                tone: 'system'
            },
            {
                type: 'dialog',
                text: {
                    zh: '“它困住了。绕过去，拿钥匙，跑路。”',
                    en: '"It is trapped. Loop around, take the key, run."'
                },
                tone: 'steady'
            }
        ],


        L13: [
            {
                type: 'dialog',
                text: {
                    zh: '“果然……门后面根本不是什么出口，而是一个更大的 4x4 魔方……我们只是从一个更小的笼子掉进了一个更大的笼子里……”',
                    en: '"Of course... behind that door was no exit, but a larger 4x4 cube... we just fell from a smaller cage into a bigger one..."'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '“不过我的手机终端上解锁了一个叫『补片』的工具。这地表破损的地方，能直接用能量块补上吗？”',
                    en: '"But a tool called \'Patch\' unlocked on my phone terminal. Can we patch these broken floor gaps with energy cells?"'
                },
                tone: 'steady'
            },
            {
                type: 'tool',
                tool: 'patch',
                targetCell: { face: 4, row: 1, col: 2 },
                text: {
                    zh: '“系统提示：补片工具可填补地表缺口，但强度有限，生命体踩踏过后会立即碎裂。请开启工具箱并在高亮缺口处放置补片以建立临时通路。”',
                    en: '"System Notification: The Patch tool fills void gaps, but has limited durability; it shatters instantly after stepping off. Please open the toolbox and place a patch in the highlighted gap to build a temporary bridge."'
                },
                openTools: true,
                tone: 'steady'
            }
        ],
        L16: [
            {
                type: 'dialog',
                text: {
                    zh: '“等下，我两边脚下亮起了一个叫传送门的东西，看起来很科幻……”',
                    en: '"Wait, two glowing blue teleportation rings just lit up on both sides, looks very sci-fi..."'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '“这好像是空间传送阵……只要踩进去就能瞬间折跃到魔方的另一端。希望传送过去的时候我没有缺胳膊少腿……”',
                    en: '"They seem to fold space directly, warping me to the other side. Hopefully in one piece."'
                },
                tone: 'steady'
            },
            {
                type: 'dialog',
                text: {
                    zh: '“系统提示：传送门无冷却时间限制，可被用作突破敌人合围的瞬间折跃手段。请踩入蓝色高亮光环进行传送验证。”',
                    en: '"System Notification: Portals have no cooldown and can serve as instantaneous warps to break encirclements. Please step into the blue highlighted portal to warp."'
                },
                tone: 'steady'
            }
        ],
        L23: [
            {
                type: 'dialog',
                text: {
                    zh: '“那个红色怪物直接蹲在出口旁边……要是直接往出口跑，一定会和它撞个正着的，我们得想办法把它调开。”',
                    en: '"That red chaser is sitting right next to the exit... charging there directly means a head-on collision, we must draw it away."'
                },
                tone: 'worry'
            },
            {
                type: 'dialog',
                text: {
                    zh: '“我的手机上多了一个『诱饵信标』工具……据说把它丢出去，那些怪物就会被吸引过去，像蠢货一样跟它贴贴。”',
                    en: '"My phone has a new \'Decoy Beacon\' tool... apparently if we throw it out, the threats get attracted and cluster around it like fools."'
                },
                tone: 'steady'
            },
            {
                type: 'tool',
                tool: 'beacon',
                targetCell: { face: 1, row: 0, col: 0 },
                text: {
                    zh: '“系统提示：诱饵信标可对范围内的威胁源造成极高引力干扰。请尝试打开工具箱，在指定格子放置诱饵将红光怪物吸引拉开。”',
                    en: '"System Notification: The Decoy Beacon generates high gravitational interference for threats. Please open the toolbox and place a beacon on the designated cell to lure the chaser away."'
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
                    concept: { zh: '通信链路已建立。Dawn 手里已经有钥匙了——点击她旁边的格子，引导她走到逃生门。', en: 'Uplink established. Dawn has the key — click neighboring cells to walk her to the exit.' },
                    tutorial: {
                        icon: '➜',
                        cue: { zh: '点到门', en: 'Click to exit' },
                        goal: { zh: '点击相邻格，把 Dawn 带到出口。', en: 'Click adjacent tiles and guide Dawn to the exit.' },
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
                        at(4, 0, 0),
                        at(4, 0, 1),
                        at(4, 1, 1),
                        at(4, 2, 1),
                        at(4, 2, 0),
                        at(2, 1, 2)
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
                    breakCharges: 3,
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
                    title: { zh: 'L13 剪刀初试', en: 'L13 First Prune' },
                    chapter: { zh: '第二幕 · 数据爬藤', en: 'Act II · Glitch Vines' },
                    concept: { zh: '青色数据藤蔓只挡 Dawn。拧动空间，把断根的藤蔓剪掉，路才会重新露出来。', en: 'Cyan glitch vines block Dawn only. Twist space, cut the disconnected growth, and the route reappears.' },
                    tutorial: {
                        icon: '藤',
                        cue: { zh: '断根即死', en: 'Cut the root' },
                        goal: { zh: '旋转一次剪掉挡路藤蔓，再拿钥匙进门。', en: 'Twist once to prune the blocking vines, then reach key and exit.' },
                        tip: { zh: '藤蔓挡 Dawn，不挡怪物', en: 'Vines block Dawn, not enemies' },
                        visual: 'vine'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 1,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(4, 3, 3),
                    rotationEnabled: true,
                    vineSources: [
                        at(5, 3, 3)
                    ],
                    vineCells: [
                        at(4, 0, 1),
                        at(4, 1, 0),
                        at(4, 1, 1),
                        at(4, 1, 2),
                        at(4, 1, 3),
                        at(2, 0, 3),
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2),
                        at(2, 0, 0)
                    ],
                    validation: {
                        solvable: true,
                        mustUseRotation: true,
                        hasThreats: false
                    },
                    ais: []
                },
                {
                    title: { zh: 'L14 蔓延之影', en: 'L14 Spreading Shadow' },
                    chapter: { zh: '第二幕 · 数据爬藤', en: 'Act II · Glitch Vines' },
                    concept: { zh: '你每执行两次有效行动，藤蔓就扩散一层。追击者能穿过藤蔓，Dawn 不能。', en: 'Every two valid actions, vines spread by one step. Chasers cross vines; Dawn cannot.' },
                    tutorial: {
                        icon: '蔓',
                        cue: { zh: '两拍一长', en: 'Spreads every two' },
                        goal: { zh: '剪掉前路藤蔓，在追击者贴近前撤离。', en: 'Prune the route before the chaser closes in.' },
                        tip: { zh: '怪物不怕藤蔓', en: 'Enemies ignore vines' },
                        visual: 'vineThreat'
                    },
                    size: 4,
                    bestTurns: 5,
                    bestRotations: 1,
                    rotationEnabled: true,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(4, 3, 3),
                    vineSources: [
                        at(5, 3, 3)
                    ],
                    vineCells: [
                        at(4, 0, 1),
                        at(4, 1, 0),
                        at(4, 1, 1),
                        at(4, 2, 1),
                        at(2, 0, 3),
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2),
                        at(2, 0, 0)
                    ],
                    validation: {
                        solvable: true,
                        mustUseRotation: true,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(1, 3, 3) }
                    ]
                },
                {
                    title: { zh: 'L15 钥匙封锁', en: 'L15 Key Lockdown' },
                    chapter: { zh: '第二幕 · 数据爬藤', en: 'Act II · Glitch Vines' },
                    concept: { zh: '钥匙前方被藤蔓封死。别硬走，先拧层，把钥匙线从母体网络里剪出来。', en: 'The key route is sealed by vines. Do not force it; twist first and cut the key line loose.' },
                    tutorial: {
                        icon: '钥',
                        cue: { zh: '钥匙线剪枝', en: 'Prune key line' },
                        goal: { zh: '旋转剪枝后拿钥匙。', en: 'Prune by twisting, then take the key.' },
                        tip: { zh: '断根后藤蔓会消失', en: 'Disconnected vines vanish' },
                        visual: 'vineKey'
                    },
                    size: 4,
                    bestTurns: 4,
                    bestRotations: 1,
                    rotationEnabled: true,
                    player: at(4, 0, 0),
                    key: at(4, 0, 2),
                    exit: at(4, 3, 3),
                    vineSources: [
                        at(5, 3, 3)
                    ],
                    vineCells: [
                        at(4, 0, 1),
                        at(4, 1, 0),
                        at(4, 1, 1),
                        at(4, 1, 2),
                        at(4, 1, 3),
                        at(2, 0, 3),
                        at(0, 3, 0),
                        at(0, 3, 1),
                        at(0, 3, 2),
                        at(2, 0, 0)
                    ],
                    validation: {
                        solvable: true,
                        mustUseRotation: true,
                        hasThreats: false
                    },
                    ais: []
                },
                {
                    title: { zh: 'L16 跨草袭来', en: 'L16 Through the Vines' },
                    chapter: { zh: '第二幕 · 数据爬藤', en: 'Act II · Glitch Vines' },
                    concept: { zh: '追击者能从藤蔓里直线压过来，Dawn 只能等你剪开自己的路。', en: 'The chaser cuts straight through vines while Dawn waits for you to open her route.' },
                    tutorial: {
                        icon: '追',
                        cue: { zh: '怪物无视藤蔓', en: 'Enemy ignores vines' },
                        goal: { zh: '剪开 Dawn 的路，在追击者靠近前撤离。', en: 'Prune Dawn route before the chaser reaches her.' },
                        tip: { zh: '藤蔓只挡你', en: 'Vines only block you' },
                        visual: 'vineThreat'
                    },
                    size: 4,
                    bestTurns: 6,
                    bestRotations: 1,
                    rotationEnabled: true,
                    player: at(4, 3, 0),
                    key: at(4, 1, 2),
                    exit: at(4, 0, 3),
                    vineSources: [
                        at(5, 3, 3)
                    ],
                    vineCells: [
                        at(4, 2, 0),
                        at(4, 2, 1),
                        at(4, 3, 1),
                        at(4, 1, 1),
                        at(4, 1, 2),
                        at(4, 0, 2),
                        at(1, 0, 0),
                        at(2, 3, 3)
                    ],
                    validation: {
                        solvable: true,
                        mustUseRotation: true,
                        noOpeningWait: true,
                        hasThreats: true
                    },
                    ais: [
                        { type: 'chaser', pos: at(1, 3, 3) }
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
                        goal: { zh: '在破面、传送和多敌压力下带 Dawn 离开第二层。', en: 'Get Dawn through broken faces, portals, and multi-enemy pressure.' },
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
