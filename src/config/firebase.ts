import { initializeApp } from 'firebase';

export const firebaseConfig = {
	apiKey: 'AIzaSyC5Q5Ie9To_fE2Yk8jOq1BCjIlV-9SEqQM',
	authDomain: 'social-vr-161302.firebaseapp.com',
	databaseURL: 'https://social-vr-161302.firebaseio.com',
	projectId: 'social-vr-161302',
	storageBucket: 'social-vr-161302.appspot.com',
	messagingSenderId: '613942124685',
	dynamicLinkDomain: 'simplevr.page.link'
};
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;