import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import 'dotenv/config'

puppeteer.use(StealthPlugin());

export const getCookies = async () => {

    const zipCode = '97002'
    const url = 'https://shop.sysco.com/app/catalog'

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: process.env.CHROME_EXECUTABLE_PATH
    });
    const page = await browser.newPage();

    await page.setViewport({
        width: 1280,
        height: 720,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
    });

    const userAgent = randomUseragent.getRandom();

    await page.setUserAgent(userAgent || '');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.CAG_button', { visible: true });
    await page.click('.CAG_button');

    await page.waitForSelector('.initial-zipcode-modal-input input', { visible: true });
    await page.type('.initial-zipcode-modal-input input', zipCode, { delay: 100 });
    await page.keyboard.press('Enter');

    await page.waitForSelector('.search-filters', { visible: true });

    const brands = await page.evaluate(() => {
        const items: string[] = [];
        [...document.querySelectorAll('input')].forEach(el => {
            const attr = el.getAttribute('data-type');
            if (attr === 'BRAND') {
                const value = el.getAttribute('value') || '';
                items.push(value);
            }
        });
        return items;
    });

    const cookies = await page.cookies();
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    await browser.close();

    return { cookieString, cookies, brands };
};
