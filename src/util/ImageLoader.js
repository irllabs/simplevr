export default function loadImageForRoom(room) {
    const data = room.panoramaUrl.backgroundImage.data;
    const preloaded = room.panoramaUrl.backgroundImage.preloaded;

    if (data.startsWith('data:') || preloaded) {
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

            const dataURL = canvas.toDataURL("image/jpeg", 0.8);

            room.panoramaUrl.backgroundImage.data = dataURL;

            room.panoramaUrl.backgroundImage.preloaded = true;

            resolve();
        }
        image.src = url;
    });
}

export function loadImage(url) {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            ctx.globalCompositeOperation='destination-in';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            const dataURL = canvas.toDataURL("image/png", 0.8);

            resolve(dataURL);
        }
        image.src = url;
    });
}

export function getImageFromChar(char) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    // Draw white circle
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw char in the middle of circle
    ctx.fillStyle = 'rgba(168, 168, 168, 1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '80px Inter';
    ctx.fillText(char, 64, 64);

    return canvas.toDataURL("image/png", 0.8);
}
