// External libraries
import React from 'react';
import { connect } from 'react-redux';

// External UI Components
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

// Icons
import HotspotIcon from '@material-ui/icons/DonutLarge';
import DoorIcon from '@material-ui/icons/Input';

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
        addHotspotAction(hotspot, story.currentRoom.id);

        handleClose();
    };

    const handleAddDoor = () => {
        const door = new Door();
        addDoorAction(door, story.currentRoom.id);

        handleClose();
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const actions = [{
        icon: <HotspotIcon onClick={handleAddHotspot} />,
        name: 'Add hotspot',
    }, {
        icon: <DoorIcon onClick={handleAddDoor} />,
        name: 'Add door',
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
        story: state.story,
    };
};

export default connect(
    mapStateToProps,
    {
        addHotspotAction: addHotspot,
        addDoorAction: addDoor,
    },
)(EditorFab);
