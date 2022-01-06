import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Strategy, StrategyDocument} from "../schemas/strategy.schema";
import {Model} from 'mongoose';
import {EStrategyStates} from "../misc/enums/strategy-states";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";
import {TfActionString} from "../misc/enums/tf-action-string";
import {WalletService} from "../wallet/wallet.service";
import {WalletDocument} from "../schemas/wallet.schema";
import {CreateStrategyDto} from "../dto/create-strategy-dto";
import {UpdateStrategyDto} from "../dto/update-strategy-dto";
import * as mongoose from "mongoose";
import * as _ from 'lodash';
import {TradeService} from "../trade/trade.service";

@Injectable()
export class StrategyService {
    constructor(
        @InjectModel(Strategy.name) private strategyModel: Model<StrategyDocument>,
        private walletService: WalletService,
        private tradeService: TradeService
    ){
        this.preloadStrategies();
    }

    protected strategies: Array<StrategyDocument>;

    public async add(createStrategyDto: CreateStrategyDto): Promise<StrategyDocument>{
        const strategy = await new this.strategyModel(createStrategyDto).save();
        await strategy.populate('wallet exchange');
        this.strategies.push(strategy);
        return strategy;
    }

    public async update(id: mongoose.Schema.Types.ObjectId, updateStrategyDto: UpdateStrategyDto): Promise<StrategyDocument>{
        return await this.strategyModel.findByIdAndUpdate(id, updateStrategyDto).exec();
    }

    public processInputSignal(price: number, isFromTicker: boolean, predictionData?: InterfacePredictionResult){
        _.forEach(this.strategies, (strategy: StrategyDocument)=>{
            if(isFromTicker){
                this.processTickerInput(strategy, price)
            }else{
                this.processNeuralInput(strategy, predictionData, price);
            }
        })
    }

    protected async preloadStrategies(){
        this.strategies = await this.strategyModel.find().populate('wallet exchange').exec();
    }

    protected processNeuralInput(strategy: StrategyDocument,predictionData: InterfacePredictionResult, price: number){
        switch (predictionData.predictionAction){
            case TfActionString.BUY:
                if(strategy.sequential){
                    if(strategy.currentState === EStrategyStates.NONE){
                        if(predictionData.predictionPercentage>=strategy.buyConfidence){
                            if(strategy.trailingBuy){
                                strategy.currentState = EStrategyStates.TRAILING_BUY;
                                strategy.trailingBuyLastPrice = price;
                                this.updateStrategy(strategy);
                            }else{
                                this.buy(price, strategy);
                            }
                        }
                    }
                }else{
                    if(predictionData.predictionPercentage>=strategy.buyConfidence){
                        if(strategy.trailingBuy){
                            strategy.currentState = EStrategyStates.TRAILING_BUY;
                            strategy.trailingBuyLastPrice = price;
                            this.updateStrategy(strategy);
                        }else{
                            this.buy(price, strategy);
                        }
                    }
                }
                break;
            case TfActionString.SELL:
                if(strategy.sequential){
                    if(strategy.currentState === EStrategyStates.BOUGHT){
                        if(predictionData.predictionPercentage>=strategy.sellConfidence){
                            if(strategy.trailingSell){
                                strategy.currentState = EStrategyStates.TRAILING_SELL;
                                strategy.trailingSellLastPrice = price;
                                this.updateStrategy(strategy);
                            }else{
                                this.sell(price, strategy);
                            }
                        }
                    }
                }else{
                    if(predictionData.predictionPercentage>=strategy.sellConfidence){
                        if(strategy.trailingSell){
                            strategy.currentState = EStrategyStates.TRAILING_SELL;
                            strategy.trailingSellLastPrice = price;
                            this.updateStrategy(strategy);
                        }else{
                            this.sell(price, strategy);
                        }
                    }
                }
                break;
            case TfActionString.NONE:
                break;
        }
    }

