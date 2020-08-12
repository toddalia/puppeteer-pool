# Usage
Pool of [puppeteer](https://github.com/puppeteer/puppeteer) processes managed with [generic-pool](https://github.com/coopernurse/node-pool).

```javascript
const createPuppeteerPool = require('puppeteer-pool');
let pool = createPuppeteerPool(
  maxUses: 2000, // max usage count of puppeteer instance
  min: 2, // min number of processes in the pool
  max: 10,
  puppeteerArgs: { // args passed to puppeteer.launch
    headless: true,
    executablePath: "<PATH-TO-CHROME>",
    dumpio: true
  }
)
const browser = await pool.acquire();
await pool.release(browser);
await pool.drain();
await pool.clear();
```
