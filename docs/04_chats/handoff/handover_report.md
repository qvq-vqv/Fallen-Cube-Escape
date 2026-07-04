# 🧭 Codex Successor Handoff - 黎明魔方 / Dawn Cube Escape (2026-07-03)

> 写给下一位接手本项目的 Codex / GPT 智能体。  
> 当前用户明确准备新开智能体，本文件是前辈交接。请先读完这一段，再决定是否改代码。

---

## 2026-07-04 最新补丁：老师试玩反馈已落地

**当前阶段**: `[TEACHER_PLAYTEST_FEEDBACK_PASS_READY_FOR_REVIEW]`

本轮已完成老师试玩反馈修复：

- 追击者教程不再说“固定下一步”，改成“根据 Dawn 最新位置动态预测”；危险格预告明显提亮。
- 旋转模式进入后画布变成琥珀/黄色状态；无旋转关隐藏旋转按钮并清残留高亮。
- 守钥者拿钥匙后会先判断当前步数内能否直接抓玩家；能抓则追人，不能抓才守门。
- L06 只保留守钥者，且无旋转。
- L07 无旋转，工具箱强引导 3 次碎解；验证器可证明 `breakSolutionUses: 3`。
- L09 无旋转。
- 工具箱有工具时自动展开到右侧，按钮放大。
- 教程箭头/目标高亮加强。
- 旋转手感做了“点击首格 + 十字箭头 + 横/竖拖拽候选层”的 MVP。

验证结果：

- `npm run check`: PASS。
- `git diff --check`: PASS。
- `npm run playtest`: PASS。
- `npm run audit:levels`: PASS。
- `npm run audit:quality`: PASS，0 issues / 3 warnings（旧第二幕短关提醒）。
- `npm run audit:design`: 仍有旧 warning：L14/L16 duplicate fingerprint。
- `npm run smoke:browser`: 未完成；系统 Chrome/Playwright 权限与审批额度阻塞，需要人工浏览器视觉 QA。

注意：

- L07 的抽象求解器仍能找到“不按教程、慢走绕路”的 noBreak 路线，但真实教程期间 `skipTurn` 被禁用，工具步骤会强制玩家先做三次碎解；本轮设计目标是教学体验先成立。
- 当前工作树仍有 `.DS_Store` 修改，不要提交它。

---

## 0. 你的身份与工作方式

- 你是本项目的物理写码执行者，不是只给建议的顾问。
- 但如果用户明确说“先讨论/不要改代码”，必须只讨论，不要动 `.js` / `.css` / `.html`。
- 用户是高中生，项目用于大学申请；每轮重要原始对话都要归档到 `docs/04_chats/raw/raw_chat_archives.md`。
- 不要删除文件。这个项目刚经历过文档/代码/协作文件大整理，用户非常怕“整理完项目没了”。
- 工作区很脏，未提交改动很多。不要回滚你没做的改动，不要 `git reset --hard`。
- 搜索先用 `rg`，改文件用 `apply_patch`。
- 改完至少跑：
  - `git diff --check`
  - `npm run check`
  - 若涉及关卡：`node tools/validate-levels.js Lxx`

---

## 1. 当前真实状态 (2026-07-03 16:37 CST)

**Git commit 基准**: `e2fcf10`  
**当前阶段**: `[HANDOFF_TO_NEXT_AGENT_AFTER_PASS17_DISCUSSION]`

用户刚刚要求：准备在 Codex 这里新开一个智能体，让前辈把下一任需要知道的都交代清楚。  
因此当前任务不是继续写游戏逻辑，而是交接。

当前未提交改动非常多，包含：

