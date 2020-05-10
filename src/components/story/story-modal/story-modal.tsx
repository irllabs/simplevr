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

interface StoryModalState {
	projectList: Project[];
}

interface StoryModalProps {
	onClose: () => void;
}

export default class StoryModal extends React.Component<StoryModalProps, StoryModalState> {
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

	public onSoundtrackLoad(data, file) {
		const { maxSoundtrackAudioDuration, maxSoundtrackAudioFilesize } = settingsInteractor.settings;
		if (file.size/1024/1024 >= maxSoundtrackAudioFilesize) {
			eventBus.onModalMessage('Error', `File is too big. File should be less than ${maxSoundtrackAudioFilesize} megabytes `)
			return;
		}

		audioDuration(file)
		.then(duration => {
			if(duration >= maxSoundtrackAudioDuration) {
				eventBus.onModalMessage('Error', `Duration of soundtrack is too long. It should be less that ${maxSoundtrackAudioDuration} seconds`)
				return;
			}
			projectMetaDataInteractor.setSoundtrack(file.name, DEFAULT_VOLUME, data);
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

	public onNewStoryClick($event) {
		projectMetaDataInteractor.checkAndConfirmResetChanges().then(() => {
			projectMetaDataInteractor.loadingProject(true);
			// this.router.navigate(['/editor', { outlets: { 'modal': 'upload' } }]);
			if ($event.shiftKey) {
				eventBus.onOpenFileLoader('zip');
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

		/*
		    metaDataInteractor.checkAndConfirmResetChanges().then(() => {
			metaDataInteractor.loadingProject(true);
			this.router.navigate(['/editor', { outlets: { 'modal': 'upload' } }]);
			if ($event.shiftKey) {
			eventBus.onOpenFileLoader('zip');
			return;
			}
			this.removeSoundtrack();
			sceneInteractor.setActiveRoomId(null);
			sceneInteractor.resetRoomManager();
			projectInteractor.setProject(null);
			eventBus.onSelectRoom(null, false);
			metaDataInteractor.setIsReadOnly(false);
			metaDataInteractor.loadingProject(false);
			}, () => {});
		*/
	}

	private removeSoundtrack() {
		projectMetaDataInteractor.removeSoundtrack();
		this.forceUpdate();
	}

	public onSaveStoryClick(event) {
		if (projectMetaDataInteractor.projectIsEmpty()) {
			eventBus.onModalMessage('Error', 'Cannot save an empty project');
			return;
		}
		if (!userInteractor.isLoggedIn()) {
			eventBus.onModalMessage('Error', 'You must be logged in to save to the server');
			return;
		}
		if (projectMetaDataInteractor.getIsReadOnly()) {
			eventBus.onModalMessage('Permissions Error', 'It looks like you are working on a different user\'s project. You cannot save this to your account but you can save it locally by shift-clicking the save button.');
			return;
		}

		this.saveStoryFileToServer();
	}

	private saveStoryFileToServer() {
		const project = projectInteractor.getProject();
		const isWorkingOnSavedProject = projectInteractor.isWorkingOnSavedProject();
	
		const onSuccess = () => {
			eventBus.onStopLoading();
			eventBus.onModalMessage('', 'Your project has been saved.');
		};
	
		const onError = (error) => {
			eventBus.onStopLoading();
			eventBus.onModalMessage('Save error', error);
		};
	
		eventBus.onStartLoading();
	
		if (isWorkingOnSavedProject) {
			projectInteractor.updateProject(project).then(onSuccess, onError);
		} else {
			if (this.state.projectList.length >= settingsInteractor.settings.maxProjects) {
				return onError("You have reached maximum number of projects");
			}
			projectInteractor.createProject().then(onSuccess, onError);
		}
	}

	public onSaveStoryLocallyClick(event) {
		if (projectMetaDataInteractor.projectIsEmpty()) {
			eventBus.onModalMessage('Error', 'Cannot save an empty project');
			return;
		}
	
		if (projectMetaDataInteractor.getIsReadOnly()) {
			eventBus.onModalMessage('Permissions Error', 'It looks like you are working on a different user\'s project. You cannot save this to your account but you can save it locally by shift-clicking the save button.');
			return;
		}
		if (!userInteractor.isLoggedIn()) {
			eventBus.onModalMessage('Error', 'You must be logged in to download as .zip');
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
		projectMetaDataInteractor.checkAndConfirmResetChanges().then(() => {
			// if (!this.userInteractor.isLoggedIn()) {
			//   this.eventBus.onModalMessage('Error', 'You must be logged in to upload from .zip');
			//   return;
			// }
	
			eventBus.onOpenFileLoader('zip');
		}, () => {});
	}
}
