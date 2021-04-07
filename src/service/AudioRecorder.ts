class AudioRecorder {
	private mediaStream: MediaStream;
	private mediaRecorder: MediaRecorder;
	private recordedDataChunks: Blob[] = [];

	private recordStartTime: Date;
	private recordEndTime: Date;

	public onDataAvailable: (data: string, duration: number) => void;

	public async requestMediaDeviceAccess(): Promise<void> {
		if (navigator.mediaDevices) {
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: true
			});

			this.mediaRecorder = new MediaRecorder(this.mediaStream);
			this.mediaRecorder.onstop = this.onMediaAvailable.bind(this);
			this.mediaRecorder.ondataavailable = this.onChuckRecorded.bind(this);
		}
	}

	public startRecording(): void {
		this.recordedDataChunks = [];
		this.recordStartTime = new Date();

		this.mediaRecorder.start();
	}

	public stopRecording(): void {
		if (this.mediaRecorder.state === 'recording') {
			this.recordEndTime = new Date();

			this.mediaRecorder.stop();
		}
	}

	private onMediaAvailable() {
		const audioBlob = new Blob(this.recordedDataChunks);

		const duration = (this.recordEndTime.getTime() - this.recordStartTime.getTime()) / 1000;

		this.onDataAvailable(URL.createObjectURL(audioBlob), duration);
	}

	private onChuckRecorded(event: BlobEvent) {
		this.recordedDataChunks.push(event.data);
	}
}
export default new AudioRecorder();
