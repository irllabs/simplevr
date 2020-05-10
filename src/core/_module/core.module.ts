// external imports
import { NgModule } from '@angular/core';
import { AssetInteractor } from 'core/asset/assetInteractor';
import { ChatInteractor } from 'core/chat/chatInteractor';
import { GroupInteractor } from 'core/group/groupInteractor';
import { CameraInteractor } from 'core/scene/cameraInteractor';
// internal module imports
import { SearchInteractor } from 'core/search/searchInteractor';
import { VideoInteractor } from 'core/video/videoInteractor';
// project module imports
import { DataModule } from 'data/_module/data.module';

@NgModule({
  declarations: [],
  imports: [
    DataModule,
  ],
  providers: [
    CameraInteractor,
    AssetInteractor,
    VideoInteractor,
    SearchInteractor,
    GroupInteractor,
    ChatInteractor,
  ],
})
export class CoreModule {
}
