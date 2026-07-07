# Blender Asset Brief for Dawn Cube

> Prepared 2026-07-08. 目标：把现在由 Three.js/HTML 程序化生成的视觉资产，整理成可以交给 Blender 制作的人类可读 brief 和 AI 建模提示词。建议先做“符号化 3D 棋子 + 关键道具 + 魔方场景”，不要一上来做高成本完整人形动画。

## 0. 结论：推荐做 Hybrid Token Style

最稳方案不是直接做写实人物，而是：

- 每个单位都有统一棋座，适合棋盘游戏。
- 上半身/轮廓表达性格：Dawn 圆、轻、向上；追击者尖、红、前压；守钥者重、黄、锁形。
- 正面保留徽章/符号，保证俯视、斜视、小屏幕都能读懂。
- 材质统一为暗色透明体 + 霓虹发光边 + 少量金属高光。

理由：

1. 作品集上看起来更统一，比零散 AI 模型更像有 art direction。
2. 游戏里原本就是战术棋盘，符号化棋子比高细节人形更清楚。
3. 家长后续做手机版时，低/中面数 GLB 更安全。
4. 也符合设计文档已有原则：“3D 棋座 + 清晰徽章 + 少量动画”。

## 1. 三种制作路线

| 路线 | 内容 | 优点 | 风险 | 推荐度 |
| --- | --- | --- | --- | --- |
| A. Game-ready token pack | Dawn、追击者、守钥者、钥匙、出口、3x3/4x4 魔方、工具道具 | 最快、最稳、最能直接放进游戏 | 角色情感较抽象 | 最推荐 |
| B. Portfolio hero scene | 一个高质量场景：Dawn 站在发光魔方牢笼上，敌人逼近，钥匙和出口发光 | 申请展示冲击力强 | 不一定能直接进游戏 | 推荐一起做 |
| C. Full character models | Dawn 人形、两个敌人完整 rig、动画 | IP 感强 | 成本高，容易拖慢项目 | 暂缓 |

建议：先做 A，再用 A 的资产摆一个 B 的 hero scene。C 等作品集基础稳了再做。

## 2. 统一美术规则

### Scale

- 1 个格子 = 1 Blender unit。
- 棋子底座直径不超过 0.72 unit。
- 棋子总高不超过 1.15 unit，避免挡住后方格子。
- 钥匙最大宽度不超过 0.85 unit。
- 出口/传送门可高一些，但底部占格必须清楚。

### Materials

- `mat_dark_glass`: 深蓝黑半透明主体。
- `mat_player_teal_emissive`: Dawn 青绿色发光。
- `mat_chaser_red_emissive`: 追击者红/品红发光。
- `mat_guardian_gold_emissive`: 守钥者金黄发光。
- `mat_cube_panel`: 半透明深色面板。
- `mat_cube_edge_cyan/magenta/gold`: 魔方面身份边线。
- `mat_warning_red`: 危险提示。
- `mat_void_black`: 虚空缺口，纯黑/深空，不加纹理图案。

### Export

- 每个资产导出为 `.glb` 或 `.gltf`。
- 应用 transforms，origin 放在底部中心。
- 命名示例：`dawn_token_v01.glb`, `chaser_token_v01.glb`, `guardian_token_v01.glb`。
- 动画可先只做 idle：轻微漂浮、徽章脉冲、眼睛闪烁、钥匙旋转。

## 3. 核心资产清单

### 1. Dawn / E-7 Playable Token

设计意图：玩家保护的主角。她不应该像普通棋子；她要有“想回家、脆弱但坚持”的感觉。

当前代码视觉依据：

- 青绿色。
- 圆形核心。
- 透明翼片。
- 正面 visor。
- 徽章是向上/逃离箭头。

Blender brief:

- 圆形低矮棋座。
- 上方半透明球形核心。
- 前方一条浅色 visor。
- 两侧薄翼/信号鳍片。
- 正面发光 upward arrow badge。
- idle 动画：轻微上下浮动，核心呼吸发光。

Text-to-3D prompt:

