import { Component, NgZone, ViewChild, ViewChildren, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AssetInteractor, AssetModel } from 'core/asset/assetInteractor';
import { CameraInteractor } from 'core/scene/cameraInteractor';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Vector2 } from 'data/scene/entities/vector2';
import { Room } from 'data/scene/entities/room';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';
import { Subscription } from 'rxjs/Subscription';
import * as THREE from 'three';
import eventBus, { EventType } from 'ui/common/event-bus';
import { RoomIcon } from 'ui/editor/edit-space/room-icon/room-icon/room-icon';
import { Video3D } from 'ui/editor/edit-space/video3D';

import { Hotspot } from 'ui/editor/interfaces/hotspot';
import { CombinedHotspotUtil } from 'ui/editor/util/combinedHotspotUtil';
import {
	clamp,
	coordinateToSpherical,
	denormalizePosition,
	getCoordinatePosition,
} from 'ui/editor/util/iconPositionUtil';


@Component({
	selector: 'edit-space-sphere',
	styleUrls: ['./edit-space-sphere.scss'],
	templateUrl: './edit-space-sphere.html',
})
export class EditSpaceSphere {

	@ViewChildren('roomIcon') roomIconComponentList: RoomIcon[];
	@ViewChild('editSpaceSphere') editSpaceSphere;
	@ViewChild('globeScene') globeScene;
	@ViewChild('cameraElement') cameraElement;

	private renderer: THREE.WebGLRenderer;
	private svrControls: any;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private sphereMesh: THREE.Mesh;
	private subscriptions: Set<Subscription> = new Set<Subscription>();
	private video3D: Video3D;
	private animationRequest: number;

	public room: Room;
	private backgroundAudio: any;
	private narrationAudio: any;

	public sky: any;

	constructor(
		private cameraInteractor: CameraInteractor,
		private ngZone: NgZone,
		private combinedHotspotUtil: CombinedHotspotUtil,
		private assetInteractor: AssetInteractor,
		private router: Router,
	) {

	}

	ngOnInit() {
		if (metaDataInteractor.projectIsEmpty()) {
			this.router.navigate(['/editor', { outlets: { 'view': 'flat' } }]);
		}
	}

	ngAfterViewInit() {
		this.render = this.render.bind(this);
		this.resetRoomIconsPosition = this.resetRoomIconsPosition.bind(this);

		const cameraElement = this.cameraElement.nativeElement;
		const runContext = this.ngZone.runOutsideAngular.bind(this.ngZone);

		cameraElement.runContext = runContext

		runContext(()=>{
			window.addEventListener('orientationchange', this.render);

			cameraElement.addEventListener('onUpdate', this.render)
			cameraElement.addEventListener('afterResize', this.resetRoomIconsPosition)
		})

		setTimeout(() => {
			this.render();
		}, 500);

		this.subscribeToEvents();
		this.loadTextures()
			.then(this.initRoom.bind(this))
			.catch(error => console.log('load textures / init room error', error, console.trace()));
	}

	ngOnDestroy() {
		//Manually turn off aframe render cycle
		this.globeScene.nativeElement.renderer.dispose();
		this.subscriptions.forEach(subscription => subscription.unsubscribe());

		if (!!this.video3D) {
			this.video3D.destroy();
		}
	}

	initRoom() {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		const sphereTexture = this.assetInteractor.getTextureById(roomId);

		this.sky = sphereTexture.image.currentSrc;

		this.room = room;
		this.backgroundAudio = room.getBackgroundAudioBinaryFileData(true);
		this.narrationAudio = room.getNarrationIntroBinaryFileData(true);

		/*setTimeout(() => {
			this.render();
		}, 1000);*/

		setTimeout(() => {
			this.cameraElement.nativeElement.emit('onResize')
		})

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
		return this.assetInteractor.loadTextures(imageList);
	}

