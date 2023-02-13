import Koa from 'koa';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import router from './router';
import mockRouter from './mockRouter';
import img from './router/img';
import { PORT } from '../constants';

const app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
app.use(mockRouter.routes()).use(mockRouter.allowedMethods());
app.use(img);
app.listen(PORT);
