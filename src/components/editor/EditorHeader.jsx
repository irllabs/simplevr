import { connect } from 'react-redux';
import { Box, CircularProgress, Divider } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BackArrowIcon from '@material-ui/icons/KeyboardBackspace';
import IconButton from '@material-ui/core/IconButton';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import EditorEditStory from './EditorEditStory';
import UserProfile from '../user-profile/UserProfile';
import FirebaseContext from '../../firebase/context.ts';
import ShareStoryDialog from '../dialogs/ShareStoryDialog';
import { setOpenedPreviewFromApplication } from '../../redux/actions';

const styles = makeStyles((theme) => {
    return {
        root: {
            position: 'fixed',
            top: 0,
            zIndex: 5,
            height: '96px',
            paddingLeft: '24px',
            paddingRight: '24px',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        previewContainer: {
            position: 'fixed',
            top: '0px',
            left: '0px',
            right: '0px',
            zIndex: 5,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            height: '96px',
            alignItems: 'center',
        },
        toolBar: {
            backgroundColor: 'rgba(0,0,0,0.6)',
            height: 48,
            borderRadius: 24,
            paddingRight: 22,
            display: 'flex',
            alignItems: 'center',
        },
        backButton: {
            borderRadius: '50% 0 0 50%',
            color: 'rgba(255, 255, 255, 0.7)',
        },
        signInButton: {
            fontWeight: 600,
        },
        divider: {
            height: 48,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        storyName: {
            marginLeft: theme.spacing(2),
            color: 'rgba(255, 255, 255, 0.7)',
        },
        toolBarIcon: {
            marginLeft: theme.spacing(2),
            borderRadius: 0,
            color: 'rgba(255, 255, 255, 0.7)',
        },
        vrButton: {
            pointerEvents: 'all',
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
                backgroundColor: theme.palette.primary.dark,
            },
        },
    };
});

function EditorHeader({ project, setOpenedPreviewFromApplicationAction }) {
    const classes = styles();

    const firebaseContext = useContext(FirebaseContext);

    const history = useHistory();

    const [editStoryOpen, setEditStoryOpen] = useState(false);
    const [shareStoryDialogOpen, setShareStoryDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const onEditStory = () => {
        setEditStoryOpen(true);
    };

    const onSaveStory = async () => {
        setSaving(true);
        await firebaseContext.saveProject(project);
        setSaving(false);
    };

    const onCloseEditStory = () => {
        setEditStoryOpen(false);
    };

    const onShareStory = () => {
        setShareStoryDialogOpen(true);
    };

    const onCloseShareStory = () => {
        setShareStoryDialogOpen(false);
    };

    const getHomeRoom = (rooms) => {
        let homeRoom = rooms.find((room) => {
            return room.isHome;
        });
        if (!homeRoom) {
            homeRoom = rooms[0];
        }
        return homeRoom;
    }

    const onOpenPreview = () => {
        setOpenedPreviewFromApplicationAction(true);

        history.push(`/view/${project.id}`);
    }

    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.toolBar}>
                    <IconButton className={classes.backButton} component={RouterLink} to="/">
                        <BackArrowIcon />
                    </IconButton>
                    <Divider className={classes.divider} orientation="vertical" flexItem />
                    <Box className={classes.storyName}>
                        {project.story.name}
                    </Box>
                    <IconButton className={classes.toolBarIcon} onClick={onEditStory}>
                        <img alt="edit-story" src="/icons/pencil.svg" />
                    </IconButton>
                    <IconButton className={classes.toolBarIcon} onClick={onSaveStory}>
                        {saving ? <CircularProgress size={24} /> : <SaveIcon />}
                    </IconButton>
                    <IconButton className={classes.toolBarIcon} onClick={onShareStory}>
                        <img alt="share-story" src="/icons/share-icon-light.svg" />
                    </IconButton>
                </Box>

                <UserProfile />
            </Box>
            <div className={classes.previewContainer}>
                <IconButton className={classes.vrButton} variant="contained" color="primary" onClick={onOpenPreview}>
                    <img className={classes.vrButtonLogo} src="/icons/vr.svg" alt="preview-story" />
                </IconButton>
            </div>
            {editStoryOpen
            && (
                <EditorEditStory onClose={onCloseEditStory} />
            )}
            {shareStoryDialogOpen
            && (
                <ShareStoryDialog onClose={onCloseShareStory} thumbnailUrl={getHomeRoom(project.story.rooms).panoramaUrl.thumbnail.data} project={project} />
            )}
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
        setOpenedPreviewFromApplicationAction: setOpenedPreviewFromApplication
    },
)(EditorHeader);
