import React from 'react';

import InfoButton from 'irl-ui/info-button/info-button';
import SignIn from './user-profile/user-profile';

import colors from 'styles/colors';

import './topbar.scss';

export default class Topbar extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render() {
		return (
			<div className='topbar'>
				<InfoButton
					backgroundColor={colors.textDaylight2}
					splitterColor={colors.borderDark}
				>
					<img src='assets/icons/logo.svg' />
				</InfoButton>
				<SignIn />
			</div>
		);
	}
}
