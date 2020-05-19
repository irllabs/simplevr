import React from 'react';

import './room-editor.scss';
import TextInputMaterial from 'root/components/text-input-material/text-input-material';
import FileLoader from 'root/components/file-loader/file-loader';
import AudioElement from 'root/components/audio-element/audio-element';
import AudioRecorder from 'root/components/audio-recorder/audio-recorder';
import settingsInteractor from 'core/settings/settingsInteractor';
import { resizeImage } from 'data/util/imageResizeService';
import { audioDuration } from 'ui/editor/util/audioDuration';
import { DEFAULT_VOLUME } from 'ui/common/constants';
import sceneInteractor from 'core/scene/sceneInteractor';
import { browserCanRecordAudio } from 'ui/editor/util/audioRecorderService';

interface RoomEditorProps {
	onOffClick: () => void;
}

interface RoomEditorState {
	largeIntroAudioFile: boolean;
}

import './room-editor.scss';
import { roomsUpdatedEvent } from 'root/events/event-manager';
import openModalEvent from 'root/events/open-modal-event';

export default class RoomEditor extends React.Component<RoomEditorProps, RoomEditorState> {
	private element = React.createRef<HTMLDivElement>();

	constructor(props: RoomEditorProps) {
		super(props);

		this.state = {
			largeIntroAudioFile: false,
		};

		this.onBackgroundImageLoad = this.onBackgroundImageLoad.bind(this);
		this.onBackgroundAudioLoad = this.onBackgroundAudioLoad.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.setRoomName = this.setRoomName.bind(this);
		this.removeBackgroundAudio = this.removeBackgroundAudio.bind(this);
		this.onBGAVolumeChange = this.onBGAVolumeChange.bind(this);
		this.onIntroAudioLoad = this.onIntroAudioLoad.bind(this);
		this.removeNarratorIntroAudio = this.removeNarratorIntroAudio.bind(this);
		this.onNarratorIntroRecorded = this.onNarratorIntroRecorded.bind(this);
		this.onNarrationVolumeChange = this.onNarrationVolumeChange.bind(this);
	}

	public componentDidMount() {
		window.addEventListener('mousedown', this.onMouseDown);
	}

	public componentWillUnmount() {
		window.removeEventListener('mousedown', this.onMouseDown);
	}

	public render() {
		return (
			<div ref={this.element} className="room-editor">

				<TextInputMaterial
					inputLabel='Room Name'
					onTextChange={this.setRoomName}>
				</TextInputMaterial>

				<br/>

				<FileLoader
					onFileLoad={this.onBackgroundImageLoad}
					displayText={this.getBackgroundImage().hasAsset() ? 'Change background image' : 'Add background image'}
					acceptedFileType='image'
					maxFileSize={50}>
				</FileLoader>

				{!this.getBackgroundAudio().hasAsset() &&
				<FileLoader
					displayText='Add room background audio'
					maxFileSize={50}
					onFileLoad={this.onBackgroundAudioLoad}
					acceptedFileType='audio'>
				</FileLoader>}

				{this.getBackgroundAudio().hasAsset() &&
				<div
					className="room-editor__delete-button"
					onClick={this.removeBackgroundAudio}>
						Remove background audio
				</div>}

				{this.getBackgroundAudio().hasAsset() &&
				<AudioElement
					volume={this.getBackgroundAudioVolume()}
					onVolumeChange={this.onBGAVolumeChange}
					src={this.getBackgroundAudio().getObjectUrl()}
					loop={false}>
				</AudioElement>}

				<div className="hotspot-inspector_row">
					<div className="hotspot-inspector_row">
						{!this.getNarratorIntroAudioFile().hasAsset() &&
						<FileLoader
							onFileLoad={this.onIntroAudioLoad}
							acceptedFileType='audio'
							maxFileSize={50}
							displayText='Add room narration audio'>
						</FileLoader>}

						{this.getNarratorIntroAudioFile().hasAsset() &&
						<div
							className="room-editor__delete-button"
							onClick={this.removeNarratorIntroAudio}>
								Remove narration
						</div>}
					</div>
					{this.showAudioRecorder() &&
					<AudioRecorder onRecorded={this.onNarratorIntroRecorded}>
					</AudioRecorder>}
				</div>

				{this.state.largeIntroAudioFile &&
				<p className="error-message">
					File size is too large (64MB is maximum).
				</p>}

				{this.getNarratorIntroAudioFile().hasAsset() &&
				<AudioElement
					onVolumeChange={this.onNarrationVolumeChange}
					volume={this.getNarratorIntroAudioVolume()}
					src={this.getNarratorIntroAudioFile().getObjectUrl()}
					loop={false}>
				</AudioElement>}
			</div>
		);
	}

	onMouseDown(event) {
		const isClicked: boolean = this.element.current.contains(event.target);
		if (!isClicked) {
			this.props.onOffClick();
		}
	}

