import {Injectable, Logger} from '@nestjs/common';
import axios from "axios";
import convertInputData from "../utils/dataConvert";
import * as path from "path";
import * as fs from "fs";
import * as _ from 'lodash';

@Injectable()
export class DataService {
    constructor(){
        this.logger = new Logger(this.name);
    }

    protected name: string = 'Data Service';
    protected logger: Logger;

    async getDataInRange(start: number, end: number, granularity: number){
        try{
            const pricesData = await axios.get(`https://api.blockchain.com/nabu-gateway/markets/exchange/prices?symbol=BTC-USD&start=${start}&end=${end}&granularity=${granularity}`);
            return convertInputData(pricesData.data.prices);
        }catch (error) {
            return error.data
        }
    }

    async getDataFile(){
        const filePath = path.join(__dirname, '../../files', 'BTCUSD_original_blockchain_hourly_target.csv');
        const csv = fs.readFileSync(filePath);
        const csvArray = csv.toString().split("\r\n");
        const fieldsNames = ['timestamp','open','high','low','close','volume', 'target'];
        const result = [];
        _.forEach(csvArray, csvLine=>{
            const csvLineArray = csvLine.split(',');
            const lineObj = {};
            _.forEach(csvLineArray, (csvItem, index)=>{
                lineObj[fieldsNames[index]] = csvItem
            });
            result.push(lineObj);
        });
        return JSON.stringify(result)
    }
}
