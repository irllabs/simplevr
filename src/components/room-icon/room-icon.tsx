import React from 'react';
import TextInput from '../text-input/text-input';
import PropertyEditor from '../property-editor/property-editor';
import { Vector2 } from 'data/scene/entities/vector2';
import { Hotspot } from 'ui/editor/interfaces/hotspot';

import './room-icon.scss';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';
import { RoomPropertyTypeService } from 'ui/editor/util/roomPropertyTypeService';
import { ICON_PATH, ROOM_ICON_BUFFER_WIDTH, ROOM_ICON_BUFFER_HEIGHT } from 'ui/common/constants';
import { denormalizePosition, normalizeAbsolutePosition } from 'ui/editor/util/iconPositionUtil';
import { Door } from 'data/scene/entities/door';
import projectMetaDataInteractor from 'core/scene/projectMetaDataInteractor';
import propertyRemovalService from 'ui/editor/util/propertyRemovalService';
import eventBus, { EventType } from 'ui/common/event-bus';
import { Subscription } from 'rxjs/Subscription';
import { roomsUpdatedEvent, hotspotRemovedEvent } from 'root/events/event-manager';

const ICON_MAP = {
	universal: 'icon-add.png',

	text: 'icon-text.png',
	textAudio: 'icon-text-audio.png',

	image: 'icon-image.png',
	imageText: 'icon-image-text.png',
	imageAudio: 'icon-image-audio.png',
	imageTextAudio: 'icon-image-text-audio.png',
	audio: 'icon-audio.png',

	video: 'icon-video.png',
	door: 'icon-doorhotspot.png',
	link: 'link_filled.png',
};

const iconSizes = {
	SMALL: 'SMALL',
	MEDIUM: 'MEDIUM',
	LARGE: 'LARGE',
};

function getObject(){
	var targeta = event.target;
}

const instanceSet: Set<RoomIcon> = new Set<RoomIcon>();
window.addEventListener('resize', $event =>
	instanceSet.forEach((instance: RoomIcon) => instance.onResize()),
);

const ROUND_UNIT: number = 0.5;

function round(n: number, precision: number): number {
	return Math.round(n * precision) / precision;
}

function snapToGrid(position: Vector2): Vector2 {
	return new Vector2(
		round(position.getX(), ROUND_UNIT),
		round(position.getY(), ROUND_UNIT),
	);
}

interface RoomIconProps {
	onIconDragEnd?: (data: any) => void;
	roomProperty: RoomProperty;
}

interface RoomIconState {
	hotspotIconSize: string;
	propertyEditorIsVisible: boolean;
}

export default class RoomIcon extends React.Component<RoomIconProps, RoomIconState> implements Hotspot {
	private iconElement = React.createRef<HTMLDivElement>();
	private el = React.createRef<HTMLImageElement>();

	private screenPosition: Vector2 = new Vector2(0, 0);
	private iconPath: string;
	private subscriptions: Set<Subscription> = new Set<Subscription>();
	private windowDimensions: Vector2 = new Vector2(window.innerWidth, window.innerHeight);
	private isPossibleCombinedHotspot: boolean = false;
	private propertyType: string;
	private deleteVisible: boolean = false;
	private isBeingInstantiated: boolean = false;

	private Xposition: number;
	private YPosition: number;

	private startX: number;
	private startY: number;
	private absoluteStartX: number;
	private absoluteStartY: number;
	private isActive: boolean;

	constructor(props: RoomIconProps) {
		super(props);

		this.state = {
			hotspotIconSize: iconSizes.LARGE,
			propertyEditorIsVisible: false,
		}

		this.onClick = this.onClick.bind(this);
		this.onMove = this.onMove.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onDeleteClick = this.onDeleteClick.bind(this);
		this.onNameChange = this.onNameChange.bind(this);
		this.onDeselect = this.onDeselect.bind(this);
	}

	public componentDidMount() {
		this.propertyType = RoomPropertyTypeService.getTypeString(this.props.roomProperty);

		this.subscriptions.add(
		  eventBus.getObservable(EventType.SELECT_PROPERTY)
			.subscribe(
			  event => {
				// if a door is added and there are more than 2 rooms, then open the property editor
				if (event.shouldOpenEditor && event.propertyId === this.props.roomProperty.getId()) {
				  this.setPropertyEditorVisibility(true);
				}
			  },
			  error => console.log('error', error),
			),
		);
	
		this.updatePosition();
		this.onResize();
		instanceSet.add(this);

		window.addEventListener('mousedown', this.onClick);
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
	}

