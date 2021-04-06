import {
	Button,
	Divider,
} from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import UserProfile from '../user-profile/UserProfile';

const styles = makeStyles(() => {
	return {
		root: {
			height: '96px',
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginLeft: '48px',
			marginRight: '48px',
			boxSizing: 'border-box'
		},
		infoButton: {
			backgroundColor: 'rgba(0,0,0,0.6)',
			padding: 0,
			'&:hover': {
				backgroundColor: 'rgba(0,0,0,0.4)',
			},
			borderRadius: '24px',
		},
		infoButtonLogo: {
			paddingRight: 12,
			paddingLeft: 22,
		},
		infoButtonInfoIcon: {
			paddingRight: 22,
			paddingLeft: 12,
		},
		divider: {
			height: 48,
			color: 'white',
			backgroundColor: 'rgba(255, 255, 255, 0.2)',
		}
	};
});

export default function Header() {
	const classes = styles();

	return (
		<div className={classes.root}>
			<Button className={classes.infoButton} disableElevation size="large" variant="contained">
				<img className={classes.infoButtonLogo} src="/logo.svg" alt="logo" />
				<Divider className={classes.divider} orientation="vertical" flexItem />
				<img className={classes.infoButtonInfoIcon} src="/icons/info.svg" alt="info" />
			</Button>
			<UserProfile />
		</div>
	);
}
