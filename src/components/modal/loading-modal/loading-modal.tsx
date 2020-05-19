import React from 'react';

import './loading-modal.scss';

interface LoadingModalProps {
	message: string;
}

export default class LoadingModal extends React.Component<LoadingModalProps, {}> {
	constructor(props: LoadingModalProps) {
		super(props);
	}

	public render() {
		return (
			<div className="modal__content">
				<div className="modal__content-header">
					<div className=" modal__content__loader"></div>
				</div>
				<div className="modal__content-body">
					<p className="modal__content-body-text">
						{this.props.message}
					</p>
				</div>
			</div>
		);
	}
}