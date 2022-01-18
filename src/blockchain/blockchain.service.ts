import {Injectable, Logger} from '@nestjs/common';
import * as _ from 'lodash';
import Timeout = NodeJS.Timeout;
import {WebSocket} from 'ws';
import {Cron} from "@nestjs/schedule";
import InterfaceTickerData from "../misc/interfaces/interface-ticker-data";
import {WSChannels, WSEvents} from "../misc/names/ws-names";
import {ReadyState} from "../misc/enums/ws-ready-state";
import {DataService} from "../data/data.service";
import {PredictionService} from "../prediction/prediction.service";
import {StrategyService} from "../strategy/strategy.service";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";
import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";

@Injectable()
export class BlockchainService {
    constructor(
        private dataService: DataService,
        private predictionService: PredictionService,
        private strategyService: StrategyService
    ){
        this.logger = new Logger(this.name);
        // this.connect();
    }

    protected name: string = 'Blockchain Service';
    protected logger: Logger;
    protected webSocket: any;
    protected heartbitTime: number = 60000;
    protected reconnectTryInterval: number = 10000;
    protected heartbitTimeout: Timeout;
    protected isPinged: boolean = false;

    public isAlive(): boolean {
        return this.isPinged;
    }

    // @Cron('1 * * * *')
    // async handleCron() {
    //     this.logger.log('CORN HOUR ENDED:');
    //     try{
    //         let lastData: Array<InterfaceDataPriceData> = await this.dataService.getHoursDataBlockchain(62);
    //         if(lastData.length>61){
    //             lastData = lastData.slice(-61)
    //         }
    //         let timestamp = lastData[lastData.length-1].timestamp;
    //         let price = lastData[lastData.length-1].close;
    //         this.logger.log('LAST DATE TIME:', new Date(timestamp).toLocaleString());
    //         //TODO get predictions for all models
    //         const prediction: InterfacePredictionResult = await this.predictionService.predictAction({data: lastData, model:'BTCUSD_blockchain_hours_60', version:'1'});
    //         this.strategyService.processInputSignal(price, false, prediction);
    //         this.logger.log(prediction);
    //     }catch (e) {
    //         console.log(e);
    //     }
    // }

    connect(): void{
        const endpoint: string = 'wss://ws.blockchain.info/mercury-gateway/v1/ws';
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
                this.strategyService.processInputSignal(message.mark_price, true);
            }
        }
    }
}
