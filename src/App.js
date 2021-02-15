import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { connect } from "react-redux";
import { unstable_createMuiStrictModeTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import LandingPageRoute from './components/landing-page/LandingPageRoute'
import EditorRoute from './components/editor/EditorRoute'
import ViewerRoute from './components/viewer/ViewerRoute'

function App () {
  const theme = React.useMemo(
    () =>
      unstable_createMuiStrictModeTheme({
        palette: {
          type: 'dark',
          primary: {
            dark: '#de2e62',
            main: '#E34B78',
            light: '#e86f93'
          },
          secondary: {
            dark: '#333333',
            main: '#474747',
            light: '#C1C1C1'
          },
          text: {
            primary: '#EAEAEA'
          },
          action: {
            active: '#EAEAEA'
          }
        },
        shape: {
          borderRadius: 32
        },
        typography: {
          button: {
            textTransform: 'none'
          }
        }
      }),
    [],
  );

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Switch>
            <Route path="/editor" component={EditorRoute} />
            <Route path="/view" component={ViewerRoute} />
            <Route path="/" component={LandingPageRoute} />
          </Switch>
        </Router>
      </ThemeProvider>
    </div>
  );
}

const mapStateToProps = state => {
  return {

  };
};

export default connect(
  mapStateToProps,
  {

  }
)(App);