import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import projectInteractor from 'core/project/projectInteractor';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import userInteractor from 'core/user/userInteractor';
import { ERROR_OPENING_PROJECT, FORMAT_ERROR, SERVER_ERROR } from 'ui/common/constants';

import eventBus from 'ui/common/event-bus';
import { decodeParam } from 'ui/editor/util/publicLinkHelper';


@Injectable()
export class ShareableLoader {

  constructor(
    private router: Router,
  ) {
  }

  openDecodedProject(projectId) {
    eventBus.onStartLoading();
    projectInteractor.openPublicProject(projectId)
      .then(
        () => {
          const homeRoomID = sceneInteractor.getHomeRoomId();
          sceneInteractor.setActiveRoomId(homeRoomID);
          eventBus.onSelectRoom(null, false);
          eventBus.onStopLoading();
          metaDataInteractor.setIsReadOnly(true);
          //this.router.navigateByUrl('/editor');
          this.router.navigate(['editor', { outlets: { 'view': 'preview' } }], {queryParams: { share: 1 }});
        },
        error => {
          eventBus.onStopLoading();
          eventBus.onModalMessage(ERROR_OPENING_PROJECT, SERVER_ERROR);
        },
      );
  }

  openProject(shareableValue: string) {
    const params = decodeParam(shareableValue);

    if (params.message === 'ERROR') {
      eventBus.onModalMessage(ERROR_OPENING_PROJECT, FORMAT_ERROR);
      return;
    }

    this.openDecodedProject(params.data);
  }
}
