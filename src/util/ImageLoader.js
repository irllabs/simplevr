export default function loadImageForRoom(room) {
    if (room.panoramaUrl.backgroundImage.preloaded) {
        return room.panoramaUrl.backgroundImage.data;
    }

    const url = room.panoramaUrl.backgroundImage.data;

    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            const dataURL = canvas.toDataURL("image/png");

            room.panoramaUrl.backgroundImage.data = dataURL;

            room.panoramaUrl.backgroundImage.preloaded = true;

            resolve();
        }
        image.src = url;
    });
}
