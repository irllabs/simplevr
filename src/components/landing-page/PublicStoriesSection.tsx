// External libraries
import React, { useEffect, FC, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

// External UI Components
import {
	Typography,
	makeStyles,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Box,
	DialogActions,
	Button,
	CircularProgress,
} from '@material-ui/core';

// Icons
import { Search } from '@material-ui/icons'

// Database
import firebase from '../../firebase/firebase';

// State
import { setPublicStories } from '../../redux/actions';
import { RootState } from '../../redux/reducers';

// Components
import ProjectCard from './ProjectCard';

const styles = makeStyles(() => {
	return {
		container: {
			paddingTop: '48px',
			paddingLeft: '48px',
			paddingRight: '48px',
			boxSizing: 'border-box'
		},
		showMoreContainer: {
			display: 'flex',
			justifyContent: 'center',
			width: '100%',
			paddingTop: '12px',
		},
		seeMoreButton: {
			borderRadius: '24px',
			height: '48px',
		},
		userStoriesSignedInContent: {
			marginTop: '12px',
			marginBottom: '24px',
			display: 'grid',
			gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
			gridGap: '12px',
			width: '100%',
		},
		header: {
			display: 'flex',
			justifyContent: 'space-between'
		},
		icon: {
			color: 'rgba(255, 255, 255, 0.7)',
		},
		messageContainer: {
			width: '100%',
			display: 'flex',
			justifyContent: 'center'
		},
		seeMoreContainer: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			margin: '24px'
		}
	};
});

const mapStateToProps = (state: RootState) => {
	return {
		publicStories: state.publicStories,
	};
};

const mapDispatch = {
	setPublicStoriesAction: setPublicStories
}

const connector = connect(
	mapStateToProps,
	mapDispatch,
);

type ReduxProps = ConnectedProps<typeof connector>

