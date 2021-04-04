// External libraries
import { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

// External UI Components
import { Button, IconButton, makeStyles, Menu, MenuItem, Typography } from '@material-ui/core';

// External Icons
import { MoreHoriz } from '@material-ui/icons';

// Firebase
import FirebaseContext from '../../firebase/context.ts';

// Redux
import { setCurrentRoom, setOpenedPreviewFromApplication, setProject, setStory } from '../../redux/actions';

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
            cursor: 'pointer'
        },
        title: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            overflow: 'hidden',
        },
        tags: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
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
            height: '100%',
            cursor: 'pointer'
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
    setOpenedPreviewFromApplicationAction
}) {
    const classes = styles();

    const firebaseContext = useContext(FirebaseContext);

    const history = useHistory();

    const menuAnchorRef = useRef();

    const [menuOpen, setMenuOpen] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [shareStoryDialogOpen, setShareStoryDialogOpen] = useState(false);

    useEffect(async () => {
        const firstRoom = getHomeRoom(project.story.rooms);

        const url = await firebaseContext.getDownloadUrl(firstRoom.thumbnail.remoteFilePath);

        setThumbnailUrl(url);
    }, []);

    const onClick = () => {
        if (isPublic) {
            onViewStory();
        }
    }

    const onOpenShareStory = () => {
        setShareStoryDialogOpen(true);
        setMenuOpen(false);
    };

    const onCloseShareStory = () => {
        setShareStoryDialogOpen(false);
    };

    const onEditStory = async () => {
        if (isPublic) {
            return;
        }

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

        setOpenedPreviewFromApplicationAction(true);

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

        setMenuOpen(false);
    }

    const onOpenMenu = (event) => {
        event.stopPropagation();

        setMenuOpen(true);
    }

    const onCloseMenu = () => {
        setMenuOpen(false);
    }

    return (
        <div className={classes.projectCardContainer} onClick={onClick} style={{
            cursor: isPublic ? 'pointer' : 'default'
        }}>
            <div className={classes.projectCardHeader}>
                <div className={classes.projectCardTitle} onClick={onEditStory}>
                    <Typography variant="body2" className={classes.title}>
                        {project.story.name}
                    </Typography>
                    <Typography variant="caption" className={classes.tags}>
                        Tags:
                        {
                            project.story.tags || ''
                        }
                    </Typography>
                </div>
                <div className={classes.cardActionsContainer}>
                    {/* Only show edit options for user stories */}
                    {!isPublic && (
                        <>
                            <IconButton ref={menuAnchorRef} aria-controls="card-menu" aria-haspopup="true" onClick={onOpenMenu}>
                                <MoreHoriz />
                            </IconButton>
                            <Menu

                                id="simple-menu"
                                anchorEl={menuAnchorRef.current}
                                keepMounted
                                open={menuOpen}
                                onClose={onCloseMenu}
                            >
                                <MenuItem onClick={onOpenShareStory}>
                                    <Typography variant='body2'>
                                        Share
                                    </Typography>
                                </MenuItem>
                                <MenuItem onClick={onDownloadStoryArchive}>
                                    <Typography variant='body2'>
                                        Download (.zip)
                                    </Typography>
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </div>
            </div>
            <div className={classes.storyCardImageContainer} onClick={onEditStory}>
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
        setOpenedPreviewFromApplicationAction: setOpenedPreviewFromApplication
    },
)(ProjectCard);
