import React from 'react';

import UnauthUserTab from './unauth-user-tab/unauth-user-tab';
import AuthUserTab from './auth-user-tab/auth-user-tab';

import authService from 'data/authentication/authService';

import './user-profile.scss';

interface UserProfileState {
	profileOpen: boolean;
	loggedIn: boolean;
}

export default class UserProfile extends React.Component<{}, UserProfileState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			profileOpen: false,
			loggedIn: false,
		};

		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
	}

	public componentDidMount() {
		authService.auth.onAuthStateChanged(this.setIsLoggedIn.bind(this));
	}

	public render() {
		return ([
			<div key='profile-button' className='user-profile-button'>
				<p onClick={this.open} className={`topbar__row-label ${this.state.profileOpen ? 'topbar__row-label-active' : ''}`}>
					Profile
				</p>
			</div>,
			this.state.profileOpen &&
			<div key='profile-dialog'>
				<div className='user-profile-dialog-close-surface' onClick={this.close}/>
				<div className='user-profile-dialog-container'>
					<div className='user-profile-dialog'>
						{this.state.loggedIn && <AuthUserTab onClose={this.close}/>}
						{!this.state.loggedIn && <UnauthUserTab />}
					</div>
				</div>
			</div>
		]);
	}

	private setIsLoggedIn(user: firebase.User) {
		this.setState({
			loggedIn: Boolean(user),
		});
	}

	private open(event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) {
		event.stopPropagation();
		this.setState({
			profileOpen: true,
		});
	}

	private close(event?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		event?.stopPropagation();
		this.setState({
			profileOpen: false,
		});
	}
}
