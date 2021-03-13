import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import EditorEditRoom from './EditorEditRoom';

const styles = makeStyles(() => {
    return {
        container: {
            width: '150px',
            height: '135px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            boxSizing: 'border-box',
            border: '2px solid #E34B78',
            marginLeft: '8px',
        },
        roomInfoContainer: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
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
export default function EditorRoomCard({ room }) {
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

    return (
        <>
            <div className={classes.container}>
                <div className={classes.roomInfoContainer}>
                    <div className={classes.roomInfo}>
                        <Typography variant="body2">
                            {room.name}
                        </Typography>
                        <div className={classes.roomItemsInfo}>
                            <img alt="hotspot-count" src="icons/hotspot-count-icon.svg" />
                            <Box m={0.2} />
                            <Typography variant="caption">
                                {room.hotspots.length}
                            </Typography>
                            <Box m={0.5} />
                            <img alt="hotspot-count" src="icons/door-count-icon.svg" />
                            <Box m={0.2} />
                            <Typography variant="caption">
                                {room.doors.length}
                            </Typography>
                        </div>
                    </div>
                </div>
                <div
                    onMouseEnter={onMouseEnterImage}
                    onMouseLeave={onMouseLeaveImage}
                    className={classes.roomThumbnail}
                    style={{ backgroundImage: 'url(france-pool.jpg)' }}
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
                <EditorEditRoom onClose={closeEditDialog} />
            )}
        </>
    );
}