const PublicStoriesSection: FC<ReduxProps> = ({ publicStories, setPublicStoriesAction }: ReduxProps): JSX.Element => {
	const classes = styles();

	const [storiesLoading, setStoriesLoading] = useState(true);
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const [filterBy, setFilterBy] = useState('project-name');
	const [filterValue, setFilterValue] = useState('');
	const [seeMoreVisible, setSeeMoreVisible] = useState(true);

	useEffect(() => {
		loadProjects(false);
	}, []);

	const onOpenFilterDialog = () => {
		setFilterDialogOpen(true);
	}

	const onCloseFilterDialog = () => {
		setFilterDialogOpen(false);
	}

	const onFilterByChange = (event: React.ChangeEvent<{value: string}>) => {
		setFilterBy(event.target.value);
	}

	const onFilterValueChange = (event: React.ChangeEvent<{value: string}>) => {
		setFilterValue(event.target.value)
	}

	const onFilter = () => {
		if (!filterValue) {
			setFilterDialogOpen(false);
			setSeeMoreVisible(true);

			loadProjects(true);
			return;
		}

		setPublicStoriesAction([]);
		setStoriesLoading(true);

		switch(filterBy) {
			case 'project-name':
				filterByProjectName();
				break;
			case 'project-tags':
				filterByProjectTags();
				break;
			case 'project-owner-email':
				filterByProjectOwnerEmail();
				break;
			default:
				break;
		}
		setFilterDialogOpen(false);
	}

	const filterByProjectName = async () => {
		const publicProjects = await firebase.loadPublicStories();

		const filtered = publicProjects.filter((project) => {
			return project.story.name.toLowerCase().indexOf(filterValue.toLowerCase()) > -1;
		});

		setPublicStoriesAction(filtered);
		setStoriesLoading(false);
		setSeeMoreVisible(false);
	}

	const filterByProjectTags = async () => {
		const publicProjects = await firebase.loadPublicStories();

		const filtered = publicProjects.filter((project) => {
			if (!project.story.tags) {
				return false;
			}

			return project.story.tags.toLowerCase().indexOf(filterValue.toLowerCase()) > -1;
		});

		setPublicStoriesAction(filtered);
		setStoriesLoading(false);
		setSeeMoreVisible(false);
	}

	const filterByProjectOwnerEmail = async () => {
		const result = await Promise.all([
			firebase.loadUsers(),
			firebase.loadPublicStories()
		]);

		const users = result[0];
		const publicProjects = result[1];

		const filtered = publicProjects.filter((project) => {
			const userData = users.find((user) => {
				return user.id === project.userId;
			});

			if (!userData) {
				return false;
			}

			return userData.email.toLowerCase().indexOf(filterValue.toLowerCase()) > -1;
		});

		setPublicStoriesAction(filtered);
		setStoriesLoading(false);
		setSeeMoreVisible(false);
	}

	const loadProjects = async (fromStart: boolean) => {
		const projects = await firebase.loadPublicStories(true, fromStart);

		setPublicStoriesAction(projects);
		setStoriesLoading(false);
	}

	const onClearFilter = () => {
		setPublicStoriesAction([]);
		setStoriesLoading(true);

		loadProjects(true);

		setFilterDialogOpen(false);
		setSeeMoreVisible(true);
	}

	const loadAdditionalPublicStories = async () => {
		const publicStoriesPage = await firebase.loadPublicStories(true);

		if (publicStoriesPage.length === 0) {
			setSeeMoreVisible(false);
			return;
		}

		if (publicStoriesPage.length < 8) {
			setSeeMoreVisible(false);
		}

		setPublicStoriesAction([
			...publicStories,
			...publicStoriesPage
		]);
	}

	return (
		<>
			<div className={classes.container}>
				{/* Show a list of public stories */}
				<div>
					<div className={classes.header}>
						<div>
							<Typography variant="body1" className="light-text-90">
								Explore public stories
							</Typography>
							<Typography variant="body2" className="light-text-70">
								Explore public stories
							</Typography>
						</div>
						<div>
							<IconButton onClick={onOpenFilterDialog}>
								<Search className={classes.icon} />
							</IconButton>
						</div>
					</div>
					<div className={classes.userStoriesSignedInContent}>
						{publicStories.map((project) => {
							return (
								<ProjectCard key={project.id} project={project} isPublic />
							);
						})}
					</div>
					<div className={classes.messageContainer}>
						{publicStories.length === 0 && !storiesLoading &&
						<Typography variant='body1' className="light-text-90">
							Nothing found - try updating your filter values
						</Typography>}
						{storiesLoading &&
						<CircularProgress size={24} />}
					</div>
					{seeMoreVisible &&
					<div className={classes.seeMoreContainer}>
						<Button variant='outlined' color='primary' onClick={loadAdditionalPublicStories}>
							See More
						</Button>
					</div>}
					<Box m={5} />
				</div>
			</div>
			<Dialog open={filterDialogOpen} onClose={onCloseFilterDialog}>
				<DialogTitle>
					<Typography variant='body1'>
						Filter Public Stories
					</Typography>
				</DialogTitle>
				<DialogContent>
					<FormControl variant="outlined" fullWidth size="small">
						<InputLabel id="filter-by">Filter by</InputLabel>
						<Select
							labelId="filter-by"
							id="filter-by"
							value={filterBy}
							onChange={onFilterByChange}
							label="Destination room"
						>
							<MenuItem key='project-name' value='project-name'>
								Story name
							</MenuItem>
							<MenuItem key='project-tags' value='project-tags'>
								Story tags
							</MenuItem>
							<MenuItem key='project-owner-email' value='project-owner-email'>
								Story owner email
							</MenuItem>
						</Select>
					</FormControl>
					<Box m={1.5} />
					<TextField size='small' onChange={onFilterValueChange} value={filterValue} fullWidth label='Search text' />
				</DialogContent>
				<DialogActions>
					<Button color='primary' onClick={onClearFilter} >
						Clear
					</Button>
					<Button color='primary' onClick={onFilter} >
						Filter
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
export default connector(PublicStoriesSection);
