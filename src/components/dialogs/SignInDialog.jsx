import React, { useState, useContext, useRef } from 'react';
import _ from 'lodash';
import firebase from 'firebase/app';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { connect } from 'react-redux';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { setIsShowingSignInDialog, setUser } from '../../redux/actions';
import FirebaseContext from '../../firebase/context.ts';

const styles = makeStyles({
	title: {
		textAlign: 'center',
	},
	body: {
		padding: '1rem',
		borderTop: 'solid 1px rgba(255,255,255,0.1)',
	},
	button: {
		marginBottom: '1rem',
		textAlign: 'center',
	},
	emailForm: {
		display: 'flex',
		flexDirection: 'column',
	},
	emailFormItem: {
		marginBottom: '1rem',
		minWidth: '300px',
	},
	signUpButton: {
		fontWeight: 600,
	},
	backButton: {
		position: 'absolute',
		left: 4,
		top: 8,
	},
	error: {
		textAlign: 'center',
		marginBottom: '2rem',
		fontWeight: 600,
	},
});

const SignInDialog = ({ isShowingSignInDialog, setIsShowingSignInDialogAction, setUserAction }) => {
	const classes = styles();

	const firebaseContext = useContext(FirebaseContext);

	const [isShowingEmailForm, setIsShowingEmailForm] = useState(false);
	const [isShowingUseAsGuestForm, setIsShowingUseAsGuestForm] = useState(false);
	const [isShowingEmailSignupForm, setIsShowingEmailSignupForm] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

	const emailAddressInput = useRef();
	const emailAddressSignupInput = useRef();
	const passwordInput = useRef();
	const passwordSignupInput = useRef();
	const displayNameSignupInput = useRef();
	const displayNameGuestInput = useRef();

	const onClose = () => {
		setIsShowingEmailForm(false);
		setIsShowingEmailSignupForm(false);
		setErrorMessage(null);
		setIsShowingSignInDialogAction(false);
		setIsShowingUseAsGuestForm(false);
	};

	const onGoogleSigninClick = async () => {
		onClose();
		const provider = new firebase.auth.GoogleAuthProvider();

		const authResult = await firebaseContext.auth.signInWithPopup(provider);
		const authUser = authResult.user;
		let user = await firebaseContext.loadUser(authUser.uid);
		if (_.isNil(user)) {
			user = {
				displayName: authUser.displayName,
				email: authUser.email,
				avatar: authUser.photoURL,
				id: authUser.uid,
				isGuest: false,
				favoriteProjects: []
			};
			await firebaseContext.createUser(user);
		}
		setUserAction(user);
	};

	const onShowEmailSigninClick = () => {
		setIsShowingEmailForm(true);
	};

	const onEmailSigninClick = async () => {
		const email = emailAddressInput.current.querySelectorAll('input')[0].value;
		const password = passwordInput.current.querySelectorAll('input')[0].value;
		try {
			await firebaseContext.auth.signInWithEmailAndPassword(email, password);
			onClose();
		} catch (e) {
			setErrorMessage(e.message);
		}
	};

	const onEmailSignupClick = async () => {
		const email = emailAddressSignupInput.current.querySelectorAll('input')[0].value;
		const password = passwordSignupInput.current.querySelectorAll('input')[0].value;
		const displayName = displayNameSignupInput.current.querySelectorAll('input')[0].value;
		if (!_.isEmpty(displayName)) {
			try {
				const authResult = await firebaseContext.auth.createUserWithEmailAndPassword(email, password);
				const authUser = authResult.user;

				const user = {
					displayName: displayName,
					email: email,
					id: authUser.uid,
					isGuest: false,
					favoriteProjects: []
				};

				await firebaseContext.createUser(user);
				setUserAction(user);
				onClose();
			} catch (e) {
				setErrorMessage(e.message);
			}
		} else {
			setErrorMessage('Please enter a name');
		}
	};

	const onShowEmailSignupClick = () => {
		setIsShowingEmailForm(false);
		setIsShowingEmailSignupForm(true);
		setIsShowingUseAsGuestForm(false);
	};

	const onUseAsGuestClick = () => {
		setIsShowingUseAsGuestForm(true);
	};

	const onContinueAsGuestClick = async () => {
		const displayName = displayNameGuestInput.current.querySelectorAll('input')[0].value;
		if (!_.isEmpty(displayName)) {
			try {
				const authResult = await firebaseContext.auth.signInAnonymously();

				const authUser = authResult.user;

				const user = {
					isGuest: true,
					displayName: displayName,
					id: authUser.uid,
					favoriteProjects: []
				};

				await firebaseContext.createUser(user);
				setUserAction(user);
				onClose();
			} catch (e) {
				setErrorMessage(e.message);
			}
		} else {
			setErrorMessage('Please enter a name');
		}
	};

	const onBackClick = () => {
		setIsShowingEmailForm(false);
		setIsShowingEmailSignupForm(false);
		setErrorMessage(null);
		setIsShowingUseAsGuestForm(false);
	};

	return (
		<>
			<Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={isShowingSignInDialog}>
				{
					!isShowingEmailForm && !isShowingEmailSignupForm && !isShowingUseAsGuestForm
					&& (
						<>
							<DialogTitle className={classes.title} id="simple-dialog-title">

								Sign in
							</DialogTitle>
							<Box className={classes.body}>
								<Button
									className={classes.button}
									fullWidth
									color="secondary"
									variant="contained"
									disableElevation
									onClick={onGoogleSigninClick}
								>
									Continue with Google
								</Button>
								<Button
									className={classes.button}
									fullWidth
									color="secondary"
									variant="contained"
									disableElevation
									onClick={onShowEmailSigninClick}
								>
									Sign in with email
								</Button>
								<Button
									className={classes.button}
									fullWidth
									color="secondary"
									variant="contained"
									disableElevation
									onClick={onUseAsGuestClick}
								>
									Use as guest
								</Button>
								<p style={{ textAlign: 'center' }}>
									Don&apos;t have an account yet?
								</p>
								<Button className={classes.signUpButton} fullWidth disableElevation onClick={onShowEmailSignupClick}>Sign up</Button>
							</Box>
						</>
					)
				}
				{
					isShowingEmailForm
					&& (
						<>
							<DialogTitle className={classes.title} id="simple-dialog-title">
								<IconButton aria-label="close" className={classes.backButton} onClick={onBackClick}>
									<ArrowBackIcon />
								</IconButton>
								Sign in with email
							</DialogTitle>
							<Box className={classes.body}>
								<form className={classes.emailForm} noValidate autoComplete="off">
									<TextField
										type="email"
										ref={emailAddressInput}
										className={classes.emailFormItem}
										label="Email address"
										variant="outlined"
									/>
									<TextField ref={passwordInput} className={classes.emailFormItem} label="Password" variant="outlined" type="password" />
									{
										errorMessage
										&& (
											<p className={classes.error}>{errorMessage}</p>
										)
									}
									<Button
										className={classes.button}
										fullWidth
										color="primary"
										variant="contained"
										disableElevation
										onClick={onEmailSigninClick}
									>
										<strong>Sign in</strong>
									</Button>
								</form>

							</Box>
						</>
					)
				}
				{
					isShowingUseAsGuestForm
					&& (
						<>
							<DialogTitle className={classes.title} id="simple-dialog-title">
								<IconButton aria-label="close" className={classes.backButton} onClick={onBackClick}>
									<ArrowBackIcon />
								</IconButton>
								Continue as guest
							</DialogTitle>
							<Box className={classes.body}>
								<form className={classes.emailForm} noValidate autoComplete="off">
									<TextField ref={displayNameGuestInput} className={classes.emailFormItem} label="Name" variant="outlined" />
									{
										errorMessage
										&& (
											<p className={classes.error}>{errorMessage}</p>
										)
									}
									<Button
										className={classes.button}
										fullWidth
										color="primary"
										variant="contained"
										disableElevation
										onClick={onContinueAsGuestClick}
									>
										<strong>Continue as guest</strong>
									</Button>
								</form>

							</Box>
						</>
					)
				}
				{
					isShowingEmailSignupForm
					&& (
						<>
							<DialogTitle className={classes.title} id="simple-dialog-title">
								<IconButton aria-label="close" className={classes.backButton} onClick={onBackClick}>
									<ArrowBackIcon />
								</IconButton>
								Sign up with email
							</DialogTitle>
							<Box className={classes.body}>
								<form className={classes.emailForm} noValidate autoComplete="off">
									<TextField
										ref={displayNameSignupInput}
										className={classes.emailFormItem}
										label="Name"
										variant="outlined"
									/>
									<TextField
										type="email"
										ref={emailAddressSignupInput}
										className={classes.emailFormItem}
										label="Email address"
										variant="outlined"
									/>
									<TextField
										ref={passwordSignupInput}
										className={classes.emailFormItem}
										label="Password"
										variant="outlined"
										type="password"
									/>
									{
										errorMessage
										&& (
											<p className={classes.error}>{errorMessage}</p>
										)
									}
									<Button
										className={classes.button}
										fullWidth
										color="primary"
										variant="contained"
										disableElevation
										onClick={onEmailSignupClick}
									>
										<strong>Sign up</strong>
									</Button>
								</form>

							</Box>
						</>
					)
				}

			</Dialog>
		</>
	);
};

const mapStateToProps = (state) => {
	return {
		user: state.user,
		isShowingSignInDialog: state.display.isShowingSignInDialog,
	};
};

export default connect(
	mapStateToProps,
	{
		setIsShowingSignInDialogAction: setIsShowingSignInDialog,
		setUserAction: setUser,
	},
)(SignInDialog);
