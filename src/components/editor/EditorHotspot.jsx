// External libraries
import { makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { updateHotspot } from '../../redux/actions';
import { normalizeAbsolutePosition, denormalizePosition } from '../../util/IconPosition';
import Vector2 from '../../util/Vector2';
import EditorEditHotspot from './EditorEditHotspot';

const styles = makeStyles(() => {
    return {
        hotspotContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'fixed',
        },
        hotspotIconContainer: {
            background: 'white',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
            borderRadius: '48px',
            width: '48px',
            height: '48px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.15), 0px 0px 2px rgba(0, 0, 0, 0.15);',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        hotspotLabelContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.15), 0px 0px 2px rgba(0, 0, 0, 0.15);',
            borderRadius: '4px',
            marginTop: '4px',
        },
    };
});
function EditorHotspot({ hotspot }) {
    const classes = styles();

    const [position, setPosition] = useState({
        x: 100,
        y: 400,
    });
    const [editorOpen, setEditorOpen] = useState(false);

    const hotspotElementRef = useRef();
    const mouseOffset = useRef(new Vector2());
    const mouseDownPosition = useRef(new Vector2());
    const grabbed = useRef(false);

    const style = {
        left: `${position.x}px`,
        top: `${position.y}px`,
    };

    function onMouseDown(event) {
        const hotspotContainerRect = hotspotElementRef.current.getBoundingClientRect();

        grabbed.current = true;
        mouseOffset.current.setPosition(
            event.clientX - hotspotContainerRect.left,
            event.clientY - hotspotContainerRect.top,
        );
        mouseDownPosition.current.setPosition(
            event.clientX,
            event.clientY,
        );
    }

    function onMouseMove(event) {
        if (grabbed.current) {
            const x = event.clientX - mouseOffset.current.getX();
            const y = event.clientY - mouseOffset.current.getY();

            setPosition({
                x: x,
                y: y,
            });
        }
    }

    function onMouseUp(event) {
        grabbed.current = false;

        const hotspotContainerRect = hotspotElementRef.current.getBoundingClientRect();
        const hotspotCenter = new Vector2(
            hotspotContainerRect.left + hotspotContainerRect.width / 2,
            hotspotContainerRect.top + hotspotContainerRect.height / 2,
        );

        const mouseUpPosition = new Vector2(event.clientX, event.clientY);

        if (mouseDownPosition.current.distanceTo(mouseUpPosition) < 5) {
            setEditorOpen(true);
        }

        const location = normalizeAbsolutePosition(hotspotCenter.getX(), hotspotCenter.getY());
        hotspot.location.setPosition(location.x, location.y);

        // updateHotspotAction(hotspot);
    }

    function closeEditor() {
        setEditorOpen(false);
    }

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);

        const absolutePosition = denormalizePosition(hotspot.location.x, hotspot.location.y);
        setPosition({
            x: absolutePosition.x,
            y: absolutePosition.y,
        });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <div>
            <div className={classes.hotspotContainer} style={style} onMouseDown={onMouseDown} onMouseUp={onMouseUp} ref={hotspotElementRef}>
                <div className={classes.hotspotIconContainer}>
                    <img draggable={false} src={`icons/${hotspot.getIcon('svg')}`} alt="hotspot-icon" />
                </div>
                <div className={classes.hotspotLabelContainer}>
                    <Typography variant="body2" color="textSecondary">
                        {hotspot.label}
                    </Typography>
                </div>
            </div>
            {editorOpen
            && (
                <EditorEditHotspot onClose={closeEditor} />
            )}
        </div>
    );
}

const mapStateToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    {
        updateHotspotAction: updateHotspot,
    },
)(EditorHotspot);
