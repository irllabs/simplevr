import { Project } from './projectModel';

class ProjectService {
  private _project: Project;

  constructor() {
  }
  public getProjectId(): string {
    return this._project ? this._project.id : null;
  }

  public getProject(): Project {
    return this._project;
  }

  public setProject(project: Project) {
    this._project = project;
  }

  public isWorkingOnSavedProject(): boolean {
    return !!this.getProjectId();
  }
}
export default new ProjectService();