// External libraries
import { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';

// External UI Components
import { IconButton, Snackbar } from '@material-ui/core';

// External Icons
import { Close } from '@material-ui/icons';

// Redux - State
import { RootState } from '../../redux/reducers';

// Redux - Actions
import { hideSnackbar } from '../../redux/actions';

const mapStateToProps = (state: RootState) => {
    return {
        isShowingSnackbar: state.display.isShowingSnackbar,
        snackbarMessage: state.display.snackbarMessage
    };
};

const mapDispatch = {
    hideSnackbarAction: hideSnackbar,
}

const connector = connect(
    mapStateToProps,
    mapDispatch,
);

type ReduxProps = ConnectedProps<typeof connector>

const SnackbarNotification: FC<ReduxProps> = ({isShowingSnackbar, snackbarMessage, hideSnackbarAction}) => {
    const onClose = () => {
        hideSnackbarAction();
    }

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={isShowingSnackbar}
            autoHideDuration={5000}
            onClose={onClose}
            message={snackbarMessage}
            style={{whiteSpace: 'pre-line'}}
            action={
                <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
                    <Close fontSize="small" />
                </IconButton>
            }
        />
    );
}
export default connector(SnackbarNotification);