	protected subscribeToEvents() {

		const onPropertySelect: Subscription = eventBus.getObservable(EventType.SELECT_PROPERTY)
			.subscribe(
			observedData => {
				const propertyId: string = observedData.propertyId;
				const isNewProperty: string = observedData.isNewProperty;
				const roomIconList: RoomIcon[] = this.roomIconComponentList
					.filter(roomIcon => roomIcon.roomProperty.getId() !== propertyId);
				if (isNewProperty) {
					this.onNewPropertyAdded(propertyId);
				}
				this.combinedHotspotUtil.setRoomPropertyList(roomIconList);
			},
			error => console.log('error', error),
		);

		const onRoomSelect: Subscription = eventBus.getObservable(EventType.SELECT_ROOM)
			.subscribe(
			observedData => {
				if (observedData.isNewProperty) {
					this.initRoom();
					return;
				}
				this.loadTextures()
					.then(this.initRoom.bind(this))
					.catch(error => console.log('onRoomSelect', error));
			},
			error => console.log('error', error),
		);

		this.subscriptions.add(onRoomSelect);
		this.subscriptions.add(onPropertySelect);
	}

	private onNewPropertyAdded(propertyId: string) {
		const newLocation: Vector2 = Vector2.build();
		const denormalizedPosition: Vector2 = denormalizePosition(newLocation.getX(), newLocation.getY());
		const normalPosition: Vector2 = this.transformScreenPositionTo3dNormal(denormalizedPosition.getX(), denormalizedPosition.getY());
		const activeRoomId: string = sceneInteractor.getActiveRoomId();

		sceneInteractor
			.getPropertyById(activeRoomId, propertyId)
			.setLocation(normalPosition);

		setTimeout(() => {
			this.roomIconComponentList.forEach(roomIcon => this.updateRoomIconPosition(roomIcon));
		});
	}

	render() {
		this.camera = this.camera || this.cameraElement.nativeElement.object3D.children[0];
		this.roomIconComponentList.forEach(roomIcon => this.updateRoomIconPosition(roomIcon));
	}

	private onMouseDown(event) {
		this.render();
	}

	public onMoveEnd($event) {
		const normalPosition: Vector2 = this.transformScreenPositionTo3dNormal($event.x, $event.y);
		$event.setIconLocation(normalPosition.getX(), -normalPosition.getY());
		this.render();
	}

	resetRoomIconsPosition() {
		this.roomIconComponentList.forEach((roomIcon) => {
			roomIcon.setPixelLocation(99999, 99999);
		});
		this.render();
		// .catch(error => console.log('edit-sphere resize error', error));
	}

	updateRoomIconPosition(roomIcon: Hotspot) {
		const location: Vector2 = roomIcon.getLocation();

		const coordinatePosition = getCoordinatePosition(location.getX(), location.getY());
		const positionCameraDotProd: number = coordinatePosition.dot(this.camera.getWorldDirection(new THREE.Vector3()));

		// exit function if the camera is pointed in the opposite direction as the icon
		if (positionCameraDotProd < 0) {
			roomIcon.setPixelLocation(99999, 99999);
			return;
		}

		const screenPosition = getScreenProjection(coordinatePosition, this.camera, this.globeScene.nativeElement.renderer.context);
		roomIcon.setPixelLocationWithBuffer(screenPosition.x, screenPosition.y);
	}

	getItems(): RoomProperty[] {
		const roomId: string = sceneInteractor.getActiveRoomId();
		return sceneInteractor.getRoomProperties(roomId);
	}

	roomHasBackgroundImage(): boolean {
		const roomId: string = sceneInteractor.getActiveRoomId();
		return sceneInteractor.roomHasBackgroundImage(roomId);
	}

	transformScreenPositionTo3dNormal(x: number, y: number) {
		const normalPosition: Vector2 = getNormalizedPositionFromScreenPosition(
			x, y, this.camera, this.globeScene.nativeElement.renderer.context);
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
