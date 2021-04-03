// External libraries
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import NAF from 'networked-aframe';
import 'aframe';

import Hotspot from './Hotspot';
import Door from './Door';
import PanelButton from './PanelButton';
import { setCurrentRoom } from '../redux/actions';

import loadImageForRoom, { getImageFromChar, loadImage } from '../util/ImageLoader';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, makeStyles, TextField, Typography } from '@material-ui/core';
import { useHistory } from 'react-router';
import ArrowBackIcon from '@material-ui/icons/KeyboardBackspace';

// Firebase
import firebase from '../firebase/firebase';

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
        },
        backButtonContainer: {
            position: 'fixed',
            left: '24px',
            top: '24px',
            width: '48px',
            height: '48px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 24,
        },
        icon: {
            color: 'rgba(255, 255, 255, 0.7)'
        }
    };
});

const roomHistory = [];
let micEnabledd = true;
const connectedClientProfileImages = {};
let usernameGlobal = '';

function Scene({ sessionId, story, setCurrentRoomAction, viewOpenedFromApplication }) {
    const classes = styles();

    const sceneRef = useRef();
    const skyRef = useRef();

    const history = useHistory();

    const [vrEnabled, setVrEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(true);
    const [connectedClients, setConnectedClients] = useState([]);
    const [username, setUsername] = useState('');
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(true);

    const activeRoom = story.rooms.find((room) => {
        return room.active;
    });

    if (!roomHistory.length || (activeRoom.id !== roomHistory[roomHistory.length - 1].id)) {
        roomHistory.push(activeRoom);
    }

    useEffect(() => {
        sceneRef.current.addEventListener('switch-room', (e) => {
            goToRoom(e.detail);
        });

        sceneRef.current.addEventListener('enter-vr', function () {
            setVrEnabled(true);
        });

        sceneRef.current.addEventListener('exit-vr', function () {
            setVrEnabled(false);
        });

        sceneRef.current.addEventListener('toggle-mic', () => {
            toggleMic();
        });

        // Define custom schema for syncing avatar color, set by random-color
        NAF.schemas.add({
            template: '#avatar-template',
            components: [
                'position',
                'rotation'
            ]
        });

        document.body.addEventListener('clientConnected', onClientConnected, false);
        document.body.addEventListener('clientDisconnected', onClientDisconnected, false);

        NAF.connection.subscribeToDataChannel('string', onReceivedData);
    }, []);

    const onBack = () => {
        // Remove CSS styles injected by a-frame when going back to landing page/editor.
        document.documentElement.classList.remove('a-fullscreen');

        if (viewOpenedFromApplication) {
            history.goBack();
        }
        else {
            history.push('/')
        }
    }

    const goToRoom = async (roomId) => {
        let targetRoom = story.rooms.find((room) => {
            return room.id === roomId;
        });

        if (roomId === 'home') {
            targetRoom = story.rooms.find((room) => {
                return room.isHome;
            });
            if (!targetRoom) {
                targetRoom = story.rooms[0];
            }
        }
        if (roomId === 'last') {
            // Don't go to current room
            roomHistory.pop();

            targetRoom = roomHistory.pop();
            if (!targetRoom) {
                return;
            }
        }

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

    const toggleMic = () => {
        const enabled = micEnabledd;

        NAF.connection.adapter.enableMicrophone(!enabled);

        setMicEnabled(!enabled);
        micEnabledd = !micEnabledd;
    };

    const onClientConnected = (event) => {
        console.log(`Client connected ${event.detail.clientId}`);

        // Send request for profile image to connected client
        NAF.connection.sendDataGuaranteed(event.detail.clientId, 'string', 'profile_image_request');

        setConnectedClients((prevState) => {
            return [
                ...prevState,
                {
                    id: event.detail.clientId,
                    image: ''
                }
            ]
        });
    }

    const onReceivedData = async (senderId, dataType, data, targetId) => {
        // When receiving profile image request, send back URL for profile image
        if (data === 'profile_image_request') {
            if (firebase.currentUser) {
                NAF.connection.sendDataGuaranteed(senderId, 'string', `image_url${firebase.currentUser.photoURL}`);
            }
            else if (usernameGlobal) {
                NAF.connection.sendDataGuaranteed(senderId, 'string', `image_name${usernameGlobal.toUpperCase().charAt(0)}`);
            }
            else {
                NAF.connection.sendDataGuaranteed(senderId, 'string', `image_default`);
            }
        }
        let imageData = '';
        if (data.startsWith('image_url')) {
            imageData = await loadImage(data.split('image_url')[1]);
        }
        if (data.startsWith('image_name')) {
            imageData = getImageFromChar(data.split('image_name')[1]);
        }
        if (data.startsWith('image_default')) {
            imageData = await loadImage('/icons/user_filled.png');
        }

        if (imageData) {
            setConnectedClients((prevState) => {
                return prevState.map((client) => {
                    if (senderId !== client.id) {
                        return client;
                    }
                    else {
                        return {
                            id: senderId,
                            image: imageData
                        }
                    }
                });
            });
        }
    }

    const onClientDisconnected = (event) => {
        console.log(`Client disconnected ${event.detail.clientId}`);

        setConnectedClients((prevState) => {
            const clients = prevState.filter((client) => {
                return client.id !== event.detail.clientId;
            });

            return clients;
        });
    }

    // When user submits his username, broadcast it to other users in same room
    const onUsernameDialogSubmit = () => {
        setUsernameDialogOpen(false);

        NAF.connection.broadcastDataGuaranteed('string', `image_name${usernameGlobal.toUpperCase().charAt(0)}`);
    }

    const onUsernameChange = (event) => {
        setUsername(event.target.value);
        usernameGlobal = event.target.value;
    }

    return (
        <>
            <a-scene
                ref={sceneRef}
                preview-space
                device-orientation-permission-ui="enabled: true"
                loading-screen="enabled: false"
                vr-mode-ui="enterVRButton: #enterVRButton;"
                networked-scene={`
                    serverURL: comms.simplevr.irl.studio;
                    app: SimpleVR;
                    room: ${sessionId};
                    audio: true;
                    adapter: easyrtc;
                    debug: true;
                    connectOnLoad: ${sessionId ? 'true' : 'false'};
                `}
            >
                <a-assets>
                    <template
                        id='avatar-template'
                        dangerouslySetInnerHTML={{
                            __html: '<a-entity networked-audio-source />'
                        }}
                    />
                </a-assets>

                <a-entity
                    id='audio-source-entity'
                    networked="template:#avatar-template;attachTemplateToLocal:false;"
                >
                </a-entity>

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
                        loop={story.soundtrack.loop}
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
                        loop={activeRoom.backgroundNarration.loop}
                        class="narration-audio"
                        sound="positional: false"
                    >
                    </a-sound>}
                    {activeRoom.backgroundMusic.data &&
                    <a-sound
                        src={activeRoom.backgroundMusic.data}
                        autoplay={true}
                        volume={activeRoom.backgroundMusic.volume}
                        loop={activeRoom.backgroundMusic.loop}
                        sound="positional: false"
                    >
                    </a-sound>}
                </a-entity>}

                <a-sky ref={skyRef} src={activeRoom.panoramaUrl.backgroundImage.data} radius="512" />

                <a-entity
                    control-panel
                    material="
                        opacity: .5;
                        color: #fff"
                    geometry="
                        primitive: plane;
                        height: 1;
                        width: 4;"
                    look-at="a-camera"
                    position="0 -4 -3"
                    color="#00F"
                >
                    <PanelButton
                        position='-1 0 0'
                        event="switch-room-last"
                        icon="/icons/back_filled.png"
                    />
                    <PanelButton
                        position='0 0 0'
                        event="switch-room-home"
                        icon="/icons/home_filled.png"
                    />
                    <PanelButton
                        position='1 0 0'
                        event="toggle-mic"
                        icon={micEnabled ? '/icons/mic_on_filled.png' : '/icons/mic_off_filled.png'}
                    />
                    {vrEnabled &&
                    <PanelButton
                        position='2 0 0'
                        event={vrEnabled ? "close-vr" : 'enable-vr'}
                        icon={vrEnabled ? '/icons/close_vr_filled.png' : '/icons/enter_vr_filled.png'}
                    />}
                </a-entity>

                <a-entity
                    material="
                        opacity: 0;
                        color: #fff"
                    geometry="
                        primitive: plane;
                        height: 0.01;
                        width: 0.01;"
                    look-at="a-camera"
                    position="0 -4 -4"
                    color="#00F"
                >
                    {connectedClients.map((client, index) => {
                        return (
                            <a-image
                                crossorigin='anonymous'
                                key={client.id}
                                src={client.image || '/icons/user_filled.png'}
                                width="0.5"
                                height="0.5"
                                position={`${-1.9 + (index * 0.7)} 0 0`}
                                color="#FFF"
                                transparent='true'
                            />
                        );
                    })}
                </a-entity>
            </a-scene>
            {!vrEnabled &&
            <div className={classes.backButtonContainer}>
                <IconButton onClick={onBack}>
                    <ArrowBackIcon className={classes.icon} />
                </IconButton>
            </div>}
            <div id="enterVRButton" className={classes.enterVRContainer}>
                <IconButton>
                    <Typography className="light-text-90">
                        VR
                    </Typography>
                </IconButton>
            </div>
            {!firebase.currentUser && sessionId
            && <Dialog
                open={usernameDialogOpen}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
            >
                <DialogTitle id="form-dialog-title">
                    Enter your name
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={username}
                        onChange={onUsernameChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button disabled={!username} onClick={onUsernameDialogSubmit} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>}
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        story: state.project.story,
        viewOpenedFromApplication: state.navigation.viewOpenedFromApplication,
    };
};

export default connect(
    mapStateToProps,
    {
        setCurrentRoomAction: setCurrentRoom,
    },
)(Scene);
