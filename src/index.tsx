import React from 'react';
import ReactDOM from 'react-dom';

import './config/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import App from 'components/app/app';

import './index.scss';
import './ui/_module/ui.scss';

import 'aframe-look-at-component';

ReactDOM.render(
	<App />,
	document.getElementById('root')
);
