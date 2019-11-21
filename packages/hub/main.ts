import Koa from 'koa';
import logger from '@cardstack/logger';
import JSONAPIMiddleware from './jsonapi-middleware';
import { Registry, Container } from './dependency-injection';

const log = logger('cardstack/server');

export async function wireItUp() {
  let registry = new Registry();
  registry.register('jsonapi-middleware', JSONAPIMiddleware);
  return new Container(registry);
}

export async function makeServer(container?: Container) {
  if (!container) {
    container = await wireItUp();
  }
  let app = new Koa();
  app.use(cors);
  app.use(httpLogging);
  app.use((await container.lookup('jsonapi-middleware')).middleware());
  return app;
}

async function httpLogging(ctxt: Koa.Context, next: Koa.Next) {
  log.info('start %s %s', ctxt.request.method, ctxt.request.originalUrl);
  await next();
  log.info('finish %s %s %s', ctxt.request.method, ctxt.request.originalUrl, ctxt.response.status);
}

function cors(ctxt: Koa.Context, next: Koa.Next) {
  ctxt.response.set('Access-Control-Allow-Origin', '*');
  if (ctxt.request.method === 'OPTIONS') {
    ctxt.response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    ctxt.response.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, If-Match, X-Requested-With');
    ctxt.status = 200;
    return;
  }
  next();
}

