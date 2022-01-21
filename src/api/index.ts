import Router from 'koa-router';

const { log } = console;
const api = new Router();

api.get('/health', ctx => {
  log('PING!');
  ctx.body = { 'ping': 'pong' };
  ctx.status = 200;
});

export default api;
