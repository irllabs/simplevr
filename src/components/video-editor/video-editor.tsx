import React from 'react';

import { Video } from 'data/scene/entities/video';

import './video-editor.scss';

interface VideoEditorProps {
	videoProperty: Video;
}

export default class VideoEditor extends React.Component<VideoEditorProps, {}> {
	constructor(props: VideoEditorProps) {
		super(props);
	}

	public render() {
		return (
			<div className="video-editor">
				<p className="hotspot-inspector__label">
					Enter video link:
				</p>

				<textarea
					name="textarea"
					className="video-editor__text-area"
					value={this.props.videoProperty.body}>
				</textarea>

				{!this.props.videoProperty.isValid &&
				<div className="invalid-message">
					The URL is not valid, please check and try again.
				</div>}

				{this.props.videoProperty.hasValidUrl &&
				<div className="yt-player">
					<video controls={true}>
						<source
							src={this.props.videoProperty.fullExportUrl}
							type='video/webm'
						/>
					</video>
				</div>}
			</div>
		);
	}
}
