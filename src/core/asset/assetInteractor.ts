import { Injectable } from '@angular/core';

import { ApiService } from 'data/api/apiService';
import assetManager from 'data/asset/assetManager';
import { Texture } from 'three';

@Injectable()
export class AssetInteractor {
  constructor(
    private apiService: ApiService,
  ) {
  }

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
