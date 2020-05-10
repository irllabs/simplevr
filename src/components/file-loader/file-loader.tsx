import React from 'react';
import eventBus from 'ui/common/event-bus';
import fileLoaderUtil from 'ui/editor/util/fileLoaderUtil';

import './file-loader.scss';

interface FileLoaderProps {
	displayText: string;
	acceptedFileType: string;
	maxFileSize: number;
	onFileLoad: (data, file) => void;
}

export default class FileLoader extends React.Component<FileLoaderProps, {}> {
	constructor(props: FileLoaderProps) {
		super(props);

		this.onFileChange = this.onFileChange.bind(this);
	}

	public render() {
		return (
			<div className='file-loader'>
				<input
					type="file"
					id="inputId"
					onChange={this.onFileChange}
					className="file-loader__hidden-input" />

				<label
					id="inputId"
					className="button-full-width"
					htmlFor='inputId'>
						{this.props.displayText}
				</label>
			</div>
		);
	}

	private onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files && event.target.files[0];

		if (!file) {
			eventBus.onModalMessage('Error', 'No valid file selected');
			return;
		}
		
		if (!this.props.acceptedFileType) {
			console.error('file-loader must have an accepted file type');
			return;
		}

		if (this.props.maxFileSize !== null && file.size / 1024 / 1024 > this.props.maxFileSize) {
			eventBus.onModalMessage('Error', `File size could not be greater than ${this.props.maxFileSize}MB`);
			return;
		}

		fileLoaderUtil.validateFileLoadEvent(file, this.props.acceptedFileType)
		.then(fileLoaderUtil.getBinaryFileData.bind(fileLoaderUtil))
		.then(fileData => {
			this.props.onFileLoad(fileData, file);
		})
		.catch(error => eventBus.onModalMessage('Error', error));
	}
}
