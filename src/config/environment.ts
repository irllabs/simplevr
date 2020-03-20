const build = require('build');

const firebase = build === 'PROD' ? {
  apiKey: 'AIzaSyC5Q5Ie9To_fE2Yk8jOq1BCjIlV-9SEqQM',
  authDomain: 'social-vr-161302.firebaseapp.com',
  databaseURL: 'https://social-vr-161302.firebaseio.com',
  projectId: 'social-vr-161302',
  storageBucket: 'social-vr-161302.appspot.com',
  messagingSenderId: '613942124685',
  dynamicLinkDomain: 'simplevr.page.link'

} : {
  apiKey: 'AIzaSyB6v7PJhqFaoC4fHQZ4ZpZtDCfo-CCl8qA',
  authDomain: 'social-vr-161302.firebaseapp.com',
  databaseURL: 'https://social-vr-161302.firebaseio.com',
  projectId: 'social-vr-161302',
  storageBucket: 'social-vr-161302.appspot.com',
  messagingSenderId: '613942124685',
  dynamicLinkDomain: 'simplevr.page.link'
};

export const ENV = {
  firebase,

  firebaseStore: {
    timestampsInSnapshots: true,
  },
};
