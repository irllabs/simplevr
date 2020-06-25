import React from 'react';

import Spacer from 'root/irl-ui/spacer/spacer';
import Typography, { TypographyVariant } from 'root/irl-ui/typography/typography';

import colors from 'styles/colors';

import './new-story.scss';

export default class NewStory extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render() {
		return (
			<div className='new-story-container'>
				<Typography variant={TypographyVariant.TEXT_LARGE} color='white' align={'center'}>
					Start creating your immersive story by combining 360 photos with audio recordings, images, and text
				</Typography>
				<Spacer size={32} />
				<div className='new-story-button'>
					<Typography variant={TypographyVariant.HEADING_LARGE} color={colors.primary}>
						Upload 360° panorama image
					</Typography>
					<Typography variant={TypographyVariant.HEADING_MEDIUM} color={colors.primary}>
						or a story .zip
					</Typography>
				</div>
			</div>
		);
	}
}
