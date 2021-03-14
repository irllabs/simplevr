// External libraries
import React, { useContext, useEffect, useState } from 'react';

// External UI Components
import { IconButton, makeStyles, Typography } from '@material-ui/core';

// Firebase
import { FirebaseContext } from '../../firebase';
import ShareStoryDialog from './ShareStoryDialog';

// Components
// import ShareStoryDialog from '../../share-story-dialog/share-story-dialog';

const styles = makeStyles(() => {
    return {
        projectCardContainer: {
            width: '100%',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.08), -1px 0px 1px rgba(0, 0, 0, 0.08), 1px 0px 1px rgba(0, 0, 0, 0.08), 0px -1px 1px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
        },
        projectCardTitle: {
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
        },
        storyCardImageContainer: {
            borderRadius: '0px 0px 12px 12px',
            display: 'flex',
            position: 'relative',
        },
        storyCardImage: {
            width: '100%',
            height: '140px',
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
export default function ProjectCard({ project }) {
    const classes = styles();

    const firebaseContext = useContext(FirebaseContext);

    const [optionsVisible, setOptionsVisible] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [shareStoryDialogOpen, setShareStoryDialogOpen] = useState(false);

    useEffect(async () => {
        const url = await firebaseContext.getDownloadUrl(project.thumbnailUrl);

        setThumbnailUrl(url);
    }, []);

    const onMouseEnter = () => {
        setOptionsVisible(true);
    };

    const onMouseLeave = () => {
        setOptionsVisible(false);
    };

    const onOpenShareStory = () => {
        setShareStoryDialogOpen(true);
        setOptionsVisible(false);
    };

    const onCloseShareStory = () => {
        setShareStoryDialogOpen(false);
    };

    /* const onEditStory = () => {
        // Open story for editing
    }; */

    return (
        <div className={classes.projectCardContainer} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className={classes.projectCardTitle}>
                <Typography variant="body2">
                    {project.story.name}
                </Typography>
                <Typography variant="caption">
                    Tags:
                    {
                        project.story.tags || 'n/a'
                    }
                </Typography>
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
                {optionsVisible && thumbnailUrl && !project.publicStory
                && (
                    <div className={classes.storyCardOptions}>
                        <IconButton>
                            <img src="/icons/edit-icon.svg" alt="edit" />
                        </IconButton>
                        <IconButton onClick={onOpenShareStory}>
                            <img src="/icons/share-icon.svg" alt="share" />
                        </IconButton>
                    </div>
                )}
            </div>
            {shareStoryDialogOpen && <ShareStoryDialog onClose={onCloseShareStory} thumbnailUrl={thumbnailUrl} project={project} />}
        </div>
    );
}
