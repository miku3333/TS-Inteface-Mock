import Router from 'koa-router';
import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import slash from 'slash';
import { ROOT_PATH } from '../../constants';

const mockRouter = new Router();
const mockSchemaDir = path.join(ROOT_PATH, 'extendedSchema/**');

(async () => {
    const routes = await glob(slash(mockSchemaDir));
    routes.forEach((route) => {
        fs.readJson(route)
            .then((fileData) => {
                const { route, schema } = fileData;
                if (route && schema) {
                    mockRouter.all(route, (ctx) => {
                        ctx.body = schema;
                    });
                } else {
                    throw new Error();
                }
            })
            .catch((err) => {
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.log('err ===> ', err);
                console.log('route ===> ', err);
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            });
    });
})();

export default mockRouter;
