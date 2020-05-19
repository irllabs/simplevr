import React from 'react';

import './hidden-file-loader.scss';
import eventBus, { EventType } from 'ui/common/event-bus';
import zipFileReader from 'ui/editor/util/zipFileReader';
import { Subscription } from 'rxjs/Subscription';
import openHiddenFileLoaderEvent from 'root/events/open-hidden-file-loader-event';
import uuid from 'uuid/v1';

export default class HiddenFileLoader extends React.Component<{}, {}> {
	private _hiddenLabelRef = React.createRef<HTMLLabelElement>();
	
	private _openEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.open = this.open.bind(this);
	}

	public componentDidMount() {
		openHiddenFileLoaderEvent.subscribe({
			id: this._openEventId,
			callback: this.open
		})
	}

	public componentWillUnmount() {
		openHiddenFileLoaderEvent.unsubscribe(this._openEventId);
	}

	public render() {
		return (
			<div className="hidden-file-loader">
				<input
					type="file"
					id="hiddenInput"
					onChange={this.onFileChange}/>

				<label
					ref={this._hiddenLabelRef}
					htmlFor="hiddenInput">
				</label>
			</div>
		);
	}

	private open() {
		this._hiddenLabelRef.current.click()
	}

	private onFileChange(event) {
		const file = event.target.files && event.target.files[0];
		if (!file) {
			eventBus.onModalMessage('Error', 'No valid file selected');
			return;
		}
		zipFileReader.loadFile(file);
	}
}