import React, { useCallback, useRef, useState } from 'react';

import { Entity } from 'aframe-react';
import getTextureSizeFromText from '../util/TextMaterialBuilder';
import { fitToMax } from '../util/ResizeImage';
import getImageFromData from '../util/GetImageFromData';

export default function Hotspot({ hotspot }) {
    const assetsInitialized = useRef();

    const [assets, setAssets] = useState({});

    const assetImage = useCallback((node) => {
        assetImage.current = node;

        if (assets.image && node) {
            initImageData();
        }
    }, []);

    const assetAudio = useCallback((node) => {
        assetAudio.current = node;

        if (hotspot.audio.data) {
            const audioElement = assetAudio.current;

            audioElement.setAttribute('loop', hotspot.audio.loop);
            audioElement.setAttribute('src', hotspot.audio.data);
        }
    })

    const params = () => {
        return `coordinates: ${hotspot.location.getX()} ${hotspot.location.getY()};`;
    };

    const isAudioOnly = () => {
        return !hotspot.image.data && !hotspot.text;
    };

    const initImageData = () => {
        const imageElement = assetImage.current;

        imageElement.setAttribute('width', assets.image.width);
        imageElement.setAttribute('height', assets.image.height);
        imageElement.setAttribute('src', assets.image.src);
    };

    const setupAssets = async () => {
        const hasImageContent = Boolean(hotspot.image.data);
        const hasTextContent = Boolean(hotspot.text);
        // const hasAudio: boolean = !!hotspot.audioContent.hasAsset();
        // const location = hotspot.getLocation();
        // const position = getCoordinatePosition(location.getX(), location.getY(), 250);

        let width = 0;
        let height = 0;
        let textSize = null;
        let adjustedHeight = 0;

        if (hasTextContent) {
            textSize = getTextureSizeFromText(hotspot.text);

            width = textSize.width > width ? textSize.width : width;
            height += textSize.height;
        }

        // Building material
        const canvas = document.createElement('canvas');
        const canvasContext = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        if (hasImageContent) {
            const image = await getImageFromData(hotspot.image.data);
            const imgWidth = image.width;
            const imgHeight = image.height;

            const adjustedWidth = imgWidth >= imgHeight && width > 0 ? width : imgWidth;

            adjustedHeight = imgHeight * (adjustedWidth / imgWidth);
            width = image.width > width ? image.width : width;

            height += adjustedHeight;
            canvas.width = width;
            canvas.height = height;

            canvasContext.drawImage(image, width / 2 - adjustedWidth / 2, 0, adjustedWidth, adjustedHeight);
        }

        if (textSize !== null) {
            const textCanvas = document.createElement('canvas');
            const textCanvasContext = textCanvas.getContext('2d');

            textCanvas.width = textSize.width;
            textCanvas.height = textSize.height;

            textCanvasContext.drawImage(textSize.drawCanvas, 0, 0, width, height, 0, 0, width, height);
            canvasContext.drawImage(textCanvas, 0, adjustedHeight, width, textSize.height);
        }

        if (hasTextContent || hasImageContent) {
            const imageSize = fitToMax(canvas.width, canvas.height, 3);
            assets.image = {
                src: canvas.toDataURL('png'),
                width: imageSize.getX(),
                height: imageSize.getY(),
            };
        }

        setAssets(assets);

        if (assetImage.current) {
            initImageData();
        }

        assetsInitialized.current = true;
    };

    if (!assetsInitialized.current) {
        setupAssets();
    }

    return (
        <Entity
            hotspot={params()}
            class="hotspot"
            geometry="primitive: plane"
            material="
                transparent: true;
                alphaTest:.5;
                opacity:0"
            scale="100 100"
            look-at="[camera]"
        >
            <Entity
                class="outer-trigger raycast-trigger"
                material="
                    opacity: 0;
                    alphaTest: .5;
                    transparent: true"
                geometry="
                    primitive: plane;
                    height: 1;
                    width: 1;"
                position="0 0 -1"
            />
            <Entity
                class="center-trigger raycast-trigger"
                material="
                    opacity: 0;
                    alphaTest: .5;
                    transparent: true"
                geometry="
                    primitive: plane;
                    height: .2;
                    width: .2;"
                position="0 0 -1"
            />
            <Entity
                class="content-zone-trigger raycast-trigger"
                material="
                    opacity: 0;
                    alphaTest: .5;
                    transparent: true"
                geometry="
                    primitive: plane;
                    height: .5;
                    width: .5"
            />

            <Entity
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
                    src="/icons/icon-hotspot-default.png"
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
                />
            </Entity>

            {isAudioOnly()
            && (
                <a-image
                    src="/icons/icon-audio.png"
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
                    "
                />
            )}

            {!isAudioOnly()
            && (
                <a-image
                    src="/icons/icon-hotspot-hover.png"
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
                        "
                />
            )}

            <a-text
                value="test-name-text"
                class="hotspot-name"
                align="center"
                visible="false"
                position="0 -.5 0"
                alpha-test=".5"
            />

            <a-entity
                hotspot-content
                class="hotspot-content"
                scale="0 0 0"
                width="2"
                height="2"
                position="0 0 -.3"
            >
                {(hotspot.text || hotspot.audio.data)
                && (
                    <a-image ref={assetImage} />
                )}
                {hotspot.audio.data
                && (
                    <a-sound
                        ref={assetAudio}
                        volume={hotspot.volume}
                        loop={hotspot.loop}
                        sound="positional: false"
                    />
                )}
            </a-entity>
        </Entity>
    );
}
