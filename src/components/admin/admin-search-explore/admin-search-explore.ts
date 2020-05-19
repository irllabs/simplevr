import { Component, EventEmitter, Output } from '@angular/core';
import adminInteractor from 'core/admin/adminInteractor';

import projectInteractor from 'core/project/projectInteractor';
import { SearchInteractor } from 'core/search/searchInteractor';
import userInteractor from 'core/user/userInteractor';
import { GROUP_TYPE } from 'ui/common/constants';
import shareableLoader from 'ui/common/shareable-loader';

@Component({
  selector: 'admin-search-explore',
  styleUrls: ['./admin-search-explore.scss'],
  templateUrl: './admin-search-explore.html',
})
export class AdminSearchExplore {

  @Output() onAddProject = new EventEmitter();

  private searchTerm: string = '';
  private matchingResults = [];
  private searchLabel = '';

  constructor(
    private searchInteractor: SearchInteractor,
  ) {
  }

  ngAfterViewInit() {
    if (!this.hasPermission()) {
      return;
    }
  }

  private hasPermission(): boolean {
    return userInteractor.isLoggedIn() && adminInteractor.isAdmin();
  }

  private getUserGroups(): any[] {
    return adminInteractor.getAdminGroups();
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

  onProjectClick(projectUrl: string) {
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
    const pluralize = numResults === 1 ? '' : 's';
    return `${numResults} search result${pluralize} for`;
  }

  async toggleProjectInGroup(project, group) {
    const projectId = project.projectId;
    const groupId = group.id;
    const response = await adminInteractor.setProjectInGroup(groupId, projectId, true, GROUP_TYPE.EXTERNAL)
    this.onAddProject.emit({ groupId, project });
  }
}
