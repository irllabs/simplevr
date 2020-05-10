import apiService from 'data/api/apiService';
import { AuthenticationMethod } from 'data/authentication/authenticationMethod';
import authService from 'data/authentication/authService';
import userService from 'data/user/userService';

class UserInteractor {

  login(email: string, password: string) {
    return authService.authenticate(AuthenticationMethod.FIREBASE, { email, password });
  }

  loginWithGoogle() {
    return authService.authenticate(AuthenticationMethod.GOOGLE);
  }

  isLoggedIn() {
    return authService.isAuthenticated;
  }

  logOut() {
    return authService.invalidate();
  }

  getUser() {
    return userService.getUser();
  }

  getUserName(): string {
    return userService.getUserName();
  }

  getUserId(): string {
    return userService.getUserId();
  }

  // TODO: get rid
  getUserGroups(): string[] {
    return userService.getUserGroups();
  }
}
export default new UserInteractor();
