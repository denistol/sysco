import path from "path";
import fs from "fs";
import { json2csv } from 'json-2-csv';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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