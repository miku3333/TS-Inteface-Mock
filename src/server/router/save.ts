import Router from 'koa-router';
import { ROOT_PATH, SUCCESS_RES } from '../../constants';
import { niceTryAsync } from '../../utils';
import fs from 'fs-extra';
import slash from 'slash';
import pathM from 'path';

const outputDir = pathM.join(ROOT_PATH, 'extendedSchema');

const save: Router.IMiddleware = async (ctx) => {
    const { path, schema } = ctx.request.body as IObject;
    console.log('ctx.request.body ===> ', ctx.request.body);
    if (path && schema) {
        const outputPath = slash(pathM.join(outputDir, `${path}/schema.json`));
        const result = await niceTryAsync(async () => {
            await fs.ensureFile(outputPath);
            await fs.writeJSON(outputPath, { path, schema }, { spaces: '  ' });
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
