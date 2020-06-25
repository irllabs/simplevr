import React from 'react';
import uuid from 'uuid/v1';

import SignInDialog from 'irl-ui/sign-in/sign-in';
import ProfileIcon from 'irl-ui/profile-icon/profile-icon';
import Button from 'irl-ui/button/button';

import ProfileDialog from './profile-dialog/profile-dialog';

import defaultProfileImage from 'assets/images/profile-image-placeholder.svg';

import AuthService from 'root/services/auth';

import { onOpenSignInDialog } from 'services/event-manager';

import './user-profile.scss';

interface SignInState {
	signInDialogOpen: boolean;
	signedIn: boolean;
	profileOpen: boolean;
	user?: firebase.User;
}

export default class UserProfile extends React.Component<{}, SignInState> {
	private _openSignInDialogEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			signInDialogOpen: false,
			signedIn: undefined,
			profileOpen: false
		};

		this.onOpen = this.onOpen.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onSignInAsync = this.onSignInAsync.bind(this);
		this.onSignUpAsync = this.onSignUpAsync.bind(this);
		this.onSignInWithGoogleAsync = this.onSignInWithGoogleAsync.bind(this);
		this.onAuthStateChange = this.onAuthStateChange.bind(this);
		this.onOpenProfile = this.onOpenProfile.bind(this);
		this.onCloseProfile = this.onCloseProfile.bind(this);
	}

	public componentDidMount() {
		onOpenSignInDialog.subscribe({
			id: this._openSignInDialogEventId,
			callback: this.onOpen,
		});

		AuthService.subscribeOnAuthStateChanged(this.onAuthStateChange);
	}

	public componentWillUnmount() {
		onOpenSignInDialog.unsubscribe(this._openSignInDialogEventId);
	}

	public render() {
		return (
			<div className='user-profile-container'>
				{/* If user is not logged in show 'Sign in' button*/}
				{this.state.signedIn === false &&
				<Button
					label='Sign in'
					onClick={this.onOpen}
				/>}
				{/* When user clicks on 'Sign in' button show sign in dialog */}
				{this.state.signInDialogOpen &&
				<SignInDialog
					onClose={this.onClose}
					onSignInAsync={this.onSignInAsync}
					onSignUpAsync={this.onSignUpAsync}
					onSignInWithGoogleAsync={this.onSignInWithGoogleAsync}
				/>}
				{/* If user is logged in show user profile image */}
				{this.state.signedIn &&
				<ProfileIcon
					profileImage={this.state.user.photoURL || defaultProfileImage} onClick={this.onOpenProfile}
				/>}
				{this.state.profileOpen &&
				<ProfileDialog user={this.state.user} onClose={this.onCloseProfile} />}
			</div>
		);
	}

	private onOpen() {
		this.setState({
			signInDialogOpen: true,
		});
	}

	private onClose() {
		this.setState({
			signInDialogOpen: false,
		});
	}

	private onOpenProfile() {
		this.setState({
			profileOpen: true,
		});
	}

	private onCloseProfile() {
		this.setState({
			profileOpen: false,
		});
	}

	private onSignInAsync(email: string, password: string): Promise<void> {
		return AuthService.signInWithFirebase(email, password);
	}

	private onSignUpAsync(email: string, password: string): Promise<void> {
		return AuthService.signUpWithFirebase(email, password);
	}

	private onSignInWithGoogleAsync(): Promise<void> {
		return AuthService.signInWithGoogle();
	}

	private onAuthStateChange(user: firebase.User) {
		this.setState({
			signedIn: Boolean(user),
			profileOpen: false,
			user: user,
		});
	}
}
