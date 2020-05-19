import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import projectInteractor from 'core/project/projectInteractor';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import userInteractor from 'core/user/userInteractor';
import { ERROR_OPENING_PROJECT, FORMAT_ERROR, SERVER_ERROR } from 'ui/common/constants';

import eventBus from 'ui/common/event-bus';
import { decodeParam } from 'ui/editor/util/publicLinkHelper';
import openStoryEvent from 'root/events/open-story-event';
import openModalEvent from 'root/events/open-modal-event';

class ShareableLoader {

  openDecodedProject(projectId) {
    eventBus.onStartLoading();
    const promise = projectInteractor.openPublicProject(projectId)
      .then(
        () => {
          const homeRoomID = sceneInteractor.getHomeRoomId();
          sceneInteractor.setActiveRoomId(homeRoomID);
          eventBus.onSelectRoom(null, false);
          eventBus.onStopLoading();
          metaDataInteractor.setIsReadOnly(true);

          openStoryEvent.emit({
            preview: true,
          });
          //this.router.navigateByUrl('/editor');
          // this.router.navigate(['editor', { outlets: { 'view': 'preview' } }], {queryParams: { share: 1 }});
        },
        error => {
          eventBus.onStopLoading();
          eventBus.onModalMessage(ERROR_OPENING_PROJECT, SERVER_ERROR);
        },
      );

      openModalEvent.emit({
        bodyText: '',
        headerText: '',
        isMessage: false,
        modalType: 'loader',
        promise: promise,
      });
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
export default new ShareableLoader();
