// External libraries
import React from 'react';
import { connect } from 'react-redux';

// External UI Components
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

// Style
import { makeStyles } from '@material-ui/core/styles';

// Redux Actions
import { addHotspot, addDoor } from '../../redux/actions';

// Models
import Hotspot from '../../models/hotspot';
import Door from '../../models/door';

const useStyles = makeStyles((theme) => {
    return {
        speedDial: {
            position: 'absolute',
            bottom: theme.spacing(4),
            left: theme.spacing(2),
        },
    };
});

function EditorFab({ addHotspotAction, addDoorAction, story }) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddHotspot = () => {
        const hotspot = new Hotspot();
        addHotspotAction(hotspot, story.getActiveRoom().id);

        handleClose();
    };

    const handleAddDoor = () => {
        const targetRoom = story.rooms.find((room) => {
            return room.id !== story.getActiveRoom().id;
        });

        if (!targetRoom) {
            return;
        }

        const door = new Door();
        door.targetRoomId = targetRoom.id;
        addDoorAction(door, story.getActiveRoom().id);

        handleClose();
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const actions = [{
        icon: <img src="/icons/door-icon.svg" onClick={handleAddDoor} alt="add-door" />,
        name: 'Add door',
    }, {
        icon: <img src="/icons/icon-add.svg" onClick={handleAddHotspot} alt="add-hotspot" />,
        name: 'Add hotspot',
    }];

    return (
        <SpeedDial
            ariaLabel="add-hotspot-menu"
            className={classes.speedDial}
            icon={<SpeedDialIcon />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            direction="up"
        >
            {actions.map((action) => {
                return (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                    />
                );
            })}
        </SpeedDial>
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
        addHotspotAction: addHotspot,
        addDoorAction: addDoor,
    },
)(EditorFab);
