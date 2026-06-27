# 🎬 Milestone 10.5: Codex Purple Face (B-Face) 3D Twist Rotation Debug Plan

> 状态：`[STATUS: CODE_EXECUTION_M10]`
> 执行者：Codex (GPT-5.5 / Claude Code)
> 主管审计：Antigravity (Mastermind)
> 红线：专职修复在魔方 Back 后面（紫色面，法线 (0,0,-1)）进行拖拽旋转层（Twist）时的控制轴方向映射错乱、锁死或逆反问题。

---

## 🔍 问题诊断背景 (Debug Context)

在魔方 Back 面（紫色面，也就是 `faceId: 1` 且 cell 物理法线 `normal: (0, 0, -1)`）下拖拽旋转层时，玩家会遭遇：
1. **旋转方向（CW/CCW）异常**：拖动判定出的方向与鼠标划过方向相反，或者根本拧不动。
2. **轴向锁定映射偏置**：对于 Z 轴旋转或与 Z 轴垂直面拖拽的检测发生了交叉投影退化。

### 核心关联函数

所有 3D 拖拽判定与物理投影均在 [render.js](file:///Users/qcmorning/Desktop/project/antigravity2/escape/render.js) 之中：
- `getTwistLayerFromCell(cellId)` (L308-328)：从被点击拖动的格子物理坐标，反推要旋转的轴向与层索引。
- `getScreenProjectedTwistDirection(layer, startX, startY, dx, dy)` (L330-357)：计算鼠标拖动的屏幕向量对 3D 轴心投影的外积（cross product）和相机朝向点积（cameraFacing dot product），得出顺时针（CW）或逆时针（CCW）命令。
- `handleBoardPointerUp(event)` (L278-306)：监听鼠标/触控释放，并执行旋转层操作。

---

## 🛠️ Codex 具体执行步骤

### 1. 紫色面 (B-Face) 拖拽向量外积校验
检查 `getScreenProjectedTwistDirection` 在处理 Back 面（尤其是垂直于 Z 轴，或者在 Z 轴 layer 坐标较小的一端）时的行为：
- `cameraFacing = axisVector.dot(this.camera.position.clone().normalize()) >= 0 ? 1 : -1;`
- 在 Back 面，相机的 Y 轴高度和局部朝向与 Front 面相反。需要验证在该坐标系下，外积 `radiusX * dy - radiusY * dx` 以及 `cameraFacing` 变号后的最终结果。
- 检查是否存在屏幕空间中心投射偏置，导致鼠标在 B面 拖拽时的切线计算发生奇点退化。

### 2. 轴旋转与操作关联自检
- 验证 B面（法线 `(0, 0, -1)`）在拖拽时，其对于 X 轴与 Y 轴旋转层（即转动水平层和垂直层）的外积投影，是否在特定角度下会产生接近 `0` 的退化导致回退到默认判定。

---

## 🧪 自动化与回归测试
修改完成后，你必须运行以下验证脚本确保关卡物理可通，且未引入全局 3D 逻辑崩溃：
```bash
npm run check
npm run audit:quality
```
确认无误后，将你的更改推送至 Git 并通过 Noticeboard 向上汇报。
