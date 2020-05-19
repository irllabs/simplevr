import React from 'react';

import './preview-space.scss';

/*import './../../../ui/editor/preview-space/aframe/preview-space';
import './../../../ui/editor/preview-space/aframe/aframe/preview-countdown'
import './../../../ui/editor/preview-space/aframe/aframe/play-once'*/

import './../../../ui/editor/preview-space/preview-space/aframe/preview-space';
import './../../../ui/editor/preview-space/preview-space/aframe/preview-countdown';
import './../../../ui/editor/preview-space/preview-space/aframe/play-once';
import 'ui/editor/util/a-frame/svr-camera';

import { ICON_PATH } from 'ui/common/constants';
import projectMetaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Room } from 'data/scene/entities/room';
import openModalEvent from 'root/events/open-modal-event';
import audioManager from 'ui/editor/preview-space/modules/audioManager';
import textureLoader from 'ui/editor/preview-space/modules/textureLoader';
import fontHelper from 'ui/editor/preview-space/modules/fontHelper';
import Hotspot from './hotspot/hotspot';
import Doorway from './doorway/doorway';

interface PreviewSpaceState {
	soundtrackAudio: string;
	autoplaySounds: boolean;
	soundtrackVolume: number;
	sky: string;
	room: Room;
	narrationAudio: string;
	backgroundAudio: string;
}

export default class PreviewSpace extends React.Component<{}, PreviewSpaceState> {
	private worldElement = React.createRef<any>();
	private skyElement = React.createRef<any>();

	private camera: THREE.PerspectiveCamera;

	private roomHistory: string[] = [];
	private isFirstInitialize: boolean = true;

	constructor(props: {}) {
		super(props);

		this.state = {
			soundtrackAudio: null,
			autoplaySounds: true,
			soundtrackVolume: null,
			sky: null,
			room: null,
			narrationAudio: null,
			backgroundAudio: null,
		}
	}

	protected get iconBack(){
		return `${ICON_PATH}back_filled.png`;
	}
	
	protected get iconHome(){
		return `${ICON_PATH}home_filled.png`;
	}

	public componentDidMount() {
		const projectIsEmpty = projectMetaDataInteractor.projectIsEmpty();
		const isMultiView = location.href.indexOf('multiview=') > -1;
		const sceneEl = this.worldElement.current;
		if (projectIsEmpty && !isMultiView) {
			// this.router.navigate(['/editor', { outlets: { 'view': 'flat' } }]);
			return;
		}
		const isShare = location.href.indexOf('sharedproject=') !== -1;
		
		this.worldElement.current.addEventListener('switch-room', (e) => {
			if (e.detail === 'last') {
				this.goToLastRoom();
			} else if (e.detail === 'home') {
				this.goToHomeRoom();
			} else {
				this.goToRoom(e.detail);
			}
		});

		if (isShare && this.isFirstInitialize) {
			this.setState({
				autoplaySounds: false,
			}, () => {
				this.initWorld();

				openModalEvent.emit({
					bodyText: '',
					headerText: '',
					isMessage: false,
					modalType: 'play-story',
					callback: (isDualScreen: boolean) => {
						if (isDualScreen) {
							sceneEl.emit('touch-all-audio')
							sceneEl.emit('run-countdown')
		
							sceneEl.enterVR()
						} else {
							sceneEl.emit('hide-countdown')
							sceneEl.emit('play-all-audio')
						}
						this.setState({
							autoplaySounds: true,
						})
						this.isFirstInitialize = false;
					}
				});
			});

			return;
		}
		this.initWorld();
	}

	public componentWillUnmount() {
		this.worldElement.current.renderer.dispose();
	}

