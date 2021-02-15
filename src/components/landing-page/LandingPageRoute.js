import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Container } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import Header from '../header/Header'
import SignInDialog from '../dialogs/SignInDialog';
import { connect } from "react-redux";
import { setIsShowingSignInDialog, setUser } from '../../redux/actions'

const styles = makeStyles((theme) => ({
    root: {
        paddingTop: 96,

    },
    hero: {
        backgroundColor: theme.palette.secondary.main,
        padding: '2rem',
        borderRadius: '1rem',
        textAlign: 'center'
    },
    uploadButton: {
        padding: '24px 48px',
        border: '2px dashed #e34b78',
        borderRadius: '60px',
        boxSizing: 'content-box',
        fontSize: '20px',
        fontWeight: 600,
        marginTop: '1rem'
    }
}))
function LandingPageRoute ({ setIsShowingSignInDialog, setUser }) {
    const classes = styles()
    return (
        <>
            <Header />
            <Container className={classes.root} maxWidth="md">
                <Box className={classes.hero}>
                    <h2>Start creating your immersive story by combining 360 photos with audio recordings, images, and text</h2>
                    <Button className={classes.uploadButton} size="large" color="primary" component={RouterLink} to="/editor/123-123-123-123">Upload 360° panorama image</Button>
                </Box>
            </Container>
            <SignInDialog />
        </>
    )
}

const mapStateToProps = state => {
    return {
        user: state.user,
        isShowingSignInDialog: state.display.isShowingSignInDialog
    };
};

export default connect(
    mapStateToProps,
    {
        setIsShowingSignInDialog,
        setUser
    }
)(LandingPageRoute);
