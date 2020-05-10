import React from 'react';
import FileSaver from 'file-saver';

import userInteractor from 'core/user/userInteractor';
import projectInteractor from 'core/project/projectInteractor';

import { Project } from 'data/project/projectModel';

import './auth-user-tab.scss';
import projectMetaDataInteractor from 'core/scene/projectMetaDataInteractor';
import eventBus from 'ui/common/event-bus';
import sceneInteractor from 'core/scene/sceneInteractor';
import { MIME_TYPE_ZIP } from 'root/constants';
import adminInteractor from 'core/admin/adminInteractor';

interface AuthUserTabState {
	projects: any[];
}

export default class AuthUserTab extends React.Component<{}, AuthUserTabState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			projects: []
		};
	}

	public async componentDidMount() {
		const projects = await projectInteractor.getProjects();
		const projectList = projects.docs.map((p) => new Project(p.data()));

		this.setState({
			projects: projectList,
		});
	}

	public render() {
		return (
			<div className="modal-window__fields">
				<div className="dropdown-title">
					<p>Hello {this.getUserName()}!</p>
				</div>

				{!this.isWorkingOnSavedProject() &&
				<div className="dropdown-text">
					<p>
						<span className="dropdown-text__accent">
							Current project is not saved.
						</span>
						<br/>
						<span className="dropdown-text">
							To save it, click on 'Story' and then 'Save'.
						</span>
					</p>
				</div>}

				{!this.userHasProjects() &&
				<div className="dropdown-text__bold">
					<p>
						No saved projects.
					</p>
				</div>}

				{this.userHasProjects() &&
				<div>
					<p className="dropdown-text__bold">
						PROJECTS
					</p>
					<div className="user-view__project-list">
						{this.state.projects.map((project) => {
							return (
								<div key={project.id} className="user-view__project">
									{!this.projectIsSelected(project.id) &&
									<p
										className={`user-view__project-title ${this.projectIsSelected(project.id) ? 'user-view__project-title--selected' : ''}`}
										onClick={() => {
											this.openProject(project)}
									}>
										{project.name}
									</p>}

									{this.projectIsSelected(project.id) &&
									<p
										className={`user-view__project-title--selected ${this.projectIsSelected(project.id)} ? 'user-view__project-title--selected' : ''`}
									>
										{project.name}
									</p>}

									<p className="user-view__project-options">
									<span
										onClick={() => {
											this.shareProject(project.id)
										}}
										className="user-view__project-option user-view__project-option--margin">
											Share
									</span>
									<span
										onClick={() => {
											this.openMultiView(project.id)
										}}
										className="user-view__project-option user-view__project-option--margin">
											Multi-View
									</span>
									<span
										onClick={() => {
											this.downloadProject(project)
										}}
										className="user-view__project-option user-view__project-option--margin">
											Download
									</span>
									</p>
								</div>
							);
						})}
					</div>
				</div>}
				<div className="button_row">
					<div
						onClick={this.onExploreClick}
						title="Click to explore other SimpleVR projects"
						className="button">
							Explore
					</div>

					<div
						className="button"
						title="Click to add a room to current story"
						onClick={this.onLogOutClick}>
							Sign Out
					</div>

					{this.userIsAdmin() &&
					<div
						onClick={this.onAdminClick}
						title="Click to administer your groups"
						className="button">
							Admin
					</div>}
				</div>
			</div>
		);
	}

	private getUserName(): string {
		return userInteractor.getUserName();
	}

	private isWorkingOnSavedProject(): boolean {
		return projectInteractor.isWorkingOnSavedProject();
	}

	private userHasProjects(): boolean {
		return !!this.state.projects && this.state.projects.length > 0;
	}

	private projectIsSelected(projectId: string): boolean {
		const project: Project = projectInteractor.getProject();
		return project && project.id === projectId;
	}

	private openProject(project: Project) {
		projectMetaDataInteractor.checkAndConfirmResetChanges().then(() => {
			eventBus.onStartLoading();
	
			projectInteractor.openProject(project)
			.then(() => {
				//reset the current scene
				projectMetaDataInteractor.setIsReadOnly(false);
				sceneInteractor.setActiveRoomId(project.story.homeRoomId);
				eventBus.onSelectRoom(sceneInteractor.getActiveRoomId(), false);
				eventBus.onStopLoading();
				projectMetaDataInteractor.loadingProject(false);
			},
			(error) => {
				console.error('error', error);
				eventBus.onStopLoading();
			});
		}, () => {});
	}

	private shareProject(projectId: number) {
		const userId: string = userInteractor.getUserId();
		eventBus.onShareableModal(userId, projectId + '');
	}

	private openMultiView(projectId: number) {
		projectMetaDataInteractor.checkAndConfirmResetChanges().then(() => {
			console.log('onOpenMultiView');
			const userId = userInteractor.getUserId();
			const queryParams = {
			multiview: `${userId}-${projectId}`,
		};
		}, () => {});
	}

	private downloadProject(project: Project) {
		eventBus.onStartLoading('Saving your project, just a moment...');
	
		projectInteractor.getProjectAsBlob(project)
		.then((projectBlob) => {
			const blob = new Blob([projectBlob], { type: MIME_TYPE_ZIP });
	
			FileSaver.saveAs(blob, `${project.name}.zip`);
				eventBus.onStopLoading();
			},
			(error) => {
				eventBus.onStopLoading();
				eventBus.onModalMessage('error', error.message);
			},
		);
	}

	private onExploreClick() {
		// this.eventBus.onExploreModal();
		// this.router.navigateByUrl('/explore');
	}

	private onLogOutClick() {
		projectMetaDataInteractor.checkAndConfirmResetChanges().then(() => {
			userInteractor.logOut();
			projectMetaDataInteractor.loadingProject(true);
			sceneInteractor.setActiveRoomId(null);
			sceneInteractor.resetRoomManager();
			projectInteractor.setProject(null);
			eventBus.onSelectRoom(null, false);
			projectMetaDataInteractor.setIsReadOnly(false);
			projectMetaDataInteractor.loadingProject(false);
		}, () => {});
	}

	private userIsAdmin(): boolean {
		return adminInteractor.isAdmin();
	}

	private onAdminClick($event) {
		// this.router.navigateByUrl('/admin');
	}
}