	public render() {
		return (
			<div className="preview-space">
				<a-scene ref={this.worldElement} preview-space device-orientation-permission-ui="enabled: true">
					<a-entity>
						<a-camera
							wasd-controls-enabled="false"
							look-controls-enabled="true"
							fov="65"
							animation__zoom-in="
								property: zoom;
								from: 1;
								startEvents: start-zoom-in;
								to: 5;"
							zoom="1"
							near="1"
						>
							{this.state.soundtrackAudio &&
							<a-sound
								src={this.state.soundtrackAudio}
								autoplay={this.state.autoplaySounds}
								volume={this.state.soundtrackVolume}
								loop="true"
								class="soundtrack-audio"
							>
							</a-sound>}
							<a-entity
								preview-countdown
								visible="false"
								position="0 0 -.6"
							>
								<a-entity
									geometry="primitive: plane"
									material="color:white"
									scale="3 3 3">
								</a-entity>
								<a-text
									align="center"
									color="black"
									visible="true"
									scale=".15 .15 .15"
									alpha-test=".5"
								>
								</a-text>
							</a-entity>

							<a-cursor
								
							>
							</a-cursor>
						</a-camera>

					<a-sky
						src={this.state.sky}
						radius="512">
					</a-sky>

					{this.state.room &&
					<a-entity>
						{this.state.narrationAudio &&
						<a-sound play-once
							src={this.state.narrationAudio}
							autoplay={this.state.autoplaySounds}
							volume={this.state.room.narrator.volume}
							class="narration-audio"
							sound="positional: false"
						>
						</a-sound>}
						{this.state.backgroundAudio &&
						<a-sound
							src={this.state.backgroundAudio}
							autoplay={this.state.autoplaySounds}
							volume={this.state.room.bgAudioVolume}
							class="background-audio"
							loop="true"
							sound="positional: false"
						>
						</a-sound>}

						{this.state.room.getUniversalSet().map((hotspot) => {
							return (
								<a-entity key={hotspot.getId()}>
									<Hotspot hotspot={hotspot}>
									</Hotspot>
								</a-entity>
							)
						})}

						{this.state.room.getDoorSet().map((door) => {
							return (
								<a-entity key={door.getId()}>
									<Doorway doorway={door}>
									</Doorway>
								</a-entity>
							)
						})}
					</a-entity>}
					</a-entity>

					<a-entity
						control-panel
						material="
							opacity: .5;
							color: #fff"
							geometry="
							primitive: plane;
							height: 1;
							width: 2;"
						look-at="a-camera"
						position="0 -2 -3"
						color="#00F">
						<a-entity nga-panel-button
							position="0 0 0"
							event="'switch-room-last'"
							icon="iconBack"
						>
						</a-entity>
						<a-entity nga-panel-button
							position="1 0 0"
							event="'switch-room-home'"
							icon="iconHome"
						>
						</a-entity>
					</a-entity>
			</a-scene>
			</div>
		);
	}

	initWorld(){
		Promise.all([
			audioManager.loadBuffers(),
			textureLoader.load(),
			fontHelper.load(),
		])
		.then(() => {
			this.initSoundtrack();
			this.initRoom();
		})
		.catch(error => console.log('EditSphereBaseInit', error));
	}

	initSoundtrack(){
		this.setState({
			soundtrackVolume: projectMetaDataInteractor.getSoundtrack().getVolume(),
			soundtrackAudio: projectMetaDataInteractor.getSoundtrack().getBinaryFileData(true)
		});
	}

	initRoom() {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		console.log(room)

		this.setState({
			sky: room.getBackgroundImageBinaryData(true),
			room: room,
			narrationAudio: room.getNarrationIntroBinaryFileData(true),
			backgroundAudio: room.getBackgroundAudioBinaryFileData(true)
		})
		this.roomHistory.push(roomId);
		setTimeout(() => {
			this.worldElement.current.emit('reset-camera');
		})
		// this.ref.detectChanges();
	}

	goToLastRoom() {
		this.roomHistory.pop();
	
		const lastRoom = this.roomHistory[this.roomHistory.length - 1];
	
		setTimeout(() => {
			sceneInteractor.setActiveRoomId(lastRoom);
			this.initRoom();
		});
	}

	goToHomeRoom() {
		const homeRoom = sceneInteractor.getHomeRoomId();
	
		sceneInteractor.setActiveRoomId(homeRoom);
		this.initRoom();
	}

	goToRoom(outgoingRoomId) {
		sceneInteractor.setActiveRoomId(outgoingRoomId);
		this.initRoom();
	}
}
