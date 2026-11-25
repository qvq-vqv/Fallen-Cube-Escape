/**
 * 克制的 Web Audio 声音层：全部代码合成，不依赖外部素材。
 * 设计见 docs/07_portfolio/usc_game_design/audio_plan.md：玩家的操作奏出音乐。
 *   一步 = 一个玻璃音（音高由格子决定）；六个面 = 六个和弦；敌人靠近 = 心跳；逃出 = 小调落到大调。
 * 所有发声函数都按传入的时间排程，所以 tools/capture/soundtrack.js 能用同一份代码离线渲染视频音轨。
 */

// D 小调五声音阶（MIDI）。相邻格子在音阶上只差一级，随便怎么走都在调上。
const AUDIO_SCALE = [57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86];
// 面：0 蓝(上) 1 紫(下) 2 橙(左) 3 红(右) 4 绿(前) 5 黄(后)
const AUDIO_FACES = [
    { chord: [50, 57, 62, 65], step: 1 }, // Dm
    { chord: [41, 53, 57, 60], step: 4 }, // F
    { chord: [48, 55, 60, 64], step: 3 }, // C
    { chord: [45, 52, 57, 60], step: 2 }, // Am
    { chord: [46, 53, 62, 65], step: 2 }, // Bb
    { chord: [43, 50, 58, 62], step: 0 }  // Gm
];
const AUDIO_RELEASE_CHORD = [50, 57, 62, 66]; // D major
const AUDIO_MOTIF = [74, 78, 81, 86, 90]; // 通关主题，作者可以换成自己的五个音
const AUDIO_MENU = [74, null, 69, 72, null, 65, null, 67]; // one note every 2.4 s, null = rest
const AUDIO_UI_GENERIC = new Set(['uiConfirm', 'uiHover', 'routeTick', 'routeUndo']);
const AUDIO_MASTER = 0.9;