```text
Create a stylized low-poly sci-fi tactical game token for a playable heroine named Dawn. It stands on a small circular chess base, with a translucent teal spherical core, a pale visor on the front, two thin wing-like fins, and a glowing upward escape-arrow badge. The silhouette should feel vulnerable but determined, readable from an isometric camera, game-ready, dark glass material with teal emissive edges, no realistic human face, clean topology, exportable as GLB.
```

### 2. Chaser Enemy

设计意图：红色追击压力。它会根据 Dawn 最新位置重新判断路线，所以视觉上要像“会扑过来”的预测型敌人。

当前代码视觉依据：

- 红/品红。
- 尖锥核心。
- 爪状侧翼。
- 单眼。
- 徽章是尖锐三角捕食者。

Blender brief:

- 同系列棋座，但更窄更尖。
- 上方前倾四面锥/钻头形身体。
- 两侧 claw fins。
- 单个白色发光眼。
- 红色危险环可作为单独对象。
- idle 动画：轻微前后抖动，眼睛闪烁。

Text-to-3D prompt:

```text
Create a stylized low-poly red chaser enemy token for a sci-fi cube escape strategy game. It has a small dark circular base, an aggressive forward-leaning angular cone body, claw-like side fins, a single bright white eye, and a sharp triangular predator badge. Use dark glass and red/magenta emissive materials. The silhouette must read as fast and threatening from an isometric camera. Game-ready GLB, clean topology, no gore, no realistic creature anatomy.
```

### 3. Guardian / Key Keeper

设计意图：不是追击者的换色版。它代表“守门、守钥、重、慢、有权威”。

当前代码视觉依据：

- 黄色/金色。
- 六边柱身体。
- 锁牌和钥匙孔。
- 更大的环。
- 行为上常围绕钥匙/门。

Blender brief:

- 更宽的棋座。
- 重型六边柱或锁形身体。
- 胸前大锁牌，明显钥匙孔。
- 两侧肩甲或横杠，体现“挡路”。
- 金黄色发光边缘。
- idle 动画：低频沉重呼吸，锁牌脉冲。

Text-to-3D prompt:

```text
Create a stylized low-poly guardian key-keeper token for a tactical cube puzzle game. It should feel heavy, slow, and authoritative, not fast. Use a wide circular base, a hexagonal dark metal body, a bright golden lock plate on the front with a clear keyhole, broad shoulder bars, and a golden emissive ring. Readable from an isometric camera, game-ready GLB, dark glass plus gold emissive materials.
```

### 4. 3x3 Cube Battlefield

设计意图：第一幕主舞台。不是传统还原魔方，而是“牢笼/战场”。

Blender brief:

- 3x3x3 cublet structure or visible outer shell。
- 每个表面格有深色半透明 panel、细边框、角标/线路图案。
- 六个面的身份可以通过颜色 + 字母/符号 + 纹理区别。
- 边缘要发光，但不要把格线淹没。
- 可做一版完整 cube 和一版 exploded/hero scene cube。

Text-to-3D prompt:

```text
Create a 3x3 sci-fi cube battlefield, like a Rubik-like prison cube but not a color-matching toy. Each surface tile is a dark translucent glass panel with thin glowing circuit lines and clear grid borders. Use cyan, magenta, gold, green, blue, and red face accents with small abstract symbols to identify faces. The cube should look like a playable tactical board and a prison at the same time, readable from an isometric camera, game-ready, bevelled edges, emissive line materials.
```

### 5. 4x4 Cube Battlefield

设计意图：第二幕。空间更大，不只是“格子变多”，要感觉外壳更复杂、更危险。

Blender brief:

- 4x4 表面网格。
- 比 3x3 更密集的线路、更多层边线。
- 可以加外层轨道/环形结构，表达“第二层外壳”。
- 注意别让细节盖过格子可读性。

Text-to-3D prompt:

```text
Create a 4x4 sci-fi cube battlefield for the second act of a cube escape strategy game. It should feel like a larger, more complex outer shell than the 3x3 cube: dark translucent panels, precise 4x4 grid lines, glowing circuit traces, subtle orbit rails, and readable face identity accents. Keep the board playable and uncluttered from an isometric view. Game-ready GLB, bevelled cublets, emissive edges.
```

