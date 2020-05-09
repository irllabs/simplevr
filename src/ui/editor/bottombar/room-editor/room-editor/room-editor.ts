import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Audio } from 'data/scene/entities/audio';

import { Narrator } from 'data/scene/entities/narrator';
import { Room } from 'data/scene/entities/room';
import { reverbList } from 'data/scene/values/reverbList';
import { resizeImage } from 'data/util/imageResizeService';

import { DEFAULT_VOLUME } from 'ui/common/constants';
import eventBus from 'ui/common/event-bus';
import { browserCanRecordAudio } from 'ui/editor/util/audioRecorderService';
import { audioDuration } from 'ui/editor/util/audioDuration';
import settingsInteractor from 'core/settings/settingsInteractor';

@Component({
	selector: 'room-editor',
	styleUrls: ['./room-editor.scss'],
	templateUrl: './room-editor.html',
})
export class RoomEditor {

	@Output() onOffClick = new EventEmitter();
	private reverbOptions = reverbList;

	public largeIntroAudioFile: boolean = false;

	constructor(
		private element: ElementRef,
	) {
	}

	@HostListener('document:click', ['$event'])
	private onDocumentClick($event) {
		const isClicked: boolean = this.element.nativeElement.contains($event.target);
		if (!isClicked) {
			this.onOffClick.emit();
		}
	}

	public onBackgroundImageLoad($event) {
		const { maxBackgroundImageSize } = settingsInteractor.settings

		if( $event.file.size/1024/1024 >= maxBackgroundImageSize){
			eventBus.onModalMessage('Error', `File is too large. Max file size is ${maxBackgroundImageSize} mb`)
			return;
		}

		const fileName: string = $event.file.name;
		const binaryFileData: any = $event.binaryFileData;

		eventBus.onStartLoading();

		resizeImage(binaryFileData, 'backgroundImage')
			.then(resized => {
				const room = this.getActiveRoom();

				room.setBackgroundImageBinaryData(resized.backgroundImage);
				room.setThumbnail(resized.thumbnail);

				eventBus.onSelectRoom(null, false);
				eventBus.onStopLoading();
			})
			.catch(error => eventBus.onModalMessage('Image loading error', error));
	}

	public onBackgroundAudioLoad($event) {
		const { maxBackgroundAudioDuration, maxBackgroundAudioFilesize } = settingsInteractor.settings

		if ($event.file.size/1024/1024 >= maxBackgroundAudioFilesize ) {
			eventBus.onModalMessage('Error', `File is too big. File should be less than ${maxBackgroundAudioFilesize} megabytes `)
			return;
		}

		audioDuration($event.file).then(duration => {

			if (duration > maxBackgroundAudioDuration) {
				eventBus.onModalMessage('Error', `Duration of background audio is too long. It should be less than ${maxBackgroundAudioDuration} seconds `)
				return
			}

			this.getActiveRoom().setBackgroundAudio(DEFAULT_VOLUME, $event.binaryFileData);
		})

	}

	public onIntroAudioLoad($event) {
		const { maxNarrationAudioDuration, maxNarrationAudioFilesize } = settingsInteractor.settings
		if ($event.file.size/1024/1024 >= maxNarrationAudioFilesize) {
			eventBus.onModalMessage('Error', `File is too big. File should be less than ${maxNarrationAudioFilesize} megabytes `)
			return;
		}
		this.largeIntroAudioFile = false;

		audioDuration($event.file).then(duration => {
			console.log(duration)
			if (duration > maxNarrationAudioDuration) {
				eventBus.onModalMessage('Error',`Duration of narration audio is too long. It should be less than ${maxNarrationAudioDuration} seconds `)
				return
			}
			this.getNarratorIntroAudio().setIntroAudio(DEFAULT_VOLUME, $event.binaryFileData);
		})


	}

	private onReturnAudioLoad($event) {
		this.getActiveRoom().getNarrator().setReturnAudio($event.binaryFileData);
	}

	private getNarratorIntroAudio(): Narrator {
		return this.getActiveRoom().getNarrator();
	}

	public getBackgroundAudio(): Audio {
		return this.getActiveRoom().getBackgroundAudio();
	}

	public getBackgroundImage() {
		return this.getActiveRoom().getBackgroundImage();
	}

	public getBackgroundAudioVolume(): number {
		return this.getActiveRoom().getBackgroundAudioVolume();
	}

	public getNarratorIntroAudioVolume(): number {
		return this.getNarratorIntroAudio().getVolume();
	}

	public getNarratorIntroAudioFile(): Audio {
		return this.getNarratorIntroAudio().getIntroAudio();
	}

	private getNarratorReturnAudio(): Audio {
		return this.getNarratorIntroAudio().getReturnAudio();
	}

	private getActiveRoom(): Room {
		const activeRoomId = sceneInteractor.getActiveRoomId();
		return sceneInteractor.getRoomById(activeRoomId);
	}

	public onNarratorIntroRecorded($event) {
		this.getActiveRoom().getNarrator().setIntroAudio(DEFAULT_VOLUME, $event.dataUrl);

	}

	public onNarratorReturnRecorded($event) {
		this.getActiveRoom().getNarrator().setReturnAudio($event.dataUrl);
	}

	private onReverbChange($event) {
		this.getActiveRoom().setReverb($event.target.value);
	}

	private getActiveReverb(): string {
		return this.getActiveRoom().getReverb();
	}

	public removeBackgroundAudio() {
		this.getActiveRoom().removeBackgroundAudio();
	}

	public removeNarratorIntroAudio() {
		this.getNarratorIntroAudio().removeIntroAudio();
	}

	public showAudioRecorder(): boolean {
		return browserCanRecordAudio();
	}

	public onNarrationVolumeChange($event) {
		const volume = $event.currentTarget.volume;
		this.getNarratorIntroAudio().setVolume(volume);
	}

	public onBGAVolumeChange($event) {
		const volume = $event.currentTarget.volume;
		this.getActiveRoom().setBackgroundAudioVolume(volume);
	}

	public getRoomName(): string {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		return room.getName();
	}

	public setRoomName($event) {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		room.setName($event.text);
	}
}
