/**
 * 维度黑客：魔方追逃 (Dimension Hack: Rubik's Pursuit)
 * WebGL 3D 渲染与物理动画引擎
 */

class RenderEngine {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.cublets = []; // 27 个子立方体 meshes
        this.playerMesh = null;
        this.aiMeshes = {}; // ID -> mesh
        this.keyMesh = null;
        this.exitMesh = null;
        this.bridgePortalMeshes = [];
        this.patchMeshes = [];
        this.beaconMesh = null;
        this.voidMarkerMeshes = [];
        this.vineMarkerMeshes = [];
        this.raycaster = null;
        this.pointer = null;
        this.pointerDown = null;
        this.pointerLastCell = null;
        this.interactionMode = 'route';
        this.hoveredCellId = null;
        this.boundPointerDown = this.handleBoardPointerDown.bind(this);
        this.boundPointerMove = this.handleBoardPointerMove.bind(this);
        this.boundPointerUp = this.handleBoardPointerUp.bind(this);
        this.boundWheelHandler = this.handleRendererWheel.bind(this);
        this.boundLookPointerDown = () => { this.lookPointerDown = true; };
        this.boundLookPointerUp = () => { this.lookPointerDown = false; };
        this.boardPointerAttached = false;
        this.longPressTwistTimer = null;
        this.longPressTwistDelayMs = 360;
        this.longPressTwistMoveTolerance = 9;
        
        // 游戏引擎实例引用
        this.game = null;
        
        // 缩放因子
        this.cubeRadius = 3.5; // 背景轨道与旧特效的参考半径
        this.cubletSize = 1.95;
        
        // 动画队列与状态
        this.isAnimating = false;
        
