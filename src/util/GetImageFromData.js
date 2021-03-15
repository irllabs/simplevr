export default function getImageFromData(imageData) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.src = imageData;
    });
}
