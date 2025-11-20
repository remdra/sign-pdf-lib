import { indexOf } from "../../src/helpers";

const replace = require('buffer-replace');

export function bufferReplace(buffer: Buffer | Uint8Array, content: string, replacement: string) {
    if(content.length != replacement.length) {
        throw new Error('Content and replacement should have same size.');
    }
    if(indexOf(buffer, content) < 0) {
        throw new Error('Content not found in buffer.');
    }

    return replace(buffer, content, replacement);
}
