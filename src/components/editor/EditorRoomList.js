import React from 'react'
import { Box, Button, Container, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import MinimizeIcon from '@material-ui/icons/ExpandMore'
import IconButton from '@material-ui/core/IconButton';

const styles = makeStyles((theme) => ({
    root: {
        width: 600,
        height: 256,
        backgroundColor: 'white',
        borderRadius: 8,
        color: theme.palette.secondary.main
    },
    header: {
        borderBottom: 'solid 1px rgba(0,0,0,0.12)',
        padding: theme.spacing(1)
    }

}))

export default function EditorRoomList () {
    const classes = styles()
    return (
        <Box className={classes.root}>
            <Box className={classes.header}>
                <IconButton className={classes.backButton} size="small" color="secondary">
                    <MinimizeIcon />
                </IconButton> Rooms (4)
            </Box>
        </Box>
    )
}
