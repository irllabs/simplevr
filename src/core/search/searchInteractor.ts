import { Injectable } from '@angular/core';

import projectInteractor from '../project/projectInteractor';

@Injectable()
export class SearchInteractor {

  searchPublicProjects(query: string) {
    return projectInteractor.searchPublicProjects(query);
  }

}
