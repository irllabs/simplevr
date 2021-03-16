// External libraries
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// Global style
import './index.css';

// Components
import App from './app';

// Store
import store from './redux/store';

// Database
import { FirebaseContext, firebase } from './firebase/index';

// AFrame Components
import './aframe-components/aframe/Hotspot';
import './aframe-components/aframe/PulsatingMarker';
import './aframe-components/aframe/HiddenMarker';
import './aframe-components/aframe/HotspotContent';
import './aframe-components/aframe/DoorPulsatingMarker';
import './aframe-components/aframe/Door';
import './aframe-components/aframe/PreviewSpace';
import './aframe-components/aframe/PlayOnce';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <FirebaseContext.Provider value={firebase}>
                <App />
            </FirebaseContext.Provider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);
