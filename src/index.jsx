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
import { FirebaseContext, Firebase } from './firebase/index';

// AFrame Components
import './aframe-components/aframe/Hotspot';
import './aframe-components/aframe/PulsatingMarker';
import './aframe-components/aframe/HiddenMarker';
import './aframe-components/aframe/HotspotContent';
import './aframe-components/aframe/DoorPulsatingMarker';
import './aframe-components/aframe/Door';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <FirebaseContext.Provider value={new Firebase()}>
                <App />
            </FirebaseContext.Provider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);
