// External libraries
import React, { FC, useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useHistory } from 'react-router-dom';

// External UI Components
import { IconButton, makeStyles, Menu, MenuItem, Typography } from '@material-ui/core';

// External Icons
import { MoreHoriz, Favorite, FavoriteBorder} from '@material-ui/icons';

// Database
import firebase from '../../firebase/firebase';

// State
import { setCurrentRoom, setOpenedPreviewFromApplication, setProject, setStory } from '../../redux/actions';
import { RootState } from '../../redux/reducers';

// Service
import ProjectArchiveCreator from '../../service/ProjectArchiveCreator';

// Components
import ShareStoryDialog from '../dialogs/ShareStoryDialog';

// Models
import StorageProject from '../../models/storage/StorageProject';
import StorageRoom from '../../models/storage/StorageRoom';
import StoryQRCodeDialog from './QRCodeDialog';

const styles = makeStyles(() => {
	return {
		projectCardContainer: {
			width: '100%',
			backgroundColor: 'white',
			display: 'flex',
			flexDirection: 'column',
			boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.08), -1px 0px 1px rgba(0, 0, 0, 0.08), 1px 0px 1px rgba(0, 0, 0, 0.08), 0px -1px 1px rgba(0, 0, 0, 0.08)',
			borderRadius: '12px',
			height: '200px'
		},
		projectCardHeader: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between'
		},
		projectCardTitle: {
			display: 'flex',
			flexDirection: 'column',
			padding: '12px',
			cursor: 'pointer'
		},
		title: {
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			maxWidth: '140px',
			overflow: 'hidden',
		},
		tags: {
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			maxWidth: '140px',
			overflow: 'hidden',
		},
		cardActionsContainer: {
			display: 'flex',
			flexDirection: 'column',
		},
		storyCardImageContainer: {
			borderRadius: '0px 0px 12px 12px',
			display: 'flex',
			position: 'relative',
			height: '100%',
			cursor: 'pointer'
		},
		storyCardImage: {
			width: '100%',
			height: '100%',
			borderRadius: '0px 0px 12px 12px',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		},
		storyCardOptions: {
			position: 'absolute',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			left: '0px',
			top: '0px',
			width: '100%',
			height: '100%',
			backgroundColor: 'rgba(255, 255, 255, 0.9)',
			borderRadius: '0px 0px 12px 12px',
		},
		icon: {
			color: 'rgba(0, 0, 0, 0.54)'
		}
	};
});

const mapStateToProps = (state: RootState) => {
	return {
		user: state.user,
		users: state.users,
	};
};

const mapDispatch = {
	setProjectAction: setProject,
	setStoryAction: setStory,
	setCurrentRoomAction: setCurrentRoom,
	setOpenedPreviewFromApplicationAction: setOpenedPreviewFromApplication
}

const connector = connect(
	mapStateToProps,
	mapDispatch,
);

type ReduxProps = ConnectedProps<typeof connector>

interface ProjectCardProps extends ReduxProps {
	project: StorageProject;
	isPublic: boolean;
}

