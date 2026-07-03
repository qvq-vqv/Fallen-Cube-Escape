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
            '聪明但不全知：她能观察脚下，但需要玩家的全局视角。'
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
            title: { zh: '钥匙已取得', en: 'Key secured' },
            status: { zh: '门前危险', en: 'Exit danger' },
            bubble: { zh: '它堵到门口了！怎么会这样……', en: 'It is blocking the exit! Why would it do that...' },
            lines: [
                { zh: '钥匙拿到了……', en: 'We got the key...' },
                { zh: '等一下，那个大块头怪物怎么没来追我？它……它直接往门口去了！', en: 'Wait. Why is that huge thing not chasing me? It... it went straight to the exit!' },
                { zh: '它好像知道门在哪里，直接堵在门口了……呜呜，它好聪明，我们是不是出不去了……', en: 'It knows where the door is. It is blocking it... It is too smart. Are we trapped?' }
            ],
            replies: [
                {
                    face: K.steady,
                    aria: { zh: '认真回应', en: 'Focused reply' },
                    tone: 'steady',
                    response: { zh: '别慌，你看好安全格子，我跟着你走！', en: 'Do not panic. Watch the safe tiles. I will follow you.' }
                },
                {
                    face: K.worry,
                    aria: { zh: '担心回应', en: 'Worried reply' },
                    tone: 'warm',
                    response: { zh: '别盯着我看了，它把门口堵住了，你快帮我想想办法呀……', en: 'Stop staring at me. It blocked the exit. Please think of something...' }
                },
                {
                    face: K.tease,
                    aria: { zh: '吐槽回应', en: 'Teasing reply' },
                    tone: 'tease',
                    response: { zh: '你还笑……行，这次就算到你账上，快带我绕开它！', en: 'You are still smiling... Fine. Put this one on your tab. Get me around it!' }
                }
            ]
        },
        eventKeyCollectedPortal: {
            title: { zh: '钥匙已取得', en: 'Key secured' },
            status: { zh: '传送撤离', en: 'Portal escape' },
            bubble: { zh: '拿到钥匙了！我们快走！', en: 'Key secured! Let us move!' },
            lines: [
                { zh: '钥匙拿到啦！', en: 'I got the key!' },
                { zh: '不过前面还有怪物在守着，传送门虽然能省路，但我还是很害怕……', en: 'There is still a monster ahead. The portal saves distance, but I am still scared...' },
                { zh: '你指引路线的时候一定要看准，拜托你一定要带我安全过去！', en: 'Please aim carefully when you guide me. Get me through safely.' }
            ],
            replies: [
                {
                    face: K.steady,
                    aria: { zh: '认真回应', en: 'Focused reply' },
                    tone: 'steady',
                    response: { zh: '我准备好了，你指哪里我走哪里。别指错啊！', en: 'I am ready. I will step where you point. Do not point wrong.' }
                },
                {
                    face: K.panic,
                    aria: { zh: '紧张回应', en: 'Nervous reply' },
                    tone: 'warm',
                    response: { zh: '慌也没用，你千万看准了别让我踩进红格子……', en: 'Panicking will not help. Just do not send me into a red tile...' }
                },
                {
                    face: K.tease,
                    aria: { zh: '吐槽回应', en: 'Teasing reply' },
                    tone: 'tease',
                    response: { zh: '你这个表情看起来胸有成竹。好吧，先相信你一次！', en: 'That face looks weirdly confident. Fine. I will trust you once.' }
                }
            ]
        },
        eventRotateActTwo: {
            title: { zh: '空间折叠', en: 'Spatial folding' },
            status: { zh: '空间折叠', en: 'Spatial folding' },
            bubble: { zh: '哇啊！地表又开始转动了……', en: 'Whoa! The ground is turning again...' },
            lines: [
                { zh: '这个大魔方拧起来的声音比刚才沉重好多……', en: 'This bigger cube sounds much heavier when it twists...' },
                { zh: '就好像这个世界的主人发现我们在用旋转抄近路一样……', en: 'It feels like whoever owns this place noticed us using twists as shortcuts...' },
                { zh: '它在学我们拧魔方的路数……我总感觉有什么更大的危险要来了，我们得学得比它更快才行……', en: 'It is learning our twisting routes. Something worse is coming. We have to learn faster than it does...' }
            ],
            replies: [
                {
                    face: K.nod,
                    aria: { zh: '点头回应', en: 'Nod reply' },
                    tone: 'steady',
                    response: { zh: '好的……你现在看起来很冷静，这让我也稍微安心了一点点……', en: 'Okay... You look calm right now. That helps a little.' }
                },
                {
                    face: K.worry,
                    aria: { zh: '担心回应', en: 'Worried reply' },
                    tone: 'warm',
                    response: { zh: '是啊，这个 4x4 的魔方看起来很宽敞，但其实怪物能包抄我的路也更多了……', en: 'Yeah. This 4x4 cube looks wide, but it also gives monsters more ways to cut me off...' }
                },
                {
                    face: K.tease,
                    aria: { zh: '吐槽回应', en: 'Teasing reply' },
                    tone: 'tease',
                    response: { zh: '你竟然还笑得出来……真是服了你了，外侧的人心理素质都这么好吗？', en: 'You can still smile? Impressive. Are outside people all this calm?' }
                }
            ]
        },
        idleLowBond: {
            title: { zh: '通讯待机', en: 'Comms idle' },
            status: { zh: '信号稳定', en: 'Signal stable' },
            bubble: { zh: '我还在呢。你还在屏幕那边对吧？', en: 'I am still here. You are still on the other side, right?' },
            lines: [
                { zh: '你盯着这块大方块在想什么呢？……行吧，我先等一会儿。', en: 'What are you thinking while staring at this giant cube? ...Fine, I will wait.' },
                { zh: '这里实在太安静了，安静得让人害怕……别丢下我一个人。', en: 'It is too quiet here. Scary quiet... Do not leave me alone.' },
                { zh: '这地板冰凉冰凉的，而且这里连个坐的地方都没有……我想回家了。', en: 'The floor is freezing, and there is nowhere to sit... I want to go home.' }
            ],
            replies: []
        }
    };

    const microReactions = {
        route: [
            { zh: '看见你的指示了。我走这。', en: 'I see your marker. Going there.' },
            { zh: '行，听你的。我踩上去了。', en: 'Fine, following you. I am stepping on it.' },
            { zh: '好，我按你选的走。千万别指错路了啊。', en: 'Okay. I will take your route. Please do not point wrong.' }
        ],
        playerMove: [
            { zh: '呼，踩稳了。', en: 'Whew. Stable tile.' },
            { zh: '这格暂时还安全。呼……', en: 'This tile is safe for now. Whew...' },
            { zh: '我到了，下一步往哪走？', en: 'I am here. Where next?' },
            { zh: '千万别让我停在红格子旁边，求你了。', en: 'Please do not leave me next to a red tile.' }
        ],
        playerMoveBridge: [
            { zh: '穿过传送门了……肚子感觉晃得好难受，我想吐……', en: 'Went through the portal... My stomach hates that.' },
            { zh: '这里比刚才更阴暗了，这是更深的地方吗……', en: 'It is darker here. Are we deeper inside?' },
            { zh: '我过来啦。呼，幸好没有掉下去。', en: 'I made it. Good. I did not fall.' }
        ],
        keyCollected: [
            { zh: '拿到了！现在我们去大门对不对？', en: 'Got it! Now we go to the door, right?' },
            { zh: '钥匙拿到了！快带我走，我好害怕。', en: 'Key secured! Get me out. I am scared.' },
            { zh: '它亮了，门应该可以开了对不对？', en: 'It lit up. The door should open now, right?' }
        ],
        rotate: [
            { zh: '天旋地转的……下次拧之前能不能说一声啊，呜呜。', en: 'Everything spun... Warn me before twisting next time.' },
            { zh: '整个格子都转了……重力一下子变了，好难受……', en: 'The whole tile moved... Gravity feels wrong.' },
            { zh: '路对齐了吗？拜托快带我离开这里。', en: 'Is the route aligned? Please get me out.' }
        ],
        patchPlaced: [
            { zh: '你要我踩这个？它牢固吗……', en: 'You want me to step on that? Is it solid?' },
            { zh: '临时地板……踩上去软绵绵的，我腿在发抖。', en: 'Temporary floor... It feels soft. My legs are shaking.' },
            { zh: '那我踩上去了。千万要撑住，别让我掉下去啊。', en: 'Okay, stepping on it. Please hold.' }
        ],
        patchBroken: [
            { zh: '啊，碎了！好险，幸好我已经走过来了。', en: 'It broke! Good thing I already crossed.' },
            { zh: '呼……刚过去地板就裂了，我差一点就……', en: 'It cracked right behind me. That was too close.' },
            { zh: '后面的路断了。别回头，没退路了。', en: 'The way back is gone. No looking back.' }
        ],
        breakPlaced: [
            { zh: '碎了。太好了，这样怪物就过不来对不对？', en: 'It broke. Great. The monster cannot cross now, right?' },
            { zh: '前面的格子被打穿了……声音听起来像玻璃碎掉一样。', en: 'That tile shattered... It sounded like glass.' },
            { zh: '路断掉了。让那个怪物在那边慢慢发呆吧。', en: 'Route cut. Let that thing stare from over there.' }
        ],
        beaconPlaced: [
            { zh: '把诱饵放这吗？真的有用吗？', en: 'Put the decoy here? Does that really work?' },
            { zh: '诱饵放好了。希望那些怪物的脑子不好使……', en: 'Beacon placed. I hope those things are not clever...' },
            { zh: '它亮起来了。希望怪物真的会过去看。', en: 'It lit up. Please let the monster fall for it.' }
        ],
        beaconTriggered: [
            { zh: '它真的过去了！我们快跑！', en: 'It actually went there! Run!' },
            { zh: '它被吸引走了！快，趁现在指路！', en: 'It took the bait! Point the route now!' },
            { zh: '诱饵起效了。呼，我们动作快点！', en: 'Beacon worked. Move fast.' }
        ],
        aiNear: [
            { zh: '它贴过来了……！', en: 'It is getting close...!' },
            { zh: '太近了……我能闻到一股金属锈掉的味道，我好害怕！', en: 'Too close... It smells like rust. I am scared!' },
            { zh: '别让它再靠近了，求求你！', en: 'Do not let it get closer. Please!' }
        ],
        aiMove: [
            { zh: '它动了……！', en: 'It moved...!' },
            { zh: '我听见它往我这边走了……', en: 'I heard it coming toward me...' },
            { zh: '红格子在闪烁……它要过来了！', en: 'The red tiles are flashing... It is coming!' }
        ],
        skip: [
            { zh: '你停下干嘛？它们不会等我的！', en: 'Why are we stopping? They will not wait!' },
            { zh: '站着不动吗？……我心跳得好快，好紧张。', en: 'Standing still? My heart is going too fast.' },
            { zh: '你是不是在思考下一步？千万别想太久啊……', en: 'Are you thinking? Please do not think too long...' }
        ],
        victory: [
            { zh: '门开了！终于……先让我喘一口气。', en: 'The door opened! Finally... Let me breathe.' },
            { zh: '出去了吗？……天啊，我还活着。', en: 'Are we out? ...I am still alive.' },
            { zh: '太好了，这次谢谢你带路，真的。', en: 'Good. Thank you for guiding me. Really.' }
        ],
        actFinale: [
            { zh: '门后面居然不是外面……怎么会这样……', en: 'Behind the door is not outside... Why?' },
            { zh: '不是吧……为什么还有一个更大的魔方？！', en: 'No way... Why is there a bigger cube?' },
            { zh: '我就知道……呜呜，我们是不是永远出不去了……', en: 'I knew it... Are we never getting out?' }
        ],
        gameOver: [
            { zh: '……我刚才是不是没了？', en: '...Did I just disappear?' },
            { zh: '等下。刚才好疼……那这倒带算谁的？', en: 'Wait. That hurt... Who pays for the rewind?' },
            { zh: '求求你认真点，我不想再被那些铁壳怪物抓到了。', en: 'Please take this seriously. I do not want those metal things catching me again.' }
        ]
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function textOf(value) {
        if (typeof window !== 'undefined' && window.getText) {
            return window.getText(value);
        }
        if (value && typeof value === 'object') {
            const lang = typeof window !== 'undefined' && window.currentLang === 'en' ? 'en' : 'zh';
            return value[lang] || value.zh || value.en || '';
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
        const en = typeof window !== 'undefined' && window.currentLang === 'en';
        const total = Object.values(state?.tones || {}).reduce((sum, value) => sum + value, 0);
        if (total <= 0) return en ? 'Sync: unknown' : '同步：未知';
        const tone = getDominantTone(state);
        if (state.bond >= 14) {
            if (tone === 'tease') return en ? 'Sync: sharp but aligned' : '同步：吵但默契';
            if (tone === 'warm') return en ? 'Sync: trusting' : '同步：偏信任';
            return en ? 'Sync: steady partners' : '同步：稳定搭档';
        }
        if (tone === 'warm') return en ? 'Sync: gentle' : '同步：偏温柔';
        if (tone === 'tease') return en ? 'Sync: mutual teasing' : '同步：互相吐槽';
        return en ? 'Sync: steady' : '同步：稳定';
    }

    function getContextLine(scene, state, game) {
        const en = typeof window !== 'undefined' && window.currentLang === 'en';
        if (!game?.currentLevel) {
            return en ? 'Comms open only in safe gaps. Read the board before moving.' : '通讯只在安全间隙打开；移动前先看全局地图。';
        }
        const level = game.currentLevel;
        const tone = getDominantTone(state);
        const suffix = tone === 'tease'
            ? (en ? 'She complains, but she is watching your next step.' : '她嘴上嫌弃，但会继续盯着你的下一步。')
            : (tone === 'warm'
                ? (en ? 'She will remember that you worried about her.' : '她会记住你刚才的担心。')
                : (en ? 'Signal stable. Solve the board first.' : '通讯稳定，先处理残局。'));
        return `${textOf(level.title)} · ${textOf(level.chapter)}。${suffix}`;
    }

    function getAmbientBubble({ scene, state, game }) {
        if (!scene || !game?.currentLevel) return null;
        if (game.gameState !== 'playing') return scene.bubble || null;

        const bi = (zh, en) => ({ zh, en });
        const levelIndex = game.currentLevelIndex || 0;
        const pool = [];

        // 1. L03 追击者首次登场：Dawn 只表达真实恐惧，不讲规则。
        if (levelIndex === 2) {
            pool.push(bi('那个红色的怪物一直在跟着我！它越来越近了，呜呜……', 'That red thing keeps following me! It is getting closer...'));
            pool.push(bi('救命啊，别让那个红色大家伙抓到我！', 'Help. Do not let the red giant catch me!'));
            pool.push(bi('我听见后面的脚步声了，心快跳出来了！', 'I can hear its steps behind me. My heart is going crazy!'));
            pool.push(bi('快指路！我不想被它碰到。', 'Point the way. I do not want it touching me.'));
        }
        // 2. 常规状态：只说感受、害怕、想回家，不替系统解释机制。
        else {
            if (levelIndex >= 12) {
                pool.push(bi('外壳比刚才大。别让它显得比我们聪明。', 'This shell is bigger. Do not let it look smarter than us.'));
                pool.push(bi('整个 4x4 的大方块转起来重力好奇怪，有点头晕。', 'This 4x4 cube makes gravity feel wrong when it turns.'));
                pool.push(bi('四阶空间很宽，追击者也不是来散步的。', 'The 4x4 space is wide, and the chaser is not here for a stroll.'));
                pool.push(bi('我感觉那台折叠机在暗中看着我们……', 'I feel like the folding machine is watching us...'));
            } else {
                pool.push(bi('这地板冰凉冰凉的，而且连个坐的地方都没有……我想回家了。', 'The floor is freezing, and there is nowhere to sit... I want to go home.'));
                if (!game.hasKey) {
                    pool.push(bi('（拍屏幕的动态气泡）喂——你还在听吗？我快要无聊死啦。', '(taps screen) Hey, are you still listening? I am dying of boredom.'));
                    pool.push(bi('喂，你是不是在屏幕那一端吃着零食指挥我跑路啊？', 'Hey, are you eating snacks while telling me where to run?'));
                }
            }
        }

        // 4. 通用动态条件追加
        if (game.hasKey) {
            pool.push(bi('钥匙有了。现在别浪，带我去找出口大门！', 'We have the key. Do not get fancy. Get me to the exit!'));
            pool.push(bi('钥匙在我口袋里了，感觉暖烘烘的。我们快走吧！', 'The key is in my pocket. It feels warm. Let us go.'));
        }

        const hasChaserNear = game.ais?.some(ai => ai.state === 'chase');
        if (hasChaserNear) {
            pool.push(bi('它在屁股后面追着呢！千万别停步！', 'It is right behind me! Do not stop!'));
            pool.push(bi('红格子在闪……它要追过来了，快逃！', 'The red tiles are flashing... It is coming. Run!'));
        }

        if (game.ais?.some(ai => ai.state === 'gate')) {
            pool.push(bi('门口有麻烦。它真的去堵门了，太卑鄙了！', 'Trouble at the exit. It really blocked the door. Rude.'));
        }

        if (game.bridges?.length) {
            pool.push(bi('传送门在那儿。好用，但我有点晕传送……', 'There is a portal. Useful, but it makes me dizzy...'));
        }

        // 5. 情感基调追加
        const tone = getDominantTone(state);
        if (tone === 'tease') {
            pool.push(bi('别笑太早。你笑早了我会听见。', 'Do not laugh too early. I can hear it.'));
            pool.push(bi('哼，我就知道你会选这格。咱们还算有点默契。', 'Hmph. I knew you would pick that tile. We are almost in sync.'));
        } else if (tone === 'warm') {
            pool.push(bi('我知道你在担心我……你一定要看清格子啊，求求你啦。', 'I know you are worried about me... Please read the tiles carefully.'));
            pool.push(bi('谢谢你一直陪着我说话。有你在，我没那么害怕了。', 'Thanks for staying on the line. I am a little less scared.'));
        }

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
