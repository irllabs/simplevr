import 'aframe';
import 'ui/editor/util/a-frame/svr-camera';

import React from 'react';
import * as THREE from 'three';

import './edit-story-3d.scss';
import sceneInteractor from 'core/scene/sceneInteractor';
import assetInteractor, { AssetModel } from 'core/asset/assetInteractor';
import { coordinateToSpherical, clamp, getCoordinatePosition, denormalizePosition } from 'ui/editor/util/iconPositionUtil';
import { Vector2 } from 'data/scene/entities/vector2';
import Hotspot from '../room-hotspots/hotspot/hotspot';
import RoomIcon from 'root/components/room-icon/room-icon';
import hotspotAddedEvent from 'root/events/hotspot-added-event';
import uuid from 'uuid/v1';

interface EditStory3dState {
	sky: any;
}

export default class EditStory3d extends React.Component<{}, EditStory3dState> {
	private editSpaceSphere = React.createRef<HTMLDivElement>();
	private globeScene = React.createRef<any>();
	private cameraElement: any = React.createRef<any>();
	private camera: any;
	private roomIconComponentList = [];
	private propertyAddedEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			sky: null,
		};

		this.renderFrame = this.renderFrame.bind(this);
		this.resetRoomIconsPosition = this.resetRoomIconsPosition.bind(this);
		this.onMoveEnd = this.onMoveEnd.bind(this);
		this.onNewPropertyAdded = this.onNewPropertyAdded.bind(this);
	}

	public componentDidMount() {
		const cameraElement = this.cameraElement.current;

		window.addEventListener('orientationchange', this.renderFrame);

		cameraElement.addEventListener('onUpdate', this.renderFrame);
		cameraElement.addEventListener('afterResize', this.resetRoomIconsPosition);

		setTimeout(() => {
			this.renderFrame();
		}, 500);

		this.loadTextures()
			.then(this.initRoom.bind(this))
			.catch(error => console.log('load textures / init room error', error, console.trace()));

		hotspotAddedEvent.subscribe({
			id: this.propertyAddedEventId,
			callback: this.onNewPropertyAdded,
		});
	}

	public componentWillUnmount() {
		hotspotAddedEvent.unsubscribe(this.propertyAddedEventId);
	}

	public render() {
		return (
			<div ref={this.editSpaceSphere} className="edit-space">
				<a-scene ref={this.globeScene} vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: true">
					<a-sky src={this.state.sky} radius="512"></a-sky>
					<a-entity ref={this.cameraElement} svr-camera camera="fov:65;zoom:1;near:1;far:1024" position="0 0 0.0001">
					</a-entity>
				</a-scene>

				{this.getItems().map((item, key) => {
					return (
						<RoomIcon
							key={item.getId()}
							ref={item => this.roomIconComponentList[key] = item}
							roomProperty={item}
							onIconDragEnd={this.onMoveEnd}>
						</RoomIcon>
					);
				})}
			</div>
		);
	}

	private onNewPropertyAdded(data) {
		const newLocation: Vector2 = Vector2.build();
		const denormalizedPosition: Vector2 = denormalizePosition(newLocation.getX(), newLocation.getY());
		const normalPosition: Vector2 = this.transformScreenPositionTo3dNormal(denormalizedPosition.getX(), denormalizedPosition.getY());
		const activeRoomId: string = sceneInteractor.getActiveRoomId();

		sceneInteractor
			.getPropertyById(activeRoomId, data.id)
			.setLocation(normalPosition);

		setTimeout(() => {
			this.roomIconComponentList.forEach(roomIcon => this.updateRoomIconPosition(roomIcon));
		});
	}

	private getItems() {
		const roomId: string = sceneInteractor.getActiveRoomId();
		return sceneInteractor.getRoomProperties(roomId);
	}

	private renderFrame() {
		this.camera = this.camera || this.cameraElement.current.object3D.children[0];
		this.roomIconComponentList.forEach(roomIcon => this.updateRoomIconPosition(roomIcon));
	}

	private resetRoomIconsPosition() {
		/*this.roomIconComponentList.forEach((roomIcon) => {
			roomIcon.setPixelLocation(99999, 99999);
		});*/
		this.renderFrame();
		// .catch(error => console.log('edit-sphere resize error', error));
	}

	loadTextures(): Promise<ImageData> {
		const imageList = sceneInteractor.getRoomIds()
			.map(roomId => sceneInteractor.getRoomById(roomId))
			.filter(room => room.hasBackgroundImage() && !room.getBackgroundIsVideo())
			.map(room => {
				let imagePath = room.getBackgroundImageBinaryData();
				if (imagePath.changingThisBreaksApplicationSecurity) {
					imagePath = imagePath.changingThisBreaksApplicationSecurity;
				}
				return new AssetModel(room.getId(), room.getFileName(), imagePath);
			});
		return assetInteractor.loadTextures(imageList);
	}

	initRoom() {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		const sphereTexture = assetInteractor.getTextureById(roomId);

		this.setState({
			sky: sphereTexture.image.currentSrc
		});

		/*this.room = room;
		this.backgroundAudio = room.getBackgroundAudioBinaryFileData(true);
		this.narrationAudio = room.getNarrationIntroBinaryFileData(true);*/

		/*setTimeout(() => {
			this.render();
		}, 1000);*/

		setTimeout(() => {
			// this.cameraElement.nativeElement.emit('onResize')
		})

	}

	updateRoomIconPosition(roomIcon) {
		const location = roomIcon.getLocation();

		const coordinatePosition = getCoordinatePosition(location.getX(), location.getY());
		const positionCameraDotProd: number = coordinatePosition.dot(this.camera.getWorldDirection(new THREE.Vector3()));

		// exit function if the camera is pointed in the opposite direction as the icon
		if (positionCameraDotProd < 0) {
			roomIcon.setPixelLocation(99999, 99999);
			return;
		}

		const screenPosition = getScreenProjection(coordinatePosition, this.camera, this.globeScene.current.renderer.context);
		roomIcon.setPixelLocationWithBuffer(screenPosition.x, screenPosition.y);
	}

	public onMoveEnd($event) {
		const normalPosition: Vector2 = this.transformScreenPositionTo3dNormal($event.x, $event.y);
		$event.setIconLocation(normalPosition.getX(), -normalPosition.getY());
		this.render();
	}

	transformScreenPositionTo3dNormal(x: number, y: number) {
		const normalPosition: Vector2 = getNormalizedPositionFromScreenPosition(
			x, y, this.camera, this.globeScene.current.renderer.context);
		return normalPosition;
	}
}

