import { Injectable } from '@angular/core';

import apiService from 'data/api/apiService';

@Injectable()
export class GroupInteractor {
  getGroup(groupId: string) {
    return apiService.getGroup(groupId);
  }

}
