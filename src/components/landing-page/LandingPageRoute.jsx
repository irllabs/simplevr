// External libraries
import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

// External UI Components
import { makeStyles } from '@material-ui/core/styles';
import {
    Box,
    Button,
    Container,
    Typography,
} from '@material-ui/core';

// Components
import Header from '../header/Header';
import SignInDialog from '../dialogs/SignInDialog';
import UserStoriesSection from './UserStoriesSection';
import PublicStoriesSection from './PublicStoriesSection.tsx';
import EditorFileSelector from '../editor/EditorFileSelector';

// Redux Actions
import { setCurrentRoom, setProject, setStory, showSnackbar } from '../../redux/actions';

// Util
import FileLoaderUtil from '../../util/FileLoader';
import resizeImageAsync from '../../util/ResizeImage';
import byteToMegabyte from '../../util/ByteToMegabyte';

// Models
import Room from '../../models/room';
import Project from '../../models/project.ts';

// Services
import ProjectArchiveLoader from '../../service/ProjectArchiveLoader';

const styles = makeStyles((theme) => {
    return {
        hero: {
            backgroundColor: theme.palette.secondary.main,
            padding: '32px 64px',
            borderRadius: '24px',
            textAlign: 'center',
        },
        uploadButton: {
            padding: '24px 48px',
            border: '2px dashed #e34b78',
            borderRadius: '60px',
            boxSizing: 'content-box',
            fontSize: '20px',
            fontWeight: 600,
            marginTop: '32px',
        },
        uploadButtonContent: {
            display: 'flex',
            flexDirection: 'column',
        },
        input: {
            display: 'none',
        },
    };
});
function LandingPageRoute({ setProjectAction, setStoryAction, setCurrentRoomAction, showSnackbarAction }) {
    const classes = styles();
    const fileInput = useRef();
    const history = useHistory();

    const onStoryPanoramaSelected = (event) => {
        const file = event.target.files && event.target.files[0];

        processSelectedFile(file);
    };

    const processSelectedFile = async (file) => {
        if (file.type === 'application/zip') {
            loadStoryFromArchive(file);
            return;
        }

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

        // Create new project
        const project = new Project();

        const room = new Room();
        room.panoramaUrl.backgroundImage.data = resizedImage.backgroundImage;
        room.panoramaUrl.backgroundImage.extension = 'jpeg';
        room.panoramaUrl.thumbnail.data = resizedImage.thumbnail;
        room.panoramaUrl.thumbnail.extension = 'jpeg';

        project.story.rooms.push(room);

        // Set newly created story (and first room) as active story in redux
        setProjectAction(project);
        setStoryAction(project.story);
        setCurrentRoomAction(room);

        // Navigate to editor for further story edits
        history.push('/editor');
    }

    const onCreateStoryClick = () => {
        fileInput.current.click();
    };

    const loadStoryFromArchive = async (file) => {
        const loader = new ProjectArchiveLoader();
        const project = await loader.load(file);

        setProjectAction(project);
        setStoryAction(project.story);
        setCurrentRoomAction(project.story.rooms[0]);

        // Navigate to editor for further story edits
        history.push('/editor');
    }

    return (
        <>
            <Header />
            <Container maxWidth="md">
                <Box className={classes.hero}>
                    <Typography variant="body1" className="light-text">
                        test creating your immersive story by combining 360 photos with audio recordings, images, and text
                    </Typography>
                    <input
                        id="welcome-message-input"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className={classes.input}
                        ref={fileInput}
                        onChange={onStoryPanoramaSelected}
                    />
                    <EditorFileSelector accept="image/png, image/jpeg, image/jpg" onChange={processSelectedFile}>
                        <Button
                            className={classes.uploadButton}
                            size="large"
                            color="primary"
                            onClick={onCreateStoryClick}
                        >
                            <div className={classes.uploadButtonContent}>
                                <Typography variant="h1">
                                    Upload 360° panorama image
                                </Typography>
                                <Typography variant="h2">
                                    or a story .zip
                                </Typography>
                            </div>
                        </Button>
                    </EditorFileSelector>
                </Box>
            </Container>
            <UserStoriesSection />
            <PublicStoriesSection />
            <SignInDialog />
        </>
    );
}

const mapStateToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    {
        setProjectAction: setProject,
        setStoryAction: setStory,
        setCurrentRoomAction: setCurrentRoom,
        showSnackbarAction: showSnackbar
    },
)(LandingPageRoute);
