// external imports
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AssetService } from 'data/asset/assetService';
import { SocialAuthenticationService } from 'data/authentication/socialAuthenticationService';
import { ChatService } from 'data/chat/chatService';
import { CameraService } from 'data/scene/cameraService';

@NgModule({
  declarations: [],
  imports: [
    HttpModule,
  ],
  providers: [
    SocialAuthenticationService,
    AssetService,
    ChatService,
    CameraService,
  ],
})
export class DataModule {
}
