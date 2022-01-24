import puppeteer from 'puppeteer';
import kafka from 'kafka-node';
import cheerio from 'cheerio';
import moment from 'moment';
import moment_timezone from 'moment-timezone';

import { IVersionInfo, VersionInfo } from '../models';

const { log, error } = console,
  KST = 'Asia/Seoul',
  ORACLE_DOMAIN = 'https://www.oracle.com',
  OPENJDK_DOMAIN = 'https://openjdk.java.net/projects/jdk/',
  OPENJDK_TAG_PREFIX_URL = 'https://github.com/openjdk/jdk',
  Producer = kafka.Producer,
  client = new kafka.KafkaClient(),
  producer = new Producer(client);

function sendKafka(data: IVersionInfo) {

  producer.send([{
    topic: 'test-topic',
    messages: JSON.stringify(data),
  }], (err, data) => {
    if (err) {
      error(err);
    } else {
      log(`data: ${JSON.stringify(data)}`);
    }
  });
}

const obj = {
  crawlingOracleJava: async () => {
    log('START CRAWLING ORACLE JAVA...', new Date());

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`${ORACLE_DOMAIN}/java/technologies/javase/jdk-relnotes-index.html`);
      await page.waitForSelector('ul.cta-list');
      let html = await page.mainFrame().content();
      let $ = cheerio.load(html);
      const latestAnchor = $('ul.cta-list > li > a');
      const latestLink = latestAnchor.attr('href');

      await page.goto(`${ORACLE_DOMAIN}${latestLink}`);
      await page.waitForSelector('div > ul.obullets');
      html = await page.content();
      $ = cheerio.load(html);

      const jdks = $('div > ul.obullets > li').text();
      const jdkArr = jdks.split('JDK').filter(v => v);

      await browser.close();

      const oracleJdkVersion = new VersionInfo();
      oracleJdkVersion.name = 'ORACLE_JDK';
      oracleJdkVersion.version_text = jdkArr[0].trim().toLowerCase().replace('(ga)', '');
      oracleJdkVersion.version_num = parseFloat(jdkArr[0].trim().split(' ')[0].trim());
      oracleJdkVersion.is_ga = jdkArr[0].trim().split(' ')[1].toUpperCase().includes('GA');
      oracleJdkVersion.created = moment_timezone().tz(KST).format();

      log('ORACLE JAVA:', oracleJdkVersion);

      sendKafka(oracleJdkVersion);

      return oracleJdkVersion;

    } catch (err) {
      error(err);
    }
  },
  crawlingOpenJava: async () => {

    log('START CRAWLING OPEN JAVA...', new Date());

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`${OPENJDK_DOMAIN}`);
      await page.waitForSelector('div#main > ul > li');
      let html = await page.mainFrame().content();
      let $ = cheerio.load(html);
      const releaseLists = $('div#main > ul > li');
      let lastestGA = null;

      releaseLists.each((i, el) => {
        const liText = $(el).text();

        if (liText.includes('GA')) {
          lastestGA = liText.trim();
        }
      });

      const openJdkVersion = new VersionInfo();

      if (lastestGA !== null) {
        // @ts-ignore
        const lastestArr = lastestGA.trim().split(' ');
        openJdkVersion.is_ga = true;
        openJdkVersion.name = 'OPEN_JDK';
        openJdkVersion.version_text = lastestGA;
        openJdkVersion.version_num = parseFloat(lastestArr[0]);
        openJdkVersion.created = moment_timezone().tz(KST).format();
        openJdkVersion.update_date_text = lastestArr.length >= 3
          ? moment.utc(lastestArr[2].replace(')', ''), 'YYYY/MM/DD').toDate() : '';

        const makedUrl = `${OPENJDK_TAG_PREFIX_URL}${openJdkVersion.version_num}u/tags`;
        await page.goto(makedUrl);
        await page.waitForSelector('h4.commit-title > a');
        html = await page.mainFrame().content();
        $ = cheerio.load(html);

        $('h4.commit-title > a').each((i, el) => {
          const tag = $(el).text().trim();

          if (tag.toLowerCase().includes('-ga')) {
            openJdkVersion.version_text = tag
              .replace('-ga', '')
              .replace('jdk-', '');
            return false;
          }
        });
      }

      await browser.close();

      log('OPEN JAVA:', openJdkVersion);

      sendKafka(openJdkVersion);

      return openJdkVersion;

    } catch (err) {
      error(err);
    }
  },
};

export default obj;