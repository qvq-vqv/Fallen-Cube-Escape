# Designer Journey Research Pack

> Prepared 2026-07-08. 这不是最终文书，而是“早上醒来可以直接开写”的资料包：把项目版本、玩家反馈、设计决策、AI 协作边界和可写成申请材料的主题先整理清楚。

## 0. 最重要的定位

Designer Journey 不应写成“我本周修了几个 bug”。它要证明你正在像游戏设计师一样工作：

1. 观察玩家到底在哪里误解。
2. 把模糊反馈翻译成可执行的设计问题。
3. 在体验、视觉、技术成本之间做取舍。
4. 承认某些方案失败，然后说明你为什么换方向。
5. 说明 AI/Codex 是原型和实现伙伴，但设计判断来自你对玩家行为的观察。

推荐总句式：

> I first thought the problem was X, but playtesting showed the real problem was Y. I changed Z because it made the player's intention/readability/decision clearer.

中文思路：

> 我原本以为问题是功能有没有做出来，但试玩让我发现真正的问题是玩家是否能第一眼理解它、相信它、愿意使用它。

## 1. 明早先回答的 8 个问题

这些不需要今晚回答，但很适合作为每周反思的骨架：

1. 哪一次玩家反馈最刺痛你？它为什么说明问题不是“玩家笨”，而是设计没有讲清楚？
2. 你什么时候发现“更强的提示”反而会挡住玩家理解？例如 L04 幕布、黄色箭头、旋转辅助高光。
3. 你什么时候把一个技术 bug 转化成设计规则？例如无旋转关隐藏旋转 UI、工具箱不显示本关没有的道具。
4. 旋转操作从“按钮/辅助线/轴”变成“长按格子 + 十字箭头”的过程中，你的核心判断是什么？
5. 追击者和守钥者为什么不能只是“不同颜色的敌人”？你如何让它们有不同的视觉和行为语言？
6. 哪个关卡最能展示你会控制教学变量？例如 L06 只出现守钥者，L07 用碎解堵路线，L09 禁旋转综合考。
7. 你如何决定 Vercel 放最新版、itch 放稳定版、GitHub Release 做稳定备份？这说明你如何面对真实用户和不稳定迭代？
8. AI 在项目中帮了什么？哪些决定必须由你做，不能交给 AI？

## 2. 证据地图

| 用途 | 证据文件 |
| --- | --- |
| 核心玩法、独特性、视觉/IP 原则 | `docs/03_design/core/DESIGN_BRIEF.md` |
| L01-L40 关卡与教程结构 | `docs/03_design/levels/levels_and_tutorials_table.md` |
| 朋友试玩反馈与问题分类 | `docs/03_design/levels/playtest_issue_tracker.md` |
| 教师反馈 V1 的设计流程 | `docs/03_design/core/teacher_feedback_v1_design_flow.md` |
| UI/系统完整性审计 | `docs/03_design/ui/game_design_audit.md` |
| L01-L12 release QA | `docs/05_reports/quality/2026-07-04_l01_l12_release_qa.md` |
| 难度和解法数据 | `docs/05_reports/difficulty/difficulty_report.md` |
| 原始聊天证据 | `docs/04_chats/raw/raw_chat_archives.md` |
| 交接与长期规则 | `docs/04_chats/handoff/handover_report.md` |
| AI 使用声明素材 | `docs/07_portfolio/ai_statement/project_pitch_report.md` |

## 3. 版本线：按设计阶段整理

### Phase 1: 从“魔方 demo”到可解释的核心幻想

时间：2026-06-07

关键版本：

| Commit | 改了什么 | 为什么改 | Journey 角度 |
| --- | --- | --- | --- |
| `efed6d2` initial 3D Rubik's Cube Strategy Chase demo | 建立 3D 魔方追逃原型 | 先证明“可旋转立方体是战场”这个幻想能跑起来 | 从概念到 playable prototype |
| `45f6b93` coordinate alignment / 5-face minimap / highlighting | 坐标、展开图和高亮同步 | 玩家必须相信 3D 魔方和 2D 展开图是同一个空间 | Trustworthy map / readable space |

可写感悟：

> 这时我的目标不是做一个传统魔方游戏，而是把魔方变成战术逃亡的空间。第一版让我发现，3D 视觉本身不等于可玩性；玩家需要稳定的地图对应关系，才敢规划路线。

