import { makeStyles } from '@material-ui/core';
import React, { useRef } from 'react';
import { connect } from 'react-redux';
import Room from '../../models/room';
import FileLoaderUtil from '../../util/FileLoader';
import resizeImageAsync from '../../util/ResizeImage';

import { addRoom, setCurrentRoom, showSnackbar } from '../../redux/actions';
import EditorFileSelector from './EditorFileSelector';
import byteToMegabyte from '../../util/ByteToMegabyte';

const styles = makeStyles(() => {
    return {
        container: {
            marginLeft: '8px',
            width: '48px',
            height: '135px',
            minWidth: '48px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            boxSizing: 'border-box',
            border: '2px dashed rgba(0, 0, 0, 0.6);',
            justifyContent: 'center',
            alignItems: 'center',
        },
        icon: {
            width: '24px',
            height: '24px',
            cursor: 'pointer',
        },
    };
});
function EditorAddNewRoom({ addRoomAction, setCurrentRoomAction, showSnackbarAction }) {
    const classes = styles();

    const fileInput = useRef();

    const onAddNewRoom = () => {
        fileInput.current.click();
    };

    const onRoomPanoramaSelected = async (event) => {
        const file = event.target.files && event.target.files[0];

        processSelectedFile(file);

        // In order to allow user to upload multiple times, we need to reset input target value
        // eslint-disable-next-line no-param-reassign
        event.target.value = null;
    };

    const processSelectedFile = async (file) => {
        const fileTooLarge = file.size > 16777216;
        if (fileTooLarge) {
            showSnackbarAction(`File is too big. File should be less than ${byteToMegabyte(16777216)} megabytes`);
            return;
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
        const resizedImage = await resizeImageAsync(fileData, 'backgroundImage');

        // Create new room
        const room = new Room();
        room.panoramaUrl.backgroundImage.data = resizedImage.backgroundImage;
        room.panoramaUrl.backgroundImage.extension = 'jpeg';
        room.panoramaUrl.thumbnail.data = resizedImage.thumbnail;
        room.panoramaUrl.thumbnail.extension = 'jpeg';

        addRoomAction(room);

        setCurrentRoomAction(room);
    }

    return (
        <>
            <EditorFileSelector accept="image/png, image/jpeg, image/jpg" onChange={processSelectedFile}>
                <div className={classes.container}>
                    <img alt="add-new-room" src="icons/plus.svg" className={classes.icon} onClick={onAddNewRoom} />
                </div>
            </EditorFileSelector>
            <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="invisible"
                ref={fileInput}
                onChange={onRoomPanoramaSelected}
            />
        </>
    );
}

const mapStateToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    {
        addRoomAction: addRoom,
        setCurrentRoomAction: setCurrentRoom,
        showSnackbarAction: showSnackbar,
    },
)(EditorAddNewRoom);
