import { Avatar, Box, Button, Container, Divider } from '@material-ui/core'
import React, { useContext, useEffect } from 'react'
import { connect } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import { setIsShowingSignInDialog, setUser } from '../../redux/actions'
import _ from 'lodash'
import IconButton from '@material-ui/core/IconButton';
import FirebaseContext from '../../firebase/context'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';


const styles = makeStyles((theme) => ({
    root: {
        height: '96px',
        width: '100%',

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    signInButton: {
        fontWeight: 600
    },
    infoButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 0,
        '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.4)'
        }
    },
    infoButtonLogo: {
        paddingRight: 12,
        paddingLeft: 22
    },
    infoButtonInfoIcon: {
        paddingRight: 22,
        paddingLeft: 12
    },
    divider: {
        height: 48
    },
    paper: {
        marginRight: theme.spacing(2),
        borderRadius: '16px'
    },
    colorPicker: {
        padding: '1rem'
    },
    menuList: {
    },
    menuListItem: {
        paddingTop: '1rem',
        paddingBottom: '1rem',
        textAlign: 'center'
    },
    avatar: props => ({
        border: 'solid 2px ' + props.userColor
    }),
    avatarInitialsOnly: props => ({
        backgroundColor: props.userColor,
        color: '#FFFFFF'
    }),
    userDisplayName: {
        marginTop: 0,
        marginBottom: '0rem',
        paddingTop: '1rem',
        marginLeft: '1rem',
        marginRight: '1rem'
    },
    userEmail: {
        marginLeft: '1rem',
        marginRight: '1rem',
        marginTop: 0,
        fontWeight: 500
    }
}))

function Header ({ isShowingSignInDialog, setIsShowingSignInDialog, user, setUser }) {
    const classes = styles();
    const firebaseContext = useContext(FirebaseContext);
    const onSignInClick = () => {
        setIsShowingSignInDialog(true)
    }
    const getInitials = (name) => {
        let initials = '??'
        if (!_.isNil(name)) {
            const nameParts = name.split(' ')
            if (nameParts.length > 1) {
                initials = nameParts[0][0] + nameParts[1][0]
            } else {
                initials = name[0]
                if (name.length > 1) {
                    initials += name[1]
                }
            }
        }
        return initials
    }
    useEffect(() => {
        firebaseContext.onUserUpdatedObservers.push(async (authUser) => {
            if (!_.isNil(authUser)) {
                // see if this user exists in users collection, if not then we're probably in the middle of signing up so ignore
                let user = await firebaseContext.loadUser(authUser.uid)
                if (!_.isNil(user)) {
                    setUser(user)
                    // }
                } else {
                    console.log('ignoring auth change, probably signing up');
                }
            } else {
                //console.log('signed out', location.pathname);
                /* if (location.pathname !== '/') {
                     setIsShowingSignInDialog(true)
                 }*/
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    function handleListKeyDown (event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
    }

    const onSignOutClick = () => {
        firebaseContext.signOut()
        setUser(null)
    }

    return (
        <Container maxWidth="md">
            <Box className={classes.root} >
                <Button className={classes.infoButton} disableElevation size="large" variant="contained">
                    <img className={classes.infoButtonLogo} src="/logo.svg" />
                    <Divider className={classes.divider} orientation="vertical" flexItem />
                    <img className={classes.infoButtonInfoIcon} src="/icons/info.svg" />
                </Button>
                {
                    !user &&
                    <Button className={classes.signInButton} variant="contained" color="primary" disableElevation size="large" onClick={onSignInClick}>
                        Sign in
                </Button>
                }
                {
                    user &&

                    <>
                        <IconButton
                            ref={anchorRef}
                            aria-controls={open ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            onClick={handleToggle}>
                            {
                                !_.isNil(user.avatar) &&
                                <Avatar className={classes.avatar} alt={user.displayName} src={user.avatar} />
                            }
                            {
                                _.isNil(user.avatar) &&
                                <Avatar className={classes.avatarInitialsOnly} alt={user.displayName} >{getInitials(user.displayName)}</Avatar>
                            }
                        </IconButton>

                        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                            {({ TransitionProps, placement }) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                                >
                                    <Paper size="md">
                                        <ClickAwayListener onClickAway={handleClose}>
                                            <Box >

                                                <h2 className={classes.userDisplayName}>{user.displayName}</h2>
                                                <h3 className={classes.userEmail}>{user.email}</h3>

                                                <Divider />
                                                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                                    <MenuItem onClick={onSignOutClick} className={classes.menuListItem}>Sign out</MenuItem>
                                                </MenuList>
                                            </Box>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </>
                }




            </Box>
        </Container>
    )
}
const mapStateToProps = state => {
    return {
        user: state.user,
        isShowingSignInDialog: state.display.isShowingSignInDialog
    };
};

export default connect(
    mapStateToProps,
    {
        setIsShowingSignInDialog,
        setUser
    }
)(Header);