### Phase 2: 把玩法变成“带 Dawn 回家”的作品

时间：2026-06-24 到 2026-06-25

关键版本：

| Commit | 改了什么 | 为什么改 | Journey 角度 |
| --- | --- | --- | --- |
| `a4de263` dual board gameplay, SFX, E-7 terminal dialogue | 3D 魔方 + 规划界面 + 终端对话 | 游戏不只是棋盘，需要角色和玩家之间的关系 | Character as interface |
| `bb6fb1d` 3D direct controls, break tool, tutorial polish | 引入直接控制、碎解工具、教程打磨 | 玩家需要更多方式理解/干预局面 | Tool verbs beyond walking |
| `5000ae3` runtime Chinese/English localization | 中英切换和文案系统 | 面向 portfolio 和外部试玩，需要降低语言门槛 | Accessibility / presentation |
| `6b50f15`, `793b8ae`, `7110562` | 3D landing、动态语气、E-7 对话风格 | 让作品有记忆点，而不是只有机制 | Voice and IP identity |

可写感悟：

> Dawn/E-7 的加入改变了我对 UI 的看法。界面不只是按钮集合，而是玩家和角色之间的通信装置。这个决定也让我意识到，教程不能全都让角色来念规则；角色要像人，系统提示才负责硬规则。

### Phase 3: 实时压力、回溯和“可失败但不崩溃”的体验

时间：2026-06-26

关键版本：

| Commit | 改了什么 | 为什么改 | Journey 角度 |
| --- | --- | --- | --- |
| `206180d` realtime movement / click cooldowns / timer rings | 从纯回合感推进到有时间压力的局面 | 敌人需要“逼近感”，玩家行动也需要节奏 | Tension without unfairness |
| `e2dfd6c` 3-second rollback undo | 加入短时回溯 | 玩家犯错后应该能学习，而不是被惩罚到重开 | Failure as feedback |
| `b8ba423` neon axis rings / bullet-time twist mode | 早期旋转辅助线和慢动作 | 当时认为“显示轴”能解决旋转理解 | A useful false start |
| `653c99e`, `1e7e115` | 商业化 UI、Siri 波形、加载、档案、故障捕捉 | 让 demo 更像完整作品 | Product-level polish |

可写感悟：

> 我一开始把旋转问题理解为“玩家看不见轴”，所以做了更明显的轴和辅助线。后来事实证明，玩家的问题不是看不见轴，而是不知道自己正在选择哪一层、为什么这个手势会转这层。这是一次重要的设计误判。

### Phase 4: 朋友试玩暴露“能玩”和“能懂”的差距

时间：2026-06-28

关键证据：

| 问题 | 来源 | 后来的设计反应 |
| --- | --- | --- |
| L01 拖拽被误判为缩放，玩家不知道出口在哪里 | `playtest_issue_tracker.md` | look/zoom 分离、镜头飞行、出口聚焦、减少 UI 干扰 |
| L03 追击者像跟着玩家平移，不像有自己的回合 | `playtest_issue_tracker.md` | 敌人延迟行动、红色下一步提示、危险格更亮 |
| L04 旋转教程卡住，轴/方向/目标都不直观 | `playtest_issue_tracker.md` | 多轮旋转教程重构，最终走向长按格子 + 十字箭头 |
| L05 出现 Y1/CCW 等工程语言 | `playtest_issue_tracker.md` | 教程文案去工程化，改成玩家能读的动作语言 |
| L06 目标和合法移动规则冲突 | `playtest_issue_tracker.md` | 关卡教学变量重新拆分 |

关键版本：

| Commit | 改了什么 | 为什么改 | Journey 角度 |
| --- | --- | --- | --- |
| `780f2c` interactive tutorial engine | 建立可门控的新手教程 | 只靠文字提示不够，需要按玩家行为推进 | Tutorial as choreography |
| `8834482`, `327fc0d`, `2e77985` | look/zoom 检测修复 | 输入识别要尊重真实玩家手势 | Controls as interpretation |
| `3dd574e`, `fb74f84` | 聚焦、遮罩、教程顺序 fail-safe | 避免教程自己把玩家卡死 | Tutorial reliability |
| `227eec2`, `42227e8` | decoupled onboarding / notification cards | 系统提示和角色通讯分离 | System voice vs character voice |

