import audioPlayService from '../modules/audioPlayService';
import BasePlane from './base-plane';


export default class AudioPlane extends BasePlane {
  private audioBufferSourceNode: AudioBufferSourceNode;

  protected _hasPlaneMesh: boolean = false;

  public init() {
  }

  public onActivated() {
    this.audioBufferSourceNode = audioPlayService.playHotspotAudio(this.prop.getId());
  }

  public onDeactivated() {
    if (this.audioBufferSourceNode) {
      audioPlayService.stopPlaying(this.audioBufferSourceNode);
    }
  }
}
