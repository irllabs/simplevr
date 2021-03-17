import { useContext, useEffect, FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {
    Container,
    makeStyles,
    Typography,
} from '@material-ui/core';
import FirebaseContext from '../../firebase/context';
import { setPublicStories } from '../../redux/actions';

import ProjectCard from './ProjectCard';
import StorageProject from '../../models/storage/StorageProject';

const styles = makeStyles(() => {
    return {
        container: {
            paddingTop: '48px',
        },
        showMoreContainer: {
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            paddingTop: '12px',
        },
        seeMoreButton: {
            borderRadius: '24px',
            height: '48px',
        },
        userStoriesSignedInContent: {
            marginTop: '12px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridGap: '12px',
            width: '100%',
        },
    };
});

const mapStateToProps = (state: any) => {
    return {
        publicStories: state.publicStories,
    };
};

const mapDispatch = {
    setPublicStoriesAction: setPublicStories
}

const connector = connect(
    mapStateToProps,
    mapDispatch,
);

type ReduxProps = ConnectedProps<typeof connector>

const PublicStoriesSection: FC<ReduxProps> = ({ publicStories, setPublicStoriesAction }) => {
    const firebaseContext = useContext(FirebaseContext);

    const classes = styles();

    useEffect(() => {
        firebaseContext.loadPublicStories().then((stories) => {
            setPublicStoriesAction(stories);
        });
    }, []);

    return (
        <Container maxWidth="md" className={classes.container}>
            {/* Show a list of public stories */}
            <div>
                <Typography variant="body1" className="light-text-90">
                    Explore public stories
                </Typography>
                <Typography variant="body2" className="light-text-70">
                    Explore public stories
                </Typography>
                <div className={classes.userStoriesSignedInContent}>
                    {publicStories.map((project: StorageProject) => {
                        return (
                            <ProjectCard key={project.id} project={project} isPublic />
                        );
                    })}
                </div>
            </div>
        </Container>
    );
}
export default connector(PublicStoriesSection);
