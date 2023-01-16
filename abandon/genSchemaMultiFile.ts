import tsj, { Config } from 'ts-json-schema-generator';
import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import { nanoid } from 'nanoid';
import slash from 'slash';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../output/');
const tsconfigPath = path.join(__dirname, '../tsconfig.json');

const readFile = async () => {
    const entries = await glob(slash(path.resolve(__dirname, './interface/**')), { stats: true });
    entries.forEach((file) => {
        const mtime = file.stats!.mtimeMs;
        if (dayjs().valueOf() - dayjs(mtime).valueOf() > 5000) {
            return;
        }
        const info = `${file.path} modifyed in ${dayjs(mtime).format('YYYY-MM-DD HH:mm:ss')} reGen `;
        console.log(info);
        const config: Config = {
            path: file.path,
            tsconfig: tsconfigPath,
            type: '*',
        };
        const gen = tsj.createGenerator(config);
        const schema = gen.createSchema();
        const schemaString = JSON.stringify(schema, null, 2);
        const jsonName = `${file.name.split('.')[0] || nanoid()}.json`;
        fs.outputFile(path.resolve(outputPath, jsonName), schemaString, (err) => {
            if (err) throw err;
        });
    });
};
readFile();
