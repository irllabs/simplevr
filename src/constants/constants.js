export const MIME_TYPE_TEXT = 'text/plain';
export const MIME_TYPE_UTF8 = 'text/plain;charset=utf-8';
export const MIME_TYPE_MP3 = 'audio/mp3';
export const MIME_TYPE_WAV = 'audio/wav';
export const MIME_TYPE_AAC = 'audio/aac';
export const MIME_TYPE_XM4A = 'audio/x-m4a';
export const MIME_TYPE_MPEG = 'audio/mpeg';
export const MIME_TYPE_XWAV = 'audio/x-wav';
export const MIME_TYPE_PNG = 'image/png';
export const MIME_TYPE_JPG = 'image/jpg';
export const MIME_TYPE_JPEG = 'image/jpeg';
export const MIME_TYPE_ZIP = 'application/zip';
export const MIME_TYPE_X_ZIP = 'application/x-zip';
export const MIME_TYPE_OCTET_STREAM = 'application/octet-stream';
export const MIME_TYPE_X_ZIP_COMPRESSED = 'application/x-zip-compressed';
export const MIME_TYPE_MP4 = 'video/mp4';

export const MIME_TYPE_MAP = {
    video: [MIME_TYPE_MP4],
    audio: [
        MIME_TYPE_MP3,
        MIME_TYPE_WAV,
        MIME_TYPE_MPEG,
        MIME_TYPE_XWAV,
        MIME_TYPE_AAC,
        MIME_TYPE_XM4A,
    ],
    image: [MIME_TYPE_PNG, MIME_TYPE_JPG, MIME_TYPE_JPEG],
    zip: [MIME_TYPE_ZIP, MIME_TYPE_X_ZIP, MIME_TYPE_OCTET_STREAM, MIME_TYPE_X_ZIP_COMPRESSED],
};
