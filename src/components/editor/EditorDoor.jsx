// External libraries
import { makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { normalizeAbsolutePosition, denormalizePosition } from '../../util/IconPosition';
import Vector2 from '../../util/Vector2';
import EditorEditDoor from './EditorEditDoor';

const styles = makeStyles(() => {
    return {
        doorContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'fixed',
        },
        doorIconContainer: {
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
        doorLabelContainer: {
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
export default function EditorDoor({ door, targetRoomName }) {
    const classes = styles();

    const [position, setPosition] = useState({
        x: 200,
        y: 400,
    });
    const [editorOpen, setEditorOpen] = useState(false);

    const doorElementRef = useRef();
    const mouseOffset = useRef(new Vector2());
    const mouseDownPosition = useRef(new Vector2());
    const grabbed = useRef(false);

    const style = {
        left: `${position.x}px`,
        top: `${position.y}px`,
    };

    function getMousePositionOnScreen(event) {
        const mousePosition = new Vector2(event.clientX, event.clientY);
        if ((!mousePosition.x || !mousePosition.y) && event.touches[0]) {
            mousePosition.setPosition(
                event.touches[0].clientX,
                event.touches[0].clientY,
            )
        }
        else if (event.changedTouches[0]) {
            mousePosition.setPosition(
                event.changedTouches[0].clientX,
                event.changedTouches[0].clientY,
            )
        }

        return mousePosition;
    }

    function onMouseDown(event) {
        const doorContainerRect = doorElementRef.current.getBoundingClientRect();

        const mousePosition = getMousePositionOnScreen(event);

        grabbed.current = true;
        mouseOffset.current.setPosition(
            mousePosition.x - doorContainerRect.left,
            mousePosition.y - doorContainerRect.top,
        );
        mouseDownPosition.current.setPosition(
            mousePosition.x,
            mousePosition.y,
        );
    }

    function onMouseMove(event) {
        if (grabbed.current) {
            const mousePosition = getMousePositionOnScreen(event);

            const x = mousePosition.x - mouseOffset.current.getX();
            const y = mousePosition.y - mouseOffset.current.getY();

            setPosition({
                x: x,
                y: y,
            });
        }
    }

    function onMouseUp(event) {
        grabbed.current = false;

        const doorContainerRect = doorElementRef.current.getBoundingClientRect();
        const doorCenter = new Vector2(
            doorContainerRect.left + doorContainerRect.width / 2,
            doorContainerRect.top + doorContainerRect.height / 2,
        );

        const mousePosition = getMousePositionOnScreen(event);

        const mouseUpPosition = new Vector2(mousePosition.x, mousePosition.y);

        if (mouseDownPosition.current.distanceTo(mouseUpPosition) < 5) {
            setEditorOpen(true);
        }

        const location = normalizeAbsolutePosition(doorCenter.getX(), doorCenter.getY());
        door.location.setPosition(location.x, location.y);
    }

    function closeEditor() {
        setEditorOpen(false);
    }

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onMouseMove);

        const absolutePosition = denormalizePosition(door.location.x, door.location.y);
        setPosition({
            x: absolutePosition.x,
            y: absolutePosition.y,
        });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onMouseMove);
        };
    }, []);

    return (
        <div>
            <div
                className={classes.doorContainer}
                style={style}
                onTouchStart={onMouseDown}
                onTouchEnd={onMouseUp}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                ref={doorElementRef}
            >
                <div className={classes.doorIconContainer}>
                    <img draggable={false} src="/icons/door-icon.svg" alt="door-icon" />
                </div>
                <div className={classes.doorLabelContainer}>
                    <Typography variant="body2" color="textSecondary">
                        {targetRoomName}
                    </Typography>
                </div>
            </div>
            {editorOpen
            && (
                <EditorEditDoor onClose={closeEditor} door={door} />
            )}
        </div>
    );
}
