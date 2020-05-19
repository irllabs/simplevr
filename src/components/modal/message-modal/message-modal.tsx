import React from 'react';

import './message-modal.scss';

interface MessageModalProps {
	headerText: string;
	bodyText: string;
	isMessage: boolean;
	onClose: (accepted: boolean) => void;
}

export default class MessageModal extends React.Component<MessageModalProps, {}> {
	constructor(props: MessageModalProps) {
		super(props);
	}

	public render() {
		return (
			<div className="modal__content">
				<div className="modal__content-header">
					{this.props.headerText}
				</div>
				<div className="modal__content-body">
					<p className="modal__content-body-text">
						{this.props.bodyText}
					</p>

					{!this.props.isMessage &&
					<div>
						<p
							onClick={() => {
								this.props.onClose(false);
							}}
							className="modal__content-body-close">
								Close
						</p>
					</div>}

					{this.props.isMessage &&
					<div className="modal__content-body-options">
						<p
							onClick={() => {
								this.props.onClose(false);
							}}
							className="modal__content-body-close">
								Cancel
						</p>
						<p
							onClick={() => {
								this.props.onClose(true);
							}}
							className="modal__content-body-close">
								OK
						</p>
					</div>}
				</div>
			</div>
		);
	}
}
