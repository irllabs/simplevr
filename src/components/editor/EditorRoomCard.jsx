import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import EditorEditRoom from './EditorEditRoom';

import { setCurrentRoom } from '../../redux/actions';

const styles = makeStyles(() => {
    return {
        container: {
            minWidth: '150px',
            width: '175px',
            height: '135px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            boxSizing: 'border-box',
            border: '2px solid',
            marginLeft: '8px',
        },
        roomInfoContainer: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            justifyContent: 'space-between'
        },
        roomActionsContainer: {
            display: 'flex',
            alignItems: 'center'
        },
        roomInfo: {
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
        },
        roomItemsInfo: {
            display: 'flex',
        },
        roomThumbnail: {
            width: '100%',
            height: '100%',
            display: 'flex',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: '0px 0px 6px 6px',
            position: 'relative',
        },
        editRoomContainer: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        editIcon: {
            cursor: 'pointer',
            width: '17px',
            height: '17px'
        },
        icon: {
            width: '25px',
            height: '25px',
            marginRight: '5px'
        }
    };
});
function EditorRoomCard({
    room,
    active,
    setCurrentRoomAction,
    hotspotCount,
    doorCount,
}) {
    const classes = styles();

    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const onEditRoom = () => {
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
    };

    const goToRoom = () => {
        setCurrentRoomAction(room);
    };

    return (
        <>
            <div className={classes.container} style={{ borderColor: active ? '#E34B78' : '#444444' }}>
                <div className={classes.roomInfoContainer}>
                    <div className={classes.roomInfo} onClick={goToRoom}>
                        <Typography variant="body2">
                            {room.name}
                        </Typography>
                        <div className={classes.roomItemsInfo}>
                            <img alt="hotspot-count" src="icons/hotspot-count-icon.svg" />
                            <Box m={0.2} />
                            <Typography variant="caption">
                                {hotspotCount}
                            </Typography>
                            <Box m={0.5} />
                            <img alt="hotspot-count" src="icons/door-count-icon.svg" />
                            <Box m={0.2} />
                            <Typography variant="caption">
                                {doorCount}
                            </Typography>
                        </div>
                    </div>
                    <div className={classes.roomActionsContainer}>
                        {room.isHome &&
                        <img src='/icons/home-icon.svg' className={classes.icon} />}
                        <img alt="edit-room" src="icons/pencil-dark.svg" className={classes.editIcon} onClick={onEditRoom} />
                    </div>
                </div>
                <div
                    className={classes.roomThumbnail}
                    style={{ backgroundImage: `url(${room.panoramaUrl.thumbnail.data})` }}
                />
            </div>
            {editDialogOpen
            && (
                <EditorEditRoom onClose={closeEditDialog} room={room} />
            )}
        </>
    );
}

const mapStateToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    {
        setCurrentRoomAction: setCurrentRoom,
    },
)(EditorRoomCard);
