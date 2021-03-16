// External libraries
import React, { FC, useRef, useState } from "react";

// External UI Components
import { Button, makeStyles } from "@material-ui/core";

interface EditorFileSelectorProps {
    onChange: (file: File) => void;
}
const styles = makeStyles(() => {
    return {
        input: {
            display: 'none',
        },
        container: {
            position: 'relative',
        },
        dropZone: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }
    };
});
const EditorFileSelector: FC<EditorFileSelectorProps> = ({onChange}) => {
    const classes = styles();

    const imageInputElement = useRef<HTMLInputElement>();

    const [draggingOver, setDraggingOver] = useState(false);

    const selectImage = () => {
        imageInputElement.current.click();
    };

    const onImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        onChange(file);
    };

    const onImageDropped = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        onChange(file);

        setDraggingOver(false);
    }

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        setDraggingOver(true);
    }

    const onDragLeave = () => {
        setDraggingOver(false);
    }

    return (
        <>
            <input
                type="file"
                className={classes.input}
                ref={imageInputElement}
                onChange={onImageSelected}
                style={{ display: 'none' }}
            />
            <div className={classes.container}>
                <Button variant="outlined" fullWidth style={{borderColor: draggingOver ? 'black' : ''}}>
                    Select image
                </Button>
                <div onClick={selectImage} onDragOver={onDragOver} onDrop={onImageDropped} onDragLeave={onDragLeave} className={classes.dropZone} />
            </div>
        </>
    );
}
export default EditorFileSelector;
