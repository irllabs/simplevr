/*
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminInteractor } from 'core/admin/adminInteractor';
import { ProjectInteractor } from 'core/project/projectInteractor';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { UserInteractor } from 'core/user/userInteractor';
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
	private userInteractor: UserInteractor,
	private adminInteractor: AdminInteractor,
	private projectInteractor: ProjectInteractor,
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
	return this.userInteractor.isLoggedIn() && this.adminInteractor.isAdmin();
  }

  private openProject(project) {
	eventBus.onStartLoading();
	this.projectInteractor.openProject(project)
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

  private fetchProjectsByGroup(groupId: string) {
	return this.adminInteractor.getAllProjectsInGroup(groupId)
	  .subscribe(
		projectList => this.projects[groupId] = projectList.results,
		error => console.log('error', error),
	  );
  }

  private getGroupProjects(groupId: string) {
	return this.projects[groupId]
	  && this.projects[groupId].projects_from_users || [];
  }

  private getExternalProjects(groupId: string) {
	return this.projects[groupId] &&
	  this.projects[groupId].external_projects || [];
  }

  private onCheckboxChange($event, groupId: string, projectId: string, project: any) {
	this.adminInteractor.setProjectInGroup(groupId, projectId, $event.value, GROUP_TYPE.FEATURED)
	  .subscribe(
		response => project.isFeatured = $event.value,
		error => console.log('error', error),
	  );
  }

  private removeExternalProject(groupId: string, projectId: string) {
	this.adminInteractor.setProjectInGroup(groupId, projectId, false, GROUP_TYPE.EXTERNAL)
	  .subscribe(
		response => {
		  this.projects[groupId].external_projects = this.projects[groupId].external_projects
			.filter(project => project.projectId !== projectId);
		},
		error => console.log('error', error),
	  );
  }

  onAddProject($event) {
	const listContainsProject = this.projects[$event.groupId].external_projects
	  .some(project => project.projectId === $event.project.id);
	if (!listContainsProject) {
	  this.projects[$event.groupId].external_projects.push($event.project);
	}
  }

}
*/
import React from 'react';

import adminInteractor from 'core/admin/adminInteractor';
import projectInteractor from 'core/project/projectInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import projectMetaDataInteractor from 'core/scene/projectMetaDataInteractor';

import eventBus from 'ui/common/event-bus';

import { GROUP_TYPE, ERROR_OPENING_PROJECT, SERVER_ERROR } from 'ui/common/constants';

interface AdminUserGroupsState {
	userGroups: any[];
	projects: any;
}

