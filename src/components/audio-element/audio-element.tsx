import React from 'react';

import './audio-element.scss';

interface AudioElementProps {
	src: any;
	loop: boolean;
	volume: number;
	onVolumeChange: (event) => void;
}

interface AudioElementState {
	isPlaying: boolean;
	currentTime: number;
	totalDuration: number;
	currentTimeFormatted: string;
	totalDurationFormatted: string;
	currentTimePercent: number;
	isMuted: boolean;
}

export default class AudioElement extends React.Component<AudioElementProps, AudioElementState> {
	private _audioEl = React.createRef<HTMLAudioElement>();
	private _progressLineEl = React.createRef<HTMLDivElement>();
	private _progressPlayedEl = React.createRef<HTMLDivElement>();
	private _volumeLineEl = React.createRef<HTMLDivElement>();
	private _volumeFaderEl = React.createRef<HTMLDivElement>();

	private _isMovingPlayback = false;

	constructor(props: AudioElementProps) {
		super(props);

		this.state = {
			isPlaying: false,
			currentTime: 0,
			totalDuration: 0,
			currentTimeFormatted: '',
			totalDurationFormatted: '',
			currentTimePercent: 0,
			isMuted: false,
		};

		this.togglePlay = this.togglePlay.bind(this);
		this.toggleMuted = this.toggleMuted.bind(this);
	}

	public componentDidMount() {
		const audio = this._audioEl.current;
		audio.volume = this.props.volume || 1
		// Set duration of audio
		audio.addEventListener(
			"canplaythrough",
			() => {
				this.setState({
					totalDuration: audio.duration,
					totalDurationFormatted: this.formatTime(audio.duration),
					currentTimePercent: 100 * (this.state.currentTime / audio.duration),
					currentTimeFormatted: this.formatTime(this.state.currentTime),
				});
			},
			false
		);
		// Set update of current time
		audio.addEventListener("timeupdate", () => {
			if(!this._isMovingPlayback) {
				this.setState({
					currentTime: audio.currentTime,
					currentTimeFormatted: this.formatTime(audio.currentTime),
					currentTimePercent: 100 * (audio.currentTime / this.state.totalDuration)
				});
			}
		});
		// Set initial state on end play
		audio.addEventListener("ended", () => {
			this.setState({
				isPlaying: false,
			});
			audio.currentTime = 0
		})
		// Setup progress line
		this.setupProgressLine()
		this.setupVolumeFader()
	}

	public render() {
		return (
			<div style={{width: '100%'}}>
				<audio
					ref={this._audioEl}
					src={this.props.src}
					loop={this.props.loop}
					onVolumeChange={this.props.onVolumeChange}
					className="room-editor__audio-player"
				>
				</audio>
				<div className="player">
					{this.state.isPlaying && <img src='assets/icons/player/pause.svg' className='player-icon' onClick={this.togglePlay}/>}
					{!this.state.isPlaying && <img src='assets/icons/player/play.svg' className='player-icon' onClick={this.togglePlay}/>}

					<div className="progress" ref={this._progressLineEl}>
						<div className="time">
							{this.state.currentTimeFormatted} / {this.state.totalDurationFormatted}
						</div>
						<div className="played" ref={this._progressPlayedEl} style={{width: this.state.currentTimePercent+'%'}}>
						</div>
					</div>

					{this.state.isMuted && <img src='assets/icons/player/mute.svg' className='player-icon' onClick={this.toggleMuted}/>}
					{!this.state.isMuted && <img src='assets/icons/player/speaker.svg' className='player-icon' onClick={this.toggleMuted}/>}

					<div className="volume" ref={this._volumeLineEl}>
						<div ref={this._volumeFaderEl} className="volume-fader">
						</div>
					</div>

					<a href={this.props.src} download>
						<img src='assets/icons/player/download.svg' className='player-icon'/>
					</a>
				</div>
			</div>
		);
	}

	private formatTime(seconds: number) {
		let date = new Date(null);
		date.setSeconds(seconds); 
		return date.toISOString().substr(14,5);
	}

	private togglePlay() {
		this._audioEl.current[this.state.isPlaying ? 'pause' : 'play']()
		this.setState({
			isPlaying: !this.state.isPlaying,
		});
	}

	private toggleMuted(){
		this._audioEl.current.muted = !this.state.isMuted;
		this.setState({
			isMuted: !this.state.isMuted
		});
	}

	private setupProgressLine() {
		const progressPlayed = this._progressPlayedEl.current
		const progressLine = this._progressLineEl.current
		let newWidthPercent;
	
		let startEvent = (e) => {
			const pageXOffset = window.pageXOffset;
			const progressLineX = pageXOffset + progressLine.getBoundingClientRect().left
			this._isMovingPlayback = true;

			let moveEvent = (e) => {
				const x = e.pageX || e.touches[0].pageX;
				let newWidth = x - progressLineX;
	
				if (newWidth < 0) {
					newWidth = 0
				}
	
				if (newWidth > progressLine.offsetWidth) {
					newWidth = progressLine.offsetWidth
				}
			
				newWidthPercent = 100 / progressLine.offsetWidth * newWidth;
				progressPlayed.style.width = `${newWidthPercent}%`
			}
	
			let endEvent = () => {
				document.removeEventListener("mousemove", moveEvent,false)
				document.removeEventListener("touchmove", moveEvent, false)
				document.removeEventListener("mouseup", endEvent,false) 
				document.removeEventListener("touchend", endEvent, false) 
	
				this._audioEl.current.currentTime = this.state.totalDuration / 100 * newWidthPercent;
				this._isMovingPlayback = false;
			}
			moveEvent(e);
			document.addEventListener("mousemove", moveEvent)
			document.addEventListener("touchmove", moveEvent)
			document.addEventListener('mouseup', endEvent, false)
			document.addEventListener("touchend",endEvent,false)
		}
		progressLine.addEventListener("mousedown", startEvent )
		progressLine.addEventListener("touchstart", startEvent )
	}
	
	private setupVolumeFader() {
		const volumeFader = this._volumeFaderEl.current;
		const volumeLine = this._volumeLineEl.current;
		volumeFader.style.left = this._audioEl.current.volume * 100 + '%';
		let startEvent = (e) => {
			let newLeftPercent;
	
			const pageXOffset = window.pageXOffset;
			const volumeLineX = pageXOffset + volumeLine.getBoundingClientRect().left
	
			let moveEvent = (e) => {
				const x = e.pageX || e.touches[0].pageX
				let newLeft = x - volumeLineX
	
				if (newLeft < 0) {
					newLeft = 0
				}
	
				let rightEdge = volumeLine.offsetWidth - volumeFader.offsetWidth
	
				if (newLeft > rightEdge) {
					newLeft = rightEdge
				}
			
				newLeftPercent = 100 / volumeLine.offsetWidth * newLeft;
	
				volumeFader.style.left = `${newLeftPercent}%`;
				this._audioEl.current.volume = newLeftPercent / 100;
			}
			let endEvent = () => {
				document.removeEventListener("mousemove", moveEvent,false)
				document.removeEventListener("touchmove", moveEvent, false)
				document.removeEventListener("mouseup", endEvent,false) 
				document.removeEventListener("touchend", endEvent, false) 
			}
			moveEvent(e)
			document.addEventListener("mousemove", moveEvent)
			document.addEventListener("touchmove", moveEvent)
			document.addEventListener('mouseup', endEvent, false)
			document.addEventListener("touchend",endEvent,false)
		}
		volumeLine.addEventListener("mousedown", startEvent )
		volumeLine.addEventListener("touchstart", startEvent )
	}
}
