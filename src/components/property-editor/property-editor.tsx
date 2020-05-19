import React from 'react';

import TextEditor from 'components/text-editor/text-editor';

import { RoomPropertyTypeService } from 'ui/editor/util/roomPropertyTypeService';
import propertyRemovalService from 'ui/editor/util/propertyRemovalService';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';

import './property-editor.scss';
import ImageEditor from '../image-editor/image-editor';
import VideoEditor from '../video-editor/video-editor';
import UniversalEditor from '../universal-editor/universal-editor';
import DoorEditor from '../door-editor/door-editor';
import AudioEditor from '../audio-editor/audio-editor';
import LinkEditor from '../link-editor/link-editor';

interface PropertyEditorProps {
	roomProperty: any;
	onDeselect: (event: any) => void;
	className: string;
}

export default class PropertyEditor extends React.Component<PropertyEditorProps, {}> {
	constructor(props: PropertyEditorProps) {
		super(props);
	}

	public render() {
		return (
			<div className={`modal-window property-editor ${this.props.className ? this.props.className : ''}`}>
				<div className="modal-window__fields">
					{this.propertyIs('text') &&
					<TextEditor
						textProperty={this.props.roomProperty}>
					</TextEditor>}

					{this.propertyIs('image') &&
					<ImageEditor
						imageProperty={this.props.roomProperty}>
					</ImageEditor>}

					{this.propertyIs('video') &&
					<VideoEditor
						videoProperty={this.props.roomProperty}>
					</VideoEditor>}

					{this.propertyIs('universal') &&
					<UniversalEditor
						universalProperty={this.props.roomProperty}>
					</UniversalEditor>}

					{this.propertyIs('door') &&
					<DoorEditor
						doorProperty={this.props.roomProperty}>
					</DoorEditor>}

					{this.propertyIs('audio') &&
					<AudioEditor
						audioProperty={this.props.roomProperty}>
					</AudioEditor>}

					{this.propertyIs('link') &&
					<LinkEditor
						linkProperty={this.props.roomProperty}>
					</LinkEditor>}

					{!this.propertyIs('universal') &&
					<div
						className="property-editor__delete-button"
						onClick={() => {
							this.deleteProperty()
						}}>
							Delete { this.getPropertyName() }
					</div>}
				</div>
			</div>
		);
	}

	getName(): string {
		return this.props.roomProperty.getName();
	  }

	  onNameChange($event) {
		this.props.roomProperty.setName($event.text);
	  }

	  deleteProperty() {
		if (!this.props.roomProperty) {
		  return;
		}
		propertyRemovalService.removeProperty(this.props.roomProperty);
	  }

	  private getPropertyName(): string {
		return this.props.roomProperty.getName();
	  }

	  private propertyIs(propertyType: string) {
		return RoomPropertyTypeService.getTypeString(this.props.roomProperty) === propertyType;
	  }

	  private showNameEditor(): boolean {
		return RoomPropertyTypeService.getTypeString(this.props.roomProperty) !== 'door';
	  }
}
