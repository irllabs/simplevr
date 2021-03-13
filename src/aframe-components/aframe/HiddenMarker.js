import AFRAME from 'aframe';

AFRAME.registerComponent('hidden-marker', {
    init: function init() {
        const { el } = this;
        this.fadeIn = this.fadeIn.bind(this);
        this.fadeOut = this.fadeOut.bind(this);

        el.addEventListener('fade-in', this.fadeIn);
        el.addEventListener('fade-out', this.fadeOut);
    },
    fadeOut: function fadeOut() {
        this.el.emit('stop-fade-in');
        this.el.emit('start-fade-out');
    },
    fadeIn: function fadeIn() {
        this.el.emit('stop-fade-out');
        this.el.emit('start-fade-in');
    },
});
