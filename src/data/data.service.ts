import {Injectable, Logger} from '@nestjs/common';
import axios from "axios";
import * as _ from 'lodash';
import Timeout = NodeJS.Timeout;
import {WebSocket} from 'ws';
import {Cron} from "@nestjs/schedule";

import InterfaceTickerData from "../misc/interfaces/interface-ticker-data";
import InterfaceDataPriceData from '../misc/interfaces/interface-data-price-data';
import {WSChannels, WSEvents} from "../misc/names/ws-names";
import {ReadyState} from "../misc/enums/ws-ready-state";
import convertInputData from "../utils/dataConvert";
import {PredictionService} from "../prediction/prediction.service";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";

@Injectable()
export class DataService {
    constructor( protected predictionService: PredictionService){
        this.logger = new Logger(this.name);
        //this.connect();
    }

    protected name: string = 'Data Service';
    protected logger: Logger;
    protected webSocket: any;
    protected heartbitTime: number = 60000;
    protected reconnectTryInterval: number = 10000;
    protected heartbitTimeout: Timeout;
    protected isPinged: boolean = false;

    async getData(hours: number): Promise<Array<InterfaceDataPriceData>>{
        const end = Date.now();
        const start = end - (hours + 1)*60*60*1000;
        try{
            const pricesData = await axios.get(`https://api.blockchain.com/nabu-gateway/markets/exchange/prices?symbol=BTC-USD&start=${start}&end=${end}&granularity=3600`);
            //remove current hour cause its not filled
            pricesData.data.prices.pop();
            return convertInputData(pricesData.data.prices);
        }catch (error) {
            return error.data
        }
    }

    async getPrediction(): Promise<InterfacePredictionResult>{
        try{
            const inputData: Array<InterfaceDataPriceData> = await this.getData(81);
            const prediction: InterfacePredictionResult = await this.predictionService.predictAction(inputData);
            return prediction;
        }catch (error) {
            return error.data
        }
    }

    public isAlive(): boolean {
        return this.isPinged;
    }

    @Cron('1 * * * *')
    async handleCron() {
        this.logger.log('CORN HOUR ENDED:');
        const lastData = await this.getData(2);
        const prediction = await this.getPrediction();
        this.logger.log(prediction);
        this.logger.log(lastData[0]);
    }

    connect(): void{
        const endpoint: string = 'wss://ws.prod.blockchain.info/mercury-gateway/v1/ws';
        const options: Object = {origin: 'https://exchange.blockchain.com'};

        try {
            this.webSocket = new WebSocket(endpoint, options);
        }catch (error) {
            this.logger.error(error);
        }

        const subscribeHeartbeat: Object = {
            "action": "subscribe",
            "channel": "heartbeat",
        };

        const subscribeTicker: Object = {
            "action": "subscribe",
            "channel": "ticker",
            "symbol": "BTC-USD"
        };

        this.webSocket.on('open', () => {
            this.logger.log('WS CONNECTION OPEN');
            this.webSocket.send(JSON.stringify(subscribeHeartbeat));
            this.webSocket.send(JSON.stringify(subscribeTicker));
        });

        this.webSocket.on('message', async data => {
            await this.handleMessage(JSON.parse(data))
        });
        this.webSocket.on('error', (error) => {
            this.logger.error(error);
        });

        this.webSocket.on('close', ()=> {
            this.logger.log('WS CONNECTION CLOSED');
            this.isPinged = false;
        });
        this.heartbit();
    }

    protected reconnect(): void {
        clearInterval(this.heartbitTimeout);
        this.logger.log('WS RECONNECT TRY');
        if (this.webSocket.readyState !== ReadyState.CLOSED){
            this.webSocket.close();
        }
        const interval = setInterval(()=>{
            if (this.webSocket.readyState === ReadyState.CLOSED){
                clearInterval(interval);
                this.connect()
            }
        },this.reconnectTryInterval)
    }

    protected heartbit(): void{
        clearInterval(this.heartbitTimeout);
        this.heartbitTimeout = setInterval(()=>{
            if(!this.isPinged){
                clearInterval(this.heartbitTimeout);
                this.reconnect()
            }
            this.isPinged = false;
        }, this.heartbitTime);
    }

    protected handleMessage(message: any) {
        switch (message.channel) {
            case WSChannels.HEARTBEAT:
                this.handleHeartbeat();
                break;
            case WSChannels.TICKER:
                this.handleTicker(message);
                break;
        }
    }

    protected handleHeartbeat(): void{
        this.isPinged = true;
    }

    protected handleTicker(message: InterfaceTickerData): void{
        if(message.event === WSEvents.UPDATED){
            if(!_.isNil(message.mark_price)){
                console.log(message.mark_price);
            }
        }
    }
}
