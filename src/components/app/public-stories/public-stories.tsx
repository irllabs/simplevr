import React from 'react';

import StoryService from 'services/story';

import Spacer from 'irl-ui/spacer/spacer';
import Button from 'irl-ui/button/button';
import Typography, { TypographyVariant } from 'irl-ui/typography/typography';

import colors from 'styles/colors';

import './public-stories.scss';

import Story from 'root/models/story-model';

import StoryCard from './../user-stories/story-card/story-card';

import BorderButton, { Variant } from 'irl-ui/border-button/border-button';

interface PublicStoriesState {
	publicStories?: Story[];
}

export default class PublicStories extends React.Component<{}, PublicStoriesState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			publicStories: [],
		}

		this.onSeeMore = this.onSeeMore.bind(this);
	}

	public async componentDidMount() {
		const publicStories = await StoryService.getPublicStoriesPageAsync(8);
		this.setState({
			publicStories: publicStories
		});
	}

	public render() {
		return (
			<div className='user-stories-container'>
				{/* Show a list of public stories */}
				<div>
					<Typography variant={TypographyVariant.TEXT_LARGE} color={colors.textDark2}>
						Explore public stories
					</Typography>
					<Typography variant={TypographyVariant.TEXT_SMALL} color={colors.textDark3}>
						Explore public stories
					</Typography>
					<Spacer size={12} />
					<div className='user-stories-signed-in-content'>
						{this.state.publicStories.map((story) => {
							return (
								<StoryCard key={story.id} story={story} publicStory={true} />
							);
						})}
					</div>
				</div>
				<Spacer size={12} />
				{/* Show a 'See more' button to load more stories public stories*/}
				<div className='user-stories-action-container'>
					<BorderButton label='See more' onClick={this.onSeeMore} variant={Variant.PRIMARY}/>
				</div>
			</div>
		);
	}

	private async onSeeMore() {
		const publicStories = [
			...this.state.publicStories,
			...await StoryService.getPublicStoriesPageAsync(8)
		];

		this.setState({
			publicStories: publicStories,
		});
	}
}
