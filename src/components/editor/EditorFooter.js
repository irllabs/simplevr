import { Box, Button, Container, Divider } from '@material-ui/core'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import BackArrowIcon from '@material-ui/icons/KeyboardBackspace'
import IconButton from '@material-ui/core/IconButton';
import { Link as RouterLink } from 'react-router-dom';
import EditorFab from './EditorFab'
import EditorRoomList from './EditorRoomList'
import EditorModeToggle from './EditorModeToggle'

const styles = makeStyles((theme) => ({
    root: {
        position: 'fixed',
        bottom: 0,
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
        justifyContent: 'center',
        alignItems: 'center',
    }

}))

export default function EditorFooter () {
    const classes = styles()
    return (
        <Box className={classes.root}>
            <EditorFab />



        </Box>
    )
}
