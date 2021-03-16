import AFRAME from 'aframe';

import { getCoordinatePosition } from '../../util/IconPosition';

AFRAME.registerComponent('hotspot', {
    schema: {
        coordinates: {
            type: 'string',
            parse: (val) => {
                const [x, y] = val.split(' ');
                return getCoordinatePosition(parseInt(x, 10), parseInt(y, 10));
            },
        },
        isAudioOnly: {
            type: 'boolean',
        },
    },
    hideHotspot: function hideHotspot() {
        this.el.setAttribute('visible', false);
    },
    showHotspot: function showHotspot() {
        this.el.setAttribute('visible', true);
    },
    showOtherHotspots: function showOtherHotspots() {
        this.el.sceneEl.querySelectorAll('.hotspot, .door')
            .forEach((el) => {
                return el.emit('show');
            });
    },
    hideOtherHotspots: function hideOtherHotspots() {
        this.el.sceneEl.querySelectorAll('.hotspot, .door')
            .forEach((el) => {
                return el !== this.el && el.emit('hide');
            });
    },
    init: function init() {
        const { x, y, z } = this.data.coordinates;

        // If content revealed, then it should be
        // hidden after clear intersection of content zone
        this.contentIsActive = false;

        // Setting up position of hotspot
        this.el.object3D.position.set(x, y, z);

        // Caching triggers
        this.centerTrigger = this.el.querySelector('.center-trigger');
        this.outerTrigger = this.el.querySelector('.outer-trigger');
        this.contentZoneTrigger = this.el.querySelector('.content-zone-trigger');

        // Caching elements
        this.hotspotContent = this.el.querySelector('[hotspot-content]');
        this.hiddenMarker = this.el.querySelector('[hidden-marker]');
        this.pulsatingMarker = this.el.querySelector('[pulsating-marker]');

        // Binding current scope to event`s callbacks
        this.hideHotspot = this.hideHotspot.bind(this);
        this.showHotspot = this.showHotspot.bind(this);

        // Adding event listeners
        this.el.addEventListener('hide', this.hideHotspot);
        this.el.addEventListener('show', this.showHotspot);

        this.outerTrigger.addEventListener('raycaster-intersected', () => {
            this.pulsatingMarker.emit('scale-out');
            this.hiddenMarker.emit('fade-in');
        });

        this.outerTrigger.addEventListener('raycaster-intersected-cleared', () => {
            this.pulsatingMarker.emit('scale-in');
            this.hiddenMarker.emit('fade-out');
        });

        this.centerTrigger.addEventListener('raycaster-intersected', () => {
            if (this.contentIsActive) return;

            this.contentIsActive = true;

            if (!this.data.isAudioOnly) {
                this.hiddenMarker.emit('fade-out');
            }

            this.pulsatingMarker.emit('scale-out');
            this.hotspotContent.emit('show-content');
            this.hideOtherHotspots();
        });

        this.contentZoneTrigger.addEventListener('raycaster-intersected-cleared', () => {
            if (!this.data.isAudioOnly) {
                this.hiddenMarker.emit('fade-in');
            }
            this.hotspotContent.emit('hide-content');
            this.showOtherHotspots();
            this.contentIsActive = false;
        });
        this.el.emit('hide');
        setTimeout(() => {
            this.el.emit('show');
        }, 200);
    },
});
