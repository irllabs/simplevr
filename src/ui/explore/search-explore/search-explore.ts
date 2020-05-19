import { Component } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';

import projectInteractor from 'core/project/projectInteractor';
import { SearchInteractor } from 'core/search/searchInteractor';
import shareableLoader from 'ui/common/shareable-loader';

@Component({
  selector: 'search-explore',
  styleUrls: ['./search-explore.scss'],
  templateUrl: './search-explore.html',
})
export class SearchExplore {

  private searchTerm: string = '';
  private matchingResults = [];
  private searchLabel = '';

  constructor(
    private searchInteractor: SearchInteractor,
    public afStorage: AngularFireStorage,
  ) {
  }

  getSearchModelProperty(): string {
    return '';
  }

  setSearchViewModel($event) {
    this.searchTerm = $event.text;
  }

  onSearchClick($event) {
    if (!this.searchTerm) {
      return;
    }

    const cleansedQuery = this.searchTerm
      .split(',')
      .map(item => item.trim())
      .join(',');

    this.searchPublicProjects(cleansedQuery);
    this.searchLabel = this.searchTerm;
  }

  openProject(projectUrl: string) {
    shareableLoader.openDecodedProject(projectUrl);
  }

  searchPublicProjects(query: string) {
    this.searchInteractor.searchPublicProjects(query)
      .subscribe(
        projects => this.matchingResults = projects,
        error => console.log('error', error),
      );
  }

  showNoResults(): boolean {
    return this.searchLabel && !this.matchingResults.length;
  }

  getSearchResultTitle(): string {
    const numResults = this.matchingResults.length;
    const pluralize = numResults > 1 ? 's' : '';

    return `${numResults} search result${pluralize} for`;
  }

}
