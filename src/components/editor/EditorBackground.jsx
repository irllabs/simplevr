// External libraries
import React from 'react';
import { connect } from 'react-redux';

// Styles
import { makeStyles } from '@material-ui/core';

// Components
import EditorHotspot from './EditorHotspot';
import EditorDoor from './EditorDoor';

const styles = makeStyles(() => {
    return {
        backgroundImage: {
            width: '100%',
            height: '100%',
            position: 'fixed',
        },
    };
});
function EditBackground({ story }) {
    const classes = styles();

    const getRoomName = (roomId) => {
        const room = story.rooms.find((room) => {
            return room.id === roomId;
        });
        return room.name;
    }

    const activeRoom = story.rooms.find((room) => {
        return room.active;
    });

    return (
        <div>
            <img src={activeRoom.panoramaUrl.backgroundImage.data} alt="room-background" className={classes.backgroundImage} draggable={false} />
            {activeRoom.hotspots.map((hotspot) => {
                return (
                    <EditorHotspot key={hotspot.id} hotspot={hotspot} />
                );
            })}
            {activeRoom.doors.map((door) => {
                return (
                    <EditorDoor key={door.id} door={door} targetRoomName={getRoomName(door.targetRoomId)} />
                );
            })}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        story: state.project.story,
    };
};

export default connect(
    mapStateToProps,
    {},
)(EditBackground);
