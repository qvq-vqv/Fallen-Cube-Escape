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

    const commonReplies = {
        steady: {
            face: K.steady,
            aria: '认真回应',
            tone: 'steady',
            response: '行。你先别乱画，我先别摔下去。我们都成熟一点。'
        },
        worry: {
            face: K.worry,
            aria: '担心回应',
            tone: 'warm',
            response: '别那副表情。我还站着呢。虽然我也不知道这算不算好消息。'
        },
        tease: {
            face: K.tease,
            aria: '吐槽回应',
            tone: 'tease',
            response: '你笑什么？好，记下了。等我出去再和你讲道理。'
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
            kicker: '第一幕 / 坠入',
            title: 'Dawn 接入',
            frames: [
                {
                    no: '01',
                    title: '……',
                    text: '我刚才在床上。灯还没关，手机在响。然后床像折纸一样塌下去了。'
                },
                {
                    no: '02',
                    title: '等一下。',
                    text: '你是谁？为什么我手机上有你的信号？你能看见我？'
                },
                {
                    no: '03',
                    title: '别指挥我。',
                    text: '那条发光线是你画的？我不认识你，也不打算随便跟着陌生人走。'
                },
                {
                    no: '04',
                    title: '……但我想回家。',
                    text: '如果你真能带路，先证明你不会害死我。画短一点。'
                }
            ],
            startFace: K.steady,
            skipFace: K.panic
        },
        scenes: {
            wakeSignal: {
                title: 'Dawn / 陌生来电',
                status: '信号发抖',
                bubble: '你到底是谁？',
                lines: [
                    '……我不是在做梦吧。',
                    '我刚才还在床上。灯没关，手机在响，然后床像被谁折起来了。',
                    '现在我站在一个会发光的方块上。很好，物理也开始摆烂。',
                    '你是谁？为什么我的手机能收到你的信号？',
                    '那条线是你画的？先别自信。我还没决定要不要听一个陌生人的。'
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: '震惊',
                        tone: 'warm',
                        response: '很好，你也不知道。这个回答很糟，但至少不像骗子。'
                    },
                    commonReplies.steady,
                    commonReplies.worry
                ]
            },
            l01Route: {
                title: 'L01 / 线',
                status: '最低信任',
                bubble: '这条线是你画的？',
                lines: [
                    '等下，我脚边真的出现了一条线。',
                    '我还是不信你。但这地方更不值得信。',
                    '先走一小段。你要是把我带进奇怪东西里，我会骂得很难听。'
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.nod,
                        aria: '点头',
                        tone: 'steady',
                        response: '别点得这么理所当然。你现在只是“可疑但暂时有用”。'
                    },
                    commonReplies.tease
                ]
            },
            l02Key: {
                title: 'L02 / 钥匙',
                status: '目标确认',
                bubble: '那是钥匙吧？应该吧？',
                lines: [
                    '那边有个钥匙形状的东西。',
                    '我知道这听起来像废话，但在这个地方，长得像钥匙已经是很高的可信度了。',
                    '先拿它，再看那扇门会不会讲点人话。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '你也觉得这里很离谱吧？好，我们至少审美还在同一边。'
                    }
                ]
            },
            l03Chaser: {
                title: 'L03 / 红格',
                status: '威胁接近',
                bubble: '先看红格。',
                lines: [
                    '红色不是气氛灯。它是它们下一步会踩到的地方。',
                    '它们不聪明，甚至有点死板。问题是，死板的东西最难求情。',
                    '所以别赌它会犯傻。它不会。它只是照规则来抓我。'
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.panic,
                        aria: '紧张',
                        tone: 'warm',
                        response: '别紧张。好吧，可以紧张一点，但别把线画到红格里。'
                    },
                    commonReplies.tease
                ]
            },
            l04Rotation: {
                title: 'L04 / 拧世界',
                status: '空间异常',
                bubble: '等下，你拧了什么？',
                lines: [
                    '停。刚才不是我走了，是整个地方被你拧了一下。',
                    '我胃里现在有一场小型抗议。',
                    '但……确实有用。所以你能动的不只是线，对吧？'
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: '震惊',
                        tone: 'warm',
                        response: '你也吓到了？很好，我不是唯一一个想投诉物理的人。'
                    },
                    commonReplies.steady,
                    commonReplies.tease
                ]
            },
            l05MovingKey: {
                title: 'L05 / 旋转小考',
                status: '空间拼图',
                bubble: '断开的路还能连上？',
                lines: [
                    '等一下，这个面中间被切出了一大条漆黑的虚空。',
                    '直接走过去的话，我就只能在虚空里玩自由落体了。',
                    '你能旋转一下中间那一层吗？找个完整的格子把我对面的路接上。'
                ],
                replies: [
                    {
                        face: K.worry,
                        aria: '别催，我已经在对齐路线了。',
                        tone: 'warm',
                        response: '行，对齐了叫我。别等我掉下去才反应过来。'
                    },
                    {
                        face: K.steady,
                        aria: '旋转已就绪，走你。',
                        tone: 'steady',
                        response: '感觉你在像拧螺丝一样拧我所在的维度。但好歹路通了。'
                    },
                    {
                        face: K.tease,
                        aria: '体验一把悬空飞车？',
                        tone: 'tease',
                        response: '飞车留给你自己。把路对齐，谢谢！'
                    }
                ]
            },
            l06Guardian: {
                title: 'L06 / 守钥者',
                status: '守卫识别',
                bubble: '它在看钥匙。',
                lines: [
                    '那个黄色的家伙不是堵钥匙，它在看钥匙。',
                    '我靠近同一面，它就会追我一步。像保安听见门口有人咳嗽。',
                    '也就是说，我可以引它。注意，我说的是可以，不是我喜欢。'
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.worry,
                        aria: '心疼',
                        tone: 'warm',
                        response: '别摆出这种脸。引怪这件事听起来危险，是因为它确实危险。'
                    },
                    commonReplies.tease
                ]
            },
            l07Split: {
                title: 'L07 / 碎解阻断',
                status: '防线建构',
                bubble: '等等，把格子砸了？',
                lines: [
                    '等下，我终端的控制面板上亮起了一个叫『碎解』的东西。',
                    '你可以把某个正常的格子彻底打碎变成虚空。听起来是个破坏狂的好消息。',
                    '既然守卫只要看到我在同一面就会追上来，我们是不是可以……提前把它的必经之路打碎？',
                    '让它被虚空隔在另一端，我们去拿钥匙。'
                ],
                replies: [
                    {
                        face: K.steady,
                        aria: '计划通！看我把它隔绝在对岸。',
                        tone: 'steady',
                        response: '行，你在控制台敲回车，我在这里负责看它发呆。'
                    },
                    {
                        face: K.tease,
                        aria: '听起来你也很喜欢暴力拆除嘛。',
                        tone: 'tease',
                        response: '这叫“战术地形重塑”。我只是想安全拿到钥匙。'
                    },
                    {
                        face: K.nod,
                        aria: '收到，砸哪个格子听你的。',
                        tone: 'steady',
                        response: '别砸到我们站的地方就行。那会变成真正的地狱笑话。'
                    }
                ]
            },
            l08Rage: {
                title: 'L08 / 报警器',
                status: '钥匙警报',
                bubble: '钥匙一拿，它急了。',
                lines: [
                    '我刚碰到钥匙，它就像听见下班铃一样突然认真。',
                    '所以钥匙不是奖励，是报警器。拿到它只是开始撤离，不是开始庆祝。',
                    '你要是想庆祝，可以等我不在红格旁边的时候。'
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.panic,
                        aria: '紧张',
                        tone: 'warm',
                        response: '对，就是这个表情。现在请把这个表情变成路线。'
                    },
                    commonReplies.tease
                ]
            },
            l09RealRun: {
                title: 'L09 / 真题',
                status: '实战开始',
                bubble: '这次不是教学。',
                lines: [
                    '我感觉得到，前面那些像是在教你怎么操作我。',
                    '这句听起来很糟。换个说法：它们在教我们怎么一起活下来。',
                    '现在追击者变多了。别急着证明你很聪明，先证明我能活着。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            l10BendRoom: {
                title: 'L10 / 隐藏考：碎解突围',
                status: '隐藏信道',
                bubble: '这个隐藏信号是什么？',
                lines: [
                    '我的终端收到一个未公开的隐藏测试信号。',
                    '……不对劲。两只红色追击者，而且那个黄色守卫一开始就往门口靠？',
                    '这是故意要把我逼进绝路。',
                    '我们只有一次碎解地板的机会。你必须要找个最致命的关隘把它砸断！'
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: '玩得这么大？',
                        tone: 'warm',
                        response: '别感叹了！你看展开图，找个路窄的地方，在它们合围前砸出一个缺口！'
                    },
                    {
                        face: K.steady,
                        aria: '冷静，找好瓶颈点，一击必杀。',
                        tone: 'steady',
                        response: '说得好！把那条路切断，接下来我跟它们拼速度。'
                    },
                    {
                        face: K.tease,
                        aria: '刺激，这才像终极大考。',
                        tone: 'tease',
                        response: '对你是刺激，对我可是生死时速。手别抖，画线！'
                    }
                ]
            },
            l11LureLock: {
                title: 'L11 / 守门预演',
                status: '门线危险',
                bubble: '它开始惦记出口了。',
                lines: [
                    '守钥者刚才不只是盯着钥匙。',
                    '它好像也知道门在哪里。很好，连锁都开始有职业规划了。',
                    '拿钥匙前先看门线。别让我拿到钥匙以后发现门口排队等我。'
                ],
                replies: [
                    commonReplies.worry,
                    commonReplies.steady,
                    commonReplies.tease
                ]
            },
            l12FinalePrep: {
                title: 'L12 / 出口？',
                status: '出口前',
                bubble: '这门安静得很可疑。',
                lines: [
                    '这扇门看起来像出口。',
                    '我讨厌“看起来像”这几个字。它通常意味着下一秒就会很丢人。',
                    '如果门后还有东西，你不许笑。至少等我转身以后再笑。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            eventKeyCollected: {
                title: '钥匙已取得',
                status: '权限到手',
                bubble: '拿到了。快走快走。',
                lines: [
                    '拿到了。',
                    '等一下，这地方刚才是不是抖了一下？',
                    '别站着研究。门。现在。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            eventFirstRotation: {
                title: '首次旋转',
                status: '空间锁定',
                bubble: '你真的拧了？',
                lines: [
                    '你真的把整个地方拧了。',
                    '我不喜欢。我的胃也不喜欢。',
                    '但如果这能救命，我可以暂时假装自己很冷静。'
                ],
                replies: [
                    commonReplies.steady,
                    {
                        face: K.tease,
                        aria: '坏笑',
                        tone: 'tease',
                        response: '你这个表情不太值得信任。手机，帮我记一下。'
                    },
                    commonReplies.worry
                ]
            },
            eventGuardianRage: {
                title: '守钥者狂暴',
                status: '追击升级',
                bubble: '它急了。它真的急了。',
                lines: [
                    '它刚才是不是加速了？',
                    '好，钥匙不是奖励，是开关。拿到以后它就开始疯跑。',
                    '下次拿之前先想好退路。对，我说的是下次，希望不是遗言。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    commonReplies.tease
                ]
            },
            eventGameOver: {
                title: '断线回滚',
                status: '信号抖动',
                bubble: '……我刚才是不是没了？',
                lines: [
                    '我刚才断了一下。',
                    '手机弹窗说可以回滚。很好，它说得像这不疼一样。',
                    '重来可以。别把我当按钮，好吗？'
                ],
                replies: [
                    {
                        face: K.worry,
                        aria: '抱歉',
                        tone: 'warm',
                        response: '这个表情我收到了。别道歉太久，路还在。'
                    },
                    commonReplies.steady,
                    {
                        face: K.quiet,
                        aria: '沉默',
                        tone: 'warm',
                        response: '嗯。沉默也算一种回答。'
                    }
                ]
            },
            eventNormalVictory: {
                title: '门开了',
                status: '短暂安全',
                bubble: '门开了。先别得意。',
                lines: [
                    '门开了。',
                    '我承认，你这次带得还行。',
                    '只许高兴三秒。三、二……算了，先让我喘口气。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.tease,
                    {
                        face: K.cheer,
                        aria: '庆祝',
                        tone: 'warm',
                        response: '别庆祝得太明显，我会以为我们真的安全了。'
                    }
                ]
            },
            eventActFinale: {
                title: '第一幕结尾',
                status: '外壳展开',
                bubble: '门后不是外面。',
                lines: [
                    '门后不是出口。',
                    '是更大的立方体。',
                    '我刚才想起来一点点。这里可能不是牢房，是测试场。',
                    '它在看我们怎么逃。更糟的是，它可能学得挺快。',
                    '别露出那种表情。我还没说完，也还没死。'
                ],
                replies: [
                    {
                        face: K.shock,
                        aria: '震惊',
                        tone: 'warm',
                        response: '对，就是这个表情。我也不喜欢“更大的立方体”这几个字。'
                    },
                    commonReplies.steady,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '你还笑。很好，外侧的人胆子挺大。先别让我后悔这么说。'
                    }
                ]
            },
            l13OuterShell: {
                title: 'L13 / 外壳醒来',
                status: '第二幕接入',
                bubble: '格子变多了。',
                lines: [
                    '我不想打击你，但门后的确不是出口。',
                    '外壳展开后，格子变多了。不是一点点，是那种“设计师睡醒了继续加班”的多。',
                    '先别急着学新东西。我们先确认一件事：在更大的棋盘上，你还看得见我。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '你也觉得它变大得很没礼貌吧？好，第二幕第一条共识达成。'
                    }
                ]
            },
            l14FourRotate: {
                title: 'L14 / 宽场夹击',
                status: '宽场追击',
                bubble: '空间变大，麻烦也变宽。',
                lines: [
                    '我收回刚才那句。光是变大确实没什么意思。',
                    '但如果追击者也学会包抄，那就不一样了。',
                    '别用三阶那套小步挪法。这里空间大一点，脑子也得大一点。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '你要是看错层，我就假装自己没看见。假的，我会记很久。'
                    }
                ]
            },
            l15FourChase: {
                title: 'L15 / 宽场遛锁',
                status: '守钥追击',
                bubble: '锁也进第二幕了。',
                lines: [
                    '四阶以后，守钥者看起来没那么堵了。',
                    '这不是它变善良，是空间变大以后它有更多方式恶心我们。',
                    '把它遛开，但别拖太久。追击者很擅长把“慢慢来”翻译成“抓到了”。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '你这表情很欠，但至少还在线。行，继续。'
                    }
                ]
            },
            l16FoldBridge: {
                title: 'L16 / 偷门不遛锁',
                status: '传送接入',
                bubble: '可以少遛一次锁。',
                lines: [
                    '这两个门端确实互相挨着。',
                    '好消息：我们可以借它绕过守钥者正面那段麻烦路。',
                    '坏消息：这个地方从来不发纯好消息。穿过去以后别站着欣赏风景。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '笑什么。你不会以为只有你会穿门吧？天真，但还挺有精神。'
                    }
                ]
            },
            l17PortalChase: {
                title: 'L17 / 门边追击',
                status: '传送追击',
                bubble: '好了，现在开始像第二幕了。',
                lines: [
                    '传送门能把两块远处的格子当邻居。',
                    '单独看不难。麻烦的是，门边还有追击者催你做决定。',
                    '别慌。先看门端，再决定什么时候穿门。听起来很简单，对吧？当然是骗你的。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '你笑得很像已经会了。很好，等会儿别让我捡你的自信。'
                    }
                ]
            },
            l18BridgeExam: {
                title: 'L18 / 传送门小考',
                status: '折叠压测',
                bubble: '先拧一下，再穿门。',
                lines: [
                    '这次传送门旁边不太太平。',
                    '一个追击者已经够烦了。两个追击者就像这地方觉得我们太幸福。',
                    '先把局面拧歪一拍，再穿门。对，听起来很麻烦，但活着的人有资格嫌麻烦。'
                ],
                replies: [
                    commonReplies.steady,
                    commonReplies.worry,
                    {
                        face: K.tease,
                        aria: '吐槽',
                        tone: 'tease',
                        response: '你这个表情像在说“问题不大”。我先记下来，等会儿用来嘲笑你。'
                    }
                ]
            },
            l19Void: {
                title: 'L19 / 少了一格',
                status: '地面缺失',
                bubble: '那边没地了。',
                lines: [
                    '我知道这句话很蠢，但那边真的没地了。',
                    '别把线画进黑洞里。它看起来不接受协商。',
                    '好消息是，它们也过不去。坏消息是，我也不想靠坏地板活命。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l20VoidRotate: {
                title: 'L20 / 洞也会转',
                status: '破面偏转',
                bubble: '洞也跟着转？',
                lines: [
                    '你拧世界的时候，洞也跟着走。',
                    '这地方连坏掉的部分都很敬业。真烦。',
                    '但如果洞能挡它们，那我暂时允许它坏得有价值一点。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l21Patch: {
                title: 'L21 / 临时补片',
                status: '一次性地面',
                bubble: '你要我踩这个？',
                lines: [
                    '这个补片看起来像临时地板。',
                    '“临时”和“地板”放在一起，一般不是好词。',
                    '但如果我踩过去以后它碎掉，后面的东西也过不来。行，这个坏主意我喜欢一点。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l22BrokenCorner: {
                title: 'L22 / 断角钥匙',
                status: '缺角遛锁',
                bubble: '角没了，路也歪了。',
                lines: [
                    '这不是普通缺口，是整块角被咬掉了。',
                    '路变窄了。对我不友好，对守钥者也不友好。',
                    '我们可以利用它。听起来很坏，但这里先坏为敬。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l23Beacon: {
                title: 'L23 / 诱饵信标',
                status: '敌人调度',
                bubble: '骗谁？',
                lines: [
                    '这个信标会把它们引走一拍。',
                    '不是暂停时间，不是让它们失忆，就是骗一下。',
                    '骗完就跑。不要站在原地欣赏它们被骗。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l24BrokenExam: {
                title: 'L24 / 破面小考',
                status: '工具混合',
                bubble: '东西好多，别乱按。',
                lines: [
                    '缺口、补片、诱饵一起出现了。',
                    '我先声明：把所有按钮按一遍不叫策略，叫慌。',
                    '先看哪一拍会死，再决定哪个工具救那一拍。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l25DoublePortal: {
                title: 'L25 / 双门择路',
                status: '多门判断',
                bubble: '门变多了。',
                lines: [
                    '两个传送门。很好，这地方开始给选择题了。',
                    '问题是，错门也很快。快到送死那种快。',
                    '先看哪一对能接上钥匙和出口。别被亮光骗了。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l26PatchTail: {
                title: 'L26 / 碎桥断尾',
                status: '补片断追',
                bubble: '碎掉也许是好事。',
                lines: [
                    '补片踩完会碎。',
                    '我本来想骂它质量差，但如果后面的追击者过不来……',
                    '好吧，第一次见到坏地板这么有职业道德。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l27BeaconGuard: {
                title: 'L27 / 诱饵换岗',
                status: '骗开守钥者',
                bubble: '把锁骗走。',
                lines: [
                    '守钥者挡着关键线。',
                    '信标能把它的注意力拽开一拍。',
                    '只有一拍。你要是拿这一拍发呆，我会很有意见。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l28VoidPortal: {
                title: 'L28 / 破面传送',
                status: '破面捷径',
                bubble: '洞逼我们看门。',
                lines: [
                    '普通路线被缺口切开了。',
                    '传送门现在不是炫技，是少绕一大圈。',
                    '我还是不喜欢门。但我更不喜欢被追上。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l29PatchGate: {
                title: 'L29 / 补片换门',
                status: '撤离线',
                bubble: '补片别乱花。',
                lines: [
                    '这块补片看起来能救命，也能被浪费。',
                    '别看到第一个洞就补。我们要的是出口，不是装修。',
                    '留给真正会卡死撤离的地方。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l30PortalPincer: {
                title: 'L30 / 双追穿门',
                status: '门端夹击',
                bubble: '门端不安全。',
                lines: [
                    '两个追击者把普通路线压得很窄。',
                    '传送门能省时间，但门端不是安全屋。',
                    '穿过去以后继续走。不要在那里发表获救感言。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l31VoidLock: {
                title: 'L31 / 洞转锁线',
                status: '缺口调位',
                bubble: '洞也算棋子。',
                lines: [
                    '这回要看的不是哪条路能走，而是哪块坏路会被你拧到哪里。',
                    '把洞当障碍会烦。把洞当棋子会好一点。',
                    '我不保证我喜欢这个想法。只是它可能有用。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l32BeaconPortal: {
                title: 'L32 / 信标穿门',
                status: '骗一拍再穿',
                bubble: '先骗，再穿。',
                lines: [
                    '信标负责骗开门端压力。',
                    '传送门负责把那一拍变成距离。',
                    '听起来像计划。希望执行的时候也像。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l33PatchPortal: {
                title: 'L33 / 补片穿门',
                status: '补洞接门',
                bubble: '先补脚下。',
                lines: [
                    '补片解决脚边这个缺口。',
                    '传送门解决远处那段距离。',
                    '两个工具各干各的。别让它们抢戏，我会晕。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l34PortalTrap: {
                title: 'L34 / 错门陷阱',
                status: '门序判断',
                bubble: '错门也很快。',
                lines: [
                    '这不是“看见门就钻”的题。',
                    '门很多，安全的顺序只有那么几种。',
                    '你先看。我负责假装自己一点都不紧张。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l35VoidGate: {
                title: 'L35 / 守门破面',
                status: '门线被抢',
                bubble: '它要去门口。',
                lines: [
                    '拿到钥匙以后，它会往门口堵。',
                    '再加上缺口，撤离线会变得很窄。',
                    '先把门线想好。临场发挥听起来帅，通常死得也快。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l36BeaconPincer: {
                title: 'L36 / 诱饵断尾',
                status: '夹击诱导',
                bubble: '只能骗一只。',
                lines: [
                    '诱饵不能让所有敌人都去散步。',
                    '它只能骗走最关键的一只。',
                    '剩下的，靠你画线。靠我不尖叫。都很重要。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l37PatchExam: {
                title: 'L37 / 补片救场',
                status: '唯一补片',
                bubble: '一块补片，别浪费。',
                lines: [
                    '这里只有一块补片。',
                    '补对地方是逃生，补错地方是给地板贴创可贴。',
                    '我不想成为创可贴测评员。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l38PortalGuard: {
                title: 'L38 / 门后钓锁',
                status: '钓开守卫',
                bubble: '先钓开，再穿。',
                lines: [
                    '守钥者会把门线变得很烦。',
                    '传送门能绕，但你得先让它站错位置。',
                    '这叫战术。不是我怕它，绝对不是。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l39BeaconExam: {
                title: 'L39 / 诱饵夹击考',
                status: '诱饵考试',
                bubble: '骗一只，跑全局。',
                lines: [
                    '这关诱饵不是保命符，是调度器。',
                    '骗走关键那只，剩下的还会照样追。',
                    '换句话说，它们笨，但不够笨。烦。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            },
            l40ActTwoFinale: {
                title: 'L40 / 第二层出口？',
                status: '第二幕终局',
                bubble: '这门也太安静了。',
                lines: [
                    '又是一扇门。',
                    '我已经不太相信门了。门在这里的职业规划很可疑。',
                    '但我们还是得走。你看传送端，我看脚下。要是门后还是魔方，我真的会骂出来。'
                ],
                replies: [commonReplies.steady, commonReplies.worry, commonReplies.tease]
            }
        }
    };
})();
