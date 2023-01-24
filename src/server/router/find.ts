import Router from 'koa-router';
import { ERROR_RES, ROOT_PATH, SUCCESS_RES } from '../../constants';
import { niceTryAsync } from '../../utils';
import fs from 'fs-extra';
import slash from 'slash';
import path from 'path';

const outputDir = path.join(ROOT_PATH, 'extendedSchema');

const find: Router.IMiddleware = async (ctx) => {
    const { route } = ctx.request.body as IObject;
    if (route) {
        const outputPath = slash(path.join(outputDir, `${route}.json`));
        const exists = await fs.pathExists(outputPath);
        if (exists) {
            const result = await niceTryAsync(async () => {
                return await fs.readJson(outputPath);
            });
            if (result?.schema) {
                ctx.body = { ...SUCCESS_RES, data: result.schema };
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
