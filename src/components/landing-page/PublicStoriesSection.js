import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { Button, Container, makeStyles, Typography } from '@material-ui/core';
import { FirebaseContext } from '../../firebase';
import { setPublicStories } from '../../redux/actions';

const styles = makeStyles((theme) => ({
    container: {
        paddingTop: '48px',
    },
}));
function PublicStoriesSection ({publicStories}) {
    const firebaseContext = useContext(FirebaseContext);

    const classes = styles();

    useEffect(() => {
        firebaseContext.loadPublicStories().then((stories) => {
            setPublicStories([
                ...publicStories,
                ...stories
            ]);
        });
    }, []);

    return (
        <Container maxWidth="md" className={classes.container}>
            {/* Show a list of public stories */}
            <div>
                <Typography variant='body1'>
                    Explore public stories
                </Typography>
                <Typography variant='body2'>
                    Explore public stories
                </Typography>
                <div className='user-stories-signed-in-content'>
                    {publicStories.map((story) => {
                        return (
                            <p>story</p>
                        );
                    })}
                </div>
            </div>
            {/* Show a 'See more' button to load more stories public stories*/}
            <div className='user-stories-action-container'>
                <Button variant='outlined' color='primary' size='large'>
                    See more
                </Button>
            </div>
        </Container>
    );
}

const mapStateToProps = state => {
    return {
        publicStories: state.publicStories,
    };
};

export default connect(
    mapStateToProps,
    {}
)(PublicStoriesSection);
