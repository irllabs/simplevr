# Frameworks

This project makes use of Material UI.
[https://material-ui.com/](https://material-ui.com/)

The theme is customizable in App.js.

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

### `npm run dev`

Builds the app for development to the `public/build` folder.

### `npm run prod`

Builds the app for production to the `public/build` folder.

### `npm run clean`

Removes all build files - should be ran before `npm run prod`, to make sure any artifacts from previous build are removed.

## Deploy to Firebase

In order to deploy application, you need to run `npm run clean && npm run prod` to create production minified version of the application.
After building is done, you need to run `firebase deploy --only hosting`, this will deploy current local build to firebase.
Make sure you have firebase-cli installed and setup.
