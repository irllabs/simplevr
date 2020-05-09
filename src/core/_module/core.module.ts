// external imports
import { NgModule } from '@angular/core';
import { AdminInteractor } from 'core/admin/adminInteractor';
import { AssetInteractor } from 'core/asset/assetInteractor';
import { ChatInteractor } from 'core/chat/chatInteractor';
import { GroupInteractor } from 'core/group/groupInteractor';
import { ProjectInteractor } from 'core/project/projectInteractor';
import { CameraInteractor } from 'core/scene/cameraInteractor';
// internal module imports
import { SearchInteractor } from 'core/search/searchInteractor';
import { StorageInteractor } from 'core/storage/storageInteractor';
import { UserInteractor } from 'core/user/userInteractor';
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
    StorageInteractor,
    UserInteractor,
    ProjectInteractor,
    AssetInteractor,
    VideoInteractor,
    SearchInteractor,
    AdminInteractor,
    GroupInteractor,
    ChatInteractor,
  ],
})
export class CoreModule {
}
