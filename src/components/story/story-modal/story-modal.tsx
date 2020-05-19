import React from 'react';
import FileSaver from 'file-saver';

import FileLoader from 'components/file-loader/file-loader';
import TextInputMaterial from 'components/text-input-material/text-input-material';
import projectMetaDataInteractor from 'core/scene/projectMetaDataInteractor';
import eventBus from 'ui/common/event-bus';
import sceneInteractor from 'core/scene/sceneInteractor';
import projectInteractor from 'core/project/projectInteractor';
import userInteractor from 'core/user/userInteractor';
import { Project } from 'data/project/projectModel';
import settingsInteractor from 'core/settings/settingsInteractor';
import storageInteractor from 'core/storage/storageInteractor';
import AudioElement from 'root/components/audio-element/audio-element';
import { Audio } from 'data/scene/entities/audio';
import { audioDuration } from 'ui/editor/util/audioDuration';
import { DEFAULT_VOLUME } from 'ui/common/constants';
import openModalEvent from 'root/events/open-modal-event';
import zipFileReader from 'ui/editor/util/zipFileReader';

interface StoryModalState {
	projectList: Project[];
}

interface StoryModalProps {
	onClose: () => void;
}

export default class StoryModal extends React.Component<StoryModalProps, StoryModalState> {
	private _hiddenLabelRef = React.createRef<HTMLInputElement>();

	constructor(props: StoryModalProps) {
		super(props);

		this.state = {
			projectList: [],
		};

		this.setProjectName = this.setProjectName.bind(this);
		this.setProjectTags = this.setProjectTags.bind(this);
		this.onNewStoryClick = this.onNewStoryClick.bind(this);
		this.onSaveStoryClick = this.onSaveStoryClick.bind(this);
		this.onSaveStoryLocallyClick = this.onSaveStoryLocallyClick.bind(this);
		this.onOpenStoryLocallyClick = this.onOpenStoryLocallyClick.bind(this);
		this.onSoundtrackLoad = this.onSoundtrackLoad.bind(this);
		this.removeSoundtrack = this.removeSoundtrack.bind(this);
		this.openProjectZip = this.openProjectZip.bind(this);
	}

	public async componentDidMount() {
		const projects = await projectInteractor.getProjects();
		const projectList = projects?.docs.map((p) => new Project(p.data()));

		this.setState({
			projectList: projectList || []
		});
	}

	public render() {
		return (
			<div className="modal-window">
				<div className="modal-window__fields">
					<TextInputMaterial
						inputLabel='Title'
						onTextChange={this.setProjectName}>
					</TextInputMaterial>

					<TextInputMaterial
						inputLabel='Tags'
						onTextChange={this.setProjectTags}>
					</TextInputMaterial>

					<div className="horiz-line-bottom"></div>

					<div className="button_row">
						<input
							ref={this._hiddenLabelRef}
							type="file"
							id="hiddenInput"
							style={{display: 'none'}}
							onChange={this.openProjectZip}
						/>
						<div
							className="button"
							title="Click to create new story"
							onClick={this.onNewStoryClick}>
								New Story
						</div>
						<div className="button" title="Click to save current story to server"
							onClick={this.onSaveStoryClick}>
								Save Story
						</div>
					</div>

					<div className="button_row">
						<div className="button" title="Click to download story as zip file"
							onClick={this.onSaveStoryLocallyClick}>
								Download as .zip
						</div>
						<div
							className="button"
							title="Click to upload zip file"
							onClick={this.onOpenStoryLocallyClick}>
								Upload from .zip
						</div>
					</div>

					<div className="dropdown-input-row">
						{!this.getSoundtrack().hasAsset() &&
						<FileLoader
							onFileLoad={this.onSoundtrackLoad}
							acceptedFileType='audio'
							displayText='Add Soundtrack'
							maxFileSize={50}>
						</FileLoader>}

						{this.getSoundtrack().hasAsset() &&
						<div
							className="story__soundtrack__delete-button"
							onClick={this.removeSoundtrack}>
								Remove Soundtrack
						</div>}
						
						{this.getSoundtrack().hasAsset() &&
						<AudioElement
							onVolumeChange={this.onVolumeChange}
							volume={this.getSoundtrackVolume()}
							src={this.getSoundtrack().getObjectUrl()}
							loop={false}>
						</AudioElement>}
					</div>
				</div>
			</div>
		);
	}

	public getSoundtrackVolume(): number {
		return projectMetaDataInteractor.getSoundtrackVolume();
	}

	public onVolumeChange(event) {
		const volume = event.currentTarget.volume;
		projectMetaDataInteractor.setSoundtrackVolume(volume);
	}

	public onSoundtrackLoad(data) {
		const { maxSoundtrackAudioDuration, maxSoundtrackAudioFilesize } = settingsInteractor.settings;
		if (data.file.size/1024/1024 >= maxSoundtrackAudioFilesize) {
			eventBus.onModalMessage('Error', `File is too big. File should be less than ${maxSoundtrackAudioFilesize} megabytes `)
			return;
		}

		audioDuration(data.file)
		.then(duration => {
			if(duration >= maxSoundtrackAudioDuration) {
				eventBus.onModalMessage('Error', `Duration of soundtrack is too long. It should be less that ${maxSoundtrackAudioDuration} seconds`)
				return;
			}
			projectMetaDataInteractor.setSoundtrack(data.file.name, DEFAULT_VOLUME, data);
			this.forceUpdate();
		});
	}

