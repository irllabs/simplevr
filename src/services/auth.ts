import userService from "data/user/userService"

import firebase from 'firebase';

class AuthService {
	private _auth = firebase.auth();

	private _user: firebase.User;

	constructor() {
		this._auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
	}

	private onAuthStateChanged(user: firebase.User) {
		if (user) {
			this._user = user;
			userService.setUser(this._user);
		}
		else {
			userService.clearUser();
		}
	}

	public subscribeOnAuthStateChanged(callback: (user: firebase.User) => void) {
		this._auth.onAuthStateChanged(callback);
	}

	public async signInWithGoogle() {
		await this._auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
	}

	public async signInWithFirebase(email: string, password: string) {
		await this._auth.signInWithEmailAndPassword(email, password);
	}

	public async signUpWithFirebase(email: string, password: string) {
		await this._auth.createUserWithEmailAndPassword(email, password);
	}

	public signOut() {
		this._auth.signOut();
	}
}
export default new AuthService();
