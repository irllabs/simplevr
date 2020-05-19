import React from 'react';

import 'ui/editor/preview-space/elements/hotspot/aframe/hotspot-content';
import 'ui/editor/preview-space/elements/hotspot/aframe/hotspot-hidden-marker';
import 'ui/editor/preview-space/elements/hotspot/aframe/hotspot';
import 'ui/editor/preview-space/elements/hotspot/aframe/hotspot-pulsating-marker';
import { AfterViewInit } from '@angular/core';
import { Universal } from 'data/scene/entities/universal';
import { ICON_PATH } from 'ui/common/constants';
import { getCoordinatePosition } from 'ui/editor/util/iconPositionUtil';
import { getTextureSizeFromText } from 'ui/editor/preview-space/modules/textMaterialBuilder';
import assetInteractor from 'core/asset/assetInteractor';
import { fitToMax } from 'data/util/imageResizeService';

interface HotspotProps {
	hotspot: Universal;
}

export default class Hotspot extends React.Component<HotspotProps, {}> {
	private hotspotContent = React.createRef<any>();
	private assetImage = React.createRef<any>();
	private assetAudio = React.createRef<any>();
	
	private assets: object;

	constructor(props: HotspotProps) {
		super(props);
	}

	protected get name() {
		return this.props.hotspot.getName();
	}

	protected get iconHotspot() {
		return `${ICON_PATH}icon-hotspot-default.png`;
	}

	protected get iconHotspotHover() {
		return `${ICON_PATH}icon-hotspot-hover.png`;
	}

	protected get iconAudio() {
		return `${ICON_PATH}icon-audio.png`;
	}

	protected get isAudioOnly() {

		const hasImageContent: boolean = this.props.hotspot.imageContent.hasAsset();
		const hasTextContent: boolean = !!this.props.hotspot.textContent;
		const hasAudioContent: boolean = this.props.hotspot.audioContent.hasAsset();
	
		return hasAudioContent && !hasImageContent && !hasTextContent;
	}

	protected get hasAudio() {
		return this.props.hotspot.audioContent.hasAsset();
	}

	protected get hasImage() {
		return this.props.hotspot.imageContent.hasAsset() || !!this.props.hotspot.textContent;
	}

	protected get params() {
		return `coordinates: ${this.props.hotspot.location.getX()} ${this.props.hotspot.location.getY()};
			isAudioOnly: ${this.isAudioOnly}`;
	}

	public componentWillMount() {
		this.setupAssets();
	}

	public componentDidMount() {
		const assets: any = this.assets;

		if (this.hasImage) {
			const imageElement = this.assetImage.current;

			imageElement.setAttribute('width', assets.image.width);
			imageElement.setAttribute('height', assets.image.height);
			imageElement.setAttribute('src', assets.image.src);
		}

		if (this.hasAudio) {
			const audioElement = this.assetAudio.current;
			
			audioElement.setAttribute('loop', assets.audio.loop);
			audioElement.setAttribute('src', assets.audio.src);
		}
	}

