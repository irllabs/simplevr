import React from 'react';
import { ICON_PATH } from 'ui/common/constants';

import 'ui/editor/preview-space/elements/doorway/aframe/doorway';
import 'ui/editor/preview-space/elements/doorway/aframe/doorway-pulsating-marker';

interface DoorwayProps {
	doorway: any;
}

export default class Doorway extends React.Component<DoorwayProps, {}> {
	constructor(props: DoorwayProps) {
		super(props);
	}

	protected get params() {
		const { location, roomId, autoTime } = this.props.doorway;
	
		return `coordinates: ${location.x} ${location.y};
				roomId: ${roomId};
				autoTime: ${autoTime}`;
	}

	protected get iconDoorHotspot() {
		return `${ICON_PATH}icon-doorhotspot.png`;
	  }

	  protected get iconHotspot() {
		return `${ICON_PATH}icon-hotspot-default.png`;
	  }
	
	  protected get name() {
		return this.props.doorway.name;
	  }

	public render() {
		return (
			<a-entity
			doorway={this.params}
			class="doorway"
			geometry="primitive: plane"
			material="
				transparent: true;
				opacity: 0"
			scale="100 100"
			opacity="1"
			look-at="[camera]">

			
			<a-entity
				class="outer-doorway-trigger raycast-trigger"
				material="
				opacity: 0 0;
				transparent: true"
				geometry="
				primitive: plane;
				height: 1;
				width: 1;"
				position="0 0 -1">
			</a-entity>
			
			<a-entity
				class="center-doorway-trigger raycast-trigger"
				material="
				opacity: 0 0;
				transparent: true"
				geometry="
				primitive: plane;
				height: .5;
				width: .5;"
				position="0 0 -1">
			</a-entity>
			

			
			<a-text 
				value={this.name}
				class="hotspot-name"
				align="center" 
				position="0 -.5 0"
				visible="false"
				alpha-test=".5">
			</a-text>
			

			
			<a-entity 
				doorway-pulsating-marker
				animation__scale-out="
				property: scale;
				to: .001 .001 .001;
				dur: 200;
				startEvents: start-scale-out;
				pauseEvents: stop-scale-out;
				"
				animation__scale-in="
				property: scale;
				dur: 200;
				to: 1 1 1;
				startEvents: start-scale-in;
				pauseEvents: stop-scale-in
				">
			<a-image
				src={this.iconHotspot}
				alpha-test=".5"
				animation__pulsation="
				property: scale;
				from: 1 1 1;
				to: .001 .001 .001;
				loop: true;
				dur: 1500;
				dir: normal;
				">
				</a-image>
			</a-entity>

			<a-image 
			src={this.iconDoorHotspot}
			opacity="0"
			animation__fade-in="
				property: opacity;
				from: 0;
				to: 1;
				dur: 500;
				pauseEvents: stop-fade-in;
				startEvents: start-fade-in;
				"
				animation__fade-out="
				property: opacity;
				from: 1;
				to: 0;
				dur: 500;
				pauseEvents: stop-fade-out;
				startEvents: start-fade-out;
				"
				position="0 0 .1"
				hidden-marker
				width=".5"
				height=".5"
				>
			</a-image>

			</a-entity>
		);
	}
}