### 6. Key

设计意图：必须第一眼就是钥匙，不能像贴在格子上的图标。

当前代码视觉依据：

- 金色 torus bow。
- 轴和齿。
- 倾斜悬浮。
- 发光环。

Blender brief:

- 悬浮金色钥匙。
- 圆形/多边形钥匙柄，长轴，两段齿。
- 自带小光环。
- 动画：缓慢旋转和上下浮动。

Text-to-3D prompt:

```text
Create a stylized floating golden key prop for a sci-fi puzzle game. It has a clear circular bow, a short shaft, two asymmetric teeth, bevelled edges, and a soft golden halo ring behind it. It should be readable from a distance and from an isometric camera, game-ready GLB, gold metal plus warm emissive material, no ornate fantasy details.
```

### 7. Exit Portal / Escape Door

设计意图：拿钥匙前是锁住的逃生门，拿钥匙后变绿/开启。它要像出口，但不能直接照搬现实安全出口标志。

当前代码视觉依据：

- 门框 + 逃离箭头。
- 未解锁黄色/金色，已解锁绿色。
- 发光 torus ring。

Blender brief:

- 竖向门框或薄 portal gate。
- 中央逃离箭头。
- 可替换材质状态：locked gold / unlocked green。
- 门框外有软光环。

Text-to-3D prompt:

```text
Create a stylized sci-fi escape exit gate for a cube battlefield puzzle game. It is a thin glowing portal door with a rectangular frame, a custom escape arrow symbol, and a circular energy ring. It has two material states: locked amber/gold and unlocked green. Readable as an exit but not a real-world emergency sign, game-ready GLB, emissive edges, clean silhouette.
```

### 8. Void Gap / Broken Cublet

设计意图：真正虚空，不是补片，不是裂纹贴图。这里“没有格子”。

Blender brief:

- 做成一个缺失 cublet/缺角模块。
- 内部是深黑/深空洞，边缘有微弱冷光。
- 不在 void 面上放普通图案。
- 可配一圈断裂边，但不要让它像可踩平台。

Text-to-3D prompt:

```text
Create a broken void gap module for a sci-fi cube battlefield. It should look like a missing tile or missing corner of the cube: pure dark empty space inside, sharp broken glowing edges, no floor panel, no decorative pattern on the missing face. It must clearly read as unwalkable emptiness, not a black platform. Game-ready GLB, dark void material, subtle cyan edge glow.
```

### 9. Patch Plate

设计意图：临时补格工具。要和 void 区分：补片是“临时桥”，不是原本的地面。

Blender brief:

- 薄的临时金属/能量板。
- 边缘不稳定，带裂光。
- 尺寸略小于格子，玩家能看出它是补上去的。

Text-to-3D prompt:

```text
Create a temporary patch plate for a broken sci-fi cube board. It is a thin square energy-metal panel, slightly smaller than one tile, with unstable glowing edges and subtle cracks. It should read as a temporary bridge that can be stepped on once, not a permanent floor. Game-ready GLB, teal and amber emissive accents.
```

### 10. Beacon / Decoy

设计意图：诱导敌人的工具，视觉上像“发信号”，不是普通宝石。

Blender brief:

- 小型发光信标塔。
- 底部三脚或圆座。
- 顶部 pulsing orb/antenna。
- 颜色可用青蓝 + 黄色脉冲，避免和敌人混淆。

Text-to-3D prompt:

```text
Create a small sci-fi decoy beacon prop for a tactical puzzle game. It has a tiny circular base, three short stabilizer legs, a thin antenna, and a pulsing glowing orb at the top. It should look like it emits a signal to lure enemies. Use dark metal, cyan light, and small amber pulse accents. Game-ready GLB, readable from an isometric camera.
```

### 11. Bridge Portal Pair

设计意图：第二幕传送门。可以借用蓝/橙的通用读法，但不能像 Portal 那个 IP。

Blender brief:

