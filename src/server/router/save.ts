import Router from 'koa-router';
import { ROOT_PATH, SUCCESS_RES } from '../../constants';
import { niceTryAsync } from '../../utils';
import fs from 'fs-extra';
import slash from 'slash';
import path from 'path';

const outputDir = path.join(ROOT_PATH, 'extendedSchema');

const save: Router.IMiddleware = async (ctx) => {
    const { route, schema } = ctx.request.body as IObject;
    if (route && schema) {
        const outputPath = slash(path.join(outputDir, `${route}.json`));
        const result = await niceTryAsync(async () => {
            await fs.ensureFile(outputPath);
            await fs.writeJSON(outputPath, { route, schema }, { spaces: '  ' });
            return 'success';
        });
        if (result) {
            ctx.body = SUCCESS_RES;
            return;
        }
    }
    ctx.status = 500;
    ctx.body = 'SERVER ERROR';
};

export default save;
