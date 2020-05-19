import apiService from 'data/api/apiService';
import assetManager from 'data/asset/assetManager';
import { Texture } from 'three';

class AssetInteractor {
  loadTextures(imageDataList: AssetModel[]): Promise<any> {
    return assetManager.loadTextures(imageDataList);
  }

  loadAudioBuffers(audioDataList: AssetModel[]): Promise<any> {
    return assetManager.loadAudioBuffers(audioDataList);
  }

  getTextureById(id: string): Texture {
    return assetManager.getTextureById(id);
  }

  getAudioBufferById(id: string): AudioBuffer {
    return assetManager.getAudioBufferById(id);
  }
}
export default new AssetInteractor();

export class AssetModel {
  public id: string;
  public fileName: string;
  public filePath: string;
  public force: boolean; // if force is true this asset will be reloaded by textureLoader

  constructor(id: string, fileName: string, filePath: string) {
    this.id = id;
    this.fileName = fileName;
    this.filePath = filePath;
  }
}
