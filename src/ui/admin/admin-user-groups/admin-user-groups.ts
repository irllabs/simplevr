import { Component } from '@angular/core';
import { Router } from '@angular/router';
import adminInteractor from 'core/admin/adminInteractor';
import projectInteractor from 'core/project/projectInteractor';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import userInteractor from 'core/user/userInteractor';
import { ERROR_OPENING_PROJECT, GROUP_TYPE, SERVER_ERROR } from 'ui/common/constants';

import eventBus from 'ui/common/event-bus';

@Component({
  selector: 'admin-user-groups',
  styleUrls: ['./admin-user-groups.scss'],
  templateUrl: './admin-user-groups.html',
})
export class AdminUserGroups {

  private projects = {};

  constructor(
    private router: Router,
  ) {
  }

  ngAfterViewInit() {
    if (!this.hasPermission()) {
      return;
    }

    const userGroups = this.getUserGroups();
    userGroups.forEach(group => this.fetchProjectsByGroup(group.id));
  }

  private hasPermission(): boolean {
    return userInteractor.isLoggedIn() && adminInteractor.isAdmin();
  }

  private getUserGroups(): any[] {
    return adminInteractor.getAdminGroups();
  }

  private openProject(project) {
    eventBus.onStartLoading();
    projectInteractor.openProject(project)
      .then(
        () => {
          sceneInteractor.setActiveRoomId(null);
          eventBus.onSelectRoom(null, false);
          eventBus.onStopLoading();
          metaDataInteractor.setIsReadOnly(true);
          this.router.navigateByUrl('/editor');
        },
        () => {
          eventBus.onStopLoading();
          eventBus.onModalMessage(ERROR_OPENING_PROJECT, SERVER_ERROR);
        },
      );
  }

  private async fetchProjectsByGroup(groupId: string) {
    const projectList = await adminInteractor.getAllProjectsInGroup(groupId);
    this.projects[groupId] = projectList.results;
  }

  private getGroupProjects(groupId: string) {
    return this.projects[groupId]
      && this.projects[groupId].projects_from_users || [];
  }

  private getExternalProjects(groupId: string) {
    return this.projects[groupId] &&
      this.projects[groupId].external_projects || [];
  }

  private async onCheckboxChange($event, groupId: string, projectId: string, project: any) {
    await adminInteractor.setProjectInGroup(groupId, projectId, $event.value, GROUP_TYPE.FEATURED);
    project.isFeatured = $event.value;
  }

  private async removeExternalProject(groupId: string, projectId: string) {
    const response = await adminInteractor.setProjectInGroup(groupId, projectId, false, GROUP_TYPE.EXTERNAL)

    this.projects[groupId].external_projects = this.projects[groupId].external_projects
      .filter(project => project.projectId !== projectId);

  }

  onAddProject($event) {
    const listContainsProject = this.projects[$event.groupId].external_projects
      .some(project => project.projectId === $event.project.id);
    if (!listContainsProject) {
      this.projects[$event.groupId].external_projects.push($event.project);
    }
  }

}
