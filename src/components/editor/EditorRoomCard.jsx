import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import EditorEditRoom from './EditorEditRoom';

import { setCurrentRoom } from '../../redux/actions';

const styles = makeStyles(() => {
    return {
        container: {
            minWidth: '150px',
            width: '150px',
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
            cursor: 'pointer',
        },
        roomInfo: {
            display: 'flex',
            flexDirection: 'column',
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
        },
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

    const [editOptionVisible, setEditOptionVisible] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const onMouseEnterImage = () => {
        setEditOptionVisible(true);
    };

    const onMouseLeaveImage = () => {
        setEditOptionVisible(false);
    };

    const onEditRoom = () => {
        setEditOptionVisible(false);
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
                <div className={classes.roomInfoContainer} onClick={goToRoom}>
                    <div className={classes.roomInfo}>
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
                </div>
                <div
                    onMouseEnter={onMouseEnterImage}
                    onMouseLeave={onMouseLeaveImage}
                    className={classes.roomThumbnail}
                    style={{ backgroundImage: `url(${room.panoramaUrl.thumbnail.data})` }}
                >
                    {editOptionVisible
                    && (
                        <div className={classes.editRoomContainer}>
                            <img alt="edit-room" src="icons/pencil-dark.svg" className={classes.editIcon} onClick={onEditRoom} />
                        </div>
                    )}
                </div>
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
