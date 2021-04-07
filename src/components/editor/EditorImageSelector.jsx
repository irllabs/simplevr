import { Button, makeStyles, Typography } from '@material-ui/core';
import mime from 'mime-types';
import { useRef } from 'react';
import { connect } from 'react-redux';
import { showSnackbar } from '../../redux/actions';
import byteToMegabyte from '../../util/ByteToMegabyte';

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
function EditorImageSelector({
    title,
    value,
    maxSize,
    onChange,
    onRemove,
    removable,
    showSnackbarAction
}) {
    const classes = styles();

    const imageInputElement = useRef();

    const processSelectedImage = async (file) => {
        if (maxSize) {
            const fileTooLarge = file.size > maxSize;
            if (fileTooLarge) {
                showSnackbarAction(`File is too big. File should be less than ${byteToMegabyte(maxSize)} megabytes`);
                return;
            }
        }

        // Verify if input file is of valid type and format
        try {
            await FileLoaderUtil.validateFileLoadEvent(file, 'image');
        }
        catch (error) {
            showSnackbarAction(error);
            return;
        }

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
                accept="image/png, image/jpeg, image/jpg"
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
                <EditorFileSelector accept="image/png, image/jpeg, image/jpg" onChange={processSelectedImage}>
                    <Button variant="outlined" fullWidth >
                        Select image (png, jpg)
                    </Button>
                </EditorFileSelector>
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

const mapStateToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    {
        showSnackbarAction: showSnackbar,
    },
)(EditorImageSelector);
