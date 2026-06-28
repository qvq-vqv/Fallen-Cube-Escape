# 🛡️ 游戏状态机与教程时序安全防线 (Tutorial Sequencing & State Machine Fail-Safe)

> **适用对象**：主管智能体 (Antigravity) & 物理执行者 (Codex)
> **创建背景**：Milestone 11 期间，由于 `inspect` (战术预览) 阶段提前调用了 `game.initLevel`，导致 `tutorialActive = true` 被错误提早开启。教程对话与暗色遮罩（Grayscale & Blackout Layer）在预览时遮蔽并拦截了 UI，死锁了“开始行动”按钮，造成玩家在 L01/L02 无法开始游戏。
> **防错目标**：物理隔离“关卡预览/主菜单”与“真实游戏开玩”的状态交互，避免二次死锁。

---

## 🚨 1. 强制隔离规则 (Strict Separation Rule)
1. **禁止在 Inspect 阶段激活教程**：
   - 关卡预览 (Inspect Mode) 本质上是只读预览，玩家尚未点击“开始行动 (Start Action)”。
   - 教程 (`tutorialActive = true`) **必须且只能**在玩家点击 `开始行动` 进入游玩状态（`startSelectedLevel`）或真实重启关卡（`resetCurrentLevel`）时激活。
2. **`initLevel` 状态机传参约束**：
   - `game.initLevel(levelIndex, isInspect)` 引入了必填的 `isInspect` 安全闸门。
   - 当 `isInspect = true` 时，**强制**将 `this.tutorialActive` 锁死为 `false`，彻底屏蔽任何教程 UI 生成。
   - 只有在 `isInspect = false` 时，才允许检查并拉起 `tutorialSteps`。

---

## 📋 2. 后续状态机开发红线 (Future Dev Checklist)
在开发后续 Milestone 或是新增任何 3D/2D 面板覆盖层时，必须自检：
- [ ] 该覆盖层是否带有全局输入/点击拦截？如果带，它是否会在预览、主页或结算界面下被意外拉起？
- [ ] 在 `inspect` 状态下，所有的 3D 拖拽、扭转操作是否退化为单纯的相机轨道自转？（预览时不能改变棋盘数据）。
- [ ] 在 `playing` 状态激活后，才允许挂载 OrbitControls 的 look-gate（视角约束）与 Cone（圆锥指针）。

---

## 🛠️ 历史 Bug 修复参考
- **修复方案 (Commit `a957bcf`)**：
  - [game.js](file:///Users/qcmorning/Desktop/project/antigravity2/escape/game.js#L97) 的 `initLevel(levelIndex, isInspect = false)`：
    ```javascript
    if (!isInspect && this.currentLevel.tutorialSteps && ...) {
        this.tutorialActive = true;
    } else {
        this.tutorialActive = false;
    }
    ```
  - [main.js](file:///Users/qcmorning/Desktop/project/antigravity2/escape/main.js#L1167) 预览调用传入 `true`，而 `startSelectedLevel` 与 `resetCurrentLevel` 调用传入 `false`。