- 游戏核心：`game.js`, `main.js`, `render.js`, `levels.js`, `style.css`, `locales.js`, `index.html`
- 工具/测试：`tools/validate-levels.js`, `tools/playtest_bot.js`, `tools/browser-smoke.js`, `tools/playtest_worker.js`
- 文档重组：`docs/00_index` 到 `docs/99_archive`，旧根目录/旧 docs 下很多重复文档已移动或删除
- 协作文件：`agents_hub/CODEX_BOARD.md`, `CODEX_LIVE_STATUS.md`, `.collaboration/`
- 依赖：`node_modules/`, `package-lock.json`

新智能体不能假设“仓库干净”。先用 `git status --short` 看当前状态。

---

## 2. 用户最在意的长期规则

1. **原话归档非常重要**  
   用户反复强调：原始对话对大学申请很重要。重要讨论和执行结果要追加到：
   `docs/04_chats/raw/raw_chat_archives.md`

2. **不要再返工式改法**  
   用户已经对“每次改完又出 bug”非常疲惫。下一任必须：
   - 先复述验收标准
   - 再定位代码
   - 再小范围修改
   - 最后跑检查

3. **系统广播 vs Dawn 分工**
   - 系统广播：强引导、必须弹出、必须能继续推进、可以高亮 UI/地图目标。
   - Dawn：陪伴角色，不应抢教程流程；多数情况下只在悬浮球红点提示。
   - 不要再把 Dawn 聊天当成强制教程。

4. **教程视觉原则**
   - 尽量不用 2D 黑幕洞去圈 3D 目标，因为镜头会错位。
   - 更倾向目标本体高亮、3D 指针、UI 真实按钮高亮。
   - 系统强引导可以弹窗，但要明确、短、可点击。

5. **Git / Vercel / itch 发布纪律 (2026-07-03 晚用户确认)**
   - 每个项目对应一个独立 GitHub repo；push 前先查 `git remote -v`，确认当前 `origin` 正是本项目仓库。
   - 用户希望“每做完一个版本自动 push，并写清楚改了什么”。因此每次完成一个可验收版本后，应：总结变更 -> 跑检查 -> commit -> 普通 push 到当前项目 `origin`。如果 `.git` 写权限不可用，就把精确命令交给用户执行。
   - 不默认 force push；当前用户截图里的 `Always force push` 不适合作为常规设置。
   - Vercel 只同步 GitHub，不同步本地文件夹。`escape` 本地改动必须 commit/push 后才会触发 Vercel。
   - 正式稳定版走 `release`：用户说“release/发布稳定版”时，Codex 应协助把当前验收通过版本推到 `release` 分支，并让 Vercel Production Branch 指向 `release`。
   - itch 不自动同步 GitHub。itch 只手动上传稳定 HTML5 ZIP，避免开发中的 bug 版本突然影响老师/同学。
   - 不提交 `node_modules/`、`dist/`、`test_runs/`、`.DS_Store`、`.env*` 等本地生成物/隐私文件。

---

## 3. 最近几轮已经做过的事

### Pass 16 系列：教程与旋转引导

- L01 恢复出口强引导。
- Dawn 弱消息不再自动弹窗，只保留红点。
- L04 增加 `Layer Twist / 旋转魔方` 按钮强引导。
- L04 教程 twist 拖动阈值降低到 8px，避免“划了但没触发”。
- 强教程 twist 优先使用教程指定轴/层/方向，避免算法猜错。
- 注意：L04 自动求解器首选解是 `Y1CW`，但用户教学意图是“Dawn 最近的最上层”。此前用独立脚本确认 `Y2CW` 后钥匙/出口可达，但仍建议浏览器人工验收手感。

### Pass 17：Brief 统计、No Twist、裂玻璃、Continue 动效

- 修复 Brief/Preview 中 `Key 0`：根因是读取了不存在的 `level.keyCell`，已改为 `level.key`。
- L10 这类无旋转关卡会显示 `No Twist / 无旋转`。
- 系统 Continue 按钮做过外圈脉冲、扫描亮带、亮度呼吸。
- void marker 一度改为裂玻璃危险面。
- 旋转轴 hitbox 扩大，hover 更明显。
- 验证通过：
  - `git diff --check`
  - `npm run check`
  - `node tools/validate-levels.js L05`
  - `node tools/validate-levels.js L10`

