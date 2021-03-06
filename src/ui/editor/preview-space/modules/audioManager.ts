import { Injectable } from '@angular/core';
import { AssetInteractor, AssetModel } from 'core/asset/assetInteractor';

import { MetaDataInteractor } from 'core/scene/projectMetaDataInteractor';
import { SceneInteractor } from 'core/scene/sceneInteractor';
import { AudioPlayService } from 'ui/editor/preview-space/modules/audioPlayService';

@Injectable()
export class AudioManager {

  private roomBgAudioMap: Map<String, Boolean> = new Map();
  private roomNarrationMap: Map<String, Boolean> = new Map();

  constructor(
    private metaDataInteractor: MetaDataInteractor,
    private sceneInteractor: SceneInteractor,
    private assetInteractor: AssetInteractor,
    private audioPlayService: AudioPlayService,
  ) {
  }

  public checkAudioContextState() {
    this.audioPlayService.checkAudioContextState();
  }

  public isAudioContextSuspended() {
    return this.audioPlayService.isAudioContextSuspended();
  }

  public hasAutoplayAudio(roomId) {
    const room = this.sceneInteractor.getRoomById(roomId);
    const soundtrack = this.metaDataInteractor.getSoundtrack();

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
    const soundtrack = this.metaDataInteractor.getSoundtrack();
    if (soundtrack.getBinaryFileData()) {
      const soundtrackPath = soundtrack.getBinaryFileData().changingThisBreaksApplicationSecurity ?
        soundtrack.getBinaryFileData().changingThisBreaksApplicationSecurity : soundtrack.getBinaryFileData();
      soundtrackAudio.push(new AssetModel('soundtrack', soundtrack.getFileName(), soundtrackPath));
    }

    const backgroundAudios = this.sceneInteractor.getRoomIds()
      .map(roomId => this.sceneInteractor.getRoomById(roomId))
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

    const narrationAudios = this.sceneInteractor.getRoomIds()
      .map(roomId => this.sceneInteractor.getRoomById(roomId))
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

    const hotspotAudios = this.sceneInteractor.getRoomIds()
      .map(roomId => this.sceneInteractor.getRoomById(roomId))
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

    return this.assetInteractor.loadAudioBuffers(audioList);
  }

  stopAllAudio(includeSoundtrack: boolean) {
    this.audioPlayService.stopAll(includeSoundtrack);
  }

  playSoundtrack() {
    const soundtrack = this.metaDataInteractor.getSoundtrack();

    if (soundtrack.hasAsset()) {
      this.audioPlayService.playSoundtrack('soundtrack', soundtrack.getVolume());
    }
  }

  playBackgroundAudio() {
    if (this.roomBgAudioMap.get(this.sceneInteractor.getActiveRoomId())) {
      const BackgroundAudioId: string = this.sceneInteractor.getActiveRoomId() + 'b';
      this.audioPlayService.playBgAudio(BackgroundAudioId);
    }
  }

  playNarration() {
    if (this.roomNarrationMap.get(this.sceneInteractor.getActiveRoomId())) {
      const narrationId: string = this.sceneInteractor.getActiveRoomId() + 'n';

      this.audioPlayService.playNarrationAudio(narrationId);
    }
  }
}
