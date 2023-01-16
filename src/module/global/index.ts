import path from 'path';
import { fileURLToPath } from 'url';

Object.defineProperty(global, 'getFileName', {
    get() {
        return (importMetaUrl: string) => {
            return fileURLToPath(importMetaUrl);
        };
    },
    enumerable: true,
    configurable: false,
});

Object.defineProperty(global, 'getDirName', {
    get() {
        return (importMetaUrl: string) => {
            return path.dirname(fileURLToPath(importMetaUrl));
        };
    },
    enumerable: true,
    configurable: false,
});

export default {};