可写感悟：

> 第一次系统试玩让我明白，玩家不一定会按我脑中的顺序看画面。他们会转视角、点错、忽略出口、误解敌人。好的教程不是解释所有规则，而是安排玩家在正确时刻注意到正确物体。

### Phase 5: 文档、交接、版本发布意识

时间：2026-06-29 到 2026-07-04

关键版本：

| Commit | 改了什么 | 为什么改 | Journey 角度 |
| --- | --- | --- | --- |
| `e5ad7c8`, `950510b`, `3fbcb7a` | 原始聊天和试玩反馈归档 | 申请材料需要过程证据，团队协作也需要上下文 | Design process as evidence |
| `b98ce60` stable web build release | 准备稳定网页版本 | 让外部玩家能玩到固定版本 | From prototype to public build |
| `f17007e` L01-L12 release UI audit | 自动化 release 检查 | 发布不是“能跑就行”，需要检查教程、关卡和视觉状态 | QA as design practice |

可写感悟：

> 我开始把版本管理当成设计的一部分：Vercel 可以放最新版，itch 放稳定版，GitHub Release 标记可展示版本。这不是纯技术流程，而是对试玩者负责。

### Phase 6: 教师试玩后的第二轮设计收敛

时间：2026-07-04 到 2026-07-07

关键版本：

| Commit | 改了什么 | 为什么改 | Journey 角度 |
| --- | --- | --- | --- |
| `e0ae765` teacher playtest guidance / rotation UX | 追击者提示、禁旋转关、工具箱、旋转交互一轮大修 | 教师反馈指出玩家仍然看不出状态差异和下一步行动 | Readability after expert critique |
| `0a3abe9` long-press twist / tutorial focus | 长按格子，出现十字箭头再拖动 | 用玩家手势代替“旋转模式按钮” | Gesture-based interaction |
| `6b52197` keep selected tool mode / hide unavailable tools | 工具箱不自动切回移动；本关没有的工具不显示 | UI 应尊重玩家意图，不替玩家乱切模式 | Intent-respecting UI |
| `794f44b` remove L04 curtain / clarify guardian warnings | 删除干扰性的强幕布，澄清守钥者/禁旋转提示 | 强引导如果遮挡阅读，也会变成 bug | Less instruction, more clarity |
| `e6efb3c` remove twist layer assist highlight | 删掉误导玩家的旋转辅助高光 | 辅助线让玩家误以为只能转高亮面 | Removing misleading affordances |
| `90d0caa` tutorial toolbox / rotation affordance polish | 工具箱、禁旋转提示、L03 演示、L04 旋转检查等继续收口 | 把“我理解的设计”落实为玩家实际能操作的体验 | Closing the loop |

可写感悟：

> 这轮让我学到，UI 不是越多越安全。一个高光、一个按钮、一个幕布，如果暗示了错误操作，就比没有提示更糟。最后我选择删掉旋转模式按钮和误导性高光，让玩家通过长按格子直接表达“我要转这里”。

## 4. 建议写成 9 篇周记主题

这些可以不严格等于真实周数，但每篇可以半页到一页。申请材料更看重“设计成长线”，不是日历准确到每天。

### Week 1: Turning a Cube into a Battlefield

核心问题：如何让魔方不是装饰，而是战场？

可写内容：

- 3D 魔方原型、5 面展开图、坐标同步。
- 你决定不做“还原魔方”，而做“在魔方上逃亡”。
- 学到：空间规则必须稳定可信，玩家才会愿意规划。

### Week 2: Dawn/E-7 Changed the Interface

核心问题：角色如何让机制有情感方向？

可写内容：

- Dawn/E-7 不是教程员，而是想回家的女孩。
- 通讯、信任、手机/终端 UI 的方向。
- 学到：UI 可以是叙事关系的一部分。

### Week 3: My First Playtest Was a Map of Misunderstandings

核心问题：朋友试玩为什么比自己测试更重要？

可写内容：

- L01 zoom/exit、L03 追击者、L04 旋转、L05 工程词、L06 教程冲突。
- 你如何把“玩家不会玩”改写成“我没有让玩家看懂”。
- 学到：bug 和设计误解常常长得很像。

### Week 4: Tutorial Is Attention Design

