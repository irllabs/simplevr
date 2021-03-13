# Frameworks

This project makes use of Material UI.\
[https://material-ui.com/](https://material-ui.com/)

The theme is customizable in App.js.

The project also uses aframe-react.\
[https://github.com/supermedium/aframe-react](https://github.com/supermedium/aframe-react).


## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\

## Deploy to Firebase

In order to deploy application, you need to run `npm run build` to create production minified version of the application.\
After building is done, you need to run `firebase deploy --only hosting`, this will deploy current local build to firebase.\
Make sure you have firebase-cli installed and setup.
