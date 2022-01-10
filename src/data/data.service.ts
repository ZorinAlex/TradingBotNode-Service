import {Injectable, Logger} from '@nestjs/common';
import axios from "axios";
import convertInputData from "../utils/dataConvert";
import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";

@Injectable()
export class DataService {
    constructor(){
        this.logger = new Logger(this.name);
    }

    protected name: string = 'Data Service';
    protected logger: Logger;

    async getHoursDataInRange(start: number, end: number){
        try{
            const pricesData = await axios.get(`https://api.blockchain.com/nabu-gateway/markets/exchange/prices?symbol=BTC-USD&start=${start}&end=${end}&granularity=3600`);
            return convertInputData(pricesData.data.prices);
        }catch (error) {
            return error.data
        }
    }

    async getDataInRange(start: number, end: number, granularity: number){
        try{
            const pricesData = await axios.get(`https://api.blockchain.com/nabu-gateway/markets/exchange/prices?symbol=BTC-USD&start=${start}&end=${end}&granularity=${granularity}`);
            return convertInputData(pricesData.data.prices);
        }catch (error) {
            return error.data
        }
    }

    async getHoursDataBlockchain(hours: number): Promise<Array<InterfaceDataPriceData>> {
        try{
            const end: number = Date.now();
            const start: number = end - hours*60*60*1000;
            const pricesData = await axios.get(`https://api.blockchain.com/nabu-gateway/markets/exchange/prices?symbol=BTC-USD&start=${start}&end=${end}&granularity=3600`);
            return convertInputData(pricesData.data.prices);
        }catch (error) {
            return error.data
        }
    }
}
