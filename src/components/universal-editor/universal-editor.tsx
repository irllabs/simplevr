import React from 'react';

import './universal-editor.scss';
import { Universal } from 'data/scene/entities/universal';
import projectMetaDataInteractor from 'core/scene/projectMetaDataInteractor';
import { resizeImage } from 'data/util/imageResizeService';
import eventBus from 'ui/common/event-bus';
import settingsInteractor from 'core/settings/settingsInteractor';
import { audioDuration } from 'ui/editor/util/audioDuration';
import { DEFAULT_VOLUME } from 'ui/common/constants';
import { browserCanRecordAudio } from 'ui/editor/util/audioRecorderService';
import TextInput from '../text-input/text-input';
import FileLoader from '../file-loader/file-loader';
import AudioRecorder from '../audio-recorder/audio-recorder';
import Checkbox from '../checkbox/checkbox';
import AudioElement from '../audio-element/audio-element';
import openModalEvent from 'root/events/open-modal-event';

interface UniversalEditorProps {
	universalProperty: Universal;
}

interface UniversalEditorState {
	activeTab: number;
	title: string;
	textContent: string;
}

export default class UniversalEditor extends React.Component<UniversalEditorProps, UniversalEditorState> {
	private _originImage: any = null;
	private _rotateImageAngle: number = 0;

	public TABS = {
		IMAGE: 1,
		TEXT: 2,
		AUDIO: 3,
	};

	constructor(props: UniversalEditorProps) {
		super(props);

		this.state = {
			activeTab: this.TABS.IMAGE,
			title: '',
			textContent: this.props.universalProperty.textContent,
		};

		this.onNameChange = this.onNameChange.bind(this);
		this.onImageFileLoad = this.onImageFileLoad.bind(this);
		this.onRotateImage = this.onRotateImage.bind(this);
		this.setTextContent = this.setTextContent.bind(this);
		this.onLoopChange = this.onLoopChange.bind(this);
		this.onAudioFileLoad = this.onAudioFileLoad.bind(this);
		this.onAudioRecorded = this.onAudioRecorded.bind(this);
		this.onVolumeChange = this.onVolumeChange.bind(this);
		this.onDeleteTabData = this.onDeleteTabData.bind(this);
	}

	public get activeTab(): number {
		let activeTab = this.state.activeTab;

		if (this.state.activeTab === null) {
			if (this.hasImageContent()) {
				this.setState({
					activeTab: this.TABS.IMAGE,
				});
				activeTab = this.TABS.IMAGE;
			} else if (this.hasTextContent()) {
				this.setState({
					activeTab: this.TABS.TEXT,
				})
				activeTab = this.TABS.TEXT;
			} else if (this.hasAudioContent()) {
				this.setState({
					activeTab: this.TABS.AUDIO,
				})
				activeTab = this.TABS.AUDIO;
			} else {
				this.setState({
					activeTab: this.TABS.IMAGE
				})
				activeTab = this.TABS.IMAGE;
			}
		}
	
		return activeTab;
	}

	public get activeTabName(): string {
		switch (this.activeTab) {
		  case this.TABS.IMAGE: {
			return 'Image';
		  }
		  case this.TABS.TEXT: {
			return 'Text';
		  }
		  default: {
			return 'Audio';
		  }
		}
	  }

	  public get textContent(): string {
		return this.props.universalProperty.textContent;
	  }

	  public set textContent(value: string) {
		this.props.universalProperty.textContent = value;
		this._onChange();
	  }

	  private _onChange() {
		projectMetaDataInteractor.onProjectChanged();

		this.forceUpdate();
	  }

	  public onNameChange($event) {
		this.props.universalProperty.setName($event.text);
		this._onChange();
	  }

	  public onChangeActiveTab(event, tab) {
		if (event.target.checked) {
		  this.setState({
			  activeTab: tab,
		  })
		}
	  }

	  public onImageFileLoad($event) {
		console.log($event)
		resizeImage($event.binaryFileData, 'hotspotImage')
		  .then((resizedImageData) => {
			this._originImage = null;
	
			this.props.universalProperty.setImageContent(resizedImageData);
			this._onChange();
		  })
		  .catch(error => eventBus.onModalMessage('Image loading error', error));
	  }
	
