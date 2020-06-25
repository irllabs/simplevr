import React from 'react';

import AuthService from 'services/auth';
import StoryService from 'services/story';
import { onOpenSignInDialog } from 'services/event-manager';

import Spacer from 'irl-ui/spacer/spacer';
import Button from 'irl-ui/button/button';
import Typography, { TypographyVariant } from 'irl-ui/typography/typography';

import colors from 'styles/colors';

import './user-stories.scss';

import Story from 'root/models/story-model';

import StoryCard from './story-card/story-card';
import BorderButton, { Variant } from 'root/irl-ui/border-button/border-button';

interface UserStoriesState {
	signedIn: boolean;
	userStories?: Story[];
	user?: firebase.User;
}

export default class UserStories extends React.Component<{}, UserStoriesState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			signedIn: undefined,
		}

		this.onSignIn = this.onSignIn.bind(this);
		this.onAuthStateChange = this.onAuthStateChange.bind(this);
		this.onSeeMore = this.onSeeMore.bind(this);
	}

	public async componentDidMount() {
		AuthService.subscribeOnAuthStateChanged(this.onAuthStateChange);
	}

	public render() {
		return (
			<div className='user-stories-container'>
				{/* In case user is not logged in, show a prompt asking user to log in to view his/her stories */}
				{!this.state.signedIn &&
				<div>
					<Typography variant={TypographyVariant.TEXT_LARGE} color={colors.textDark2}>
						Your stories
					</Typography>
					<Spacer size={12} />
					<div className='user-stories-sign-in-content'>
						<img src='assets/images/user-stories-placeholder.svg' />
						<Spacer size={24} />
						<Typography variant={TypographyVariant.TEXT_LARGE} color={colors.textDark3}>
							To see your stories, please sign in
						</Typography>
						<Spacer size={12} />
						<Button onClick={this.onSignIn} label='Sign in' />
					</div>
				</div>}
				{/* In case user is logged in, show a list of his stories */}
				{this.state.signedIn &&
				<div>
					<Typography variant={TypographyVariant.TEXT_LARGE} color={colors.textDark2}>
						Your stories ({this.state.userStories.length})
					</Typography>
					<Spacer size={12} />
					<div className='user-stories-signed-in-content'>
						{this.state.userStories.map((story) => {
							return (
								<StoryCard key={story.id} story={story} />
							);
						})}
					</div>
				</div>}
				<Spacer size={12} />
				{/* Show a 'See more' button to load more stories for user*/}
				{this.state.signedIn &&
				<div className='user-stories-action-container'>
					<BorderButton label='See more' onClick={this.onSeeMore} variant={Variant.PRIMARY}/>
				</div>}
			</div>
		);
	}

	public onSignIn() {
		onOpenSignInDialog.emit({});
	}

	private async onAuthStateChange(user: firebase.User) {
		if (user) {
			const userStories = await StoryService.getStoriesPageForUserAsync(user.uid, 8);

			this.setState({
				signedIn: true,
				userStories: userStories,
				user: user,
			});
		}
		else {
			this.setState({
				signedIn: false,
				user: undefined,
			});
		}
	}

	private async onSeeMore() {
		const userStories = [
			...this.state.userStories,
			...await StoryService.getStoriesPageForUserAsync(this.state.user.uid, 8)
		];

		this.setState({
			userStories: userStories,
		});
	}
}
