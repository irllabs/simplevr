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
import { setCurrentRoom, setProject, setStory } from '../../redux/actions';

// Util
import FileLoaderUtil from '../../util/FileLoader';
import resizeImageAsync from '../../util/ResizeImage';

// Models
import Room from '../../models/room';
import Project from '../../models/project.ts';

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
function LandingPageRoute({ setProjectAction, setStoryAction, setCurrentRoomAction }) {
    const classes = styles();
    const fileInput = useRef();
    const history = useHistory();

    const onStoryPanoramaSelected = (event) => {
        const file = event.target.files && event.target.files[0];

        processSelectedFile(file);
    };

    const processSelectedFile = async (file) => {
        // Verify if input file is of valid type and format
        await FileLoaderUtil.validateFileLoadEvent(file, 'image');

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

    return (
        <>
            <Header />
            <Container maxWidth="md">
                <Box className={classes.hero}>
                    <Typography variant="body1" className="light-text">
                        Start creating your immersive story by combining 360 photos with audio recordings, images, and text
                    </Typography>
                    <input
                        id="welcome-message-input"
                        type="file"
                        className={classes.input}
                        ref={fileInput}
                        onChange={onStoryPanoramaSelected}
                    />
                    <EditorFileSelector onChange={processSelectedFile}>
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
    },
)(LandingPageRoute);
