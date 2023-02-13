import Router from 'koa-router';
import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import slash from 'slash';
import { ROOT_PATH } from '../../constants';
import { genMockData } from '../../module/mock';

const mockRouter = new Router();
const mockSchemaDir = slash(path.join(ROOT_PATH, 'extendedSchema/**'));
const genSchemaDir = slash(path.join(ROOT_PATH, 'output/**'));

const mock = async (dir: string) => {
    const routes = await glob(dir);
    routes.forEach((route) => {
        fs.readJson(route)
            .then((fileData) => {
                const { path, schema } = fileData;
                if (path && schema) {
                    mockRouter.all(path, (ctx) => {
                        ctx.body = {
                            data: genMockData(schema),
                            code: 0,
                            success: true,
                            message: '请求成功',
                            msg: '请求成功'
                        };
                    });
                } else {
                    throw new Error();
                }
            })
            .catch((err) => {
                console.log('err ===> ', err);
            });
    });
};

mock(mockSchemaDir);
mock(genSchemaDir);

export default mockRouter;
