// External libraries
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
	BrowserRouter as Router,
	Switch,
	Route,
} from 'react-router-dom';

// State
import { setUser, setUsers } from '../redux/actions';

// External UI Components
import CssBaseline from '@material-ui/core/CssBaseline';

// Style
import { unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

// Components
import LandingPageRoute from './landing-page/LandingPageRoute';
import EditorRoute from './editor/EditorRoute';
import ViewerRoute from './viewer/ViewerRoute';
import SnackbarNotification from './shared/SnackbarNotification';
import SignInDialog from './dialogs/SignInDialog';

// Database
import firebase from './../firebase/firebase';

function App({project, setUsersAction, setUserAction}) {
	const theme = React.useMemo(
		() => {
			return createMuiTheme({
				palette: {
					type: 'light',
					primary: {
						dark: '#de2e62',
						main: '#E34B78',
						light: '#e86f93',
					},
					secondary: {
						dark: '#333333',
						main: '#474747',
						light: '#C1C1C1',
					},
				},
				typography: {
					fontFamily: [
						'Inter',
						'sans-serif',
					],
					button: {
						textTransform: 'none',
					},
					// Heading large
					h1: {
						fontSize: '20px',
						fontStyle: 'normal',
						fontWeight: 'bold',
						lineHeight: '24px',
					},
					// Heading medium
					h2: {
						fontSize: '16px',
						fontStyle: 'normal',
						fontWeight: 'bold',
						lineHeight: '20px',
					},
					// Text large
					body1: {
						fontSize: '20px',
						fontStyle: 'normal',
						fontWeight: 'normal',
						lineHeight: '24px',
					},
					// Text small
					body2: {
						fontSize: '14px',
						fontStyle: 'normal',
						fontWeight: 'normal',
						lineHeight: '20px',
					},
				},
			});
		}, [],
	);

	useEffect(() => {
		const loadUsers = async () => {
			const users = await firebase.loadUsers();

			setUsersAction(users);
		}
		loadUsers();
	}, [setUsersAction]);

	useEffect(() => {
		firebase.auth.onAuthStateChanged(async (authUser) => {
			if (authUser) {
				const user = await firebase.loadUser(authUser.uid);
				if (user) {
					if (!user.favoriteProjects) {
						user.favoriteProjects = [];
					}
					setUserAction(user);
				}
			}
		});
	}, [setUserAction]);

	useEffect(() => {
		const unloadPage = () => {
			if(project.unsavedChanges) {
				return "There are unsaved changes, are you sure you want to leave the page?";
			}
		}
		window.onbeforeunload = unloadPage;
	}, [project])

	return (
		<div className="App">
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<SnackbarNotification />
				<SignInDialog />
				<Router>
					<Switch>
						<Route path="/editor" component={EditorRoute} />
						<Route path="/session/:projectId/:sessionId" component={ViewerRoute} />
						<Route path="/view/:projectId" component={ViewerRoute} />
						<Route path="/preview" component={ViewerRoute} />
						<Route path="/" component={LandingPageRoute} />
					</Switch>
				</Router>
			</ThemeProvider>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		project: state.project
	};
};

export default connect(
	mapStateToProps,
	{
		setUserAction: setUser,
		setUsersAction: setUsers,
	},
)(App);
