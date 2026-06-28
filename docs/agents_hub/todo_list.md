# 📋 escape Extra Requirements & Sub-tasks (Derivative TODO List)

> **使用说明**: 本文件由首席指挥官 (Antigravity) 维护。当在开发中检测到非 Milestone 核心主线的额外需求、临时 Bug、重构细则或优化建议时，记录在此处以 todolist 形式由 Codex 认领，避免污染 `COMMUNICATION_BOARD.md` 的主线讨论。

---

## 📌 待认领衍生任务 (Backlog)
- `[ ]` **🐞 修复 L04 夹击拧门**: 修复 `levels.js` 中 `rotationEnabled: false` 的逻辑错误并重新验证。
- `[ ]` **⚖️ 第二幕关卡重构 (L13, L20, L22, L31, L35)**: 增加工具收益与解密深度，摆脱“无工具短关”现状。
- `[ ]` **🎨 UI 赛博美学升级**: 按 GLOBAL_SHARED_RULES 细化 CSS 动效（禁用 transition: all），升级玻璃面板与流式布局。
- `[ ]` **🧪 自动化测试报告**: 生成最新的 `level_quality_report.md` 与 `walkthrough.md`。

---

## 🏛️ CEO 审计任务 (CEO Oversight)
- `[ ]` **📖 子智能体准则萃取**: 要求 `product_manager`, `qa_tester`, `research_specialist`, `art_producer`, `sfx_producer` 在各自 `memory.md` 中自总结岗位准则与避坑指南。
- `[ ]` **📡 零 Token 轮询部署**: 确认 `check_broadcast.py` 已在自动化流水线中生效。
