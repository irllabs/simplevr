import React from 'react';
import eventBus from 'ui/common/event-bus';
import fileLoaderUtil from 'ui/editor/util/fileLoaderUtil';
import { generateUniqueId } from 'data/util/uuid';
import { resolve } from 'path';

import './file-loader.scss';

interface FileLoaderProps {
	displayText?: string;
	acceptedFileType: string;
	maxFileSize?: number;
	onFileLoad: (data) => void;
	className?: string;
}

export default class FileLoader extends React.Component<FileLoaderProps, {}> {
	private inputId = generateUniqueId();

	constructor(props: FileLoaderProps) {
		super(props);

		this.onFileChange = this.onFileChange.bind(this);
	}

	public render() {
		return (
			<div className={`file-loader ${this.props.className ? this.props.className : ''}`}>
				<input
					type="file"
					id={this.inputId}
					onChange={this.onFileChange}
					className="file-loader__hidden-input"
				/>

				<label
					id={this.inputId}
					className="button-full-width"
					htmlFor={this.inputId}>
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
			this.props.onFileLoad({
				binaryFileData: fileData,
				file: file,
			});
		})
		.catch(error => eventBus.onModalMessage('Error', error));
	}
}
