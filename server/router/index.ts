import Router from 'koa-router';
import test from './test';

const router = new Router();

router.all('/test', test);

export default router;