---

## 4. 最新未完成讨论：下一任要接的三件事

用户最新明确反馈：

### A. Continue 效果仍不够显眼

用户评价：现在还不如最开始想的“变色一闪一闪”，希望像炸弹倒计时那种感觉。  
不是要真的倒计时，不要误导玩家有时间限制；而是要强烈的“系统等待确认”视觉。

下一任建议方案：

- 把系统广播的 Continue 改成高对比黄/黑/红之间的节奏性变色。
- 可以加入短促 `ALERT / CONFIRM` 风格闪烁，但不要做真实秒数倒计时。
- 重点：玩家第一眼必须看到按钮。
- 只作用于 `.tutorial-dialogue-console.is-system .tutorial-dialogue-next`，不要污染 Dawn 普通聊天按钮。

### B. void / 虚空视觉方向被用户重新定了

用户否决了裂玻璃方案，原因：现在会像“补格”道具。  
最新要求：

- 真正 void：就是空，不要加裂纹、玻璃、补片图案。
- 非 void 普通面：必须保留原本应该有的面板图案，不能空白。
- 图 1 那种真正虚空：图案完全去掉。
- 图 2 那种不是 void 的普通面：要恢复原本面板图案。
- 可以讨论是否对真正 void 关透视/加暗洞深度，但不能像补格。

下一任重要判断：

- 这不是关卡逻辑问题，是渲染层的“普通面图案丢失/透明穿透误读”问题。
- 先查 `render.js` 中 cublet face / panel decal / void marker 的生成逻辑。
- 目标不是重新设计 L05，而是：
  1. void 面不要画面板图案；
  2. 非 void 面必须正常画面板图案；
  3. void 可以有极克制的暗深度或边缘，但不能像补片、裂玻璃。

### C. 旋转交互最终目标

用户想要类似《欧几里得之地》的直觉拖拽：

- 点击/按住某个格子。
- 系统根据玩家横向拖动还是纵向拖动判断旋转方向/旋转层。
- 必须能选中中层/中列，不能重现之前“只能拖表面，无法拖中层”的 bug。
- 如果视角太斜，宁可提示“视角太斜，先转镜头”，不要瞎猜。

此前承诺的两层方案：

1. **已做低风险版**：保留旋转轴、加大 hitbox、hover 高亮。
2. **未做最终版**：格子驱动的横/竖候选层高亮与拖动判定。

下一任如果要做最终版，先设计清楚技术方案：

- 从 pointer down 的 cellId 获取当前可见面的局部 row/col。
- 生成两个候选旋转层：屏幕横向候选、屏幕纵向候选。
- pointer move 时根据 `abs(dx)` / `abs(dy)` 与候选投影方向评分。
- hover/drag 阶段必须显示整层高亮，不只显示细轴。
- 中层选择不能依赖“被点中的外表面法线”单一轴，否则会选不到中层。
- 斜视角评分低于阈值时拒绝旋转并提示。

技术薄弱点：

- 当前 `render.js` 已有 `getViewTwistCandidatesFromCell`、`getBestTwistCandidateForDrag`、`getScreenProjectedTwistDirection`、`highlightLayer`、`ensureTwistControlRings`。
- 这些函数可以复用，但不要盲改。先用小脚本或浏览器 debug 验证候选层是否符合玩家视角。
- 最危险的 bug 是：视觉高亮一层，实际旋转另一层。

---

## 5. 关键文件地图

