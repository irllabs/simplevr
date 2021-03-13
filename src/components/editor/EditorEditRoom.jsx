import React from 'react';
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
export default function EditorEditRoom({ onClose }) {
    const classes = styles();

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
                />
                <Box m={4} />
                <Typography variant="body1">
                    Background Image
                </Typography>
                <Box m={1} />
                <EditorImageSelector />
                <Box m={4} />
                <Typography variant="body1">
                    Room background music
                </Typography>
                <Box m={1} />
                <EditorAudioSelector />
                <Box m={4} />
                <Typography variant="body1">
                    Room background narration
                </Typography>
                <Box m={1} />
                <EditorAudioSelector />
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary">
                    Delete room
                </Button>
            </DialogActions>
        </Dialog>
    );
}
