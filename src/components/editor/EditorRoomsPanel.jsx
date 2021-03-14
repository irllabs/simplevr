import { connect } from 'react-redux';
import {
    Divider,
    IconButton,
    makeStyles,
    Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import EditorRoomCard from './EditorRoomCard';
import EditorAddNewRoom from './EditorAddNewRoom';

const styles = makeStyles(() => {
    return {
        container: {
            width: '100%',
            height: '100%',
            position: 'fixed',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column-reverse',
            pointerEvents: 'none',
            zIndex: 5,
        },
        header: {
            borderRadius: '12px 12px 0px 0px',
            backgroundColor: 'white',
            width: '600px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'all',
        },
        body: {
            backgroundColor: 'white',
            width: '600px',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'all',
        },
        paginationControls: {
            width: '100%',
            height: '48px',
            display: 'flex',
            flexDirection: 'row-reverse',
            paddingRight: '12px',
        },
        roomCards: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
        },
    };
});
function EditorRoomsPanel({ rooms }) {
    const classes = styles();

    const [expanded, setExpanded] = useState(false);

    const onToggle = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={classes.container}>
            {expanded
            && (
                <div className={classes.body}>
                    <Divider style={{ width: '100%' }} />
                    <div className={classes.paginationControls}>
                        <IconButton>
                            <img alt="move-right" src="icons/chevron-right.svg" />
                        </IconButton>
                        <IconButton>
                            <img alt="move-right" src="icons/chevron-left.svg" />
                        </IconButton>
                    </div>
                    <div className={classes.roomCards}>
                        {rooms.map((room) => {
                            return (
                                <EditorRoomCard key={room.id} room={room} />
                            );
                        })}
                        <EditorAddNewRoom />
                    </div>
                </div>
            )}
            <div className={classes.header}>
                <IconButton onClick={onToggle}>
                    <img alt="toggle-rooms-panel" src={`icons/chevron-${expanded ? 'bottom' : 'top'}.svg`} />
                </IconButton>
                <Typography variant="body2">
                    Rooms (4)
                </Typography>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        rooms: state.project.story.rooms,
    };
};

export default connect(
    mapStateToProps,
    {},
)(EditorRoomsPanel);
