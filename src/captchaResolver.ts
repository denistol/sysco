import { KeyInput, Page } from "puppeteer";
import { delay, downloadFile, getRandom, humanLikeMouseMoveAndClick, transcribeDigits } from "./utils";

export const captchaResolver = async (page: Page) => {
    await delay(1000);

    return new Promise(async (resolve) => {
        page.on('response', async (response) => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';
    
            if (url.endsWith('.wav') || contentType.includes('audio/wav')) {
                console.log('WAV file found:', url);
    
                const filename = 'downloaded_audio.wav';
                await downloadFile(url, filename);
                console.log(`✅ File downloaded: ${filename}`);
    
                const text = await transcribeDigits(filename);
                const digits = text.match(/\d+/g)?.join('').trim() || null;
                if (digits) {
                    await humanLikeMouseMoveAndClick(page, 390, 382);
                    await delay(1000);
                    for (const digit of digits) {
                        await delay(getRandom(500, 1000));
                        await page.keyboard.press(digit as unknown as KeyInput);
                        await delay(getRandom(500, 1000));
                        await page.keyboard.press('Tab');
                    }
                    await humanLikeMouseMoveAndClick(page, 504, 502);
                    resolve(digits);
                } else {
                    resolve("");
                }
            }
        });
    
        await humanLikeMouseMoveAndClick(page, 420, 206);
        await delay(4000);
        await humanLikeMouseMoveAndClick(page, 502, 320);
    })
}