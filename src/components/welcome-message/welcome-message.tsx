import React from 'react';

import Typography, { TypographyVariant } from 'irl-ui/typography/typography';
import Spacer from 'irl-ui/spacer/spacer';

import { Room } from 'data/scene/entities/room';

import FileLoader from 'util/file-loader';

import resizeImageAsync from 'services/resize-image';

import sceneInteractor from 'core/scene/sceneInteractor';

import colors from 'styles/colors';

import './welcome-message.scss';

interface WelcomeMessageProps {
	onStoryLoaded: () => void;
}

export default class WelcomeMessage extends React.Component<WelcomeMessageProps, {}> {
	constructor(props: WelcomeMessageProps) {
		super(props);

		this.onFileSelectedAsync = this.onFileSelectedAsync.bind(this);
	}

	public render() {
		return (
			<div className='welcome-message-container'>
				<input
					id="welcome-message-input"
					type="file"
					multiple
					className="welcome-message-input"
					onChange={this.onFileSelectedAsync}
				/>
				<label className='welcome-message' htmlFor='welcome-message-input'>
					<div className='welcome-message-heading'>
						<Typography variant={TypographyVariant.HEADING_XXXX_LARGE} align='center'>
							SimpleVR
						</Typography>
						<Spacer size={8} />
						<Typography variant={TypographyVariant.TEXT_LARGE} align='center'>
							Create your immersive stories by combining 360 photos with audio recordings, images, and text.
						</Typography>
					</div>
					<div className='welcome-message-action'>
						<Typography variant={TypographyVariant.HEADING_XXX_LARGE} align='center'>
							Upload 360° panorama image
						</Typography>
						<Typography variant={TypographyVariant.HEADING_LARGE} align='center' color={colors.textDark3}>
							or a story .zip
						</Typography>
					</div>
				</label>
			</div>
		);
	}

	private async onFileSelectedAsync(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files && event.target.files[0];

		// Verify if input file is of valid type and format
		await FileLoader.validateFileLoadEvent(file, 'image');

		const fileData = await FileLoader.getBinaryFileData(file) as string;
		const resizedImage = await resizeImageAsync(fileData, 'backgroundImage');

		const roomId: string = sceneInteractor.addRoom();
		const room: Room = sceneInteractor.getRoomById(roomId);

		room.setBackgroundImageBinaryData(resizedImage.backgroundImage);
		room.setThumbnail(resizedImage.thumbnail);

		this.props.onStoryLoaded();
	}
}