	public render() {
		return (
			<a-entity
				hotspot={this.params}
				class="hotspot"
				geometry="primitive: plane"
				material="
					transparent: true;
					alphaTest:.5;
					opacity:0"
				scale="100 100"
				look-at="[camera]"
			>
			
				<a-entity
					class="outer-trigger raycast-trigger"
					material="
						opacity: 0;
						alphaTest: .5;
						transparent: true"
					geometry="
						primitive: plane;
						height: 1;
						width: 1;"
					position="0 0 -1">
				</a-entity>
				<a-entity
					class="center-trigger raycast-trigger"
					material="
						opacity: 0;
						alphaTest: .5;
						transparent: true"
					geometry="
						primitive: plane;
						height: .2;
						width: .2;"
					position="0 0 -1">
				</a-entity>
				<a-entity
					class="content-zone-trigger raycast-trigger"
					material="
						opacity: 0;
						alphaTest: .5;
						transparent: true"
					geometry="
						primitive: plane;
						height: .5;
						width: .5">
				</a-entity>

				<a-entity 
					pulsating-marker
					animation__pulsation="
						property: scale;
						from: 1 1 1;
						to: 1.3 1.3 1.3;
						loop: true;
						dur: 700;
						dir: alternate;"
					>
					<a-image
						src={this.iconHotspot}
						alpha-test=".5"
						animation__scale-in="
							property: scale;
							dur: 500;
							to: 1 1 1;
							startEvents: start-scale-in;
							pauseEvents: stop-scale-in;"
						animation__scale-out="
							property: scale;
							dur: 500;
							to: .001 .001 .001;
							startEvents: start-scale-out;
							pauseEvents: stop-scale-out;"
						>
					</a-image>
				</a-entity>

				{this.isAudioOnly &&
				<a-image
					src={this.iconAudio}
					position="0 0 .1"
					hidden-marker
					opacity="0"
					alpha-test=".5"
					scale=".5 .5 .5"
					animation__fade-in="
						property: opacity;
						from: 0;
						to: 1;
						dur: 500;
						pauseEvents: stop-fade-in;
						startEvents: start-fade-in;"
					animation__fade-out="
						property: opacity;
						from: 1;
						to: 0;
						dur: 500;
						pauseEvents: stop-fade-out;
						startEvents: start-fade-out;
					">
				</a-image>}

				{!this.isAudioOnly &&
				<a-image
					src={this.iconHotspotHover}
					hidden-marker
					position="0 0 .1"
					opacity="0"
					alpha-test=".5"
					animation__fade-in="
						property: opacity;
						from: 0;
						to: 1;
						dur: 500;
						pauseEvents: stop-fade-in;
						startEvents: start-fade-in;"
					animation__fade-out="
						property: opacity;
						from: 1;
						to: 0;
						dur: 500;
						pauseEvents: stop-fade-out;
						startEvents: start-fade-out;
						">
				</a-image>}

				<a-text 
					value={this.name}
					class="hotspot-name"
					align="center" 
					visible="false"
					position="0 -.5 0"
					alpha-test=".5">
				</a-text>

				<a-entity
					ref={this.hotspotContent}
					hotspot-content
					class="hotspot-content"
					scale="0 0 0"
					width="2"
					height="2"
					position="0 0 -.3">
					{this.hasImage &&
					<a-image
						ref={this.assetImage}>
					</a-image>}
					{this.hasAudio &&
					<a-sound
						ref={this.assetAudio}
						volume={this.props.hotspot.volume}
						loop={this.props.hotspot.loop}
						sound="positional: false">
					</a-sound>}
				</a-entity>
			</a-entity>
		);
	}

	setupAssets() {
		const hotspot = this.props.hotspot;
		const hasImageContent: boolean = hotspot.imageContent.hasAsset();
		const hasTextContent: boolean = !!hotspot.textContent;
		const hasAudio: boolean = !!hotspot.audioContent.hasAsset();
		const location = hotspot.getLocation();
		const position = getCoordinatePosition(location.getX(), location.getY(), 250);
	
		let width = 0;
		let height = 0;
		let textSize = null;
		let adjustedHeight = 0;
	
		if (hasTextContent) {
		  textSize = getTextureSizeFromText(hotspot.textContent);
	
		  width = textSize.width > width ? textSize.width : width;
		  height += textSize.height;
		}
	
		// Building material
		const canvas: any = document.createElement('canvas');
		const canvasContext = canvas.getContext('2d');
	
		canvas.width = width;
		canvas.height = height;
	
		if (hasImageContent) {
		  const imageTexture = assetInteractor.getTextureById(hotspot.getId());
		  const imgWidth = imageTexture.image.width;
		  const imgHeight = imageTexture.image.height;
		  const adjustedWidth = imgWidth >= imgHeight && width > 0 ? width : imgWidth;
	
		  adjustedHeight = imgHeight * (adjustedWidth / imgWidth);
		  width = imageTexture.image.width > width ? imageTexture.image.width : width;
	
		  height += adjustedHeight;
		  canvas.width = width;
		  canvas.height = height;
	
		  canvasContext.drawImage(imageTexture.image, width / 2 - adjustedWidth / 2, 0, adjustedWidth, adjustedHeight);
		}
	
		if (textSize !== null) {
		  const textCanvas: any = document.createElement('canvas');
		  const textCanvasContext = textCanvas.getContext('2d');
	
		  textCanvas.width = textSize.width;
		  textCanvas.height = textSize.height;
	
		  textCanvasContext.drawImage(textSize.drawCanvas, 0, 0, width, height, 0, 0, width, height);
		  canvasContext.drawImage(textCanvas, 0, adjustedHeight, width, textSize.height);
		}
		const assets = {
		  image: null,
		  audio: null
		};
	
		if (hasTextContent || hasImageContent) {
		  const imageSize = fitToMax(canvas.width, canvas.height, 3);
		  assets.image = {
			src: canvas.toDataURL('png'),
			width: imageSize.getX(),
			height: imageSize.getY()
		  };
		}
	
		if (hasAudio) {
		  assets.audio = {
			src: hotspot.audioContent.getBinaryFileData(true),
			loop: hotspot.loop
		  }
		}
	
		this.assets = assets;
	}
}