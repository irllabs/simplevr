import AFRAME from 'aframe';

import Vector3 from '../../util/Vector3';

AFRAME.registerComponent('preview-space', {
    init: function init() {
        const { el } = this;
        this.camera = el.querySelector('a-camera');
        this.cursor = this.camera.querySelector('a-cursor');
        this.countdown = el.querySelector('[preview-countdown]');
        this.enterVR = el.querySelector('.a-enter-vr');

        el.addEventListener('run-countdown', () => {
            return this.countdown.emit('run');
        });

        el.addEventListener('show-countdown', () => {
            this.countdown.setAttribute('visible', true);
        });

        el.addEventListener('hide-countdown', () => {
            this.countdown.setAttribute('visible', false);
        });

        this.camera.addEventListener('animationcomplete', (e) => {
            if (e.detail.name === 'animation__zoom-in') {
                this.switchRoom(this.roomId);
            }
        });

        ['narration', 'background', 'soundtrack'].forEach((type) => {
            el.addEventListener(`touch-${type}-audio`, () => {
                const audio = el.querySelector(`.${type}-audio`);
                if (audio) {
                    const volume = audio.getAttribute('volume');
                    audio.setAttribute('volume', 0);
                    audio.components.sound.playSound();
                    setTimeout(() => {
                        audio.components.sound.pauseSound();
                        audio.setAttribute('volume', volume);
                    }, 0);
                }
            });

            el.addEventListener(`pause-${type}-audio`, () => {
                const audio = el.querySelector(`.${type}-audio`);
                if (audio) {
                    audio.setAttribute('paused', true);
                    audio.components.sound.pauseSound();
                }
            });

            el.addEventListener(`play-${type}-audio`, () => {
                const audio = el.querySelector(`.${type}-audio`);
                if (audio && audio.getAttribute('played-once') !== 'true') {
                    audio.setAttribute('paused', false);
                    audio.components.sound.playSound();
                }
            });
        });

        el.addEventListener('touch-all-audio', () => {
            el.emit('touch-narration-audio');
            el.emit('touch-soundtrack-audio');
            el.emit('touch-background-audio');
        });

        el.addEventListener('play-all-audio', () => {
            el.emit('play-narration-audio');
            el.emit('play-soundtrack-audio');
            el.emit('play-background-audio');
        });

        el.addEventListener('pause-all-audio', () => {
            el.emit('pause-narration-audio');
            el.emit('pause-soundtrack-audio');
            el.emit('pause-background-audio');
        });

        el.addEventListener('switch-room-last', () => {
            this.switchRoom('last');
        });

        el.addEventListener('switch-room-home', () => {
            this.switchRoom('home');
        });

        el.addEventListener('switch-room-smoothly', (e) => {
            this.roomId = e.detail.roomId;
            this.zoomCamera();
        });

        el.addEventListener('close-vr', () => {
            this.el.exitVR();
        });
        el.addEventListener('enable-vr', () => {
            this.el.enterVR();
        });

        el.addEventListener('reset-camera', () => {
            this.resetCamera();
        });
    },
    resetCamera: function resetCamera() {
        this.camera.setAttribute('zoom', 1);
        this.cursor.setAttribute('scale', new Vector3(1, 1, 1));
    },
    zoomCamera: function zoomCamera() {
        this.camera.emit('start-zoom-in');
        this.cursor.emit('start-scale-out');
    },
    switchRoom: function switchRoom(roomId) {
        const onceAudio = this.el.querySelector('.narration-audio');

        if (onceAudio) {
            onceAudio.setAttribute('played-once', 'false');
        }

        this.el.emit('switch-room', roomId);
    },
});
