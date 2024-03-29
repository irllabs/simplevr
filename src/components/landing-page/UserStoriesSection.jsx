// External libraries
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

// External UI Components
import {
	Typography,
	Button,
	makeStyles,
	Box,
} from '@material-ui/core';

// Actions
import { setIsShowingSignInDialog, setUserStories } from '../../redux/actions';

// Firebase
import firebase from '../../firebase/firebase.ts';
import ProjectCard from './ProjectCard';

const styles = makeStyles(() => {
	return {
		container: {
			paddingTop: '48px',
			paddingLeft: '48px',
			paddingRight: '48px',
			boxSizing: 'border-box'
		},
		signInContent: {
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'column',
			width: '100%',
			marginTop: '12px',
		},
		placeholderImage: {
			paddingBottom: '24px',
		},
		signInButton: {
			marginTop: '12px',
			height: '48px',
			borderRadius: '24px',
		},
		userStoriesSignedInContent: {
			display: 'grid',
			gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
			gridGap: '12px',
			width: '100%',
		},
		seeMoreContainer: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			margin: '24px'
		}
	};
});
function UserStoriesSection({
	user,
	userStories,
	setUserStoriesAction,
	setIsShowingSignInDialogAction,
}) {
	const classes = styles();

	const [seeMoreVisible, setSeeMoreVisible] = useState(true);

	useEffect(() => {
		if (user) {
			firebase.loadUserStories(user.id, true).then((stories) => {
				setUserStoriesAction(stories);
			});
		}
	}, [user, setUserStoriesAction]);

	const loadAdditionalUserStories = async () => {
		const userStoriesPage = await firebase.loadUserStories(user.id);

		if (userStoriesPage.length === 0) {
			setSeeMoreVisible(false);
			return;
		}

		if (userStoriesPage.length < 8) {
			setSeeMoreVisible(false);
		}

		setUserStoriesAction([
			...userStories,
			...userStoriesPage
		]);
	}

	function onSignInClick() {
		setIsShowingSignInDialogAction(true);
	}

	const onProjectDeleted = (projectId) => {
		setUserStoriesAction(userStories.filter((project) => {
			return project.id !== projectId;
		}));
	}

	return (
		<div className={classes.container}>
			{/* In case user is not logged in, show a prompt asking user to log in to view his/her stories */}
			{!user
			&& (
				<div>
					<Typography variant="body1" className="light-text-90">
						Your stories
					</Typography>
					<div className={classes.signInContent}>
						<img src="images/user-stories-placeholder.svg" alt="user story placeholder" className={classes.placeholderImage} />
						<Typography variant="body1" className="light-text-70">
							To see your stories, please sign in
						</Typography>
						<Button variant="contained" color="primary" size="large" className={classes.signInButton} disableElevation onClick={onSignInClick}>
							<Typography variant="h2">
								Sign in
							</Typography>
						</Button>
					</div>
				</div>
			)}
			{/* In case user is logged in, show a list of his stories */}
			{user
			&& (
				<div>
					<Typography variant="body1" className="light-text-90">
						Your stories (
						{
							userStories.length
						}
						)
					</Typography>
					<Box m={2} />
					<div className={classes.userStoriesSignedInContent}>
						{userStories.map((story) => {
							return (
								<ProjectCard key={story.id} project={story} onDelete={onProjectDeleted} />
							);
						})}
					</div>
					{seeMoreVisible &&
					<div className={classes.seeMoreContainer}>
						<Button variant='outlined' color='primary' onClick={loadAdditionalUserStories}>
							See More
						</Button>
					</div>}
				</div>
			)}
			{/* Show a 'See more' button to load more stories for user */}
			{false
			&& (
				<div className="user-stories-action-container">
					<Button label="See more" />
				</div>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		user: state.user,
		userStories: state.userStories,
	};
};

export default connect(
	mapStateToProps,
	{
		setUserStoriesAction: setUserStories,
		setIsShowingSignInDialogAction: setIsShowingSignInDialog,
	},
)(UserStoriesSection);
