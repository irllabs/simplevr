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
export default function EditorEditStory({ onClose }) {
    const classes = styles();

    return (
        <Dialog onClose={onClose} open maxWidth="xs" fullWidth>
            <DialogTitle className={classes.root}>
                <IconButton onClick={onClose} className={classes.closeIcon}>
                    <Close />
                </IconButton>
                <div className={classes.titleContainer}>
                    <Typography variant="body1">
                        Edit story
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent>
                <TextField
                    size="small"
                    id="story-name-input"
                    label="Story name"
                    helperText="Enter a short name for your story"
                    variant="outlined"
                    fullWidth
                />
                <Box m={4} />
                <TextField
                    size="small"
                    fullWidth
                    id="story-tags-input"
                    label="Story tags"
                    helperText="Use comma to add separate tags"
                    variant="outlined"
                />
                <Box m={4} />
                <Typography variant="body1">
                    Story soundtrack
                </Typography>
                <Box m={1} />
                <EditorAudioSelector />
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary">
                    Delete story
                </Button>
            </DialogActions>
        </Dialog>
    );
}
