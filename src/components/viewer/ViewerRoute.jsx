import { useHistory } from 'react-router-dom';

import { IconButton, makeStyles } from '@material-ui/core';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import 'aframe';
import 'aframe-look-at-component';

import Scene from '../../aframe-components/Scene';

const styles = makeStyles(() => {
    return {
        backButtonContainer: {
            position: 'fixed',
            left: '24px',
            top: '24px',
            width: '48px',
            height: '48px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 24,
        },
        icon: {
            color: 'rgba(255, 255, 255, 0.7)'
        }
    };
});
export default function ViewerRoute() {
    const classes = styles();

    const history = useHistory();

    const onBack = () => {
        history.push('/editor');
    }

    return (
        <>
            <Scene />
            <div className={classes.backButtonContainer}>
                <IconButton onClick={onBack}>
                    <ArrowBackIcon className={classes.icon} />
                </IconButton>
            </div>
        </>
    );
}
