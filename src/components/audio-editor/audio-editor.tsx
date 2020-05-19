import React from 'react';

import './audio-editor.scss';
import { Audio } from 'data/scene/entities/audio';
import { DEFAULT_VOLUME, DEFAULT_FILE_NAME } from 'ui/common/constants';
import { browserCanRecordAudio } from 'ui/editor/util/audioRecorderService';
import FileLoader from '../file-loader/file-loader';
import AudioRecorder from '../audio-recorder/audio-recorder';

interface AudioEditorProps {
	audioProperty: Audio;
}

export default class AudioEditor extends React.Component<AudioEditorProps, {}> {
	constructor(props: AudioEditorProps) {
		super(props);
	}

	public render() {
		return (
			<div>
				<div className="hotspot-inspector_row">
					<FileLoader
						onFileLoad={this.onFileLoad}
						acceptedFileType='audio'
						className="audio-editor__file-loader">
					</FileLoader>

					{this.showAudioRecorder() &&
					<AudioRecorder
						onRecorded={this.onAudioRecorded}
						className="audio-editor__record-button">
					</AudioRecorder>}
				</div>

				{this.hasAudioFile() &&
				<audio
					src={this.props.audioProperty.getBinaryFileData()}
					controls={true}
					onVolumeChange={this.onVolumeChange}
					className="audio-editor__audio-player">
				</audio>}
			</div>
		);
	}

	private onFileLoad($event) {
		this.props.audioProperty.setFileData($event.file.name, DEFAULT_VOLUME, $event.binaryFileData);
	}

	private hasAudioFile(): boolean {
		return this.props.audioProperty.getFileName() !== DEFAULT_FILE_NAME;
	}

	private onAudioRecorded($event) {
		this.props.audioProperty.setFileData($event.fileName, DEFAULT_VOLUME, $event.dataUrl);
	}

	private showAudioRecorder(): boolean {
		return browserCanRecordAudio();
	}

	private onVolumeChange($event) {
		const volume = $event.currentTarget.volume;
		this.props.audioProperty.setVolume(volume);
	}
}
