// External libraries
import React, { FC, useRef, useState } from "react";

// External UI Components
import { Button, makeStyles } from "@material-ui/core";

interface EditorFileSelectorProps {
    accept: string;
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
            bottom: 0,
            cursor: 'pointer'
        }
    };
});
const EditorFileSelector: FC<EditorFileSelectorProps> = ({children, accept, onChange}) => {
    const classes = styles();

    const imageInputElement = useRef<HTMLInputElement>();

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
    }

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }

    return (
        <>
            <input
                type="file"
                className={classes.input}
                ref={imageInputElement}
                onChange={onImageSelected}
                style={{ display: 'none' }}
                accept={accept}
            />
            <div className={classes.container}>
                {children}
                <div
                    onClick={selectImage}
                    onDragOver={onDragOver}
                    onDrop={onImageDropped}
                    className={classes.dropZone}
                />
            </div>
        </>
    );
}
export default EditorFileSelector;