	public onBackgroundImageLoad($event) {
		const { maxBackgroundImageSize } = settingsInteractor.settings

		if( $event.file.size/1024/1024 >= maxBackgroundImageSize){
			// eventBus.onModalMessage('Error', `File is too large. Max file size is ${maxBackgroundImageSize} mb`)
			return;
		}

		const fileName: string = $event.file.name;
		const binaryFileData: any = $event.binaryFileData;

		// eventBus.onStartLoading();

		resizeImage(binaryFileData, 'backgroundImage')
			.then(resized => {
				const room = this.getActiveRoom();

				room.setBackgroundImageBinaryData(resized.backgroundImage);
				room.setThumbnail(resized.thumbnail);

				roomsUpdatedEvent.emit({});

				// eventBus.onSelectRoom(null, false);
				// eventBus.onStopLoading();
			})
			// .catch(error => eventBus.onModalMessage('Image loading error', error));
	}

	public onBackgroundAudioLoad($event) {
		const { maxBackgroundAudioDuration, maxBackgroundAudioFilesize } = settingsInteractor.settings

		if ($event.file.size/1024/1024 >= maxBackgroundAudioFilesize ) {
			openModalEvent.emit({
				bodyText: `File is too big. File should be less than ${maxBackgroundAudioFilesize} megabytes `,
				headerText: 'Error',
				isMessage: false,
				modalType: 'message',
			});

			// eventBus.onModalMessage('Error', `File is too big. File should be less than ${maxBackgroundAudioFilesize} megabytes `)
			return;
		}

		audioDuration($event.file).then(duration => {

			if (duration > maxBackgroundAudioDuration) {
				openModalEvent.emit({
					bodyText: `Duration of background audio is too long. It should be less than ${maxBackgroundAudioDuration} seconds `,
					headerText: 'Error',
					isMessage: false,
					modalType: 'message',
				});

				// eventBus.onModalMessage('Error', )
				return
			}

			this.getActiveRoom().setBackgroundAudio(DEFAULT_VOLUME, $event.binaryFileData);
			roomsUpdatedEvent.emit({});
		})

	}

	public onIntroAudioLoad($event) {
		const { maxNarrationAudioDuration, maxNarrationAudioFilesize } = settingsInteractor.settings
		if ($event.file.size/1024/1024 >= maxNarrationAudioFilesize) {
			// eventBus.onModalMessage('Error', `File is too big. File should be less than ${maxNarrationAudioFilesize} megabytes `)
			return;
		}
		this.setState({
			largeIntroAudioFile: false
		});

		audioDuration($event.file).then(duration => {
			console.log(duration)
			if (duration > maxNarrationAudioDuration) {
				// eventBus.onModalMessage('Error',`Duration of narration audio is too long. It should be less than ${maxNarrationAudioDuration} seconds `)
				return
			}
			this.getNarratorIntroAudio().setIntroAudio(DEFAULT_VOLUME, $event.binaryFileData);
			roomsUpdatedEvent.emit({});
		})


	}

	private onReturnAudioLoad($event) {
		this.getActiveRoom().getNarrator().setReturnAudio($event.binaryFileData);
		roomsUpdatedEvent.emit({});
	}

	private getNarratorIntroAudio() {
		return this.getActiveRoom().getNarrator();
	}

	public getBackgroundAudio() {
		return this.getActiveRoom().getBackgroundAudio();
	}

	public getBackgroundImage() {
		return this.getActiveRoom().getBackgroundImage();
	}

	public getBackgroundAudioVolume() {
		return this.getActiveRoom().getBackgroundAudioVolume();
	}

	public getNarratorIntroAudioVolume() {
		return this.getNarratorIntroAudio().getVolume();
	}

	public getNarratorIntroAudioFile() {
		return this.getNarratorIntroAudio().getIntroAudio();
	}

	private getNarratorReturnAudio() {
		return this.getNarratorIntroAudio().getReturnAudio();
	}

	private getActiveRoom() {
		const activeRoomId = sceneInteractor.getActiveRoomId();
		return sceneInteractor.getRoomById(activeRoomId);
	}

	public onNarratorIntroRecorded($event) {
		this.getActiveRoom().getNarrator().setIntroAudio(DEFAULT_VOLUME, $event.dataUrl);
		roomsUpdatedEvent.emit({});

	}

	public onNarratorReturnRecorded($event) {
		this.getActiveRoom().getNarrator().setReturnAudio($event.dataUrl);
		roomsUpdatedEvent.emit({});
	}

	private onReverbChange($event) {
		this.getActiveRoom().setReverb($event.target.value);

		roomsUpdatedEvent.emit({});
	}

	private getActiveReverb(): string {
		return this.getActiveRoom().getReverb();
	}

	public removeBackgroundAudio() {
		this.getActiveRoom().removeBackgroundAudio();

		roomsUpdatedEvent.emit({});
	}

	public removeNarratorIntroAudio() {
		this.getNarratorIntroAudio().removeIntroAudio();

		roomsUpdatedEvent.emit({});
	}

	public showAudioRecorder(): boolean {
		return browserCanRecordAudio();
	}

	public onNarrationVolumeChange($event) {
		const volume = $event.currentTarget.volume;
		this.getNarratorIntroAudio().setVolume(volume);

		roomsUpdatedEvent.emit({});
	}

	public onBGAVolumeChange($event) {
		const volume = $event.currentTarget.volume;
		this.getActiveRoom().setBackgroundAudioVolume(volume);

		roomsUpdatedEvent.emit({});
	}

	public getRoomName(): string {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		return room.getName();
	}

	public setRoomName($event) {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		room.setName($event);

		roomsUpdatedEvent.emit({});
	}
}
