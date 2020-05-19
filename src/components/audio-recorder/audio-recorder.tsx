import React from 'react';

import audioRecorderService from 'ui/editor/util/audioRecorderService';
import settingsInteractor from 'core/settings/settingsInteractor';
import { generateUniqueId } from 'data/util/uuid';

import './audio-recorder.scss';

interface AudioRecorderProps {
	onRecorded: (data: any) => void;
	maxRecordTime?: number;
	className?: string;
}

interface AudioRecorderState {
	isRecording: boolean;
	timerCounter: number | string;
}

const backgroundColorOff = new Uint8Array([173, 0, 52]);   //i.e. $color-red-dark
const backgroundColorOn = new Uint8Array([255, 53, 113]);  //i.e. $color-pink

export default class AudioRecorder extends React.Component<AudioRecorderProps, AudioRecorderState> {
	private intervalId: any;
	private isStarting: boolean = false;
	private _timerId = null;
	public showTimer: boolean = false;
	public intervalCounter: any = '';

	private audioRecorderButton = React.createRef<HTMLDivElement>();

	constructor(props: AudioRecorderProps) {
		super(props);

		this.state = {
			isRecording: false,
			timerCounter: ''
		};

		this.onClick = this.onClick.bind(this);
	}

	public componentWillUnmount() {
			// cancel current recording
			//this.isAnimating = false;
			if (this.state.isRecording) {
				audioRecorderService.stopRecording()
				.then(dataUrl => {
				})
				.catch(error => console.error(error));
			}
			clearInterval(this.intervalId);
	}

	public render() {
		return (
			<div
				ref={this.audioRecorderButton}
				onClick={this.onClick}
				className={`audio-editor__record-button room-editor__audio-record-button audio-recorder ${this.state.isRecording ? 'circle-beacon' : ''} ${this.props.className ? this.props.className : ''}`}>
					{this.state.timerCounter}
			</div>
		);
	}

	private onClick($event) {
		const notRecording = !this.state.isRecording;
		const notStarting = !this.isStarting;
	
		this.clearTimer();
	
		if (notRecording && notStarting) {
			this.startPreparingCountdown()
		} else if(notStarting) {
			this.stopRecording();
		} else {
			this.stopPreparingCountdown()
		}
	}
	
	private startPreparingCountdown(){
		this.setState({
			timerCounter: 3
		})
		this.showTimer = true;
		this.isStarting = true;
		this._timerId = setInterval(() => {
			this.setState({
				timerCounter: (this.state.timerCounter as number) - 1
			});
	
			if (this.state.timerCounter === 0) {
				this.stopPreparingCountdown();
				this.startRecording();
				
			}
		}, 1000);
	}
	
	private stopPreparingCountdown(){
		this.clearTimer();
		this.isStarting = false;
	}
	
	private clearTimer() {
		if (this._timerId) {
			this.setState({
				timerCounter: '',
			})
			clearInterval(this._timerId);
			this.showTimer = false;
			this._timerId = null;
		}
	}
	
	private startRecording() {
		console.log('recording')
		this.setState({
			isRecording: true,
			timerCounter: settingsInteractor.settings.maxClipDuration
		});
		audioRecorderService.startRecording()
		.then(resolve => {
			//this.isAnimating = true;
			this.animateRecordButton.bind(this);
		})
		.catch(error => console.log('error getting mic node', error));
	
		this._timerId = setInterval(() => {
			this.setState({
				timerCounter: (this.state.timerCounter as number) - 1,
			})
	
			if (this.state.isRecording && this.state.timerCounter === 0) {
				this.stopRecording();
			}
		}, 1000);
	}
	
	private stopRecording() {
		//this.isAnimating = false;
		this.setState({
			isRecording: false,
		})
		this.clearTimer()
		audioRecorderService.stopRecording()
		.then(dataUrl => {
			const uniqueId: string = generateUniqueId();
	
			this.props.onRecorded({
			  fileName: `${uniqueId}.wav`,
			  dataUrl: dataUrl,
			});
		  })
		  .catch(error => console.error(error));
	
		this.setButtonColor(`rgb(${backgroundColorOff[0]}, ${backgroundColorOff[1]}, ${backgroundColorOff[2]})`);
	  }
	
	  private animateRecordButton() {
		if (!this.state.isRecording) return;
		const windowFrequencyData = audioRecorderService.getFrequencyData();
		const histogramSum = windowFrequencyData.reduce((sum, item) => sum + item, 0);
		const meanValue = histogramSum / windowFrequencyData.length;
		const normalValue = Math.min(meanValue, 100) / 100;
		const color = linearInterpolate(backgroundColorOff, backgroundColorOn, normalValue);
		const cssColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
	
		this.setButtonColor(cssColor);
		requestAnimationFrame(this.animateRecordButton.bind(this));
	  }
	
	  private setButtonColor(color: string) {
		this.audioRecorderButton.current.setAttribute('style', `background-color: ${color}`);
	  }
}

function linearInterpolate(u, v, value) {
	const inverseValue = 1 - value;
	return {
	  r: linearInterpolateValue(u[0], v[0], value, inverseValue),
	  g: linearInterpolateValue(u[1], v[1], value, inverseValue),
	  b: linearInterpolateValue(u[2], v[2], value, inverseValue),
	};
  }
  
  function linearInterpolateValue(u, v, value, inverseValue) {
	return Math.floor(u * inverseValue + v * value);
  }