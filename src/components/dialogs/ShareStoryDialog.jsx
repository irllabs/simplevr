import React, {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import qrcode from 'qrcode';
import copy from 'copy-to-clipboard';

import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    Typography,
    Switch,
} from '@material-ui/core';

import { Close } from '@material-ui/icons';
import { FirebaseContext } from '../../firebase';

const styles = makeStyles(() => {
    return {
        root: {
            padding: '0px',
        },
        contentRoot: {
            padding: '0px 0px 16px 0px',
        },
        titleContainer: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
        },
        closeIcon: {
            position: 'absolute',
        },
        storyInfoContainer: {
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '24px',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            boxSizing: 'content-box',
        },
        storyNameInfo: {
            display: 'flex',
            flexDirection: 'column',
        },
        storyPublicInfo: {
            display: 'flex',
        },
        storyRoomInfo: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
        },
        storyDialogThumbnailImage: {
            width: '80px',
            height: '40px',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
        },
        shareStoryPublicToggle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '48px',
            marginTop: '12px',
            marginLeft: '24px',
            marginRight: '24px',
            boxSizing: 'content-box',
        },
        shareStoryPublicToggleText: {
            display: 'flex',
        },
        publicStoryInfo: {
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '8px',
        },
        publicDataContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '12px',
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingBottom: '24px',
        },
    };
});
export default function ShareStoryDialog({ thumbnailUrl, project, onClose }) {
    const classes = styles();

    const firebaseContext = useContext(FirebaseContext);

    const [publicLink, setPublicLink] = useState('');
    const [projectIsPublic, setPublic] = useState(project.isPublic);

    const generateSharableLink = () => {
        return `${window.location.origin}/view/${project.id}`;
    };

    const setQRCode = (link) => {
        if (!qrCodeCanvas.current) {
            return;
        }

        qrcode.toCanvas(qrCodeCanvas.current, link);
    };

    const initPublicLink = async () => {
        const link = generateSharableLink();

        setPublicLink(link);
        setQRCode(link);
    };

    const qrCodeCanvas = useCallback((node) => {
        qrCodeCanvas.current = node;

        if (node && projectIsPublic) {
            initPublicLink();
        }
    }, []);

    useEffect(async () => {
        if (projectIsPublic) {
            initPublicLink();
        }

        await firebaseContext.updateProjectPublicFlag(project.id, projectIsPublic);

        project.isPublic = projectIsPublic;
    }, [projectIsPublic]);

    const onPublicToggle = async () => {
        setPublic(!projectIsPublic);
    };

    const onCopyLink = () => {
        copy(publicLink);
    };

    const storyInfoIconName = projectIsPublic ? 'public-story-icon.svg' : 'private-story-icon.svg';

    return (
        <Dialog onClose={onClose} open maxWidth="xs" fullWidth>
            <DialogTitle className={classes.root}>
                <IconButton onClick={onClose} className={classes.closeIcon}>
                    <Close />
                </IconButton>
                <div className={classes.titleContainer}>
                    <Typography variant="body1">
                        Share story
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent className={classes.contentRoot}>
                <div className={classes.storyInfoContainer}>
                    <div className={classes.storyNameInfo}>
                        <Typography variant="body2">
                            {project.story.name}
                        </Typography>
                        <Box m={0.5} />
                        <div className={classes.storyPublicInfo}>
                            <img src={`/icons/${storyInfoIconName}`} alt="public-story-icon" />
                            <Box m={0.3} />
                            <Typography variant="caption">
                                {projectIsPublic ? 'Public story' : 'Only visible to you'}
                            </Typography>
                        </div>
                    </div>
                    <div className={classes.storyRoomInfo}>
                        <div className={classes.storyDialogThumbnailImage} style={{ backgroundImage: `url(${thumbnailUrl})` }} />
                        <Box m={0.5} />
                        <Typography variant="caption">
                            {1} rooms
                        </Typography>
                    </div>
                </div>
                <div className={classes.shareStoryPublicToggle}>
                    <div className={classes.shareStoryPublicToggleText}>
                        <img src="/icons/public-story-icon.svg" alt="make-story-public" />
                        <Box m={0.3} />
                        <Typography variant="body1">
                            Make public
                        </Typography>
                    </div>
                    <Switch checked={projectIsPublic} onChange={onPublicToggle} />
                </div>
                <div className={classes.publicStoryInfo}>
                    <Typography variant="caption">
                        Public stories can be searched and viewed with a link. Only you can edit your stories.
                    </Typography>
                </div>
                {projectIsPublic
                && (
                    <div className={classes.publicDataContainer}>
                        <canvas ref={qrCodeCanvas} />
                        <Typography variant="body2" align="center">
                            {publicLink}
                        </Typography>
                        <Box m={2} />
                        <Button fullWidth variant="outlined" onClick={onCopyLink}>
                            Copy link
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
