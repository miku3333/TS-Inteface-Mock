import tsj, { Config } from 'ts-json-schema-generator';
import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import { nanoid } from 'nanoid';
import slash from 'slash';
import { fileURLToPath } from 'url';
// import { MTIME_INTERVAL } from './constants';
import dayjs from 'dayjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputPath = slash(path.resolve(__dirname, 'interface/*'));
const outputPath = path.resolve(__dirname, '../output/output.json');
const tsconfigPath = path.join(__dirname, '../tsconfig.json');

const readFile = async () => {
    const entries = await glob(inputPath, { stats: true });
    const now = dayjs().valueOf();
    const changedFile = entries.filter((file) => {
        const mtime = file.stats!.mtimeMs;
        const changed = now - mtime < 5000;
        if (changed) {
            console.log(`${file.path} modifyed in ${dayjs(mtime).format('YYYY-MM-DD HH:mm:ss')}`);
        }
        return changed;
    });
    if (changedFile.length) {
        const config: Config = {
            path: inputPath,
            tsconfig: tsconfigPath,
            type: '*',
        };
        const gen = tsj.createGenerator(config);
        const schema = gen.createSchema();
        const schemaString = JSON.stringify(schema, null, 2);
        fs.outputFile(outputPath, schemaString, (err) => {
            if (err) throw err;
        });
    }
};
readFile();
