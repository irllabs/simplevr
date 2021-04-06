import React from 'react';
import mime from 'mime-types';
import { connect } from 'react-redux';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    TextField,
    Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

import EditorAudioSelector from './EditorAudioSelector';
import EditorImageSelector from './EditorImageSelector';
import {
    setHotspotName,
    setHotspotText,
    setHotspotImage,
    setHotspotAudio,
} from '../../redux/actions';
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
    };
});
function EditorEditHotspot({
    hotspot,
    onClose,
    setHotspotNameAction,
    setHotspotTextAction,
    setHotspotImageAction,
    setHotspotAudioAction,
}) {
    const classes = styles();

    const onNameChange = (event) => {
        setHotspotNameAction(hotspot.id, event.target.value);
    };

    const onTextChange = (event) => {
        setHotspotTextAction(hotspot.id, event.target.value);
    };

    const onImageChange = async (imageData, extension) => {
        const resizedImage = await resizeImageAsync(imageData, 'hotspotImage');

        setHotspotImageAction(hotspot.id, resizedImage, extension);
    };

    const onImageRemove = () => {
        setHotspotImageAction(hotspot.id, null, '');
    };

    const onAudioChange = (data, name, type) => {
        const extension = mime.extension(type);

        setHotspotAudioAction(hotspot.id, data, name, extension, hotspot.audio.loop, hotspot.audio.volume);
    };

    const onRemoveAudio = () => {
        setHotspotAudioAction(hotspot.id, null, '', '', false, 0.5);
    };

    const onLoopChange = (loop) => {
        setHotspotAudioAction(hotspot.id, hotspot.audio.data, hotspot.audio.fileName, hotspot.audio.extension, loop, hotspot.audio.volume);
    }

    const onVolumeChange = (volume) => {
        setHotspotAudioAction(hotspot.id, hotspot.audio.data, hotspot.audio.fileName, hotspot.audio.extension, hotspot.audio.loop, volume);
    }

    return (
        <Dialog onClose={onClose} open maxWidth="xs" fullWidth>
            <DialogTitle className={classes.root}>
                <IconButton onClick={onClose} className={classes.closeIcon}>
                    <Close />
                </IconButton>
                <div className={classes.titleContainer}>
                    <Typography variant="body1">
                        Edit hotspot
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent>
                <TextField
                    size="small"
                    id="hotspot-name-input"
                    label="Hotspot name"
                    helperText="Enter a short name for your hotspot"
                    variant="outlined"
                    fullWidth
                    value={hotspot.label}
                    onChange={onNameChange}
                />
                <Box m={4} />
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    id="hotspot-text-input"
                    label="Add text"
                    helperText="Describe your hotspot"
                    variant="outlined"
                    value={hotspot.text}
                    onChange={onTextChange}
                />
                <Box m={4} />
                <EditorImageSelector
                    title="Add image"
                    value={hotspot.image.data}
                    onChange={onImageChange}
                    removable
                    onRemove={onImageRemove}
                />
                <Box m={4} />
                <EditorAudioSelector
                    title="Add audio"
                    name={hotspot.audio.fileName}
                    data={hotspot.audio.data}
                    loop={hotspot.audio.loop}
                    volume={hotspot.audio.volume}
                    maxFileSize={134217728}
                    onPlayInLoopChange={onLoopChange}
                    onVolumeChange={onVolumeChange}
                    onChange={onAudioChange}
                    onRemove={onRemoveAudio}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary">
                    Delete hotspot
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
        setHotspotNameAction: setHotspotName,
        setHotspotTextAction: setHotspotText,
        setHotspotImageAction: setHotspotImage,
        setHotspotAudioAction: setHotspotAudio,
    },
)(EditorEditHotspot);
