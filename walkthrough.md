# 黎明魔方 L01-L40 自动 Walkthrough

> 由 `tools/playtest_bot.js --markdown` 生成。用于设计审查，不代表唯一解。

| 关卡 | 幕 | 回合 | 使用机制 | 风险 |
| :--- | :--- | ---: | :--- | :--- |
| L01 逃生线 | 1 | 1 | route | ok |
| L02 钥匙在前 | 1 | 4 | route | ok |
| L03 追击者 | 1 | 4 | route | ok |
| L04 夹击拧门 | 1 | 4 | rotation | ok |
| L05 钥匙也会动 | 1 | 4 | rotation | ok |
| L06 守钥者 | 1 | 5 | rotation | ok |
| L07 调离守钥者 | 1 | 7 | rotation | ok |
| L08 取钥即逃 | 1 | 4 | rotation | ok |
| L09 正式开跑 | 1 | 8 | rotation | ok |
| L10 夹缝遛锁 | 1 | 5 | rotation | ok |
| L11 守门预演 | 1 | 5 | rotation | ok |
| L12 出口？ | 1 | 9 | rotation | ok |
| L13 孤岛补片 | 2 | 5 | rotation + patch | ok |
| L14 宽场夹击 | 2 | 8 | rotation | ok |
| L15 宽场遛锁 | 2 | 6 | rotation | ok |
| L16 偷门不遛锁 | 2 | 4 | rotation + bridge | ok |
| L17 门边追击 | 2 | 4 | bridge | ok |
| L18 传送门小考 | 2 | 4 | bridge | ok |
| L19 少了一格 | 2 | 8 | rotation | ok |
| L20 裂面旋转 | 2 | 4 | rotation | ok |
| L21 临时补片 | 2 | 7 | patch | ok |
| L22 断角与守卫 | 2 | 7 | rotation | ok |
| L23 诱饵信标 | 2 | 4 | beacon | ok |
| L24 破面小考 | 2 | 8 | patch + beacon | ok |
| L25 双门择路 | 2 | 4 | bridge | ok |
| L26 碎桥断尾 | 2 | 6 | rotation + patch | ok |
| L27 诱饵换岗 | 2 | 4 | beacon | ok |
| L28 破面传送 | 2 | 7 | bridge | ok |
| L29 补片换门 | 2 | 8 | patch | ok |
| L30 双追穿门 | 2 | 4 | bridge | ok |
| L31 多维解法 | 2 | 6 | bridge + patch + beacon | ok |
| L32 信标穿门 | 2 | 3 | bridge + beacon | too-short-for-act-2 |
| L33 补片穿门 | 2 | 3 | bridge + patch | too-short-for-act-2 |
| L34 错门陷阱 | 2 | 4 | bridge | ok |
| L35 绝境防线 | 2 | 5 | rotation + beacon | ok |
| L36 诱饵断尾 | 2 | 9 | beacon | ok |
| L37 补片救场 | 2 | 6 | rotation + patch | ok |
| L38 门后钓锁 | 2 | 6 | bridge | ok |
| L39 诱饵夹击考 | 2 | 9 | rotation + beacon | ok |
| L40 第二层出口？ | 2 | 4 | bridge | ok |

## L01 逃生线

- 幕/章节：Act 1 / 读图与画路
- Bot 回合数：1
- 设计风险：暂无

1. `move U3-2`

## L02 钥匙在前

- 幕/章节：Act 1 / 钥匙与门
- Bot 回合数：4
- 设计风险：暂无

1. `move U3-2>F1-2`
2. `move F2-2>F2-1`
3. `move F3-1>D1-1`
4. `move D2-1>D2-2`

## L03 追击者

- 幕/章节：Act 1 / 公开威胁
- Bot 回合数：4
- 设计风险：暂无

1. `move U3-2>F1-2`
2. `move F2-2>F2-3`
3. `move F3-3>D1-3`
4. `move D2-3>D2-2`

## L04 夹击拧门

- 幕/章节：Act 1 / 旋转目标
- Bot 回合数：4
- 设计风险：暂无

1. `Y1CW`
2. `move U2-1>L1-2`
3. `move L2-2>L3-2`
4. `move D2-1>D2-2`

## L05 钥匙也会动

- 幕/章节：Act 1 / 旋转目标
- Bot 回合数：4
- 设计风险：暂无

1. `Y1CCW`
2. `move U2-3>R1-2`
3. `move R2-2>R3-2`
4. `move D2-3>D2-2`

## L06 守钥者

- 幕/章节：Act 1 / 守路不堵门
- Bot 回合数：5
- 设计风险：暂无

1. `X0CW`
2. `move U2-1>U1-1`
3. `move B1-3>B2-3`
4. `move B3-3>D3-1`
5. `move D2-1>D2-2`

## L07 调离守钥者

- 幕/章节：Act 1 / 空间拆位
- Bot 回合数：7
- 设计风险：暂无

1. `Y1CW`
2. `move U3-2>U3-3`
3. `move F1-3>F2-3`
4. `move F3-3>F3-2`
5. `move F2-2>F1-2`
6. `move F2-2>F3-2`
7. `move D1-2>D2-2`