    protected processTickerInput(strategy: StrategyDocument, price: number){
        switch (strategy.currentState) {
            case EStrategyStates.TRAILING_SELL:
                if(strategy.trailingSell){
                    this.trailingSell(strategy, price);
                }
                break;
            case EStrategyStates.TRAILING_BUY:
                if(strategy.trailingBuy){
                    this.trailingBuy(strategy, price);
                }
                break;
            case EStrategyStates.SL:
                if(strategy.stopLoss){
                    this.stopLoss(strategy, price);
                }
                break;
        }
    }

    protected trailingBuy(strategy: StrategyDocument, currentPrice: number){
        const trailingBuyValue = strategy.trailingBuyLastPrice + strategy.trailingBuyLastPrice*strategy.trailingBuyPercent/100;
        if(currentPrice > trailingBuyValue){
            this.buy(currentPrice, strategy)
        }else{
            if(strategy.trailingBuyLastPrice > currentPrice){
                strategy.trailingBuyLastPrice = currentPrice;
                this.updateStrategy(strategy);
            }
        }
    }

    protected trailingSell(strategy: StrategyDocument, currentPrice: number){
        const trailingSellValue = strategy.trailingSellLastPrice - strategy.trailingSellLastPrice*strategy.trailingSellPercent/100;
        if(currentPrice < trailingSellValue){
            this.sell(currentPrice, strategy)
        }else{
            if(strategy.trailingSellLastPrice < currentPrice){
                strategy.trailingSellLastPrice = currentPrice;
                this.updateStrategy(strategy);
            }
        }
    }

    protected stopLoss(strategy: StrategyDocument, currentPrice: number){
        const stopLossValue = strategy.stopLossLastPrice - strategy.stopLossLastPrice*strategy.stopLossPercent/100;
        if(currentPrice < stopLossValue){
            this.sell(currentPrice, strategy)
        }else{
            if(strategy.stopLossIsTrailing){
                if(strategy.stopLossLastPrice < currentPrice){
                    strategy.stopLossLastPrice = currentPrice;
                    this.updateStrategy(strategy);
                }
            }
        }
    }

    protected buy(currentPrice: number, strategy: StrategyDocument){
        let buyAmount: number = strategy.wallet.fiat * strategy.buyAmountPercent/100;
        let wallet: WalletDocument = strategy.wallet as WalletDocument;
        if(buyAmount < strategy.exchange.minimumBuyAmount){
            if(strategy.wallet.fiat<strategy.exchange.minimumBuyAmount){
                throw new Error('Not Enough Money To Buy!')
            }else{
                buyAmount = strategy.exchange.minimumBuyAmount;
            }
        }
        const fee = buyAmount * strategy.exchange.takerFee/100;
        wallet.fiat -= buyAmount - fee;
        wallet.crypto += buyAmount/currentPrice;
        this.tradeService.addTradeAction(
            {
                strategy: strategy._id,
                price: currentPrice,
                from: strategy.currentState,
                action: TfActionString.BUY
            });
        strategy.currentState = EStrategyStates.BOUGHT;
        strategy.stopLossLastPrice = currentPrice;
        this.updateStrategy(strategy);
        this.walletService.updateWallet(wallet._id, wallet);
    }

    protected sell(currentPrice: number, strategy: StrategyDocument){
        let wallet: WalletDocument = strategy.wallet as WalletDocument;
        const sellAmount: number = currentPrice * strategy.wallet.crypto;
        const fee = sellAmount * strategy.exchange.takerFee/100;
        wallet.fiat += sellAmount - fee;
        wallet.crypto = 0;
        this.tradeService.addTradeAction(
            {
                strategy: strategy._id,
                price: currentPrice,
                from: strategy.currentState,
                action: TfActionString.SELL
            });
        strategy.currentState = EStrategyStates.NONE;
        this.walletService.updateWallet(wallet._id, wallet);
        this.updateStrategy(strategy);
    }

    protected updateStrategy(strategy: StrategyDocument): void{
        const index = _.findIndex(this.strategies, (strat: StrategyDocument)=>{
            return strategy._id === strat._id
        });
        if(index>=0){
            this.update(strategy.id, strategy);
        }
    }

}