import { Injectable } from "@angular/core"
import { AngularFireAuth } from "angularfire2/auth"
import apiService from "data/api/apiService"

import { AuthenticationMethod } from "data/authentication/authenticationMethod"
import userService from "data/user/userService"

import * as firebase from 'firebase';

const TOKEN_STORAGE: string = "TOKEN_STORAGE"

class AuthService {
	private _user: any = null
	private _idToken = null
	private _auth = firebase.auth();

	public get isAuthenticated(): boolean {
		return this._user !== null
	}

	public get user(): any {
		if (this._user !== null) {
			return {
				get id() {
					return this.uid
				},
				uid: this._user.uid,
				displayName: this._user.displayName,
				email: this._user.email,
				providerData: this._user.providerData,
				providerId: this._user.providerId,
				idToken: this._idToken
			}
		} else {
			return {}
		}
	}

	public get auth() {
		return this._auth;
	}

	constructor() {
		this._auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
	}

	private onAuthStateChanged(user: firebase.User) {
		if (user !== null) {
			this._user = user;
			userService.setUser(this.user);

			return user;
		}
	}

	private _googleAuthenticate() {
		return this._auth
			.signInWithPopup(new firebase.auth.GoogleAuthProvider())
			.then(result => {
				if (result.additionalUserInfo.isNewUser) {
					return Promise.reject({
						code: "auth/user-disabled"
					})
				}
				const user = result.user

				this._user = user
				userService.setUser(this.user)

				return user
			})
	}

	private _loginPasswordAuthenticate({ email, password }) {
		return this._auth
			.signInWithEmailAndPassword(email, password)
			.then(user => {
				this._user = user
				userService.setUser(this.user)

				return user
			})
	}

	public authenticate(provider, credentials = null) {
		switch (provider) {
			case AuthenticationMethod.GOOGLE: {
				return this._googleAuthenticate()
			}
			case AuthenticationMethod.FIREBASE: {
				return this._loginPasswordAuthenticate(credentials)
			}
			default: {
				return this._loginPasswordAuthenticate(credentials)
			}
		}
	}

	public invalidate() {
		this._auth.signOut()
		this._user = null
		userService.clearUser()
	}
}
export default new AuthService();
