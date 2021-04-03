import { useParams } from 'react-router-dom';

import 'aframe';
import 'aframe-look-at-component';

import Scene from '../../aframe-components/Scene';
import { connect } from 'react-redux';
import { setCurrentRoom, setProject, setStory } from '../../redux/actions';
import { useContext, useEffect, useState } from 'react';
import { FirebaseContext } from '../../firebase';
import loadImageForRoom from '../../util/ImageLoader';

function ViewerRoute({project, setProjectAction, setStoryAction, setCurrentRoomAction}) {

    const firebaseContext = useContext(FirebaseContext);

    const [projectLoaded, setProjectLoaded] = useState(Boolean(project));

    const { projectId, sessionId } = useParams();

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
            <Scene sessionId={sessionId} />
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        project: state.project,
        viewOpenedFromApplication: state.navigation.viewOpenedFromApplication,
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
