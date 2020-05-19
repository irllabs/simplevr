import React from 'react';

import Typography, { TypographyVariant } from 'root/irl-ui/typography/typography';

import { RoomProperty } from 'data/scene/interfaces/roomProperty';
import { Vector2 } from 'data/scene/entities/vector2';
import { normalizeAbsolutePosition, denormalizePosition } from 'ui/editor/util/iconPositionUtil';

import './hotspot.scss';
import colors from 'root/styles/colors';
import { ROOM_ICON_BUFFER_WIDTH, ROOM_ICON_BUFFER_HEIGHT } from 'ui/common/constants';

interface HotspotProps {
	roomProperty: RoomProperty;
}

interface HotspotState {
	position: {
		x: number;
		y: number;
	}
}

export default class Hotspot extends React.Component<HotspotProps, HotspotState> {
	private _hotspotElementRef = React.createRef<HTMLDivElement>();
	private _grabbed = false;
	private _mouseOffset = new Vector2(0, 0);
	private _screenPosition: Vector2 = new Vector2(0, 0);

	constructor(props: HotspotProps) {
		super(props);

		const hotspotLocation = this.props.roomProperty.getLocation();
		const absolutePosition = denormalizePosition(hotspotLocation.getX(), hotspotLocation.getY());
		this.state = {
			position: {
				x: absolutePosition.getX(),
				y: absolutePosition.getY(),
			}
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
	}

	public componentDidMount() {
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
	}

	public componentWillUnmount() {
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
	}

	public render() {
		const style = {
			left: `${this.state.position.x}px`,
			top: `${this.state.position.y}px`,
		};

		return (
			<div className='hotspot-container' style={style} onMouseDown={this.onMouseDown} ref={this._hotspotElementRef}>
				<div className='hotspot-icon-container'>
					<img draggable={false} src={`icons/${this.props.roomProperty.getIcon('svg')}`}></img>
				</div>
				<div className='hotspot-label-container'>
					<Typography variant={TypographyVariant.TEXT_X_SMALL} color={colors.textDaylight2}>
						{this.props.roomProperty.getName()}
					</Typography>
				</div>
			</div>
		);
	}

	private onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		const hotspotContainerRect = this._hotspotElementRef.current.getBoundingClientRect();

		// this._grabbed = true;
		this._mouseOffset.setPosition(
			event.clientX - hotspotContainerRect.left,
			event.clientY - hotspotContainerRect.top,
		);
	}

	private onMouseMove(event: MouseEvent) {
		if (this._grabbed) {
			const x = event.clientX - this._mouseOffset.getX();
			const y = event.clientY - this._mouseOffset.getY();

			this.setPixelLocation(x, y);
		}
	}

	private onMouseUp(event: MouseEvent) {
		this._grabbed = false;

		const hotspotContainerRect = this._hotspotElementRef.current.getBoundingClientRect();
		const hotspotCenter = new Vector2(
			hotspotContainerRect.left + hotspotContainerRect.width / 2,
			hotspotContainerRect.top + hotspotContainerRect.height / 2,
		);
		
		let location = normalizeAbsolutePosition(hotspotCenter.getX(), hotspotCenter.getY());
		this.setModelLocation(location);
	}

	private setPixelLocation(x: number, y: number) {
		this.setState({
			position: {
				x: x,
				y: y,
			}
		});
	}

	private setModelLocation(location: Vector2) {
		this.props.roomProperty.setLocation(location);
	}

	public getLocation(): Vector2 {
		return this.props.roomProperty.getLocation();
	}

	// Hotspot interface method
	public setPixelLocationWithBuffer(x: number, y: number) {
		const adjustedX: number = x - ROOM_ICON_BUFFER_WIDTH;
		const adjustedY: number = y - ROOM_ICON_BUFFER_HEIGHT;
		this.setScreenPosition(adjustedX, adjustedY);
		this.setPixelLocation(adjustedX, adjustedY);
	}

	setScreenPosition(x: number, y: number) {
		const shift = {
			right: x < (280 / 2),
			left: x > window.innerWidth - (280 / 2),
			up: y > window.innerHeight - 200,
		};
		this._screenPosition.setPosition(x, y);
	}
}