- `levels.js`: 关卡数据、教程步骤、L01-L40。
- `game.js`: 核心规则、寻路、旋转、工具、胜负、教程 gating。
- `render.js`: 3D 渲染、void marker、旋转轴、层高亮、教程 3D 指针。
- `main.js`: UI、选关/Brief、教程弹窗、Dawn 聊天、按钮逻辑。
- `style.css`: UI 样式、教程弹窗、Continue 动效。
- `locales.js`: 中英文文案。
- `tools/validate-levels.js`: 关卡校验器，已建模旋转、void、藤蔓等。
- `docs/04_chats/raw/raw_chat_archives.md`: 原话归档，务必追加重要过程。
- `docs/04_chats/handoff/handover_report.md`: 本交接文件。
- `CODEX_LIVE_STATUS.md`: 当前心跳卡。
- `agents_hub/CODEX_BOARD.md`: 历史协作看板，很长，读最新段即可。

---

## 6. 给下一任的建议启动步骤

如果用户让你继续做最新三件事，建议顺序：

1. **先讨论并确认**：Continue 是“强烈变色闪烁”，void 是“纯空洞 + 普通面恢复图案”，旋转是“格子横/竖拖拽候选层”。
2. **先修 void/普通面渲染**：这是确定性视觉 bug，优先级高。
3. **再改 Continue 动效**：范围小，风险低。
4. **最后单独做旋转最终版**：风险最大，必须分步验证，别和其他 UI 修混在一起。

每一步完成都要跑：

```bash
git diff --check
npm run check
```

涉及 L04/L05/L10 时：

```bash
node tools/validate-levels.js L04
node tools/validate-levels.js L05
node tools/validate-levels.js L10
```

---

# 🏁 Milestone 11.5 开发与状态交接报告 - 黎明魔方 (2026-06-30)

> 本文档由 escape项目 CEO (Antigravity v2.6) 撰写，旨在为下一任项目主管/CEO 提供 100% 干净、对齐的开发状态与下一步计划。

---

## 🚨 异常与降级大屏 (Morning Exception Dashboard)

| 模块 (Module) | 状态 (Status) | 原因/无解堆栈 (Root Cause) | 降级处理/临时兜底 (Fallback Action) |
| :--- | :--- | :--- | :--- |
| **网络僵尸长连接** | DEGRADED | 历史 Agent 因 WebSocket/API Key 频繁断网重连进入 `Reconnecting` 假死，导致误以为任务死循环跑了 4.5 小时。 | 已手动停止假死 Agent，物理建立 `CODEX_LIVE_STATUS.md` 心跳卡，并重构 `watch_board.js` 检查间隔为 1 分钟。 |
| **`CODEX_BOARD.md` 噪声** | WARNING | 文件大小超过 58KB，导致大上下文下的 Agent 产生“脑噪”，记错逻辑字段。 | 已强制对老看板执行归档（移至 `history` 目录），重新生成 2KB 极简新看板，噪音彻底清空。 |
| **`game.js` L03 回溯字段** | FIXED | 原代码 `storyResetToStart()` 试图读取 `startCell`，但 `levels.js` 中对应的字段是 `player`，导致回溯没能使 Dawn 复位。 | 已由新一代 Codex 定案修复，代码变更为 `this.currentLevel.player`。 |
| **`main.js` 变量声明缺失** | FIXED | `initGeminiChat()` 底层使用了未显式声明的 `dawnChatLog` 等三个 DOM 变量，有 ReferenceError 隐患。 | 已由新一代 Codex 在 DOMContentLoaded 头部补齐声明。 |
| **L05 关卡设计绕路** | RESOLVED | 关卡有“钥匙随层旋转”的教学意图，但实际不旋转也能通过绕路在 9 步内通关，致使教学无意义。 | 已决定使用最简洁的数据级封堵：在 L05 的 `voids` 数组里增加 `at(4,0,0)` 和 `at(2,1,2)` 两个缺口，彻底截断绕行通路，逼迫玩家学习旋转。 |

---

## 📅 1. 总体进度与当前版本定位 (Current Project Status)

