// External libraries
import _ from 'lodash';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { connect } from 'react-redux';

// External UI Components
import {
    Avatar,
    Box,
    Button,
    ClickAwayListener,
    Divider,
    Grow,
    IconButton,
    makeStyles,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Typography,
} from '@material-ui/core';

// Actions
import { setIsShowingSignInDialog, setUser } from '../../redux/actions';

// Database
import firebase from '../../firebase/firebase.ts';
import { useHistory } from 'react-router';

const styles = makeStyles(() => {
    return {
        signInButton: {
            borderRadius: '24px',
            height: '48px',
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
function UserProfile({
    setIsShowingSignInDialogProp,
    setUserProp,
    userProp,
}) {
    const classes = styles();

    const history = useHistory();

    const anchorRef = useRef();

    const [open, setOpen] = useState(false);

    useEffect(() => {
        firebase.auth.onAuthStateChanged(async (authUser) => {
            if (!_.isNil(authUser)) {
                const user = await firebase.loadUser(authUser.uid);
                if (!_.isNil(user)) {
					if (!user.favoriteProjects) {
						user.favoriteProjects = [];
					}

                    setUserProp(user);
                }
            }
        });
    }, []);

    const onSignInClick = () => {
        setIsShowingSignInDialogProp(true);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => {
            return !prevOpen;
        });
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
    }

    const onSignOutClick = () => {
        firebase.signOut();
        setUserProp(null);

        history.replace('/');
    };

    return (
        <>
            {!userProp && (
                <Button className={classes.signInButton} variant="contained" color="primary" disableElevation size="large" onClick={onSignInClick}>
                    <Typography variant="h2">
                        Sign in
                    </Typography>
                </Button>
            )}
            {userProp && (
                <>
                    <IconButton
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                    >
                        {
                            !_.isNil(userProp.avatar)
                            && <Avatar className={classes.avatar} alt={userProp.displayName} src={userProp.avatar} />
                        }
                        {
                            _.isNil(userProp.avatar)
                            && <Avatar className={classes.avatarInitialsOnly} alt={userProp.displayName} />
                        }
                    </IconButton>

                    <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{zIndex: 100}}>
                        {({ TransitionProps, placement }) => {
                            return (
                                <Grow
                                    {...TransitionProps}
                                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                                >
                                    <Paper size="md">
                                        <ClickAwayListener onClickAway={handleClose}>
                                            <Box>

                                                <h2 className={classes.userDisplayName}>{userProp.displayName}</h2>
                                                <h3 className={classes.userEmail}>{userProp.email}</h3>

                                                <Divider />
                                                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                                    <MenuItem onClick={onSignOutClick} className={classes.menuListItem}>Sign out</MenuItem>
                                                </MenuList>
                                            </Box>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            );
                        }}
                    </Popper>
                </>
            )}
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        userProp: state.user,
    };
};

export default connect(
    mapStateToProps,
    {
        setIsShowingSignInDialogProp: setIsShowingSignInDialog,
        setUserProp: setUser,
    },
)(UserProfile);
