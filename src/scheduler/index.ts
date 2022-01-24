import schedule from 'node-schedule';
import crawler from '../function/index';

const obj = {
  start: () => {
    const oracleJavaRule = new schedule.RecurrenceRule();
    oracleJavaRule.minute = 0;
    oracleJavaRule.second = 0;
    schedule.scheduleJob(oracleJavaRule, crawler.crawlingOracleJava);
    const openJavaRule = new schedule.RecurrenceRule();
    openJavaRule.minute = 30;
    openJavaRule.second = 30;
    schedule.scheduleJob(openJavaRule, crawler.crawlingOpenJava);
  },
};

export default obj;