*   **当前项目状态**: `[STATUS: WAITING_FOR_QA]` (等待玩家人工在浏览器 `http://localhost:8000` 试玩验收 L01-L06 体验)。
*   **本轮已交付的 Milestone 11.4 新手体验修复**：
    *   **L01 (逃生线)**：相机初始拉远为 `21.5` 大焦距。开场锁定输入 1s 聚焦出口，缩放教学只认滚轮/触控板向外捏合缩小。
    *   **L02 (钥匙在前)**：中英文纯净化，高亮 Esc 控制台 Trust 闪烁；关闭 L01 的 Trust 提示。
    *   **L03 (追击者)**：玩家走一步后，追击者延迟 300-400ms 再向前滑行；首次接触红怪触发一次 Glitch 回溯强教学（加信任、不扣分）。
    *   **L04-L06 (旋转与守卫)**：第一幕回归非 CD 锁步（移动/旋转后敌人才动）；L06 修复了“点击不可达格”导致的引导死锁。
    *   **术语清洗**：清洗了 `AP`、`CD`、`Y1`、`CW/CCW` 等开发者术语，使其玩家可见文本大白话。
    *   **新表情与密钥设置**：重复点击同一个 Kaomoji 时 Dawn 随机回复网感流行语及 Emoji 组合防人机感；设置中加入 Gemini API 密钥保存，且在没有 Key 时发送消息会弹出红色短路警告气泡。

---

## 📈 2. 物理变更明细 (Workspace Changes Summary)

*   **CODEX_LIVE_STATUS.md**：[NEW] 物理创建的心跳卡，包含 `Stage`, `Last Heartbeat`, `Active command/file`, `Blocker`。
*   **agents_hub/CODEX_BOARD.md**：[RESTART] 归档老版后重建的 2KB 新看版。
*   **docs/gpt5_system_prompt.txt**：[NEW] 包含“任务原子化拆分”、“1分钟心跳更新”等硬性契约的 Codex 专用提示词文件。
*   **agents_hub/watch_board.js**：修改了轮询时间间隔为 `60000ms` (1分钟)。
*   **main.js**：修复了 variables 声明、回退 cutscene 锁事件等。
*   **game.js**：修复了 L03 重置回溯起点字段。
*   **levels.js**：在 L05 的 `voids` 数组里增加 `at(4,0,0)` 和 `at(2,1,2)` 两个缺口。
*   **style.css**：删除了 `4739` 行等多余的大括号。

---

## 🧪 3. 校验状态与人工试玩提示 (QA Guidelines)

*   **静态校验**：运行 `npm run check` 结果为 **PASS (通过)**。
*   **寻路跑测**：运行 `npm run playtest` 结果为 **PASS (通过)**。
*   **人工验收重点**：
    1.  **L01 缩放**：拖拽视角时，不应增加缩放百分比。只有向外滚动/双指缩小才有效。
    2.  **L03 剧情杀**：首次走到红怪脸上，是否能够顺畅触发 CRT 画面撕裂并自动退回起点格，且弹出手帐聊天卡片。
    3.  **暂停菜单**：按 Esc 打开暂停菜单，检查 **“Trust / 信任度”** 是否有霓虹虚线框高亮提示，并且多语言切换没有卡死。
    4.  **自由聊天**：在暂停菜单里输入 Gemini API Key 保存后，能否正常发起 AI 通话；删除 Key 后发送，是否会提示连接失败红字。

---

## 🚀 4. 下一步开发动向 (Next Action Items)

在玩家验收完 L01-L06 之后，我们将进入 **“第三幕：全新机制与玩法扩展阶段”**，预计将要实现：
1.  **🌀 传送门 (Portals) × 💨 气流风道 (Wind Currents)** 的风力弹射与旋转变道联动机制。
2.  **道具卡牌化**：设计“便携式吹风机”、“电磁阻风网”等手牌，让玩家通过卡牌进行局势扭转。
3.  **多魔方生态**：开始筹备并讨论“左右双 Rubik's Cube 传送折跃”的高维度拼图玩法。
