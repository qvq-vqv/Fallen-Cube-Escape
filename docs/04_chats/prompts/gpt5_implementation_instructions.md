# GPT-5.5 Code Implementation Prompt (Milestone 11.4)

Please use the following detailed specification to implement the playtest and narrative code upgrades in the H5 3D Rubik's Cube game.

---

# 🤖 GPT-5.5 Instruction: Rubik's Cube Game Code Reconstruct

Dear GPT-5.5, your task is to implement the following core feature sets, bug fixes, and narrative scripts in the codebase. 

Please read the instructions carefully, check dependencies, and modify the target files (`main.js`, `levels.js`, `style.css`, `game.js`, and `render.js`).

---

## 📂 File Modifications & Checklist

### 1. 🎛️ L01 Zoom-Out Optimization & Lock (Target: `render.js` & `main.js`)
* **Strict Zoom-Out Detection**:
  - In L01, the user is required to Zoom Out to see the full cube.
  - Modify zoom detection in `render.js`. Ignore minor camera distance fluctuations during camera rotations (dragging).
  - Only accumulate zoom progress if the user scrolls backward (mouse wheel scrolling out / touch pinch gesture expanding) such that the camera distance increases: `cameraDistance - initialDistance >= 1.5` and `wheelDeltaY < 0`.
* **Prevention of Re-entry Loop**:
  - Add an state lock `isZoomStepCompleted` in `main.js`. Once zoom progress hits 100%, immediately disable zoom listeners and invoke `advanceTutorialStep()` exactly once with a 200ms debounce. This prevents scrolling too much from triggering multiple state recalculations.
* **OrbitControls Bounds**:
  - Change OrbitControls maxDistance bounds in `render.js` to `minDistance = 10` and `maxDistance = 28` (default camera distance is `16`) to allow comfortable zooming out.

---

### 2. 🚪 L01 Exit Showcase, Input Lock, and Highlighting (Target: `render.js` & `main.js` & `levels.js`)
* **Showcase Input Lock**:
  - When the camera flies to focus on the exit door (the Portal) at the start of L01, lock the camera rotation completely: `controls.enabled = false` for 1.5 seconds.
  - Display a temporary tutorial notification card: `💡【锁定】逃生出口已标定在魔方背面。请仔细观察。`
* **Visual Beacon (Exit Ring)**:
  - Add a highly visible, pulsing concentric glow ring/ripple effect (Neon Portal Beacon) around the 3D door mesh during showcase.
* **Unlocked Camera Rotation Task**:
  - Once the 1.5s showcase ends, unlock camera controls (`controls.enabled = true`) and prompt the player to manually rotate the camera back to find Dawn: `💡【任务】现在，旋转视角转回正面，为她指明逃生路线。` (Do not automatically fly the camera back).

---

### 3. 🛡️ L02 Trust Unification, Highlighting, and Guidance (Target: `locales.js` & `main.js` & `style.css`)
* **Localization Unification**:
  - Change all UI labels and variables representing "Trust" to read **`Trust / 信任度`** in `locales.js`, `main.js`, and `levels.js` to keep the terminology unified.
* **Pause Menu Visual Glow**:
  - During the `'closeEsc'` tutorial step where the player opens the ESC menu, apply a prominent pulsing neon dashed border (`.trust-tutorial-glow`) around the Trust display in the pause console to guide the user's eyes.
* **Explicit Tutorial Text**:
  - The notification card should clearly state: `⚠️如果信任值低于 50%，她会因为慌乱和不信任拒绝画线指令，并在当前面的安全格子上随机乱晃！`

---

### 4. ⏳ Staggered Turn-Based Monster Move Delay (Target: `game.js` & `main.js`)
* **Visual Action Decoupling**:
  - Prevent enemies and Dawn from moving at the exact same millisecond, which looks like a synchronized translation.
  - In `main.js` (inside player movement resolution): Wait for Dawn's 3D mesh movement animation to finish, then insert a **300ms ~ 400ms delay** before executing `moveAIRealtime()`.
  - When the delay triggers, let the enemy's 3D visual eye/light flash red briefly (with a minor threat cue) before they glide to their target cell.