核心问题：教程不是解释规则，而是调度注意力。

可写内容：

- 系统提示和 Dawn 对话分离。
- Continue 闪烁、通知卡、真实物体高亮、幕布的使用和删除。
- 学到：引导强度要服务理解，不是服务“看起来很明显”。

### Week 5: Rebuilding Rotation Around Player Intent

核心问题：旋转操作为什么不能只靠模式按钮？

可写内容：

- 早期轴线、辅助线、旋转按钮的问题。
- 用户提出“类似欧几里得之地”的拖动思路。
- 最终：长按第一个格子 -> 十字箭头 -> 横/竖拖判断层。
- 学到：复杂交互要从玩家手势出发，而不是从内部坐标轴出发。

### Week 6: Enemies Need Readable Intent

核心问题：敌人不是障碍物，而是可以预测的对手。

可写内容：

- 追击者会根据 Dawn 最新位置重新判断，因此提示只能是“当前预测”，不是绝对承诺。
- 守钥者先判断能否直接抓 Dawn，不能抓才去守门/守钥。
- 黄色守钥者、红色追击者、下一步提示亮度。
- 学到：AI 规则必须通过视觉语言被玩家理解，否则玩家会觉得它耍赖。

### Week 7: Level Teaching Means Controlling Variables

核心问题：一关到底应该教一个东西，还是制造一个完整局面？

可写内容：

- L06 只出现守钥者。
- L07 禁旋转，专注碎解堵路线。
- L09 禁旋转综合考。
- L10 作为隐藏挑战。
- 学到：教学关卡必须控制变量；高级关卡才组合压力。

### Week 8: Tools Should Respect the Player's Mode

核心问题：工具箱为什么不能自己切回移动模式？

可写内容：

- 工具箱右侧展开。
- 没有的道具不显示。
- 玩家选择碎解/补片/信标时，不自动切回移动，直到玩家主动收回或切换。
- 学到：UI 的默认行为会表达设计立场；乱切模式会破坏玩家意图。

### Week 9: Publishing as Design Discipline

核心问题：如何让别人玩到正确版本？

可写内容：

- Vercel 自动跟随 GitHub 最新版。
- itch 上传稳定版。
- GitHub Release 标记可展示版本。
- QA 清单和 release audit。
- 学到：发布流程也是用户体验。一个坏版本被老师打开，也会改变他们对作品的判断。

## 5. 每篇推荐结构

每篇半页到一页，建议固定 5 段：

1. **This week I worked on...**  
   具体做了什么，但不要流水账。

2. **The design problem was...**  
   把问题说成人类体验，不说成代码问题。

3. **I tried / rejected / changed...**  
   写出至少一个被否掉的方案，展示判断力。

4. **What I learned...**  
   抽象成设计原则。

5. **Next question...**  
   留下下一周要验证的问题。

## 6. AI/Codex 的写法

不要写：

> I used AI to make the game.

建议写：

> I used Codex as a rapid prototyping and code-review partner. I defined the player-facing problems, judged whether the solutions matched the design goal, and used playtest feedback to decide what to keep or remove. AI accelerated implementation, but the design questions and final decisions came from my observation of players.

可以补一句中文理解：

> AI 帮我把方案更快做出来，但它不能替我判断玩家为什么看不懂、哪里被误导、哪种提示应该删掉。

## 7. 最适合放进申请材料的“设计判断句”

- “I learned that a readable game is not the same as a visually busy game.”
- “When an affordance suggests the wrong action, removing it can be a stronger design decision than polishing it.”
- “The cube is not a puzzle object to solve; it is the battlefield itself.”
- “I separated system instruction from character dialogue so Dawn could remain a believable person, not a tutorial narrator.”
- “The enemy preview is not only UI; it is a promise about fairness.”
- “I started treating release management as part of design because playtesters can only evaluate the version they can actually reach.”

## 8. 明早建议动作

1. 从上面的 9 个 Week 里先挑 4 个你最有话说的。
2. 每个 Week 先用中文写 5 句话，不要追求英文。
3. 选 2-3 个配图证据：L03 追击者、L04 旋转、L07 工具箱/碎解、Vercel/itch/release。
4. 再把中文改成英文 portfolio/reflection 语气。
5. 最后补 AI 使用声明，不要把它放在第一段抢走你的设计主体。

