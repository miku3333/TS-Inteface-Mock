import path from 'path';
import slash from 'slash';

export const MTIME_INTERVAL = 5000;
export const SRC_PATH = slash(path.resolve(getDirName(import.meta.url), '../../src/'));
export const ROOT_PATH = slash(path.resolve(getDirName(import.meta.url), '../../'));
export enum SCHEMA_TYPE {
    string = 1,
    number = 2,
    null = 3,
    boolean = 4,
    ERROR = 5,
    enum = 6,
    array = 7,
    anyOf = 8,
    any = 9,
    object = 10
}
export const SUCCESS_RES = {
    code: 0,
    success: true,
    msg: null
};
export const ERROR_RES = {
    code: -1,
    success: false,
    msg: null
};
export const PORT = 23333;
export const SERVER_PATH = `http://localhost:${PORT}`;
// export const inputPath = slash(path.resolve(__dirname, 'interface/*'));
// export const outputPath = path.resolve(__dirname, '../output/');
// export const outputPathSingleFile = path.resolve(outputPath, 'output.json');
