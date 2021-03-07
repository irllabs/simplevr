// External libraries
import React from 'react'
import { Link as RouterLink } from 'react-router-dom';
import { connect } from "react-redux";

// External UI Components
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Container, Typography } from '@material-ui/core';

// Components
import Header from '../header/Header'
import SignInDialog from '../dialogs/SignInDialog';
import UserStoriesSection from './UserStoriesSection';
import PublicStoriesSection from './PublicStoriesSection';

// Redux Actions
import { setIsShowingSignInDialog, setUser } from '../../redux/actions'

const styles = makeStyles((theme) => ({
    hero: {
        backgroundColor: theme.palette.secondary.main,
        padding: '32px 64px',
        borderRadius: '24px',
        textAlign: 'center'
    },
    uploadButton: {
        padding: '24px 48px',
        border: '2px dashed #e34b78',
        borderRadius: '60px',
        boxSizing: 'content-box',
        fontSize: '20px',
        fontWeight: 600,
        marginTop: '32px'
    },
    uploadButtonContent: {
        display: 'flex',
        flexDirection: 'column'
    }
}))
function LandingPageRoute ({ setIsShowingSignInDialog, setUser }) {
    const classes = styles()
    return (
        <>
            <Header />
            <Container maxWidth="md">
                <Box className={classes.hero}>
                    <Typography variant='body1'>
                        Start creating your immersive story by combining 360 photos with audio recordings, images, and text
                    </Typography>
                    <Button
                        className={classes.uploadButton}
                        size="large"
                        color="primary"
                        component={RouterLink}
                        to="/editor/123-123-123-123"
                    >
                        <div className={classes.uploadButtonContent}>
                            <Typography variant='h1'>
                                Upload 360° panorama image
                            </Typography>
                            <Typography variant='h2'>
                                or a story .zip
                            </Typography>
                        </div>
                    </Button>
                </Box>
            </Container>
            <UserStoriesSection />
            <PublicStoriesSection />
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
