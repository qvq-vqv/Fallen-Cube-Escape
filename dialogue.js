/**
 * 第一幕通讯脚本
 *
 * 玩家可见回复只使用颜文字；主角承担叙事、吐槽和关系推进。
 * 主角名：Dawn。她先是一个想回家的人，其次才是棋盘上的逃脱者。
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

    window.KAOMOJI_LIB = {
        steady: [
            { face: '(｀・ω・´)', label: { zh: '认真', en: 'Locked in' }, aria: { zh: '认真回应', en: 'Focused reply' } },
            { face: '(ง •̀_•́)ง', label: { zh: '撑住', en: 'Hold steady' }, aria: { zh: '鼓劲回应', en: 'Encouraging reply' } },
            { face: '(・∀・)b', label: { zh: '收到', en: 'Copy that' }, aria: { zh: '确认回应', en: 'Confirming reply' } },
            { face: '( •̀ ω •́ )✧', label: { zh: '稳住', en: 'Stay sharp' }, aria: { zh: '稳住回应', en: 'Steady reply' } },
            { face: '(`･ω･´)ゞ', label: { zh: '执行', en: 'On it' }, aria: { zh: '执行回应', en: 'Ready reply' } }
        ],
        warm: [
            { face: '(´･ω･`)', label: { zh: '担心', en: 'Worried' }, aria: { zh: '担心回应', en: 'Worried reply' } },
            { face: '(｡•́︿•̀｡)', label: { zh: '别怕', en: 'Stay with me' }, aria: { zh: '安慰回应', en: 'Comforting reply' } },
            { face: '(´；ω；`)', label: { zh: '心疼', en: 'Ouch' }, aria: { zh: '心疼回应', en: 'Concerned reply' } },
            { face: '(っ´ω`)ﾉ(╥ω╥)', label: { zh: '摸头', en: 'Soft support' }, aria: { zh: '温柔回应', en: 'Gentle reply' } },
            { face: '(｡•́‿•̀｡)', label: { zh: '陪你', en: 'I am here' }, aria: { zh: '陪伴回应', en: 'Present reply' } }
        ],
        tease: [
            { face: '(¬‿¬)', label: { zh: '吐槽', en: 'Snark' }, aria: { zh: '吐槽回应', en: 'Snarky reply' } },
            { face: '╮(─▽─)╭', label: { zh: '摊手', en: 'Shrug' }, aria: { zh: '摊手回应', en: 'Shrug reply' } },
            { face: '(￣▽￣*)ゞ', label: { zh: '装傻', en: 'Playing dumb' }, aria: { zh: '装傻回应', en: 'Playful reply' } },
            { face: '(¬_¬ )', label: { zh: '斜眼', en: 'Side-eye' }, aria: { zh: '斜眼回应', en: 'Side-eye reply' } },
            { face: '(。-`ω´-)', label: { zh: '嘴硬', en: 'Bluffing' }, aria: { zh: '嘴硬回应', en: 'Bluffing reply' } }
        ]
    };

    const commonReplies = {
        steady: {
            face: K.steady,
            aria: { zh: '认真回应', en: 'Focused reply' },
            tone: 'steady',
            response: {
                zh: '行。你先别乱点，我先别摔下去。我们都成熟一点。',
                en: 'Fine. You click carefully, I avoid falling off reality. Mature teamwork.'
            }
        },
        worry: {
            face: K.worry,
            aria: { zh: '担心回应', en: 'Worried reply' },
            tone: 'warm',
            response: {
                zh: '别那副表情。我还站着呢。虽然我也不知道这算不算好消息。',
                en: 'Do not make that face. I am still standing. I am choosing to call that good news.'
            }
        },
        tease: {
            face: K.tease,
            aria: { zh: '吐槽回应', en: 'Snarky reply' },
            tone: 'tease',
            response: {
                zh: '你笑什么？好，记下了。等我出去再和你讲道理。',
                en: 'Are you laughing? Great. Logged. I will be extremely normal about this later.'
            }
        }
    };

    window.DIALOGUE_SCRIPT = {
        defaultScene: 'wakeSignal',
        levelScenes: {
            0: 'l01Route',
            1: 'l02Key',
            2: 'l03Chaser',
            3: 'l04Rotation',
            4: 'l05MovingKey',
            5: 'l06Guardian',
            6: 'l07Split',
            7: 'l08Rage',
            8: 'l09RealRun',
            9: 'l10BendRoom',
            10: 'l11LureLock',
            11: 'l12FinalePrep',
            12: 'l13OuterShell',
            13: 'l14FourRotate',
            14: 'l15FourChase',
            15: 'l16FoldBridge',
            16: 'l17PortalChase',
            17: 'l18BridgeExam',
            18: 'l19Void',
            19: 'l20VoidRotate',
            20: 'l21Patch',
            21: 'l22BrokenCorner',
            22: 'l23Beacon',
            23: 'l24BrokenExam',
            24: 'l25DoublePortal',
            25: 'l26PatchTail',
            26: 'l27BeaconGuard',
            27: 'l28VoidPortal',
            28: 'l29PatchGate',
            29: 'l30PortalPincer',
            30: 'l31VoidLock',
            31: 'l32BeaconPortal',
            32: 'l33PatchPortal',
            33: 'l34PortalTrap',
            34: 'l35VoidGate',
            35: 'l36BeaconPincer',
            36: 'l37PatchExam',
            37: 'l38PortalGuard',
            38: 'l39BeaconExam',
            39: 'l40ActTwoFinale'
        },
        eventScenes: {
            keyCollected: 'eventKeyCollected',
            firstRotation: 'eventFirstRotation',
            guardianRage: 'eventGuardianRage',
            gameOver: 'eventGameOver',
            normalVictory: 'eventNormalVictory',
            actFinale: 'eventActFinale'
        },
        prologue: {
            kicker: { zh: '第一幕 / 坠入', en: 'Act I / Falling In' },
            title: { zh: 'Dawn 接入', en: 'Dawn Online' },
            frames: [
                {
                    no: '01',
                    title: { zh: '……', en: '...' },
                    text: '我刚才在床上。灯还没关，手机在响。然后床像折纸一样塌下去了。'
                },
                {
                    no: '02',
                    title: { zh: '等一下。', en: 'Wait.' },
                    text: '你是谁？为什么我手机上有你的信号？你能看见我？'
                },
                {
                    no: '03',
                    title: { zh: '别指挥我。', en: 'Do not order me around.' },
                    text: '那个发亮的格子是你点的？我不认识你，也不打算随便跟着陌生人走。'
                },
                {
                    no: '04',
                    title: { zh: '……但我想回家。', en: '...But I want to go home.' },
                    text: '如果你真能带路，先证明你不会害死我。画短一点。'
                }
            ],
            startFace: K.steady,
            skipFace: K.panic
        },
        scenes: {
            wakeSignal: {
                title: { zh: 'E-7 / 陌生来电', en: 'E-7 / Unknown Call' },
                status: { zh: '信号发抖', en: 'Signal trembling' },
                bubble: { zh: '你到底是谁？', en: 'Who are you?' },
                lines: [
                    { zh: '……喂？能听到吗？这什么鬼信号……', en: '...Hello? Can you hear me? What a garbage signal...' },
                    { zh: '我刚才明明在宿舍床上玩手机，怎么一闭眼，整个人站在一个发光的方块上？！', en: 'I was literally just on my dorm bed looking at my phone. How did I open my eyes to find myself standing on a glowing square?!' },
                    { zh: '等等，我脚底下那条发光的荧光轨道是你画的？', en: 'Wait, did you draw that glowing fluorescent path under my feet?' },
                    { zh: '你到底是谁？先别得意，我还没决定要不要听一个陌生人的。', en: 'Who are you anyway? Don\'t get smug, I haven\'t decided whether to trust a stranger yet.' }
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: { zh: '震惊', en: 'Shocked' },
                        tone: 'warm',
                        response: { zh: '很好，你也不知道。这个回答很糟，但至少不像骗子。', en: 'Great, you don\'t know either. Terrible answer, but at least you don\'t sound like a scammer.' }
                    },
                    commonReplies.steady,
                    commonReplies.worry
                ]
            },
            l01Route: {
                title: { zh: 'L01 / 荧光轨道', en: 'L01 / Fluorescent Route' },
                status: { zh: '最低信任', en: 'Minimum trust' },
                bubble: { zh: '我警告你啊，别把我带沟里。', en: 'I warning you, don\'t lead me into a ditch.' },
                lines: [
                    { zh: '这地面踩起来倒是实的……好吧，虽然不知道你是什么原理，但我好像只能顺着你画的这条发光线走。', en: 'The ground feels solid... fine, whatever your science is, I guess I can only follow this glowing line you\'re drawing.' },
                    { zh: '我警告你啊，你要是故意把我往死路上带，我做鬼也不会放过你的！', en: 'I\'m warning you, if you lead me into a trap on purpose, I\'ll haunt you forever!' }
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.nod,
                        aria: { zh: '点头', en: 'Nod' },
                        tone: 'steady',
                        response: { zh: '别点得这么理所当然。你现在只是“可疑但暂时有用”。', en: 'Don\'t nod so casually. Right now you\'re just "suspicious but temporarily useful."' }
                    },
                    commonReplies.tease
                ]
            },
            l02Key: {
                title: { zh: 'L02 / 权限钥匙', en: 'L02 / Auth Key' },
                status: { zh: '目标确认', en: 'Target confirmed' },
                bubble: { zh: '那是钥匙吧？应该吧？', en: 'That is a key, right? Probably?' },
                lines: [
                    { zh: '前面悬浮着一把发光的……钥匙？还有一扇看起来像安全出口的门。', en: 'There\'s a glowing... key floating ahead? And a door that looks like an emergency exit.' },
                    { zh: '虽然很荒谬，但看来我得先去把那玩意儿捞到手。', en: 'Absurd, but I guess I have to grab that thing first.' },
                    { zh: '这难道是什么密室逃脱的测试吗？', en: 'Is this some kind of escape room test?' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '你也觉得这里很离谱吧？好，我们至少审美还在同一边。', en: 'You think this place is ridiculous too? Fine, at least our tastes are aligned.' }
                    }
                ]
            },
            l03Chaser: {
                title: { zh: 'L03 / 红色鬼东西', en: 'L03 / Red Thing' },
                status: { zh: '威胁接近', en: 'Threat closing' },
                bubble: { zh: '那怪东西在看我。', en: 'That weird thing is watching me.' },
                lines: [
                    { zh: '等等！前面那几格地板怎么开始冒红光了？', en: 'Wait! Why are those tiles ahead glowing red?' },
                    { zh: '还有那个飘在空中的红色鬼东西……它是冲着我来的对吧？', en: 'And that red ghost floating in the air... it\'s coming for me, isn\'t it?' },
                    { zh: '千万别把我往红光里送，我可不想被它碰到，天知道会发生什么！', en: 'Do not guide me into the red light under any circumstances. Heaven knows what happens if it touches me!' }
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.panic,
                        aria: { zh: '紧张', en: 'Nervous' },
                        tone: 'warm',
                        response: { zh: '别紧张。好吧，可以紧张一点，但别把线画到红格里。', en: 'Don\'t panic. Okay, maybe panic a little, but don\'t draw the line into the red cells.' }
                    },
                    commonReplies.tease
                ]
            },
            l04Rotation: {
                title: { zh: 'L04 / 空间重组', en: 'L04 / Space Reorder' },
                status: { zh: '空间异常', en: 'Space anomaly' },
                bubble: { zh: '等下，你拧了什么？！', en: 'Wait, what did you twist?!' },
                lines: [
                    { zh: '卧槽！！！——刚才整层地面是不是突然转过去了？！', en: 'What the hell!!! Did the entire floor just rotate?!' },
                    { zh: '我差点直接大头朝下栽下去！你……你居然能直接转动这个空间？！', en: 'I almost fell off head-first! You... you can actually rotate this space?!' },
                    { zh: '我的胃现在还在半空中悬着，下次转之前能不能提前打个招呼？！', en: 'My stomach is still floating in mid-air. Can you give me a heads-up before twisting next time?!' }
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: { zh: '震惊', en: 'Shocked' },
                        tone: 'warm',
                        response: { zh: '你也吓到了？很好，我不是唯一一个想投诉物理的人。', en: 'You got scared too? Great, I\'m not the only one who wants to complain to physics.' }
                    },
                    commonReplies.steady,
                    commonReplies.tease
                ]
            },
            l05MovingKey: {
                title: { zh: 'L05 / 旋转钥匙', en: 'L05 / Rotating the Key' },
                status: { zh: '空间拼图', en: 'Space puzzle' },
                bubble: { zh: '钥匙也跟着转走了？', en: 'Did the key rotate with it?' },
                lines: [
                    { zh: '等等，我刚才看错了吗？你转动那一层的时候，那把钥匙也跟着转走了？！', en: 'Wait, did I see that wrong? When you rotated that layer, the key rotated with it too?!' },
                    { zh: '原来这地方的物品不是固定在半空，而是跟着地板被定义在格子上的？', en: 'So the items here aren\'t fixed in mid-air, but defined on the tiles and ride with the floor?' },
                    { zh: '那我是不是也只是一个可以被你任意拧来拧去的积木？太诡异了……', en: 'So am I just a block that you can twist around at will? Creepy...' }
                ],
                replies: [
                    {
                        face: K.worry,
                        aria: { zh: '担心', en: 'Worried' },
                        tone: 'warm',
                        response: { zh: '行，你慢慢对齐。别等我掉下去才反应过来。', en: 'Fine, take your time aligning it. Just don\'t react only after I fall off.' }
                    },
                    {
                        face: K.steady,
                        aria: { zh: '认真', en: 'Locked in' },
                        tone: 'steady',
                        response: { zh: '感觉你在像拧魔方一样拧我所在的维度。但好歹路通了。', en: 'Feels like you\'re twisting the dimension I\'m in like a Rubik\'s cube. But hey, the path connected.' }
                    },
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '别笑。把路对齐，谢谢！', en: 'Don\'t laugh. Just align the road, thank you!' }
                    }
                ]
            },
            l06Guardian: {
                title: { zh: 'L06 / 黄色保安', en: 'L06 / Yellow Guard' },
                status: { zh: '守卫识别', en: 'Keeper identified' },
                bubble: { zh: '那大家伙在看钥匙。', en: 'That big guy is watching the key.' },
                lines: [
                    { zh: '那个黄色的铁壳怪是什么？它一直绕着钥匙打转……', en: 'What is that yellow iron monster? It keeps circling the key...' },
                    { zh: '它看起来像是这把钥匙的‘贴身保安’。等等！它发现我了！', en: 'Looks like a personal bodyguard for the key. Wait! It spotted me!' },
                    { zh: '它正在朝我挪动，虽然动作有点慢，但被它堵住就完了！', en: 'It\'s moving towards me. Slowly, but if it blocks me, I\'m toast!' }
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.worry,
                        aria: { zh: '担心', en: 'Worried' },
                        tone: 'warm',
                        response: { zh: '别摆出这种脸。引怪这件事听起来危险，是因为它确实危险。', en: 'Don\'t make that face. Luring it sounds dangerous because it actually is.' }
                    },
                    commonReplies.tease
                ]
            },
            l07Split: {
                title: { zh: 'L07 / 碎解阻断', en: 'L07 / Break the Route' },
                status: { zh: '防线建构', en: 'Defense line' },
                bubble: { zh: '等等，把地砸了？', en: 'Wait, smash the ground?' },
                lines: [
                    { zh: '等下，我终端的控制面板上亮起了一个叫『碎解』的东西。', en: 'Wait, a tool called "Break" just lit up on my terminal control panel.' },
                    { zh: '既然那个大家伙只要看到我在同一面就会追上来，我们是不是可以……提前把它的必经之路砸了？', en: 'Since that big guy chases me as long as I\'m on the same face, can we... smash the path in front of him beforehand?' },
                    { zh: '把它隔在虚空另一端，然后我们去拿钥匙。听起来是个暴力拆除的好主意！', en: 'Isolate him on the other side of the void, then grab the key. Sounds like a great demolition plan!' }
                ],
                replies: [
                    {
                        face: K.steady,
                        aria: { zh: '认真', en: 'Locked in' },
                        tone: 'steady',
                        response: { zh: '行，你在终端砸，我在这里负责看它发呆。', en: 'Fine, you break it from your terminal, I\'ll watch him stare blankly from here.' }
                    },
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '别砸到我们站的地方就行。那会变成真正的地狱笑话。', en: 'Just don\'t break the tiles we\'re standing on. That would be a literal tragedy.' }
                    }
                ]
            },
            l08Rage: {
                title: { zh: 'L08 / 钥匙警报', en: 'L08 / Key Alarm' },
                status: { zh: '追击升级', en: 'Threat escalated' },
                bubble: { zh: '钥匙一拿，它急了！', en: 'Grab the key, it panics!' },
                lines: [
                    { zh: '它……它刚才是不是尖叫了一声？', en: 'Did... did it just scream?' },
                    { zh: '我拿到钥匙之后，它的眼睛突然变红了，而且飘得比刚才快了一倍！', en: 'The moment I grabbed the key, its eyes turned red and it started floating twice as fast!' },
                    { zh: '快画线！它疯了一样追过来了！！这把钥匙根本就是个警报器！', en: 'Draw the line! It\'s chasing me like crazy!! This key is literally just an alarm!' }
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.panic,
                        aria: { zh: '紧张', en: 'Nervous' },
                        tone: 'warm',
                        response: { zh: '别慌，路还在。跑快点就行。', en: 'Don\'t panic, the path is still there. Just run faster.' }
                    },
                    commonReplies.tease
                ]
            },
            l09RealRun: {
                title: { zh: 'L09 / 新手毕业', en: 'L09 / Tutorial Ends' },
                status: { zh: '实战开始', en: 'Live run' },
                bubble: { zh: '这回不是开玩笑了。', en: 'No joking around this time.' },
                lines: [
                    { zh: '我感觉得到，前面的关卡像是在测试我们之间的默契。', en: 'I can feel it, the previous levels were testing our coordination.' },
                    { zh: '现在没有指导提示了，红色追击者也变多了。', en: 'Now the hints are gone, and there are more red chasers.' },
                    { zh: '别急着证明你有多聪明，先向我证明我能活着走出去！', en: 'Don\'t rush to prove how smart you are, prove to me that I can walk out of here alive!' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            l10BendRoom: {
                title: { zh: 'L10 / 夹缝突围', en: 'L10 / Pincer Breakout' },
                status: { zh: '隐藏信道', en: 'Hidden channel' },
                bubble: { zh: '两个怪……它们包抄我了！', en: 'Two monsters... they\'re pincering me!' },
                lines: [
                    { zh: '我的终端又收到一个未公开的隐藏测试信号。', en: 'My terminal received another hidden test signal.' },
                    { zh: '两只红色追击者把我夹在中间，而且黄色守卫一开始就往门口靠？', en: 'Two red chasers are pinching me in the middle, and the yellow guard is moving to block the exit?' },
                    { zh: '冷静点，手别抖！找个最致命的关隘把它砸断，不然死定了！', en: 'Stay calm, don\'t let your hand shake! Find the most critical path and smash it, or we\'re dead!' }
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: { zh: '震惊', en: 'Shocked' },
                        tone: 'warm',
                        response: { zh: '找个路窄的地方，在它们合围前砸出一个缺口！', en: 'Find a narrow choke point and smash a gap before they close in!' }
                    },
                    {
                        face: K.steady,
                        aria: { zh: '认真', en: 'Locked in' },
                        tone: 'steady',
                        response: { zh: '切断它们，剩下的交给我用速度解决！', en: 'Cut them off, and leave the rest to me to outrun!' }
                    },
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '对我来说可不是什么好玩的挑战，手点稳点！', en: 'Not exactly a fun challenge for me. Keep your clicks steady!' }
                    }
                ]
            },
            l11LureLock: {
                title: { zh: 'L11 / 预判守门', en: 'L11 / Gate Block Predict' },
                status: { zh: '门线危险', en: 'Door lane danger' },
                bubble: { zh: '那家伙居然守在门口！', en: 'That guy is guarding the exit!' },
                lines: [
                    { zh: '那黄色怪物居然不仅盯着钥匙，它好像知道门在哪里！', en: 'That yellow monster isn\'t just staring at the key, it seems to know where the door is!' },
                    { zh: '这地表能转，能不能想办法在它彻底把门口堵死之前，把它拧到别的面去？', en: 'The floor is rotatable. Can we twist it to another face before it chokes the exit?' },
                    { zh: '拿钥匙前，先帮我想好退路！', en: 'Before grabbing the key, plan my retreat path first!' }
                ],
                replies: [
                    commonReplies.worry,
                    commonReplies.steady,
                    commonReplies.tease
                ]
            },
            l12FinalePrep: {
                title: { zh: 'L12 / 最后的门？', en: 'L12 / The Final Door?' },
                status: { zh: '第一幕终局', en: 'Act I Finale' },
                bubble: { zh: '终于……门开了！', en: 'Finally... the door opened!' },
                lines: [
                    { zh: '这扇门后面看起来一片安静。安静得很可疑。', en: 'It looks quiet behind this door. Suspicously quiet.' },
                    { zh: '不管怎么说，我们要离开这一层了。', en: 'Regardless, we\'re leaving this layer.' },
                    { zh: '如果这扇门后面不是出口……你绝对不许笑！', en: 'If the door doesn\'t lead outside... you are absolutely not allowed to laugh!' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            l13OuterShell: {
                title: { zh: 'L13 / 外壳醒来', en: 'L13 / Outer Shell Wakes' },
                status: { zh: '第二幕接入', en: 'Act II online' },
                bubble: { zh: '……门后是更大的魔方。', en: '...It\'s a bigger cube behind the door.' },
                lines: [
                    { zh: '果然门后面不是什么出口……我们只是一颗更大魔方上的灰尘罢了。', en: 'Of course the door wasn\'t an exit... we\'re just specks of dust on a larger cube.' },
                    { zh: '外壳展开后，格子变成了 4x4。路中间居然出现了断裂的漆黑缺口。', en: 'The shell expanded to 4x4. And there are broken pitch-black gaps in the path.' },
                    { zh: '不过我终端上亮起了一个叫『补片』的工具。这地板……它能用贴纸补上？', en: 'But a tool called "Patch" lit up on my terminal. Can we... patch this floor with stickers?' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '你也觉得这地方补天很离谱吧？行，用它铺路试试。', en: 'You think patching the sky here is ridiculous too? Fine, let\'s try building a path.' }
                    }
                ]
            },
            l14FourRotate: {
                title: { zh: 'L14 / 宽场夹击', en: 'L14 / Wide Pincer' },
                status: { zh: '宽场追击', en: 'Wide-field chase' },
                bubble: { zh: '空间变大，怪物也包抄我。', en: 'Board got bigger, monsters are surrounding me.' },
                lines: [
                    { zh: '好吧，我收回刚才的话。面积变大并不好玩。', en: 'Okay, I take it back. A larger area isn\'t fun.' },
                    { zh: '两只追击者隔空包抄我。别复读三阶那种小步挪法了。', en: 'Two chasers are flanking me. Don\'t replay the 3x3 tiny step strategies.' },
                    { zh: '这里空间宽一点，我们得在更宽的面上“换线”避开它们！', en: 'The space is wider here, we have to "change lanes" on a wider surface to dodge them!' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '你要是看错层把我拧进怪里，我就记恨你一辈子。', en: 'If you read the layers wrong and twist me into a monster, I\'ll hate you forever.' }
                    }
                ]
            },
            l15FourChase: {
                title: { zh: 'L15 / 宽场遛锁', en: 'L15 / Kite the Keeper' },
                status: { zh: '守钥追击', en: 'Keeper pursuit' },
                bubble: { zh: '锁变聪明了？', en: 'Did the lock get smart?' },
                lines: [
                    { zh: '在 4x4 的大面上，守钥者看起来有更多空档可以绕。', en: 'On a 4x4 face, the keeper seems to leave more gaps to loop around.' },
                    { zh: '但别忘了，空间大了，追击者绕过我的路线也变多了。', en: 'But don\'t forget, with more space, the chasers have more paths to flank me.' },
                    { zh: '在空旷的地方遛它，别跑进死胡同里！', en: 'Kite it in the open areas, don\'t run into a dead end!' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '你笑得像是心里有数。行，指路吧。', en: 'You smile like you have a plan. Fine, point the way.' }
                    }
                ]
            },
            l16FoldBridge: {
                title: { zh: 'L16 / 空间折跃', en: 'L16 / Space Jump' },
                status: { zh: '传送接入', en: 'Portal linked' },
                bubble: { zh: '蓝色圈圈……是门吗？', en: 'Blue rings... is it a door?' },
                lines: [
                    { zh: '等下，我两边脚下亮起了两个泛着蓝光的传送圆环。', en: 'Wait, two glowing blue teleportation rings just lit up on both sides.' },
                    { zh: '它们好像把空间直接对折了，踩进去能瞬间飞到另一端。', en: 'They seem to fold space directly. Stepping in teleports me to the other side instantly.' },
                    { zh: '好消息是能抄捷径，坏消息是——希望我被传送过去时零件还是全的。', en: 'The good news is we can take shortcuts. The bad news... hopefully I teleport in one piece.' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '你又笑。你确定对面没有守卫蹲着等我吗？', en: 'You\'re laughing again. Are you sure there isn\'t a guard waiting for me on the other side?' }
                    }
                ]
            },
            l17PortalChase: {
                title: { zh: 'L17 / 门后惊魂', en: 'L17 / Door Shock' },
                status: { zh: '传送追击', en: 'Portal pursuit' },
                bubble: { zh: '门边还有个红光怪！', en: 'There\'s a red monster by the portal!' },
                lines: [
                    { zh: '传送门虽然能抄近道，但那个红色追击者就守在门旁边。', en: 'Teleportation portals are nice shortcuts, but that red chaser is guarding right next to the portal.' },
                    { zh: '如果我冒失穿过去，大概会直接撞进它怀里。', en: 'If I jump through blindly, I\'ll walk right into its embrace.' },
                    { zh: '仔细算好脚步，让它背对着我的时候再钻！', en: 'Calculate the steps carefully. Step through only when its back is turned!' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '要是被抓住了，我一定会从终端里爬出来找你算账。', en: 'If I get caught, I\'ll crawl out of the terminal and settle the score.' }
                    }
                ]
            },
            l18BridgeExam: {
                title: { zh: 'L18 / 双面传送门', en: 'L18 / Two-way Portals' },
                status: { zh: '折叠压测', en: 'Fold stress test' },
                bubble: { zh: '两个追击者夹击……', en: 'Two chasers flanking...' },
                lines: [
                    { zh: '这次两个怪物一左一右包抄，传送门也分成了两对。', en: 'This time two monsters are flanking from left and right, and portals are split into two pairs.' },
                    { zh: '我们需要先拧层改变传送门的位置，再折跃逃跑。', en: 'We need to twist the layer to change portal positions first, then jump to escape.' },
                    { zh: '这根本就是个空间拼图！别发呆，快动脑子。', en: 'This is literally a spatial puzzle! Don\'t space out, use your brain.' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '“问题不大”是吧？行，我信你，这次。', en: '"No big deal" right? Fine, I\'ll trust you, for now.' }
                    }
                ]
            },
            l19Void: {
                title: { zh: 'L19 / 空洞悬崖', en: 'L19 / Void Cliffs' },
                status: { zh: '地面缺失', en: 'Missing floor' },
                bubble: { zh: '那大片空格是深渊。', en: 'Those empty tiles are an abyss.' },
                lines: [
                    { zh: '前面碎了非常多格子，连成了一片深渊。', en: 'Many tiles ahead are broken, forming an abyss.' },
                    { zh: '好消息是怪物也跨不过去，坏消息是我们也没有直达的路了。', en: 'Good news is the monsters can\'t cross it either. Bad news is we have no direct route left.' },
                    { zh: '我们得贴着边缘绕行，别把我画到悬崖外面去！', en: 'We have to loop around the edge. Don\'t draw my line off the cliff!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l20VoidRotate: {
                title: { zh: 'L20 / 偏转悬崖', en: 'L20 / Rotating Abysses' },
                status: { zh: '破面偏转', en: 'Broken-face drift' },
                bubble: { zh: '洞也跟着转啊！', en: 'The hole rotates too!' },
                lines: [
                    { zh: '当我以为缺口只是障碍时，你拧层居然连缺口也一起拧走了！', en: 'Just when I thought the gaps were only obstacles, you twisted the layer and rotated the gaps too!' },
                    { zh: '不过把缺口转到怪物脚下，好像能直接把它们堵死？', en: 'But rotating the gap under a monster\'s feet seems to block them completely?' },
                    { zh: '很好，第一次觉得这地方的垃圾建筑有点用处。', en: 'Great. First time feeling the garbage architecture here has a use.' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l21Patch: {
                title: { zh: 'L21 / 铺路演练', en: 'L21 / Bridge Patching' },
                status: { zh: '一次性地面', en: 'One-use floor' },
                bubble: { zh: '这纸糊的地板靠谱吗？', en: 'Is this paper-thin floor safe?' },
                lines: [
                    { zh: '这块补片铺上去之后，我一走过去它就会碎掉。', en: 'Once this patch is placed, it will crumble the moment I step off.' },
                    { zh: '这代表后面的怪物也过不来，算是个一次性防御桥梁。', en: 'Which means the monsters behind can\'t cross either. A one-time defensive bridge.' },
                    { zh: '用它把前面的孤岛钥匙连起来！', en: 'Use it to connect the isolated key ahead!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l22BrokenCorner: {
                title: { zh: 'L22 / 角落残局', en: 'L22 / Corner Endgame' },
                status: { zh: '缺角遛锁', en: 'Corner-cut kiting' },
                bubble: { zh: '角被咬掉了，路更窄。', en: 'The corner is bitten off, narrower road.' },
                lines: [
                    { zh: '这个魔方缺了一整个角，路线变得非常狭窄。', en: 'This cube is missing an entire corner, making the route extremely narrow.' },
                    { zh: '我和怪物都只能在独木桥上挤。你必须通过旋转改变对齐方式。', en: 'The monster and I are squeezed on a single plank. You must rotate to change alignment.' },
                    { zh: '别让我和它在死角里撞衫。', en: 'Just don\'t let me corner-block with it.' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l23Beacon: {
                title: { zh: 'L23 / 诱饵调度', en: 'L23 / Baiting Control' },
                status: { zh: '敌人调度', en: 'Enemy scheduling' },
                bubble: { zh: '我们来耍一下它。', en: 'Let\'s trick it.' },
                lines: [
                    { zh: '那个红光怪物把出路堵得死死的。直接走是送货上门。', en: 'That red light monster is choking the exit. Walking straight in is delivery service.' },
                    { zh: '但我手上的终端亮起了『诱饵信标』。扔出去它就会傻傻挪过去。', en: 'But the "Decoy Beacon" lit up on my terminal. Throw it and it dumbly moves towards it.' },
                    { zh: '把它引开，别让它注意到我！', en: 'Bait it away, don\'t let it spot me!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l24BrokenExam: {
                title: { zh: 'L24 / 工具大混战', en: 'L24 / Tool Mayhem' },
                status: { zh: '工具混合', en: 'Tool mix' },
                bubble: { zh: '补片和信标，别按错。', en: 'Patch and beacon, don\'t misclick.' },
                lines: [
                    { zh: '这次缺口、补片、信标全都在控制面板上亮了。', en: 'This time, gaps, patches, and beacons are all active on the panel.' },
                    { zh: '我先警告你，胡乱按一通只会让我死得很有节奏感。', en: 'I warning you, mashing buttons will only make me die in a rhythmic fashion.' },
                    { zh: '看清它们的动作，先引诱，再铺路逃跑！', en: 'Watch their moves. Bait first, then patch to escape!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l25DoublePortal: {
                title: { zh: 'L25 / 多维选路', en: 'L25 / Multi-dimensional Paths' },
                status: { zh: '多门判断', en: 'Multi-portal read' },
                bubble: { zh: '两个门，通向哪里？', en: 'Two doors, leading where?' },
                lines: [
                    { zh: '场上有两个不同颜色的传送门，各自连着不同的折叠面。', en: 'There are two different-colored portals on the board, leading to different folded faces.' },
                    { zh: '进错门就会直接被怪物迎面撞飞。', en: 'Stepping into the wrong one gets me vaporized by a monster.' },
                    { zh: '看清楚出口线的终点，别走错！', en: 'Trace the exit route to its end, don\'t mess up!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l26PatchTail: {
                title: { zh: 'L26 / 过河拆桥', en: 'L26 / Burn the Bridge' },
                status: { zh: '补片断追', en: 'Patch cuts pursuit' },
                bubble: { zh: '铺路，走完，碎掉。', en: 'Patch, walk, shatter.' },
                lines: [
                    { zh: '这次追击者追得太紧了。', en: 'The chasers are too close this time.' },
                    { zh: '我们必须利用补片踩完即碎的特性，在逃跑时“断尾”！', en: 'We must use the step-and-break patch to "cut the tail" as we escape!' },
                    { zh: '把桥踩断，看它们在悬崖对岸急得直打转！', en: 'Break the bridge, and watch them panic on the other side of the cliff!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l27BeaconGuard: {
                title: { zh: 'L27 / 骗走门卫', en: 'L27 / Trick the Guard' },
                status: { zh: '骗开守钥者', en: 'Bait the keeper away' },
                bubble: { zh: '把那个大黄色引开。', en: 'Lure that big yellow guy away.' },
                lines: [
                    { zh: '那个黄色保安堵在必经之路上。', en: 'That yellow guard is blocking the path.' },
                    { zh: '把信标丢到死角，骗它转头挪开。', en: 'Throw the beacon into a dead corner to trick it into looking away.' },
                    { zh: '只要它挪开一格，我就能直接抢进内圈！', en: 'As long as it moves one tile, I can sprint into the inner circle!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l28VoidPortal: {
                title: { zh: 'L28 / 深渊传送', en: 'L28 / Abyss Teleport' },
                status: { zh: '破面捷径', en: 'Broken-face shortcut' },
                bubble: { zh: '没路了，只能传送。', en: 'No path left, portal only.' },
                lines: [
                    { zh: '前面的整条路都被悬崖撕开了，常规画线根本通不过。', en: 'The entire road ahead is torn by a cliff. Regular paths won\'t connect.' },
                    { zh: '我们必须利用传送门实现跨深渊的“折跃”。', en: 'We must use portals to execute a cross-abyss jump.' },
                    { zh: '这地方逼我学会飞。虽然只是传送的那种飞。', en: 'This place is forcing me to learn how to fly. Well, teleportation-flying.' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l29PatchGate: {
                title: { zh: 'L29 / 终点补路', en: 'L29 / Final Tile Patch' },
                status: { zh: '撤离线', en: 'Escape line' },
                bubble: { zh: '补片必须留到最后。', en: 'The patch must be saved.' },
                lines: [
                    { zh: '这里缺口很多，但我们的补片次数非常有限。', en: 'Many gaps here, but our patch charges are very limited.' },
                    { zh: '别在前面乱花。如果把补片用完了，门口的断桥我们拿头过去？', en: 'Don\'t waste them early. If we run out, how are we crossing the broken bridge at the exit?' },
                    { zh: '看准逃跑的最后一格再补！', en: 'Save the patch for the final step of the escape!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l30PortalPincer: {
                title: { zh: 'L30 / 门端夹击战', en: 'L30 / Portal Flank Fight' },
                status: { zh: '门端夹击', en: 'Portal-end pincer' },
                bubble: { zh: '传送门另一端有怪！', en: 'Monster at portal exit!' },
                lines: [
                    { zh: '两个追击者从两头堵门，逼我们必须钻门。', en: 'Two chasers are blocking the paths, forcing us to use the portal.' },
                    { zh: '但是门另一端也守着一只。这根本就是个双头陷阱！', en: 'But another chaser is guarding the exit. This is a double-ended trap!' },
                    { zh: '转动空间，把门那一端的怪转走再穿！', en: 'Twist the space to rotate the monster away from the exit before jumping!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l31VoidLock: {
                title: { zh: 'L31 / 把悬崖当盾牌', en: 'L31 / Shielding Abyss' },
                status: { zh: '缺口调位', en: 'Gap positioning' },
                bubble: { zh: '把悬崖转过去挡住它们。', en: 'Twist the abyss to block them.' },
                lines: [
                    { zh: '这一关我们要把破碎的悬崖拧过去，变成阻挡敌人的墙。', en: 'This level we need to twist the broken abyss to act as a wall against enemies.' },
                    { zh: '如果路连不通，就把怪物的路直接断掉。', en: 'If the route won\'t connect, cut the monster\'s route instead.' },
                    { zh: '只要我过得去，它们过不来，那就算我们赢。', en: 'As long as I can cross and they can\'t, we win.' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l32BeaconPortal: {
                title: { zh: 'L32 / 诱引跳跃', en: 'L32 / Lure and Leap' },
                status: { zh: '骗一拍再穿', en: 'Bait, then portal' },
                bubble: { zh: '先丢信标，再进门。', en: 'Throw beacon first, then enter.' },
                lines: [
                    { zh: '怪死死守在传送门出口。', en: 'The monster is camping the portal exit.' },
                    { zh: '往反方向丢一个诱饵，引开它的一瞬间，我们直接穿门跑路！', en: 'Throw a decoy in the opposite direction. The moment it turns away, we warp!' },
                    { zh: '时机要抓得极其精准，别慢了！', en: 'The timing has to be split-second. Don\'t lag!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l33PatchPortal: {
                title: { zh: 'L33 / 补路折跃', en: 'L33 / Patch & Warp' },
                status: { zh: '补洞接门', en: 'Patch into portal' },
                bubble: { zh: '先补上地，再穿门。', en: 'Patch the floor first, then warp.' },
                lines: [
                    { zh: '传送门浮在一个孤立的碎格子上。', en: 'The portal is floating on an isolated broken tile.' },
                    { zh: '我必须先在它脚下补上一块地板，才能踩进传送阵里。', en: 'I must patch a floor under it first before I can step into the portal.' },
                    { zh: '动作要快，怪已经到背后了！', en: 'Be quick, the monsters are right behind us!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l34PortalTrap: {
                title: { zh: 'L34 / 传送迷宫', en: 'L34 / Teleport Maze' },
                status: { zh: '门序判断', en: 'Portal order read' },
                bubble: { zh: '门很多，走错就死。', en: 'Many portals, wrong choice is death.' },
                lines: [
                    { zh: '这层摆了四五个传送门，像个大型万花筒。', en: 'This layer has four or five portals, like a giant kaleidoscope.' },
                    { zh: '绝对不能闭着眼睛乱进，有的门通往出口，有的门通往怪物嘴里。', en: 'You absolutely cannot blindly enter. Some lead to the exit, some lead to a monster\'s mouth.' },
                    { zh: '在大脑里把路线理清楚再走！', en: 'Trace the path in your head before moving!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l35VoidGate: {
                title: { zh: 'L35 / 绝境防线', en: 'L35 / Desperate Line' },
                status: { zh: '门线被抢', en: 'Door lane contested' },
                bubble: { zh: '它狂暴以后要抢门！', en: 'It\'s going to rush the door after key!' },
                lines: [
                    { zh: '钥匙拿到后，那只大黄色守门怪会以两格的速度抄近道去堵出口。', en: 'After picking up the key, the yellow guard will rush the door at 2-tile speed.' },
                    { zh: '加上地表缺口，我们撤离的路线只有一条。', en: 'With the floor gaps, there is only one exit route.' },
                    { zh: '必须提前计算好它的合围时间，手画路线绝对不能出错！', en: 'Calculate its intercept time beforehand. The path must be perfect!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l36BeaconPincer: {
                title: { zh: 'L36 / 诱引夹击者', en: 'L36 / Distract Chasers' },
                status: { zh: '夹击诱导', en: 'Pincer baiting' },
                bubble: { zh: '用信标调度两只怪。', en: 'Use the beacon to redirect both.' },
                lines: [
                    { zh: '两只红色追击者把我卡在角落。', en: 'Two red chasers have me pinned in a corner.' },
                    { zh: '把信标丢在它们合流的地方，一次性改变两者轨道！', en: 'Throw the beacon at their intersection point to change both paths at once!' },
                    { zh: '只要争取到这一回合，就能直接溜出重围！', en: 'Gain just this one turn, and we can slip out!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l37PatchExam: {
                title: { zh: 'L37 / 终极铺路', en: 'L37 / Ultimate Patching' },
                status: { zh: '唯一补片', en: 'One patch only' },
                bubble: { zh: '别把桥铺错了。', en: 'Don\'t patch the wrong bridge.' },
                lines: [
                    { zh: '这里只有一个空位可以补，而且补完之后怪会从别处包抄。', en: 'There is only one gap we can patch, and once patched, monsters flank from elsewhere.' },
                    { zh: '这代表铺路不仅是为了我，也是在给怪搭桥。', en: 'Which means patching isn\'t just for me, it build a bridge for them too.' },
                    { zh: '想清楚哪条桥最安全！', en: 'Figure out which bridge is safest!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l38PortalGuard: {
                title: { zh: 'L38 / 门后拉扯', en: 'L38 / Gateway Kiting' },
                status: { zh: '钓开守卫', en: 'Lure the keeper off' },
                bubble: { zh: '利用传送门遛大黄色。', en: 'Use the portal to kite the big yellow guy.' },
                lines: [
                    { zh: '黄色保安死守在出口的传送门上。', en: 'The yellow guard is camped on the exit portal.' },
                    { zh: '我先去反方向把它钓出来，你再通过传送门把我拉回去！', en: 'I\'ll draw it out in the opposite direction, then you warp me back through portals!' },
                    { zh: '听起来像战术，可别把我当风筝放飞了！', en: 'Sounds like a tactic. Just don\'t snap the string!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l39BeaconExam: {
                title: { zh: 'L39 / 诱引大考', en: 'L39 / Decoy Exam' },
                status: { zh: '诱饵考试', en: 'Beacon exam' },
                bubble: { zh: '这是最后一关诱引了。', en: 'This is the final decoy test.' },
                lines: [
                    { zh: '这一关的追击者和守卫混合分布。诱饵必须在最关键的回合调动核心敌人。', en: 'Chasers and guards are mixed here. Decoys must redirect the key threat at the critical turn.' },
                    { zh: '一旦用错时机，就没有任何挽回余地。', en: 'Misuse the timing and there\'s no room for recovery.' },
                    { zh: '别慌，盯着全局图，看清楚它们的威胁线！', en: 'Don\'t panic. Watch the map and read the threat lines!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l40ActTwoFinale: {
                title: { zh: 'L40 / 终点大门', en: 'L40 / The Final Exit' },
                status: { zh: '第二幕终局', en: 'Act II finale' },
                bubble: { zh: '这扇门，会是出口吗？', en: 'Will this door be the exit?' },
                lines: [
                    { zh: '我们终于又走到一扇终点大门前了。', en: 'We finally reached another exit door.' },
                    { zh: '虽然我已经不太相信门了，但我们没有别的选择。', en: 'Though I don\'t really trust doors anymore, we have no other choice.' },
                    { zh: '你看好轴向，我踩稳最后一步。要是门后面还是魔方，我真的要崩溃了！', en: 'Watch the rotation axis, I\'ll step the final step. If it\'s more cube behind the door, I\'m going to lose it!' }
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            eventKeyCollected: {
                title: { zh: '钥匙已取得', en: 'Key Secured' },
                status: { zh: '权限到手', en: 'Permission grabbed' },
                bubble: { zh: '拿到了。快走快走。', en: 'Got it. Move, move.' },
                lines: [
                    { zh: '拿到了。', en: 'Got it.' },
                    { zh: '等一下，这地方刚才是不是抖了一下？', en: 'Wait. Did the cube just twitch?' },
                    { zh: '别站着研究。门。现在。', en: 'Do not study it. Door. Now.' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            eventFirstRotation: {
                title: { zh: '首次旋转', en: 'First Twist' },
                status: { zh: '空间锁定', en: 'Space locked' },
                bubble: { zh: '你真的拧了？', en: 'You actually twisted it?' },
                lines: [
                    { zh: '卧槽，你居然能直接转动这个空间？！', en: 'Oh my god, you can actually rotate this space?!' },
                    { zh: '我的胃现在还在半空中，下次转之前能不能提前打个招呼？！', en: 'My stomach is still in mid-air. Can you give me a heads-up before rotating next time?!' },
                    { zh: '不过……路确实接上了，行吧，如果你能带路，我暂时假装自己很冷静。', en: 'But... the path did connect. Fine, if you can guide, I\'ll pretend to be calm for now.' }
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.tease,
                        aria: { zh: '坏笑', en: 'Smirk' },
                        tone: 'tease',
                        response: { zh: '你这个表情不太值得信任。手机，帮我记一下。', en: 'That face is not trustworthy. Phone, log this.' }
                    },
                    commonReplies.worry
                ]
            },
            eventGuardianRage: {
                title: { zh: '守钥者狂暴', en: 'Keeper Enraged' },
                status: { zh: '追击升级', en: 'Threat escalated' },
                bubble: { zh: '它急了。它真的急了。', en: 'It is mad. Very mad.' },
                lines: [
                    { zh: '它……它刚才是不是尖叫了一声？', en: 'Did... did it just scream?' },
                    { zh: '我拿到钥匙之后，它的眼睛突然变红了，而且飘得比刚才快了一倍！', en: 'The moment I grabbed the key, its eyes turned red and it started floating twice as fast!' },
                    { zh: '快画线！它追过来了！！这把钥匙根本就是个警报器！', en: 'Draw the line! It\'s chasing me like crazy!! This key is literally just an alarm!' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            eventGameOver: {
                title: { zh: '断线回滚', en: 'Link Rolled Back' },
                status: { zh: '信号抖动', en: 'Signal shaking' },
                bubble: { zh: '……我刚才是不是没了？', en: '...Did I just disappear?' },
                lines: [
                    { zh: '……我刚才是不是断线没了？', en: '...Did I just lose connection and disappear?' },
                    { zh: '手机弹窗说可以回滚到上一回合。说得像刚才不疼一样。', en: 'The phone says we can rollback. Speaks as if that didn\'t hurt.' },
                    { zh: '重来可以。但求求你，别把我当无辜的试验品乱送，好吗？', en: 'We can retry. But please, don\'t feed me to monsters like a test subject, okay?' }
                ],
                replies: [
                    {
                        face: K.worry,
                        aria: { zh: '抱歉', en: 'Sorry' },
                        tone: 'warm',
                        response: { zh: '这个表情我收到了。别道歉太久，路还在。', en: 'I got that face. Do not apologize forever. The route is still there.' }
                    },
                    commonReplies.steady,
                    {
                        face: K.quiet,
                        aria: { zh: '沉默', en: 'Silence' },
                        tone: 'warm',
                        response: { zh: '嗯。沉默也算一种回答。', en: 'Yeah. Silence counts as an answer.' }
                    }
                ]
            },
            eventNormalVictory: {
                title: { zh: '门开了', en: 'Door Open' },
                status: { zh: '短暂安全', en: 'Briefly safe' },
                bubble: { zh: '门开了。先别得意。', en: 'Door opened. Do not get smug.' },
                lines: [
                    { zh: '呼……总算过来了。门开了。', en: 'Whew... made it through. The door opened.' },
                    { zh: '我承认，你这次带路指引得还行。', en: 'I admit, your guidance was decent this time.' },
                    { zh: '只许高兴三秒。三、二……算了，先让我喘口气，前面还不知道有什么。', en: 'You get three seconds to celebrate. Three, two... never mind, let me catch my breath.' }
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.tease,
                    {
                        face: K.cheer,
                        aria: { zh: '庆祝', en: 'Celebrate' },
                        tone: 'warm',
                        response: { zh: '别庆祝得太明显，我会以为我们真的安全了。', en: 'Do not celebrate too loudly. I might start believing we are safe.' }
                    }
                ]
            },
            eventActFinale: {
                title: { zh: '第一幕结尾', en: 'Act I Ending' },
                status: { zh: '外壳展开', en: 'Outer shell opened' },
                bubble: { zh: '门后不是外面。', en: 'The door is not outside.' },
                lines: [
                    { zh: '门后不是外面……是更大的立方体！', en: 'It\'s not outside behind the door... it\'s a bigger cube!' },
                    { zh: '这根本不是什么牢房，是个在不断学习我们路线的折叠迷宫！', en: 'This isn\'t a cell, it\'s a folding maze that learns from our escape routes!' },
                    { zh: '它在进化……别摆出那种无能为力的表情，我们还没死呢。继续！', en: 'It\'s learning... don\'t make that helpless face, we aren\'t dead yet. Let\'s go!' }
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: { zh: '震惊', en: 'Shocked' },
                        tone: 'warm',
                        response: { zh: '对，就是这个表情。我也不喜欢“更大的立方体”这几个字。', en: 'Yes, that face. I also hate the phrase “bigger cube.”' }
                    },
                    commonReplies.steady,
                    {
                        face: K.tease,
                        aria: { zh: '吐槽', en: 'Snark' },
                        tone: 'tease',
                        response: { zh: '你还笑。很好，外侧的人胆子挺大。先别让我后悔这么说。', en: 'You are still laughing. Bold for someone outside the cube. Do not make me regret saying that.' }
                    }
                ]
            }
        }
    };
})();
