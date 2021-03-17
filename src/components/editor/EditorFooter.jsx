// External libraries
import React from 'react';

// External UI Components
import { Box } from '@material-ui/core';

// Style
import { makeStyles } from '@material-ui/core/styles';

// Components
import EditorFab from './EditorFab';

const styles = makeStyles(() => {
    return {
        root: {
            position: 'fixed',
            bottom: 0,
            zIndex: 3,
            height: '96px',
            width: '100%',
            marginLeft: '6px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
    };
});

export default function EditorFooter() {
    const classes = styles();
    return (
        <Box className={classes.root}>
            <EditorFab />
        </Box>
    );
}
