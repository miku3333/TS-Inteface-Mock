import Router from 'koa-router';
import save from './save';
import find from './find';

const router = new Router();

router.post('/save', save);
router.post('/find', find);
// router.all('/img', img);

export default router;