        // 路径规划线条
        this.plannedLine = null;
        this.artGroup = null;
        this.faceTextureCache = {};
        this.badgeTextureCache = {};
        this.animationFrameId = null;
        this.boundAnimate = this.animate.bind(this);
        this.boundResizeHandler = this.onWindowResize.bind(this);
        this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
        this.resizeListenerAttached = false;
        this.visibilityListenerAttached = false;
        this.lastRenderFrameAt = 0;
        this.visibleFrameIntervalMs = 1000 / 45;
        this.lowPowerFrameIntervalMs = 1000 / 24;
        this.standardMaxPixelRatio = 1.25;
        this.lowPowerMaxPixelRatio = 0.85;
        this.lowPowerMode = false;
        this.targetIndicator = null;
        this.renderMode = 'webgl';
        this.fallbackCanvas = null;
        this.fallbackCtx = null;
        this.fallbackMessage = '';
        this.hasWarnedFallback = false;
        this.edgeWhite = null;
        this.edgeColorScratch = null;
        this.laserFrame = 0;
        this.layerHighlightMaterial = null;
        this.presentationMode = 'game';
        this.presentationAngle = 0;
        this.presentationSpeed = 0;
        this.cameraFlight = null;
        this.presentationLookAt = new THREE.Vector3(0, 0, 0);
        this.gameLookAt = new THREE.Vector3(0, 0, 0);
        this.gameLookAtTarget = new THREE.Vector3(0, 0, 0);
        this.threatPreviewMeshes = {};
        this.twistRingMeshes = [];
        this.hoveredTwistRing = null;
        this.hoveredTwistCandidates = [];
        this.twistCrossHint = null;
        this.twistControlRingsEnabled = false;
        this.playerSpeechBubble = null;
        this.lastSpeechBubbleText = '';
        this.lastSpeechBubbleTone = 'info';
        this.tutorialLookBaseline = null;
        this.tutorialLookLastAngles = null;
        this.tutorialLookAccumulated = 0;
        this.activeTutorialCellId = null;
        this.tutorialPointerCone = null;
        this.tutorialCellHighlightRing = null;
        this.tutorialWarningSprite = null;
        this.tutorialArrowMesh = null;
        this.tutorialGreenTileMesh = null;
        this.tutorialObjectHalo = null;
        this.tutorialFocusTimer = null;
        this.tutorialFocusRetryTimer = null;
        this.isOrbitActive = false;
        this.tutorialZoomBaseline = null;
        this.tutorialZoomLastDistance = null;
        this.tutorialZoomAccumulated = 0;
        this.tutorialZoomDistanceAccumulated = 0;
        this.tutorialZoomCompleted = false;
        this.tutorialZoomWheelOut = false;
        this.tutorialZoomLastTickTime = null;
        this.tutorialControlLockUntil = 0;
    }

    // 初始化 3D 场景
    init(containerId, gameInstance) {
        this.container = document.getElementById(containerId);
        this.game = gameInstance;
        if (!this.container) return;

        const contextLost = this.renderer?.getContext?.()?.isContextLost?.();
        if (!this.scene || !this.camera || !this.renderer || contextLost) {
            if (contextLost) this.dispose();
            this.createRendererScene();
        } else {
            if (this.renderer.domElement.parentElement !== this.container) {
                this.container.appendChild(this.renderer.domElement);
            }
            this.onWindowResize();
        }

        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            if (!this.resizeListenerAttached) {
                window.addEventListener('resize', this.boundResizeHandler);
                this.resizeListenerAttached = true;
            }
            return;
        }

        this.buildSceneArt();
        this.buildCube3D();
        this.spawnEntities3D();
        this.ensureTargetIndicator();

        if (!this.resizeListenerAttached) {
            window.addEventListener('resize', this.boundResizeHandler);
            this.resizeListenerAttached = true;
        }
        if (!this.visibilityListenerAttached) {
            document.addEventListener('visibilitychange', this.boundVisibilityHandler);
            this.visibilityListenerAttached = true;
        }

        if (!document.hidden && this.animationFrameId === null) {
            this.animate();
        }
    }

    createRendererScene() {
        this.cleanupFallback();
        this.renderMode = 'webgl';

        if (!this.canCreateWebGLContext()) {
            this.createFallbackScene();
            return;
        }

        // 1. 初始化 Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x08090f, 0.04);
        
        const width = this.container.clientWidth || 1;
        const height = this.container.clientHeight || 1;
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(10.8, 10.0, 15.9);
        
        const standardRenderer = { antialias: true, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false };
        const lowPowerRenderer = { antialias: false, alpha: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false };
        const preferLowPower = this.lowPowerMode || window.dawnCubeSettings?.lowPowerMode;
        const rendererOptions = preferLowPower
            ? [lowPowerRenderer, standardRenderer]
            : [standardRenderer, lowPowerRenderer];
        let rendererError = null;
        for (const options of rendererOptions) {
            try {
                this.renderer = new THREE.WebGLRenderer(options);
                break;
            } catch (error) {
                rendererError = error;
            }
        }
        if (!this.renderer) {
            this.scene = null;
            this.camera = null;
            this.controls = null;
            this.createFallbackScene(rendererError);
            return;
        }

        this.renderer.setPixelRatio(this.getTargetPixelRatio());
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = false;
        if (THREE.sRGBEncoding) {
            this.renderer.outputEncoding = THREE.sRGBEncoding;
        }
        if (THREE.ACESFilmicToneMapping) {
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.08;
        }
        this.edgeWhite = this.edgeWhite || new THREE.Color(0xffffff);
        this.edgeColorScratch = this.edgeColorScratch || new THREE.Color();
        this.container.appendChild(this.renderer.domElement);
        
        // 2. 摄像机轨道控制器
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 28;
        this.controls.minDistance = 6.8;
        this.isOrbitActive = false;
        this.controls.addEventListener('start', () => {
            this.isOrbitActive = true;
        });
        this.controls.addEventListener('end', () => {
            this.isOrbitActive = false;
        });
        this.renderer.domElement.addEventListener('wheel', this.boundWheelHandler, { passive: true });
        this.attachBoardPointerHandlers();
        
        // 3. 添加光源：读图层不依赖光照，光源只负责空间质感
        const ambientLight = new THREE.AmbientLight(0xd8e7ff, 0.68);
        this.scene.add(ambientLight);

        const hemisphereLight = new THREE.HemisphereLight(0xe6fbff, 0x251a3a, 0.72);
        this.scene.add(hemisphereLight);
        
        const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 0.42);
        dirLight1.position.set(5, 10, 7);
        this.scene.add(dirLight1);
        
        const dirLight2 = new THREE.DirectionalLight(0xff6dd8, 0.32);
        dirLight2.position.set(-5, -5, -5);
        this.scene.add(dirLight2);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.28);
        fillLight.position.set(-4, 6, -8);
        this.scene.add(fillLight);

        const rimLight = new THREE.PointLight(0xffb700, 0.55, 15);
        rimLight.position.set(-4, 3, 5);
        this.scene.add(rimLight);
    }

    getTargetPixelRatio() {
        const maxPixelRatio = this.lowPowerMode ? this.lowPowerMaxPixelRatio : this.standardMaxPixelRatio;
        return Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    }

    applyPerformanceSettings(settings = {}) {
        this.lowPowerMode = Boolean(settings.lowPowerMode);
        if (this.renderer) {
            this.renderer.setPixelRatio(this.getTargetPixelRatio());
            this.onWindowResize();
        }
        if (!document.hidden && this.animationFrameId === null && this.renderMode === 'webgl') {
            this.animate();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            if (this.animationFrameId !== null) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            this.lastRenderFrameAt = 0;
            return;
        }
        this.lastRenderFrameAt = 0;
        if (this.animationFrameId === null && this.renderMode === 'webgl') {
            this.animate();
        }
    }

    attachBoardPointerHandlers() {
        if (!this.renderer?.domElement || this.boardPointerAttached) return;
        this.raycaster = this.raycaster || new THREE.Raycaster();
        this.pointer = this.pointer || new THREE.Vector2();
        this.lookPointerDown = false;
        this.renderer.domElement.addEventListener('pointerdown', this.boundPointerDown);
        this.renderer.domElement.addEventListener('pointermove', this.boundPointerMove);
        this.renderer.domElement.addEventListener('pointerup', this.boundPointerUp);
        this.renderer.domElement.addEventListener('pointerleave', this.boundPointerUp);
        this.renderer.domElement.addEventListener('pointerdown', this.boundLookPointerDown);
        window.addEventListener('pointerup', this.boundLookPointerUp);
        window.addEventListener('pointercancel', this.boundLookPointerUp);
        this.boardPointerAttached = true;
    }

    handleRendererWheel(e) {
        if (!this.game?.tutorialActive) return;
        const step = this.game.activeTutorialSteps?.[this.game.currentTutorialStepIndex];
        if (!step || step.type !== 'zoom' || this.tutorialZoomCompleted) return;
        this.tutorialZoomWheelOut = true;
    }

    setInteractionMode(mode = 'route') {
        this.interactionMode = mode === 'twist' ? 'twist' : 'route';
        if (this.controls) {
            this.controls.enableRotate = this.interactionMode === 'route';
        }
        if (this.interactionMode !== 'twist') {
            this.clearLayerHighlight();
            this.clearTwistControlRings();
            this.hideTwistCrossHint();
        } else {
            this.ensureTwistControlRings();
        }
    }

    ensureTwistCrossHint() {
        if (!this.container || this.twistCrossHint) return this.twistCrossHint;
        const hint = document.createElement('div');
        hint.className = 'twist-cross-hint is-hidden';
        hint.setAttribute('aria-hidden', 'true');
        hint.innerHTML = `
            <span class="twist-cross-arm twist-cross-up">↑</span>
            <span class="twist-cross-arm twist-cross-right">→</span>
            <span class="twist-cross-arm twist-cross-down">↓</span>
            <span class="twist-cross-arm twist-cross-left">←</span>
            <span class="twist-cross-core"></span>
        `;
        this.container.appendChild(hint);
        this.twistCrossHint = hint;
        return hint;
    }

    showTwistCrossHint(clientX, clientY, candidates = []) {
        const hint = this.ensureTwistCrossHint();
        if (!hint || !this.container) return;
        const rect = this.container.getBoundingClientRect();
        hint.style.left = `${clientX - rect.left}px`;
        hint.style.top = `${clientY - rect.top}px`;
        hint.classList.remove('is-hidden', 'is-horizontal', 'is-vertical', 'is-blocked');
        hint.classList.toggle('is-disabled', !candidates.length);
    }

    setTwistCrossIntent(intent = null) {
        const hint = this.twistCrossHint;
        if (!hint || hint.classList.contains('is-hidden')) return;
        hint.classList.remove('is-horizontal', 'is-vertical', 'is-blocked');
        if (!intent) return;
        if (intent.includes('horizontal')) hint.classList.add('is-horizontal');
        if (intent.includes('vertical')) hint.classList.add('is-vertical');
        if (intent.includes('blocked')) hint.classList.add('is-blocked');
    }

    hideTwistCrossHint() {
        if (!this.twistCrossHint) return;
        this.twistCrossHint.classList.add('is-hidden');
        this.twistCrossHint.classList.remove('is-horizontal', 'is-vertical', 'is-blocked', 'is-disabled');
    }

    clearLongPressTwistTimer() {
        if (!this.longPressTwistTimer) return;
        window.clearTimeout(this.longPressTwistTimer);
        this.longPressTwistTimer = null;
    }

    beginLongPressTwist() {
        const down = this.pointerDown;
        if (!down || down.mode !== 'route' || !down.longPressTwistArmed) return;
        if (!this.game?.rotationEnabled || this.game?.gameState !== 'playing') return;
        if (down.cellId === null || down.cellId === undefined) return;

        const candidates = this.getViewTwistCandidatesFromCell(down.cellId);
        if (!candidates.length && !this.getActiveTutorialTwistLayer()) {
            down.longPressTwistArmed = false;
            down.longPressTwistBlocked = true;
            this.showTwistCrossHint(down.x, down.y, []);
            this.setTwistCrossIntent('horizontal-blocked');
            return;
        }

        down.mode = 'twist';
        down.longPressTwist = true;
        down.twistCandidates = candidates;
        this.interactionMode = 'twist';
        if (this.controls) this.controls.enabled = false;
        this.game.clearPlannedPath?.();
        document.body?.classList.add('twist-interaction-active');
        this.showTwistCrossHint(down.x, down.y, candidates);
        const layer = this.getActiveTutorialTwistLayer() || this.getPrimaryTwistCandidate(candidates);
        if (layer) this.highlightLayer(layer.axis, layer.layer);
    }

    cancelLongPressTwist() {
        this.clearLongPressTwistTimer();
        if (this.pointerDown) {
            this.pointerDown.longPressTwistArmed = false;
        }
    }

    endLongPressTwist() {
        this.clearLongPressTwistTimer();
        this.interactionMode = 'route';
        document.body?.classList.remove('twist-interaction-active');
        if (this.controls) {
            this.controls.enabled = true;
            this.controls.enableRotate = true;
        }
        this.hideTwistCrossHint();
        this.clearLayerHighlight();
    }

    handleBoardPointerDown(event) {
        if (!this.game || this.isAnimating) return;
        const cellId = this.pickBoardCell(event);
        const ringHit = this.interactionMode === 'twist' && cellId === null ? this.pickTwistRing(event) : null;
        this.pointerDown = {
            x: event.clientX,
            y: event.clientY,
            cellId,
            mode: this.interactionMode,
            twistRing: ringHit
        };
        this.pointerLastCell = cellId;
        if (this.renderer?.domElement?.setPointerCapture) {
            this.renderer.domElement.setPointerCapture(event.pointerId);
        }
        if (this.interactionMode === 'route' &&
            this.game.rotationEnabled &&
            this.game.gameState === 'playing' &&
            cellId !== null &&
            cellId !== undefined) {
            this.clearLongPressTwistTimer();
            this.pointerDown.longPressTwistArmed = true;
            this.longPressTwistTimer = window.setTimeout(() => {
                this.longPressTwistTimer = null;
                this.beginLongPressTwist();
            }, this.longPressTwistDelayMs);
        }
        if (this.interactionMode === 'twist') {
            event.preventDefault();
            if (this.controls) this.controls.enabled = false;
            const twistCandidates = ringHit ? [] : this.getViewTwistCandidatesFromCell(cellId);
            this.pointerDown.twistCandidates = twistCandidates;
            if (ringHit) {
                this.hideTwistCrossHint();
            } else {
                this.showTwistCrossHint(event.clientX, event.clientY, twistCandidates);
            }
            const layer = ringHit || this.getActiveTutorialTwistLayer() || this.getPrimaryTwistCandidate(twistCandidates);
            if (layer) this.highlightLayer(layer.axis, layer.layer);
        }
    }

    handleBoardPointerMove(event) {
        if (!this.game || this.isAnimating) return;
        if (this.pointerDown?.longPressTwistArmed && !this.pointerDown.longPressTwist) {
            const moved = Math.hypot(event.clientX - this.pointerDown.x, event.clientY - this.pointerDown.y);
            if (moved > this.longPressTwistMoveTolerance) {
                this.cancelLongPressTwist();
            }
        }
        if (this.interactionMode === 'twist') {
            if (this.pointerDown?.mode === 'twist') {
                const down = this.pointerDown;
                if (down.twistRing) {
                    this.hideTwistCrossHint();
                    this.highlightLayer(down.twistRing.axis, down.twistRing.layer);
                    return;
                }
                const tutorialLayer = this.getActiveTutorialTwistLayer();
                if (tutorialLayer) {
                    const tutorialIntent = Math.abs(event.clientX - down.x) >= Math.abs(event.clientY - down.y)
                        ? 'horizontal'
                        : 'vertical';
                    this.setTwistCrossIntent(tutorialIntent);
                    this.highlightLayer(tutorialLayer.axis, tutorialLayer.layer);
                    return;
                }
                const dx = event.clientX - down.x;
                const dy = event.clientY - down.y;
                if (Math.hypot(dx, dy) > 6) {
                    const absDx = Math.abs(dx);
                    const absDy = Math.abs(dy);
                    const dragCandidate = this.getBestTwistCandidateForDrag(down.twistCandidates || [], dx, dy);
                    down.dragCandidate = dragCandidate;
                    if (dragCandidate) {
                        this.setTwistCrossIntent(dragCandidate.dragIntent);
                        this.highlightLayer(dragCandidate.axis, dragCandidate.layer);
                    } else {
                        this.setTwistCrossIntent(absDx >= absDy ? 'horizontal-blocked' : 'vertical-blocked');
                        this.clearLayerHighlight();
                    }
                    return;
                }
                this.setTwistCrossIntent(null);
                const layer = this.getPrimaryTwistCandidate(down.twistCandidates || []);
                if (layer) this.highlightLayer(layer.axis, layer.layer);
                return;
            }

            const cellId = this.pickBoardCell(event);
            const ringHit = cellId === null ? this.pickTwistRing(event) : null;
            this.setHoveredTwistRing(ringHit);
            if (ringHit) {
                this.highlightLayer(ringHit.axis, ringHit.layer);
                return;
            }
            if (cellId !== this.hoveredCellId) {
                this.hoveredCellId = cellId;
                const twistCandidates = this.getViewTwistCandidatesFromCell(cellId);
                this.hoveredTwistCandidates = twistCandidates;
                const layer = this.getActiveTutorialTwistLayer() || this.getPrimaryTwistCandidate(twistCandidates);
                if (layer) {
                    this.highlightLayer(layer.axis, layer.layer);
                } else {
                    this.clearLayerHighlight();
                }
            }
            return;
        }

        const cellId = this.pickBoardCell(event);
        if (!this.pointerDown || this.pointerDown.mode !== 'route') return;
        this.pointerLastCell = cellId;
    }

    handleBoardPointerUp(event) {
        this.clearLongPressTwistTimer();
        if (!this.pointerDown || !this.game || this.isAnimating || this.game.l03CutsceneActive) return;
        const moved = Math.hypot(event.clientX - this.pointerDown.x, event.clientY - this.pointerDown.y);
        const down = this.pointerDown;
        this.pointerDown = null;
        this.pointerLastCell = null;
        this.hideTwistCrossHint();
        if (down.longPressTwist) {
            this.endLongPressTwist();
        }
        if (this.renderer?.domElement?.hasPointerCapture?.(event.pointerId)) {
            this.renderer.domElement.releasePointerCapture(event.pointerId);
        }
        if (this.controls) {
            this.controls.enabled = true;
        }

        const activeTutorialTwist = this.getActiveTutorialTwistStep();
        const twistDragThreshold = activeTutorialTwist ? 8 : 18;
        if (down.mode === 'twist' && moved > twistDragThreshold) {
            const dx = event.clientX - down.x;
            const dy = event.clientY - down.y;
            const twistCandidates = down.twistCandidates?.length
                ? down.twistCandidates
                : this.getViewTwistCandidatesFromCell(down.cellId);
            const tutorialLayer = this.getActiveTutorialTwistLayer();
            const dragCandidate = tutorialLayer || this.getBestTwistCandidateForDrag(twistCandidates, dx, dy);
            if (!down.twistRing && twistCandidates.length && !dragCandidate) {
                this.showTwistViewWarning();
                return;
            }
            const layer = down.twistRing || dragCandidate;
            if (!layer) {
                this.showTwistViewWarning();
                return;
            }
            this.highlightLayer(layer.axis, layer.layer);
            const direction = activeTutorialTwist?.direction || this.getScreenProjectedTwistDirection(layer, down.x, down.y, dx, dy, down.cellId);
            this.game.rotateLayer(layer.axis, layer.layer, direction);
            return;
        }

        if (down.mode === 'route' && !down.longPressTwistBlocked && moved <= 18) {
            const cellId = this.pickBoardCell(event);
            if (cellId === null || cellId === undefined) return;
            this.game.handleBoardCellClick(cellId);
        }
    }

    getActiveTutorialTwistLayer() {
        const step = this.getActiveTutorialTwistStep();
        if (!step || !step.axis || !Number.isInteger(step.layer)) return null;
        return { axis: step.axis, layer: step.layer };
    }

    getActiveTutorialTwistStep() {
        const step = this.game?.tutorialActive
            ? this.game.activeTutorialSteps?.[this.game.currentTutorialStepIndex]
            : null;
        if (!step || step.type !== 'twist') return null;
        return step;
    }

    getLayerIndexForCellAxis(cell, axis) {
        const coord = cell?.pos?.[axis.toLowerCase()];
        if (!Number.isFinite(coord) || !this.game?.N) return null;
        const idx = Math.floor((Math.max(-1, Math.min(1, coord)) + 1) / 2 * this.game.N);
        return Math.min(this.game.N - 1, Math.max(0, idx));
    }

    getDominantNormalAxis(cell) {
        if (!cell?.normal) return null;
        return ['X', 'Y', 'Z']
            .map(axis => ({
                axis,
                value: Math.abs(cell.normal[axis.toLowerCase()] || 0)
            }))
            .sort((a, b) => b.value - a.value)[0]?.axis || null;
    }

    getViewTwistCandidatesFromCell(cellId) {
        const cell = this.game?.cells?.[cellId];
        if (!cell || !this.camera || !this.renderer) return [];
        const cellPointWorld = this.getCellWorldPosition(cellId, 'route');
        const cellPoint = this.getClientPointFromWorld(cellPointWorld);
        if (!cellPoint) return [];
        const normalAxis = this.getDominantNormalAxis(cell);
        const axes = ['X', 'Y', 'Z'].filter(axis => axis !== normalAxis);
        return axes.map(axis => {
            const layer = this.getLayerIndexForCellAxis(cell, axis);
            if (layer === null) return null;
            const axisVector = new THREE.Vector3(
                axis === 'X' ? 1 : 0,
                axis === 'Y' ? 1 : 0,
                axis === 'Z' ? 1 : 0
            );
            const H = ((this.game?.N || 3) - 1) / 2;
            const coord = (layer - H) * 2;
            const centerWorld = axisVector.clone().multiplyScalar(coord);
            const radiusWorld = cellPointWorld.clone().sub(centerWorld);
            radiusWorld.addScaledVector(axisVector, -radiusWorld.dot(axisVector));
            if (radiusWorld.lengthSq() < 0.0001) return null;
            const tangentEnd = this.getClientPointFromWorld(
                radiusWorld.clone().applyAxisAngle(axisVector, Math.PI / 18).add(centerWorld)
            );
            if (!tangentEnd) return null;
            const sx = tangentEnd.x - cellPoint.x;
            const sy = tangentEnd.y - cellPoint.y;
            const length = Math.hypot(sx, sy);
            if (length < 2.5) return null;
            const cameraFacing = Math.abs(axisVector.dot(this.camera.position.clone().sub(centerWorld).normalize()));
            return {
                axis,
                layer,
                screenX: sx / length,
                screenY: sy / length,
                normalAxis,
                visibility: length * (0.35 + cameraFacing)
            };
        }).filter(Boolean).sort((a, b) => b.visibility - a.visibility);
    }

    getPrimaryTwistCandidate(candidates = []) {
        return candidates[0] || null;
    }

    getBestTwistCandidateForDrag(candidates = [], dx = 0, dy = 0) {
        const dragLength = Math.hypot(dx, dy);
        if (!candidates.length || dragLength < 1) return null;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const intentSeparation = Math.abs(absDx - absDy) / dragLength;
        if (intentSeparation < 0.18) return null;
        const horizontalIntent = absDx >= absDy;
        const nx = dx / dragLength;
        const ny = dy / dragLength;
        const scored = candidates
            .map(candidate => ({
                ...candidate,
                dragIntent: horizontalIntent ? 'horizontal' : 'vertical',
                dragScore: Math.abs(candidate.screenX * nx + candidate.screenY * ny),
                intentScore: horizontalIntent
                    ? Math.abs(candidate.screenX)
                    : Math.abs(candidate.screenY)
            }))
            .map(candidate => ({
                ...candidate,
                score: candidate.dragScore * 0.72 + candidate.intentScore * 0.28
            }))
            .sort((a, b) => b.score - a.score);
        const best = scored[0];
        const second = scored[1];
        if (!best || best.dragScore < 0.5 || best.intentScore < 0.48) return null;
        if (second && best.score - second.score < 0.08) return null;
        return best;
    }

    showTwistViewWarning() {
        const lang = typeof window !== 'undefined' && window.currentLang === 'en' ? 'en' : 'zh';
        const text = lang === 'en'
            ? 'View angle is too steep. Rotate the camera, then drag the row or column again.'
            : '当前视角太斜，无法判断合理旋转方向。先转一下镜头，再横拖或竖拖。';
        this.game?.showFeel?.(text, 'warn');
    }

    getClientPointFromWorld(worldPoint) {
        if (!this.camera || !this.renderer || !worldPoint) return null;
        const rect = this.renderer.domElement.getBoundingClientRect();
        const projected = worldPoint.clone().project(this.camera);
        if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y)) return null;
        return {
            x: rect.left + (projected.x + 1) * 0.5 * rect.width,
            y: rect.top + (1 - (projected.y + 1) * 0.5) * rect.height
        };
    }

    getCellScreenFocusPercent(cellId, role = 'route') {
        if (!Number.isInteger(cellId)) return null;
        const point = this.getClientPointFromWorld(this.getCellWorldPosition(cellId, role));
        if (!point || typeof window === 'undefined') return null;
        return {
            x: Math.max(8, Math.min(92, (point.x / window.innerWidth) * 100)),
            y: Math.max(8, Math.min(92, (point.y / window.innerHeight) * 100))
        };
    }

    getScreenProjectedTwistDirection(layer, startX, startY, dx, dy, cellId = null) {
        if (!this.camera || !this.renderer) {
            return Math.abs(dx) >= Math.abs(dy)
                ? (dx > 0 ? 'CW' : 'CCW')
                : (dy > 0 ? 'CCW' : 'CW');
        }
        const axisVector = new THREE.Vector3(
            layer.axis === 'X' ? 1 : 0,
            layer.axis === 'Y' ? 1 : 0,
            layer.axis === 'Z' ? 1 : 0
        );
        const H = ((this.game?.N || 3) - 1) / 2;
        const coord = (layer.layer - H) * 2;
        const centerWorld = axisVector.clone().multiplyScalar(coord);
        const cellPointWorld = Number.isInteger(cellId)
            ? this.getCellWorldPosition(cellId, 'route')
            : null;

        if (cellPointWorld) {
            const radiusWorld = cellPointWorld.clone().sub(centerWorld);
            radiusWorld.addScaledVector(axisVector, -radiusWorld.dot(axisVector));
            if (radiusWorld.lengthSq() > 0.0001) {
                const tangentStart = this.getClientPointFromWorld(cellPointWorld);
                const tangentEnd = this.getClientPointFromWorld(
                    radiusWorld.clone().applyAxisAngle(axisVector, Math.PI / 18).add(centerWorld)
                );
                if (tangentStart && tangentEnd) {
                    const tangentX = tangentEnd.x - tangentStart.x;
                    const tangentY = tangentEnd.y - tangentStart.y;
                    const tangentDot = tangentX * dx + tangentY * dy;
                    if (Math.abs(tangentDot) > 0.5) return tangentDot > 0 ? 'CCW' : 'CW';
                }
            }
        }

        const centerPoint = this.getClientPointFromWorld(centerWorld);
        if (!centerPoint) {
            return Math.abs(dx) >= Math.abs(dy)
                ? (dx > 0 ? 'CW' : 'CCW')
                : (dy > 0 ? 'CCW' : 'CW');
        }
        const cellPoint = cellPointWorld ? this.getClientPointFromWorld(cellPointWorld) : null;
        const radiusX = (cellPoint?.x ?? startX) - centerPoint.x;
        const radiusY = (cellPoint?.y ?? startY) - centerPoint.y;
        const cross = radiusX * dy - radiusY * dx;
        if (Math.abs(cross) < 10) {
            return Math.abs(dx) >= Math.abs(dy)
                ? (dx > 0 ? 'CW' : 'CCW')
                : (dy > 0 ? 'CCW' : 'CW');
        }
        const cameraFacing = axisVector.dot(this.camera.position.clone().sub(centerWorld).normalize()) >= 0 ? 1 : -1;
        return cross * cameraFacing > 0 ? 'CCW' : 'CW';
    }

    ensureTwistControlRings() {
        if (this.renderMode === 'fallback' || !this.scene || !this.game || !this.game.rotationEnabled) return;
        if (!this.twistControlRingsEnabled) return;
        if (this.twistRingMeshes.length) return;
        const axisConfigs = [
            { axis: 'X', color: 0xff2d73, normal: new THREE.Vector3(1, 0, 0) },
            { axis: 'Y', color: 0x00f0ff, normal: new THREE.Vector3(0, 1, 0) },
            { axis: 'Z', color: 0xbd00ff, normal: new THREE.Vector3(0, 0, 1) }
        ];
        const N = this.game.N;
        const H = (N - 1) / 2;
        const radius = this.getCubletSize() * (N * 0.66 + 0.5);
        axisConfigs.forEach(config => {
            for (let layer = 0; layer < N; layer++) {
                const coord = (layer - H) * 2;
                const group = new THREE.Group();
                const visible = new THREE.Mesh(
                    new THREE.TorusGeometry(radius, 0.14, 10, 112),
                    new THREE.MeshBasicMaterial({
                        color: config.color,
                        transparent: true,
                        opacity: 0.13,
                        depthWrite: false,
                        blending: THREE.AdditiveBlending
                    })
                );
                const hitbox = new THREE.Mesh(
                    new THREE.TorusGeometry(radius, 1.08, 10, 96),
                    new THREE.MeshBasicMaterial({
                        color: config.color,
                        transparent: true,
                        opacity: 0,
                        depthWrite: false
                    })
                );
                const axisVector = config.normal.clone();
                group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axisVector);
                group.position.copy(axisVector.multiplyScalar(coord));
                group.add(visible);
                group.add(hitbox);
                group.userData.twistRing = {
                    axis: config.axis,
                    layer,
                    visible,
                    hitbox,
                    normal: config.normal.clone(),
                    baseOpacity: 0.13,
                    hoverOpacity: 0.95,
                    color: config.color
                };
                visible.userData.twistRingHost = group;
                hitbox.userData.twistRingHost = group;
                this.scene.add(group);
                this.twistRingMeshes.push(group);
            }
        });
    }

    clearTwistControlRings() {
        if (!this.twistRingMeshes?.length) return;
        this.twistRingMeshes.forEach(group => {
            this.scene?.remove(group);
            this.disposeObject(group);
        });
        this.twistRingMeshes = [];
        this.hoveredTwistRing = null;
    }

    pickTwistRing(event) {
        if (!this.twistControlRingsEnabled) return null;
        if (!this.raycaster || !this.pointer || !this.camera || !this.renderer || !this.twistRingMeshes.length) return null;
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hitboxes = this.twistRingMeshes
            .map(group => group.userData.twistRing?.hitbox)
            .filter(Boolean);
        const hits = this.raycaster.intersectObjects(hitboxes, false);
        const hit = hits
            .map(item => {
                const host = item.object?.userData?.twistRingHost;
                const data = host?.userData?.twistRing;
                if (!host || !data) return null;
                const projected = item.point.clone().project(this.camera);
                const dx = projected.x - this.pointer.x;
                const dy = projected.y - this.pointer.y;
                const screenDistance = Math.hypot(dx, dy);
                const worldPos = new THREE.Vector3();
                host.getWorldPosition(worldPos);
                const cameraFacing = data.normal
                    ? data.normal.clone().dot(this.camera.position.clone().sub(worldPos).normalize())
                    : 1;
                const rearPenalty = cameraFacing < -0.15 ? 0.18 : 0;
                return {
                    item,
                    score: screenDistance + item.distance * 0.002 + rearPenalty
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.score - b.score)[0]?.item;
        const host = hit?.object?.userData?.twistRingHost;
        if (!host?.userData?.twistRing) return null;
        return {
            axis: host.userData.twistRing.axis,
            layer: host.userData.twistRing.layer,
            host
        };
    }

    setHoveredTwistRing(ringHit) {
        const host = ringHit?.host || null;
        if (host === this.hoveredTwistRing) return;
        this.twistRingMeshes.forEach(group => {
            const data = group.userData.twistRing;
            if (!data?.visible) return;
            data.visible.material.opacity = group === host ? data.hoverOpacity : data.baseOpacity;
            data.visible.scale.setScalar(group === host ? 1.045 : 1);
        });
        this.hoveredTwistRing = host;
    }

    pickBoardCell(event) {
        if (!this.raycaster || !this.pointer || !this.camera || !this.renderer) return null;
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const targets = [
            ...this.voidMarkerMeshes,
            ...this.patchMeshes,
            ...this.vineMarkerMeshes,
            ...this.cublets
        ];
        const intersections = this.raycaster
            .intersectObjects(targets, true)
            .filter(hit => {
                if (!hit.object || hit.object.type !== 'Mesh' || !hit.face) return false;
                if (hit.object.userData?.isLayerOverlay) return false;
                let node = hit.object;
                while (node) {
                    if (node.userData?.layerOverlay === hit.object) return false;
                    node = node.parent;
                }
                return true;
            });
        if (!intersections.length) return null;

        const firstHit = intersections[0];
        let hit = firstHit.object;
        while (hit && hit.parent && hit.userData.cellId === undefined && hit.userData.gridX === undefined) {
            hit = hit.parent;
        }
        if (hit?.userData?.cellId !== undefined) return hit.userData.cellId;

        const cublet = hit?.userData?.gridX !== undefined ? hit : hit?.parent;
        if (!cublet || cublet.userData.gridX === undefined) return null;
        return this.getCellIdFromCubletHit(cublet, firstHit);
    }

    getCellIdFromCubletHit(cublet, intersection) {
        if (!this.game || !intersection?.face) return null;
        const N = this.game.N || 3;
        const x = this.getLayerVal(cublet.position, 'X');
        const y = this.getLayerVal(cublet.position, 'Y');
        const z = N - 1 - this.getLayerVal(cublet.position, 'Z');
        const worldNormal = intersection.face.normal.clone().transformDirection(cublet.matrixWorld).normalize();
        const abs = {
            x: Math.abs(worldNormal.x),
            y: Math.abs(worldNormal.y),
            z: Math.abs(worldNormal.z)
        };

        if (abs.x >= abs.y && abs.x >= abs.z) {
            return worldNormal.x > 0
                ? this.game.cellId(3, N - 1 - y, z)
                : this.game.cellId(2, N - 1 - y, N - 1 - z);
        }
        if (abs.y >= abs.x && abs.y >= abs.z) {
            return worldNormal.y > 0
                ? this.game.cellId(0, N - 1 - z, x)
                : this.game.cellId(1, z, x);
        }
        return worldNormal.z > 0
            ? this.game.cellId(4, N - 1 - y, x)
            : this.game.cellId(5, N - 1 - y, N - 1 - x);
    }

    getCellIdFromCubletFace(grid, materialIndex) {
        const N = this.game?.N || 3;
        const x = grid.gridX;
        const y = grid.gridY;
        const z = grid.gridZ;
        if (materialIndex === 0 && x === N - 1) return this.game.cellId(3, N - 1 - y, z);
        if (materialIndex === 1 && x === 0) return this.game.cellId(2, N - 1 - y, N - 1 - z);
        if (materialIndex === 2 && y === N - 1) return this.game.cellId(0, N - 1 - z, x);
        if (materialIndex === 3 && y === 0) return this.game.cellId(1, z, x);
        if (materialIndex === 4 && z === 0) return this.game.cellId(4, N - 1 - y, x);
        if (materialIndex === 5 && z === N - 1) return this.game.cellId(5, N - 1 - y, N - 1 - x);
        return null;
    }

    createFallbackScene(error = null) {
        this.renderMode = 'fallback';
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cublets = [];
        this.playerMesh = null;
        this.aiMeshes = {};
        this.keyMesh = null;
        this.exitMesh = null;
        this.bridgePortalMeshes = [];
        this.patchMeshes = [];
        this.beaconMesh = null;
        this.voidMarkerMeshes = [];
        this.plannedLine = null;
        this.artGroup = null;
        this.targetIndicator = null;
        this.fallbackMessage = window.t?.('webgl.fallbackMessage') || 'Chrome WebGL 暂时不可用，已启用安全视图';

        if (!this.fallbackCanvas) {
            this.fallbackCanvas = document.createElement('canvas');
            this.fallbackCanvas.className = 'fallback-render-canvas';
            this.fallbackCanvas.setAttribute('aria-label', window.t?.('webgl.safeView') || '安全视图');
            this.fallbackCanvas.style.width = '100%';
            this.fallbackCanvas.style.height = '100%';
            this.fallbackCanvas.style.display = 'block';
            this.fallbackCtx = this.fallbackCanvas.getContext('2d');
        }
        if (this.fallbackCanvas.parentElement !== this.container) {
            this.container.appendChild(this.fallbackCanvas);
        }
        if (error && !this.hasWarnedFallback) {
            console.warn('WebGL renderer failed; using 2D fallback view.', error);
            this.hasWarnedFallback = true;
        }
        this.resizeFallbackCanvas();
        this.drawFallbackScene();
    }

    canCreateWebGLContext() {
        if (!window.WebGLRenderingContext) return false;
        try {
            const canvas = document.createElement('canvas');
            const options = { antialias: false, alpha: false, failIfMajorPerformanceCaveat: false };
            const gl = canvas.getContext('webgl2', options)
                || canvas.getContext('webgl', options)
                || canvas.getContext('experimental-webgl', options);
            if (!gl) return false;
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            return true;
        } catch (error) {
            return false;
        }
    }

    cleanupFallback() {
        if (this.fallbackCanvas?.parentElement) {
            this.fallbackCanvas.parentElement.removeChild(this.fallbackCanvas);
        }
    }

    resizeFallbackCanvas() {
        if (!this.fallbackCanvas || !this.container) return;

        const width = this.container.clientWidth || 1;
        const height = this.container.clientHeight || 1;
        const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
        const targetWidth = Math.max(1, Math.floor(width * ratio));
        const targetHeight = Math.max(1, Math.floor(height * ratio));
        if (this.fallbackCanvas.width !== targetWidth || this.fallbackCanvas.height !== targetHeight) {
            this.fallbackCanvas.width = targetWidth;
            this.fallbackCanvas.height = targetHeight;
        }
        if (this.fallbackCtx) {
            this.fallbackCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
    }

    drawFallbackScene() {
        if (this.renderMode !== 'fallback' || !this.fallbackCtx || !this.container || !this.game) return;

        this.resizeFallbackCanvas();

        const ctx = this.fallbackCtx;
        const width = this.container.clientWidth || 1;
        const height = this.container.clientHeight || 1;
        ctx.clearRect(0, 0, width, height);

        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#070b13');
        bg.addColorStop(0.55, '#10131f');
        bg.addColorStop(1, '#05070d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = '#173849';
        ctx.lineWidth = 1;
        const grid = Math.max(34, Math.min(width, height) / 18);
        for (let x = -grid; x < width + grid; x += grid) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - height * 0.32, height);
            ctx.stroke();
        }
        for (let y = 0; y < height + grid; y += grid) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y + width * 0.2);
            ctx.stroke();
        }
        ctx.restore();

        const N = this.game.N || 3;
        const scale = Math.min(width, height) / (N * 3.05);
        const centerX = width * 0.5;
        const centerY = height * 0.54;
        const faceColors = this.game.faceColors || {};
        const visibleCells = (this.game.cells || [])
            .map(cell => {
                const projected = this.projectFallbackCell(cell, centerX, centerY, scale);
                const normal = cell.normal || { x: 0, y: 0, z: 1 };
                const light = normal.x * 0.38 + normal.y * 0.54 - normal.z * 0.18 + 0.5;
                return {
                    cell,
                    ...projected,
                    light: Math.max(0.22, Math.min(1, light)),
                    color: faceColors[cell.face] || '#00f0ff'
                };
            })
            .sort((a, b) => a.depth - b.depth);

        const cellSize = Math.max(12, scale * 0.82);
        visibleCells.forEach(item => {
            const alpha = 0.28 + item.light * 0.36;
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.angle);
            ctx.fillStyle = this.hexToRgba(item.color, alpha);
            ctx.strokeStyle = this.hexToRgba(item.color, 0.9);
            ctx.lineWidth = 1.4;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 7;
            this.roundRect(ctx, -cellSize / 2, -cellSize / 2, cellSize, cellSize, 3);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.hexToRgba('#ffffff', 0.46);
            ctx.font = `${Math.max(8, cellSize * 0.34)}px Orbitron, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.game.faceMarks?.[item.cell.face] || '', 0, 0);
            ctx.restore();
        });

        const projectedByCell = new Map(visibleCells.map(item => [item.cell.id, item]));
        const drawLink = (fromId, toId, color, widthFactor = 1) => {
            const from = projectedByCell.get(fromId);
            const to = projectedByCell.get(toId);
            if (!from || !to) return;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.lineWidth = Math.max(2, cellSize * 0.18 * widthFactor);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            ctx.restore();
        };

        (this.game.bridges || []).forEach(link => drawLink(link.a, link.b, '#35e6ff', 1.4));
        const route = [this.game.playerPos, ...(this.game.plannedPath || [])];
        for (let i = 0; i < route.length - 1; i++) {
            drawLink(route[i], route[i + 1], '#00ff88', 1.2);
        }

        const drawToken = (cellId, label, color, radiusFactor = 0.52) => {
            const projected = projectedByCell.get(cellId);
            if (!projected) return;
            const radius = cellSize * radiusFactor;
            ctx.save();
            ctx.translate(projected.x, projected.y - cellSize * 0.1);
            ctx.fillStyle = this.hexToRgba(color, 0.92);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.4;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#061018';
            ctx.font = `700 ${Math.max(10, radius * 0.95)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, 0, 0);
            ctx.restore();
        };

        drawToken(this.game.exitPos, this.game.hasKey ? 'GO' : 'EX', this.game.hasKey ? '#00ff88' : '#ffb700', 0.48);
        if (!this.game.hasKey && this.game.keyPos !== null) drawToken(this.game.keyPos, 'K', '#ffb700', 0.48);
        (this.game.ais || []).forEach(ai => drawToken(ai.pos, ai.type === 'guardian' ? 'G' : '!', ai.color || '#ff0055', 0.52));
        drawToken(this.game.playerPos, 'D', '#00ff88', 0.56);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#8bdcff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillText(this.fallbackMessage, width / 2, Math.max(46, height - 54));
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(223, 247, 255, 0.68)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(window.t?.('webgl.restoreHint') || '请恢复 WebGL 后使用 3D 直控；安全视图只保留局面状态。', width / 2, Math.max(68, height - 32));
        ctx.restore();
    }

    projectFallbackCell(cell, centerX, centerY, scale) {
        const pos = cell.pos || { x: 0, y: 0, z: 0 };
        const x = centerX + (pos.x - pos.z) * scale * 0.92;
        const y = centerY + (pos.x + pos.z) * scale * 0.32 - pos.y * scale * 0.82;
        const normal = cell.normal || { x: 0, y: 0, z: 1 };
        let angle = 0;
        if (Math.abs(normal.y) > 0.7) angle = Math.PI / 4;
        else if (Math.abs(normal.x) > 0.7) angle = -0.15;
        else if (Math.abs(normal.z) > 0.7) angle = 0.15;
        return { x, y, angle, depth: pos.x + pos.y + pos.z };
    }

    hexToRgba(hex, alpha = 1) {
        const clean = String(hex).replace('#', '');
        const value = parseInt(clean.length === 3
            ? clean.split('').map(ch => ch + ch).join('')
            : clean, 16);
        const r = (value >> 16) & 255;
        const g = (value >> 8) & 255;
        const b = value & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    roundRect(ctx, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }

    ensureTargetIndicator() {
        if (this.targetIndicator) {
            if (this.targetIndicator.parent !== this.scene) {
                this.scene.add(this.targetIndicator);
            }
            this.targetIndicator.visible = false;
            return;
        }

        // 创建路径终点高亮指示器 (黄框)
        const indicatorGeo = new THREE.BoxGeometry(2.05, 2.05, 2.05);
        const indicatorMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        this.targetIndicator = new THREE.Mesh(indicatorGeo, indicatorMat);
        this.targetIndicator.visible = false;
        this.scene.add(this.targetIndicator);
    }

    dispose() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        window.removeEventListener('resize', this.boundResizeHandler);
        this.resizeListenerAttached = false;
        document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
        this.visibilityListenerAttached = false;

        if (this.scene) {
            this.disposeObject(this.scene);
        }

        Object.values(this.faceTextureCache).forEach(texture => texture.dispose?.());
        Object.values(this.badgeTextureCache).forEach(texture => texture.dispose?.());
        this.faceTextureCache = {};
        this.badgeTextureCache = {};
        this.layerHighlightMaterial?.dispose?.();
        this.layerHighlightMaterial = null;
        this.cleanupFallback();

        if (this.renderer) {
            if (this.renderer.domElement?.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
            this.renderer.domElement?.removeEventListener?.('pointerdown', this.boundPointerDown);
            this.renderer.domElement?.removeEventListener?.('pointermove', this.boundPointerMove);
            this.renderer.domElement?.removeEventListener?.('pointerup', this.boundPointerUp);
            this.renderer.domElement?.removeEventListener?.('pointerleave', this.boundPointerUp);
            this.renderer.domElement?.removeEventListener?.('pointerdown', this.boundLookPointerDown);
            this.renderer.domElement?.removeEventListener?.('wheel', this.boundWheelHandler);
            window.removeEventListener('pointerup', this.boundLookPointerUp);
            window.removeEventListener('pointercancel', this.boundLookPointerUp);
            this.renderer.dispose();
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cublets = [];
        this.playerMesh = null;
        this.aiMeshes = {};
        this.keyMesh = null;
        this.exitMesh = null;
        this.plannedLine = null;
        this.artGroup = null;
        this.targetIndicator = null;
        this.bridgePortalMeshes = [];
        this.renderMode = 'webgl';
        this.isAnimating = false;
        this.boardPointerAttached = false;
    }

    getCameraDistance() {
        const levelIndex = this.game?.currentLevelIndex || 0;
        if (levelIndex === 0) {
            return 21.5;
        }
        if (levelIndex >= 12) {
            return 20.5;
        }
        return 18.5;
    }

    resetCamera() {
        if (!this.camera || !this.controls) return;
        
        let targetLookAt = new THREE.Vector3(0, 0, 0);
        let targetPosition = new THREE.Vector3(10.8, 10.0, 15.9);
        
        if (this.playerMesh) {
            const pPos = this.playerMesh.position.clone();
            const dir = pPos.clone().normalize();
            if (pPos.length() > 0.1) {
                targetPosition.copy(dir).multiplyScalar(this.getCameraDistance());
                targetPosition.y += 9.5;
                targetLookAt.copy(this.getGameplayOrbitPivot(pPos));
            }
        }
        
        const biasX = this.getViewportBiasX();
        targetLookAt.x += biasX;
        
        this.camera.position.copy(targetPosition);
        this.controls.target.copy(targetLookAt);
        this.gameLookAt.copy(targetLookAt);
        this.gameLookAtTarget.copy(targetLookAt);
        this.controls.update();
    }

    setGameViewportBias(phoneOpen = true) {
        const targetX = phoneOpen ? -1.55 : 0;
        if (this.playerMesh) {
            this.gameLookAtTarget.copy(this.getGameplayOrbitPivot(this.playerMesh.position));
            this.gameLookAtTarget.x += targetX;
        } else {
            this.gameLookAtTarget.set(targetX, 0, 0);
        }
    }

    getViewportBiasX() {
        if (!this.gameLookAtTarget) return 0;
        if (this.playerMesh) {
            const pivot = this.getGameplayOrbitPivot(this.playerMesh.position);
            return this.gameLookAtTarget.x - pivot.x;
        }
        return this.gameLookAtTarget.x;
    }

    getGameplayOrbitPivot(playerPosition) {
        if (!playerPosition) return new THREE.Vector3(0, 0, 0);
        // Keep Dawn visually prioritized, but orbit around an internal point so camera drags can cross opposite faces.
        return playerPosition.clone().multiplyScalar(0.35);
    }

    setPresentationMode(mode = 'game') {
        this.presentationMode = ['landing', 'setup', 'constellation', 'game'].includes(mode) ? mode : 'game';
        this.presentationSpeed = this.presentationMode === 'landing'
            ? 0.005
            : (this.presentationMode === 'constellation' ? 0.0024 : (this.presentationMode === 'setup' ? 0.0018 : 0));
        if (this.controls) {
            this.controls.enabled = this.presentationMode === 'game';
            this.controls.enableRotate = this.presentationMode === 'game';
        }
        if (this.presentationMode !== 'game') {
            this.cameraFlight = null;
            this.applyPresentationCamera(true);
        }
    }

    applyPresentationCamera(force = false) {
        if (!this.camera || this.presentationMode === 'game') return;
        if (!force) this.presentationAngle += this.presentationSpeed;
        const isLanding = this.presentationMode === 'landing';
        const isConstellation = this.presentationMode === 'constellation';
        const radius = isLanding ? 16.8 : (isConstellation ? 24.2 : 15.2);
        const height = isLanding ? 10.4 : (isConstellation ? 12.2 : 8.8);
        const drift = isConstellation
            ? new THREE.Vector3(
                Math.sin(this.presentationAngle * 2.2) * 0.9,
                Math.sin(this.presentationAngle * 1.45) * 0.36,
                Math.cos(this.presentationAngle * 1.7) * 0.55
            )
            : new THREE.Vector3(0, 0, 0);
        const lookAt = isLanding
            ? new THREE.Vector3(1.85, -0.62, 0.45)
            : (isConstellation 
                ? new THREE.Vector3(2.4, -0.5, 0.65).add(drift.multiplyScalar(0.35)) 
                : (this.playerMesh 
                    ? this.playerMesh.position.clone() 
                    : new THREE.Vector3(0.65, -0.28, 0.2)));
        const angle = this.presentationAngle;
        this.camera.position.set(
            Math.cos(angle) * radius + lookAt.x * 0.48 + (isConstellation ? drift.x : 0),
            height + Math.sin(angle * 0.7) * (isConstellation ? 0.95 : 0.45) + (isConstellation ? drift.y : 0),
            Math.sin(angle) * radius + lookAt.z * 0.48 + (isConstellation ? drift.z : 0)
        );
        this.camera.lookAt(lookAt);
        if (this.controls) {
            this.controls.target.copy(lookAt);
            this.controls.update();
        }
    }

    flyToGameCamera(duration = 950) {
        if (!this.camera) return Promise.resolve();
        
        let targetPosition = new THREE.Vector3(10.8, 10.0, 15.9);
        if (this.playerMesh) {
            const pPos = this.playerMesh.position.clone();
            const dir = pPos.clone().normalize();
            if (pPos.length() > 0.1) {
                targetPosition.copy(dir).multiplyScalar(this.getCameraDistance());
                targetPosition.y += 9.5;
            }
        }
        
        const targetLookAt = this.playerMesh
            ? this.getGameplayOrbitPivot(this.playerMesh.position)
            : (this.gameLookAtTarget?.clone?.() || new THREE.Vector3(0, 0, 0));
        targetLookAt.x += this.getViewportBiasX();
        this.gameLookAtTarget.copy(targetLookAt);
        const startPosition = this.camera.position.clone();
        const startTime = performance.now();
        this.presentationMode = 'game';
        if (this.controls) {
            this.controls.enabled = false;
            this.controls.enableRotate = false;
        }
        return new Promise(resolve => {
            this.cameraFlight = {
                startPosition,
                targetPosition,
                targetLookAt,
                startTime,
                duration,
                resolve
            };
        });
    }

    updateCameraFlight() {
        if (!this.cameraFlight || !this.camera) return;
        const { startPosition, targetPosition, targetLookAt, startTime, duration, resolve } = this.cameraFlight;
        const raw = Math.min(1, (performance.now() - startTime) / duration);
        const eased = 1 - Math.pow(1 - raw, 3);
        this.camera.position.lerpVectors(startPosition, targetPosition, eased);
        this.camera.lookAt(targetLookAt);
        if (raw >= 1) {
            this.cameraFlight = null;
            if (this.controls) {
                this.controls.target.copy(targetLookAt);
                this.controls.enabled = true;
                this.controls.enableRotate = true;
                this.controls.update();
            }
            resolve?.();
        }
    }

    isCachedTexture(value) {
        if (!value || typeof value !== 'object') return false;
        return Object.values(this.faceTextureCache || {}).includes(value)
            || Object.values(this.badgeTextureCache || {}).includes(value);
    }

    disposeMaterial(material) {
        const materials = Array.isArray(material) ? material : [material];
        materials.forEach(mat => {
            if (!mat) return;
            Object.keys(mat).forEach(key => {
                const value = mat[key];
                if (value && typeof value === 'object' && typeof value.dispose === 'function' && !this.isCachedTexture(value)) {
                    value.dispose();
                }
            });
            if (mat.uniforms) {
                Object.values(mat.uniforms).forEach(uniform => {
                    const value = uniform?.value;
                    if (value && typeof value.dispose === 'function' && !this.isCachedTexture(value)) {
                        value.dispose();
                    }
                });
            }
            mat.dispose?.();
        });
    }

    disposeObject(object) {
        if (!object) return;
        object.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) this.disposeMaterial(child.material);
        });
    }

    // 构建 3D 魔方
    buildCube3D() {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        const N = this.game.N;
        const cubletSize = this.getCubletSize(); // 子方块边长
        this.clearTwistControlRings();
        this.hideTutorialPointer();
        
        // 材质库 (黑色底座 + 半透霓虹贴面)
        const createFaceMaterial = (colorHex, faceId) => {
            const faceColor = new THREE.Color(colorHex);
            const baseColor = faceColor.clone().multiplyScalar(0.42);
            const material = new THREE.MeshPhongMaterial({
                color: baseColor,
                emissive: colorHex,
                emissiveIntensity: 0.34,
                map: this.getFaceTexture(colorHex, faceId),
                specular: 0x8a96ba,
                shininess: 82,
                transparent: true,
                opacity: 0.88
            });
            material.userData = {
                readableFace: true,
                baseColor: baseColor.getHex(),
                laserColor: faceColor.getHex(),
                baseOpacity: 0.88,
                baseEmissiveIntensity: 0.34
            };
            return material;
        };
        
        // 默认暗色材质
        const darkMaterial = new THREE.MeshPhongMaterial({ color: 0x0c0d12, shininess: 10 });
        
        // 各个面的高亮贴色：U, D, L, R, F, B
        const fallbackFaceColors = {
            0: 0x00f0ff,
            1: 0xbd00ff,
            2: 0xff7700,
            3: 0xff0055,
            4: 0x00ff88,
            5: 0xffdd00
        };
        const faceColors = {};
        for (let face = 0; face < 6; face++) {
            faceColors[face] = this.game.faceColors && this.game.faceColors[face]
                ? new THREE.Color(this.game.faceColors[face]).getHex()
                : fallbackFaceColors[face];
        }
        
        // 清理旧物体
        this.cublets.forEach(c => {
            this.scene.remove(c);
            this.disposeObject(c);
        });
        this.cublets = [];
        
        // 魔方坐标范围 [-H, H]，步长为 2
        const H = (N - 1) / 2;
        
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                for (let z = 0; z < N; z++) {
                    // 只渲染外壳块，跳过最中心块
                    if (x > 0 && x < N - 1 && y > 0 && y < N - 1 && z > 0 && z < N - 1) {
                        continue;
                    }
                    // 计算子立方体 3D 相对中心位置
                    const posX = (x - H) * 2;
                    const posY = (y - H) * 2;
                    const posZ = -(z - H) * 2; // Three.js -Z 为后方
                    const faceCellIds = this.getCubletFaceCellIds(x, y, z);
                    
                    // 确定每个子立方体 6 个面的材质
                    const materials = Array(6).fill(darkMaterial);
                    
                    // 检查子方块是否暴露在外面，如果是，赋予对应的霓虹材质
                    if (x === N - 1 && !this.isVoidCellId(faceCellIds[0])) materials[0] = createFaceMaterial(faceColors[3], 3); // R (+X)
                    if (x === 0 && !this.isVoidCellId(faceCellIds[1]))     materials[1] = createFaceMaterial(faceColors[2], 2); // L (-X)
                    if (y === N - 1 && !this.isVoidCellId(faceCellIds[2])) materials[2] = createFaceMaterial(faceColors[0], 0); // U (+Y)
                    if (y === 0 && !this.isVoidCellId(faceCellIds[3]))     materials[3] = createFaceMaterial(faceColors[1], 1); // D (-Y)
                    if (z === 0 && !this.isVoidCellId(faceCellIds[4]))     materials[4] = createFaceMaterial(faceColors[4], 4); // F (+Z)
                    if (z === N - 1 && !this.isVoidCellId(faceCellIds[5])) materials[5] = createFaceMaterial(faceColors[5], 5); // B (-Z)
                    
                    const geometry = new THREE.BoxGeometry(cubletSize, cubletSize, cubletSize);
                    this.removeVoidFaceGroups(geometry, faceCellIds);
                    const mesh = new THREE.Mesh(geometry, materials);
                    mesh.position.set(posX, posY, posZ);
                    
                    // 增加赛博霓虹边缘框线
                    const edges = new THREE.EdgesGeometry(geometry);
                    const readableFace = materials.find(mat => mat && mat.userData && mat.userData.readableFace);
                    const edgeColor = readableFace?.userData?.laserColor || 0x00f0ff;
                    const lineMaterial = this.createLaserLineMaterial(edgeColor, 0.86, 0.5, 0.22);
                    const line = new THREE.LineSegments(edges, lineMaterial);
                    line.computeLineDistances();
                    line.userData = {
                        baseColor: edgeColor,
                        baseColorObject: new THREE.Color(edgeColor),
                        baseOpacity: 0.86,
                        baseDashSize: 0.5,
                        baseGapSize: 0.22,
                        laserPhase: x * 0.91 + y * 1.37 + z * 1.73,
                        isLayerHighlight: false
                    };
                    mesh.add(line);
                    
                    // 挂载局部网格索引以便旋转计算
                    mesh.userData = { gridX: x, gridY: y, gridZ: z };
                    
                    this.scene.add(mesh);
                    this.cublets.push(mesh);
                }
            }
        }
        if (this.interactionMode === 'twist') {
            this.ensureTwistControlRings();
        }
    }

    getCubletFaceCellIds(x, y, z) {
        const ids = Array(6).fill(null);
        if (!this.game) return ids;
        const N = this.game.N;
        if (x === N - 1) ids[0] = this.game.cellId(3, N - 1 - y, z);
        if (x === 0)     ids[1] = this.game.cellId(2, N - 1 - y, N - 1 - z);
        if (y === N - 1) ids[2] = this.game.cellId(0, N - 1 - z, x);
        if (y === 0)     ids[3] = this.game.cellId(1, z, x);
        if (z === 0)     ids[4] = this.game.cellId(4, N - 1 - y, x);
        if (z === N - 1) ids[5] = this.game.cellId(5, N - 1 - y, N - 1 - x);
        return ids;
    }

    isVoidCellId(cellId) {
        return cellId !== null && this.game?.voidCells?.has(cellId);
    }

    removeVoidFaceGroups(geometry, faceCellIds) {
        if (!geometry?.groups?.length || !faceCellIds?.length) return;
        geometry.groups = geometry.groups.filter(group => !this.isVoidCellId(faceCellIds[group.materialIndex]));
    }

    getFaceTexture(colorHex, faceId = 0) {
        const textureKey = `${colorHex}-${faceId}`;
        if (this.faceTextureCache[textureKey]) return this.faceTextureCache[textureKey];

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = 'rgba(255,255,255,0.025)';
        ctx.fillRect(0, 0, 128, 128);

        const rgba = this.hexToRgb(colorHex);
        ctx.strokeStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.86)`;
        ctx.lineWidth = 5;
        ctx.strokeRect(8, 8, 112, 112);

        ctx.lineWidth = 1.4;
        ctx.strokeStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.28)`;
        for (let i = 24; i <= 104; i += 24) {
            ctx.beginPath();
            ctx.moveTo(i, 18);
            ctx.lineTo(i, 110);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(18, i);
            ctx.lineTo(110, i);
            ctx.stroke();
        }

        ctx.strokeStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.46)`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(32, 82);
        ctx.lineTo(54, 82);
        ctx.lineTo(54, 48);
        ctx.lineTo(92, 48);
        ctx.stroke();

        ctx.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.55)`;
        [[32, 82], [54, 82], [54, 48], [92, 48], [96, 92], [28, 34]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3.2, 0, Math.PI * 2);
            ctx.fill();
        });

        const glow = ctx.createLinearGradient(16, 18, 112, 112);
        glow.addColorStop(0, `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0)`);
        glow.addColorStop(0.48, `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.18)`);
        glow.addColorStop(0.54, `rgba(255,255,255,0.32)`);
        glow.addColorStop(0.6, `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.18)`);
        glow.addColorStop(1, `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0)`);
        ctx.strokeStyle = glow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, 108);
        ctx.lineTo(108, 20);
        ctx.stroke();

        this.drawFaceIdentityTexture(ctx, faceId, rgba);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        this.faceTextureCache[textureKey] = texture;
        return texture;
    }

    drawFaceIdentityTexture(ctx, faceId, rgba) {
        ctx.save();
        ctx.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.88)`;
        ctx.strokeStyle = 'rgba(5,8,14,0.72)';
        ctx.lineWidth = 4;
        ctx.font = 'bold 24px Orbitron, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const letters = ['U', 'D', 'L', 'R', 'F', 'B'];
        ctx.strokeText(letters[faceId] || '?', 22, 24);
        ctx.fillText(letters[faceId] || '?', 22, 24);

        ctx.strokeStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.24)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 44);
        ctx.lineTo(12, 14);
        ctx.lineTo(44, 14);
        ctx.stroke();
        ctx.restore();
    }

    hexToRgb(colorHex) {
        if (typeof colorHex === 'number') {
            return {
                r: (colorHex >> 16) & 255,
                g: (colorHex >> 8) & 255,
                b: colorHex & 255
            };
        }

        const clean = String(colorHex).replace('#', '');
        return {
            r: parseInt(clean.slice(0, 2), 16),
            g: parseInt(clean.slice(2, 4), 16),
            b: parseInt(clean.slice(4, 6), 16)
        };
    }

    createLaserLineMaterial(color, opacity = 0.82, dashSize = 0.48, gapSize = 0.2) {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                diffuse: { value: new THREE.Color(color) },
                opacity: { value: opacity },
                dashSize: { value: dashSize },
                gapSize: { value: gapSize },
                dashOffset: { value: 0 },
                scale: { value: 1 }
            },
            vertexShader: `
                attribute float lineDistance;
                varying float vLineDistance;
                uniform float scale;

                void main() {
                    vLineDistance = lineDistance * scale;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 diffuse;
                uniform float opacity;
                uniform float dashSize;
                uniform float gapSize;
                uniform float dashOffset;
                varying float vLineDistance;

                void main() {
                    float totalSize = dashSize + gapSize;
                    float dist = mod(vLineDistance + dashOffset, totalSize);
                    if (dist > dashSize) discard;

                    float center = abs(dist - dashSize * 0.5) / max(dashSize * 0.5, 0.0001);
                    float core = 1.0 - smoothstep(0.08, 1.0, center);
                    vec3 laserColor = mix(diffuse, vec3(1.0), 0.22 + core * 0.48);
                    gl_FragColor = vec4(laserColor, opacity * (0.72 + core * 0.28));
                }
            `
        });
    }

    createTokenMaterial(color, emissiveIntensity = 0.7) {
        return new THREE.MeshPhongMaterial({
            color,
            emissive: color,
            emissiveIntensity,
            shininess: 90
        });
    }

    getLayerHighlightMaterial() {
        if (!this.layerHighlightMaterial) {
            this.layerHighlightMaterial = new THREE.MeshBasicMaterial({
                color: 0xffd447,
                transparent: true,
                opacity: 0.42,
                side: THREE.DoubleSide,
                depthWrite: false
            });
        }
        return this.layerHighlightMaterial;
    }

    createTokenBase(color, radius = 0.4) {
        const group = new THREE.Group();
        const tokenColor = new THREE.Color(color);
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.82, radius, 0.14, 28),
            new THREE.MeshPhongMaterial({
                color: 0x10131c,
                emissive: tokenColor,
                emissiveIntensity: 0.22,
                shininess: 80
            })
        );
        base.position.y = 0.02;
        group.add(base);

        const rim = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.018, 8, 44),
            new THREE.MeshBasicMaterial({
                color: tokenColor,
                transparent: true,
                opacity: 0.78,
                depthWrite: false
            })
        );
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.1;
        group.add(rim);

        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.22, radius * 0.28, 0.34, 16),
            new THREE.MeshPhongMaterial({
                color: tokenColor.clone().multiplyScalar(0.68),
                emissive: tokenColor,
                emissiveIntensity: 0.32,
                shininess: 70
            })
        );
        stem.position.y = 0.26;
        group.add(stem);

        return group;
    }

    createBadgeSprite(type, color) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.getBadgeTexture(type, color),
            transparent: true,
            depthWrite: false
        }));
        sprite.scale.set(0.58, 0.58, 1);
        sprite.position.y = 0.78;
        sprite.renderOrder = 8;
        return sprite;
    }

    getBadgeTexture(type, color) {
        const key = `${type}-${new THREE.Color(color).getHexString()}`;
        if (this.badgeTextureCache[key]) return this.badgeTextureCache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const rgb = this.hexToRgb(new THREE.Color(color).getHex());
        const accent = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.96)`;
        const softAccent = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;

        ctx.clearRect(0, 0, 128, 128);
        ctx.save();
        ctx.shadowColor = accent;
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(5, 8, 14, 0.92)';
        ctx.strokeStyle = accent;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(64, 64, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = softAccent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(64, 64, 54, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = accent;
        ctx.fillStyle = accent;

        if (type === 'player') {
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(42, 70);
            ctx.lineTo(64, 42);
            ctx.lineTo(86, 70);
            ctx.stroke();

            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(64, 44);
            ctx.lineTo(64, 88);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.beginPath();
            ctx.arc(64, 57, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'chaser') {
            ctx.beginPath();
            ctx.moveTo(64, 30);
            ctx.lineTo(94, 92);
            ctx.lineTo(64, 78);
            ctx.lineTo(34, 92);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
            ctx.beginPath();
            ctx.arc(64, 58, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(5, 8, 14, 0.92)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(48, 84);
            ctx.lineTo(80, 84);
            ctx.stroke();
        } else if (type === 'guardian') {
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(64, 55, 18, Math.PI, 0);
            ctx.stroke();

            ctx.fillRect(42, 58, 44, 34);
            ctx.fillStyle = 'rgba(5, 8, 14, 0.94)';
            ctx.beginPath();
            ctx.arc(64, 74, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(61, 78, 6, 12);
        } else {
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(64, 64, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(64, 34);
            ctx.lineTo(64, 94);
            ctx.moveTo(34, 64);
            ctx.lineTo(94, 64);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        this.badgeTextureCache[key] = texture;
        return texture;
    }

    getExitTexture(color, unlocked) {
        const tokenColor = new THREE.Color(color);
        const key = `exit-${tokenColor.getHexString()}-${unlocked ? 'open' : 'locked'}`;
        if (this.badgeTextureCache[key]) return this.badgeTextureCache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const rgb = this.hexToRgb(tokenColor.getHex());
        const accent = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.96)`;
        const softAccent = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.26)`;

        ctx.clearRect(0, 0, 128, 128);
        ctx.save();
        ctx.shadowColor = accent;
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(5, 8, 14, 0.88)';
        ctx.strokeStyle = accent;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(30, 18);
        ctx.lineTo(98, 18);
        ctx.quadraticCurveTo(110, 18, 110, 30);
        ctx.lineTo(110, 98);
        ctx.quadraticCurveTo(110, 110, 98, 110);
        ctx.lineTo(30, 110);
        ctx.quadraticCurveTo(18, 110, 18, 98);
        ctx.lineTo(18, 30);
        ctx.quadraticCurveTo(18, 18, 30, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = softAccent;
        ctx.lineWidth = 2;
        ctx.strokeRect(28, 28, 72, 72);

        ctx.strokeStyle = accent;
        ctx.fillStyle = accent;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 自制“安全出口”读法：门框 + 逃离箭头，避免照搬现实标准图标。
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(42, 86);
        ctx.lineTo(42, 38);
        ctx.lineTo(72, 38);
        ctx.stroke();

        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(56, 66);
        ctx.lineTo(88, 66);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(76, 50);
        ctx.lineTo(92, 66);
        ctx.lineTo(76, 82);
        ctx.stroke();

        if (!unlocked) {
            ctx.fillStyle = 'rgba(255, 183, 0, 0.95)';
            ctx.fillRect(48, 76, 32, 22);
            ctx.strokeStyle = 'rgba(5, 8, 14, 0.95)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(64, 77, 11, Math.PI, 0);
            ctx.stroke();
            ctx.fillStyle = 'rgba(5, 8, 14, 0.95)';
            ctx.beginPath();
            ctx.arc(64, 87, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        this.badgeTextureCache[key] = texture;
        return texture;
    }

    createKeyProp() {
        const group = new THREE.Group();
        const gold = 0xffb700;
        const paleGold = 0xffee8a;
        const metal = new THREE.MeshPhongMaterial({
            color: gold,
            emissive: gold,
            emissiveIntensity: 0.78,
            shininess: 100
        });
        const bright = new THREE.MeshBasicMaterial({
            color: paleGold,
            transparent: true,
            opacity: 0.68,
            depthWrite: false
        });

        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 10, 36), metal);
        bow.position.set(-0.24, 0.04, 0.02);
        group.add(bow);

        const innerBow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 8, 36), bright);
        innerBow.position.copy(bow.position);
        group.add(innerBow);

        const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.06), metal);
        shaft.position.set(0.08, 0.04, 0.02);
        group.add(shaft);

        const toothA = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.06), metal);
        toothA.position.set(0.34, -0.03, 0.02);
        group.add(toothA);

        const toothB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.13, 0.06), metal);
        toothB.position.set(0.46, -0.005, 0.02);
        group.add(toothB);

        const glow = new THREE.Mesh(
            new THREE.RingGeometry(0.38, 0.43, 38),
            new THREE.MeshBasicMaterial({
                color: gold,
                transparent: true,
                opacity: 0.28,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        glow.position.z = -0.01;
        group.add(glow);

        group.userData.spinTarget = group;
        return group;
    }

    createPlayerBody(color) {
        const group = this.createTokenBase(color, 0.41);
        const tokenColor = new THREE.Color(color);

        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 18, 14),
            this.createTokenMaterial(tokenColor, 0.86)
        );
        core.position.y = 0.52;
        group.add(core);

        const visor = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.05, 0.12),
            new THREE.MeshBasicMaterial({
                color: 0xcffff0,
                transparent: true,
                opacity: 0.88,
                depthWrite: false
            })
        );
        visor.position.set(0, 0.56, 0.16);
        group.add(visor);

        const wingMat = new THREE.MeshBasicMaterial({
            color: tokenColor,
            transparent: true,
            opacity: 0.72,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const wingGeo = new THREE.BufferGeometry();
        wingGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            -0.12, 0.48, 0.02,
            -0.48, 0.34, -0.15,
            -0.18, 0.38, -0.28,
            0.12, 0.48, 0.02,
            0.48, 0.34, -0.15,
            0.18, 0.38, -0.28
        ]), 3));
        wingGeo.computeVertexNormals();
        group.add(new THREE.Mesh(wingGeo, wingMat));
        group.add(this.createBadgeSprite('player', tokenColor));
        return group;
    }

    createChaserBody(color) {
        const group = this.createTokenBase(color, 0.39);
        const tokenColor = new THREE.Color(color);
        const mat = this.createTokenMaterial(tokenColor, 0.82);
        const core = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.58, 4), mat);
        core.rotation.x = Math.PI / 2;
        core.position.set(0, 0.52, 0.08);
        group.add(core);

        const clawMat = new THREE.MeshBasicMaterial({
            color: tokenColor,
            transparent: true,
            opacity: 0.78,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const clawGeo = new THREE.BufferGeometry();
        clawGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            0.00, 0.00, 0.42,
            -0.34, 0.00, -0.18,
            -0.12, 0.00, -0.08,
            0.00, 0.00, 0.42,
            0.34, 0.00, -0.18,
            0.12, 0.00, -0.08,
            -0.20, 0.00, -0.08,
            -0.46, 0.00, -0.36,
            -0.10, 0.00, -0.24,
            0.20, 0.00, -0.08,
            0.46, 0.00, -0.36,
            0.10, 0.00, -0.24
        ]), 3));
        clawGeo.computeVertexNormals();
        const claws = new THREE.Mesh(clawGeo, clawMat);
        claws.position.y = 0.42;
        group.add(claws);

        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        eye.position.set(0, 0.55, 0.33);
        group.add(eye);
        group.add(this.createBadgeSprite('chaser', tokenColor));
        return group;
    }

    createGuardianBody(color) {
        const group = this.createTokenBase(color, 0.43);
        const tokenColor = new THREE.Color(color);
        const mat = this.createTokenMaterial(tokenColor, 0.72);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.46, 6), mat);
        body.position.y = 0.52;
        group.add(body);

        const lockPlate = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.08, 0.26),
            new THREE.MeshPhongMaterial({
                color: 0xffdd66,
                emissive: 0xffb700,
                emissiveIntensity: 0.45,
                shininess: 90
            })
        );
        lockPlate.position.y = 0.78;
        group.add(lockPlate);

        const keyhole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.035, 12),
            new THREE.MeshBasicMaterial({ color: 0x08090f })
        );
        keyhole.rotation.x = Math.PI / 2;
        keyhole.position.set(0, 0.84, 0.135);
        group.add(keyhole);

        const shoulderMat = new THREE.MeshBasicMaterial({
            color: tokenColor,
            transparent: true,
            opacity: 0.42,
            depthWrite: false
        });
        const shoulder = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.025, 6, 36), shoulderMat);
        shoulder.rotation.x = Math.PI / 2;
        shoulder.position.y = 0.5;
        group.add(shoulder);
        group.add(this.createBadgeSprite('guardian', tokenColor));

        return group;
    }

    buildSceneArt() {
        if (this.renderMode === 'fallback') return;

        if (this.artGroup) {
            this.scene.remove(this.artGroup);
            this.disposeObject(this.artGroup);
        }
        this.artGroup = new THREE.Group();

        const grid = new THREE.GridHelper(15, 18, 0x00f0ff, 0x273247);
        grid.position.y = -5.1;
        grid.material.transparent = true;
        grid.material.opacity = 0.16;
        this.artGroup.add(grid);

        const makeRing = (color, opacity, rotation) => {
            const geo = new THREE.TorusGeometry(5.15, 0.012, 6, 128);
            const mat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                depthWrite: false
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.set(rotation.x, rotation.y, rotation.z);
            return ring;
        };

        this.artGroup.add(makeRing(0x00f0ff, 0.2, { x: Math.PI / 2, y: 0, z: 0 }));
        this.artGroup.add(makeRing(0xff0055, 0.12, { x: 0, y: Math.PI / 2, z: 0 }));
        this.artGroup.add(makeRing(0x00ff88, 0.13, { x: 0, y: 0, z: 0 }));

        const particleCount = 220;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const colorA = new THREE.Color(0x00f0ff);
        const colorB = new THREE.Color(0xbd00ff);
        for (let i = 0; i < particleCount; i += 1) {
            const radius = 5.2 + Math.random() * 1.6;
            const angle = Math.random() * Math.PI * 2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = -4.8 + Math.random() * 9.6;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            const c = i % 3 === 0 ? colorB : colorA;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const particleMat = new THREE.PointsMaterial({
            size: 0.038,
            transparent: true,
            opacity: 0.46,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const dataRain = new THREE.Points(particleGeo, particleMat);
        dataRain.userData.isDataRain = true;
        this.artGroup.add(dataRain);

        this.scene.add(this.artGroup);
    }

    // 渲染角色、钥匙与逃生门
    spawnEntities3D() {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        // 清理旧物体
        if (this.playerMesh) {
            this.scene.remove(this.playerMesh);
            this.disposeObject(this.playerMesh);
            this.playerSpeechBubble = null;
        }
        Object.values(this.aiMeshes).forEach(m => {
            this.scene.remove(m);
            this.disposeObject(m);
        });
        if (this.keyMesh) {
            this.scene.remove(this.keyMesh);
            this.disposeObject(this.keyMesh);
        }
        if (this.exitMesh) {
            this.scene.remove(this.exitMesh);
            this.disposeObject(this.exitMesh);
        }
        this.bridgePortalMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            this.disposeObject(mesh);
        });
        this.patchMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            this.disposeObject(mesh);
        });
        this.voidMarkerMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            this.disposeObject(mesh);
        });
        this.vineMarkerMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            this.disposeObject(mesh);
        });
        if (this.beaconMesh) {
            this.scene.remove(this.beaconMesh);
            this.disposeObject(this.beaconMesh);
        }
        Object.values(this.threatPreviewMeshes || {}).forEach(mesh => {
            this.scene.remove(mesh);
            this.disposeObject(mesh);
        });
        
        this.aiMeshes = {};
        this.playerMesh = null;
        this.keyMesh = null;
        this.exitMesh = null;
        this.bridgePortalMeshes = [];
        this.patchMeshes = [];
        this.voidMarkerMeshes = [];
        this.vineMarkerMeshes = [];
        this.beaconMesh = null;
        this.threatPreviewMeshes = {};
        
        // 1. 玩家：逃脱者棋座 + 方向翼 + 镜头徽章
        this.playerMesh = this.createPlayerBody(0x00ff88);
        const playerPos3D = this.getCellWorldPosition(this.game.playerPos, 'token');
        this.playerMesh.position.copy(playerPos3D);
        this.orientTokenToCell(this.playerMesh, this.game.playerPos);
        
        // 玩家光晕
        const playerLight = new THREE.PointLight(0x00ff88, 1, 3);
        this.playerMesh.add(playerLight);
        this.attachRealtimeTimerVisual(this.playerMesh, '#8bdcff', 'GO', 'player', { showLabel: false });
        if (this.lastSpeechBubbleText) {
            this.setPlayerSpeechBubble(this.lastSpeechBubbleText, this.lastSpeechBubbleTone);
        }
        this.scene.add(this.playerMesh);
        
        // 2. AI 敌人
        this.game.ais.forEach(ai => {
            const mesh = new THREE.Group();
            let body;
            if (ai.type === 'chaser') {
                body = this.createChaserBody(ai.color);
            } else if (ai.type === 'ambusher') {
                // 伏击者 (圆环结构)
                const aiGeo = new THREE.TorusGeometry(0.22, 0.08, 8, 24);
                body = new THREE.Mesh(aiGeo, this.createTokenMaterial(ai.color, 0.68));
            } else {
                body = this.createGuardianBody(ai.color);
            }

            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(ai.type === 'guardian' ? 0.42 : 0.36, 0.018, 6, 30),
                new THREE.MeshBasicMaterial({
                    color: ai.color,
                    transparent: true,
                    opacity: ai.type === 'guardian' ? 0.72 : 0.44,
                    depthWrite: false
                })
            );
            ring.rotation.x = Math.PI / 2;
            mesh.add(body);
            mesh.add(ring);
            
            const aiPos3D = this.getCellWorldPosition(ai.pos, 'token');
            mesh.position.copy(aiPos3D);
            this.orientTokenToCell(mesh, ai.pos);
            
            // AI 光晕
            const aiLight = new THREE.PointLight(ai.color, 0.8, 2.5);
            mesh.add(aiLight);
            this.attachRealtimeTimerVisual(mesh, ai.color || '#ff0055', '...', 'ai', { showLabel: false });
            
            this.scene.add(mesh);
            this.aiMeshes[ai.id] = mesh;
        });
        
        // 3. 钥匙：直接做成可识别的钥匙轮廓
        if (!this.game.hasKey && this.game.keyPos !== null) {
            this.keyMesh = new THREE.Group();
            const keyProp = this.createKeyProp();
            this.keyMesh.add(keyProp);
            this.keyMesh.position.copy(this.getCellWorldPosition(this.game.keyPos, 'key'));
            const keyCell = this.game.cells[this.game.keyPos];
            const keyNormal = new THREE.Vector3(keyCell.normal.x, keyCell.normal.y, keyCell.normal.z);
            this.keyMesh.position.addScaledVector(keyNormal, 0.04);
            const alignKey = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), keyNormal);
            const keyTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 3.2);
            this.keyMesh.quaternion.copy(alignKey).multiply(keyTilt);
            this.keyMesh.userData.spinTarget = keyProp;

            const keyLight = new THREE.PointLight(0xffb700, 0.8, 2.4);
            this.keyMesh.add(keyLight);
            this.scene.add(this.keyMesh);
        }

        // 4. 逃生门从开局可见，拿到钥匙后变为绿色
        this.spawnExitPortal(this.game.exitPos);
        this.spawnBridgePortals();
        this.spawnToolAndVoidMarkers();
        this.updateDoorState();
    }

    spawnToolAndVoidMarkers() {
        if (!this.game) return;

        this.game.activePatchCells.forEach(cellId => {
            const patch = this.createPatchPlate(cellId);
            this.scene.add(patch);
            this.patchMeshes.push(patch);
        });

        if (this.game.beaconCell !== null && this.game.beaconCell !== undefined) {
            this.beaconMesh = this.createBeaconProp(this.game.beaconCell);
            this.scene.add(this.beaconMesh);
        }

        this.game.immuneToVineCells?.forEach(cellId => {
            const marker = this.createVineMarker(cellId, 'immune');
            this.scene.add(marker);
            this.vineMarkerMeshes.push(marker);
        });

        this.game.vineCells?.forEach(cellId => {
            const marker = this.createVineMarker(
                cellId,
                this.game.vineSources?.has(cellId) ? 'source' : 'vine'
            );
            this.scene.add(marker);
            this.vineMarkerMeshes.push(marker);
        });
    }

    createVineMarker(cellId, kind = 'vine') {
        const group = new THREE.Group();
        group.userData.cellId = cellId;
        group.userData.kind = kind;
        const normal = this.getCellNormalVector(cellId);
        group.position.copy(this.getCellWorldPosition(cellId, 'portal').clone().addScaledVector(normal, 0.02));
        group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

        const color = kind === 'source' ? 0xff335f : (kind === 'immune' ? 0xc67a2c : 0x00f5d4);
        const opacity = kind === 'immune' ? 0.32 : 0.46;
        const plate = new THREE.Mesh(
            new THREE.PlaneGeometry(0.76, 0.76),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        group.add(plate);

        const ring = new THREE.Mesh(
            new THREE.RingGeometry(kind === 'source' ? 0.16 : 0.24, kind === 'source' ? 0.34 : 0.37, kind === 'immune' ? 6 : 8),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: kind === 'immune' ? 0.42 : 0.72,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        ring.position.z = 0.012;
        ring.rotation.z = kind === 'immune' ? Math.PI / 6 : 0.32;
        group.add(ring);

        if (kind === 'source') {
            const core = new THREE.Mesh(
                new THREE.CircleGeometry(0.13, 18),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.88,
                    side: THREE.DoubleSide,
                    depthWrite: false
                })
            );
            core.position.z = 0.02;
            group.add(core);
            const light = new THREE.PointLight(color, 0.5, 1.6);
            light.position.z = 0.15;
            group.add(light);
        }

        return group;
    }

    createVoidMarker(cellId) {
        const group = new THREE.Group();
        group.userData.cellId = cellId;
        const normal = this.getCellNormalVector(cellId);
        const pos = this.getCellWorldPosition(cellId, 'portal').clone().addScaledVector(normal, 0.018);
        group.position.copy(pos);
        group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(0.72, 0.72),
            new THREE.MeshBasicMaterial({
                color: 0x9ff7ff,
                transparent: true,
                opacity: 0.16,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: true
            })
        );
        glass.userData.isVoidGlass = true;
        group.add(glass);

        const rim = new THREE.Mesh(
            new THREE.RingGeometry(0.42, 0.49, 4),
            new THREE.MeshBasicMaterial({
                color: 0xffd45a,
                transparent: true,
                opacity: 0.62,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: true
            })
        );
        rim.rotation.z = Math.PI / 4;
        rim.position.z = 0.006;
        group.add(rim);

        const crackPoints = [
            0, 0, 0.014, 0.24, 0.12, 0.014,
            0, 0, 0.014, -0.22, 0.16, 0.014,
            0, 0, 0.014, 0.1, -0.26, 0.014,
            0.08, -0.08, 0.014, 0.28, -0.24, 0.014,
            -0.08, 0.06, 0.014, -0.3, -0.08, 0.014,
            0.12, 0.04, 0.014, 0.28, 0.28, 0.014
        ];
        const crackGeo = new THREE.BufferGeometry();
        crackGeo.setAttribute('position', new THREE.Float32BufferAttribute(crackPoints, 3));
        const cracks = new THREE.LineSegments(
            crackGeo,
            new THREE.LineBasicMaterial({
                color: 0xf8feff,
                transparent: true,
                opacity: 0.74,
                depthWrite: false,
                depthTest: true
            })
        );
        group.add(cracks);

        const crack = new THREE.Mesh(
            new THREE.RingGeometry(0.12, 0.23, 5),
            new THREE.MeshBasicMaterial({
                color: 0xffb700,
                transparent: true,
                opacity: 0.28,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: true
            })
        );
        crack.rotation.z = 0.4;
        crack.position.z = 0.012;
        group.add(crack);
        return group;
    }

    createPatchPlate(cellId) {
        const group = new THREE.Group();
        group.userData.cellId = cellId;
        const normal = this.getCellNormalVector(cellId);
        group.position.copy(this.getCellWorldPosition(cellId, 'portal'));
        group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

        const mat = new THREE.MeshBasicMaterial({
            color: 0x8bdcff,
            transparent: true,
            opacity: 0.54,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.82), mat);
        plate.rotation.z = 0.18;
        group.add(plate);

        const rim = new THREE.Mesh(
            new THREE.RingGeometry(0.36, 0.43, 4),
            new THREE.MeshBasicMaterial({
                color: 0xd9fbff,
                transparent: true,
                opacity: 0.72,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        rim.rotation.z = Math.PI / 4;
        rim.position.z = 0.015;
        group.add(rim);

        const light = new THREE.PointLight(0x8bdcff, 0.45, 2.2);
        light.position.z = 0.12;
        group.add(light);
        return group;
    }

    createBeaconProp(cellId) {
        const group = new THREE.Group();
        group.userData.cellId = cellId;
        const normal = this.getCellNormalVector(cellId);
        group.position.copy(this.getCellWorldPosition(cellId, 'token'));
        group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

        const mat = this.createTokenMaterial(0xffb700, 0.78);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.5, 12), mat);
        pole.position.y = 0.24;
        group.add(pole);

        const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), mat);
        head.position.y = 0.55;
        group.add(head);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.28, 0.012, 6, 36),
            new THREE.MeshBasicMaterial({
                color: 0xffb700,
                transparent: true,
                opacity: 0.68,
                depthWrite: false
            })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.53;
        group.add(ring);
        group.userData.spinTarget = ring;

        const light = new THREE.PointLight(0xffb700, 0.75, 2.8);
        light.position.y = 0.64;
        group.add(light);
        return group;
    }

    updateDoorState() {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }
        if (!this.exitMesh) return;
        const unlocked = this.game && this.game.hasKey;
        const wasInitialized = Boolean(this.exitMesh.userData.stateInitialized);
        const previouslyUnlocked = Boolean(this.exitMesh.userData.unlocked);
        const color = unlocked ? 0x00ff88 : 0xffb700;
        if (this.exitMesh.userData.iconMaterial) {
            this.exitMesh.userData.iconMaterial.map = this.getExitTexture(0x00ff88, unlocked);
            this.exitMesh.userData.iconMaterial.needsUpdate = true;
        }
        (this.exitMesh.userData.detailMaterials || []).forEach(mat => {
            mat.color.setHex(color);
            mat.opacity = unlocked ? 0.72 : 0.48;
            if (mat.emissive) {
                mat.emissive.setHex(color);
                mat.emissiveIntensity = unlocked ? 0.9 : 0.52;
            }
        });
        this.exitMesh.userData.unlocked = unlocked;
        this.exitMesh.userData.stateInitialized = true;

        if (wasInitialized && !previouslyUnlocked && unlocked) {
            this.spawnCellPulse(this.game.exitPos, '#00ff88', 1.25);
            if (window.audioFeedback) window.audioFeedback.play('door');
        }
    }

    // 兼容旧调用名：当前它生成的是逃生门
    spawnExitPortal(exitPos) {
        if (this.exitMesh) {
            this.scene.remove(this.exitMesh);
            this.disposeObject(this.exitMesh);
        }

        this.exitMesh = new THREE.Group();
        
        const pos3D = this.getCellWorldPosition(exitPos, 'exit');
        this.exitMesh.position.copy(pos3D);
        
        const cell = this.game.cells[exitPos];
        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        this.exitMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        
        const signMat = new THREE.MeshBasicMaterial({
            map: this.getExitTexture(0x00ff88, false),
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.82), signMat);
        sign.position.z = 0.06;
        this.exitMesh.add(sign);

        const portalGeo = new THREE.TorusGeometry(0.48, 0.045, 8, 36);
        const portalMat = new THREE.MeshPhongMaterial({
            color: 0xffb700,
            emissive: 0xffb700,
            emissiveIntensity: 0.52,
            shininess: 100,
            transparent: true,
            opacity: 0.78
        });
        const portalRing = new THREE.Mesh(portalGeo, portalMat);
        portalRing.position.z = 0.03;
        this.exitMesh.add(portalRing);

        const outerRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.62, 0.018, 8, 44),
            new THREE.MeshBasicMaterial({
                color: 0xffb700,
                transparent: true,
                opacity: 0.48,
                depthWrite: false
            })
        );
        outerRing.position.z = 0.04;
        this.exitMesh.add(outerRing);

        const portalLight = new THREE.PointLight(0xffb700, 1, 3);
        this.exitMesh.add(portalLight);
        this.exitMesh.userData.unlocked = false;
        this.exitMesh.userData.stateInitialized = false;
        this.exitMesh.userData.iconMaterial = signMat;
        this.exitMesh.userData.detailMaterials = [portalMat, outerRing.material];
        this.scene.add(this.exitMesh);
    }

    spawnBridgePortals() {
        this.bridgePortalMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            this.disposeObject(mesh);
        });
        this.bridgePortalMeshes = [];

        (this.game.bridges || []).forEach((link, index) => {
            [
                { cellId: link.a, color: 0x35e6ff, label: 'A' },
                { cellId: link.b, color: 0xffb700, label: 'B' }
            ].forEach(config => {
                const portal = this.createBridgePortalEndpoint(config.color, config.label);
                portal.position.copy(this.getCellWorldPosition(config.cellId, 'portal'));
                const normal = this.getCellNormalVector(config.cellId);
                portal.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
                portal.userData.cellId = config.cellId;
                portal.userData.bridgeIndex = index;
                portal.userData.spinTarget = portal.userData.spinTarget || portal;
                this.scene.add(portal);
                this.bridgePortalMeshes.push(portal);
            });
        });
    }

    createBridgePortalEndpoint(color, label) {
        const group = new THREE.Group();
        const portalColor = new THREE.Color(color);
        const hotColor = portalColor.clone().lerp(new THREE.Color(0xffffff), 0.22);
        const ringMat = new THREE.MeshBasicMaterial({
            color: portalColor,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.017, 10, 72), ringMat);
        outerRing.scale.set(0.58, 1.58, 1);
        outerRing.position.z = 0.045;
        group.add(outerRing);

        const innerRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.27, 0.008, 8, 64),
            new THREE.MeshBasicMaterial({
                color: hotColor,
                transparent: true,
                opacity: 0.52,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        innerRing.scale.set(0.54, 1.48, 1);
        innerRing.position.z = 0.055;
        group.add(innerRing);

        const aperture = new THREE.Mesh(
            new THREE.CircleGeometry(0.34, 64),
            new THREE.MeshBasicMaterial({
                color: 0x07111d,
                transparent: true,
                opacity: 0.48,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        aperture.scale.set(0.56, 1.52, 1);
        aperture.position.z = 0.025;
        group.add(aperture);

        const shimmer = new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.35, 56),
            new THREE.MeshBasicMaterial({
                color: portalColor,
                transparent: true,
                opacity: 0.24,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        shimmer.scale.set(0.6, 1.5, 1);
        shimmer.position.z = 0.035;
        group.add(shimmer);

        const flameGroup = new THREE.Group();
        const flameMat = new THREE.MeshBasicMaterial({
            color: hotColor,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            const length = 0.08 + (i % 4) * 0.018;
            const lick = new THREE.Mesh(new THREE.PlaneGeometry(0.028, length), flameMat);
            lick.position.set(Math.cos(angle) * 0.2, Math.sin(angle) * 0.54, 0.065);
            lick.rotation.z = angle + Math.PI / 2;
            lick.userData.baseAngle = angle;
            flameGroup.add(lick);
        }
        group.add(flameGroup);

        const arcMat = new THREE.LineBasicMaterial({
            color: hotColor,
            transparent: true,
            opacity: 0.55
        });
        const makeArc = (offset, radiusX, radiusY) => {
            const points = [];
            for (let i = 0; i <= 20; i++) {
                const t = offset + (i / 20) * Math.PI * 1.08;
                points.push(new THREE.Vector3(Math.cos(t) * radiusX, Math.sin(t) * radiusY, 0.07));
            }
            return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), arcMat);
        };
        const arcGroup = new THREE.Group();
        arcGroup.add(makeArc(0.1, 0.18, 0.47));
        arcGroup.add(makeArc(2.25, 0.16, 0.41));
        group.add(arcGroup);

        const light = new THREE.PointLight(color, 0.66, 2.6);
        light.position.z = 0.11;
        group.add(light);
        group.userData.spinTarget = outerRing;
        group.userData.innerSpinTarget = innerRing;
        group.userData.shimmerTarget = shimmer;
        group.userData.apertureTarget = aperture;
        group.userData.flameTarget = flameGroup;
        group.userData.arcTarget = arcGroup;
        return group;
    }

    createPortalLabelSprite(label, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        const rgb = this.hexToRgb(new THREE.Color(color).getHex());
        ctx.clearRect(0, 0, 96, 96);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.24)`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(48, 48, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(245, 252, 255, 0.96)';
        ctx.font = '900 44px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 48, 51);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        }));
        sprite.scale.set(0.34, 0.34, 1);
        sprite.renderOrder = 9;
        return sprite;
    }

    // 绘制规划路径引导线 (绿色光带) 与终点高亮
    drawPlannedPath(path) {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        if (this.plannedLine) {
            this.scene.remove(this.plannedLine);
            this.disposeObject(this.plannedLine);
            this.plannedLine = null;
        }
        
        if (path.length === 0) {
            if (this.targetIndicator) this.targetIndicator.visible = false;
            return;
        }
        
        // 收集路径世界坐标
        const points = [this.getCellWorldPosition(this.game.playerPos, 'route')];
        path.forEach(cellId => {
            points.push(this.getCellWorldPosition(cellId, 'route'));
        });

        this.plannedLine = new THREE.Group();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        this.plannedLine.add(new THREE.Line(geometry, material));
        for (let i = 0; i < points.length - 1; i++) {
            const arrow = this.createRouteArrow(points[i], points[i + 1]);
            if (arrow) this.plannedLine.add(arrow);
        }
        this.scene.add(this.plannedLine);

        // 更新终点高亮指示器
        const targetId = path[path.length - 1];
        const targetPos = this.getCellCubletCenter(targetId);
        this.targetIndicator.position.copy(targetPos);
        
        const cell = this.game.cells[targetId];
        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        this.targetIndicator.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        this.targetIndicator.visible = true;
    }

    createRouteArrow(from, to) {
        const direction = new THREE.Vector3().subVectors(to, from);
        if (direction.lengthSq() < 0.0001) return null;
        const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(0.09, 0.24, 18),
            new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.86,
                depthWrite: false
            })
        );
        cone.position.copy(midpoint);
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        return cone;
    }

    // 钥匙收集溶解特效
    collectKeyEffect(cellId = null) {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        const mesh = this.keyMesh;
        if (!mesh) return;

        this.spawnCellPulse(cellId, '#ffb700', 1.25);
        const floatNormal = this.getCellNormalVector(cellId);
        
        // 播放渐隐和浮空效果
        let opacity = 1;
        const fade = () => {
            opacity -= 0.1;
            mesh.position.addScaledVector(floatNormal, 0.08);
            mesh.scale.multiplyScalar(0.9);
            
            if (opacity > 0) {
                requestAnimationFrame(fade);
            } else {
                this.scene.remove(mesh);
                this.disposeObject(mesh);
                this.keyMesh = null;
            }
        };
        fade();
    }

    collectChipEffect(chipId) {
        this.collectKeyEffect(chipId);
    }

    getCubletSize() {
        return this.cubletSize || 1.95;
    }

    getCellNormalVector(cellOrId) {
        const cell = typeof cellOrId === 'number'
            ? this.game?.cells?.[cellOrId]
            : cellOrId;
        if (!cell) return new THREE.Vector3(0, 1, 0);

        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        return normal.lengthSq() > 0 ? normal.normalize() : new THREE.Vector3(0, 1, 0);
    }

    getCellCubletCenter(cellId) {
        const cell = this.game.cells[cellId];
        if (!cell) return new THREE.Vector3(0,0,0);

        const N = this.game?.N || 3;
        const normal = this.getCellNormalVector(cell);
        const base = new THREE.Vector3();
        ['x', 'y', 'z'].forEach(axis => {
            base[axis] = Math.abs(normal[axis]) > 0.5
                ? normal[axis] * (N - 1)
                : cell.pos[axis] * N;
        });

        return base;
    }

    getCellLift(role = 'token') {
        const lifts = {
            token: 0.12,
            key: 0.21,
            exit: 0.1,
            portal: 0.11,
            route: 0.22,
            pulse: 0.16
        };
        return lifts[role] ?? lifts.token;
    }

    // 计算格子的 3D 世界坐标：小方块中心 + 真实外表面高度 + 类型悬浮量。
    getCellWorldPosition(cellId, role = 'token') {
        const cell = this.game.cells[cellId];
        if (!cell) return new THREE.Vector3(0,0,0);

        const base = this.getCellCubletCenter(cellId);
        const normal = this.getCellNormalVector(cell);
        base.addScaledVector(normal, this.getCubletSize() / 2 + this.getCellLift(role));

        return base;
    }

    orientTokenToCell(mesh, cellId) {
        const cell = this.game.cells[cellId];
        if (!mesh || !cell) return;

        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    }

    // 平滑位移棋子 (带球面弧度插值)
    movePlayer(targetCellId) {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        this.spawnCellPulse(targetCellId, '#00ff88', 0.42);
        this.interpolateMeshPosition(this.playerMesh, targetCellId);
    }

    moveAI(aiId, targetCellId) {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        const mesh = this.aiMeshes[aiId];
        if (mesh) {
            this.interpolateMeshPosition(mesh, targetCellId);
        }
    }

    animateBridgeTransit(kind, aiId, fromCellId, targetCellId) {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }
        const mesh = kind === 'player' ? this.playerMesh : this.aiMeshes[aiId];
        if (!mesh) return;

        const from = this.getCellWorldPosition(fromCellId, 'token');
        const to = this.getCellWorldPosition(targetCellId, 'token');
        const originalScale = mesh.scale.clone();
        const duration = 560;
        const startedAt = performance.now();
        this.spawnCellPulse(fromCellId, '#35e6ff', 0.72);
        this.spawnCellPulse(targetCellId, '#ffb700', 0.72);

        const animateTransit = () => {
            const now = performance.now();
            const t = Math.min(1, (now - startedAt) / duration);
            const half = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
            const ease = half < 0.5
                ? 4 * half * half * half
                : 1 - Math.pow(-2 * half + 2, 3) / 2;

            if (t < 0.5) {
                mesh.position.copy(from);
                const scale = 1 - ease * 0.76;
                mesh.scale.set(
                    originalScale.x * scale,
                    originalScale.y * Math.max(0.12, scale * 0.72),
                    originalScale.z * scale
                );
            } else {
                mesh.position.copy(to);
                this.orientTokenToCell(mesh, targetCellId);
                const scale = 0.24 + ease * 0.76;
                mesh.scale.set(
                    originalScale.x * scale,
                    originalScale.y * Math.max(0.12, originalScale.y * scale),
                    originalScale.z * scale
                );
            }

            if (t < 1) {
                requestAnimationFrame(animateTransit);
            } else {
                mesh.position.copy(to);
                this.orientTokenToCell(mesh, targetCellId);
                mesh.scale.copy(originalScale);
            }
        };
        requestAnimationFrame(animateTransit);
    }

    attachRealtimeTimerVisual(group, color, label, kind, options = {}) {
        if (!group) return;
        const showLabel = options.showLabel !== false;
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(kind === 'player' ? 0.52 : 0.39, kind === 'player' ? 0.024 : 0.018, 8, 48),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(color),
                transparent: true,
                opacity: kind === 'player' ? 0.36 : 0.24,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = kind === 'player' ? 0.02 : 0.04;
        group.add(ring);
        const labelSprite = showLabel ? this.createTimerLabelSprite(label, color) : null;
        if (labelSprite) {
            labelSprite.position.set(0, kind === 'player' ? 1.34 : 1.24, 0);
            labelSprite.scale.set(kind === 'player' ? 0.96 : 0.9, kind === 'player' ? 0.34 : 0.32, 1);
            group.add(labelSprite);
        }
        group.userData.realtimeTimer = {
            ring,
            labelSprite,
            color,
            label,
            kind,
            showLabel
        };
    }

    createTimerLabelSprite(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 64;
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0.92
        });
        const sprite = new THREE.Sprite(material);
        sprite.userData.timerCanvas = canvas;
        sprite.userData.timerTexture = texture;
        sprite.userData.timerColor = color;
        this.updateTimerLabelSprite(sprite, text);
        return sprite;
    }

    updateTimerLabelSprite(sprite, text, urgency = 0) {
        const urgencyKey = Math.round(urgency * 10);
        if (!sprite || (sprite.userData.timerText === text && sprite.userData.timerUrgencyKey === urgencyKey)) return;
        const canvas = sprite.userData.timerCanvas;
        const texture = sprite.userData.timerTexture;
        const color = sprite.userData.timerColor || '#8bdcff';
        const ctx = canvas?.getContext?.('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const danger = urgency > 0.72;
        const hot = danger ? '#ff2d73' : color;
        ctx.font = '900 38px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = hot;
        ctx.shadowBlur = danger ? 24 : 18;
        ctx.fillStyle = danger ? 'rgba(38, 0, 16, 0.9)' : 'rgba(1, 8, 16, 0.88)';
        this.roundRect(ctx, 10, 8, 140, 48, 18);
        ctx.fill();
        ctx.lineWidth = danger ? 4 : 3;
        ctx.strokeStyle = hot;
        this.roundRect(ctx, 10, 8, 140, 48, 18);
        ctx.stroke();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.86)';
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2 + 1);
        ctx.fillStyle = danger ? '#fff2f6' : '#f5fbff';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
        texture.needsUpdate = true;
        sprite.userData.timerText = text;
        sprite.userData.timerUrgencyKey = urgencyKey;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    updateRealtimeTimerVisuals() {
        if (!this.game?.realtimeMode || this.renderMode === 'fallback') return;
        const state = this.game.getRealtimeVisualState?.();
        if (!state) return;
        this.applyTimerState(this.playerMesh, state.player, '#8bdcff');
        state.ais.forEach(aiState => {
            this.applyTimerState(this.aiMeshes[aiState.id], aiState, aiState.color || '#ff0055');
        });
        this.updateThreatPreviewMeshes(state.ais);
    }

    applyTimerState(mesh, state, color) {
        const visual = mesh?.userData?.realtimeTimer;
        if (!visual || !state) return;
        const urgency = 1 - Math.max(0, Math.min(1, state.remainingMs / Math.max(1, state.intervalMs || this.game.playerMoveCooldownMs)));
        visual.ring.material.opacity = 0.22 + urgency * 0.58;
        const scale = 0.78 + urgency * 0.34;
        visual.ring.scale.set(scale, scale, scale);
        visual.ring.rotation.z += 0.018 + urgency * 0.03;
        if (!visual.labelSprite) return;
        this.updateTimerLabelSprite(visual.labelSprite, state.label, urgency);
        visual.labelSprite.material.opacity = state.remainingMs > 0 ? 1 : 0.78;
        visual.labelSprite.userData.timerColor = color;
        const labelScale = visual.kind === 'player' ? 1.04 : 1;
        const pulse = 1 + urgency * 0.18;
        visual.labelSprite.scale.set(
            (visual.kind === 'player' ? 0.96 : 0.9) * labelScale * pulse,
            (visual.kind === 'player' ? 0.34 : 0.32) * labelScale * pulse,
            1
        );
    }

    updateThreatPreviewMeshes(aiStates) {
        const active = new Set();
        aiStates.forEach(aiState => {
            if (aiState.nextCell === null || aiState.nextCell === undefined) return;
            const key = String(aiState.id);
            active.add(key);
            if (!this.threatPreviewMeshes[key]) {
                const mesh = this.createThreatPreviewMesh(aiState.nextCell, aiState.color || '#ff0055');
                this.threatPreviewMeshes[key] = mesh;
                this.scene.add(mesh);
            }
            const mesh = this.threatPreviewMeshes[key];
            const normal = this.getCellNormalVector(this.game.cells[aiState.nextCell]);
            mesh.position.copy(this.getCellWorldPosition(aiState.nextCell, 'pulse').clone().addScaledVector(normal, 0.045));
            mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
            const urgency = Math.max(0, Math.min(1, aiState.progress));
            if (mesh.userData?.fillMaterial) {
                mesh.userData.fillMaterial.opacity = 0.52 + urgency * 0.32;
            }
            if (mesh.userData?.outerMaterial) {
                mesh.userData.outerMaterial.opacity = 0.82 + urgency * 0.16;
            }
            if (mesh.userData?.innerMaterial) {
                mesh.userData.innerMaterial.opacity = 0.34 + urgency * 0.24;
            }
            if (mesh.userData?.slashMaterial) {
                mesh.userData.slashMaterial.opacity = 0.74 + urgency * 0.2;
            }
            const scale = 0.98 + urgency * 0.26 + Math.sin(Date.now() * (0.008 + urgency * 0.02)) * 0.09;
            mesh.scale.set(scale, scale, 1);
        });
        Object.keys(this.threatPreviewMeshes).forEach(key => {
            if (active.has(key)) return;
            const mesh = this.threatPreviewMeshes[key];
            this.scene.remove(mesh);
            this.disposeObject(mesh);
            delete this.threatPreviewMeshes[key];
        });
    }

    createThreatPreviewMesh(cellId, color) {
        const normal = this.getCellNormalVector(this.game.cells[cellId]);
        const markerColor = new THREE.Color(color || '#ff0055');
        const warningColor = markerColor.clone().lerp(new THREE.Color(0xffffff), 0.08);
        const dangerFill = markerColor.clone().lerp(new THREE.Color(0x050814), 0.22);
        const slashColor = markerColor.clone().lerp(new THREE.Color(0xffffff), 0.34);
        const group = new THREE.Group();
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: dangerFill,
            transparent: true,
            opacity: 0.58,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const outerMaterial = new THREE.MeshBasicMaterial({
            color: warningColor,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.28,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const slashMaterial = new THREE.MeshBasicMaterial({
            color: slashColor,
            transparent: true,
            opacity: 0.82,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const fill = new THREE.Mesh(new THREE.CircleGeometry(0.52, 72), fillMaterial);
        const outer = new THREE.Mesh(new THREE.RingGeometry(0.31, 0.55, 64), outerMaterial);
        const inner = new THREE.Mesh(new THREE.CircleGeometry(0.18, 48), innerMaterial);
        const slash = new THREE.Mesh(
            new THREE.PlaneGeometry(0.76, 0.055),
            slashMaterial
        );
        slash.rotation.z = Math.PI / 4;
        group.add(fill);
        group.add(outer);
        group.add(inner);
        group.add(slash);
        group.userData.fillMaterial = fillMaterial;
        group.userData.outerMaterial = outerMaterial;
        group.userData.innerMaterial = innerMaterial;
        group.userData.slashMaterial = slashMaterial;
        group.position.copy(this.getCellWorldPosition(cellId, 'pulse').clone().addScaledVector(normal, 0.045));
        group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        return group;
    }

    getRealtimeEntityDistance(aiId) {
        const aiMesh = this.aiMeshes?.[aiId];
        if (!this.playerMesh || !aiMesh) return Infinity;
        return this.playerMesh.position.distanceTo(aiMesh.position);
    }

    setPlayerSpeechBubble(text, tone = 'info') {
        const headBubblesEnabled = false;
        this.lastSpeechBubbleText = headBubblesEnabled ? (text || '') : '';
        this.lastSpeechBubbleTone = tone || 'info';
        if (!this.lastSpeechBubbleText) {
            if (this.playerSpeechBubble?.parent) this.playerSpeechBubble.parent.remove(this.playerSpeechBubble);
            this.disposeObject(this.playerSpeechBubble);
            this.playerSpeechBubble = null;
            return;
        }
        if (!this.playerMesh) return;
        if (!this.playerSpeechBubble) {
            this.playerSpeechBubble = this.createSpeechBubbleSprite();
            this.playerSpeechBubble.position.set(1.16, 1.78, 0.08);
            this.playerSpeechBubble.scale.set(2.18, 0.66, 1);
            this.playerMesh.add(this.playerSpeechBubble);
        } else if (this.playerSpeechBubble.parent !== this.playerMesh) {
            this.playerMesh.add(this.playerSpeechBubble);
        }
        this.drawSpeechBubble(this.playerSpeechBubble, this.lastSpeechBubbleText, this.lastSpeechBubbleTone);
    }

    createSpeechBubbleSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 160;
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0.96
        });
        const sprite = new THREE.Sprite(material);
        sprite.userData.speechCanvas = canvas;
        sprite.userData.speechTexture = texture;
        return sprite;
    }

    createTutorialArrowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 128);
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.moveTo(64, 16);
        ctx.lineTo(104, 60);
        ctx.lineTo(76, 60);
        ctx.lineTo(76, 112);
        ctx.lineTo(52, 112);
        ctx.lineTo(52, 60);
        ctx.lineTo(24, 60);
        ctx.closePath();
        ctx.fill();
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    getTutorialHighlightKind(cellId, step = {}) {
        if (step.highlightTarget) return step.highlightTarget;
        if (cellId === this.game?.exitPos) return 'exit';
        if (cellId === this.game?.keyPos) return 'key';
        const aiAtCell = this.game?.ais?.find(ai => ai.pos === cellId);
        if (aiAtCell?.type === 'guardian') return 'guardian';
        if (aiAtCell) return 'enemy';
        return null;
    }

    getTutorialHighlightHost(kind, cellId) {
        if (kind === 'exit') return this.exitMesh;
        if (kind === 'key') return this.keyMesh;
        if (kind === 'player') return this.playerMesh;
        if (kind === 'guardian' || kind === 'enemy') {
            const ai = this.game?.ais?.find(item => item.pos === cellId || (kind === 'guardian' && item.type === 'guardian'));
            return ai ? this.aiMeshes?.[ai.id] : null;
        }
        return null;
    }

    hideTutorialObjectHighlight() {
        if (!this.tutorialObjectHalo) return;
        this.scene?.remove(this.tutorialObjectHalo);
        this.disposeObject(this.tutorialObjectHalo);
        this.tutorialObjectHalo = null;
    }

    showTutorialObjectHighlight(kind, cellId) {
        this.hideTutorialObjectHighlight();
        if (!kind || !this.scene || !this.game) return;
        const host = this.getTutorialHighlightHost(kind, cellId);
        const cell = this.game.cells[cellId];
        if (!host || !cell) return;

        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        const color = kind === 'exit'
            ? 0x00ff88
            : (kind === 'key' ? 0xffdf6e : (kind === 'guardian' ? 0xffd54d : 0xff2d73));
        const hostPos = new THREE.Vector3();
        host.getWorldPosition(hostPos);

        const group = new THREE.Group();
        const halo = new THREE.Mesh(
            new THREE.TorusGeometry(kind === 'exit' ? 0.74 : (kind === 'key' ? 0.58 : 0.5), 0.055, 8, 72),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.95,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        halo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        halo.position.copy(hostPos.clone().addScaledVector(normal, kind === 'exit' ? 0.15 : 0.34));
        group.add(halo);

        const arrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.22, 0.58, 28),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.96,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        arrow.geometry.rotateX(Math.PI);
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), normal.clone().negate());
        arrow.position.copy(hostPos.clone().addScaledVector(normal, 1.05));
        group.add(arrow);

        group.userData.tutorialObject = { halo, arrow, kind, cellId };
        group.renderOrder = 30;
        this.tutorialObjectHalo = group;
        this.scene.add(group);
    }

    showTutorialPointer(cellId, step = {}) {
        if (cellId === null || cellId === undefined || !this.scene || !this.game) return;
        this.activeTutorialCellId = cellId;

        // Create Pointer Cone
        if (!this.tutorialPointerCone) {
            const geometry = new THREE.ConeGeometry(0.24, 0.62, 20);
            geometry.rotateX(Math.PI); // tip points down (-Y)
            const material = new THREE.MeshBasicMaterial({
                color: 0xfff36b,
                transparent: true,
                opacity: 0.98,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false
            });
            this.tutorialPointerCone = new THREE.Mesh(geometry, material);
            this.scene.add(this.tutorialPointerCone);
        }
        this.orientTokenToCell(this.tutorialPointerCone, cellId);

        // Create Highlight Ring
        if (!this.tutorialCellHighlightRing) {
            const ringGeo = new THREE.RingGeometry(0.3, 0.62, 48);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xfff36b,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: false
            });
            this.tutorialCellHighlightRing = new THREE.Mesh(ringGeo, ringMat);
        }
        
        const cell = this.game.cells[cellId];
        if (cell) {
            const highlightKind = this.getTutorialHighlightKind(cellId, step);
            const isExitTarget = highlightKind === 'exit';
            const targetRingColor = isExitTarget ? 0x00ff88 : 0xfff36b;
            const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
            const pos = this.getCellWorldPosition(cellId, 'pulse').clone().addScaledVector(normal, 0.02);
            this.tutorialPointerCone.material.color.setHex(targetRingColor);
            this.tutorialPointerCone.scale.setScalar(isExitTarget ? 1.22 : 1);
            this.tutorialCellHighlightRing.position.copy(pos);
            this.tutorialCellHighlightRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
            this.tutorialCellHighlightRing.material.color.setHex(targetRingColor);
            this.tutorialCellHighlightRing.material.opacity = isExitTarget ? 1 : 0.95;
            if (this.tutorialCellHighlightRing.parent !== this.scene) {
                this.scene.add(this.tutorialCellHighlightRing);
            }

            // Create solid green passable tile base
            if (!this.tutorialGreenTileMesh) {
                const geometry = new THREE.PlaneGeometry(0.88, 0.88);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.4,
                    depthWrite: false
                });
                this.tutorialGreenTileMesh = new THREE.Mesh(geometry, material);
                this.scene.add(this.tutorialGreenTileMesh);
            }
            this.tutorialGreenTileMesh.position.copy(pos.clone().addScaledVector(normal, 0.01));
            this.tutorialGreenTileMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
            this.tutorialGreenTileMesh.material.opacity = isExitTarget ? 0.68 : 0.4;
            this.showTutorialObjectHighlight(highlightKind, cellId);

            // Create dynamic green arrow if player is adjacent to the cell (valid direction of travel)
            const playerCell = this.game.cells[this.game.playerPos];
            if (playerCell && cellId !== this.game.playerPos) {
                const playerPos = this.getCellWorldPosition(this.game.playerPos, 'token');
                const targetPos = this.getCellWorldPosition(cellId, 'token');
                const moveDir = targetPos.clone().sub(playerPos);
                if (moveDir.lengthSq() > 0.0001) {
                    if (!this.tutorialArrowMesh) {
                        const texture = this.createTutorialArrowTexture();
                        const geometry = new THREE.PlaneGeometry(0.92, 0.92);
                        const material = new THREE.MeshBasicMaterial({
                            map: texture,
                            transparent: true,
                            opacity: 1,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false
                        });
                        this.tutorialArrowMesh = new THREE.Mesh(geometry, material);
                        this.scene.add(this.tutorialArrowMesh);
                    }
                    this.tutorialArrowMesh.position.copy(pos.clone().addScaledVector(normal, 0.025));
                    
                    const zAxis = normal.clone().normalize();
                    const yAxis = moveDir.projectOnPlane(normal).normalize();
                    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
                    const mat = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
                    this.tutorialArrowMesh.quaternion.setFromRotationMatrix(mat);
                }
            }
        }
    }

    flyToTutorialFocus(cellId, duration = 850, lockInputMs = 0) {
        if (!this.camera || !this.controls) return;
        const target = this.getCellWorldPosition(cellId, 'pulse');
        const normal = this.getCellNormalVector(cellId);
        
        // Dynamic camera focal distance: keep target clear
        const position = target.clone()
            .addScaledVector(normal, 6.8)
            .add(new THREE.Vector3(3.2, 2.5, 3.2));
        
        const startPosition = this.camera.position.clone();
        const startTime = performance.now();
        
        this.presentationMode = 'game';
        this.tutorialControlLockUntil = Math.max(
            this.tutorialControlLockUntil || 0,
            performance.now() + duration + Math.max(0, lockInputMs)
        );
        
        if (this.controls) {
            this.controls.enabled = false;
        }
        
        this.cameraFlight = {
            startPosition,
            targetPosition: position,
            targetLookAt: target,
            startTime,
            duration,
            resolve: () => {
                if (this.controls) {
                    this.controls.target.copy(target);
                    this.controls.enabled = performance.now() >= this.tutorialControlLockUntil;
                    this.controls.update();
                }
            }
        };
    }

    focusTutorialStep(step) {
        if (!step || !this.camera || !this.controls || !this.game) return;
        if (this.tutorialFocusTimer) {
            clearTimeout(this.tutorialFocusTimer);
            this.tutorialFocusTimer = null;
        }
        if (this.tutorialFocusRetryTimer) {
            clearTimeout(this.tutorialFocusRetryTimer);
            this.tutorialFocusRetryTimer = null;
        }
        if (step.type === 'look') {
            this.tutorialLookBaseline = this.getCameraOrbitAngles();
            this.tutorialLookLastAngles = null;
            this.tutorialLookAccumulated = 0;
            if (typeof window !== 'undefined') window.updateTutorialLookProgress?.(0);
            this.hideTutorialWarning();
            return;
        }
        this.tutorialLookBaseline = null;
        this.tutorialLookLastAngles = null;
        this.tutorialLookAccumulated = 0;

        const cellId = step.focusCellId ?? step.targetCellId;
        if (cellId === null || cellId === undefined) return;
        
        this.flyToTutorialFocus(cellId, 850, Number(step.lockInputMs || 0));
        if (step.secondaryFocusCellId !== null && step.secondaryFocusCellId !== undefined) {
            const expectedStep = this.game.currentTutorialStepIndex;
            const secondaryStep = {
                ...step,
                highlightTarget: step.secondaryHighlightTarget || step.highlightTarget
            };
            const switchToSecondaryFocus = () => {
                if (!this.game?.tutorialActive || this.game.currentTutorialStepIndex !== expectedStep) return;
                this.showTutorialPointer(step.secondaryFocusCellId, secondaryStep);
                this.flyToTutorialFocus(step.secondaryFocusCellId, 850, Number(step.lockInputMs || 0));
            };
            this.tutorialFocusTimer = setTimeout(() => {
                this.tutorialFocusTimer = null;
                switchToSecondaryFocus();
                this.tutorialFocusRetryTimer = setTimeout(() => {
                    this.tutorialFocusRetryTimer = null;
                    switchToSecondaryFocus();
                }, 700);
            }, 1000);
        }

        if (step.warning) this.showTutorialWarning(step.warningText || window.t?.('tutorial.warningChaser') || '⚠ 追踪者：你动一步它动一步');
        else this.hideTutorialWarning();
    }

    showTutorialWarning(text) {
        const firstAi = this.game?.ais?.[0];
        const host = firstAi ? this.aiMeshes?.[firstAi.id] : null;
        if (!host) return;
        if (!this.tutorialWarningSprite) this.tutorialWarningSprite = this.createTutorialWarningSprite();
        if (this.tutorialWarningSprite.parent !== host) host.add(this.tutorialWarningSprite);
        this.tutorialWarningSprite.position.set(0, 1.85, 0);
        this.drawTutorialWarningSprite(this.tutorialWarningSprite, text);
    }

    hideTutorialWarning() {
        if (this.tutorialWarningSprite?.parent) this.tutorialWarningSprite.parent.remove(this.tutorialWarningSprite);
    }

    createTutorialWarningSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2.25, 0.58, 1);
        sprite.renderOrder = 22;
        sprite.userData.warningCanvas = canvas;
        sprite.userData.warningTexture = texture;
        return sprite;
    }

    drawTutorialWarningSprite(sprite, text) {
        const canvas = sprite.userData.warningCanvas;
        const texture = sprite.userData.warningTexture;
        const ctx = canvas?.getContext?.('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(20, 4, 12, 0.86)';
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.92)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(10, 16, 492, 82, 16);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffd866';
        ctx.font = '700 28px Noto Sans SC, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 256, 58);
        texture.needsUpdate = true;
    }

    getCameraOrbitAngles() {
        if (!this.camera || !this.controls) return null;
        const offset = this.camera.position.clone().sub(this.controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        return { theta: spherical.theta, phi: spherical.phi };
    }

    updateTutorialLookGate() {
        if (!this.game?.tutorialActive) return;
        const step = this.game.activeTutorialSteps?.[this.game.currentTutorialStepIndex];
        if (step?.type !== 'look') return;
        if (!this.isOrbitActive || this.cameraFlight) {
            this.lastLookTickTime = null;
            this.tutorialLookLastAngles = null;
            return;
        }
        const current = this.getCameraOrbitAngles();
        if (!current) return;
        if (!this.tutorialLookLastAngles) {
            this.tutorialLookLastAngles = current;
            this.lastLookTickTime = Date.now();
            return;
        }
        const deltaTheta = Math.abs(current.theta - this.tutorialLookLastAngles.theta);
        const deltaPhi = Math.abs(current.phi - this.tutorialLookLastAngles.phi);
        this.tutorialLookLastAngles = current;

        const now = Date.now();
        const elapsedSec = (now - this.lastLookTickTime) / 1000;
        this.lastLookTickTime = now;

        // Only accumulate time if the camera is actively rotating this frame
        if (deltaTheta + deltaPhi > 0.001) {
            const threshold = Number(step.threshold || 3.0);
            this.tutorialLookAccumulated += elapsedSec;
            if (typeof window !== 'undefined') {
                window.updateTutorialLookProgress?.(this.tutorialLookAccumulated / threshold);
            }
            if (this.tutorialLookAccumulated >= threshold) {
                this.lastLookTickTime = null;
                this.tutorialLookLastAngles = null;
                this.tutorialLookAccumulated = 0;
                if (typeof window !== 'undefined' && window.advanceTutorialStep) {
                    window.advanceTutorialStep();
                }
            }
        }
    }

    updateTutorialZoomGate() {
        if (!this.game?.tutorialActive || !this.controls) return;
        const step = this.game.activeTutorialSteps?.[this.game.currentTutorialStepIndex];
        if (step?.type !== 'zoom') {
            this.tutorialZoomBaseline = null;
            this.tutorialZoomLastDistance = null;
            this.tutorialZoomAccumulated = 0;
            this.tutorialZoomDistanceAccumulated = 0;
            this.tutorialZoomCompleted = false;
            this.tutorialZoomWheelOut = false;
            this.tutorialZoomLastTickTime = null;
            return;
        }
        if (this.tutorialZoomCompleted) return;
        if (this.cameraFlight) {
            this.tutorialZoomBaseline = null;
            this.tutorialZoomLastDistance = null;
            this.tutorialZoomAccumulated = 0;
            this.tutorialZoomDistanceAccumulated = 0;
            this.tutorialZoomLastTickTime = null;
            return;
        }
        const now = performance.now();
        const currentDistance = this.camera.position.distanceTo(this.controls.target);
        if (this.tutorialZoomBaseline === null || this.tutorialZoomBaseline === undefined) {
            this.tutorialZoomBaseline = currentDistance;
            this.tutorialZoomLastDistance = currentDistance;
            this.tutorialZoomAccumulated = 0;
            this.tutorialZoomDistanceAccumulated = 0;
            this.tutorialZoomWheelOut = false;
            this.tutorialZoomLastTickTime = now;
            return;
        }
        const distanceDelta = Math.abs(currentDistance - (this.tutorialZoomLastDistance ?? currentDistance));
        const elapsed = Math.min(0.08, Math.max(0, (now - (this.tutorialZoomLastTickTime ?? now)) / 1000));
        if (distanceDelta > 0.006 || this.tutorialZoomWheelOut) {
            this.tutorialZoomAccumulated = (this.tutorialZoomAccumulated || 0) + elapsed;
        }
        if (distanceDelta > 0.006) {
            this.tutorialZoomDistanceAccumulated = (this.tutorialZoomDistanceAccumulated || 0) + distanceDelta;
        }
        this.tutorialZoomWheelOut = false;
        this.tutorialZoomLastTickTime = now;
        this.tutorialZoomLastDistance = currentDistance;
        const durationTarget = Number(step.wheelThreshold || step.threshold || 2.0);
        const distanceTarget = Number(step.distanceThreshold || 1.5);
        const progress = Math.min(
            (this.tutorialZoomAccumulated || 0) / durationTarget,
            (this.tutorialZoomDistanceAccumulated || 0) / distanceTarget
        );
        
        if (typeof window !== 'undefined' && window.updateTutorialLookProgress) {
            window.updateTutorialLookProgress(Math.min(1, progress));
        }
        if (progress >= 1.0) {
            this.tutorialZoomCompleted = true;
            this.tutorialZoomBaseline = null;
            this.tutorialZoomLastDistance = null;
            this.tutorialZoomAccumulated = 0;
            this.tutorialZoomDistanceAccumulated = 0;
            this.tutorialZoomWheelOut = false;
            this.tutorialZoomLastTickTime = null;
            if (typeof window !== 'undefined' && window.advanceTutorialStep) {
                window.advanceTutorialStep();
            }
        }
    }

    hideTutorialPointer() {
        this.activeTutorialCellId = null;
        this.tutorialLookBaseline = null;
        this.tutorialLookLastAngles = null;
        this.tutorialLookAccumulated = 0;
        this.tutorialZoomBaseline = null;
        this.tutorialZoomLastDistance = null;
        this.hideTutorialWarning();
        this.hideTutorialObjectHighlight();
        if (this.tutorialFocusTimer) {
            clearTimeout(this.tutorialFocusTimer);
            this.tutorialFocusTimer = null;
        }
        if (this.tutorialFocusRetryTimer) {
            clearTimeout(this.tutorialFocusRetryTimer);
            this.tutorialFocusRetryTimer = null;
        }
        if (this.tutorialPointerCone) {
            this.scene.remove(this.tutorialPointerCone);
            this.disposeObject(this.tutorialPointerCone);
            this.tutorialPointerCone = null;
        }
        if (this.tutorialCellHighlightRing) {
            this.scene.remove(this.tutorialCellHighlightRing);
            this.disposeObject(this.tutorialCellHighlightRing);
            this.tutorialCellHighlightRing = null;
        }
        if (this.tutorialArrowMesh) {
            this.scene.remove(this.tutorialArrowMesh);
            this.disposeObject(this.tutorialArrowMesh);
            this.tutorialArrowMesh = null;
        }
        if (this.tutorialGreenTileMesh) {
            this.scene.remove(this.tutorialGreenTileMesh);
            this.disposeObject(this.tutorialGreenTileMesh);
            this.tutorialGreenTileMesh = null;
        }
    }

    drawSpeechBubble(sprite, text, tone = 'info') {
        if (!sprite || (sprite.userData.speechText === text && sprite.userData.speechTone === tone)) return;
        const canvas = sprite.userData.speechCanvas;
        const texture = sprite.userData.speechTexture;
        const ctx = canvas?.getContext?.('2d');
        if (!ctx) return;
        const accent = tone === 'danger' ? '#ff4d7d' : (tone === 'warn' ? '#ffdd66' : '#8bdcff');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(4, 9, 16, 0.78)';
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 18;
        this.roundRect(ctx, 22, 18, 468, 104, 28);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(78, 118);
        ctx.lineTo(112, 118);
        ctx.lineTo(72, 146);
        ctx.closePath();
        ctx.fillStyle = 'rgba(4, 9, 16, 0.78)';
        ctx.fill();
        ctx.stroke();

        ctx.font = '700 30px "Noto Sans SC", Inter, system-ui, sans-serif';
        ctx.fillStyle = '#e8fbff';
        ctx.textBaseline = 'top';
        const lines = this.wrapCanvasText(ctx, text, 420, 2);
        lines.forEach((line, index) => {
            ctx.fillText(line, 48, 40 + index * 38);
        });
        texture.needsUpdate = true;
        sprite.userData.speechText = text;
        sprite.userData.speechTone = tone;
    }

    wrapCanvasText(ctx, text, maxWidth, maxLines = 2) {
        const source = String(text || '').replace(/\s+/g, ' ').trim();
        if (!source) return [''];
        const chars = [...source];
        const lines = [];
        let line = '';
        chars.forEach(char => {
            const next = `${line}${char}`;
            if (ctx.measureText(next).width > maxWidth && line) {
                lines.push(line);
                line = char;
            } else {
                line = next;
            }
        });
        if (line) lines.push(line);
        if (lines.length > maxLines) {
            const clipped = lines.slice(0, maxLines);
            clipped[maxLines - 1] = `${clipped[maxLines - 1].slice(0, 15)}...`;
            return clipped;
        }
        return lines;
    }

    spawnCellPulse(cellId, color = '#00f0ff', intensity = 1) {
        if (cellId === null || cellId === undefined || !this.scene || !this.game) return;

        const cell = this.game.cells[cellId];
        if (!cell) return;

        const normal = new THREE.Vector3(cell.normal.x, cell.normal.y, cell.normal.z);
        const pos = this.getCellWorldPosition(cellId, 'pulse').clone().addScaledVector(normal, 0.035);
        const ringGeo = new THREE.RingGeometry(0.34, 0.43, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.45 * intensity,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        this.scene.add(ring);

        const start = performance.now();
        const duration = 420;
        const animatePulse = () => {
            const time = performance.now();
            const progress = Math.min(1, (time - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            const scale = 1 + eased * (0.9 + intensity * 0.35);
            ring.scale.setScalar(scale);
            ring.material.opacity = Math.max(0, (0.45 * intensity) * (1 - eased));

            if (progress < 1) {
                requestAnimationFrame(animatePulse);
            } else {
                this.scene.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
            }
        };

        requestAnimationFrame(animatePulse);
    }

    // 棋子沿真实魔方面外侧移动，避免 4x4 时被旧球面半径拉进方块内部。
    interpolateMeshPosition(mesh, targetCellId) {
        if (!mesh) {
            this.drawFallbackScene();
            return;
        }

        const startPos = mesh.position.clone();
        const endPos = this.getCellWorldPosition(targetCellId, 'token');
        
        const cell = this.game.cells[targetCellId];
        const startQuat = mesh.quaternion.clone();
        const endQuat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            this.getCellNormalVector(cell)
        );
        
        let progress = 0;
        const duration = 200; // 动画时长 200ms
        const startTime = performance.now();
        const animationToken = Symbol('moveAnimation');
        mesh.userData.moveAnimationToken = animationToken;
        
        const animatePos = () => {
            if (mesh.userData.moveAnimationToken !== animationToken) return;
            const time = performance.now();
            progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;
            
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, eased);
            mesh.position.copy(currentPos);
            
            mesh.quaternion.copy(startQuat).slerp(endQuat, eased);
            
            if (progress < 1) {
                requestAnimationFrame(animatePos);
            } else {
                mesh.position.copy(endPos);
                if (mesh.userData.moveAnimationToken === animationToken) {
                    delete mesh.userData.moveAnimationToken;
                }
            }
        };
        
        requestAnimationFrame(animatePos);
    }

    // ==========================================
    // 💡 三维魔方扭动物理动画 (Dynamic Layer Twisting)
    // ==========================================
    playRotateAnimation(axis, layerIdx, direction, callback) {
        if (this.renderMode === 'fallback' || !this.scene) {
            this.isAnimating = true;
            setTimeout(() => {
                if (callback) callback();
                this.isAnimating = false;
                this.drawFallbackScene();
            }, 120);
            return;
        }

        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const N = this.game.N;
        const perm = this.game.rotationPermutations[axis][layerIdx][direction];
        
        // 创建临时旋转组
        const pivotGroup = new THREE.Group();
        this.scene.add(pivotGroup);
        
        // 定位属于该旋转层的所有 3D 物体
        const rotatingMeshes = [];
        
        this.cublets.forEach(cublet => {
            // 注意：当魔方旋转后，子块的位置发生了物理改变，我们需要根据其当前 3D position 来确定层
            const currentLayer = this.getLayerVal(cublet.position, axis);
            if (currentLayer === layerIdx) {
                rotatingMeshes.push(cublet);
            }
        });
        
        // B. 判定实体（玩家、AI、钥匙、逃生门）是否在旋转层内
        // 实体的位置由它们所站在的 cell 的 index 确定。我们直接查阅 perm 置换表，
        // 凡是在置换表中 index 发生变化的实体，都属于该旋转层！
        const checkEntityInLayer = (cellId) => {
            return perm[cellId] !== cellId;
        };
        
        if (checkEntityInLayer(this.game.playerPos)) rotatingMeshes.push(this.playerMesh);
        
        this.game.ais.forEach(ai => {
            if (checkEntityInLayer(ai.pos)) {
                rotatingMeshes.push(this.aiMeshes[ai.id]);
            }
        });
        
        if (!this.game.hasKey && this.game.keyPos !== null && checkEntityInLayer(this.game.keyPos)) {
            rotatingMeshes.push(this.keyMesh);
        }
        
        if (this.exitMesh && checkEntityInLayer(this.game.exitPos)) {
            rotatingMeshes.push(this.exitMesh);
        }

        this.bridgePortalMeshes.forEach(mesh => {
            if (mesh && checkEntityInLayer(mesh.userData.cellId)) {
                rotatingMeshes.push(mesh);
            }
        });
        this.patchMeshes.forEach(mesh => {
            if (mesh && checkEntityInLayer(mesh.userData.cellId)) {
                rotatingMeshes.push(mesh);
            }
        });
        this.voidMarkerMeshes.forEach(mesh => {
            if (mesh && checkEntityInLayer(mesh.userData.cellId)) {
                rotatingMeshes.push(mesh);
            }
        });
        if (this.beaconMesh && checkEntityInLayer(this.game.beaconCell)) {
            rotatingMeshes.push(this.beaconMesh);
        }
        
        // C. 将所有选中的 Mesh 挂载到临时旋转组上
        rotatingMeshes.forEach(mesh => {
            if (mesh) {
                pivotGroup.attach(mesh);
            }
        });
        
        // D. 扭动插值动画
        let progress = 0;
        const duration = 500; // 500ms 旋转动画
        const startTime = performance.now();
        
        // 确定旋转轴向量与弧度
        const rotAxisVec = new THREE.Vector3();
        rotAxisVec[axis.toLowerCase()] = 1;
        
        // 顺时针/逆时针对应的弧度
        const totalAngle = (direction === 'CW') ? -Math.PI / 2 : Math.PI / 2;
        
        const animateRotation = () => {
            const time = performance.now();
            progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;
            
            // Easing: Cubic Out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // 设置当前旋转量
            const currentAngle = totalAngle * easeProgress;
            
            if (axis === 'X') pivotGroup.rotation.x = currentAngle;
            if (axis === 'Y') pivotGroup.rotation.y = currentAngle;
            if (axis === 'Z') pivotGroup.rotation.z = currentAngle;
            
            if (progress < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                // E. 旋转结束，将所有 Mesh 重新挂载回 Scene 节点下
                const tempArray = [...pivotGroup.children];
                tempArray.forEach(mesh => {
                    this.scene.attach(mesh);
                });
                
                // 销毁临时组
                this.scene.remove(pivotGroup);
                this.spawnRotationLockPulse(rotatingMeshes);
                this.bridgePortalMeshes.forEach(mesh => {
                    if (mesh?.userData && Number.isInteger(mesh.userData.cellId)) {
                        mesh.userData.cellId = perm[mesh.userData.cellId];
                    }
                });
                [...this.patchMeshes, ...this.voidMarkerMeshes, this.beaconMesh].forEach(mesh => {
                    if (mesh?.userData && Number.isInteger(mesh.userData.cellId)) {
                        mesh.userData.cellId = perm[mesh.userData.cellId];
                    }
                });
                
                this.isAnimating = false;
                
                // 回调 game.js 触发核心数组置换更新
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animateRotation);
    }

    spawnRotationLockPulse(meshes) {
        const uniqueCells = new Set();
        meshes.forEach(mesh => {
            if (!mesh || !mesh.userData) return;
            if (Number.isInteger(mesh.userData.gridX)) return;
            const pos = mesh.position;
            let bestCell = null;
            let bestDistance = Infinity;
            this.game.cells.forEach(cell => {
                const cellPos = this.getCellWorldPosition(cell.id, 'token');
                const dist = cellPos.distanceTo(pos);
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestCell = cell.id;
                }
            });
            if (bestCell !== null && bestDistance < 0.7) {
                uniqueCells.add(bestCell);
            }
        });

        uniqueCells.forEach(cellId => this.spawnCellPulse(cellId, '#00f0ff', 0.55));
    }

    // 窗口尺寸自适应
    onWindowResize() {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        if (!this.container || !this.camera || !this.renderer) return;

        const width = this.container.clientWidth || 1;
        const height = this.container.clientHeight || 1;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    // 渲染主循环
    animate() {
        if (document.hidden) {
            this.animationFrameId = null;
            return;
        }
        this.animationFrameId = requestAnimationFrame(this.boundAnimate);
        const frameNow = performance.now();
        const frameInterval = this.lowPowerMode ? this.lowPowerFrameIntervalMs : this.visibleFrameIntervalMs;
        if (this.lastRenderFrameAt && frameNow - this.lastRenderFrameAt < frameInterval) {
            return;
        }
        this.lastRenderFrameAt = frameNow;

        if (this.presentationMode !== 'game') {
            this.applyPresentationCamera();
        } else {
            this.updateCameraFlight();
            if (this.controls && !this.cameraFlight) {
                if (!this.controls.enabled && this.tutorialControlLockUntil && performance.now() >= this.tutorialControlLockUntil) {
                    this.controls.enabled = true;
                    this.tutorialControlLockUntil = 0;
                }
                this.gameLookAt.lerp(this.gameLookAtTarget, 0.075);
                this.controls.target.copy(this.gameLookAt);
            }
        }

        const pauseDecorativeMotion = this.lowPowerMode;

        if (!pauseDecorativeMotion && this.artGroup) {
            this.artGroup.children.forEach(child => {
                if (!child.userData?.isDataRain) return;
                child.rotation.y += 0.0008;
                const attr = child.geometry?.attributes?.position;
                if (!attr) return;
                for (let i = 1; i < attr.array.length; i += 3) {
                    attr.array[i] -= 0.006;
                    if (attr.array[i] < -4.9) attr.array[i] = 4.9;
                }
                attr.needsUpdate = true;
            });
        }
        
        // 更新 OrbitControls 摄像机控制器
        if (this.controls && !this.cameraFlight) this.controls.update();
        this.updateTutorialLookGate();
        this.updateTutorialZoomGate();
        if (this.game?.updateRealtime) {
            this.game.updateRealtime(performance.now());
            this.updateRealtimeTimerVisuals();
        }
        
        // 自转动画，增加精致感
        // A. 悬浮钥匙自转
        if (!pauseDecorativeMotion && this.keyMesh) {
            if (this.keyMesh.userData.spinTarget) {
                this.keyMesh.userData.spinTarget.rotation.z += 0.018;
            }
            this.keyMesh.position.y += Math.sin(Date.now() * 0.003) * 0.002;
        }
        
        // B. 出口环的自转
        if (this.exitMesh) {
            // 逃生门是路标，图标保持稳定；发光状态由 updateDoorState 处理。
        }

        if (!pauseDecorativeMotion) this.bridgePortalMeshes.forEach((portal, index) => {
            const spin = portal.userData?.spinTarget;
            const inner = portal.userData?.innerSpinTarget;
            const shimmer = portal.userData?.shimmerTarget;
            const aperture = portal.userData?.apertureTarget;
            const flame = portal.userData?.flameTarget;
            const arc = portal.userData?.arcTarget;
            if (spin) spin.rotation.z += index % 2 === 0 ? 0.012 : -0.012;
            if (inner) inner.rotation.z -= index % 2 === 0 ? 0.018 : -0.018;
            if (shimmer) {
                const shimmerPulse = 1 + Math.sin(Date.now() * 0.004 + index) * 0.08;
                shimmer.scale.set(0.6 * shimmerPulse, 1.5 * shimmerPulse, 1);
            }
            if (aperture) {
                const breathe = 1 + Math.sin(Date.now() * 0.003 + index * 0.7) * 0.035;
                aperture.scale.set(0.56 * breathe, 1.52 * breathe, 1);
            }
            if (flame) {
                flame.rotation.z += index % 2 === 0 ? 0.006 : -0.006;
                flame.children.forEach((lick, lickIndex) => {
                    const lickPulse = 1 + Math.sin(Date.now() * 0.006 + lickIndex) * 0.16;
                    lick.scale.y = lickPulse;
                });
            }
            if (arc) arc.rotation.z -= index % 2 === 0 ? 0.01 : -0.01;
        });

        if (!pauseDecorativeMotion && this.beaconMesh?.userData?.spinTarget) {
            this.beaconMesh.userData.spinTarget.rotation.z += 0.028;
            const bob = Math.sin(Date.now() * 0.005) * 0.01;
            this.beaconMesh.userData.spinTarget.position.y = 0.53 + bob;
        }
        
        // C. 棋子轻微呼吸，保留站位方向，不做整组乱转
        if (!pauseDecorativeMotion) {
            const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.018;
            if (this.playerMesh) {
                this.playerMesh.scale.setScalar(pulse);
            }
            Object.values(this.aiMeshes).forEach((mesh, index) => {
                const aiPulse = 1 + Math.sin(Date.now() * 0.0035 + index) * 0.012;
                mesh.scale.setScalar(aiPulse);
            });
        }

        // D. 教程引导动画
        if (this.game && this.game.tutorialActive) {
            const step = this.game.activeTutorialSteps[this.game.currentTutorialStepIndex];
            
            // 1. 3D 指针 Cone 旋转与起伏
            if (this.tutorialPointerCone && this.activeTutorialCellId !== null) {
                const bob = Math.sin(Date.now() * 0.006) * 0.15;
                const basePos = this.getCellWorldPosition(this.activeTutorialCellId, 'token');
                const normal = this.getCellNormalVector(this.activeTutorialCellId);
                this.tutorialPointerCone.position.copy(basePos.clone().addScaledVector(normal, 0.9 + bob));
                this.tutorialPointerCone.rotateY(0.02);
            }

            // 2. 目标单元格呼吸高亮环
            if (this.tutorialCellHighlightRing) {
                const pulseSpeed = Date.now() * 0.012;
                const ringOpacity = 0.5 + 0.4 * Math.sin(pulseSpeed);
                const ringScale = 1.0 + 0.08 * Math.sin(pulseSpeed);
                this.tutorialCellHighlightRing.material.opacity = ringOpacity;
                this.tutorialCellHighlightRing.scale.setScalar(ringScale);
            }

            // 2.5 目标单元格呼吸方向箭头
            if (this.tutorialArrowMesh && this.activeTutorialCellId !== null) {
                const pulse = 1.0 + Math.sin(Date.now() * 0.009) * 0.08;
                this.tutorialArrowMesh.scale.set(pulse, pulse, 1);
            }

            if (this.tutorialObjectHalo?.userData?.tutorialObject) {
                const pulse = 1.0 + Math.sin(Date.now() * 0.011) * 0.1;
                const data = this.tutorialObjectHalo.userData.tutorialObject;
                if (data.halo) {
                    data.halo.scale.setScalar(pulse);
                    data.halo.material.opacity = 0.72 + Math.sin(Date.now() * 0.01) * 0.22;
                }
                if (data.arrow) {
                    data.arrow.scale.setScalar(0.95 + Math.sin(Date.now() * 0.013) * 0.08);
                }
            }

            // 3. Twist 旋转层高亮
            if (step && step.type === 'twist' && this.twistRingMeshes?.length) {
                const twistPulse = 0.5 + 0.45 * Math.sin(Date.now() * 0.012);
                this.twistRingMeshes.forEach(group => {
                    const data = group.userData.twistRing;
                    if (data) {
                        if (data.axis === step.axis && data.layer === step.layer) {
                            data.visible.material.opacity = twistPulse;
                        } else {
                            if (group !== this.hoveredTwistRing) {
                                data.visible.material.opacity = 0.05;
                            }
                        }
                    }
                });
            }
        }

        if (!pauseDecorativeMotion) this.updateCubeLaserEdges();
        
        // 执行 WebGL 渲染
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateCubeLaserEdges() {
        if (!this.cublets || this.cublets.length === 0) return;

        this.laserFrame = (this.laserFrame + 1) % 2;
        if (this.laserFrame !== 0) return;

        const time = performance.now() * 0.001;
        const white = this.edgeWhite || new THREE.Color(0xffffff);

        this.cublets.forEach(cublet => {
            const line = cublet.children[0];
            if (!line || !line.material || line.userData?.isLayerHighlight) return;

            const baseColor = this.edgeColorScratch || new THREE.Color();
            baseColor.copy(line.userData?.baseColorObject || new THREE.Color(line.userData?.baseColor || 0x00f0ff));
            const baseOpacity = line.userData?.baseOpacity || 0.72;
            const phase = line.userData?.laserPhase || 0;
            const wave = (Math.sin(time * 3.6 + phase) + 1) / 2;
            const laser = Math.pow(wave, 2.8);

            if (line.material.uniforms?.diffuse) {
                line.material.uniforms.diffuse.value.copy(baseColor.lerp(white, 0.16 + laser * 0.5));
                line.material.uniforms.opacity.value = Math.min(1, baseOpacity * (0.78 + laser * 0.55));
                line.material.uniforms.dashOffset.value = -(time * 1.28 + phase * 0.14);
            } else {
                line.material.color.copy(baseColor.lerp(white, 0.16 + laser * 0.5));
                line.material.opacity = Math.min(1, baseOpacity * (0.78 + laser * 0.55));
            }
        });
    }

    // 获取子块当前坐标在指定轴向上的层数索引
    getLayerVal(pos, ax) {
        const N = this.game.N;
        const val = pos[ax.toLowerCase()];
        const H = (N - 1) / 2;
        // 将真实 3D 坐标映射回 [0, N-1] 的格数索引
        const idx = Math.round((val / 2) + H);
        return Math.min(N - 1, Math.max(0, idx));
    }

    // 旋转层高亮 (Visual Layer Highlight)
    highlightLayer(axis, layerIdx) {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        if (!axis || layerIdx === null || layerIdx === undefined) {
            this.clearLayerHighlight();
            return;
        }

        this.cublets.forEach(cublet => {
            const currentLayer = this.getLayerVal(cublet.position, axis);
            const line = cublet.children[0]; // 边缘线
            const isTargetLayer = (currentLayer === layerIdx);
            
            if (isTargetLayer) {
                if (!cublet.userData.layerOverlay) {
                    const overlaySize = this.getCubletSize() * 1.055;
                    const overlay = new THREE.Mesh(
                        new THREE.BoxGeometry(overlaySize, overlaySize, overlaySize),
                        this.getLayerHighlightMaterial()
                    );
                    overlay.userData.isLayerOverlay = true;
                    overlay.renderOrder = 6;
                    cublet.add(overlay);
                    cublet.userData.layerOverlay = overlay;
                }
                cublet.userData.layerOverlay.visible = true;

                // 高亮该旋转层网格边缘
                if (line && line.material) {
                    line.userData.isLayerHighlight = true;
                    if (line.material.uniforms?.diffuse) {
                        line.material.uniforms.diffuse.value.setHex(0xffd700);
                        line.material.uniforms.opacity.value = 1;
                        line.material.uniforms.dashSize.value = 1000;
                        line.material.uniforms.gapSize.value = 0.0001;
                        line.material.uniforms.dashOffset.value = 0;
                    } else {
                        line.material.color.setHex(0xffd700); // 亮金色
                        line.material.opacity = 0.85;
                        if ('dashSize' in line.material) {
                            line.material.dashSize = 1000;
                            line.material.gapSize = 0.0001;
                        }
                    }
                }
                
                // 仅高亮该层可读面贴色，避免更改黑色底座的共享材质
                cublet.material.forEach(mat => {
                    if (mat && mat.userData && mat.userData.readableFace) {
                        const highlighted = new THREE.Color(mat.userData.baseColor)
                            .lerp(new THREE.Color(0xfff2aa), 0.32);
                        mat.color.copy(highlighted);
                        if (mat.emissive) {
                            mat.emissiveIntensity = Math.max(1.08, mat.userData.baseEmissiveIntensity || 0.34);
                        }
                        mat.opacity = 1;
                    } else if (mat && mat.emissive && mat.emissive.getHex() !== 0) {
                        mat.emissiveIntensity = 0.45; // 增加发光亮度
                    }
                });
            } else {
                if (cublet.userData.layerOverlay) {
                    cublet.userData.layerOverlay.visible = false;
                }

                // 恢复普通层状态
                if (line && line.material) {
                    line.userData.isLayerHighlight = false;
                    if (line.material.uniforms?.diffuse) {
                        line.material.uniforms.diffuse.value.setHex(line.userData?.baseColor || 0x00f0ff);
                        line.material.uniforms.opacity.value = line.userData?.baseOpacity || 0.72;
                        line.material.uniforms.dashSize.value = line.userData?.baseDashSize || 0.42;
                        line.material.uniforms.gapSize.value = line.userData?.baseGapSize || 0.18;
                    } else {
                        line.material.color.setHex(line.userData?.baseColor || 0x00f0ff);
                        line.material.opacity = line.userData?.baseOpacity || 0.72;
                        if ('dashSize' in line.material) {
                            line.material.dashSize = line.userData?.baseDashSize || 0.42;
                            line.material.gapSize = line.userData?.baseGapSize || 0.18;
                        }
                    }
                }
                cublet.material.forEach(mat => {
                    if (mat && mat.userData && mat.userData.readableFace) {
                        mat.color.setHex(mat.userData.baseColor);
                        if (mat.emissive) {
                            mat.emissiveIntensity = mat.userData.baseEmissiveIntensity || 0.34;
                        }
                        mat.opacity = mat.userData.baseOpacity;
                    } else if (mat && mat.emissive && mat.emissive.getHex() !== 0) {
                        mat.emissiveIntensity = 0.15; // 恢复默认亮度
                    }
                });
            }
        });
    }

    clearLayerHighlight() {
        if (this.renderMode === 'fallback') {
            this.drawFallbackScene();
            return;
        }

        this.cublets.forEach(cublet => {
            if (cublet.userData.layerOverlay) {
                cublet.userData.layerOverlay.visible = false;
            }

            const line = cublet.children[0];
            if (line && line.material) {
                line.userData.isLayerHighlight = false;
                if (line.material.uniforms?.diffuse) {
                    line.material.uniforms.diffuse.value.setHex(line.userData?.baseColor || 0x00f0ff);
                    line.material.uniforms.opacity.value = line.userData?.baseOpacity || 0.72;
                    line.material.uniforms.dashSize.value = line.userData?.baseDashSize || 0.42;
                    line.material.uniforms.gapSize.value = line.userData?.baseGapSize || 0.18;
                } else {
                    line.material.color.setHex(line.userData?.baseColor || 0x00f0ff);
                    line.material.opacity = line.userData?.baseOpacity || 0.72;
                    if ('dashSize' in line.material) {
                        line.material.dashSize = line.userData?.baseDashSize || 0.42;
                        line.material.gapSize = line.userData?.baseGapSize || 0.18;
                    }
                }
            }

            cublet.material.forEach(mat => {
                if (mat && mat.userData && mat.userData.readableFace) {
                    mat.color.setHex(mat.userData.baseColor);
                    if (mat.emissive) {
                        mat.emissiveIntensity = mat.userData.baseEmissiveIntensity || 0.34;
                    }
                    mat.opacity = mat.userData.baseOpacity;
                } else if (mat && mat.emissive && mat.emissive.getHex() !== 0) {
                    mat.emissiveIntensity = 0.15;
                }
            });
        });
    }
}

// 挂载到全局
window.RenderEngine = RenderEngine;
