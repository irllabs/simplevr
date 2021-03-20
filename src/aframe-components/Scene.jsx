// External libraries
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'aframe';

import Hotspot from './Hotspot';
import Door from './Door';
import { setCurrentRoom } from '../redux/actions';

import loadImageForRoom from '../util/ImageLoader';
import { IconButton, makeStyles, Typography } from '@material-ui/core';

const styles = makeStyles(() => {
    return {
        enterVRContainer: {
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            width: '48px',
            height: '48px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 24,
        }
    };
});
function Scene({ story, setCurrentRoomAction }) {
    const classes = styles();

    const sceneRef = useRef();
    const skyRef = useRef();

    useEffect(() => {
        sceneRef.current.addEventListener('switch-room', (e) => {
            goToRoom(e.detail);
        });
    }, []);

    const goToRoom = async (roomId) => {
        const targetRoom = story.rooms.find((room) => {
            return room.id === roomId;
        });

        await loadImageForRoom(targetRoom);

        setCurrentRoomAction(targetRoom);

        skyRef.current.addEventListener('materialtextureloaded', function () {
            sceneRef.current.emit('reset-camera');
        });
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
        <>
            <a-scene ref={sceneRef} preview-space device-orientation-permission-ui="enabled: true" loading-screen="enabled: false" vr-mode-ui="enterVRButton: #enterVRButton;">
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
                    {story.soundtrack.data &&
                    <a-sound
                        src={story.soundtrack.data}
                        autoplay={true}
                        volume={story.soundtrack.volume}
                        loop="true"
                        class="soundtrack-audio"
                    >
                    </a-sound>}

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

                <a-sky ref={skyRef} src={activeRoom.panoramaUrl.backgroundImage.data} radius="512" />
            </a-scene>
            <div className={classes.enterVRContainer}>
                <IconButton id="enterVRButton">
                    <Typography className="light-text-90">
                        VR
                    </Typography>
                </IconButton>
            </div>
        </>
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
