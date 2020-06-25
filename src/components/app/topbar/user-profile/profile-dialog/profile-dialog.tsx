import React from 'react';

import ProfileIcon from 'irl-ui/profile-icon/profile-icon';
import Spacer from 'irl-ui/spacer/spacer';
import BorderButton from 'irl-ui/border-button/border-button';
import Typography, { TypographyVariant } from 'irl-ui/typography/typography';

import defaultProfileImage from 'assets/images/profile-image-placeholder.svg';

import AuthService from 'root/services/auth';
import StoryService from 'root/services/story';

import colors from 'styles/colors';

import './profile-dialog.scss';

interface ProfileDialogProps {
	user: firebase.User;
	onClose: () => void;
}

export default class ProfileDialog extends React.Component<ProfileDialogProps, {}> {
	constructor(props: ProfileDialogProps) {
		super(props);

		this.onClose = this.onClose.bind(this);
		this.onSignOut = this.onSignOut.bind(this);
	}

	public render() {
		return ([
			<div key='close-surface' className='dialog-close-surface' onClick={this.onClose} />,
			<div key='dialog' className='profile-dialog-container'>
				<div className='profile-dialog'>
					<div className='profile-dialog-title'>
						<Typography variant={TypographyVariant.TEXT_LARGE}>
							Manage your account
						</Typography>
					</div>
					<div className='user-info-container'>
						<ProfileIcon profileImage={this.props.user.photoURL || defaultProfileImage} />
						<Spacer size={12} />
						<Typography variant={TypographyVariant.TEXT_MEDIUM} color={colors.textDaylight2}>
							{this.props.user.email}
						</Typography>
						<Spacer size={4} />
						<Typography variant={TypographyVariant.TEXT_SMALL} color={colors.textDaylight2}>
							Signed via email
						</Typography>
					</div>
					<div className='action-button-container'>
						<BorderButton label='Logout' maxWidth={true} onClick={this.onSignOut} />
					</div>
				</div>
			</div>
		]);
	}

	private onClose() {
		this.props.onClose();
	}

	private onSignOut() {
		AuthService.signOut();
		StoryService.resetUserStoryPagination();
	}
}
