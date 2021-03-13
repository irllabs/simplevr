import Vector2 from './Vector2';
import Vector3 from './Vector3';

// xy screen position to normalized position: [0, 360], [-90, 90]
export function normalizeAbsolutePosition(x, y) {
    const xRelative = 360 * (x / window.innerWidth);
    const yRelative = -180 * (y / window.innerHeight) + 90;
    return new Vector2(xRelative, yRelative);
}

export function clamp(value, lowerBound, upperBound) {
    return Math.max(lowerBound, Math.min(upperBound, value));
}

// spherical to xyz
export function sphericalToCoordinate(radialDistance, theta, phi) {
    const x = radialDistance * Math.cos(theta) * Math.sin(phi);
    const z = radialDistance * Math.sin(theta) * Math.sin(phi);
    const y = radialDistance * Math.cos(phi);
    return new Vector3(x, y, z);
}

// given coordinates where 0 <= x <= 360 and -90 <= y <= 90, get 3D position
export function getCoordinatePosition(x, y, r) {
    const radialDistance = r || 300;
    const locationX = clamp(x, 0, 360);
    const locationY = clamp(-y, -90, 90);
    const radianPositionX = (locationX / 180) * Math.PI;
    const radianPositionY = ((locationY + 90) / 180) * Math.PI;
    return sphericalToCoordinate(radialDistance, radianPositionX, radianPositionY);
}

// normalized position [0, 360], [-90, 90] to screen position
export function denormalizePosition(x, y) {
    const xAbsolute = (x / 360) * window.innerWidth;
    const yAbsolute = (y / -180 + 0.5) * window.innerHeight;
    return new Vector2(xAbsolute, yAbsolute);
}
