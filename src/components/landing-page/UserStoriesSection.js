// External libraries
import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash'

// External UI Components
import { Typography, Button, Container, makeStyles } from '@material-ui/core';

// Actions
import { setIsShowingSignInDialog, setUserStories } from '../../redux/actions';

// Firebase
import { FirebaseContext } from '../../firebase';

const styles = makeStyles((theme) => ({
    container: {
        paddingTop: '48px',
    },
    signInContent: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        marginTop: '12px'
    },
    placeholderImage: {
        paddingBottom: '24px'
    },
    signInButton: {
        marginTop: '12px',
        height: '48px',
    }
}));
function UserStoriesSection ({user, userStories, setIsShowingSignInDialog}) {
    const firebaseContext = useContext(FirebaseContext);

    const classes = styles()

    useEffect(() => {
        firebaseContext.onUserUpdatedObservers.push(async (authUser) => {
            if (!_.isNil(authUser)) {
                firebaseContext.loadUserStories(authUser.uid, 10, 0).then((stories) => {
                    setUserStories([
                        ...userStories,
                        ...stories
                    ]);
                });
            }
        })
    }, []);

    function onSignInClick() {
        setIsShowingSignInDialog(true);
    }

    return (
        <Container maxWidth="md" className={classes.container}>
            {/* In case user is not logged in, show a prompt asking user to log in to view his/her stories */}
            {!user &&
            <div>
                <Typography variant='body1'>
                    Your stories
                </Typography>
                <div className={classes.signInContent}>
                    <img src='images/user-stories-placeholder.svg' alt='user story placeholder' className={classes.placeholderImage} />
                    <Typography variant='body1'>
                        To see your stories, please sign in
                    </Typography>
                    <Button variant='contained' color='primary' size='large' className={classes.signInButton} disableElevation onClick={onSignInClick}>
                        <Typography variant='h2'>
                            Sign in
                        </Typography>
                    </Button>
                </div>
            </div>}
            {/* In case user is logged in, show a list of his stories */}
            {user &&
            <div>
                <Typography variant='body1'>
                    Your stories ({userStories.length})
                </Typography>
                <div className='user-stories-signed-in-content'>
                    {[].map((story) => {
                        return (
                            <p>TODO SHOW USER STORY CARD</p>// <StoryCard key={story.id} story={story} />
                        );
                    })}
                </div>
            </div>}
            {/* Show a 'See more' button to load more stories for user*/}
            {false &&
            <div className='user-stories-action-container'>
                <Button label='See more'/>
            </div>}
        </Container>
    );
}

const mapStateToProps = state => {
    return {
        user: state.user,
        userStories: state.userStories,
    };
};

export default connect(
    mapStateToProps,
    {
        setIsShowingSignInDialog
    }
)(UserStoriesSection);
