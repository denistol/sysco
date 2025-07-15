import path from "path";
import fs from "fs";
import { json2csv } from 'json-2-csv';
import https from 'https';
import 'dotenv/config';
import FormData from 'form-data';
import axios from 'axios';
import { Page } from "puppeteer";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function getRandom(from = 300, to = 700): number {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

export const stripQueryParams = (url) => {
    const [path] = url.split('?');
    return path;
}

export const ensureFilePath = (filePath: string): string => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return filePath;
}

export const write = async (fileName: string, data: object[]) => {
    const names = {
        json: `${fileName}.json`,
        csv: `${fileName}.csv`,
    }
    const csvData = await json2csv(data)

    fs.writeFileSync(ensureFilePath(names.json), JSON.stringify(data, null, 2))
    fs.writeFileSync(ensureFilePath(names.csv), csvData)

    console.info([`[ WRITE ] ${names.json}, ${names.csv} - ${data.length} rows.`])
}

export async function downloadFile(fileUrl: string, dest: string) {

    return new Promise<void>((resolve, reject) => {
        https.get(fileUrl, (res) => {
            if (res.statusCode !== 200) return reject(new Error('Failed to download'));

            const fileStream = fs.createWriteStream(dest);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', reject);
    });
}

export async function transcribeDigits(audioPath: string): Promise<string> {
    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1');
    form.append('language', 'en');
    form.append('temperature', '0.2');
    form.append('prompt', 'Start listen from 4 second, and transcribe digits only, like "1234567"');

    const res = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        form,
        {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                ...form.getHeaders()
            }
        }
    );

    console.log("Detected text from audio: ",res.data?.text);
    return res.data.text;
}

export async function humanLikeMouseMoveAndClick(page: Page, x: number, y: number) {
    
    let startX = getRandom(200, 300);
    let startY = getRandom(200, 300);
    const steps = getRandom(20, 30);

    for (let i = 1; i <= steps; i++) {
        const intermediateX = startX + ((x - startX) * i) / steps + (Math.random() - 0.5) * 2;
        const intermediateY = startY + ((y - startY) * i) / steps + (Math.random() - 0.5) * 2;
        await page.mouse.move(intermediateX, intermediateY);
        
        await delay(getRandom(5, 20));
    }
    await delay(getRandom());
    await page.mouse.click(x, y);
    await delay(getRandom());
}

export const isCaptchaPage = async (page: Page) => {
    const content = await page.content();
    return content.includes('src="https://geo.captcha-delivery.com/captcha');
}
export const isAccessBlocked = async (page: Page) => {
    const content = await page.content();
    return content.toLowerCase().includes('access blocked');
}