- 竖椭圆裂缝，不是圆洞。
- A/B 两端颜色：cyan 和 amber。
- 由断裂光环、短弧线、空间撕裂片组成。
- 不做 Portal 风格机械枪口或火焰边。

Text-to-3D prompt:

```text
Create a pair of stylized teleport rift endpoints for a sci-fi cube puzzle game. Each endpoint is a vertical oval energy crack made of broken glowing arcs and thin circuit fragments, one cyan and one amber. It should imply folded space, not imitate the Portal game aesthetic. Game-ready GLB, transparent emissive materials, readable from an isometric camera.
```

### 12. Threat Marker / Next-Step Halo

设计意图：敌人下一步提示。追击者应偏红，守钥者可偏黄，必须比魔方面更亮。

Blender brief:

- 可做成平面 decal 或 thin ring mesh。
- 红色版本：危险、强亮、边缘脉冲。
- 黄色版本：守钥者意图，和敌人颜色一致。
- 不要做成实体障碍物。

Text-to-3D prompt:

```text
Create a flat glowing threat marker decal for a tactical board game. It is a thin circular/diamond halo that sits on a tile surface, very bright red for chaser danger and golden yellow for guardian intent. It should read as a prediction overlay, not a physical object. Transparent emissive material, game-ready, simple mesh.
```

## 4. 可能漏掉但值得做的资产

| 资产 | 为什么可能需要 |
| --- | --- |
| Route line / planned path arrow | 展示“手动画路线”这个核心动词 |
| Cross-arrow rotation selector | 长按格子后的核心操作反馈，可以做成 UI/mesh hybrid |
| No-rotation sign | 禁旋转关需要清楚符号，红色禁止图标要透明背景 |
| Toolbox icon | 绿色工具箱，比设置齿轮更准确 |
| Break tool icon | 碎解道具需要能一眼看出“拆格子” |
| Phone/comms terminal | 作品集截图可展示 Dawn 与玩家的通信关系 |
| Level book / constellation selector | 用于菜单和 portfolio 展示完整产品感 |
| Data vines | 第二幕如果展示 L13+，需要藤蔓阻挡语言 |
| Act finale cube stack | L12 之后“门后不是出口”的视觉高潮 |

## 5. Hero Scene 提示词

如果老师要“建模展示图”，可以用下面这个作为主视觉方向：

```text
Create a stylized portfolio hero scene for a game called Dawn Cube: Escape from Cubes. A small teal heroine token named Dawn stands on a dark glowing 3x3 cube battlefield, holding a route line toward a golden key and a locked escape gate. A red angular chaser token approaches from one side, and a heavy golden lock-shaped guardian blocks another path. The cube panels are dark translucent glass with cyan/magenta/gold circuit lines, floating in a black sci-fi void. The scene should feel tense but readable, like a tactical puzzle game, with clean low-poly forms, emissive edges, and no realistic violence. Camera angle: isometric three-quarter view, game portfolio quality.
```

## 6. 给 Blender 制作者的执行清单

1. 先做 `dawn_token`, `chaser_token`, `guardian_token` 三个单位，统一棋座和材质。
2. 再做 `key_prop` 和 `exit_gate`，因为它们是每关最重要目标。
3. 再做 `cube_3x3_board`，测试棋子放在格子上是否清楚。
4. 再做 `cube_4x4_board`，不要重复建模太多，尽量复用材质和 tile module。
5. 再做 `void_gap`, `patch_plate`, `beacon`, `portal_pair`，作为第二幕/工具扩展。
6. 每个资产输出一张正交视图、一张斜 45 度游戏视图、一张深色背景发光测试图。
7. 最后摆一个 hero scene，用于 portfolio 和申请材料截图。

## 7. 判断好坏的标准

一个资产合格，不是因为细节多，而是因为：

- 缩小到手机屏幕仍能认出是谁/是什么。
- 放在深色魔方上不会糊成一团。
- 追击者和守钥者一眼不是同类。
- 钥匙和出口不需要文字解释。
- void 看起来真的是空洞，不像黑色地板。
- 所有资产都像来自同一个世界。

