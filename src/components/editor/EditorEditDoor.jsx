import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    makeStyles,
    MenuItem,
    Select,
    Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { connect } from 'react-redux';

import { updateDoor } from '../../redux/actions';

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
function EditorEditDoor({
    onClose,
    door,
    story,
    updateDoorAction,
}) {
    const classes = styles();

    const onChangeTargetRoom = (event) => {
        door.targetRoomId = event.target.value;

        updateDoorAction(door);
    };

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
                <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel id="target-room-input-label">Destination room</InputLabel>
                    <Select
                        labelId="target-room-input-label"
                        id="destination-room-select"
                        value={door.targetRoomId}
                        onChange={onChangeTargetRoom}
                        label="Destination room"
                    >
                        {story.rooms.map((room) => {
                            return (
                                <MenuItem key={room.id} value={room.id}>
                                    {room.name}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary">
                    Delete door
                </Button>
            </DialogActions>
        </Dialog>
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
        updateDoorAction: updateDoor,
    },
)(EditorEditDoor);
