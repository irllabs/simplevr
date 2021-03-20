// External libraries
import { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

// External UI Components
import { IconButton, makeStyles, Typography } from '@material-ui/core';

// Firebase
import FirebaseContext from '../../firebase/context.ts';

// Redux
import { setCurrentRoom, setProject, setStory } from '../../redux/actions';

// Service
import ProjectArchiveCreator from '../../service/ProjectArchiveCreator';

// Components
import ShareStoryDialog from '../dialogs/ShareStoryDialog';

const styles = makeStyles(() => {
    return {
        projectCardContainer: {
            width: '100%',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.08), -1px 0px 1px rgba(0, 0, 0, 0.08), 1px 0px 1px rgba(0, 0, 0, 0.08), 0px -1px 1px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            height: '200px'
        },
        projectCardHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        projectCardTitle: {
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
        },
        title: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            width: '95px',
            overflow: 'hidden',
        },
        cardActionsContainer: {
            display: 'flex',
            height: '48px'
        },
        storyCardImageContainer: {
            borderRadius: '0px 0px 12px 12px',
            display: 'flex',
            position: 'relative',
            height: '100%'
        },
        storyCardImage: {
            width: '100%',
            height: '100%',
            borderRadius: '0px 0px 12px 12px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        },
        storyCardOptions: {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0px 0px 12px 12px',
        },
    };
});
function ProjectCard({
    project,
    isPublic,
    setProjectAction,
    setStoryAction,
    setCurrentRoomAction,
}) {
    const classes = styles();

    const firebaseContext = useContext(FirebaseContext);

    const history = useHistory();

    const [optionsVisible, setOptionsVisible] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [shareStoryDialogOpen, setShareStoryDialogOpen] = useState(false);

    useEffect(async () => {
        const firstRoom = getHomeRoom(project.story.rooms);

        const url = await firebaseContext.getDownloadUrl(firstRoom.thumbnail.remoteFilePath);

        setThumbnailUrl(url);
    }, []);

    const onMouseEnter = () => {
        if (!isPublic) {
            setOptionsVisible(true);
        }
    };

    const onMouseLeave = () => {
        if (!isPublic) {
            setOptionsVisible(false);
        }
    };

    const onClick = () => {
        if (isPublic) {
            onViewStory();
        }
    }

    const onOpenShareStory = () => {
        setShareStoryDialogOpen(true);
        setOptionsVisible(false);
    };

    const onCloseShareStory = () => {
        setShareStoryDialogOpen(false);
    };

    const onEditStory = async () => {
        const projectModel = await firebaseContext.loadProject(project);

        // Set newly loaded story (and first room) as active story in redux
        setProjectAction(projectModel);
        setStoryAction(projectModel.story);
        setCurrentRoomAction(projectModel.story.rooms[0]);

        // Navigate to editor for further story edits
        history.push('/editor');
    };

    const onViewStory = async () => {
        const projectModel = await firebaseContext.loadProject(project);

        // Set newly loaded story (and first room) as active story in redux
        setProjectAction(projectModel);
        setStoryAction(projectModel.story);
        setCurrentRoomAction(projectModel.story.rooms[0]);

        history.push(`/view/${project.id}`);
    }

    const getHomeRoom = (rooms) => {
        let homeRoom = rooms.find((room) => {
            return room.isHome;
        });
        if (!homeRoom) {
            homeRoom = rooms[0];
        }
        return homeRoom;
    }

    const onDownloadStoryArchive = async () => {
        const archiver = new ProjectArchiveCreator();
        archiver.create(project);
    }

    return (
        <div className={classes.projectCardContainer} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick} style={{
            cursor: isPublic ? 'pointer' : 'default'
        }}>
            <div className={classes.projectCardHeader}>
                <div className={classes.projectCardTitle}>
                    <Typography variant="body2" className={classes.title}>
                        {project.story.name}
                    </Typography>
                    <Typography variant="caption">
                        Tags:
                        {
                            project.story.tags || 'n/a'
                        }
                    </Typography>
                </div>
                <div className={classes.cardActionsContainer}>
                    {!isPublic &&
                    <IconButton onClick={onEditStory}>
                        <img src="/icons/edit-icon.svg" alt="edit" />
                    </IconButton>}
                    {!isPublic &&
                    <IconButton onClick={onOpenShareStory}>
                        <img src="/icons/share-icon.svg" alt="share" />
                    </IconButton>}
                    {!isPublic &&
                    <IconButton onClick={onDownloadStoryArchive}>
                        <img src="/icons/share-icon.svg" alt="share" />
                    </IconButton>}
                </div>
            </div>
            <div className={classes.storyCardImageContainer}>
                {thumbnailUrl
                && (
                    <div
                        className={classes.storyCardImage}
                        style={{
                            backgroundImage: `url(${thumbnailUrl})`,
                        }}
                    />
                )}
            </div>
            {shareStoryDialogOpen && <ShareStoryDialog onClose={onCloseShareStory} thumbnailUrl={thumbnailUrl} project={project} />}
        </div>
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
)(ProjectCard);
