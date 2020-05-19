import React from 'react';

import './play-story-modal.scss';

interface PlayStoryModalProps {
	onClose: (isAccepted?: boolean, isDualScreen?: boolean) => void;
}

export default class PlayStoryModal extends React.Component<PlayStoryModalProps, {}> {
	constructor(props: PlayStoryModalProps) {
		super(props);

		this.singleScreen = this.singleScreen.bind(this);
		this.dualScreen = this.dualScreen.bind(this);
	}

	public render() {
		return (
			<div className="overlay-modal">
				<div className="modal__content play-story-modal">
					<h3>You are about to begin your <br/> SimpleVR experience!</h3>
					{this.isMobile &&
					<div className="modal__content-body">
						<button onClick={this.singleScreen}>
							<img src="assets/icons/view-preview-accent.png" alt=""/>
							<h3>Single Screen</h3>
						</button>
						<button onClick={this.dualScreen}>
							<img src="assets/icons/view-preview-accent.png" alt=""/>
							<h3>Dual Screen</h3>
						</button>
					</div>}

					{!this.isMobile &&
					<div className="modal__content-body">
						<button onClick={this.singleScreen}>
							<img src="assets/icons/view-preview-accent.png" alt=""/>
							<h3>Start</h3>
						</button>
					</div>}
				</div>
			</div>
		);
	}

	get isMobile():boolean{
		return typeof window.orientation !== 'undefined'
	}
	
	public singleScreen() {
		this.props.onClose();
	}

	public dualScreen () {
		this.props.onClose(undefined, true);
	}
}