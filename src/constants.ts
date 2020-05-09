export const MIME_TYPE_TEXT: string = 'text/plain';
export const MIME_TYPE_UTF8: string = 'text/plain;charset=utf-8';
export const MIME_TYPE_MP3: string = 'audio/mp3';
export const MIME_TYPE_WAV: string = 'audio/wav';
export const MIME_TYPE_AAC: string = 'audio/aac';
export const MIME_TYPE_XM4A: string = 'audio/x-m4a';
export const MIME_TYPE_MPEG: string = 'audio/mpeg';
export const MIME_TYPE_XWAV: string = 'audio/x-wav';
export const MIME_TYPE_PNG: string = 'image/png';
export const MIME_TYPE_JPG: string = 'image/jpg';
export const MIME_TYPE_JPEG: string = 'image/jpeg';
export const MIME_TYPE_ZIP: string = 'application/zip';
export const MIME_TYPE_X_ZIP: string = 'application/x-zip';
export const MIME_TYPE_OCTET_STREAM: string = 'application/octet-stream';
export const MIME_TYPE_X_ZIP_COMPRESSED: string = 'application/x-zip-compressed';
export const MIME_TYPE_MP4 = 'video/mp4';

export const MIME_TYPE_MAP = {
	video: [MIME_TYPE_MP4],
	audio: [MIME_TYPE_MP3, MIME_TYPE_WAV, MIME_TYPE_MPEG, MIME_TYPE_XWAV, MIME_TYPE_AAC, MIME_TYPE_XM4A],
	image: [MIME_TYPE_PNG, MIME_TYPE_JPG, MIME_TYPE_JPEG],
	zip: [MIME_TYPE_ZIP, MIME_TYPE_X_ZIP, MIME_TYPE_OCTET_STREAM, MIME_TYPE_X_ZIP_COMPRESSED],
};
