import { useEffect, useRef, useState } from 'react';

import {
    IconButton,
    Typography,
    makeStyles,
    Box,
    Slider,
    Switch,
    Button,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

import EditorFileSelector from './EditorFileSelector';
import { connect } from 'react-redux';
import { showSnackbar } from '../../redux/actions';
import byteToMegabyte from '../../util/ByteToMegabyte';
import FileLoaderUtil from '../../util/FileLoader';

const styles = makeStyles(() => {
    return {
        audioSelectorContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        audioSelectorTitle: {
            paddingRight: '16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
        },
        audioSelectorControls: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0px -1px 1px rgba(0, 0, 0, 0.08), 1px 0px 1px rgba(0, 0, 0, 0.08), -1px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 1px rgba(0, 0, 0, 0.08);',
            borderRadius: '12px',
        },
        audioSelectorFileName: {
            height: '48px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
        audioSelectorIcon: {
            cursor: 'pointer',
        },
        audioSelectorPlayControls: {
            height: '48px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
        audioSelectorVolumeControl: {
            height: '48px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: '16px',
            paddingRight: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
        },
        audioSelectorLoopControl: {
            height: '48px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: '16px',
            paddingRight: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            justifyContent: 'space-between',
            borderRadius: '0px 0px 12px 12px',
        },
    };
});
function EditorAudioSelector({
    title,
    name,
    loop,
    data,
    volume,
    maxFileSize,
    onChange,
    onPlayInLoopChange,
    onVolumeChange,
    onRemove,
    showSnackbarAction
}) {
    const classes = styles();

    const audioElement = useRef();

    const [audioData, setAudioData] = useState(data || null);
    const [fileName, setFileName] = useState(name || '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        audioElement.current.addEventListener('canplaythrough', setDurationCallback);
        audioElement.current.addEventListener('timeupdate', setCurrentTimeCallback);
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            audioElement.current.pause();
        } else {
            audioElement.current.play();
        }
    }, [isPlaying]);

    const onAudioSelected = (event) => {
        const file = event.target.files[0];

        processSelectedFile(file);
    };

    const processSelectedFile = async (file) => {
        const fileTooLarge = file.size > maxFileSize;
        if (fileTooLarge) {
            showSnackbarAction(`File is too big. File should be less than ${byteToMegabyte(maxFileSize)} megabytes`);
            return;
        }

        // Verify if input file is of valid type and format
        try {
            await FileLoaderUtil.validateFileLoadEvent(file, 'audio');
        }
        catch (error) {
            showSnackbarAction(error);
            return;
        }

        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            setAudioData(fileReader.result);
            setFileName(file.name);

            onChange(fileReader.result, file.name, file.type);
        };
        fileReader.readAsDataURL(file);
    }

    const removeAudio = () => {
        setAudioData(null);
        setFileName('');

        onRemove();
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const onSeek = (event, time) => {
        setCurrentTime(time);

        audioElement.current.currentTime = time;
    };

    const togglePlayInLoop = () => {
        onPlayInLoopChange(!loop);
    };

    const handleVolumeChange = (event, value) => {
        audioElement.current.volume = value / 100;

        onVolumeChange(Math.max(0.01, value / 100));
    }

    const setCurrentTimeCallback = () => {
        if (!audioElement.current) {
            return;
        }
        setCurrentTime(audioElement.current.currentTime);
    }

    const setDurationCallback = () => {
        if (!audioElement.current) {
            return;
        }
        setDuration(audioElement.current.duration);
    }

    return (
        <div className={classes.audioSelectorContainer}>
            <audio
                ref={audioElement}
                src={audioData}
                loop={loop}
            />

            <div className={classes.audioSelectorTitle}>
                <Typography variant="body1">
                    {title}
                </Typography>
            </div>
            <input
                type="file"
                accept="audio/mp3, audio/wav, audio/mpeg, audio/x-wav, audio/aac, audio/x-m4a"
                id="audio-selector-input"
                style={{ display: 'none' }}
                onChange={onAudioSelected}
            />
            {!audioData
            && (
                <EditorFileSelector accept="audio/mp3, audio/wav, audio/mpeg, audio/x-wav, audio/aac, audio/x-m4a" onChange={processSelectedFile}>
                    <Button variant="outlined" fullWidth >
                        Select audio
                    </Button>
                </EditorFileSelector>
            )}
            {audioData
            && (
                <div className={classes.audioSelectorControls}>
                    <div className={classes.audioSelectorFileName}>
                        <Typography variant="body2">
                            {fileName}
                        </Typography>
                        <IconButton onClick={removeAudio}>
                            <Close />
                        </IconButton>
                    </div>
                    <div className={classes.audioSelectorPlayControls}>
                        <img src="icons/play-small.svg" className={classes.audioSelectorIcon} onClick={togglePlay} alt="play" />
                        <Box m={1} />
                        <Slider value={currentTime} max={duration} min={0} onChange={onSeek} />
                    </div>
                    <div className={classes.audioSelectorVolumeControl}>
                        <img src="icons/volume-on.svg" className={classes.audioSelectorIcon} alt="volume-control" />
                        <Box m={1} />
                        <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                            Playback volume
                        </Typography>
                        <Box m={1} />
                        <Slider value={volume * 100} max={100} min={0} onChange={handleVolumeChange} />
                    </div>
                    <div className={classes.audioSelectorLoopControl}>
                        <div style={{ display: 'flex' }}>
                            <img src="icons/loop.svg" alt="play-in-loop" />
                            <Box m={1} />
                            <Typography variant="body2">
                                Play in-loop
                            </Typography>
                        </div>
                        <div>
                            <Switch checked={loop || false} onChange={togglePlayInLoop} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = () => {
    return {};
};

export default connect(
    mapStateToProps,
    {
        showSnackbarAction: showSnackbar,
    },
)(EditorAudioSelector);