class AudioFeedback {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.bus = null;
        this.pad = null;
        this.keyPad = null;
        this.muted = localStorage.getItem('escape-audio-muted') === 'true';
        this.lastPlayedAt = {};
        this.tension = 'calm';
        this.scene = { playing: false, face: null, near: null, key: false };
        this.inMenu = true;
        this.paused = false;
        this.muffled = false;
        this.uiGateUntil = -1;
        this.menuAt = null;
        this.menuStep = 0;
        this.beatAt = null;
        this.beatTimer = null;
        this.timeOverride = null; // offline rendering only
    }

    now() {
        return this.timeOverride !== null ? this.timeOverride : this.ctx.currentTime;
    }

    async start() {
        if (!this.ctx) {
            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) return false;
            this.build(new AudioContextCtor());
            this.beatTimer = setInterval(() => {
                if (this.ctx.state === 'running' && !document.hidden) this.pumpBeats(this.now() + 0.35);
            }, 150);
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) this.ctx.suspend();
                else this.ctx.resume();
            });
        }

        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        return true;
    }

    // Node graph: voices -> dry / reverb -> bus (cut when caught) -> master (mute) -> limiter
    build(ctx) {
        this.ctx = ctx;
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -12;
        limiter.ratio.value = 4;
        limiter.connect(ctx.destination);
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : AUDIO_MASTER;
        this.masterGain.connect(limiter);
        this.bus = ctx.createGain();
        this.bus.connect(this.masterGain);
        this.musicBus = ctx.createBiquadFilter(); // pads; dull while paused or holding a layer
        this.musicBus.type = 'lowpass';
        this.musicBus.Q.value = 0.3;
        this.musicBus.frequency.value = this.musicCutoff();
        this.musicBus.connect(this.bus);
        this.sfxGain = ctx.createGain(); // simple UI tones
        this.sfxGain.gain.value = 2.4;
        this.sfxGain.connect(this.bus);

        let seed = 7; // fixed seed: the same noise in every session and every render
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const rate = ctx.sampleRate;
        this.noiseBuffer = ctx.createBuffer(1, rate * 2, rate);
        const noise = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < noise.length; i++) noise[i] = rnd() * 2 - 1;
        const ir = ctx.createBuffer(2, Math.floor(rate * 2.4), rate);
        for (let c = 0; c < 2; c++) {
            const d = ir.getChannelData(c);
            for (let i = 0; i < d.length; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / d.length, 3.2);
        }
        this.reverb = ctx.createConvolver();
        this.reverb.buffer = ir;
        const wet = ctx.createGain();
        wet.gain.value = 0.5;
        this.reverb.connect(wet);
        wet.connect(this.bus);
        this.applyScene(this.now());
    }

    hz(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    setMuted(muted) {
        this.muted = muted;
        localStorage.setItem('escape-audio-muted', String(muted));
        if (this.masterGain) {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setTargetAtTime(muted ? 0 : AUDIO_MASTER, this.ctx.currentTime, 0.04);
        }
        this.updateToggle();
    }

    toggleMuted() {
        this.setMuted(!this.muted);
        if (!this.muted) {
            this.play('uiConfirm');
        }
    }

    updateToggle() {
        const btn = document.getElementById('audio-toggle');
        if (!btn) return;
        btn.classList.toggle('muted', this.muted);
        btn.setAttribute('aria-pressed', String(!this.muted));
        btn.innerText = this.muted
            ? (window.t?.('audio.off') || '声音 关')
            : (window.t?.('audio.on') || '声音 开');
    }

    setTension(mode) {
        this.tension = mode;
        if (mode === 'calm' && this.scene.near !== null) this.setScene({ near: null });
    }

    musicCutoff() {
        return this.paused ? 260 : (this.muffled ? 420 : 12000);
    }

    updateMusicFilter() {
        if (!this.ctx) return;
        const t = this.now();
        this.musicBus.frequency.cancelScheduledValues(t);
        this.musicBus.frequency.setTargetAtTime(this.musicCutoff(), t, 0.12);
        if (this.paused) this.beatAt = null;
        else this.applyScene(t);
    }

    setMuffled(on) {
        if (this.muffled === on) return;
        this.muffled = on;
        this.updateMusicFilter();
    }

    setPaused(on) {
        if (this.paused === on) return;
        this.paused = on;
        this.updateMusicFilter();
    }

    enterMenu() {
        this.setTension('calm');
        this.setPaused(false);
        this.inMenu = true;
        this.scene = { playing: false, face: null, near: null, key: false };
        if (this.ctx) this.applyScene(this.now());
    }

    enterLevel() {
        this.inMenu = false;
        this.setPaused(false);
    }

    // One sound per click: the first named UI sound wins over anything else the same click fires.
    ui(name, detail) {
        if (this.muted || performance.now() < this.uiGateUntil) return;
        this.play(name, detail);
        this.uiGateUntil = performance.now() + 120;
    }

    // The game tells where Dawn is and how many moves away the nearest enemy is; the music follows.
    setScene(next) {
        if (this.inMenu) return false;
        const prev = this.scene;
        this.scene = { ...prev, ...next };
        const changed = Object.keys(this.scene).some(k => this.scene[k] !== prev[k]);
        if (changed && this.ctx) this.applyScene(this.now());
        return changed;
    }

    applyScene(t) {
        const s = this.scene;
        const face = s.playing && s.face !== null ? s.face : null;
        const want = face === null ? 'menu' : `face${face}`;
        if (!(this.pad && this.pad.id === 'win' && !s.playing && !this.inMenu) && (!this.pad || this.pad.id !== want)) {
            this.setPad(want, AUDIO_FACES[face === null ? 0 : face].chord, face === null ? 0.5 : 1, t);
        }
        const keyOn = Boolean(s.playing && s.key);
        if (keyOn && !this.keyPad) {
            this.keyPad = this.padVoices([86, 93], 0.008, 2600, t);
        } else if (!keyOn && this.keyPad) {
            this.releaseVoices(this.keyPad, t);
            this.keyPad = null;
        }
        if (!this.inMenu) this.menuAt = null;
        else if (this.menuAt === null) this.menuAt = t + 2;
        const beating = !this.paused && s.playing && s.near !== null && s.near <= 3;
        if (!beating) this.beatAt = null;
        else if (this.beatAt === null) this.beatAt = t + 0.25;
    }

    setPad(id, chord, level, t) {
        if (this.pad) this.releaseVoices(this.pad.voices, t);
        const voices = [
            ...this.padVoices(chord.slice(0, 1), 0.035 * level, 620, t, 'triangle'),
            ...this.padVoices(chord.slice(1), 0.016 * level, 820, t, 'sawtooth')
        ];
        this.pad = { id, voices };
    }

    padVoices(notes, level, cutoff, t, type = 'sine') {
        const voices = [];
        notes.forEach(m => [-5, 5].forEach(detune => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = this.hz(m);
            osc.detune.value = detune;
            filter.type = 'lowpass';
            filter.frequency.value = cutoff;
            gain.gain.setValueAtTime(0, t);
            gain.gain.setTargetAtTime(level, t, 0.45);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicBus);
            const send = this.ctx.createGain();
            send.gain.value = 0.4;
            gain.connect(send);
            send.connect(this.reverb);
            osc.start(t);
            voices.push({ osc, gain });
        }));
        return voices;
    }

    releaseVoices(voices, t) {
        voices.forEach(({ osc, gain }) => {
            gain.gain.cancelScheduledValues(t + 0.001);
            gain.gain.setTargetAtTime(0, t + 0.001, 0.5);
            osc.stop(t + 4);
        });
    }

    // Heartbeat, and the slow notes of the menu: schedule everything before `until`.
    pumpBeats(until) {
        while (this.menuAt !== null && this.menuAt < until) {
            const t = Math.max(this.menuAt, this.timeOverride === null ? this.now() : 0);
            const note = AUDIO_MENU[this.menuStep % AUDIO_MENU.length];
            if (note !== null) this.glass(note, t, 0.045);
            this.menuStep += 1;
            this.menuAt = t + 2.4;
        }
        while (this.beatAt !== null && this.beatAt < until) {
            const t = Math.max(this.beatAt, this.timeOverride === null ? this.now() : 0);
            this.voice('sine', 74, t, 0.22, 0.2, { sweep: 46, send: 0.1 });
            this.voice('triangle', 148, t, 0.1, 0.05, { send: 0.1 });
            this.voice('sine', 70, t + 0.17, 0.2, 0.11, { sweep: 46, send: 0.1 });
            this.beatAt = t + (this.scene.near <= 1 ? 0.55 : (this.scene.near === 2 ? 0.8 : 1.15));
        }
    }

    route(node, send) {
        node.connect(this.bus);
        if (!send) return;
        const s = this.ctx.createGain();
        s.gain.value = send;
        node.connect(s);
        s.connect(this.reverb);
    }

    voice(type, freq, t, duration, level, { attack = 0.004, send = 0.35, sweep = 0, lowpass = 0, pan = 0, out = null } = {}) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (sweep) osc.frequency.exponentialRampToValueAtTime(sweep, t + duration);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(level, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        let node = osc;
        if (lowpass) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = lowpass;
            osc.connect(filter);
            node = filter;
        }
        node.connect(gain);
        let last = gain;
        if (pan && this.ctx.createStereoPanner) {
            last = this.ctx.createStereoPanner();
            last.pan.value = pan;
            gain.connect(last);
        }
        if (out) last.connect(out);
        else this.route(last, send);
        osc.start(t);
        osc.stop(t + duration + 0.05);
    }

    hiss(t, duration, level, from, to, { q = 1.2, send = 0.2, attack = 0.005 } = {}) {
        const source = this.ctx.createBufferSource();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        source.buffer = this.noiseBuffer;
        source.loop = true;
        filter.type = 'bandpass';
        filter.Q.value = q;
        filter.frequency.setValueAtTime(from, t);
        filter.frequency.exponentialRampToValueAtTime(to, t + duration);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(level, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        source.connect(filter);
        filter.connect(gain);
        this.route(gain, send);
        source.start(t, (t * 0.37) % 1);
        source.stop(t + duration + 0.05);
    }

    glass(midi, t, level = 0.2) {
        const f = this.hz(midi);
        this.voice('sine', f, t, 1.1, level);
        this.voice('sine', f * 2.76, t, 0.35, level * 0.32);
        this.voice('sine', f * 5.4, t, 0.12, level * 0.16);
    }

    uiGlass(midi, t, level) {
        const f = this.hz(midi);
        this.voice('sine', f, t, 0.32, level, { send: 0.2 });
        this.voice('sine', f * 2.76, t, 0.1, level * 0.3, { send: 0.1 });
    }

    stepNote(detail) {
        const face = AUDIO_FACES[detail.face] || AUDIO_FACES[0];
        const index = face.step + (detail.row || 0) + (detail.col || 0);
        return AUDIO_SCALE[Math.min(index, AUDIO_SCALE.length - 1)] + 12;
    }

    play(name, detail = {}) {
        if (this.muted) return;
        if (AUDIO_UI_GENERIC.has(name) && performance.now() < this.uiGateUntil) return;
        const now = this.timeOverride !== null ? this.timeOverride * 1000 : performance.now();
        const gate = detail.kind ? `${name}:${detail.kind}` : name;
        if (this.lastPlayedAt[gate] !== undefined && now - this.lastPlayedAt[gate] < this.getMinInterval(name)) return;
        this.lastPlayedAt[gate] = now;

        if (this.timeOverride !== null) {
            this.sound(name, detail, this.timeOverride);
            return;
        }
        this.start().then(ok => {
            if (!ok || this.muted || !this.ctx) return;
            this.sound(name, detail, this.ctx.currentTime);
        });
    }

    sound(name, detail, t) {
        switch (name) {
            case 'uiHover':
                this.voice('sine', 1175, t, 0.09, 0.016, { send: 0.15 });
                break;
            case 'uiConfirm':
                this.uiGlass(74, t, 0.07);
                break;
            case 'uiStart':
                [62, 69, 74].forEach((m, k) => this.uiGlass(m, t + k * 0.07, 0.085));
                this.voice('sine', 73, t, 0.5, 0.2, { sweep: 55 });
                break;
            case 'uiOpen':
                this.hiss(t, 0.2, 0.04, 500, 2200, { q: 0.8, attack: 0.06 });
                [69, 74].forEach((m, k) => this.uiGlass(m, t + k * 0.06, 0.06));
                break;
            case 'uiBack':
                this.hiss(t, 0.16, 0.03, 1800, 500, { q: 0.8, attack: 0.03 });
                [74, 69].forEach((m, k) => this.uiGlass(m, t + k * 0.06, 0.055));
                break;
            case 'uiToggle':
                this.hiss(t, 0.02, 0.09, 2600, 1800, { q: 3 });
                this.uiGlass(detail.on === false ? 67 : 72, t + 0.015, 0.06);
                break;
            case 'uiSelect':
                this.uiGlass(77, t, 0.06);
                break;
            case 'uiSlide':
                this.uiGlass(AUDIO_SCALE[Math.round((detail.value || 0) * (AUDIO_SCALE.length - 1))], t, 0.04);
                break;
            case 'uiDanger':
                this.voice('triangle', 110, t, 0.3, 0.16, { sweep: 82, lowpass: 600 });
                this.hiss(t, 0.06, 0.08, 800, 400);
                break;
            case 'uiType':
                this.hiss(t, 0.016, 0.05, 2800, 2000, { q: 3, send: 0.05 });
                break;
            case 'twistArm':
                this.hiss(t, 0.3, 0.07, 300, 1400, { q: 0.8, attack: 0.18 });
                this.voice('sine', 110, t, 0.45, 0.1, { attack: 0.15, sweep: 147 });
                break;
            case 'routeTick':
                this.tone(740, 0.045, 'sine', t, 0.07, 0.01);
                this.tone(1180, 0.03, 'sine', t + 0.012, 0.035, 0.006);
                break;
            case 'routeUndo':
                this.tone(460, 0.045, 'triangle', t, 0.055, 0.01, -220);
                break;
            case 'invalid':
                this.tone(130, 0.11, 'sawtooth', t, 0.07, 0.018, -70);
                this.noise(0.07, t, 0.035, 850);
                break;
            case 'execute':
                this.tone(220, 0.075, 'triangle', t, 0.08, 0.012);
                this.tone(440, 0.08, 'sine', t + 0.035, 0.055, 0.01);
                break;
            case 'playerStep':
                this.glass(this.stepNote(detail), t);
                this.hiss(t, 0.03, 0.05, 3200, 1800);
                break;
            case 'bridgeStep':
                this.tone(260, 0.06, 'triangle', t, 0.045, 0.008, 180);
                this.tone(1040, 0.1, 'sine', t + 0.028, 0.035, 0.012, -320);
                this.noise(0.08, t, 0.018, 1800);
                break;
            case 'patchPlace':
                this.tone(420, 0.045, 'triangle', t, 0.05, 0.008);
                this.tone(315, 0.08, 'sine', t + 0.035, 0.038, 0.01);
                break;
            case 'patchBreak':
                this.noise(0.1, t, 0.045, 2600);
                this.tone(520, 0.08, 'square', t, 0.028, 0.006, -260);
                break;
            case 'tileBreak':
                // a pane cracks, then the pieces fall
                this.hiss(t, 0.09, 0.4, 5200, 2400, { q: 0.7 });
                this.voice('triangle', 210, t, 0.16, 0.2, { sweep: 90 });
                for (let k = 0; k < 9; k++) {
                    const at = t + 0.07 + k * 0.065 + (k % 3) * 0.014;
                    this.voice('sine', 1500 + ((k * 739) % 1900), at, 0.16, 0.05 * (1 - k / 11), { pan: ((k % 3) - 1) * 0.4 });
                }
                break;
            case 'commsTick':
                this.tone(1250, 0.018, 'sine', t, 0.012, 0.003);
                break;
            case 'beaconPlace':
                this.tone(880, 0.055, 'sine', t, 0.052, 0.006);
                this.tone(1320, 0.09, 'triangle', t + 0.035, 0.032, 0.008);
                break;
            case 'beaconTrigger':
                this.tone(720, 0.075, 'square', t, 0.05, 0.006, -180);
                this.tone(360, 0.12, 'triangle', t + 0.06, 0.035, 0.012);
                break;
            case 'rotateStart':
                // friction with ratchet clicks, as long as the turn itself
                this.hiss(t, 0.56, 0.16, 240, 900, { q: 0.9, attack: 0.12 });
                this.voice('sawtooth', 58, t, 0.56, 0.09, { attack: 0.1, sweep: 88, lowpass: 340 });
                for (let k = 0; k < 6; k++) this.hiss(t + 0.06 + k * 0.08, 0.02, 0.1 + k * 0.012, 2400, 1700, { q: 4 });
                break;
            case 'rotateLock':
                this.voice('sine', 96, t, 0.34, 0.42, { sweep: 48, send: 0.4 });
                this.hiss(t, 0.07, 0.34, 1700, 420);
                [62, 69, 74].forEach((m, k) => this.voice('sine', this.hz(m), t + 0.05, 1.5, 0.05, { attack: 0.06, send: 0.8, pan: (k - 1) * 0.3 }));
                break;
            case 'key':
                [74, 77, 81, 86].forEach((m, k) => this.glass(m, t + 0.1 + k * 0.085, 0.13));
                break;
            case 'door':
                this.voice('sine', 110, t + 0.5, 0.5, 0.2, { sweep: 62 });
                this.hiss(t + 0.5, 0.12, 0.16, 900, 300);
                break;
            case 'enemyStep':
                if (detail.kind === 'guardian') this.keeperStep(t, 0.12);
                else {
                    [0, 0.085].forEach((o, k) => {
                        this.voice('triangle', 132 - k * 14, t + o, 0.13, 0.2, { sweep: 78, lowpass: 900, pan: -0.15 });
                        this.hiss(t + o, 0.035, 0.1, 1500, 700);
                    });
                }
                break;
            case 'guardianLure':
                this.keeperStep(t, 0.1);
                this.keeperStep(t + 0.14, 0.07);
                break;
            case 'guardianRage':
                this.keeperStep(t, 0.18);
                this.voice('sawtooth', 92, t, 0.3, 0.12, { sweep: 60, lowpass: 500 });
                break;
            case 'undo':
                this.tone(520, 0.12, 'triangle', t, 0.055, 0.015, -260);
                this.noise(0.08, t, 0.025, 1600);
                break;
            case 'failure':
                // Everything stops for 0.6 s; only one low note is left.
                this.setScene({ near: null });
                this.bus.gain.cancelScheduledValues(t);
                this.bus.gain.setValueAtTime(1, t);
                this.bus.gain.linearRampToValueAtTime(0, t + 0.03);
                this.bus.gain.setValueAtTime(0, t + 0.6);
                this.bus.gain.linearRampToValueAtTime(1, t + 1.8);
                this.voice('sine', 82, t + 0.02, 1.1, 0.5, { sweep: 36, out: this.masterGain });
                this.voice('triangle', 164, t + 0.02, 0.5, 0.1, { sweep: 72, out: this.masterGain });
                break;
            case 'victory':
                AUDIO_MOTIF.forEach((m, k) => this.glass(m, t + 0.12 + k * 0.13, 0.14));
                this.setPad('win', AUDIO_RELEASE_CHORD, 1.2, t);
                this.setScene({ playing: false, near: null });
                break;
            default:
                this.tone(520, 0.04, 'sine', t, 0.03, 0.008);
        }
    }

    keeperStep(t, level) {
        this.voice('sine', 196, t, 0.8, level, { send: 0.5, pan: 0.15 });
        this.voice('sine', 470, t, 0.35, level * 0.42, { pan: 0.15 });
        this.hiss(t, 0.06, level, 700, 300);
    }

    getMinInterval(name) {
        if (name === 'uiHover') return 80;
        if (name === 'uiSlide' || name === 'uiType') return 45;
        if (name === 'invalid') return 180;
        if (name === 'enemyStep') return 90;
        if (name === 'guardianRage') return 220;
        if (name === 'bridgeStep') return 120;
        return 35;
    }

    tone(freq, duration, type, startTime, gainValue, attack = 0.01, sweep = 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const endTime = startTime + duration;

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        if (sweep !== 0) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq + sweep), endTime);
        }

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), startTime + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(startTime);
        osc.stop(endTime + 0.02);
    }

    noise(duration, startTime, gainValue, filterFreq = 1200) {
        const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const source = this.ctx.createBufferSource();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, startTime);
        gain.gain.setValueAtTime(gainValue, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        source.start(startTime);
    }
}

class GameFeel {
    constructor(audio) {
        this.audio = audio;
        this.toastTimer = null;
    }

    init() {
        this.toast = document.getElementById('feel-toast');
        this.flash = document.getElementById('screen-flash');
    }

    play(name) {
        if (this.audio) this.audio.play(name);
    }

    note(text, tone = 'info') {
        if (!this.toast) return;
        clearTimeout(this.toastTimer);
        this.toast.innerText = text;
        this.toast.className = `feel-toast active ${tone}`;
        this.toastTimer = setTimeout(() => {
            this.toast.classList.remove('active');
        }, 1350);
    }

    flashScreen(tone = 'info') {
        if (!this.flash) return;
        this.flash.className = `screen-flash active ${tone}`;
        setTimeout(() => {
            this.flash.classList.remove('active');
        }, 260);
    }

    pulse(el, tone = 'info') {
        if (!el) return;
        el.classList.remove('feel-pulse', 'feel-pulse-warn', 'feel-pulse-good');
        void el.offsetWidth;
        el.classList.add(tone === 'warn' ? 'feel-pulse-warn' : (tone === 'good' ? 'feel-pulse-good' : 'feel-pulse'));
    }
}

window.AudioFeedback = AudioFeedback;
window.GameFeel = GameFeel;
