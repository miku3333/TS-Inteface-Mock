import Router from 'koa-router';

const test: Router.IMiddleware = ctx => {
    ctx.body = 'Hello World!';
};

export default test;
