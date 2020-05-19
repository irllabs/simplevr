import React from 'react';

import './checkbox.scss';
import { generateUniqueId } from 'data/util/uuid';

interface CheckboxProps {
	initialValue: boolean;
	disabled: boolean;
	onChange: (data: any) => void;
	name?: string;
	className?: string;
}

export default class Checkbox extends React.Component<CheckboxProps, {}> {
	private inputRef = React.createRef<HTMLInputElement>();

	public uniqueId = generateUniqueId();

	constructor(props: CheckboxProps) {
		super(props);
	}

	public render() {
		return (
			<div className={`checkbox ${this.props.className ? this.props.className : ''}`}>
				<input
					ref={this.inputRef}
					type="checkbox"
					id={this.uniqueId}
					checked={this.props.initialValue}
					disabled={this.props.disabled}
					onChange={(event) => {
						this.props.onChange(event.target.checked);
					}}
					className="checkbox__input checkbox__input--hidden"/>
				<label htmlFor={this.uniqueId} className="checkbox__label"></label>
			</div>
		);
	}
}
