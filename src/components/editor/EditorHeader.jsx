import { Box, Divider } from '@material-ui/core';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BackArrowIcon from '@material-ui/icons/KeyboardBackspace';
import IconButton from '@material-ui/core/IconButton';
import { Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import ShareIcon from '@material-ui/icons/ShareOutlined';
import EditorEditStory from './EditorEditStory';
import UserProfile from '../user-profile/UserProfile';

const styles = makeStyles((theme) => {
    return {
        root: {
            position: 'fixed',
            top: 0,
            zIndex: 5,
            height: '96px',
            width: '100%',
            maxWidth: 1200,
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

export default function EditorHeader() {
    const classes = styles();

    const [editStoryOpen, setEditStoryOpen] = useState(false);

    const onEditStory = () => {
        setEditStoryOpen(true);
    };

    const onCloseEditStory = () => {
        setEditStoryOpen(false);
    };

    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.toolBar}>
                    <IconButton className={classes.backButton} component={RouterLink} to="/">
                        <BackArrowIcon />
                    </IconButton>
                    <Divider className={classes.divider} orientation="vertical" flexItem />
                    <Box className={classes.storyName}>Story name</Box>
                    <IconButton className={classes.toolBarIcon} onClick={onEditStory}>
                        <img alt="edit-story" src="icons/pencil.svg" />
                    </IconButton>
                    <IconButton className={classes.toolBarIcon}>
                        <SaveIcon />
                    </IconButton>
                    <IconButton className={classes.toolBarIcon}>
                        <ShareIcon />
                    </IconButton>
                </Box>

                <UserProfile />
            </Box>
            <div className={classes.previewContainer}>
                <IconButton className={classes.vrButton} variant="contained" color="primary" component={RouterLink} to="/view/123-123-123-123">
                    <img className={classes.vrButtonLogo} src="/icons/vr.svg" alt="preview-story" />
                </IconButton>
            </div>
            {editStoryOpen
            && (
                <EditorEditStory onClose={onCloseEditStory} />
            )}
        </>
    );
}
