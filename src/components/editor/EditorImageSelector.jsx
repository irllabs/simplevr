import { makeStyles, Typography } from '@material-ui/core';
import mime from 'mime-types';
import { useRef } from 'react';

import FileLoaderUtil from '../../util/FileLoader';

import EditorFileSelector from './EditorFileSelector.tsx';

const styles = makeStyles(() => {
    return {
        imageSelectorContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        imageSelectorTitle: {
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
        optionsContainer: {
            width: '100%',
            height: '36px',
            position: 'absolute',
            right: '8px',
            top: '8px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            cursor: 'pointer',
        },
        option: {
            marginLeft: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.15), 0px 4px 6px rgba(0, 0, 0, 0.15);',
            borderRadius: '32px',
            backgroundColor: 'white',
        },
    };
});
export default function EditorImageSelector({
    title,
    value,
    onChange,
    onRemove,
    removable,
}) {
    const classes = styles();

    const imageInputElement = useRef();

    const processSelectedImage = async (file) => {
        // Verify if input file is of valid type and format
        await FileLoaderUtil.validateFileLoadEvent(file, 'image');

        const fileData = await FileLoaderUtil.getBinaryFileData(file);

        const fileExtension = mime.extension(file.type);

        onChange(fileData, fileExtension);
    }

    const selectImage = () => {
        imageInputElement.current.click();
    };

    const onImageSelected = (event) => {
        const file = event.target.files && event.target.files[0];
        processSelectedImage(file);
    };

    const removeImage = () => {
        onRemove();
    };

    return (
        <div className={classes.imageSelectorContainer}>
            <input
                type="file"
                ref={imageInputElement}
                onChange={onImageSelected}
                style={{ display: 'none' }}
            />
            <div className={classes.imageSelectorTitle}>
                <Typography variant="body1">
                    {title}
                </Typography>
            </div>
            {!value
            && (
                <EditorFileSelector onChange={processSelectedImage} />
            )}
            {value && (
                <div className={classes.imageSelectorImagePreview} style={{ backgroundImage: `url(${value})` }}>
                    <div className={classes.optionsContainer}>
                        <div className={classes.option}>
                            <img src="icons/pencil-dark.svg" alt="remove" onClick={selectImage} />
                        </div>
                        {removable && (
                            <div className={classes.option}>
                                <img src="icons/cancel.svg" alt="remove" onClick={removeImage} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
