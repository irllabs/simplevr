import { connect } from 'react-redux';
import {
    Divider,
    IconButton,
    makeStyles,
    Typography,
} from '@material-ui/core';
import React, { useRef, useState } from 'react';
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
            cursor: 'pointer'
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
            overflow: 'hidden',
            flex: 1,
        },
    };
});
function EditorRoomsPanel({ rooms, story }) {
    const classes = styles();

    const scrollPosition = useRef(0);

    const roomCardsRef = useRef();

    const [expanded, setExpanded] = useState(false);

    const onToggle = () => {
        setExpanded(!expanded);
    };

    const scrollRight = () => {
        scrollPosition.current += 250;

        scrollPosition.current = Math.min(roomCardsRef.current.scrollWidth - roomCardsRef.current.clientWidth, scrollPosition.current);

        roomCardsRef.current.scroll({
            left: scrollPosition.current,
            behavior: 'smooth',
        });
    };

    const scrollLeft = () => {
        scrollPosition.current -= 250;

        scrollPosition.current = Math.max(0, scrollPosition.current);

        roomCardsRef.current.scroll({
            left: scrollPosition.current,
            behavior: 'smooth',
        });
    };

    return (
        <div className={classes.container}>
            {expanded
            && (
                <div className={classes.body}>
                    <Divider style={{ width: '100%' }} />
                    <div className={classes.paginationControls}>
                        <IconButton onClick={scrollRight}>
                            <img alt="move-right" src="icons/chevron-right.svg" />
                        </IconButton>
                        <IconButton onClick={scrollLeft}>
                            <img alt="move-right" src="icons/chevron-left.svg" />
                        </IconButton>
                    </div>
                    <div className={classes.roomCards} ref={roomCardsRef}>
                        {rooms.map((room) => {
                            return (
                                <EditorRoomCard
                                    key={room.id}
                                    room={room}
                                    active={story.getActiveRoom().id === room.id}
                                    hotspotCount={room.hotspots.length}
                                    doorCount={room.doors.length}
                                />
                            );
                        })}
                        <EditorAddNewRoom />
                    </div>
                </div>
            )}
            <div className={classes.header} onClick={onToggle}>
                <IconButton onClick={onToggle}>
                    <img alt="toggle-rooms-panel" src={`icons/chevron-${expanded ? 'bottom' : 'top'}.svg`} />
                </IconButton>
                <Typography variant="body2">
                    Rooms ({rooms.length})
                </Typography>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        story: state.project.story,
        rooms: state.project.story.rooms,
    };
};

export default connect(
    mapStateToProps,
    {},
)(EditorRoomsPanel);