export default class AdminUserGroups extends React.Component<{}, AdminUserGroupsState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			userGroups: [],
			projects: {},
		};
	}

	public componentDidMount() {
		const userGroups = this.getUserGroups();
		userGroups.forEach(group => this.fetchProjectsByGroup(group.id));
	}

	public render() {
		return (
			this.state.userGroups.length > 0 &&
			<div className='admin-user-groups'>
				<p>Groups you can edit:</p>
				{this.state.userGroups.map((userGroup) => {
					return (
						<div>
							<p className="story-collection__header">
								{userGroup.name}
							</p>
							{this.getGroupProjects(userGroup.id).length &&
							<p>
								Stories from users in {userGroup.name}:
							</p>}
							<div className="story-collection">
								{this.getGroupProjects(userGroup.id).map((project) => {
									return (
										<div className="story-collection__project">
											<p>
												<span className="text-bold">Project: </span>
												<span>{project.name}</span>
											</p>
											<p>
												<span className="text-bold">User: </span>
												<span>{project.user}</span>
											</p>
											<p>
												<span className="text-bold">Tags: </span>
												<span>{project.tags}</span>
											</p>
											{project.thumbnailUrl &&
											<img
												src={project.thumbnailUrl}
												onClick={() => {
													this.openProject(project);
												}}
												className="story-collection__thumbnail"
											/>}
											<div className="flex-row-start">
												
												<input
													type='checkbox'
													value={project.isFeatured}
													onChange={(event) => {
														this.onCheckboxChange(event, userGroup.id, project.projectId, project)
													}}>
												</input>

												<p className="visibility-explanation">
													Story is {project.isFeatured ? '' : 'not'} visible to {userGroup.name}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
			/*
			<div

				<div *ngFor="let userGroup of getUserGroups()">
					
					<!-- PROJECTS FROM USERS IN GROUP -->
					<p *ngIf="getGroupProjects(userGroup.id).length">
					Stories from users in {{ userGroup.name }}
					</p>
					<div class="story-collection">

						<div
							*ngFor="let project of getGroupProjects(userGroup.id)"
							class="story-collection__project">
							<p>
							<span class="text-bold">Project: </span>
							<span>{{ project.name }}</span>
							</p>
							<p>
							<span class="text-bold">User: </span>
							<span>{{ project.user }}</span>
							</p>
							<p>
							<span class="text-bold">Tags: </span>
							<span>{{ project.tags }}</span>
							</p>
							<img
							*ngIf="project.thumbnailUrl"
							[attr.src]="project.thumbnailUrl"
							(click)="openProject(project)"
							class="story-collection__thumbnail"/>

							<div class="flex-row-start">
								
							<checkbox
								[initialValue]="project.isFeatured"
								(changeEmitter)="onCheckboxChange($event, userGroup.id, project.projectId, project)">
							</checkbox>

							<p class="visibility-explanation">
								Story is {{ project.isFeatured ? '' : 'not' }} visible to {{ userGroup.name }}
							</p>

						</div>

					</div>

					</div>


					<!-- EXTERNAL PROJECTS -->
					<p *ngIf="getExternalProjects(userGroup.id).length">
					External projects
					</p>
					<div class="story-collection">

					<div
						*ngFor="let project of getExternalProjects(userGroup.id)"
						class="story-collection__project">
						<p>
						<span class="text-bold">Project: </span>
						<span class="text-bold">{{ project.name }}</span>
						</p>
						<p>
						<span class="text-bold">User: </span>
						<span class="text-bold">{{ project.user }}</span>
						</p>
						<p>
						<span class="text-bold">Tags: </span>
						<span class="text-bold">{{ project.tags }}</span>
						</p>
						<img
						*ngIf="project.thumbnailUrl"
						[attr.src]="project.thumbnailUrl"
						(click)="openProject(project)"
						class="story-collection__thumbnail"/>

						<div
						(click)="removeExternalProject(userGroup.id, project.projectId)"
						class="button remove-button">
						Remove project from group
						</div>

					</div>

					</div>


				</div>
				</div>
			*/
		);
	}

	private getUserGroups() {
		return adminInteractor.getAdminGroups();
	}

	private getGroupProjects(groupId: string) {
		return this.state.projects[groupId] && this.state.projects[groupId].projects_from_users || [];
	}

	private getExternalProjects(groupId: string) {
		return this.state.projects[groupId] &&
		this.state.projects[groupId].external_projects || [];
	}

	private async fetchProjectsByGroup(groupId: string) {
		const projectList = await adminInteractor.getAllProjectsInGroup(groupId);

		const projects = this.state.projects;
		projects[groupId] = projectList.results;

		this.setState({
			projects: projects
		});
	}

	private async onCheckboxChange(event, groupId: string, projectId: string, project: any) {
		await adminInteractor.setProjectInGroup(groupId, projectId, event.target.value, GROUP_TYPE.FEATURED);
		project.isFeatured = event.value;
	}

	private openProject(project) {
		projectInteractor.openProject(project)
		.then(
			() => {
				sceneInteractor.setActiveRoomId(null);
				eventBus.onSelectRoom(null, false);
				eventBus.onStopLoading();
				projectMetaDataInteractor.setIsReadOnly(true);
				// this.router.navigateByUrl('/editor');
			},
			() => {
				eventBus.onStopLoading();
				eventBus.onModalMessage(ERROR_OPENING_PROJECT, SERVER_ERROR);
			},
		);
	}
}