	  public onRotateImage() {
		const image = (document.createElement('img') as unknown) as HTMLImageElement;
		const canvas = (document.createElement('canvas') as unknown) as HTMLCanvasElement;;
		const context = canvas.getContext('2d');
	
		if (this._originImage === null) {
		  this._originImage = this.props.universalProperty.imageContent.getBinaryFileData();
		  this._originImage = this._originImage && this._originImage.changingThisBreaksApplicationSecurity ? this._originImage.changingThisBreaksApplicationSecurity : this._originImage;
		}
	
		this._rotateImageAngle += 90;
	
		image.onload = () => {
		  canvas.width = image.width;
		  canvas.height = image.height;
		  context.drawImage(image, 0, 0);
		  context.clearRect(0, 0, canvas.width, canvas.height);
		  context.save();
		  context.translate(image.width / 2, image.height / 2);
		  context.rotate(this._rotateImageAngle * Math.PI / 180);
		  context.drawImage(image, -image.width / 2, -image.height / 2);
		  context.restore();
		  this.props.universalProperty.imageContent.setBinaryFileData(canvas.toDataURL());
		};
	
		image.src = this._originImage;
		this._onChange();
	  }

	  public onAudioFileLoad($event) {
		const { maxHotspotAudioDuration, maxHotspotAudioFilesize } = settingsInteractor.settings;
		if ($event.file.size/1024/1024 >= maxHotspotAudioFilesize) {
			openModalEvent.emit({
				bodyText: `File is too big. File should be less than ${maxHotspotAudioFilesize} megabytes`,
				headerText: 'Error',
				isMessage: false,
				modalType: 'message',
			})

			return;
		}
	
		audioDuration($event.file)
		  .then(duration => {
			if (duration > maxHotspotAudioDuration) {
			  throw new Error(`Duration of hotspot audio is  too long. It should be less that ${maxHotspotAudioDuration} seconds`)
			}
			this.props.universalProperty.setAudioContent($event.binaryFileData, DEFAULT_VOLUME);
			this._onChange();
		  })
		  .catch((error) => eventBus.onModalMessage('Error', error))
	
	  }


	  public onVolumeChange($event) {
		if (this.props.universalProperty.volume !== $event.currentTarget.volume) {
		  this.props.universalProperty.volume = $event.currentTarget.volume;
		  this._onChange();
		}
	  }

	  public onAudioRecorded($event) {
		this.props.universalProperty.setAudioContent($event.dataUrl, DEFAULT_VOLUME);
		this._onChange();
	  }

	  public onLoopChange($event) {
		this.props.universalProperty.loop = $event.value;
		this._onChange();
	  }

	  public getLoopState() {
		return this.props.universalProperty.loop;
	  }

	  public hasAudioContent(): boolean {
		return this.props.universalProperty.audioContent.hasAsset();
	  }

	  public hasImageContent(): boolean {
		return this.props.universalProperty.imageContent.hasAsset();
	  }

	  public hasTextContent(): boolean {
		return !!this.props.universalProperty.textContent;
	  }

	  public showAudioRecorder(): boolean {
		return browserCanRecordAudio();
	  }

	  public onUploadSuccess($event){
		console.log($event)
		resizeImage($event[0].dataURL, 'hotspotImage')
		  .then((resizedImageData) => {
			this._originImage = null;
			this.setState({
				title: $event[0].name,
			});
			this.props.universalProperty.setImageContent(resizedImageData);
			this._onChange();
		  })
		  .catch(error => eventBus.onModalMessage('Image loading error', error));
	
	  }

	  public onDeleteTabData(): void {
		switch (this.activeTab) {
		  case this.TABS.IMAGE: {
			this.props.universalProperty.resetImageContent();
			break;
		  }
		  case this.TABS.TEXT: {
			this.props.universalProperty.textContent = '';
			break;
		  }
		  default: {
			this.props.universalProperty.resetAudioContent();
		  }
		}
		this.forceUpdate();
	  }

	private setTextContent(event: React.ChangeEvent<HTMLTextAreaElement>) {
		this.setState({
			textContent: event.target.value
		});

		this.textContent = event.target.value;
	}

