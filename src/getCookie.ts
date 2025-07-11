import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import 'dotenv/config'

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
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: process.env.CHROME_EXECUTABLE_PATH,
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

    await page.setExtraHTTPHeaders({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Priority": "u=0, i",
    })

    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0'

    await page.setUserAgent(userAgent || '');
    await page.goto(url, { waitUntil: 'networkidle2' });
    const cookies = await page.cookies();
    // const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    await browser.close();
    return { cookieString: 'btps=false; sitetype=full; AB1=G; AD1=B; DS2=B; CIP=84.17.46.208; geo=|WARSAW||PL; TLTSID=8BD3476C3889441CD8345AA6C68057F9; signin=C; reg=A; LDC=3D643DAB2EEAAB1B058989194E47EEF6; AMCV_FC80403D53C3ED6C0A490D4C%40AdobeOrg=1176715910%7CMCIDTS%7C20280%7CMCMID%7C06929519181116380344530197396798957179%7CMCAID%7CNONE%7CMCOPTOUT-1752199997s%7CNONE%7CMCAAMLH-1752797597%7C6%7CMCAAMB-1752797597%7Cj8Odv6LonN4r3an7LhD3WZrU1bUpAkFkkiY1ncBR96t2PTI%7CvVersion%7C5.4.0; O=1p; at_check=true; s_ecid=MCMID%7C06929519181116380344530197396798957179; AMCVS_FC80403D53C3ED6C0A490D4C%40AdobeOrg=1; s_vnc30=1754787970613%26vn%3D2; _gcl_au=1.1.1328927570.1752185517; s_cc=true; kndctr_FC80403D53C3ED6C0A490D4C_AdobeOrg_identity=CiYwNjkyOTUxOTE4MTExNjM4MDM0NDUzMDE5NzM5Njc5ODk1NzE3OVIRCLb4lLP_MhgBKgRJUkwxMAPwAbb4lLP_Mg==; aam_uuid=07183248386662513434520385030952519718; isPickup=false; O=1p; guestRTA=true; _uetsid=3b1392c05dea11f09839918a2b64199c; _uetvid=3b13b4405dea11f0881b899e66fcecf5; ak_bmsc=B9C9CCAAE0132DBE098D319E718EF7A6~000000000000000000000000000000~YAAQSzxlX52afcSXAQAA9hTc9hzsRqVfeTv4dMrAi1Geanag9EDqFWJeq1+lR7vQ1UbSciSAIEfNrrX+/0YCZGxvcEQEyAK1zPMUuECi9jrJsSTCXT6t+00coqvU64gOC2aDSqS7MTTZEOK7GvYMhGfTDltrQDKVRfB9+Iu83NVgOyCoVqcFBzh98TAEPJiWTyJ5oVxiGegJloNpuZZCDnVKj78TY2jZv8jM+9W6jz61zfyFuNFtzxtrRnntXW0Kbkav3JoBTUguIreRiGUTsTbMgYjiPnXmGA7P0jZaV7jQEWHFzoFVJpqvslq8LcLPRG76ws/o8DoZxShGtp9yaYyrU9gjlg/5ghNie7UhHlhNzdMW+yFJB7Wocm1uCnPN3fm6hPTl7C0aFUKjF3TQKEM5x3Lw1qwKQzZf4pHFjJSOk5fOLG5KK44Lmm+6zALFRFzk/yPHmC4OFn6zmVS0FJuCeAMPgTweSDWK/clkLLrvCUlzgmg/R3TJPbPclvHEkIjL9ekFBE3cPJKXqqUelMMJtQGScKoRmZAcD6W4vs478FCAxRbbTyBDGG209b2K6jseeCx7pa+it8UGE3v6NZhqSY3r; bm_sv=60FCAFE846115B50D8BBBAB6259BAE74~YAAQogcQAtv+4LaXAQAATZcQ9xwNznjkT7mPgdhybetAIe+xW2I4K9ByAq7sXdE7HKQij3vE/8DGvDR/KSMs3ScZRFOT2nbG8eKruC8tUxLwDyBhNvfUvNU+A1yG+32m0yp2AJh+hgJLhb9TkHnWyH9L0CJ/4nMwodgbVLcaixY0T4ZM30uiP9wiJrlaqqkr9pTdv/sG3NrnXQKqjKpJwsUq+mJrD13dch7WKvPYmIRZy73YjXdUEc4tpDZL6yFQAWvl~1; bm_mi=4543710B98752B282FBDBEC869BD15E5~YAAQSzxlX3eafcSXAQAAdwPc9hwmUwPtHIzERjn5A5XupEMnP36TBQB0Z9UWnpe0uVL2LV9FcMX7XLHAJCd16llPkzs4ke7ua5E+p0+ZJ5V4imWqRPFpwT33fJhRlnUFSZKMS+cNiU2TbNhquYc6UQqZCP237IYSOmq3gCnTOJ1QPT1hV/amANy9xqHSWt//2960WuQJrp/GMvQO1coL1Dylilpoc9OjEI/dto7AHDjGjl+AkutQshJ597BQ8iPativTa7DxxVZmw6hk+YKJqnyRtKt35qDlCriMLy7EF028++gNwgCfTraRYEmJP3aZnrUE6DEDn83edJy/LIWS7znk9c8s0ytWQ7v0avu3fS/anQWyN3xAEkoCwxvHfgu57SVu5RKKFxv3ZBmWVvK07ipg0ZbsdO3/pN6hbMOXTgTP31PY+dPVNTuXHs4w5Ag=~1; mbox=PC#ddfaa57b84dd441db2539881225e502c.37_0#1815441547|session#043f0fcc09db48478322c2924b52f9ba#1752198607; OptanonConsent=isGpcEnabled=0&datestamp=Fri+Jul+11+2025+04%3A19%3A06+GMT%2B0300+(Eastern+European+Summer+Time)&version=202211.2.0&isIABGlobal=false&hosts=&consentId=2f6bc9a5-48c2-446e-9acd-e340ec2966db&interactionCount=1&landingPath=NotLandingPage&groups=C0004%3A1%2CC0007%3A1%2CC0003%3A1%2CC0001%3A1%2CC0002%3A1&AwaitingReconsent=false; _dd_s=rum=1&id=509cf06c-3f8a-4be8-9448-6bb90e190200&created=1752195972630&expire=1752197648438; _ga=GA1.1.236438250.1752185519; _ga_94DBLXKMHK=GS2.1.s1752195967$o2$g1$t1752196750$j52$l0$h0; kndctr_FC80403D53C3ED6C0A490D4C_AdobeOrg_cluster=irl1; ttc=1752195970763; s_nr30=1752196750664-Repeat; s_ivc=true; datadome=8T6T2TyL9sXVwAnir6JpAZk9KjyzFNz_V4Qio9yO0lYnR1pxbM584mNGN8FX9EPX7gGgNjVUhcruR_uGaPhdsVmKrl0nEUNG4eRnrao~oXFZ1MioNkAcDdBRhqVQLffG', cookies };
}

export const getCookies = {
    grainger,
    sysco,
}