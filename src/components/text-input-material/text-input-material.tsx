import React from 'react';

import './text-input-material.scss';

interface TextInputMaterialProps {
	inputLabel: string;
	inputType?: string;
	className?: string;
	onTextChange: (text: string) => void;
	onBlurEvent?: (data?: any) => void;
}

interface TextInputMaterialState {
	text: string;
}

export default class TextInputMaterial extends React.Component<TextInputMaterialProps, TextInputMaterialState> {
	constructor(props: TextInputMaterialProps) {
		super(props);

		this.state = {
			text: ''
		};

		this.onTextChange = this.onTextChange.bind(this);
	}

	public render() {
		return (
			<div className={`text-input-material ${this.props.className ? this.props.className : ''}`}>
				<input
					type={this.props.inputType}
					value={this.state.text}
					onChange={this.onTextChange}
					onBlur={this.onBlur}
					className="input"
					required
				/>
				<span className="highlight"></span>
				<span className="bar"></span>
				<label className="label">
					{this.props.inputLabel}
				</label>
			</div>
		);
	}

	private onTextChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			text: event.target.value
		});

		this.props.onTextChange(event.target.value);
	}

	private onBlur() {

	}
}