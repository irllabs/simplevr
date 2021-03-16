import AFRAME from 'aframe';

AFRAME.registerComponent('play-once', {
    init: function init() {
        this.el.addEventListener('sound-ended',() => {
            var offset = this.el.components.sound.pool.children[0].offset;

            if(offset === 0 || this.el.getAttribute('paused') === "false") {
                this.el.setAttribute('played-once', true)
            }
        })
    }
})
