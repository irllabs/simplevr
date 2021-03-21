import { FC } from 'react';
import { Box, IconButton, makeStyles } from "@material-ui/core";
import { Fullscreen } from "@material-ui/icons";
import { useState } from "react";

const styles = makeStyles((theme) => {
    return {
        root: {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 5,
            width: '48px',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 24,
            paddingRight: 22,
            display: 'flex',
        },
        fullscreenButton: {
            borderRadius: '50% 0 0 50%',
            color: 'rgba(255, 255, 255, 0.7)',
        },
        divider: {
            width: 48,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        toolBarIcon: {
            marginLeft: theme.spacing(2),
            borderRadius: 0,
            color: 'rgba(255, 255, 255, 0.7)',
        },
    };
});

const EditorModeToggle: FC = () => {
    const classes = styles();

    const [fullscreen, setFullscreen] = useState<boolean>(false);

    const onFullscreenClick = () => {
        if (!fullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            setFullscreen(true);
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setFullscreen(false);
        }
    }

    return (
        <Box className={classes.root}>
            <IconButton className={classes.fullscreenButton} onClick={onFullscreenClick}>
                <Fullscreen />
            </IconButton>
        </Box>
    );
}
export default EditorModeToggle;