## L08 取钥即逃

- 幕/章节：Act 1 / 撤离压力
- Bot 回合数：4
- 设计风险：暂无

1. `Y0CCW`
2. `move U3-2>F1-2`
3. `move F2-2>F3-2`
4. `move D1-2>D2-2`

## L09 正式开跑

- 幕/章节：Act 1 / 第一幕实战
- Bot 回合数：8
- 设计风险：暂无

1. `Z1CW`
2. `move R3-2>R3-3`
3. `move D3-3>D2-3`
4. `move D1-3>F3-3`
5. `move F2-3>F2-2`
6. `move F2-1>F1-1`
7. `move L1-3>L1-2`
8. `move L2-2`

## L10 夹缝遛锁

- 幕/章节：Act 1 / 第一幕实战
- Bot 回合数：5
- 设计风险：暂无

1. `Y1CW`
2. `move U3-2>F1-2`
3. `move F2-2>F3-2`
4. `move D1-2>D2-2`
5. `move D3-2`

## L11 守门预演

- 幕/章节：Act 1 / 第一幕实战
- Bot 回合数：5
- 设计风险：暂无

1. `X1CW`
2. `move B3-2>B3-3`
3. `move L3-1>L3-2`
4. `move L2-2>L2-3`
5. `move F2-1>F2-2`

## L12 出口？

- 幕/章节：Act 1 / 第一幕毕业考
- Bot 回合数：9
- 设计风险：暂无

1. `Y2CCW`
2. `move U1-2>U1-3`
3. `move R1-3>R2-3`
4. `move R3-3>R3-2`
5. `move D2-3>D3-3`
6. `move D2-3>R3-2`
7. `move R2-2>R1-2`
8. `move R2-2>R3-2`
9. `move D2-3>D2-2`

## L13 孤岛补片

- 幕/章节：Act 2 / 第二幕 · 外壳
- Bot 回合数：5
- 设计风险：暂无

1. `X1CCW`
2. `patch F4-3`
3. `move F3-2>F3-3`
4. `move F4-3>D1-3`
5. `move D2-3>D3-3`

## L14 宽场夹击

- 幕/章节：Act 2 / 第二幕 · 宽场
- Bot 回合数：8
- 设计风险：暂无

1. `Z1CCW`
2. `move L2-2>L2-3`
3. `move L3-3>L3-4`
4. `move F3-1>F3-2`
5. `move F4-2>F4-3`
6. `move F3-3>F2-3`
7. `move F2-4>R2-1`
8. `move R2-2>R2-3`

## L15 宽场遛锁

- 幕/章节：Act 2 / 第二幕 · 宽场
- Bot 回合数：6
- 设计风险：暂无

1. `X0CW`
2. `move U2-1>U1-1`
3. `move B1-4>B1-3`
4. `move B2-3>B3-3`
5. `move B4-3>D4-2`
6. `move D3-2>D3-3`

## L16 偷门不遛锁

- 幕/章节：Act 2 / 第二幕工具
- Bot 回合数：4
- 设计风险：暂无

1. `Y3CW`
2. `bridge move F4-1>F3-1`
3. `move F2-1>F1-1`
4. `move U4-1>L1-4`

## L17 门边追击

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：4
- 设计风险：暂无

1. `bridge move F4-1`
2. `move F3-1>F2-1`
3. `move F1-1>F1-2`
4. `move F1-3>F1-4`

## L18 传送门小考

- 幕/章节：Act 2 / 第二幕小考
- Bot 回合数：4
- 设计风险：暂无

1. `bridge move F4-1`
2. `move F3-1>F2-1`
3. `move F1-1>F1-2`
4. `move F1-3>F1-4`

## L19 少了一格

- 幕/章节：Act 2 / 第二幕 · 断面
- Bot 回合数：8
- 设计风险：暂无

1. `Y3CCW`
2. `move U4-4`
3. `move R1-1>R2-1`
4. `move R2-2>R2-3`
5. `move R3-3>R3-2`
6. `move R3-1>F3-4`
7. `move F2-4>F2-3`
8. `move F3-3>F3-4`

## L20 裂面旋转

- 幕/章节：Act 2 / 第二幕 · 断面
- Bot 回合数：4
- 设计风险：暂无

1. `X1CW`
2. `move F1-2>F1-3`
3. `move F2-3>F3-3`
4. `move F4-3>F4-4`

## L21 临时补片

- 幕/章节：Act 2 / 第二幕工具
- Bot 回合数：7
- 设计风险：暂无

1. `patch F1-2`
2. `move F1-2`
3. `move U4-2>U3-2`
4. `move U4-2`
5. `move U4-3>F1-3`
6. `move F2-3>F3-3`
7. `move F4-3>F4-4`

## L22 断角与守卫

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：7
- 设计风险：暂无

1. `Y2CCW`
2. `move R1-1>U4-4`
3. `move U3-4>R1-2`
4. `move R1-3>R1-4`
5. `move R2-4>R3-4`
6. `move R4-4>D4-4`
7. `move D3-4>D3-3`

## L23 诱饵信标

