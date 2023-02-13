import { ROOT_PATH } from '../../constants/index';
import tsj, { Config } from 'ts-json-schema-generator';
import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { MTIME_INTERVAL } from '../../constants';
import handleSchema from './handle';
import slash from 'slash';

const tsconfigPath = path.resolve(ROOT_PATH, './tsconfig.json');

interface IGenertateSchemaOption {
    inputPath: string;
    outputPath: string;
    singleFile?: boolean;
    force?: boolean;
    log?: boolean;
}

const generateSchema = async (options: IGenertateSchemaOption) => {
    const { inputPath, outputPath, singleFile = false, force = false, log = true } = options;
    const entries = await glob(inputPath, { stats: true });
    const now = dayjs().valueOf();
    if (singleFile) {
        const changedFile = entries.filter((file) => {
            const mtime = file.stats!.mtimeMs;
            const changed = now - mtime < MTIME_INTERVAL || force;
            if (changed) {
                console.log(`${file.path} modifyed in ${dayjs(mtime).format('YYYY-MM-DD HH:mm:ss')}`);
            }
            return changed;
        });
        if (changedFile.length) {
            const config: Config = {
                path: inputPath,
                tsconfig: tsconfigPath,
                expose: 'none'
            };
            const gen = tsj.createGenerator(config);
            const schema = gen.createSchema();
            const { effectiveSchemas, formattedSchemas } = handleSchema(schema);
            const effectiveSchemaStr = JSON.stringify(effectiveSchemas, null, 2);
            const formattedSchemaStr = JSON.stringify(formattedSchemas, null, 2);
            const jsonNameNoFormattd = 'singleNoFormattd.json';
            const jsonName = 'single.json';
            fs.outputFile(path.resolve(outputPath, jsonNameNoFormattd), effectiveSchemaStr, (err) => {
                if (err) throw err;
            });
            fs.outputFile(path.resolve(outputPath, jsonName), formattedSchemaStr, (err) => {
                if (err) throw err;
            });
            formattedSchemas.forEach((formattedSchema) => {
                const routeName = formattedSchema.path;
                const routePath = slash(path.resolve(outputPath, `.${routeName}/schema.json`));
                fs.ensureFile(routePath).then(() => {
                    fs.writeJsonSync(routePath, formattedSchema, { spaces: '  ', flag: 'w+' });
                });
            });
        }
    } else {
        entries.forEach((file) => {
            const mtime = file.stats!.mtimeMs;
            if (now - mtime > MTIME_INTERVAL && !force) {
                return;
            }
            const info = `${file.path} modifyed in ${dayjs(mtime).format('YYYY-MM-DD HH:mm:ss')}`;
            log && console.log(info);
            const config: Config = {
                path: file.path,
                tsconfig: tsconfigPath,
                expose: 'none'
            };
            const gen = tsj.createGenerator(config);
            const schema = gen.createSchema();
            const { effectiveSchemas, formattedSchemas } = handleSchema(schema);
            const effectiveSchemaStr = JSON.stringify(effectiveSchemas, null, 2);
            const formattedSchemaStr = JSON.stringify(formattedSchemas, null, 2);
            const name = file.name.split('.')[0] || nanoid();
            const jsonNameNoFormattd = `${name}NoFormattd.json`;
            const jsonName = `${name}.json`;
            fs.outputFile(path.resolve(outputPath, jsonNameNoFormattd), effectiveSchemaStr, (err) => {
                if (err) throw err;
            });
            fs.outputFile(path.resolve(outputPath, jsonName), formattedSchemaStr, (err) => {
                if (err) throw err;
            });
        });
    }
};

export default generateSchema;
