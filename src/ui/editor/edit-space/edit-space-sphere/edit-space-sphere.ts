import {Component, Input, Output, ViewChildren, ViewChild, NgZone, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import * as THREE from 'three';
import 'three/SvrControls';

import {Hotspot} from 'ui/editor/interfaces/hotspot';
import {EventBus, EventType} from 'ui/common/event-bus';
import {SceneInteractor} from 'core/scene/sceneInteractor';
import {CameraInteractor} from 'core/scene/cameraInteractor';
import {Room} from 'data/scene/entities/room';
import {Vector2} from 'data/scene/entities/vector2';
import {RoomProperty} from 'data/scene/interfaces/roomProperty';
import {RoomIcon} from 'ui/editor/edit-space/room-icon/room-icon/room-icon';
import {CombinedHotspotUtil} from 'ui/editor/util/combinedHotspotUtil';
import {AssetInteractor, AssetModel} from 'core/asset/assetInteractor';
import {MetaDataInteractor} from 'core/scene/projectMetaDataInteractor';
import {
  denormalizePosition,
  sphericalToCoordinate,
  coordinateToSpherical,
  getCoordinatePosition, clamp
} from 'ui/editor/util/iconPositionUtil';
import {buildScene, onResize} from 'ui/editor/util/threeUtil';
import {Video3D} from 'ui/editor/edit-space/video3D';


@Component({
  selector: 'edit-space-sphere',
  styleUrls: ['./edit-space-sphere.scss'],
  templateUrl: './edit-space-sphere.html'
})
export class EditSpaceSphere {

  @ViewChildren('roomIcon') roomIconComponentList: RoomIcon[];
  @ViewChild('editSpaceSphere') editSpaceSphere;
  @ViewChild('globeCanvas') globeCanvas;

  private renderer: THREE.WebGLRenderer;
  private svrControls: THREE.SvrControls;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private vrCamera: THREE.PerspectiveCamera;
  private sphereMesh: THREE.Mesh;
  private subscriptions: Set<Subscription> = new Set<Subscription>();
  private isDragging: boolean = false;
  private video3D: Video3D;
  private animationRequest: number;
  private windowWidth: number;
  private windowHeight: number;

  constructor(
    private sceneInteractor: SceneInteractor,
    private cameraInteractor: CameraInteractor,
    private eventBus: EventBus,
    private ngZone: NgZone,
    private combinedHotspotUtil: CombinedHotspotUtil,
    private assetInteractor: AssetInteractor,
    private metaDataInteractor: MetaDataInteractor,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.metaDataInteractor.projectIsEmpty()) {
      this.router.navigate(['/editor', {outlets: {'view': 'flat'}}]);
    }
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  ngAfterViewInit() {
    // this.initScene.call(this);
    this.initScene();
    this.subscribeToEvents();
    this.loadTextures()
      .then(this.initRoom.bind(this))
      .catch(error => console.log('load textures / init room error', error, console.trace()));
  }

  ngOnDestroy() {
    if (this.camera) {
      const cameraDirection = new THREE.Vector3(0, 0, -1);
      cameraDirection.applyQuaternion(this.camera.quaternion);
      this.cameraInteractor.setCameraDirection(cameraDirection.x, cameraDirection.y, cameraDirection.z);
    }
    cancelAnimationFrame(this.animationRequest);
    this.isDragging = false;
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    if (!!this.video3D) {
      this.video3D.destroy();
    }
  }

  private initScene() {
    const canvas = this.globeCanvas.nativeElement;
    const sceneComponents = buildScene();
    this.sphereMesh = sceneComponents.sphereMesh;
    this.camera = sceneComponents.camera;
    this.vrCamera = sceneComponents.vrCamera;
    this.scene = sceneComponents.scene;
    this.renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true, antialias: window.orientation == 'undefined'});
    this.svrControls = new THREE.SvrControls(this.camera, canvas, this.cameraInteractor.getCameraDirection());
  }

  initRoom() {
    const roomId = this.sceneInteractor.getActiveRoomId();
    const room = this.sceneInteractor.getRoomById(roomId);

    if (room.getBackgroundIsVideo()) {
      this.video3D = new Video3D();
      this.video3D.init(room.getBackgroundVideo())
        .then(texture => {
          this.sphereMesh.material = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
          this.onResize(null);
        })
        .catch(error => console.log('EditSpaceSphere.initVideo', error));
    }
    else {
      const sphereTexture = this.assetInteractor.getTextureById(roomId);
      this.sphereMesh.material = new THREE.MeshBasicMaterial({map: sphereTexture, side: THREE.BackSide});
      this.onResize(null);
    }

  }

  loadTextures(): Promise<ImageData> {
    const imageList = this.sceneInteractor.getRoomIds()
      .map(roomId => this.sceneInteractor.getRoomById(roomId))
      .filter(room => room.hasBackgroundImage() && !room.getBackgroundIsVideo())
      .map(room => {
        let imagePath = room.getBinaryFileData();
        if (imagePath.changingThisBreaksApplicationSecurity) {
          imagePath = imagePath.changingThisBreaksApplicationSecurity;
        }
        return new AssetModel(room.getId(), room.getFileName(), imagePath);
      });
    return this.assetInteractor.loadTextures(imageList);
  }

  protected subscribeToEvents() {

    const onPropertySelect: Subscription = this.eventBus.getObservable(EventType.SELECT_PROPERTY)
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
        error => console.log('error', error)
      );

    const onRoomSelect: Subscription = this.eventBus.getObservable(EventType.SELECT_ROOM)
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
        error => console.log('error', error)
      );

    const onMouseUp: Subscription = this.eventBus.getObservable(EventType.MOUSE_UP)
      .subscribe(
        event => {
          const activeRoomId = this.sceneInteractor.getActiveRoomId();
          const room = this.sceneInteractor.getRoomById(activeRoomId);
          this.isDragging = false;
        },
        error => console.log('error', error)
      );

    const windowResize: Subscription = this.eventBus.getObservable(EventType.WINDOW_RESIZE)
      .subscribe(
        windowDims => this.onResize(windowDims),
        error => console.log('EditSpaceFlat.onResize', error)
      );

    this.subscriptions.add(onRoomSelect);
    this.subscriptions.add(onMouseUp);
    this.subscriptions.add(onPropertySelect);
    this.subscriptions.add(windowResize);
  }

  private onNewPropertyAdded(propertyId: string) {
    const newLocation: Vector2 = Vector2.build();
    const denormalizedPosition: Vector2 = denormalizePosition(newLocation.getX(), newLocation.getY());
    const normalPosition: Vector2 = this.transformScreenPositionTo3dNormal(denormalizedPosition.getX(), denormalizedPosition.getY());
    const activeRoomId: string = this.sceneInteractor.getActiveRoomId();
    this.sceneInteractor
      .getPropertyById(activeRoomId, propertyId)
      .setLocation(normalPosition);

    setTimeout(() => {
      this.roomIconComponentList.forEach(roomIcon => this.updateRoomIconPosition(roomIcon));
    });
  }

  render() {
    this.svrControls.update();
    this.roomIconComponentList.forEach(roomIcon => this.updateRoomIconPosition(roomIcon));
    if (this.video3D) {
      this.video3D.attemptEditSpaceRender();
    }
    this.renderer.render(this.scene, this.camera);

    const shouldRender = this.isDragging || this.svrControls.hasMomentum();
    if (shouldRender) {
      this.ngZone.runOutsideAngular(() => {
        this.animationRequest = requestAnimationFrame(this.render.bind(this));
      });
    }
  }

  private onMouseDown(event) {
    this.isDragging = true;
    this.render();
  }

  private onMoveEnd($event) {
    const normalPosition: Vector2 = this.transformScreenPositionTo3dNormal($event.x, $event.y);
    $event.setIconLocation(normalPosition.getX(), -normalPosition.getY());
    this.render();
  }

  onResize(event) {
    onResize(this.camera, this.renderer)
      .then(() => {
        this.roomIconComponentList.forEach(roomIcon => roomIcon.setPixelLocation(99999, 99999));
        this.render();
      })
      .catch(error => console.log('edit-sphere resize error', error));
  }

  updateRoomIconPosition(roomIcon: Hotspot) {
    const location: Vector2 = roomIcon.getLocation();
    const coordinatePosition = getCoordinatePosition(location.getX(), location.getY());
    const positionCameraDotProd: number = coordinatePosition.dot(this.camera.getWorldDirection());

    // exit function if the camera is pointed in the opposite direction as the icon
    if (positionCameraDotProd < 0) return;

    const screenPosition = getScreenProjection(coordinatePosition, this.camera, this.renderer.context);
    roomIcon.setPixelLocationWithBuffer(screenPosition.x, screenPosition.y);
  }

  getItems(): RoomProperty[] {
    const roomId: string  = this.sceneInteractor.getActiveRoomId();
    return this.sceneInteractor.getRoomProperties(roomId);
  }

  roomHasBackgroundImage(): boolean {
    const roomId: string  = this.sceneInteractor.getActiveRoomId();
    return this.sceneInteractor.roomHasBackgroundImage(roomId);
  }

  transformScreenPositionTo3dNormal(x: number, y: number) {
    const normalPosition: Vector2 = getNormalizedPositionFromScreenPosition(
      x, y, this.camera, this.renderer.context);
    return normalPosition;
  }

}

// get xyz position from absolute screen position
function getWorldPosition(screenPositionX: number, screenPositionY: number, camera: THREE.PerspectiveCamera, context: any){
  const width: number = context.canvas.width;
  const height: number = context.canvas.height;
  const x: number = (screenPositionX / width) * 2 - 1;
  const y: number = -(screenPositionY / height) * 2 + 1;
  const vector: THREE.Vector3 = new THREE.Vector3(x, y, 0.5);
  return vector.unproject(camera);
}

// get absolute screen position from xyz position
function getScreenProjection(position: THREE.Vector3, camera: THREE.PerspectiveCamera, context: any) {
  const proxyObject: THREE.Object3D = new THREE.Object3D();
  const vector: THREE.Vector3 = new THREE.Vector3();
  const halfWidth: number = context.canvas.width / 2;
  const halfHeight: number = context.canvas.height / 2;

  proxyObject.position.set(position.x, position.y, position.z);
  proxyObject.updateMatrixWorld(true);
  vector.setFromMatrixPosition(proxyObject.matrixWorld);
  vector.project(camera);

  return {
    x: vector.x * halfWidth + halfWidth,
    y: -(vector.y * halfHeight) + halfHeight
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