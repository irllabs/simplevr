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
    room,
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

        setRoomBackgroundMusicAction(room.id, data, extension);
    };

    const onBackgroundMusicRemove = () => {
        setRoomBackgroundMusicAction(room.id, null, '');
    };

    const onBackgroundNarrationChange = (data, name, type) => {
        const extension = mime.extension(type);

        setRoomBackgroundNarrationAction(room.id, data, extension);
    };

    const onBackgroundNarrationRemove = () => {
        setRoomBackgroundNarrationAction(room.id, null, '');
    };

    const onHomeChange = () => {
        setRoomIsHomeAction(room.id, !room.isHome);
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
                    value={room.panoramaUrl.thumbnail.data}
                    onChange={onBackgroundImageChange}
                />
                <Box m={4} />
                <EditorAudioSelector
                    title="Room background music"
                    data={room.backgroundMusic.data}
                    onChange={onBackgroundMusicChange}
                    onRemove={onBackgroundMusicRemove}
                />
                <Box m={4} />
                <EditorAudioSelector
                    title="Room background narration"
                    data={room.backgroundNarration.data}
                    onChange={onBackgroundNarrationChange}
                    onRemove={onBackgroundNarrationRemove}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary">
                    Delete room
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const mapStateToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    {
        setRoomNameAction: setRoomName,
        setRoomIsHomeAction: setRoomIsHome,
        setRoomBackgroundAction: setRoomBackground,
        setRoomBackgroundMusicAction: setRoomBackgroundMusic,
        setRoomBackgroundNarrationAction: setRoomBackgroundNarration,
    },
)(EditorEditRoom);
