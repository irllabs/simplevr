import { Observable } from 'rxjs/Observable';

export default interface ApiService {
  getShortenedUrl(url: string);

  getAllProjectsInGroup(groupId: string);

  setProjectInGroup(groupId: string, projectId: string, isIn: boolean, projectType: string);

  getGroup(groupId: string);

}