	public getSoundtrack(): Audio {
		return projectMetaDataInteractor.getSoundtrack();
	}

	public setProjectName(text: string) {
		projectMetaDataInteractor.setProjectName(text);
	}

	public setProjectTags(text: string) {
		projectMetaDataInteractor.setProjectTags(text);
	}

	public onNewStoryClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		event.persist();

		if (event.shiftKey) {
			this._hiddenLabelRef.current.click();
			return;
		}

		projectMetaDataInteractor.checkAndConfirmResetChanges().then(() => {
			projectMetaDataInteractor.loadingProject(true);
			if (event.shiftKey) {
				return;
			}
			this.removeSoundtrack();
			sceneInteractor.setActiveRoomId(null);
			sceneInteractor.resetRoomManager();
			projectInteractor.setProject(null);
			eventBus.onSelectRoom(null, false);
			projectMetaDataInteractor.setIsReadOnly(false);
			projectMetaDataInteractor.loadingProject(false);

			this.props.onClose();
		}, () => {});
	}

	private openProjectZip(event) {
		const file = event.target.files && event.target.files[0];
		if (!file) {
			eventBus.onModalMessage('Error', 'No valid file selected');
			return;
		}
		zipFileReader.loadFile(file);
		this.props.onClose();
	}

	private removeSoundtrack() {
		projectMetaDataInteractor.removeSoundtrack();
		this.forceUpdate();
	}

	public onSaveStoryClick(event) {
		if (projectMetaDataInteractor.projectIsEmpty()) {
			openModalEvent.emit({
				bodyText: 'Cannot save an empty project',
				headerText: 'Error',
				isMessage: false,
				modalType: 'message'
			});
			return;
		}
		if (!userInteractor.isLoggedIn()) {
			openModalEvent.emit({
				bodyText: 'You must be logged in to save to the server',
				headerText: 'Error',
				isMessage: false,
				modalType: 'message'
			});
			return;
		}
		if (projectMetaDataInteractor.getIsReadOnly()) {
			openModalEvent.emit({
				bodyText: 'It looks like you are working on a different user\'s project. You cannot save this to your account but you can save it locally by shift-clicking the save button.',
				headerText: 'Permissions Error',
				isMessage: false,
				modalType: 'message'
			});
			return;
		}

		this.saveStoryFileToServer();
	}

	private saveStoryFileToServer() {
		const project = projectInteractor.getProject();
		const isWorkingOnSavedProject = projectInteractor.isWorkingOnSavedProject();
	
		const onSuccess = () => {
			openModalEvent.emit({
				bodyText: 'Your project has been saved.',
				headerText: '',
				isMessage: false,
				modalType: 'message'
			});
		};
	
		const onError = (error) => {
			openModalEvent.emit({
				bodyText: 'Save error.',
				headerText: '',
				isMessage: false,
				modalType: 'message'
			});
		};

		let promise;
		if (isWorkingOnSavedProject) {
			promise = projectInteractor.updateProject(project).then(onSuccess, onError);
		} else {
			if (this.state.projectList.length >= settingsInteractor.settings.maxProjects) {
				return onError("You have reached maximum number of projects");
			}
			promise = projectInteractor.createProject().then(onSuccess, onError);
		}

		openModalEvent.emit({
			bodyText: '',
			headerText: '',
			isMessage: false,
			modalType: 'loader',
			promise: promise,
		});
	}

	public onSaveStoryLocallyClick(event) {
		if (projectMetaDataInteractor.projectIsEmpty()) {
			openModalEvent.emit({
				bodyText: 'Cannot save an empty project',
				headerText: 'Error',
				isMessage: false,
				modalType: 'message'
			});
			return;
		}
	
		if (projectMetaDataInteractor.getIsReadOnly()) {
			openModalEvent.emit({
				bodyText: 'It looks like you are working on a different user\'s project. You cannot save this to your account but you can save it locally by shift-clicking the save button.',
				headerText: 'Permissions Error',
				isMessage: false,
				modalType: 'message'
			});
			return;
		}
		if (!userInteractor.isLoggedIn()) {
			openModalEvent.emit({
				bodyText: 'You must be logged in to download as .zip',
				headerText: 'Error',
				isMessage: false,
				modalType: 'message'
			});
			return;
		}
	
		const projectName = projectMetaDataInteractor.getProjectName() || 'StoryFile';
		const zipFileName = `${projectName}.zip`;
	
		eventBus.onStartLoading();
	
		storageInteractor.serializeProject()
		.then(
			(zipFile) => {
				eventBus.onStopLoading();
				FileSaver.saveAs(zipFile, zipFileName);
			},
			(error) => {
				eventBus.onStopLoading();
				eventBus.onModalMessage('File Download Error', error);
			},
		);
	}

	public onOpenStoryLocallyClick(event) {
		event.persist();
		projectMetaDataInteractor.checkAndConfirmResetChanges();
		this._hiddenLabelRef.current.click();
	}
}
