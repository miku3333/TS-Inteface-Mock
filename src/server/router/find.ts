import Router from 'koa-router';
import { ERROR_RES, ROOT_PATH, SUCCESS_RES } from '../../constants';
import { niceTryAsync } from '../../utils';
import fs from 'fs-extra';
import slash from 'slash';
import pathM from 'path';

const find: Router.IMiddleware = async (ctx) => {
    const { path } = ctx.request.body as IObject;
    if (path) {
        const outputPathExtended = slash(pathM.join(ROOT_PATH, 'extendedSchema', `${path}/schema.json`));
        const outputPath = slash(pathM.join(ROOT_PATH, 'output', `${path}/schema.json`));
        console.log('outputPathExtended ===> ', outputPathExtended);
        console.log('outputPath ===> ', outputPath);
        if (await fs.pathExists(outputPathExtended)) {
            const schema = await niceTryAsync(async () => {
                return await fs.readJson(outputPathExtended);
            });
            if (schema) {
                ctx.body = { ...SUCCESS_RES, data: schema };
                return;
            }
        } else if (await fs.pathExists(outputPath)) {
            const schema = await niceTryAsync(async () => {
                return await fs.readJson(outputPath);
            });
            if (schema) {
                ctx.body = { ...SUCCESS_RES, data: schema };
                return;
            }
        } else {
            ctx.body = { ...ERROR_RES, msg: 'route not exist' };
            return;
        }
    }
    ctx.status = 500;
    ctx.body = 'SERVER ERROR';
};

export default find;
