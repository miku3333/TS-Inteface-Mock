import slash from 'slash';
import generateSchema from './genertate';
import path from 'path';
import { ROOT_PATH } from '../../constants';

const inputPath = slash(path.join(ROOT_PATH, 'input/*'));
const outputPath = slash(path.join(ROOT_PATH, 'output'));
// const outputSinglePath = slash(path.join(ROOT_PATH, 'output'));

generateSchema({
    inputPath,
    outputPath,
    force: true,
    singleFile: true
});

export {};
