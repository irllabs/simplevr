import React from 'react';

import FileLoader from '../file-loader/file-loader';
import { Image } from 'data/scene/entities/image';
import { resizeImage } from 'data/util/imageResizeService';

import './image-editor.scss';
import eventBus from 'ui/common/event-bus';

interface ImageEditorProps {
	imageProperty: Image;
}

export default class ImageEditor extends React.Component<ImageEditorProps, {}> {
	constructor(props: ImageEditorProps) {
		super(props);
	}

	public render() {
		return (
			<div>
				<FileLoader
					onFileLoad={this.onFileLoad}
					acceptedFileType='image'
					className='image-editor__file-loader'
				/>

				<img
					src={this.props.imageProperty.getBinaryFileData()}
					className="image-editor__image-display">
				</img>
			</div>
		);
	}

	private onFileLoad($event) {
		resizeImage($event.binaryFileData, 'hotspotImage')
		.then(resizedImageData => this.props.imageProperty.setFileData($event.file.name, resizedImageData))
		.catch(error => eventBus.onModalMessage('Image loading error', error));
	}
}