import React from 'react';

import Input from 'root/irl-ui/input/input';
import AudioSelector from 'root/irl-ui/audio-selector/audio-selector';
import Typography, { TypographyVariant } from 'root/irl-ui/typography/typography';

import Story from 'root/models/story-model';

import './edit-story-dialog.scss';
import Spacer from 'root/irl-ui/spacer/spacer';
import colors from 'root/styles/colors';

interface EditStoryDialogProps {
	story: Story
	onClose: () => void;
}

interface EditStoryDialogState {
	storyName: string;
	storyTags: string;
}

export default class EditStoryDialog extends React.Component<EditStoryDialogProps, EditStoryDialogState> {
	constructor(props: EditStoryDialogProps) {
		super(props);

		this.state = {
			storyName: this.props.story.name,
			storyTags: this.props.story.tagsFormatted,
		};

		this.close = this.close.bind(this);
		this.onNameChange = this.onNameChange.bind(this);
		this.onTagsChange = this.onTagsChange.bind(this);
	}

	public render() {
		return (
			<div key='edit-story-dialog-container' className='edit-story-dialog-container' id='dialog-container' onClick={this.close}>
				<div className='edit-story-dialog'>
					<div className='edit-story-dialog-title'>
						<div className='edit-story-close-button'>
							<img src='assets/icons/cancel.svg' onClick={this.props.onClose} />
						</div>
						<div className='edit-story-title'>
							<Typography variant={TypographyVariant.TEXT_LARGE}>
								Edit story
							</Typography>
						</div>
					</div>
					<div className='edit-story-options-container'>
						<Input
							label='Story name'
							placeholder='Enter a short name for your story'
							fullWidth={true}
							type='text'
							onChange={this.onNameChange}
							value={this.state.storyName}
						/>
						<Spacer size={24} />
						<Input
							label='Story tags'
							placeholder='Use comma to add separate tags'
							fullWidth={true}
							type='text'
							onChange={this.onTagsChange}
							value={this.state.storyTags}
						/>
						<Spacer size={24} />
						<AudioSelector title='Story soundtrack' />
					</div>
					<div className='edit-story-dialog-title'>
						<div className='edit-story-title'>
							<Typography variant={TypographyVariant.HEADING_MEDIUM} color={colors.red}>
								Delete story
							</Typography>
						</div>
					</div>
				</div>
			</div>
		);
	}

	private close(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		if ((event.target as HTMLDivElement).id === 'dialog-container') {
			this.props.onClose();
		}
	}

	private onNameChange(name: string) {
		this.setState({
			storyName: name,
		});
	}

	private onTagsChange(tags: string) {
		this.setState({
			storyTags: tags,
		});
	}
}
