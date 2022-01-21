import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

import api from './api';
import scheduler from './scheduler';
import eurekaClient from './modules';
import { EurekaClient } from 'eureka-js-client';
import EurekaInstanceConfig = EurekaClient.EurekaInstanceConfig;

const PORT = 3001;
const app = new Koa();
const { log } = console;
const router = new Router();
const APP_ID = 'newv-crawler-languages';
const eurekaInstance = eurekaClient(APP_ID, PORT);

app.use(bodyParser());
router.use('', api.routes());
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => log(`LISTENING ON ${PORT}`));

eurekaInstance.start(err => {
  if (!err) {
    const appInfo = eurekaInstance.getInstancesByAppId(APP_ID);
    appInfo.forEach((config: EurekaInstanceConfig, idx: number) => {
      log(appInfo[idx]);
    });
  }
});

scheduler.start();