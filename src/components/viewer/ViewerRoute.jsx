import { useHistory, useParams } from 'react-router-dom';

import { IconButton, makeStyles } from '@material-ui/core';

import ArrowBackIcon from '@material-ui/icons/KeyboardBackspace';

import 'aframe';
import 'aframe-look-at-component';

import Scene from '../../aframe-components/Scene';
import { connect } from 'react-redux';
import { setCurrentRoom, setProject, setStory } from '../../redux/actions';
import { useContext, useEffect, useState } from 'react';
import { FirebaseContext } from '../../firebase';
import loadImageForRoom from '../../util/ImageLoader';

const styles = makeStyles(() => {
    return {
        backButtonContainer: {
            position: 'fixed',
            left: '24px',
            top: '24px',
            width: '48px',
            height: '48px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 24,
        },
        icon: {
            color: 'rgba(255, 255, 255, 0.7)'
        }
    };
});
function ViewerRoute({project, setProjectAction, setStoryAction, setCurrentRoomAction}) {
    const classes = styles();

    const firebaseContext = useContext(FirebaseContext);

    const [projectLoaded, setProjectLoaded] = useState(Boolean(project));

    const history = useHistory();
    const { projectId } = useParams();

    const onBack = () => {
        // Remove CSS styles injected by a-frame when going back to landing page/editor.
        document.documentElement.classList.remove('a-fullscreen');

        history.goBack();
    }

    useEffect(async () => {
        if (!projectLoaded) {
            const storageProject = await firebaseContext.loadProjectWithId(projectId);
            const projectModel = await firebaseContext.loadProject(storageProject);

            // Set newly loaded story (and first room) as active story in redux
            setProjectAction(projectModel);
            setStoryAction(projectModel.story);

            await setHomeRoomAsCurrent(projectModel.story.rooms);

            setProjectLoaded(true);
        }
        else {
            setHomeRoomAsCurrent(project.story.rooms);
        }
    }, []);

    const setHomeRoomAsCurrent = async (rooms) => {
        let homeRoom = rooms.find((room) => {
            return room.isHome;
        });
        if (!homeRoom) {
            homeRoom = rooms[0];
        }

        await loadImageForRoom(homeRoom);

        setCurrentRoomAction(homeRoom);
    }

    return (
        projectLoaded &&
        <>
            <Scene />
            <div className={classes.backButtonContainer}>
                <IconButton onClick={onBack}>
                    <ArrowBackIcon className={classes.icon} />
                </IconButton>
            </div>
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        project: state.project,
    };
};

export default connect(
    mapStateToProps,
    {
        setProjectAction: setProject,
        setStoryAction: setStory,
        setCurrentRoomAction: setCurrentRoom,
    },
)(ViewerRoute);
