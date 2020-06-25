import React from 'react';
import ReactDOM from 'react-dom';

import './config/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import 'aframe';
import 'aframe-look-at-component';

import App from 'components/app/app';

import './index.scss';

import ThemeContext from 'irl-ui/theme/theme-context';

import createTheme from 'irl-ui/theme/create-theme';

const theme = createTheme({
	primary: 'rgba(227, 75, 120, 1)',
	primary2: 'rgba(227, 75, 120, 0.49)',
	textDaylight1: 'rgba(0, 0, 0, 0.9)',
	textDaylight2: 'rgba(0, 0, 0, 0.6)',
	textDaylight3: 'rgba(0, 0, 0, 0.3)',
	textDark3: 'rgba(255, 255, 255, 0.7)',
});

ReactDOM.render(
	<ThemeContext.Provider value={theme}>
		<App />
	</ThemeContext.Provider>,
	document.getElementById('root')
);
