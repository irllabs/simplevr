import React from 'react';

import './text-input.scss';

interface TextInputProps {
	label: string;
	onModelChange: (event: any) => void;
	isRoomName?: boolean;
	isHotspot?: boolean;
	isRowItem?: boolean;
	isActive?: boolean;
	isHotspotTitle?: boolean;

}

interface TextInputState {
	value: string;
}

export default class TextInput extends React.Component<TextInputProps, TextInputState> {
	constructor(props: TextInputProps) {
		super(props);

		this.state = {
			value: this.props.label,
		}

		this.onChange = this.onChange.bind(this);
	}

	public componentDidUpdate(prevProps: TextInputProps) {
		if (prevProps.label !== this.state.value) {
			this.setState({
				value: this.props.label
			});
		}
	}

	public render() {
		return (
			<div className="text-input">
				<input
					value={this.props.label}
					type="text"
					onChange={this.onChange}
					className={`text-input__input ` +
						`${this.props.isHotspot ? 'text-input__input--icon' : ''} ` +
						`${this.props.isHotspotTitle ? 'text-input__input--title' : ''} ` +
						`${this.props.isRowItem ? 'text-input__input-row' : ''} ` +
						`${this.props.isActive ? 'text-input__input-row--active' : ''}` +
						`${this.props.isRoomName ? 'text-input__storymap--roomname': ''}`}
				/>
			</div>
		);
	}

	private onChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			value: event.target.value
		});

		this.props.onModelChange(event);
	}
}
