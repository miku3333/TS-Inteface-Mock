import Router from 'koa-router';
import fs from 'fs-extra';
import slash from 'slash';
import mime from 'mime-types';
import path from 'path';
import { ROOT_PATH } from '../../constants';

const imgDir = path.join(ROOT_PATH, 'public/imgs/');

const img: Router.IMiddleware = async (ctx) => {
    let filePath = path.join(imgDir, ctx.url.split('img/')[1]);
    let file = null;
    try {
        file = fs.readFileSync(filePath);
    } catch (error) {
        filePath = path.join(imgDir, '0A31DF257C3D3D0FD7FDA242E7E54315.webp'); //默认图片地址
        file = fs.readFileSync(filePath);
    }

    let mimeType = mime.lookup(filePath);
    ctx.set('content-type', mimeType || '');
    ctx.body = file;
};

export default img;
