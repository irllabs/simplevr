import React from 'react';
import mime from 'mime-types';
import { connect } from 'react-redux';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    TextField,
    Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

import EditorAudioSelector from './EditorAudioSelector';

import { setStoryName, setStoryTags, setStorySoundtrack } from '../../redux/actions';
import Soundtrack from '../../models/soundtrack';

const styles = makeStyles(() => {
    return {
        root: {
            padding: '0px',
        },
        titleContainer: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
        },
        closeIcon: {
            position: 'absolute',
        },
    };
});
function EditorEditStory({
    onClose,
    story,
    setStoryNameAction,
    setStoryTagsAction,
    setStorySoundtrackAction,
}) {
    const classes = styles();

    const onNameChange = (event) => {
        setStoryNameAction(event.target.value);
    };

    const onTagsChange = (event) => {
        // Split comma separated tags into an array of tags
        const tags = event.target.value.split(',');

        setStoryTagsAction(tags);
    };

    const onSoundtrackChange = (fileData, fileName, fileMimeType) => {
        const extension = mime.extension(fileMimeType);

        const soundtrack = new Soundtrack();
        soundtrack.fileName = fileName;
        soundtrack.data = fileData;
        soundtrack.extension = extension;

        setStorySoundtrackAction(soundtrack);
    };

    const onSoundtrackRemove = () => {
        const soundtrack = new Soundtrack();

        // Create empty soundtrack
        setStorySoundtrackAction(soundtrack);
    };

    return (
        <Dialog onClose={onClose} open maxWidth="xs" fullWidth>
            <DialogTitle className={classes.root}>
                <IconButton onClick={onClose} className={classes.closeIcon}>
                    <Close />
                </IconButton>
                <div className={classes.titleContainer}>
                    <Typography variant="body1">
                        Edit story
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent>
                <TextField
                    size="small"
                    id="story-name-input"
                    label="Story name"
                    helperText="Enter a short name for your story"
                    variant="outlined"
                    fullWidth
                    onChange={onNameChange}
                    value={story.name}
                />
                <Box m={4} />
                <TextField
                    size="small"
                    fullWidth
                    id="story-tags-input"
                    label="Story tags"
                    helperText="Use comma to add separate tags"
                    variant="outlined"
                    onChange={onTagsChange}
                    value={story.tags.join(',')}
                />
                <Box m={4} />
                <EditorAudioSelector
                    title="Story soundtrack"
                    data={story.soundtrack.data}
                    name={story.soundtrack.fileName}
                    onChange={onSoundtrackChange}
                    onRemove={onSoundtrackRemove}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="primary">
                    Delete story
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const mapStateToProps = (state) => {
    return {
        story: state.project.story,
    };
};

export default connect(
    mapStateToProps,
    {
        setStoryNameAction: setStoryName,
        setStoryTagsAction: setStoryTags,
        setStorySoundtrackAction: setStorySoundtrack,
    },
)(EditorEditStory);