/*
<div class="modal-window__fields">

  <div *ngIf="userHasProjects()">
    <p class="dropdown-text__bold">
      PROJECTS
    </p>
    <!-- TODO: make scrollable -->
    <div class="user-view__project-list">
      <div
        *ngFor="let project of projectList"
        class="user-view__project">

        <p
          class="user-view__project-title"
          *ngIf="!projectIsSelected(project.id)"
          (click)="openProject(project)"
          [ngClass]="{'user-view__project-title--selected': projectIsSelected(project.id)}">
          {{project.name}}
        </p>

        <p
          class="user-view__project-title--selected"
          *ngIf="projectIsSelected(project.id)"
          [ngClass]="{'user-view__project-title--selected': projectIsSelected(project.id)}">
          {{project.name}}
        </p>

        <p class="user-view__project-options">
          <span
            (click)="shareProject(project.id)"
            class="user-view__project-option user-view__project-option--margin">
            Share
          </span>
          <span
            (click)="openMultiView(project.id)"
            class="user-view__project-option user-view__project-option--margin">
            Multi-View
          </span>
          <span
            (click)="downloadProject(project)"
            class="user-view__project-option user-view__project-option--margin">
            Download
          </span>
        </p>

      </div>
    </div>
  </div>
  <!-- Logout and Explore buttons -->

  <div class="button_row">
    <div
      (click)="onExploreClick($event)"
      title="Click to explore other SimpleVR projects"
      class="button">
      Explore
    </div>

    <div
      class="button"
      title="Click to add a room to current story"
      (click)="onLogOutClick($event)">
      Sign Out
    </div>

    <div
      *ngIf="userIsAdmin()"
      (click)="onAdminClick($event)"
      title="Click to administer your groups"
      class="button">
      Admin
    </div>
  </div>
</div>
*/
