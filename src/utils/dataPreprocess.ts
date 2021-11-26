import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";
import { readFileSync } from 'fs';
import { join } from 'path';
import {Logger} from "@nestjs/common";
import * as _ from 'lodash';

export default async function dataPreprocess(modelName: string, inputData: Array<InterfaceDataPriceData>, columnsNames: Array<string>): Promise<Array<number>> {
    const filePath: string = join(__dirname, '../../','scaleData', `${modelName}.json`);
    const logger = new Logger('DATA PREPROCESS');
    let processedData: Array<number> = [];
    try {
        const rawdata = await readFileSync(filePath);
        let scaleData: object = JSON.parse(rawdata.toString());
        _.forEach(inputData, (data)=>{
            _.forEach(columnsNames, (columnName)=>{
                processedData.push(scale(scaleData, columnName, data[columnName]))
            })
        });
        return processedData;
    }catch (e) {
        logger.error(e);
    }
}

function scale(scaleData: object, columnName: string, value: number): number {
    let min: number = scaleData[columnName].min;
    let max: number = scaleData[columnName].max;
    return (value - min) / (max - min)
}
