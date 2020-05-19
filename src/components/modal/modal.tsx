import React from 'react';
import uuid from 'uuid/v1';

import MessageModal from './message-modal/message-modal';

import openModalEvent, { OpenModalEventData } from 'root/events/open-modal-event';

import './modal.scss';
import LoadingModal from './loading-modal/loading-modal';
import ShareableModal from './shareable-modal/shareable-modal';
import PlayStoryModal from './play-story-modal/play-story-modal';

interface ModalState {
	modalType: string;
	open: boolean;
	headerText: string;
	bodyText: string;
	isMessage: boolean;
	shareableData?: any;
	callback?: (isDualScreen: boolean) => void;
}

export default class Modal extends React.Component<{}, ModalState> {
	private _openEventId = uuid();

	private promiseResolve: any;

	constructor(props: {}) {
		super(props);

		this.state = {
			modalType: '',
			open: false,
			bodyText: '',
			headerText: '',
			isMessage: true,
		};

		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
	}

	public componentDidMount() {
		openModalEvent.subscribe({
			id: this._openEventId,
			callback: this.open
		});
	}

	public render() {
		return (
			this.state.open &&
			<div className='modal'>
				{this.state.modalType === 'message' &&
				<MessageModal
					onClose={this.close}
					headerText={this.state.headerText}
					bodyText={this.state.bodyText}
					isMessage={this.state.isMessage}>
				</MessageModal>}

				{this.state.modalType === 'loader' &&
				<LoadingModal
					message={this.state.bodyText}>
				</LoadingModal>}

				{this.state.modalType === 'shareable' &&
				<ShareableModal
					onClose={this.close}
					shareableData={this.state.shareableData}>
				</ShareableModal>}

				{this.state.modalType === 'play-story' &&
				<PlayStoryModal
					onClose={this.close}>
				</PlayStoryModal>}
			</div>
		);
	}

	private open(data: OpenModalEventData) {
		this.setState({
			headerText: data.headerText,
			bodyText: data.bodyText,
			isMessage: data.isMessage,
			modalType: data.modalType,
			open: true,
			shareableData: data.shareableData,
			callback: data.callback,
		});
		
		data.promise?.then(() => {
			this.state.modalType === 'loader' && this.close(false);
		});

		return new Promise((resolve) => {
			this.promiseResolve = resolve;
		});
	}

	private close(accepted?: boolean, isDualScreen?: boolean) {
		if (!this.promiseResolve) {
			this.setState({
				open: false,
			});
			if(this.state.callback) {
				this.state.callback(isDualScreen);
			}

			return;
		}

		this.setState({
			open: false,
		});
		this.promiseResolve(accepted);
	}
}

/*
<div
  *ngIf="isOpen"
  class="modal">

  <loading-modal
    *ngIf="isLoaderModal()"
    [message]="messageData.bodyText">
  </loading-modal>

  <message-modal
    *ngIf="isMessageModal()"
    (onClose)="closeModal($event)"
    [messageData]="messageData">
  </message-modal>

  <shareable-modal
    *ngIf="isSharableModal()"
    (onClose)="closeModal($event)"
    [shareableData]="shareableData">
  </shareable-modal>

  <play-story-modal
    *ngIf="isPlayStoryModal()"
    (onClose)="closeModal($event)">
  </play-story-modal>
</div>
*/