const ProjectCard: FC<ProjectCardProps> = ({
	project,
	isPublic,
	user,
	users,
	setProjectAction,
	setStoryAction,
	setCurrentRoomAction,
	setOpenedPreviewFromApplicationAction
}: ProjectCardProps) => {
	const classes = styles();

	const history = useHistory();

	const menuAnchorRef = useRef();

	const [menuOpen, setMenuOpen] = useState(false);
	const [favorite, setFavorite] = useState(false);
	const [thumbnailUrl, setThumbnailUrl] = useState('');
	const [shareStoryDialogOpen, setShareStoryDialogOpen] = useState(false);
	const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);

	useEffect(() => {
		const fetchProjectThumbnailUrl = async() => {
			const firstRoom = getHomeRoom(project.story.rooms);

			const url = await firebase.getDownloadUrl(firstRoom.thumbnail.remoteFilePath);

			setThumbnailUrl(url);
		}

		fetchProjectThumbnailUrl();
	}, [project]);

	useEffect(() => {
		if (!user) {
			return;
		}

		const isFavorite = user.favoriteProjects.indexOf(project.id) > -1;
		setFavorite(isFavorite);
	}, [user, project]);

	const onOpenShareStory = () => {
		setShareStoryDialogOpen(true);
		setMenuOpen(false);
	};

	const onCloseShareStory = () => {
		setShareStoryDialogOpen(false);
	};

	const onEditStory = async () => {
		if (isPublic) {
			return;
		}

		const projectModel = await firebase.loadProject(project);

		// Set newly loaded story (and first room) as active story in redux
		setProjectAction(projectModel);
		setStoryAction(projectModel.story);
		setCurrentRoomAction(projectModel.story.rooms[0]);

		// Navigate to editor for further story edits
		history.push('/editor');
	};

	const onViewStory = async () => {
		const projectModel = await firebase.loadProject(project);

		// Set newly loaded story (and first room) as active story in redux
		setProjectAction(projectModel);
		setStoryAction(projectModel.story);
		setCurrentRoomAction(projectModel.story.rooms[0]);

		setOpenedPreviewFromApplicationAction(true);

		history.push(`/view/${project.id}`);
	}

	const getHomeRoom = (rooms: StorageRoom[]) => {
		let homeRoom = rooms.find((room) => {
			return room.isHome;
		});
		if (!homeRoom) {
			homeRoom = rooms[0];
		}
		return homeRoom;
	}

	const onDownloadStoryArchive = async () => {
		const archiver = new ProjectArchiveCreator();
		archiver.create(project);

		setMenuOpen(false);
	}

	const onOpenMenu = () => {
		setMenuOpen(true);
	}

	const onCloseMenu = () => {
		setMenuOpen(false);
	}

	const markProjectAsFavorite = () => {
		firebase.addProjectAsFavorite(user, project.id);

		setFavorite(true);
	}

	const unmarkProjectAsFavorite = () => {
		firebase.removeProjectFromFavorites(user, project.id);

		setFavorite(false);
	}

	const getNumberOfHotspots = () => {
		let count = 0;
		project.story.rooms.forEach((room) => {
			count += room.hotspots.length;
		});
		return count;
	}

	const getUserEmail = () => {
		const projectCreator = users.find((userData) => {
			return userData.id === project.userId;
		});
		return projectCreator?.email;
	}

	const onOpenQRCodeDialog = () => {
		setQrCodeDialogOpen(true);
	}

	const onCloseQRCodeDialog = () => {
		setQrCodeDialogOpen(false);
	}

	return (
		<div className={classes.projectCardContainer}>
			<div className={classes.projectCardHeader}>
				<div className={classes.projectCardTitle} onClick={isPublic ? onViewStory : onEditStory}>
					<Typography variant="body2" className={classes.title}>
						{project.story.name}
					</Typography>
					<Typography variant="caption" className={classes.title}>
						Rooms: {project.story.rooms.length}
					</Typography>
					<Typography variant="caption" className={classes.title}>
						Hotspots: {getNumberOfHotspots()}
					</Typography>
					{isPublic &&
					<Typography variant="caption" className={classes.title}>
						Creator: {getUserEmail()}
					</Typography>}
					<Typography variant="caption" className={classes.tags}>
						Tags:
						{
							project.story.tags || ''
						}
					</Typography>
				</div>
				<div className={classes.cardActionsContainer}>
					{/* Only show edit options for user stories */}
					{!isPublic && (
						<>
							<IconButton ref={menuAnchorRef} aria-controls="card-menu" aria-haspopup="true" onClick={onOpenMenu}>
								<MoreHoriz />
							</IconButton>
							<Menu

								id="simple-menu"
								anchorEl={menuAnchorRef.current}
								keepMounted
								open={menuOpen}
								onClose={onCloseMenu}
							>
								<MenuItem onClick={onOpenShareStory}>
									<Typography variant='body2'>
										Share
									</Typography>
								</MenuItem>
								<MenuItem onClick={onDownloadStoryArchive}>
									<Typography variant='body2'>
										Download (.zip)
									</Typography>
								</MenuItem>
							</Menu>
						</>
					)}
					{isPublic && (
						<>
							{!favorite && user &&
							<IconButton onClick={markProjectAsFavorite}>
								<FavoriteBorder />
							</IconButton>}
							{favorite && user &&
							<IconButton onClick={unmarkProjectAsFavorite}>
								<Favorite color='primary' />
							</IconButton>}
							<IconButton onClick={onOpenQRCodeDialog}>
								<img src='/icons/qr-code.svg' className={classes.icon} />
							</IconButton>
						</>
					)}
				</div>
			</div>
			<div className={classes.storyCardImageContainer} onClick={isPublic ? onViewStory : onEditStory}>
				{thumbnailUrl
				&& (
					<div
						className={classes.storyCardImage}
						style={{
							backgroundImage: `url(${thumbnailUrl})`,
						}}
					/>
				)}
			</div>
			{shareStoryDialogOpen && <ShareStoryDialog onClose={onCloseShareStory} thumbnailUrl={thumbnailUrl} project={project} />}
			{qrCodeDialogOpen && <StoryQRCodeDialog project={project} onClose={onCloseQRCodeDialog} />}
		</div>
	);
}
export default connector(ProjectCard);
