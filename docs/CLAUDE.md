# CLAUDE.md - escape Project Environment & Guidelines

## Build & Test Commands
* Build command: None (Pure Vanilla HTML/CSS/JS frontend)
* Test command: None (Playtest script via Playtest Bot in `tools/` or `test/`)
* Lint command: None

## 🎨 Visual Aesthetics & Code Style Guidelines
All visual elements must strictly comply with the **Anti-AI Cheap Aesthetic Manifesto**:
1. **Responsive Spacing & Typography**: Do NOT use hardcoded `px` for fonts or layouts. Use fluid formulas:
   - Font sizes: `font-size: clamp(1rem, 0.85rem + 0.5vw, 1.5rem)`
   - Spacing: `padding: clamp(0.5rem, 0.4rem + 0.5vw, 1.25rem)`
2. **Premium Transitions**: Never use `transition: all 0.3s ease`. Explicitly target `transform` and `opacity` with high-end curves:
   - Decisive UI (sidebars/drawers): `cubic-bezier(0.16, 1, 0.3, 1)`
   - Natural interaction (hovers): `cubic-bezier(0.4, 0, 0.2, 1)`
   - Elastic overshoot (buttons/keys): `cubic-bezier(0.34, 1.56, 0.64, 1)`
3. **Glassmorphism**: Glass components must feature:
   - A subtle asymmetry: `border-image: linear-gradient(...)`
   - High saturation background blurring: `backdrop-filter: blur(20px) saturate(190%)`
   - Subtle inner glow shadow: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3)`
4. **Layered AO Shadows**: Ambient Occlusion should use multiple overlapping low-opacity shadows (e.g. 3-4 layers) instead of a single thick black shadow.

## 🛡️ Coding Boundaries
* **Design Sovereignty**: You are the code implementer, not the creative director. Do not create new item types, level scripts, story arcs, or aesthetics without an explicit approved specification in `COMMUNICATION_BOARD.md`.
* **Zero Placeholder Policy**: Do not write HTML canvas placeholders for assets. Request assets on the `COMMUNICATION_BOARD.md` and wait for the Mastermind to supply them.
* **Melt Down**: If a compiler error or logic bug occurs 3 times consecutively, mark the task as `[Blocked]` in `task.md` and halt to save tokens.
