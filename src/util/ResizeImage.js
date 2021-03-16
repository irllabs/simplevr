import Vector2 from './Vector2';
import { MIME_TYPE_JPEG } from '../constants/constants';

const MAX_SIZE_HOTSPOT = 1024;

function getNearestPowerOfTwo(x) {
    return new Array(14).fill(null)
        .map((_, index) => {
            return 2 ** index;
        })
        .map((power) => {
            const distance = Math.abs(x - power);
            return { distance: distance, value: power };
        })
        .sort((a, b) => {
            return a.distance - b.distance;
        })[0].value;
}

export function fitToMax(width, height, maxSize) {
    let x;
    let y;
    if (width > height && width > maxSize) {
        x = maxSize;
        y = (height / width) * maxSize;
    } else if (height > width && height > maxSize) {
        x = (width / height) * maxSize;
        y = maxSize;
    } else if (width === height && width > maxSize) {
        x = maxSize;
        y = maxSize;
    } else {
        x = width;
        y = height;
    }
    return new Vector2(x, y);
}

const SIZE_OPTIONS = {
    projectThumbnail: () => {
        return new Vector2(336, 168);
    },
    hotspotImage: (width, height) => {
        return fitToMax(width, height, MAX_SIZE_HOTSPOT);
    },
    backgroundImage: (width, height) => {
        if (width >= height) {
            const x = getNearestPowerOfTwo(width);
            const y = Math.floor((height / width) * x);
            return new Vector2(x, y);
        }

        const y = getNearestPowerOfTwo(height);
        const x = Math.floor((width / height) * y);
        return new Vector2(x, y);
    },
};

function getResizedImage(imageUrl, sizeOption) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = (document.createElement('canvas'));
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const resizeDimensions = SIZE_OPTIONS[sizeOption](img.width, img.height);

                canvas.width = resizeDimensions.getX();
                canvas.height = resizeDimensions.getY();
                canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, resizeDimensions.getX(), resizeDimensions.getY());

                resolve(canvas.toDataURL(MIME_TYPE_JPEG, 0.8));
            };

            img.src = imageUrl;
        } catch (error) {
            reject(error);
        }
    });
}

export default async function resizeImageAsync(imageUrl, sizeOption) {
    if (!SIZE_OPTIONS[sizeOption]) {
        return Promise.reject(new Error(`resizeImage must have a valid size option: ${Object.keys(SIZE_OPTIONS).join(', ')}`));
    }
    if (sizeOption === 'backgroundImage') {
        const resizeList = await Promise.all([
            getResizedImage(imageUrl, 'backgroundImage'),
            getResizedImage(imageUrl, 'projectThumbnail'),
        ]);
        return {
            backgroundImage: resizeList[0],
            thumbnail: resizeList[1],
        };
    }

    return getResizedImage(imageUrl, sizeOption);
}
