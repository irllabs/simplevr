export default function getHotspotIconName(hotspot, extension) {
    const parts = [];

    if (hotspot.image.data) {
        parts.push('image');
    }

    if (hotspot.text) {
        parts.push('text');
    }

    if (hotspot.audio.data) {
        parts.push('audio');
    }
    return `icon-${parts.length > 0 ? parts.join('-') : 'add'}.${extension || 'png'}`;
}