- 幕/章节：Act 2 / 第二幕工具
- Bot 回合数：4
- 设计风险：暂无

1. `beacon D1-1`
2. `move F1-1>F1-2`
3. `move F1-3>F1-4`
4. `move F2-4>F3-4`

## L24 破面小考

- 幕/章节：Act 2 / 第二幕小考
- Bot 回合数：8
- 设计风险：暂无

1. `patch U4-2`
2. `move U4-1>U4-2`
3. `move U4-3>U4-4`
4. `beacon F1-1`
5. `move F1-4>F2-4`
6. `move F3-4>F4-4`
7. `move D1-4>D2-4`
8. `move D3-4>D3-3`

## L25 双门择路

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：4
- 设计风险：暂无

1. `bridge move F4-1>F3-1`
2. `move F2-1>F2-2`
3. `move F2-3>F2-4`
4. `move F1-4`

## L26 碎桥断尾

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：6
- 设计风险：暂无

1. `Y3CCW`
2. `patch R1-2`
3. `move R1-2>R1-3`
4. `move R2-3>R3-3`
5. `move R4-3>R4-2`
6. `move R4-1>F4-4`

## L27 诱饵换岗

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：4
- 设计风险：暂无

1. `beacon F4-4`
2. `move F1-1>F1-2`
3. `move F1-3>F1-4`
4. `move F2-4>F3-4`

## L28 破面传送

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：7
- 设计风险：暂无

1. `bridge move F3-1>L3-4`
2. `move L2-4>L2-3`
3. `move L1-3>U3-1`
4. `move U3-2>U3-3`
5. `move U4-3>F1-3`
6. `move F2-3>F3-3`
7. `move F4-3>F4-4`

## L29 补片换门

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：8
- 设计风险：暂无

1. `wait`
2. `move F3-1>F4-1`
3. `move F4-2>F4-3`
4. `move F3-3>F2-3`
5. `move F1-3>F1-4`
6. `patch F3-4`
7. `move F2-4>F3-4`
8. `move F4-4`

## L30 双追穿门

- 幕/章节：Act 2 / 第二幕小考
- Bot 回合数：4
- 设计风险：暂无

1. `bridge move F4-1`
2. `move F3-1>F2-1`
3. `move F1-1>F1-2`
4. `move F1-3>F1-4`

## L31 多维解法

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：6
- 设计风险：暂无

1. `patch F1-3`
2. `move F1-1>F1-2`
3. `move F1-3>F1-4`
4. `beacon D2-3`
5. `move F2-4>F3-4`
6. `bridge move F4-4>D3-3`

## L32 信标穿门

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：3
- 设计风险：too-short-for-act-2

1. `beacon L1-4`
2. `bridge move F4-1>F3-1`
3. `move F2-1>F1-1`

## L33 补片穿门

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：3
- 设计风险：too-short-for-act-2

1. `patch F1-2`
2. `move F1-2>F1-3`
3. `bridge move F1-4>D3-3`

## L34 错门陷阱

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：4
- 设计风险：暂无

1. `bridge move F3-1>F2-1`
2. `move F2-2>F2-3`
3. `bridge move F2-4>D3-2`
4. `move D3-3`

## L35 绝境防线

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：5
- 设计风险：暂无

1. `X2CW`
2. `move F2-2>F2-3`
3. `beacon F1-3`
4. `move F2-4`
5. `move F3-4>F4-4`

## L36 诱饵断尾

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：9
- 设计风险：暂无

1. `beacon U4-1`
2. `move L1-4`
3. `move L2-4>L3-4`
4. `move L4-4>L4-3`
5. `move L4-4>F4-1`
6. `move F4-2>F4-3`
7. `move F3-3>F2-3`
8. `move F3-3>F4-3`
9. `move F4-4`

## L37 补片救场

- 幕/章节：Act 2 / 第二幕小考
- Bot 回合数：6
- 设计风险：暂无

1. `Y3CCW`
2. `patch R1-2`
3. `move R1-2>R1-3`
4. `move R2-3>R3-3`
5. `move R4-3>R4-2`
6. `move R4-1>F4-4`

## L38 门后钓锁

- 幕/章节：Act 2 / 第二幕组合
- Bot 回合数：6
- 设计风险：暂无

1. `bridge move F4-1`
2. `move F3-1>L3-4`
3. `move L3-3>L3-2`
4. `move L2-2>L1-2`
5. `move L1-3`
6. `move L1-4>F1-1`

## L39 诱饵夹击考

- 幕/章节：Act 2 / 第二幕小考
- Bot 回合数：9
- 设计风险：暂无

1. `Y0CCW`
2. `beacon D4-4`
3. `move F2-1>F2-2`
4. `move F2-3>F2-4`
5. `move F1-4>U4-4`
6. `move U3-4>U2-4`
7. `move U1-4>R1-4`
8. `move R2-4>R3-4`
9. `move R4-4`

## L40 第二层出口？

- 幕/章节：Act 2 / 第二幕毕业考
- Bot 回合数：4
- 设计风险：暂无

1. `bridge move F4-1`
2. `move F3-1>F2-1`
3. `move F1-1>F1-2`
4. `move F1-3>F1-4`

