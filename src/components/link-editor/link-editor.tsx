import React from 'react';
import { Link } from 'data/scene/entities/link';

import './link-editor.scss';

interface LinkEditorProps {
	linkProperty: Link;
}

export default class LinkEditor extends React.Component<LinkEditorProps, {}> {
	constructor(props: LinkEditorProps) {
		super(props);
	}

	public render() {
		return (
			<div className="link-editor">
				<textarea
					name="textarea"
					className="link-editor__text-area"
					value={this.props.linkProperty.body}>
				</textarea>

			{this.showLinkButton() &&
			<div className="button link-editor__go-button">
				<p onClick={this.onLinkClick}>
					Go!
				</p>
			</div>}
		</div>
		);
	}

	private showLinkButton(): boolean {
		return !!this.props.linkProperty.body;
	}

	private onLinkClick() {
		let url: string = this.props.linkProperty.body;
		if (!/^http[s]?:\/\//.test(url)) {
			url = 'http://' + url;
		}
		window.open(url, '_blank');
	}
}
