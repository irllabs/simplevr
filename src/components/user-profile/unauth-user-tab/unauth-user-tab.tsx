import React from 'react';

import TextInputMaterial from 'components/text-input-material/text-input-material';

import userInteractor from 'core/user/userInteractor';
import eventBus from 'ui/common/event-bus';

import './unauth-user-tab.scss';

interface UnauthUserTabState {
	email: string;
	password: string;
}

export default class UnauthUserTab extends React.Component<{}, UnauthUserTabState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			email: '',
			password: '',
		};

		this.onEmailChanged = this.onEmailChanged.bind(this);
		this.onPasswordChanged = this.onPasswordChanged.bind(this);
		this.onLogin = this.onLogin.bind(this);
		this.onLoginWithGoogle = this.onLoginWithGoogle.bind(this);
	}

	public render() {
		return (
			<div className="unauth-user-tab__fields">
				<TextInputMaterial
					inputLabel='Email'
					onTextChange={this.onEmailChanged}>
				</TextInputMaterial>

				<TextInputMaterial
					inputType='password'
					inputLabel='Password'
					onTextChange={this.onPasswordChanged}>
				</TextInputMaterial>

				<div className="horiz-line-bottom"></div>

				<div className="button_row">
					<div
						onClick={this.onLoginWithGoogle}
						className="button sign-in-with-google-button">
							Sign in with Google
					</div>
				</div>

				<div className="button_row">
					<div
						className="button"
						title="Click to create new story, SHIFT-click to upload zip file"
						onClick={this.onOpenClick}>
							Select a Story .zip
					</div>
					<div
						onClick={this.onLogin}
						className="button sign-in-button">
							Sign in
					</div>
				</div>
			</div>
		);
	}

	private onEmailChanged(value: string) {
		this.setState({
			email: value,
		});
	}

	private onPasswordChanged(value: string) {
		this.setState({
			password: value,
		});
	}

	private onLoginWithGoogle() {
		userInteractor.loginWithGoogle();
	}

	private onOpenClick() {
		if (!userInteractor.isLoggedIn()) {
			eventBus.onModalMessage(
				"Error",
				"You must be logged in to download as .zip"
			);
			return;
		}
	
		eventBus.onOpenFileLoader("zip");
		return;
	}

	public onLogin() {
		if (!this.state.email || !this.state.password) {
			const errorHeader = "Email Password Error";
			const errorBody = "Make sure to fill out both email and password fields!";
	
			eventBus.onModalMessage(errorHeader, errorBody);
			return;
		}
		userInteractor.login(this.state.email, this.state.password);
	}
}
