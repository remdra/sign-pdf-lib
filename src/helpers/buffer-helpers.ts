export function indexOf(buffer: Buffer | Uint8Array, str: string, fromIndex?: number): number {
    if(buffer instanceof Buffer) {
        return buffer.indexOf(str, fromIndex);
    }

    return Buffer.from(buffer).indexOf(str, fromIndex);
}

export function toUint8Array(buffer: ArrayBuffer | Buffer | Uint8Array): Uint8Array {
    if(buffer instanceof Uint8Array) {
        return buffer;
    }
    throw new Error(`Unhandled type ${buffer.constructor.name}}`);
}

export function toArrayBuffer(buffer: ArrayBuffer | Buffer | Uint8Array): ArrayBuffer {
    if(buffer instanceof ArrayBuffer) {
        return buffer;
    }

    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}

export function toBuffer(arr: Uint8Array | ArrayBuffer): Buffer {
    if(arr instanceof Uint8Array) {
        return Buffer.from(arr);
    }
    return Buffer.from(arr);
}
