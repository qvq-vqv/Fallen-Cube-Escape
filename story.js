/**
 * 主角与剧情中枢
 *
 * 设计目标：
 * - 不做指数爆炸的分支树，而做“状态变量 + 事件反应 + 少量关系变化”。
 * - 玩家仍然主要玩解谜；通讯负责让主角一直在场、记住玩家的口吻，并推动章节剧情。
 * - 这里放角色塑造、关系规则、剧情节拍和事件路由；具体长台词仍可继续放在 dialogue.js。
 */
(function () {
    const K = {
        shock: '(⊙_⊙)',
        steady: '(｀・ω・´)',
        worry: '(´･ω･`)',
        tease: '(¬‿¬)',
        cheer: '(ง •̀_•́)ง',
        nod: '(・∀・)b',
        panic: '(・_・;)',
        quiet: '(。_。)'
    };

    const protagonist = {
        currentName: 'Dawn',
        nameStatus: '她记得自己叫 Dawn，也记得自己想回家；E-7 是折叠机给她贴的编号。',
        role: '从床上坠入魔方牢笼的人类女孩；玩家是手机另一端的陌生引导者。',
        voicePillars: [
            '害怕但强撑：恐惧真实存在，嘴硬只是防御。',
            '毒舌调侃：用挖苦掩饰不安，但危险太近时会短句失控。',
            '黑色幽默：把危险说得很轻，反而显出害怕。',
            '反工具人：她不是棋子，会质疑玩家、手机信号和所有可疑指令。',
            '聪明但不全知：她能观察脚下，但需要玩家的全局展开图。'
        ],
        hardRules: [
            '不把玩家夸成神。玩家帮到了她，她会承认，但嘴上不服。',
            '先像一个突然掉进怪地方的人，再像游戏角色，最后才像教程。',
            '开场必须先防备、质疑、试探；不能无条件跟着未知引导走。',
            '少解释规则，多用反应暴露规则；她不能替系统念说明书。',
            '危险时优先短句；安全时才聊身世、折叠机和关系。',
            '主角不知道玩家知道什么，早期会误解玩家、怀疑手机信号、害怕但嘴硬。',
            '回家无需动机。需要的是家的质感：床、灯、手机、房门、没说完的话。',
            '不要卖惨。她可以害怕，但不能只靠可怜吸引玩家。'
        ],
        longArc: [
            '第一幕：从“你是谁”到“你暂时还算可靠”。',
            '第二幕：发现折叠机在学习逃亡数据，玩家也可能被观察。',
            '中期：她开始怀疑 Falling 不是事故，床可能只是入口。',
            '后期：玩家和她不只是逃出去，而是要反过来骗折叠机。'
        ]
    };

    const chapterBeats = {
        actOne: {
            promise: '建立玩家和主角的互救关系。',
            end: 'L12「出口？」不是出口，而是第二幕外壳。'
        },
        actTwo: {
            promise: '空间变大，折叠机也开始学习。',
            designWarning: '第二幕不能像教程续集。每个新工具都必须立刻进入压力局面。'
        }
    };

    const extraScenes = {
        eventKeyCollectedGuardDoor: {
            title: '钥匙已取得',
            status: '门线危险',
            bubble: '它去门口了。不是吧。',
            lines: [
                '钥匙拿到了。',
                '等一下，它没冲我。它往门口去了。',
                '它知道我要从那儿走。很好，连门都有人抢着堵。'
            ],
            replies: [
                {
                    face: K.steady,
                    aria: '认真回应',
                    tone: 'steady',
                    response: '行。你看门线，我假装自己没有慌。'
                },
                {
                    face: K.worry,
                    aria: '担心回应',
                    tone: 'warm',
                    response: '别这么看我。它还没堵死，至少现在还没。'
                },
                {
                    face: K.tease,
                    aria: '吐槽回应',
                    tone: 'tease',
                    response: '你还笑？行，门口堵人这件事也记你账上。'
                }
            ]
        },
        eventKeyCollectedPortal: {
            title: '钥匙已取得',
            status: '传送撤离',
            bubble: '钥匙拿了。别发呆。',
            lines: [
                '钥匙拿到了。',
                '传送门能省路，但它不会替我挡追击者。',
                '你要是真想救我，下一条线就别客气。'
            ],
            replies: [
                {
                    face: K.steady,
                    aria: '认真回应',
                    tone: 'steady',
                    response: '我把这个表情理解成“马上走”。别让我理解错。'
                },
                {
                    face: K.panic,
                    aria: '紧张回应',
                    tone: 'warm',
                    response: '慌可以，线别抖。尤其别抖到红格里。'
                },
                {
                    face: K.tease,
                    aria: '吐槽回应',
                    tone: 'tease',
                    response: '你这个表情像在说很简单。最好是真的。'
                }
            ]
        },
        eventRotateActTwo: {
            title: '空间折叠',
            status: '外壳偏转',
            bubble: '别突然拧，我差点咬到舌头。',
            lines: [
                '四阶拧起来声音不一样。',
                '像这地方终于发现我们会作弊了。',
                '别高兴太早。它会学，我们得学得更快。'
            ],
            replies: [
                {
                    face: K.nod,
                    aria: '点头回应',
                    tone: 'steady',
                    response: '点头收到。你现在看起来像个靠谱联系人。暂时的。'
                },
                {
                    face: K.worry,
                    aria: '担心回应',
                    tone: 'warm',
                    response: '担心是对的。四阶看起来宽，其实更容易被包。'
                },
                {
                    face: K.tease,
                    aria: '吐槽回应',
                    tone: 'tease',
                    response: '你笑得像刚刚没有把世界拧歪。很有外侧人的从容。'
                }
            ]
        },
        idleLowBond: {
            title: '通讯待机',
            status: '信号稳定',
            bubble: '我还在。你也最好在。',
            lines: [
                '如果你在看展开图，我不打扰。',
                '如果你在发呆，我现在开始有意见。',
                '外侧的人类是不是都这样？关键时刻突然很安静。'
            ],
            replies: []
        }
    };

    const microReactions = {
        route: [
            '看见线了。我走。先声明，不代表我完全信你。',
            '两步以内，对吧？你最好数清楚，我现在没空替你数学补课。',
            '行，我按你画的走。错了我会很有意见。'
        ],
        playerMove: [
            '踩稳了。',
            '这格还行，至少没咬我。',
            '我到了。下一步？',
            '别让我停在红格旁边。'
        ],
        playerMoveBridge: [
            '穿过去了。胃还在，暂时。',
            '传送门另一头也不怎么友好。',
            '好，省路了。别省脑子。'
        ],
        keyCollected: [
            '拿到了。现在快走，别让我在这里发表获奖感言。',
            '钥匙到手，别站着拍照。你也拍不到。',
            '它亮了。门应该认这个。应该吧。'
        ],
        rotate: [
            '别突然拧，我差点咬到舌头。',
            '世界转了。我的胃没同意。',
            '这一下有用，但我会记仇。'
        ],
        patchPlaced: [
            '你要我踩这个？它最好不是贴纸。',
            '临时地板。这个名字听着就很值得怀疑。',
            '行，我踩。但它要是碎早了，我先骂你。'
        ],
        patchBroken: [
            '碎了。好消息，后面也过不来。',
            '它断了。很好，我第一次喜欢地板坏掉。',
            '补片没了。别回头，回头也没路。'
        ],
        breakPlaced: [
            '裂了。好消息，怪物过不来，我也过不去。',
            '格子被你打穿了。这地方的声音听着像玻璃碎掉。',
            '物理隔离完成。让它在对面慢慢发呆吧。'
        ],
        beaconPlaced: [
            '骗谁？这题我喜欢。',
            '诱饵放好了。希望它们真的没脑子。',
            '好，钓一下。别把我也算进去。'
        ],
        beaconTriggered: [
            '它真过去了。我们聪明了三秒。',
            '上钩了。先别笑，跑。',
            '它吃诱饵了。很好，智力测试通过。'
        ],
        aiNear: [
            '它贴过来了。',
            '近了。非常近。',
            '别让它再靠一步。'
        ],
        aiMove: [
            '它动了。',
            '我听见它过来了。',
            '红格不是装饰，真的。'
        ],
        skip: [
            '你停下干嘛？它们不会等。',
            '好吧，站着也是一种战术。很欠揍的那种。',
            '这一下我不太喜欢。'
        ],
        victory: [
            '门开了。先让我喘一口气。',
            '出去了？等等，别急着庆祝。',
            '我还活着。你这次可以得意一秒。'
        ],
        actFinale: [
            '门后不是外面。',
            '不是吧。还有一层？',
            '我就知道这门安静得不对劲。'
        ],
        gameOver: [
            '……我刚才是不是没了？',
            '等下。回滚？那疼算谁的？',
            '别把我当按钮。再来，但认真点。'
        ]
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function textOf(value) {
        if (value && typeof value === 'object') {
            return value.zh || value.en || '';
        }
        return value ?? '';
    }

    function createState() {
        return {
            tones: { steady: 0, warm: 0, tease: 0 },
            bond: 0,
            trust: 0,
            care: 0,
            banter: 0,
            flags: {},
            memory: [],
            bubbleMemory: [],
            seenEvents: new Set()
        };
    }

    function applyReply(state, reply, sceneId) {
        if (!reply || !state) return state;

        if (reply.tone && state.tones[reply.tone] !== undefined) {
            state.tones[reply.tone] += 1;
        }

        const toneEffect = {
            steady: { bond: 1, trust: 2 },
            warm: { bond: 2, care: 2 },
            tease: { bond: 1, banter: 2 }
        }[reply.tone] || {};

        state.bond = clamp(state.bond + (toneEffect.bond || 0), -10, 30);
        state.trust = clamp(state.trust + (toneEffect.trust || 0), -10, 30);
        state.care = clamp(state.care + (toneEffect.care || 0), -10, 30);
        state.banter = clamp(state.banter + (toneEffect.banter || 0), -10, 30);
        state.memory.push({
            sceneId,
            face: reply.face,
            tone: reply.tone || 'unknown'
        });
        if (state.memory.length > 24) state.memory.shift();

        return state;
    }

    function getDominantTone(state) {
        const tones = state?.tones || {};
        const entries = Object.entries(tones);
        if (!entries.length) return 'unknown';
        const [tone, value] = entries.sort((a, b) => b[1] - a[1])[0];
        return value > 0 ? tone : 'unknown';
    }

    function getBondLabel(state) {
        const total = Object.values(state?.tones || {}).reduce((sum, value) => sum + value, 0);
        if (total <= 0) return '同步：未知';
        const tone = getDominantTone(state);
        if (state.bond >= 14) {
            if (tone === 'tease') return '同步：吵但默契';
            if (tone === 'warm') return '同步：偏信任';
            return '同步：稳定搭档';
        }
        if (tone === 'warm') return '同步：偏温柔';
        if (tone === 'tease') return '同步：互相吐槽';
        return '同步：稳定';
    }

    function getContextLine(scene, state, game) {
        if (!game?.currentLevel) return '通讯只在安全间隙展开；路线规划时先看展开图。';
        const level = game.currentLevel;
        const tone = getDominantTone(state);
        const suffix = tone === 'tease'
            ? '她嘴上嫌弃，但会继续看你画线。'
            : (tone === 'warm' ? '她会记住你刚才的担心。' : '通讯稳定，先处理残局。');
        return `${textOf(level.title)} · ${textOf(level.chapter)}。${suffix}`;
    }

    function getAmbientBubble({ scene, state, game }) {
        if (!scene || !game?.currentLevel) return null;
        if (game.gameState !== 'playing') return scene.bubble || null;

        const levelIndex = game.currentLevelIndex || 0;
        const pool = [];

        if (levelIndex >= 12) {
            pool.push('外壳比刚才大。别让它显得比我们聪明。');
            pool.push('四阶空间很宽，追击者也不是来散步的。');
        } else {
            pool.push('我还在。地图别关太久。');
            pool.push('你看展开图，我看脚下。非常公平，才怪。');
        }

        if (game.hasKey) pool.push('钥匙有了。现在别浪。');
        if (game.ais?.some(ai => ai.state === 'gate')) pool.push('门口有麻烦。它真的去堵门了。');
        if (game.ais?.some(ai => ai.state === 'seekKey')) pool.push('它在重新找钥匙。至少它还没笨到完全离谱。');
        if (game.bridges?.length) pool.push('传送门在那儿。好用，但不慈善。');

        const tone = getDominantTone(state);
        if (tone === 'tease') pool.push('别笑太早。你笑早了我会听见。');
        if (tone === 'warm') pool.push('我知道你在担心。先把线画稳。');

        const index = Math.abs((game.turn || 1) + levelIndex + (state.bond || 0)) % pool.length;
        return pool[index] || scene.bubble || null;
    }

    function pickReaction(state, pool, seed = 0) {
        if (!pool || pool.length === 0) return null;
        const recent = state?.bubbleMemory || [];
        const candidates = pool.filter(line => !recent.includes(line));
        const list = candidates.length > 0 ? candidates : pool;
        const line = list[Math.abs(seed) % list.length];
        if (state) {
            state.bubbleMemory = [...recent, line].slice(-5);
        }
        return line;
    }

    function getMicroReaction(detail, game, state) {
        if (!detail || !game) return null;
        const turnSeed = (game.turn || 1) + (game.currentLevelIndex || 0) + (state?.bond || 0);

        if (detail.type === 'playerMove') {
            if (detail.usedBridge) {
                return pickReaction(state, microReactions.playerMoveBridge, turnSeed + detail.to);
            }
            return pickReaction(state, microReactions.playerMove, turnSeed + detail.to);
        }
        if (detail.type === 'route') {
            return pickReaction(state, microReactions.route, turnSeed + (detail.steps || 0));
        }
        if (detail.type === 'keyCollected') {
            return pickReaction(state, microReactions.keyCollected, turnSeed);
        }
        if (detail.type === 'rotate') {
            return pickReaction(state, microReactions.rotate, turnSeed + (detail.layer || 0));
        }
        if (detail.type === 'patchPlaced') {
            return pickReaction(state, microReactions.patchPlaced, turnSeed + (detail.at || 0));
        }
        if (detail.type === 'patchBroken') {
            return pickReaction(state, microReactions.patchBroken, turnSeed + (detail.at || 0));
        }
        if (detail.type === 'breakPlaced') {
            return pickReaction(state, microReactions.breakPlaced, turnSeed + (detail.at || 0));
        }
        if (detail.type === 'beaconPlaced') {
            return pickReaction(state, microReactions.beaconPlaced, turnSeed + (detail.at || 0));
        }
        if (detail.type === 'beaconTriggered') {
            return pickReaction(state, microReactions.beaconTriggered, turnSeed + (detail.aiId || 0));
        }
        if (detail.type === 'aiMove') {
            if (Number.isFinite(detail.distanceAfter) && detail.distanceAfter <= 1) {
                return pickReaction(state, microReactions.aiNear, turnSeed + detail.aiId);
            }
            return pickReaction(state, microReactions.aiMove, turnSeed + detail.aiId);
        }
        if (detail.type === 'skip') {
            return pickReaction(state, microReactions.skip, turnSeed);
        }
        if (detail.type === 'victory') {
            return pickReaction(state, detail.actFinale ? microReactions.actFinale : microReactions.victory, turnSeed);
        }
        if (detail.type === 'gameOver') {
            return pickReaction(state, microReactions.gameOver, turnSeed);
        }
        return null;
    }

    function getEventSceneId(detail, game, baseSceneId) {
        if (!detail || !game?.currentLevel) return baseSceneId;
        if (detail.type === 'keyCollected') {
            if (game.currentLevel.guardianAggro === 'guardDoor') return 'eventKeyCollectedGuardDoor';
            if (game.currentLevel.bridges?.length) return 'eventKeyCollectedPortal';
        }
        if (detail.type === 'rotate' && game.currentLevelIndex >= 12) {
            return 'eventRotateActTwo';
        }
        return baseSceneId;
    }

    function getEventKey(detail, game, sceneId) {
        if (!detail) return sceneId || 'event';
        if (detail.type === 'gameOver') return `gameOver-${game.currentLevelIndex}-${game.turn}`;
        if (detail.type === 'rotate') return `rotate-${game.currentLevelIndex}`;
        if (detail.type === 'keyCollected') return `key-${game.currentLevelIndex}`;
        if (detail.type === 'victory') return detail.actFinale ? 'actFinale' : `victory-${game.currentLevelIndex}`;
        return `${detail.type}-${game.currentLevelIndex}-${sceneId || 'scene'}`;
    }

    const storyModule = {
        protagonist,
        chapterBeats,
        extraScenes,
        createState,
        applyReply,
        getBondLabel,
        getContextLine,
        getAmbientBubble,
        getMicroReaction,
        getEventSceneId,
        getEventKey
    };

    if (window.DIALOGUE_SCRIPT?.scenes) {
        Object.assign(window.DIALOGUE_SCRIPT.scenes, extraScenes);
        window.DIALOGUE_SCRIPT.story = { protagonist, chapterBeats };
    }

    window.STORY_MODULE = storyModule;
})();
