import fs from 'fs'
import { json2csv } from 'json-2-csv';

export const write = async (fileName: string, data: object[]) => {
    const names = {
        json: `${fileName}.json`,
        csv: `${fileName}.csv`,
    }
    const csvData = await json2csv(data)
    fs.writeFileSync(names.json, JSON.stringify(data, null, 2))
    fs.writeFileSync(names.csv, csvData)
    console.info([`[ WRITE ] ${names.json}, ${names.csv} - ${data.length} rows.`])
}