	public render() {
		return (
			<div className="universal-editor">
				<h2 className="hotspot-inspector__label">
					Hotspot Tool
				</h2>

				<div className="hotspot-inspector__title">
					<TextInput
						label={this.props.universalProperty.getName()}
						isHotspotTitle={true}
						onModelChange={this.onNameChange}>
					</TextInput>
				</div>

				<br/>

				<div className="tab-container">
					<div className="tabs">
					<input
						id="tab-universal-image"
						type="radio"
						name="tabs"
						onChange={(event) => {
							this.onChangeActiveTab(event, this.TABS.IMAGE)
						}}
						checked={this.activeTab === this.TABS.IMAGE}
					/>
					<label htmlFor="tab-universal-image" className="tab">
						<div className="universal-editor__tab-icon list-icon__image"></div>
						Image
					</label>

					<input
						id="tab-universal-text"
						type="radio"
						name="tabs"
						onChange={(event) => {
							this.onChangeActiveTab(event, this.TABS.TEXT)
						}}
						checked={this.activeTab === this.TABS.TEXT}
					/>
					<label htmlFor="tab-universal-text" className="tab">
						<div className="universal-editor__tab-icon list-icon__text"></div>
						Text
					</label>

					<input
						id="tab-universal-audio"
						type="radio"
						name="tabs"
						onChange={(event) => {
							this.onChangeActiveTab(event, this.TABS.AUDIO);
						}}
						checked={this.activeTab === this.TABS.AUDIO}
					/>
					<label htmlFor="tab-universal-audio" className="tab">
						<div className="universal-editor__tab-icon list-icon__audio"></div>
						Audio
					</label>
					</div>

					<section
						id="content-universal-image"
						className={`${this.activeTab === this.TABS.IMAGE ? 'active' : ''}`}
					>
						<FileLoader
							displayText={'Add image'}
							onFileLoad={this.onImageFileLoad}
							acceptedFileType='image'
							className="universal-editor__file-loader">
						</FileLoader>

						<div className="universal-editor__image-wrapper">
							{this.hasImageContent() &&
							<img
								src={this.props.universalProperty.imageContent.getBinaryFileData()}
								className="universal-editor__image-display"
							/>}
							<h1 className="name">{this.state.title}</h1>
							{this.hasImageContent() &&
							<svg className="check" width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink"><title>Check</title><defs></defs><g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" strokeOpacity="0.198794158" stroke="#747474" fillOpacity="0.816519475" fill="#FFFFFF"></path></g></svg>}
						</div>

						{this.hasImageContent() &&
						<div className="universal-editor__image-rotate">
							<button type="button" onClick={this.onRotateImage}>
								<img src="assets/icons/rotate-icon-default.png" alt="Rotate" className="default"/>
								<img src="assets/icons/rotate-icon-hover-active.png" alt="Rotate" className="active"/>
							</button>
						</div>}
					</section>

					<section id="content-universal-text" className={`${this.activeTab === this.TABS.TEXT ? 'active' : ''}`}>
						<p className="hotspot-inspector__label">
							Enter Text:
						</p>
						<textarea
							maxLength={245}
							name="textarea"
							className="universal-editor__text-area"
							value={this.textContent}
							onChange={this.setTextContent}>
						</textarea>

						<p className="universal-editor__text-chars-counter">
							{245 - (this.props.universalProperty.textContent && this.props.universalProperty.textContent.length || 0)} characters left
						</p>
					</section>

					<section id="content-universal-audio" className={`${this.activeTab === this.TABS.AUDIO ? 'active' : ''}`}>
						<div style={{display: 'flex'}}>
							<p className="hotspot-inspector__label play-loop-label">
								Play loop
							</p>

							<Checkbox
								initialValue={this.getLoopState()}
								onChange={this.onLoopChange}
								disabled={false}>
							</Checkbox>
						</div>

						<div className="hotspot-inspector_row">
							<FileLoader
								displayText={'Add audio'}
								onFileLoad={this.onAudioFileLoad}
								acceptedFileType='audio'
								maxFileSize={50}
								className="universal-editor__file-loader">
							</FileLoader>

							{this.showAudioRecorder() &&
							<AudioRecorder
								maxRecordTime={30}
								onRecorded={this.onAudioRecorded}
								className="universal-editor__record-button">
							</AudioRecorder>}
						</div>

						{this.hasAudioContent() &&
						<AudioElement
							onVolumeChange={this.onVolumeChange}
							volume={this.props.universalProperty.volume}
							loop={this.props.universalProperty.loop}
							src={this.props.universalProperty.audioContent.getObjectUrl()}>
						</AudioElement>}
					</section>
				</div>

				{this.hasImageContent() &&
				<div
					className="property-editor__delete-button"
					onClick={this.onDeleteTabData}>
					Delete { this.activeTabName }
				</div>}
			</div>
		);
	}
}
