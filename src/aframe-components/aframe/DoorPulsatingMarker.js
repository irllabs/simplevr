import AFRAME from 'aframe';

AFRAME.registerComponent('door-pulsating-marker', {
    init: function init() {
        const { el } = this;

        this.scaleIn = this.scaleIn.bind(this);
        this.scaleOut = this.scaleOut.bind(this);

        this.pulsatingHotspot = this.el.querySelector('a-image');

        el.addEventListener('scale-in', this.scaleIn);
        el.addEventListener('scale-out', this.scaleOut);
    },
    scaleIn: function scaleIn() {
        const { pulsatingHotspot } = this;
        const vectorFrom = pulsatingHotspot.getAttribute('scale').clone();

        pulsatingHotspot.emit('stop-scale-out');
        pulsatingHotspot.setAttribute('animation__scale-in', 'from', vectorFrom);
        pulsatingHotspot.emit('start-scale-in');
    },
    scaleOut: function scaleOut() {
        const { pulsatingHotspot } = this;
        const vectorFrom = pulsatingHotspot.getAttribute('scale').clone();

        pulsatingHotspot.emit('stop-scale-in');
        pulsatingHotspot.setAttribute('animation__scale-out', 'from', vectorFrom);
        pulsatingHotspot.emit('start-scale-out');
    },
});
