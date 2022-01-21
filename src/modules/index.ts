import { Eureka } from 'eureka-js-client';

const eurekaClient = (app_id: string, port: number) => {

  return new Eureka({
    instance: {
      app: app_id,
      instanceId: `newv-crawler-languages:${port}`,
      hostName: 'localhost',
      ipAddr: '127.0.0.1',
      port: {
        '$': port,
        '@enabled': true,
      },
      vipAddress: 'newv-crawler-languages',
      statusPageUrl: `http://localhost:${port}/health`,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      host: '127.0.0.1',
      port: 8761,
      servicePath: '/eureka/apps/',
    },
  });
};

export default eurekaClient;