import React from 'react';

export default function Door({ door }) {
    const params = () => {
        const { location, id } = door;

        return `coordinates: ${location.x} ${location.y};
                roomId: ${id};
                autoTime: ${false}`;
    };

    return (
        <a-entity
            door={params()}
            class="door"
            geometry="primitive: plane"
            material="
                transparent: true;
                opacity: 0"
            scale="100 100"
            opacity="1"
            look-at="[camera]"
        >

            <a-entity
                class="outer-door-trigger raycast-trigger"
                material="
                    opacity: 0 0;
                    transparent: true"
                geometry="
                    primitive: plane;
                    height: 1;
                    width: 1;"
                position="0 0 -1"
            />

            <a-entity
                class="center-door-trigger raycast-trigger"
                material="
                    opacity: 0 0;
                    transparent: true"
                geometry="
                    primitive: plane;
                    height: .5;
                    width: .5;"
                position="0 0 -1"
            />

            <a-text
                value={door.label}
                class="hotspot-name"
                align="center"
                position="0 -.5 0"
                visible="false"
                alpha-test=".5"
            />

            <a-entity
                door-pulsating-marker
                animation__scale-out="
                    property: scale;
                    to: .001 .001 .001;
                    dur: 200;
                    startEvents: start-scale-out;
                    pauseEvents: stop-scale-out;"
                animation__scale-in="
                    property: scale;
                    dur: 200;
                    to: 1 1 1;
                    startEvents: start-scale-in;
                    pauseEvents: stop-scale-in"
            >
                <a-image
                    src="/icons/icon-hotspot-default.png"
                    alpha-test=".5"
                    animation__pulsation="
                        property: scale;
                        from: 1 1 1;
                        to: .001 .001 .001;
                        loop: true;
                        dur: 1500;
                        dir: normal;"
                />

            </a-entity>

            <a-image
                src="/icons/icon-doorhotspot.png"
                opacity="0"
                animation__fade-in="
                    property: opacity;
                    from: 0;
                    to: 1;
                    dur: 500;
                    pauseEvents: stop-fade-in;
                    startEvents: start-fade-in;"
                animation__fade-out="
                    property: opacity;
                    from: 1;
                    to: 0;
                    dur: 500;
                    pauseEvents: stop-fade-out;
                    startEvents: start-fade-out;"
                position="0 0 .1"
                hidden-marker
                width=".5"
                height=".5"
            />

        </a-entity>
    );
}
