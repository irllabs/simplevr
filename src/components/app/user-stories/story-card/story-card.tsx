import React from 'react';

import './story-card.scss';

import Story from 'root/models/story-model';

import ShareStoryDialog from '../../share-story-dialog/share-story-dialog';

import Spacer from 'irl-ui/spacer/spacer';
import IconLabelButton from 'irl-ui/icon-label-button/icon-label-button';
import EditIcon from 'irl-ui/icons/edit-icon';
import ShareIcon from 'irl-ui/icons/share-icon';
import MoreIcon from 'irl-ui/icons/more-icon';
import Typography, { TypographyVariant } from 'irl-ui/typography/typography';

import colors from 'root/styles/colors';
import EditStoryDialog from '../../edit-story-dialog/edit-story-dialog';

interface StoryCardProps {
	story: Story;
	publicStory?: boolean;
}

interface StoryCardState {
	thumbnailUrl: string;
	optionsVisible: boolean;
	shareStoryDialogOpen: boolean;
	editStoryDialogOpen: boolean;
}

export default class StoryCard extends React.Component<StoryCardProps, StoryCardState> {
	constructor(props: StoryCardProps) {
		super(props);

		this.state = {
			thumbnailUrl: '',
			optionsVisible: false,
			shareStoryDialogOpen: false,
			editStoryDialogOpen: false,
		}

		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onOpenShareStory = this.onOpenShareStory.bind(this);
		this.onCloseShareStory = this.onCloseShareStory.bind(this);
		this.onOpenEditStory = this.onOpenEditStory.bind(this);
		this.onCloseEditStory = this.onCloseEditStory.bind(this);
	}

	public async componentDidMount() {
		const thumbnailUrl = await this.props.story.getThumbnail();
		this.setState({
			thumbnailUrl: thumbnailUrl,
		});
	}

	public render() {
		return (
			<div className='story-card-container' onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				<div className='story-card-title'>
					<Typography variant={TypographyVariant.TEXT_SMALL} color={colors.textDaylight2}>
						{this.props.story.name}
					</Typography>
					<Spacer size={4} />
					<Typography variant={TypographyVariant.TEXT_X_SMALL} color={colors.textDaylight2}>
						Tags: {this.props.story.tagsFormatted || 'n/a'}
					</Typography>
				</div>
				<div className='story-card-image-container'>
					{this.state.thumbnailUrl &&
					<div className='story-card-image' style={{
						backgroundImage: `url(${this.state.thumbnailUrl})`
					}}/>}
					{this.state.optionsVisible && this.state.thumbnailUrl && !this.props.publicStory &&
					<div className='story-card-options'>
						<IconLabelButton label='Edit' icon={EditIcon} onClick={this.onOpenEditStory} />
						<IconLabelButton label='Share' icon={ShareIcon} onClick={this.onOpenShareStory} />
						<IconLabelButton label='More' icon={MoreIcon} />
					</div>}
				</div>
				{this.state.shareStoryDialogOpen && <ShareStoryDialog story={this.props.story} onClose={this.onCloseShareStory} />}
				{this.state.editStoryDialogOpen && <EditStoryDialog story={this.props.story} onClose={this.onCloseEditStory} />}
			</div>
		);
	}

	private onMouseEnter() {
		this.setState({
			optionsVisible: true,
		});
	}

	private onMouseLeave() {
		this.setState({
			optionsVisible: false,
		});
	}

	private onOpenShareStory() {
		this.setState({
			shareStoryDialogOpen: true,
		});
	}

	private onCloseShareStory() {
		this.setState({
			shareStoryDialogOpen: false,
		});
	}

	private onOpenEditStory() {
		this.setState({
			editStoryDialogOpen: true,
		});
	}

	private onCloseEditStory() {
		this.setState({
			editStoryDialogOpen: false,
		});
	}
}
