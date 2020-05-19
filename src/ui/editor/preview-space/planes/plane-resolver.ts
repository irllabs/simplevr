import assetInteractor from 'core/asset/assetInteractor';
import { Audio } from 'data/scene/entities/audio';
import { Door } from 'data/scene/entities/door';
import { Image } from 'data/scene/entities/image';
import { Link } from 'data/scene/entities/link';
import { Text } from 'data/scene/entities/text';
import { Universal } from 'data/scene/entities/universal';
import { Video } from 'data/scene/entities/video';
import * as THREE from 'three';
import { RoomPropertyTypeService } from '../../util/roomPropertyTypeService';
import AudioPlane from './audio-plane';
import DoorPlane from './door-plane';
import ImagePlane from './image-plane';
import LinkPlane from './link-plane';
import TextPlane from './text-plane';
import UniversalPlane from './universal-plane';
import VideoPlane from './video-plane';


export default class PlaneResolver {
  static resolve(roomProperty: any, camera: THREE.PerspectiveCamera, services: any) {
    switch (RoomPropertyTypeService.getTypeString(roomProperty)) {
      case 'image': {
        return new ImagePlane(roomProperty as Image, camera);
      }
      case 'text': {
        return new TextPlane(roomProperty as Text, camera);
      }
      case 'video': {
        return new VideoPlane(roomProperty as Video, camera);
      }
      case 'universal': {
        const plane = new UniversalPlane(roomProperty as Universal, camera);

        plane.init();

        return plane;
      }
      case 'link': {
        return new LinkPlane(roomProperty as Link, camera);
      }
      case 'audio': {
        const plane = new AudioPlane(roomProperty as Audio, camera);

        plane.init();

        return plane;
      }
      case 'door': {
        const plane = new DoorPlane(roomProperty as Door, camera);

        plane.init(services.position, services.goToRoom);

        return plane;
      }
    }
  }
}
