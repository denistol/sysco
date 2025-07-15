import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import 'dotenv/config'
import { delay, isAccessBlocked, isCaptchaPage } from './utils';
import { captchaResolver } from './captchaResolver';

puppeteer.use(StealthPlugin());

const sysco = async () => {

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

const grainger = async () => {

    const url = 'https://www.grainger.com/category'
    const W = 1024
    const H = 768

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: process.env.CHROME_EXECUTABLE_PATH,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--start-maximized',
            '--disable-infobars',
            '--window-position=0,0',
            `--window-size=${W},${H}`,
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: W,
        height: H,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
    });

    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Priority': 'u=0, i',
        'Cookie': '',
    });

    await page.goto(url, { waitUntil: 'networkidle2' });
    const isCaptcha = await isCaptchaPage(page);
    const isBlocked = await isAccessBlocked(page);

    if(isBlocked) {
        console.log("[Grainger] Access blocked");
        await browser.close();
        return await grainger();
    }

    if (isCaptcha) {
        console.log("[Grainger] Is captcha page");
        const resolved = await captchaResolver(page);
        await delay(5000);
        const tryAgain = await isCaptchaPage(page);
        // Try again ...
        if(tryAgain || !resolved) {
            await browser.close();
            return await grainger();
        }
    }

    const cookies = await page.cookies();
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    await browser.close();
    return { cookieString }
}

export const getCookies = {
    grainger,
    sysco,
}