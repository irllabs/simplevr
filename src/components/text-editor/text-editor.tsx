import React from 'react';

import './text-editor.scss';

interface TextEditorProps {
	textProperty: string;
}

export default class TextEditor extends React.Component<TextEditorProps, {}> {
	constructor(props: TextEditorProps) {
		super(props)
	}

	public render() {
		return (
			<div className="text-editor">
				<p className="hotspot-inspector__label">
					Enter Text:
				</p>
				<textarea
					name="textarea"
					className="text-editor__text-area"
					value={this.props.textProperty}>
				</textarea>
			</div>
		);
	}
}
