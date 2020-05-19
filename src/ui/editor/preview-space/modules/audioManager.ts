import { Injectable } from '@angular/core';
import assetInteractor, { AssetModel } from 'core/asset/assetInteractor';

import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import audioPlayService from 'ui/editor/preview-space/modules/audioPlayService';

class AudioManager {

  private roomBgAudioMap: Map<String, Boolean> = new Map();
  private roomNarrationMap: Map<String, Boolean> = new Map();

  public checkAudioContextState() {
    audioPlayService.checkAudioContextState();
  }

  public isAudioContextSuspended() {
    return audioPlayService.isAudioContextSuspended();
  }

  public hasAutoplayAudio(roomId) {
    const room = sceneInteractor.getRoomById(roomId);
    const soundtrack = metaDataInteractor.getSoundtrack();

    if(soundtrack.hasAsset()) {
      return true;
    }

    if (room.getBackgroundAudioBinaryFileData()) {
      return true;
    }

    if (room.getNarrationIntroBinaryFileData()) {
      return true;
    }

    return false;
  }

  loadBuffers(): Promise<any> {
    const soundtrackAudio = [];
    const soundtrack = metaDataInteractor.getSoundtrack();
    if (soundtrack.getBinaryFileData()) {
      const soundtrackPath = soundtrack.getBinaryFileData().changingThisBreaksApplicationSecurity ?
        soundtrack.getBinaryFileData().changingThisBreaksApplicationSecurity : soundtrack.getBinaryFileData();
      soundtrackAudio.push(new AssetModel('soundtrack', soundtrack.getFileName(), soundtrackPath));
    }

    const backgroundAudios = sceneInteractor.getRoomIds()
      .map(roomId => sceneInteractor.getRoomById(roomId))
      .filter(room => {
        if (room.getBackgroundAudioBinaryFileData()) {
          this.roomBgAudioMap.set(room.getId(), true);
          return true;
        } else {
          this.roomBgAudioMap.set(room.getId(), false);
          return false;
        }
      })
      .map(room => {
        let bAudioPath = room.getBackgroundAudioBinaryFileData();
        if (bAudioPath.changingThisBreaksApplicationSecurity) {
          bAudioPath = bAudioPath.changingThisBreaksApplicationSecurity;
        }
        return new AssetModel(room.getId() + 'b', room.getBackgroundAudioFileName(), bAudioPath);

      });

    const narrationAudios = sceneInteractor.getRoomIds()
      .map(roomId => sceneInteractor.getRoomById(roomId))
      .filter(room => {
        if (room.getNarrationIntroBinaryFileData()) {
          this.roomNarrationMap.set(room.getId(), true);
          return true;
        } else {
          this.roomNarrationMap.set(room.getId(), false);
          return false;
        }
      })
      .map(room => {
        let nAudioPath = room.getNarrationIntroBinaryFileData();

        if (nAudioPath.changingThisBreaksApplicationSecurity) {
          nAudioPath = nAudioPath.changingThisBreaksApplicationSecurity;
        }
        return new AssetModel(room.getId() + 'n', room.getNarrationIntroFileName(), nAudioPath);
      });

    const hotspotAudios = sceneInteractor.getRoomIds()
      .map(roomId => sceneInteractor.getRoomById(roomId))
      .reduce((accumulator, room) => {
        const audioUniversalPropertyList = Array.from(room.getUniversal())
          .filter(universal => universal.audioContent.hasAsset())
          .map(universal => {
            const binaryFileData = universal.audioContent.getBinaryFileData();
            let audioDataUri;

            if (binaryFileData.changingThisBreaksApplicationSecurity) {
              audioDataUri = binaryFileData.changingThisBreaksApplicationSecurity;
            } else {
              audioDataUri = binaryFileData;
            }

            return new AssetModel(universal.getId(), universal.audioContent.getFileName(), audioDataUri);
          });

        accumulator = accumulator.concat(audioUniversalPropertyList);

        return accumulator;
      }, []);

    const audioList = soundtrackAudio
      .concat(backgroundAudios)
      .concat(narrationAudios)
      .concat(hotspotAudios);

    return assetInteractor.loadAudioBuffers(audioList);
  }

  stopAllAudio(includeSoundtrack: boolean) {
    audioPlayService.stopAll(includeSoundtrack);
  }

  playSoundtrack() {
    const soundtrack = metaDataInteractor.getSoundtrack();

    if (soundtrack.hasAsset()) {
      audioPlayService.playSoundtrack('soundtrack', soundtrack.getVolume());
    }
  }

  playBackgroundAudio() {
    if (this.roomBgAudioMap.get(sceneInteractor.getActiveRoomId())) {
      const BackgroundAudioId: string = sceneInteractor.getActiveRoomId() + 'b';
      audioPlayService.playBgAudio(BackgroundAudioId);
    }
  }

  playNarration() {
    if (this.roomNarrationMap.get(sceneInteractor.getActiveRoomId())) {
      const narrationId: string = sceneInteractor.getActiveRoomId() + 'n';

      audioPlayService.playNarrationAudio(narrationId);
    }
  }
}
export default new AudioManager();