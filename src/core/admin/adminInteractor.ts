import apiService from 'data/api/apiService';

import userService from 'data/user/userService';

class AdminInteractor {
  isAdmin(): boolean {
    return !!userService.getAdminGroups().length;
  }

  getAdminGroups(): any[] {
    return userService.getAdminGroups();
  }

  getAllProjectsInGroup(groupId: string) {
    return apiService.getAllProjectsInGroup(groupId);
  }

  setProjectInGroup(groupId: string, projectId: string, isIn: boolean, projectType: string) {
    return apiService.setProjectInGroup(groupId, projectId, isIn, projectType);
  }
}
export default new AdminInteractor();