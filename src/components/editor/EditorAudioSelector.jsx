import { useEffect, useRef, useState } from 'react';

import {
    IconButton,
    Typography,
    makeStyles,
    Box,
    Slider,
    Switch,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

import EditorFileSelector from './EditorFileSelector';

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
export default function EditorAudioSelector({
    title,
    name,
    data,
    onChange,
    onRemove,
}) {
    const classes = styles();

    const audioElement = useRef();

    const [audioData, setAudioData] = useState(data || null);
    const [playInLoop, setPlayInLoop] = useState(false);
    const [fileName, setFileName] = useState(name || '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(50);

    useEffect(() => {
        audioElement.current.addEventListener('canplaythrough', () => {
            setDuration(audioElement.current.duration);
        });

        audioElement.current.addEventListener('timeupdate', () => {
            setCurrentTime(audioElement.current.currentTime);
        });
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            audioElement.current.pause();
        } else {
            audioElement.current.play();
        }
    }, [isPlaying]);

    useEffect(() => {
        audioElement.current.volume = Math.max(0, volume / 100);
    }, [volume]);

    useEffect(() => {
        audioElement.current.loop = playInLoop;
    }, [playInLoop]);

    const onAudioSelected = (event) => {
        const file = event.target.files[0];

        processSelectedFile(file);
    };

    const processSelectedFile = (file) => {
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

    const onVolumeChange = (event, value) => {
        setVolume(Math.max(0.01, value));
    };

    const togglePlayInLoop = () => {
        setPlayInLoop(!playInLoop);
    };

    return (
        <div className={classes.audioSelectorContainer}>
            <audio
                ref={audioElement}
                src={audioData}
                loop={playInLoop}
            />

            <div className={classes.audioSelectorTitle}>
                <Typography variant="body1">
                    {title}
                </Typography>
            </div>
            <input type="file" id="audio-selector-input" style={{ display: 'none' }} onChange={onAudioSelected} />
            {!audioData
            && (
                <EditorFileSelector onChange={processSelectedFile} />
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
                        <Slider value={volume} max={100} min={0} onChange={onVolumeChange} />
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
                            <Switch checked={playInLoop} onChange={togglePlayInLoop} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