// get xyz position from absolute screen position
function getWorldPosition(screenPositionX: number, screenPositionY: number, camera: THREE.PerspectiveCamera, context: any) {
	const width: number = context.canvas.width;
	const height: number = context.canvas.height;
	const x: number = (screenPositionX / width) * 2 - 1;
	const y: number = -(screenPositionY / height) * 2 + 1;
	const vector: THREE.Vector3 = new THREE.Vector3(x, y, 0.5);
	return vector.unproject(camera);
}

// get absolute screen position from xyz position
function getScreenProjection(position: THREE.Vector3, camera: THREE.PerspectiveCamera, context: any) {
	const halfWidth = window.innerWidth / 2;
	const halfHeight = window.innerHeight / 2;

	const proxyObject = new THREE.Object3D();
	proxyObject.position.set(position.x, position.y, position.z);
	proxyObject.updateMatrixWorld(true);

	const vector = new THREE.Vector3();
	vector.setFromMatrixPosition(proxyObject.matrixWorld);
	vector.project(camera);

	return {
		x: vector.x * halfWidth + halfWidth,
		y: -(vector.y * halfHeight) + halfHeight,
	};
}

function getNormalizedPositionFromScreenPosition(screenX: number, screenY: number, camera: THREE.PerspectiveCamera, context: any): Vector2 {
	const worldPosition: THREE.Vector3 = getWorldPosition(screenX, screenY, camera, context);
	const spherical = coordinateToSpherical(worldPosition.x, worldPosition.y, worldPosition.z);
	let x: number = spherical.theta / Math.PI * 180;
	let y: number = spherical.phi / Math.PI * 180 - 90;
	if (x < 0) {
		x += 360;
	}
	x = clamp(x, 0, 360);
	y = clamp(y, -90, 90);
	return new Vector2(x, y);
}