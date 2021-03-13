// External libraries
import React from 'react';
import { connect } from 'react-redux';
import { Entity, Scene as AframeScene } from 'aframe-react';
import 'aframe';

import Hotspot from './Hotspot';
import Door from './Door';

function Scene({ story }) {
    return (
        <AframeScene>
            <Entity primitive="a-camera">
                <Entity
                    primitive="a-cursor"
                    animation__click={{
                        property: 'scale',
                        startEvents: 'click',
                        from: '0.1 0.1 0.1',
                        to: '1 1 1',
                        dur: 150,
                    }}
                />
            </Entity>

            {story.currentRoom.hotspots.map((hotspot) => {
                return (
                    <Hotspot key={hotspot.id} hotspot={hotspot} />
                );
            })}

            {story.currentRoom.doors.map((door) => {
                return (
                    <Door key={door.id} door={door} />
                );
            })}

            <Entity primitive="a-sky" radius="512" src={story.currentRoom.panoramaUrl.backgroundImage} />

        </AframeScene>
    );
}

const mapStateToProps = (state) => {
    return {
        story: state.story,
    };
};

export default connect(
    mapStateToProps,
    {},
)(Scene);