	public componentWillUnmount() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		instanceSet.delete(this);

		window.removeEventListener('mousedown', this.onClick);
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
	}

	public render() {
		return (
			<div
				ref={this.iconElement}
				id="icon-element"
				className="icon"
				onMouseMove={this.onMouseMove}
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseUp}>

				<img
					src='assets/icons/delete_filled.png'
					onClick={this.onDeleteClick}
					className="icon__delete">
				</img>

				<img
					draggable={false}
					id="draggableIcon"
					className={`icon__image ${this.state.hotspotIconSize === 'SMALL' ? 'icon__image--small' : ''} ${this.state.hotspotIconSize === 'MEDIUM' ? 'icon__image--medium' : ''}`}
					src={this.getIconPath()}
				/>

				<TextInput
					label={this.getName()}
					isHotspot={true}
					onModelChange={this.onNameChange}>
				</TextInput>

				{this.state.propertyEditorIsVisible &&
				<PropertyEditor
					roomProperty={this.props.roomProperty}
					onDeselect={this.onDeselect}
					className="icon__property-editor">
				</PropertyEditor>}
			</div>
		);
	}

	onClick(event) {
		const isClicked: boolean = this.iconElement.current.contains(event.target);
		const inputClicked = event.target.className === 'dz-hidden-input';
	
		if (!isClicked && !inputClicked) {
			this.setPropertyEditorVisibility(false);
		}
	}

	removeDummy() {
		var elem = document.getElementById('icon-element');
		elem.parentNode.removeChild(elem);
		return false;
	}

	isCollapsed(x: number, y: number){
		/*var rect = document.getElementById("icon-element");
		var dragMe = document.getElementById("icon-element");*/
		// var rect = document.querySelectorAll("#icon-element");
		console.log(x);
		 console.log(y);
		var dragMe = document.querySelectorAll("#icon-element");
		var rect;
		rect = document.querySelectorAll("#icon-element");
		//const numBoxes = dragMe.length;
		console.log(this.el);
	
	
	
		for(var i = 0; i < dragMe.length; ++i) {
		  for(var j = i+1; j< dragMe.length; ++j){
		  //result = el[i];
		  console.log("//////////////////////////////////////////" + j)
	
	
		  var object_1 = dragMe[i].getBoundingClientRect();
		  console.log(object_1);
		  console.log(object_1.left, object_1.top)
		  var object_2 = rect[j].getBoundingClientRect();
		  console.log(object_2)
		  console.log(object_2.left, object_2.top)
		  console.log("=======================================")
		  console.log(dragMe.length)
		  console.log(dragMe)
		  console.log(rect)
	
	
	
	
	
		  if((dragMe.length>=i+1 )){
			console.log("primer if")
			  if((object_1.left + object_1.height > object_2.left &&
				  object_1.left < object_2.left + object_2.width)
				&&
				( object_1.top + object_1.height > object_2.top &&
				  object_1.top < object_2.top + object_2.height ) )
				{
				  console.log("overlaping");
				  this.iconElement.current.style.top = `${y}px`;
				  this.iconElement.current.style.left = `${x}px`;
	
			  }else{
				console.log("isn't overlpaing or the array is smaller than the iterator" )
	
			  }
			}else{console.log("isn't working")}
		  }
		  console.log("incrementa i")
	   }
		/*if(object_1[0].left > object_2[1].left + object_2[1].width  && object_1[0].left + object_1[0].width  > object_2[1].left &&
		  object_1[0].top < object_2[1].top + object_2[1].height && object_1[0].top + object_1[0].height > object_2[1].top){
		  console.log("Heeeeeeeeeeeeeeeeeeeeeee");
		}else{
		  console.log("Hiiiiiiiiiiiiiiiiiiiiiiii");
		  console.log(object_1[0].left);
		  console.log(object_2[1].left);
		}*/
	
		// if(rect[0] + dragMe[1].left > 5){
	
		// }else{
	
		// }
	  }

	  getIconPath() {
		const propertyIcon = this.props.roomProperty.getIcon();
	
		return `${ICON_PATH}${propertyIcon !== null ? propertyIcon : ICON_MAP[this.propertyType]}`;
	  }

	  setPosition(location: Vector2) {
		const absolutePosition: Vector2 = denormalizePosition(location.getX(), location.getY());
		const adjustedX: number = absolutePosition.getX() - ROOM_ICON_BUFFER_WIDTH;
		const adjustedY: number = absolutePosition.getY() - ROOM_ICON_BUFFER_HEIGHT;
		this.setPixelLocation(adjustedX, adjustedY);
		this.setScreenPosition(absolutePosition.getX(), absolutePosition.getY());
	  }

	  // Hotspot interface method
	  setPixelLocationWithBuffer(x: number, y: number) {
		const adjustedX: number = x - ROOM_ICON_BUFFER_WIDTH;
		const adjustedY: number = y - ROOM_ICON_BUFFER_HEIGHT;
		this.setScreenPosition(adjustedX, adjustedY);
		this.setPixelLocation(adjustedX, adjustedY);
	  }

	  // $sidebar-width: 280px;
	// $property-editor-height: 200px;
	setScreenPosition(x: number, y: number) {
		const shift = {
		right: x < (280 / 2),
		left: x > this.windowDimensions.getX() - (280 / 2),
		up: y > this.windowDimensions.getY() - 200,
		};
		this.screenPosition.setPosition(x, y);
	}

	  // Hotspot interface method
	//set absolute screen position without updating the data model
	setPixelLocation(x: number, y: number) {
		this.iconElement.current.style.top = `${y}px`;
		this.iconElement.current.style.left = `${x}px`;
	}

	onMouseDown($event){
		this.Xposition= $event.clientX ;
		this.YPosition=$event.clientY;

		const boundingRect = this.iconElement.current.getBoundingClientRect();
		this.startX = $event.clientX - boundingRect.left;
		this.startY = $event.clientY - boundingRect.top;
		this.absoluteStartX = $event.clientX;
		this.absoluteStartY = $event.clientY;
		this.isActive = true;

		console.log(this.Xposition);
		console.log(this.YPosition);
   
		 event.stopPropagation();
	 }

	 onMouseMove(event) {
		if (!this.isActive) {
			return;
		}
		event.preventDefault();
		const x: number = event.clientX - this.startX;
		const y: number = event.clientY - this.startY;
		this.onMove({
			x: x,
			y: y,
			shiftKey: event.shiftKey,
		});
	 }

	 onMouseUp(event) {
		if (!this.isActive) {
			return;
		}
		const totalDistance: number = getTotalDistance(
			event.clientX, this.absoluteStartX,
			event.clientY, this.absoluteStartY,
		);
		  const didMove: boolean = totalDistance > 0;
	  
		  this.onMoveEnd({
			x: event.clientX - this.startX,
			y: event.clientY - this.startY,
			shiftKey: event.shiftKey,
			didMove: didMove,
			clickOnDelete: event.target.className === 'icon__delete'
		  });
		  this.isActive = false;
	 }

	 onMove($event) {

		event.stopPropagation();
		const x: number = $event.x + ROOM_ICON_BUFFER_WIDTH;
		const y: number = $event.x + ROOM_ICON_BUFFER_HEIGHT;
	
		var dragHotspot = document.querySelectorAll("#icon-element");
		var objectHotspot = dragHotspot[0].getBoundingClientRect();
	
	  //   for(var i = 0; i < dragHotspot.length; ++i) {
	  //     //result = el[i];
	  //     console.log(dragHotspot[i])
	  // }
		if ($event.shiftKey) {
		  if (this.props.onIconDragEnd) {
			// snap to grid in 3D view
			this.props.onIconDragEnd({
			  setIconLocation: (x: number, y: number) => {
				this.setLocation(snapToGrid(new Vector2(x, y)));
			  },
			  x: x,
			  y: y,
			});
		  } else {
			// snap to grid in 2D view
			const normalizedLocation: Vector2 = normalizeAbsolutePosition(x, y);
			const snappedLocation: Vector2 = snapToGrid(normalizedLocation);
			const denormalizedPosition: Vector2 = denormalizePosition(snappedLocation.getX(), snappedLocation.getY());
			this.setScreenPosition(denormalizedPosition.getX(), denormalizedPosition.getY());
			this.setPixelLocation(
			  denormalizedPosition.getX() - ROOM_ICON_BUFFER_WIDTH,
			  denormalizedPosition.getY() - ROOM_ICON_BUFFER_HEIGHT,
			);
		  }
		} else {
		  // don't snap to grid
		  this.setScreenPosition(x, y);
		  this.setPixelLocation($event.x, $event.y);
		}
		return false;
		//this.combinedHotspotUtil.onIconMove(this.roomProperty, x, y);
	  }

	  onMoveEnd($event) {
		if (!$event.didMove && !$event.clickOnDelete) {
		  setTimeout(() => {
			this.setPropertyEditorVisibility(true);
		  }, 200);      //this.setPropertyEditorVisibility(true);
		  return;
		}else{
		  //this.setPixelLocation($event.x, $event.y);
		  //console.log("Dragggggggggggg");
		  //this.removeDummy();
		  //this.isCollapsed($event.x+(Math.random()* (-200)), $event.y+(Math.random()* (200)));
		  this.isCollapsed(this.Xposition,this.YPosition)
		}
	
		const adjustedX: number = $event.x + ROOM_ICON_BUFFER_WIDTH;
		const adjustedY: number = $event.y + ROOM_ICON_BUFFER_HEIGHT;
	
		// if parent components are observing onIconDragEnd
		// (such as edit-space-sphere), then notify parent
		// with coordinates and callback function to set model position
		if (this.props.onIconDragEnd) {
		  this.props.onIconDragEnd({
			setIconLocation: (x: number, y: number) => {
			  let location: Vector2 = new Vector2(x, y);
			  if (!$event.shiftKey) {
				location = snapToGrid(location);
			  }
			  // this.roomProperty.setLocation(location);
			  this.setLocation(location);
			},
			x: adjustedX,
			y: adjustedY,
		  });
		}
		// if parent components are not observing onIconDragEnd
		// (such as edit-space-flat), then simply set the model position
		else {
		  let location: Vector2 = normalizeAbsolutePosition(adjustedX, adjustedY);
		  if (!$event.shiftKey) {
			location = snapToGrid(location);
		  }
		  // this.roomProperty.setLocation(location);
		  this.setLocation(location);
		}
	
		// TODO: combined hotspot logic
		//const activeNeighborId: string = this.combinedHotspotUtil.getActiveNeighborId();
	  }

	  // Hotspot interface method
	  getScreenPosition(): Vector2 {
		return this.screenPosition;
	  }

	  setPropertyEditorVisibility(isVisible: boolean) {
		if (this.state.propertyEditorIsVisible === isVisible) {
		  return;
		}
		
		this.setState({
			propertyEditorIsVisible: isVisible,
		});

		eventBus.onHotspotVisibility(isVisible);
	  }

	  onResize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.windowDimensions.setX(width);
		this.windowDimensions.setY(height);
		if (width < 767) {
			this.setState({
				hotspotIconSize: iconSizes.SMALL,
			});
		}
		else if (width < 992) {
			this.setState({
				hotspotIconSize: iconSizes.MEDIUM,
			});
		}
		else {
			this.setState({
				hotspotIconSize: iconSizes.LARGE
			})
		}
	  }

	  updatePosition() {
		this.setPosition(this.props.roomProperty.getLocation());
	  }

	  // Hotspot interface method
	  getName(): string {
		return this.props.roomProperty.getName();
	  }

	  onNameChange($event) {
		this.props.roomProperty.setName($event.text);
	
		if (this.propertyIs('door')) {
		  (this.props.roomProperty as Door).setNameIsCustom(true);
		}
	
		projectMetaDataInteractor.onProjectChanged();
	  }

	  propertyIs(propertyType: string): boolean {
		return this.propertyType === propertyType;
	  }

	  onSelect($event) {
		eventBus.onSelectProperty(this.props.roomProperty.getId(), false);
	  }

	  onDeselect($event) {
		this.setState({
			propertyEditorIsVisible: false,
		}, () => {
			eventBus.onHotspotVisibility(this.state.propertyEditorIsVisible);
		});
	  }

	  onDeleteClick($event) {
		propertyRemovalService.removeProperty(this.props.roomProperty);
		// roomsUpdatedEvent.emit({});

		hotspotRemovedEvent.emit({});
	  }

	  onMouseOver($event) {
		this.deleteVisible = true;
	  }

	  isPossibleHotspot(): boolean {
		return this.props.roomProperty.getPossibleCombinedHotspot();
	  }

	  setIsPossibleHotsport(isPossibleCombinedHotspot: boolean) {
		this.props.roomProperty.setPossibleCombinedHotspot(isPossibleCombinedHotspot);
	  }

	  getLocation(): Vector2 {
		return this.props.roomProperty.getLocation();
	  }

	  setLocation(location: Vector2) {
		this.props.roomProperty.setLocation(location);
		projectMetaDataInteractor.onProjectChanged();
	  }
}

function getTotalDistance(x1, x2, y1, y2): number {
	return Math.sqrt(
	  Math.pow(x1 - x2, 2) +
	  Math.pow(y1 - y2, 2),
	);
  }