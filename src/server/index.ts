import Koa from 'koa';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import router from './router';
import mockRouter from './mockRouter';

const app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
app.use(mockRouter.routes()).use(mockRouter.allowedMethods());
app.listen(23333);
