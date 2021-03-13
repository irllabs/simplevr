import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

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
export default function EditorEditDoor({ onClose }) {
    const classes = styles();

    return (
        <Dialog onClose={onClose} open maxWidth="xs" fullWidth>
            <DialogTitle className={classes.root}>
                <IconButton onClick={onClose} className={classes.closeIcon}>
                    <Close />
                </IconButton>
                <div className={classes.titleContainer}>
                    <Typography variant="body1">
                        Edit door
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent>
                <p>
                    content
                </p>
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary">
                    Delete door
                </Button>
            </DialogActions>
        </Dialog>
    );
}
