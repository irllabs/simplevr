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

    return (
        <div>
            <img src={story.currentRoom.panoramaUrl.backgroundImage} alt="room-background" className={classes.backgroundImage} draggable={false} />
            {story.currentRoom.hotspots.map((hotspot) => {
                return (
                    <EditorHotspot key={hotspot.id} hotspot={hotspot} />
                );
            })}
            {story.currentRoom.doors.map((door) => {
                return (
                    <EditorDoor key={door.id} door={door} />
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
