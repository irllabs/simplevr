import { Injectable } from '@angular/core';
import { Audio } from 'data/scene/entities/audio';
import { Door } from 'data/scene/entities/door';
import { Image } from 'data/scene/entities/image';
import { Link } from 'data/scene/entities/link';
import { Narrator } from 'data/scene/entities/narrator';

import { Room } from 'data/scene/entities/room';
import { Text } from 'data/scene/entities/text';
import { Universal } from 'data/scene/entities/universal';
import { Vector2 } from 'data/scene/entities/vector2';
import { Video } from 'data/scene/entities/video';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';
import { reverbList } from 'data/scene/values/reverbList';
import { resizeImage } from 'data/util/imageResizeService';

import { BACKGROUND_THUMBNAIL, DEFAULT_FILE_NAME, DEFAULT_IMAGE_PATH, DEFAULT_VOLUME } from 'ui/common/constants';

@Injectable()
export class PropertyBuilder {
  public setBaseProperties(jsonData: any, roomProperty: RoomProperty): RoomProperty {
    const builtRoomProperty: RoomProperty = roomProperty
      .setId(jsonData.uuid)
      .setName(jsonData.name)
      .setTimestamp(jsonData.time);

    if (jsonData.vect) {
      const location: Vector2 = deserializeLocationVector(jsonData.vect);

      builtRoomProperty.setLocation(location);
    }
    return builtRoomProperty;
  }

  text(name: string, body: string): Text {
    const text: Text = new Text();

    text.setName(name);
    text.body = body;

    return text;
  }

  textFromJson(textJson: any): Text {
    const text: Text = <Text> this.setBaseProperties(textJson, new Text());

    text.body = textJson.file;

    return text;
  }

  video(name: string, body: string): Video {
    const video: Video = new Video();

    video.setName(name);
    video.body = body;

    return video;
  }

  universal(name: string, textContent: string): Universal {
    const universal: Universal = new Universal();

    universal.setName(name);
    universal.textContent = textContent;
    universal.setAudioContent(DEFAULT_FILE_NAME, null, DEFAULT_VOLUME);
    universal.setImageContent(DEFAULT_FILE_NAME, null);

    return universal;
  }

  universalFromJson(universalJson: any, imageBinaryFileData: string, audioBinaryFileData: string): Universal {
    const universal: Universal = <Universal> this.setBaseProperties(universalJson, new Universal());

    // text
    universal.textContent = universalJson.text;

    // image
    let imageFileName = DEFAULT_FILE_NAME;

    if (universalJson.hasOwnProperty('imageFile')) imageFileName = decodeURIComponent(universalJson.imageFile);
    if (universalJson.hasOwnProperty('remoteImageFile')) {
      universal.imageContent.setRemoteFileName(universalJson.remoteFile);
    }

    universal.setImageContent(imageFileName, imageBinaryFileData);

    // audio
    let audioFileName = DEFAULT_FILE_NAME;

    if (universalJson.hasOwnProperty('audioFile')) audioFileName = decodeURIComponent(universalJson.audioFile);
    if (universalJson.hasOwnProperty('remoteAudioFile')) {
      universal.audioContent.setRemoteFileName(universalJson.remoteAudioFile);
    }

    universal.setAudioContent(audioFileName, audioBinaryFileData);
    universal.loop = universalJson.loop;
    universal.volume = universalJson.volume;

    return universal;
  }

  link(name: string, body: string): Link {
    const link: Link = new Link();

    link.setName(name);
    link.body = body;

    return link;
  }

  linkFromJson(linkJson: any): Link {
    const link: Link = <Link> this.setBaseProperties(linkJson, new Link());

    link.body = linkJson.file;

    return link;
  }

  audio(name: string): Audio {
    const audio: Audio = new Audio();

    audio.setName(name);
    audio.setFileData(DEFAULT_FILE_NAME, DEFAULT_VOLUME, null);

    return audio;
  }

  audioFromJson(audioJson: any, binaryFileData: string): Audio {
    const audio: Audio = <Audio> this.setBaseProperties(audioJson, new Audio());
    let fileName = decodeURIComponent(audioJson);

    if (audioJson.hasOwnProperty('file')) fileName = audioJson.file;
    if (audioJson.hasOwnProperty('remoteFile')) {
      audio.setRemoteFileName(audioJson.remoteFile);
    }

    const volume = audioJson.volume;

    audio.setFileData(fileName, volume, binaryFileData);

    return audio;
  }

  image(name: string): Image {
    const image: Image = new Image();

    image.setName(name);
    image.setFileData(DEFAULT_FILE_NAME, null);

    return image;
  }

