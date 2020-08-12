const puppeteer = require('puppeteer');
const genericPool = require('generic-pool');

const defaultPuppeteerArgs = {
  ignoreHTTPSErrors: true,
  headless: true,
  args: ['--no-sandbox'],
  dumpio: false,
  devtools: false
}

const defaultPoolOptions = {
  min: 1,
  testOnBorrow: true,
}

function factory({ puppeteerArgs, maxUses }) {
  let puppeteerLaunchArgs = Object.assign({}, defaultPuppeteerArgs, puppeteerArgs);
  maxUses = Number.isInteger(maxUses) ? maxUses : 2000;

  return {
    create() {
      return puppeteer.launch(puppeteerLaunchArgs).then((browser) => {
        browser.useCount = 0;
        browser.on('disconnected', () => { browser.disconnected = true; });
        return browser;
      });
    },
    validate(browser) {
      return Promise.resolve(
        !browser.disconnected && (maxUses <= 0 || browser.useCount < maxUses)
      );
    },
    destroy(browser) {
      return browser.close();
    }
  };
}

function createPuppeteerPool(options = {}) {
  let { puppeteerArgs, maxUses, ...other } = options;
  let poolOptions = Object.assign({}, defaultPoolOptions, other);

  let pool = genericPool.createPool(
    factory({ puppeteerArgs, maxUses }),
    poolOptions
  );
  const genericAcquire = pool.acquire.bind(pool);
  pool.acquire = () => {
    return genericAcquire().then((instance) => {
      instance.useCount += 1;
      return instance;
    });
  };
  return pool;
}

module.exports = createPuppeteerPool;
