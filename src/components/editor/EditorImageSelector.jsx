import { Button, makeStyles, Typography } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import FileLoaderUtil from '../../util/FileLoader';

const styles = makeStyles(() => {
    return {
        imageSelectorContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        imageSelectorTitle: {
            paddingLeft: '16px',
            paddingRight: '16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
        },
        imageSelectorImagePreview: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            height: '150px',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            position: 'relative',
        },
        removeImage: {
            width: '32px',
            height: '32px',
            position: 'absolute',
            right: '8px',
            top: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.15), 0px 4px 6px rgba(0, 0, 0, 0.15);',
            borderRadius: '32px',
        },
    };
});
export default function EditorImageSelector({ title }) {
    const classes = styles();

    const imageInputElement = useRef();

    const [imageData, setImageData] = useState(null);

    const selectImage = () => {
        imageInputElement.current.click();
    };

    const onImageSelected = async (event) => {
        const file = event.target.files && event.target.files[0];

        // Verify if input file is of valid type and format
        await FileLoaderUtil.validateFileLoadEvent(file, 'image');

        const fileData = await FileLoaderUtil.getBinaryFileData(file);

        setImageData(fileData);
    };

    return (
        <div className={classes.imageSelectorContainer}>
            <input
                type="file"
                className={classes.input}
                ref={imageInputElement}
                onChange={onImageSelected}
                style={{ display: 'none' }}
            />

            <div className={classes.imageSelectorTitle}>
                <Typography variant="body2">
                    {title}
                </Typography>
            </div>
            {!imageData
            && (
                <Button variant="outlined" fullWidth onClick={selectImage}>
                    Select image
                </Button>
            )}
            {imageData && (
                <div className={classes.imageSelectorImagePreview} style={{ backgroundImage: `url(${imageData})` }}>
                    <div className={classes.removeImage}>
                        <img src="icons/cancel.svg" alt="remove" />
                    </div>
                </div>
            )}
        </div>
    );
}
