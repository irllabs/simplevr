// External libraries
import { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import mime from 'mime-types';

// Styles
import { makeStyles } from '@material-ui/core';

// Components
import EditorHotspot from './EditorHotspot';
import EditorDoor from './EditorDoor';

// Redux
import { RootState } from '../../redux/reducers/index';
import { addHotspot, showSnackbar } from '../../redux/actions';

// Models
import Hotspot from '../../models/hotspot';

// Util
import FileLoaderUtil from '../../util/FileLoader';
import resizeImageAsync from '../../util/ResizeImage';
import { normalizeAbsolutePosition } from '../../util/IconPosition';

const styles = makeStyles(() => {
    return {
        backgroundImage: {
            width: '100%',
            height: '100%',
            position: 'fixed',
        },
    };
});

const mapStateToProps = (state: RootState) => {
    return {
        story: state.project.story,
    };
};

const connector = connect(
    mapStateToProps,
    {
        addHotspotAction: addHotspot,
        showSnackbarAction: showSnackbar
    },
);

type ReduxProps = ConnectedProps<typeof connector>

const EditorBackground: FC<ReduxProps> = ({ story, addHotspotAction, showSnackbarAction }) => {
    const classes = styles();

    const getRoomName = (roomId: string) => {
        const room = story.rooms.find((room) => {
            return room.id === roomId;
        });
        return room.name;
    }

    const onFileDropped = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const file = event.dataTransfer.files && event.dataTransfer.files[0];

        const location = normalizeAbsolutePosition(event.clientX - 35, event.clientY - 30);

        if (FileLoaderUtil.isFileOfType(file, 'image')) {
            const fileData = await FileLoaderUtil.getBinaryFileData(file);
            const fileExtension = mime.extension(file.type);
            const resizedImage = await resizeImageAsync(fileData, 'hotspotImage');

            const hotspot = new Hotspot();
            hotspot.image.data = resizedImage;
            if (typeof fileExtension === 'string') {
                hotspot.image.extension = fileExtension;
            }
            hotspot.image.preloaded = true;

            hotspot.location = location;

            addHotspotAction(hotspot, story.getActiveRoom().id);
        }
        else if (FileLoaderUtil.isFileOfType(file, 'audio')) {
            const fileData = await FileLoaderUtil.getBinaryFileData(file);
            const extension = mime.extension(file.type);

            const hotspot = new Hotspot();
            hotspot.audio.data = fileData;
            if (typeof extension === 'string') {
                hotspot.audio.extension = extension;
            }
            hotspot.audio.fileName = file.name;

            hotspot.location = location;

            addHotspotAction(hotspot, story.getActiveRoom().id);
        }
        else {
            showSnackbarAction('Invalid file type.\nSupported hotspot file types are: png, jpeg, jpg, mp3, wav, mpeg, x-wav, aac, x-m4a.');
        }
    }

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }

    const activeRoom = story.rooms.find((room) => {
        return room.active;
    });

    return (
        <div>
            <img
                src={activeRoom.panoramaUrl.backgroundImage.data}
                alt="room-background"
                className={classes.backgroundImage}
                draggable={false}
                onDragOver={onDragOver}
                onDrop={onFileDropped}
            />
            {activeRoom.hotspots.map((hotspot) => {
                return (
                    <EditorHotspot key={hotspot.id} hotspot={hotspot} />
                );
            })}
            {activeRoom.doors.map((door) => {
                return (
                    <EditorDoor key={door.id} door={door} targetRoomName={getRoomName(door.targetRoomId)} />
                );
            })}
        </div>
    );
}

export default connector(EditorBackground);
