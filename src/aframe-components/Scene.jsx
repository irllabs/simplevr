// External libraries
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'aframe';

import Hotspot from './Hotspot';
import Door from './Door';
import { setCurrentRoom } from '../redux/actions';

function Scene({ story, setCurrentRoomAction }) {
    const sceneRef = useRef();

    useEffect(() => {
        sceneRef.current.addEventListener('switch-room', (e) => {
            goToRoom(e.detail);
        });
    }, []);

    const goToRoom = (roomId) => {
        const targetRoom = story.rooms.find((room) => {
            return room.id === roomId;
        });

        setCurrentRoomAction(targetRoom);

        sceneRef.current.emit('reset-camera');
    };

    const getRoomName = (roomId) => {
        const room = story.rooms.find((room) => {
            return room.id === roomId;
        });
        return room.name;
    }

    const activeRoom = story.rooms.find((room) => {
        return room.active;
    });

    return (
        <a-scene ref={sceneRef} preview-space device-orientation-permission-ui="enabled: true" loading-screen="enabled: false">
            <a-camera
                wasd-controls-enabled="false"
                look-controls-enabled="true"
                fov="65"
                animation__zoom-in="
                    property: zoom;
                    from: 1;
                    startEvents: start-zoom-in;
                    to: 5;"
                zoom="1"
                near="1"
            >
                <a-cursor
                    id="cursor"
                    animation__scale-out="property: scale; from: 1 1 1; to: .2 .2 .2; startEvents: start-scale-out;"
                />
            </a-camera>

            {activeRoom.hotspots.map((hotspot) => {
                return (
                    <Hotspot key={hotspot.id} hotspot={hotspot} />
                );
            })}

            {activeRoom.doors.map((door) => {
                return (
                    <Door key={door.id} door={door} targetRoomName={getRoomName(door.targetRoomId)} />
                );
            })}

            {activeRoom &&
            <a-entity>
                {activeRoom.backgroundNarration.data &&
                <a-sound
                    src={activeRoom.backgroundNarration.data}
                    autoplay={true}
                    volume={activeRoom.backgroundNarration.volume}
                    class="narration-audio"
                    sound="positional: false"
                >
                </a-sound>}
                {activeRoom.backgroundMusic.data &&
                <a-sound
                    src={activeRoom.backgroundMusic.data}
                    autoplay={true}
                    volume={activeRoom.backgroundMusic.volume}
                    loop="true"
                    sound="positional: false"
                >
                </a-sound>}
            </a-entity>}

            <a-assets>
                <img id='skybox' src={activeRoom.panoramaUrl.backgroundImage.data} crossOrigin='anonymous' />
            </a-assets>

            <a-sky src="#skybox" radius="512" />
        </a-scene>
    );
}

const mapStateToProps = (state) => {
    return {
        story: state.project.story,
    };
};

export default connect(
    mapStateToProps,
    {
        setCurrentRoomAction: setCurrentRoom,
    },
)(Scene);
