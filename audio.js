/**
 * 克制的 Web Audio 手感层。
 * 不依赖外部素材，先用合成音验证操作反馈、危险节奏与轻量氛围。
 */

class AudioFeedback {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.ambientNodes = [];
        this.startedAmbient = false;
        this.muted = localStorage.getItem('escape-audio-muted') === 'true';
        this.lastPlayedAt = {};
        this.tension = 'calm';
    }

    async start() {
        if (!this.ctx) {
            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) return false;

            this.ctx = new AudioContextCtor();
            this.masterGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.musicGain = this.ctx.createGain();

            this.masterGain.gain.value = this.muted ? 0 : 0.78;
            this.sfxGain.gain.value = 0.44;
            this.musicGain.gain.value = 0.012;

            this.sfxGain.connect(this.masterGain);
            this.musicGain.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);
        }

        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        if (!this.startedAmbient) {
            this.startAmbient();
        }

        return true;
    }

    setMuted(muted) {
        this.muted = muted;
        localStorage.setItem('escape-audio-muted', String(muted));
        if (this.masterGain) {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.78, this.ctx.currentTime, 0.04);
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
        if (!this.musicGain || this.muted) return;

        const volume = mode === 'rage' ? 0.028 : (mode === 'danger' ? 0.02 : 0.012);
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.35);
    }

    play(name) {
        if (this.muted) return;
        const now = performance.now();
        const minInterval = this.getMinInterval(name);
        if (this.lastPlayedAt[name] && now - this.lastPlayedAt[name] < minInterval) return;
        this.lastPlayedAt[name] = now;

        this.start().then(ok => {
            if (!ok || this.muted || !this.ctx) return;
            const t = this.ctx.currentTime;

            switch (name) {
                case 'uiHover':
                    this.tone(620, 0.035, 'sine', t, 0.035, 0.01);
                    break;
                case 'uiConfirm':
                    this.tone(520, 0.04, 'triangle', t, 0.06, 0.01);
                    this.tone(780, 0.055, 'sine', t + 0.02, 0.04, 0.01);
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
                    this.tone(310, 0.045, 'sine', t, 0.035, 0.006);
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
                case 'beaconPlace':
                    this.tone(880, 0.055, 'sine', t, 0.052, 0.006);
                    this.tone(1320, 0.09, 'triangle', t + 0.035, 0.032, 0.008);
                    break;
                case 'beaconTrigger':
                    this.tone(720, 0.075, 'square', t, 0.05, 0.006, -180);
                    this.tone(360, 0.12, 'triangle', t + 0.06, 0.035, 0.012);
                    break;
                case 'rotateStart':
                    this.noise(0.18, t, 0.055, 1100);
                    this.tone(95, 0.23, 'sawtooth', t, 0.045, 0.04, 55);
                    break;
                case 'rotateLock':
                    this.tone(190, 0.045, 'square', t, 0.07, 0.004);
                    this.tone(570, 0.06, 'triangle', t + 0.025, 0.04, 0.006);
                    break;
                case 'key':
                    this.tone(660, 0.08, 'sine', t, 0.075, 0.008);
                    this.tone(990, 0.1, 'sine', t + 0.04, 0.055, 0.008);
                    this.tone(1320, 0.12, 'triangle', t + 0.08, 0.04, 0.01);
                    break;
                case 'door':
                    this.tone(180, 0.25, 'sine', t, 0.055, 0.05, 90);
                    this.tone(540, 0.18, 'triangle', t + 0.05, 0.04, 0.03, 180);
                    break;
                case 'enemyStep':
                    this.tone(155, 0.07, 'triangle', t, 0.042, 0.012);
                    break;
                case 'guardianLure':
                    this.tone(510, 0.08, 'square', t, 0.038, 0.01);
                    this.tone(360, 0.07, 'square', t + 0.045, 0.03, 0.012);
                    break;
                case 'guardianRage':
                    this.tone(92, 0.12, 'sawtooth', t, 0.065, 0.018);
                    this.tone(92, 0.12, 'sawtooth', t + 0.13, 0.06, 0.018);
                    break;
                case 'undo':
                    this.tone(520, 0.12, 'triangle', t, 0.055, 0.015, -260);
                    this.noise(0.08, t, 0.025, 1600);
                    break;
                case 'failure':
                    this.tone(180, 0.2, 'sawtooth', t, 0.08, 0.02, -90);
                    this.tone(70, 0.32, 'sine', t + 0.12, 0.08, 0.04, -28);
                    break;
                case 'victory':
                    this.tone(440, 0.11, 'triangle', t, 0.06, 0.012);
                    this.tone(660, 0.11, 'triangle', t + 0.08, 0.055, 0.012);
                    this.tone(990, 0.18, 'sine', t + 0.16, 0.055, 0.018);
                    break;
                default:
                    this.tone(520, 0.04, 'sine', t, 0.03, 0.008);
            }
        });
    }

    getMinInterval(name) {
        if (name === 'uiHover') return 80;
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

    startAmbient() {
        if (!this.ctx || this.startedAmbient) return;
        this.startedAmbient = true;

        const makePad = (freq, type, gainValue, detune = 0) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = type;
            osc.frequency.value = freq;
            osc.detune.value = detune;
            filter.type = 'lowpass';
            filter.frequency.value = 520;
            gain.gain.value = gainValue;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            osc.start();
            this.ambientNodes.push(osc, gain, filter);
        };

        makePad(55, 'sine', 0.32);
        makePad(82.5, 'triangle', 0.16, -6);
        makePad(110, 'sine', 0.08, 4);
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
