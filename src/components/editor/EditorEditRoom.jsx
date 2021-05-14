import React from 'react';
import { connect } from 'react-redux';
import mime from 'mime-types';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    Switch,
    TextField,
    Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

import {
    setRoomName,
    setRoomIsHome,
    setRoomBackground,
    setRoomBackgroundMusic,
    setRoomBackgroundNarration,
	deleteRoom,
	showSnackbar,
	setCurrentRoom,
} from '../../redux/actions';

import EditorAudioSelector from './EditorAudioSelector';
import EditorImageSelector from './EditorImageSelector';
import resizeImageAsync from '../../util/ResizeImage';

const styles = makeStyles(() => {
    return {
        root: {
            padding: '0px',
        },
        titleContainer: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
        },
        closeIcon: {
            position: 'absolute',
        },
        homeInfoContainer: {
            height: '48px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
    };
});
function EditorEditRoom({
    onClose,
    setRoomNameAction,
    setRoomIsHomeAction,
    setRoomBackgroundAction,
    setRoomBackgroundMusicAction,
    setRoomBackgroundNarrationAction,
	deleteRoomAction,
	showSnackbarAction,
	setCurrentRoomAction,
    room,
	story,
}) {
    const classes = styles();

    const onNameChange = (event) => {
        setRoomNameAction(room.id, event.target.value);
    };

    const onBackgroundImageChange = async (fileData) => {
        const resizedImage = await resizeImageAsync(fileData, 'backgroundImage');

        setRoomBackgroundAction(room.id, resizedImage.backgroundImage, resizedImage.thumbnail);
    };

    const onBackgroundMusicChange = (data, name, type) => {
        const extension = mime.extension(type);

        setRoomBackgroundMusicAction(room.id, data, name, extension, room.backgroundMusic.loop, room.backgroundMusic.volume);
    };

    const onBackgroundMusicRemove = () => {
        setRoomBackgroundMusicAction(room.id, null, '', '', false, 0.5);
    };

    const onBackgroundNarrationChange = (data, name, type) => {
        const extension = mime.extension(type);

        setRoomBackgroundNarrationAction(room.id, data, name, extension, room.backgroundNarration.loop, room.backgroundNarration.volume);
    };

    const onBackgroundNarrationRemove = () => {
        setRoomBackgroundNarrationAction(room.id, null, '', '', false, 0.5);
    };

    const onHomeChange = () => {
        setRoomIsHomeAction(room.id, !room.isHome);
    }

    const onBackgroundMusicLoopChange = (loop) => {
        setRoomBackgroundMusicAction(
            room.id,
            room.backgroundMusic.data,
            room.backgroundMusic.fileName,
            room.backgroundMusic.extension,
            loop,
            room.backgroundMusic.volume
        );
    }

    const onBackgroundMusicVolumeChange = (volume) => {
        setRoomBackgroundMusicAction(
            room.id,
            room.backgroundMusic.data,
            room.backgroundMusic.fileName,
            room.backgroundMusic.extension,
            room.backgroundMusic.loop,
            volume
        );
    }

    const onBackgroundNarrationLoopChange = (loop) => {
        setRoomBackgroundNarrationAction(
            room.id,
            room.backgroundNarration.data,
            room.backgroundNarration.fileName,
            room.backgroundNarration.extension,
            loop,
            room.backgroundNarration.volume
        );
    }

    const onBackgroundNarrationVolumeChange = (volume) => {
        setRoomBackgroundNarrationAction(
            room.id,
            room.backgroundNarration.data,
            room.backgroundNarration.fileName,
            room.backgroundNarration.extension,
            room.backgroundNarration.loop,
            volume
        );
    }

	const onDeleteRoom = () => {
		const anotherRoom = story.rooms.find((storyRoom) => {
			return storyRoom.id !== room.id;
		});

		if (!anotherRoom) {
			showSnackbarAction(`Can't delete last room in the story.`);
			return;
		}

		setCurrentRoomAction(anotherRoom);
		deleteRoomAction(room.id);

		onClose();
	}

    return (
        <Dialog onClose={onClose} open maxWidth="xs" fullWidth>
            <DialogTitle className={classes.root}>
                <IconButton onClick={onClose} className={classes.closeIcon}>
                    <Close />
                </IconButton>
                <div className={classes.titleContainer}>
                    <Typography variant="body1">
                        Edit room
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent>
                <TextField
                    size="small"
                    id="room-name-input"
                    label="Room name"
                    helperText="Enter a short name for your room"
                    variant="outlined"
                    fullWidth
                    value={room.name}
                    onChange={onNameChange}
                />
                <Box m={2} />
                <div className={classes.homeInfoContainer}>
                    <div style={{ display: 'flex' }}>
                        <img src="icons/home-icon.svg" alt="mark-room-as-home" />
                        <Box m={1} />
                        <Typography variant="body1">
                            Set as home
                        </Typography>
                    </div>
                    <div>
                        <Switch checked={room.isHome} onChange={onHomeChange} />
                    </div>
                </div>
                <Box m={2} />
                <EditorImageSelector
                    title="Background Image"
                    maxSize={16777216}
                    value={room.panoramaUrl.thumbnail.data}
                    onChange={onBackgroundImageChange}
                />
                <Box m={4} />
                <EditorAudioSelector
                    title="Room background music"
                    data={room.backgroundMusic.data}
                    name={room.backgroundMusic.fileName}
                    loop={room.backgroundMusic.loop}
                    volume={room.backgroundMusic.volume}
                    maxFileSize={134217728}
                    onPlayInLoopChange={onBackgroundMusicLoopChange}
                    onVolumeChange={onBackgroundMusicVolumeChange}
                    onChange={onBackgroundMusicChange}
                    onRemove={onBackgroundMusicRemove}
                />
                <Box m={4} />
                <EditorAudioSelector
                    title="Room background narration"
                    data={room.backgroundNarration.data}
                    name={room.backgroundNarration.fileName}
                    loop={room.backgroundNarration.loop}
                    volume={room.backgroundNarration.volume}
                    maxFileSize={134217728}
                    onPlayInLoopChange={onBackgroundNarrationLoopChange}
                    onVolumeChange={onBackgroundNarrationVolumeChange}
                    onChange={onBackgroundNarrationChange}
                    onRemove={onBackgroundNarrationRemove}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary" onClick={onDeleteRoom}>
                    Delete room
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const mapStateToProps = (state) => {
    return {
		story: state.project.story
	};
};

export default connect(
    mapStateToProps,
    {
		deleteRoomAction: deleteRoom,
        setRoomNameAction: setRoomName,
        setRoomIsHomeAction: setRoomIsHome,
        setRoomBackgroundAction: setRoomBackground,
        setRoomBackgroundMusicAction: setRoomBackgroundMusic,
        setRoomBackgroundNarrationAction: setRoomBackgroundNarration,
		setCurrentRoomAction: setCurrentRoom,
		showSnackbarAction: showSnackbar,
    },
)(EditorEditRoom);