---

### 5. 🚸 L03 (Pursuer Intro) Automated Encounter & Glitch Rollback (Target: `game.js` & `main.js` & `levels.js`)
* **The "Say Hi" Script**:
  - When L03 starts, Dawn spots the monster: `“咦，那边好像有个发光的小人？……这鬼地方闷死了，我过去跟它打个招呼，万一它是能带我出去的管理员呢？”` (Dawn starts the game terrified and lonely, hoping any moving thing is a person).
  - Force Dawn to automatically move forward 2 cells toward the monster (ignore player's drawing input).
* **Collision and Rollback Event**:
  - When she collides with the monster, trigger a narrative event:
    1. Intercept `gameOver()` execution for this specific tutorial scenario.
    2. Shake the screen and apply a CSS CRT Glitch filter to the canvas.
    3. Play the `uiUndo` (or rewind) sound effect.
    4. Call `game.undo()` to automatically rewind Dawn's position and the grid state back to the starting cell.
  - Display E-7/Dawn's panic messages: `“(((ﾟДﾟ))) ！！！刚刚……刚刚发生了什么？！我刚刚是不是死掉了？！呜呜呜……是你救了我吗？谢谢你，我再也不乱走了，我都听你的 qwq！”`
  - Increase her Trust score by 20 (`game.changeTrust(20)`) and system-pop: `“💡【系统】检测到新敌人——回合追击者：每当你走一步，它也会跟一步，它会永远跟在你身后，小心不要走错路哦。”`
  - Give control back to the player.

---

### 6. 🌀 Twist (Rotation) Consumes Turns (Target: `game.js` & `main.js`)
* **Twist AP Cost**:
  - Set layer rotation (Twist) actions to consume 1 Turn (or 1 AP) in `game.js` and `main.js`.
  - Once the layer finishes rotating, trigger the AI's action cycle (`moveAIRealtime()`) just like a movement step. This ensures monsters react tactically to space warping.

---

### 7. 🧩 L06 Single-Step Pulling Fix (Target: `levels.js`)
* **Fix the card-lock Bug**:
  - Change the L06 tutorial steps to guide Dawn step-by-step.
  - Step 1: Set `targetCell` to the adjacent cell to Dawn's left-bottom: `💡【引诱】向左下角移动一步，把守卫引出大门。`
  - Step 2: Once the player moves and the guardian follows, set the next step: `💡【绕后】趁它偏离，赶紧绕过它拿钥匙！`

---

### 8. 🧹 Developer/Engineering Jargon Cleanup (All Files)
* Clean up all player-facing texts in `levels.js`, `dialogue.js`, and `locales.js`:
  - Replace "展开图" / "展开" / "Net view" with natural descriptive text: `“这地表怎么像个折叠玩具一样摊平了？！”`
  - Replace "CCW" / "CW" / "Y1层" with natural descriptive directions: `“中间那一层”、“朝左转” / “朝右拧”`.

---

### 9. 🎨 Blender 3D rigged model (.glb) loader (Target: `render.js`)
* **GLTFLoader Setup**:
  - In `render.js`, initialize a `THREE.GLTFLoader`.
  - Pre-load Dawn's high-fidelity rigged model from the path `/assets/models/dawn.glb`.
* **Dynamic Mesh Replacement with Fallback**:
  - If the model loads successfully, use `gltf.scene` to clone her body, set up `THREE.AnimationMixer`, and load animations (`idle`, `walk`, `panic`).
  - If the `.glb` file is missing (development fallback), continue using the programmatic geometric body (Sphere, Visor, Wings) as a fallback so the game doesn't crash.

---
