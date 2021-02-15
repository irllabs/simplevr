import { Box, Button, Container, Divider } from '@material-ui/core'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import BackArrowIcon from '@material-ui/icons/KeyboardBackspace'
import IconButton from '@material-ui/core/IconButton';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@material-ui/icons/EditOutlined';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import ShareIcon from '@material-ui/icons/ShareOutlined';

const styles = makeStyles((theme) => ({
    root: {
        position: 'fixed',
        top: 0,
        zIndex: 3,
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
    toolBar: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        height: 48,
        borderRadius: 24,
        paddingRight: 22,
        display: 'flex',
        alignItems: 'center'
    },
    backButton: {
        borderRadius: '50% 0 0 50%'
    },
    signInButton: {
        fontWeight: 600
    },
    divider: {
        height: 48
    },
    storyName: {
        marginLeft: theme.spacing(2)
    },
    editButton: {
        marginLeft: theme.spacing(2),
        borderRadius: 0
    },
    vrButton: {
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,

        }
    }
}))

export default function EditorHeader () {
    const classes = styles()
    return (
        <Box className={classes.root}>
            <Box className={classes.toolBar}>
                <IconButton className={classes.backButton} component={RouterLink} to="/">
                    <BackArrowIcon />
                </IconButton>
                <Divider className={classes.divider} orientation="vertical" flexItem />
                <Box className={classes.storyName}>Story name</Box>
                <IconButton className={classes.editButton} >
                    <EditIcon />
                </IconButton>
                <IconButton className={classes.editButton} >
                    <SaveIcon />
                </IconButton>
                <IconButton className={classes.editButton} >
                    <ShareIcon />
                </IconButton>
            </Box>

            <IconButton className={classes.vrButton} variant="contained" color="primary" component={RouterLink} to="/view/123-123-123-123">
                <img className={classes.vrButtonLogo} src="/icons/vr.svg" />
            </IconButton>

            <Button className={classes.signInButton} variant="contained" color="primary" disableElevation size="large">
                Sign in
                </Button>
        </Box>
    )
}
