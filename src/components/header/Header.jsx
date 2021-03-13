import {
    Box,
    Button,
    Container,
    Divider,
} from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import UserProfile from '../user-profile/UserProfile';

const styles = makeStyles((theme) => {
    return {
        root: {
            height: '96px',
            width: '100%',

            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        signInButton: {
            borderRadius: '24px',
            height: '48px',
        },
        infoButton: {
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 0,
            '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.4)',
            },
            borderRadius: '24px',
        },
        infoButtonLogo: {
            paddingRight: 12,
            paddingLeft: 22,
        },
        infoButtonInfoIcon: {
            paddingRight: 22,
            paddingLeft: 12,
        },
        divider: {
            height: 48,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        paper: {
            marginRight: theme.spacing(2),
            borderRadius: '16px',
        },
        colorPicker: {
            padding: '1rem',
        },
        menuList: {
        },
        menuListItem: {
            paddingTop: '1rem',
            paddingBottom: '1rem',
            textAlign: 'center',
        },
        avatar: (props) => {
            return {
                border: `solid 2px ${props.userColor}`,
            };
        },
        avatarInitialsOnly: (props) => {
            return {
                backgroundColor: props.userColor,
                color: '#FFFFFF',
            };
        },
        userDisplayName: {
            marginTop: 0,
            marginBottom: '0rem',
            paddingTop: '1rem',
            marginLeft: '1rem',
            marginRight: '1rem',
        },
        userEmail: {
            marginLeft: '1rem',
            marginRight: '1rem',
            marginTop: 0,
            fontWeight: 500,
        },
    };
});

export default function Header() {
    const classes = styles();

    return (
        <Container maxWidth="md">
            <Box className={classes.root}>
                <Button className={classes.infoButton} disableElevation size="large" variant="contained">
                    <img className={classes.infoButtonLogo} src="/logo.svg" alt="logo" />
                    <Divider className={classes.divider} orientation="vertical" flexItem />
                    <img className={classes.infoButtonInfoIcon} src="/icons/info.svg" alt="info" />
                </Button>
                <UserProfile />
            </Box>
        </Container>
    );
}