  imageFromJson(imageJson: any, binaryFileData: string): Image {
    const image: Image = <Image> this.setBaseProperties(imageJson, new Image());
    const fileName = decodeURIComponent(imageJson.file);

    image.setFileData(fileName, binaryFileData);

    if (imageJson.hasOwnProperty('remoteFile')) {
      image.setRemoteFileName(imageJson.remoteFile);
    }

    return image;
  }

  door(roomId: string, name: string): Door {
    const door: Door = new Door();
    door.setRoomId(roomId);
    door.setName(name);
    return door;
  }

  doorFromJson(doorJson: any): Door {
    const door: Door = <Door> this.setBaseProperties(doorJson, new Door());
    door.setRoomId(doorJson.file);
    door.setNameIsCustom(doorJson.nameIsCustom || false);
    door.setAutoTime(doorJson.autoTime !== undefined ? doorJson.autoTime : 0);
    return door;
  }

  roomFromJson(roomJson: any, binaryFileData: string, thumbnail: string, backgroundAudioUrl): Room {
    const room: Room = <Room> this.setBaseProperties(roomJson, new Room());
    let imageName = decodeURIComponent(roomJson.image);
    let remoteFileName = '';
    if (roomJson.image.hasOwnProperty('file')) {
      imageName = roomJson.image.file;
    }
    if (roomJson.image.hasOwnProperty('remoteFile')) {
      remoteFileName = roomJson.image.remoteFile;
    }
    const imageData = binaryFileData || DEFAULT_IMAGE_PATH;
    room.setFileData(imageName, imageData, remoteFileName);

    if (thumbnail) {
      if (roomJson.thumbnail.hasOwnProperty('remoteFile') && roomJson.thumbnail.remoteFile) {
        room.setThumbnail(BACKGROUND_THUMBNAIL, thumbnail, roomJson.thumbnail.remoteFile);
      } else {
        room.setThumbnail(BACKGROUND_THUMBNAIL, thumbnail);
      }
    }
    else if (!thumbnail && binaryFileData) {
      resizeImage(binaryFileData, 'projectThumbnail')
        .then(resizedImageData => {
          room.setThumbnail(BACKGROUND_THUMBNAIL, resizedImageData);
        })
        .catch(error => console.log('generate thumbnail error', error));
    }

    if (backgroundAudioUrl) {
      let fileName = roomJson.ambient;
      let remoteFileName = '';
      if (roomJson.ambient.hasOwnProperty('file')) fileName = roomJson.ambient.file;
      if (roomJson.ambient.hasOwnProperty('remoteFile')) {
        remoteFileName = roomJson.ambient.remoteFile;
      }
      room.setBackgroundAudio(fileName, roomJson.bgVolume, backgroundAudioUrl, remoteFileName);
    }

    if (roomJson.front) {
      const location: Vector2 = deserializeLocationVector(roomJson.front);
      room.setLocation(location);
    }
    if (roomJson.video && roomJson.video.length > 0) {
      room.setBackgroundVideo('', roomJson.video);
    }

    room.setReverb(roomJson.reverb || reverbList[0]);

    return room;
  }

  room(name: string) {
    const room: Room = new Room();
    room.setName(name);
    room.setFileData(DEFAULT_FILE_NAME, DEFAULT_IMAGE_PATH);
    room.setThumbnail(DEFAULT_FILE_NAME, DEFAULT_IMAGE_PATH);
    return room;
  }

  narratorFromJson(narratorJson, introAudioFile, returnAudioFile): Narrator {
    const narrator = new Narrator();
    if (introAudioFile) {
      let fileName = decodeURIComponent(narratorJson.intro);
      let remoteFileName = '';
      if (narratorJson.intro.hasOwnProperty('file')) fileName = narratorJson.intro.file;
      if (narratorJson.intro.hasOwnProperty('remoteFile')) {
        remoteFileName = narratorJson.intro.remoteFile;
      }
      const volume = narratorJson.volume;
      narrator.setIntroAudio(fileName, volume, introAudioFile, remoteFileName);
    }
    if (returnAudioFile) {
      let fileName = decodeURIComponent(narratorJson.reprise);
      let remoteFileName = '';
      if (narratorJson.reprise.hasOwnProperty('file')) fileName = narratorJson.reprise.file;
      if (narratorJson.reprise.hasOwnProperty('remoteFile')) {
        remoteFileName = narratorJson.reprise.remoteFile;
      }
      //const volume = narratorJson.volume;
      narrator.setReturnAudio(fileName, returnAudioFile, remoteFileName);
    }
    return narrator;
  }

}

function deserializeLocationVector(locationVector: string): Vector2 {
  const vectorRegex = /[<〈]([\de\-\.]+),([\de\-\.]+)[〉>]/;
  const [locationString, matchX, matchY]: string[] = locationVector.match(vectorRegex);
  const x: number = parseFloat(matchX);
  const y: number = parseFloat(matchY);
  return new Vector2(x, y);
}
