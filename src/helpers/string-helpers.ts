export function escapeString(str: string): string {
    if(!needsEscape(str)) {
        return str;
    }

    let escaped = String.fromCharCode(254) + String.fromCharCode(255);
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        escaped = escaped + escapeCode(Math.floor(code / 256));
        escaped = escaped + escapeCode(code % 256);
    }
    return escaped;
}

function needsEscape(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if(code >= 255){
            return true;
        }
    }
    return false;
}

function escapeCode(code: number): string {
    let str = '';
    if(code === '\\'.charCodeAt(0)) {
        str = str + '\\';
    }
    str = str + String.fromCharCode(code);

    return str;
}
