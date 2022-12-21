import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Strategy, StrategyDocument} from "../schemas/strategy.schema";
import * as mongoose from 'mongoose';
import {Model} from 'mongoose';
import {EStrategyStates} from "../misc/enums/strategy-states";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";
import {TfActionString} from "../misc/enums/tf-action-string";
import {WalletService} from "../wallet/wallet.service";
import {Wallet, WalletDocument} from "../schemas/wallet.schema";
import {CreateStrategyDto} from "../dto/create-strategy-dto";
import {UpdateStrategyDto} from "../dto/update-strategy-dto";
import * as _ from 'lodash';
import {TradeService} from "../trade/trade.service";
import removeFields from "../utils/mongoObjectClean";
import {ETestActionResult, ITestResult} from "../misc/enums/test-action-result";
import {CreateTradeDto} from "../dto/create-trade-dto";
import StrategyTestDto from "../dto/strategy-test-dto";
import {PredictionService} from "../prediction/prediction.service";
import ModelPredictionDto from "../dto/model-prediction-dto";
import * as Mongoose from "mongoose";

@Injectable()
export class StrategyService {
    constructor(
        @InjectModel(Strategy.name) private strategyModel: Model<StrategyDocument>,
        private walletService: WalletService,
        private tradeService: TradeService,
        private predictionService: PredictionService
    ) {
        this.logger = new Logger(this.name);
    }

    protected name: string = 'Strategy Service';
    protected logger: Logger;
    protected testResolver: Function = null;

    public async add(createStrategyDto: CreateStrategyDto): Promise<StrategyDocument> {
        if(!_.isNil(createStrategyDto._id)){
            return await this.strategyModel.findByIdAndUpdate(new Mongoose.Types.ObjectId(createStrategyDto._id), createStrategyDto).exec();
        }
        const strategy = await new this.strategyModel(createStrategyDto).save();
        await strategy.populate('wallet exchange');
        return strategy;
    }

    public async update(id: mongoose.Schema.Types.ObjectId, updateStrategyDto: UpdateStrategyDto): Promise<StrategyDocument> {
        removeFields(updateStrategyDto, ['_id', 'model', 'version', 'wallet', 'exchange', 'createdAt', 'updatedAt']);
        return await this.strategyModel.findByIdAndUpdate(id, updateStrategyDto).exec();
    }

    public processInputSignal(price: number, isFromTicker: boolean, predictionData?: InterfacePredictionResult) {
        // _.forEach(this.strategies, (strategy: StrategyDocument) => {
        //     if (isFromTicker) {
        //         this.processTickerInput(strategy, price)
        //     } else {
        //         this.processNeuralInput(strategy, predictionData, price);
        //     }
        // })
    }

    public processInputSignalTest(input: StrategyTestDto): Promise<ITestResult> {
        return new Promise<ITestResult>(async (resolve, reject) => {
            const strategy: StrategyDocument = await this.strategyModel.findOne({_id: new mongoose.Schema.Types.ObjectId(input.strategy)}).populate('wallet exchange').exec();
            this.testResolver = resolve;
            if (input.isFromTicker) {
                this.processTickerInput(strategy, input.price)
            } else {
                const prediction: InterfacePredictionResult = await this.predictionService.predictAction(input as ModelPredictionDto);
                this.processNeuralInput(strategy, prediction, input.price);
            }
        })
    }

    public getList(): Promise<Strategy[]> {
        return this.strategyModel.find().exec()
    }

    protected processNeuralInput(strategy: StrategyDocument, predictionData: InterfacePredictionResult, price: number) {
        if (strategy.model === predictionData.model && strategy.version === predictionData.version) {
            switch (predictionData.predictionAction) {
                case TfActionString.BUY:
                    if (strategy.sequential) {
                        if (strategy.currentState === EStrategyStates.NONE) {
                            if (predictionData.predictionPercentage >= strategy.buyConfidence) {
                                if (strategy.trailingBuy) {
                                    strategy.currentState = EStrategyStates.TRAILING_BUY;
                                    strategy.trailingBuyLastPrice = 0;
                                    this.updateStrategy(strategy);
                                    this.resolveTest(ETestActionResult.NONE);
                                } else {
                                    this.buy(price, strategy);
                                }
                            } else {
                                this.resolveTest(ETestActionResult.NONE);
                            }
                        } else {
                            this.resolveTest(ETestActionResult.NONE);
                        }
                    } else {
                        if (predictionData.predictionPercentage >= strategy.buyConfidence) {
                            if (strategy.trailingBuy) {
                                strategy.currentState = EStrategyStates.TRAILING_BUY;
                                strategy.trailingBuyLastPrice = 0;
                                this.updateStrategy(strategy);
                                this.resolveTest(ETestActionResult.NONE);
                            } else {
                                this.buy(price, strategy);
                            }
                        } else {
                            this.resolveTest(ETestActionResult.NONE);
                        }
                    }
                    break;
                case TfActionString.SELL:
                    if (strategy.sequential) {
                        if (strategy.currentState === EStrategyStates.BOUGHT) {
                            if (predictionData.predictionPercentage >= strategy.sellConfidence) {
                                if (strategy.trailingSell) {
                                    strategy.currentState = EStrategyStates.TRAILING_SELL;
                                    strategy.trailingSellLastPrice = 0;
                                    this.updateStrategy(strategy);
                                    this.resolveTest(ETestActionResult.NONE);
                                } else {
                                    this.sell(price, strategy);
                                }
                            } else {
                                this.resolveTest(ETestActionResult.NONE);
                            }
                        } else {
                            this.resolveTest(ETestActionResult.NONE);
                        }
                    } else {
                        if (predictionData.predictionPercentage >= strategy.sellConfidence) {
                            if (strategy.trailingSell) {
                                strategy.currentState = EStrategyStates.TRAILING_SELL;
                                strategy.trailingSellLastPrice = 0;
                                this.updateStrategy(strategy);
                                this.resolveTest(ETestActionResult.NONE);
                            } else {
                                this.sell(price, strategy);
                            }
                        } else {
                            this.resolveTest(ETestActionResult.NONE);
                        }
                    }
                    break;
                case TfActionString.NONE:
                    this.resolveTest(ETestActionResult.NONE);
                    break;
            }
        }
    }

    protected processTickerInput(strategy: StrategyDocument, price: number) {
        switch (strategy.currentState) {
            case EStrategyStates.TRAILING_SELL:
                if (strategy.trailingSell) {
                    this.trailingSell(strategy, price);
                } else {
                    this.resolveTest(ETestActionResult.NONE);
                }
                break;
            case EStrategyStates.TRAILING_BUY:
                if (strategy.trailingBuy) {
                    this.trailingBuy(strategy, price);
                } else {
                    this.resolveTest(ETestActionResult.NONE);
                }
                break;
            case EStrategyStates.BOUGHT:
                if (strategy.stopLoss) {
                    this.stopLoss(strategy, price);
                } else {
                    this.resolveTest(ETestActionResult.NONE);
                }
                break;
            case EStrategyStates.NONE:
                this.resolveTest(ETestActionResult.NONE);
                break;
        }
    }

    protected trailingBuy(strategy: StrategyDocument, currentPrice: number) {
        if (strategy.trailingBuyLastPrice == 0) {
            strategy.trailingBuyLastPrice = currentPrice;
            this.updateStrategy(strategy);
            this.resolveTest(ETestActionResult.TB_STEP);
        } else {
            const trailingBuyValue = strategy.trailingBuyLastPrice + strategy.trailingBuyLastPrice * strategy.trailingBuyPercent / 100;
            if (currentPrice > trailingBuyValue) {
                this.buy(currentPrice, strategy)
            } else {
                if (strategy.trailingBuyLastPrice > currentPrice) {
                    strategy.trailingBuyLastPrice = currentPrice;
                    this.updateStrategy(strategy);
                }
                this.resolveTest(ETestActionResult.TB_STEP);
            }
        }
    }

    protected trailingSell(strategy: StrategyDocument, currentPrice: number) {
        if (strategy.trailingSellLastPrice == 0) {
            strategy.trailingSellLastPrice = currentPrice;
            this.updateStrategy(strategy);
            this.resolveTest(ETestActionResult.TS_STEP);
        } else {
            const trailingSellValue = strategy.trailingSellLastPrice - strategy.trailingSellLastPrice * strategy.trailingSellPercent / 100;
            if (currentPrice < trailingSellValue) {
                this.sell(currentPrice, strategy)
            } else {
                if (strategy.trailingSellLastPrice < currentPrice) {
                    strategy.trailingSellLastPrice = currentPrice;
                    this.updateStrategy(strategy);
                }
                this.resolveTest(ETestActionResult.TS_STEP);
            }
        }
    }

    protected stopLoss(strategy: StrategyDocument, currentPrice: number) {
        const stopLossValue = strategy.stopLossLastPrice - strategy.stopLossLastPrice * strategy.stopLossPercent / 100;
        if (currentPrice < stopLossValue) {
            this.sell(currentPrice, strategy)
        } else {
            if (strategy.stopLossIsTrailing) {
                if (strategy.stopLossLastPrice < currentPrice) {
                    strategy.stopLossLastPrice = currentPrice;
                    this.updateStrategy(strategy);
                }
            }
            this.resolveTest(ETestActionResult.SL_STEP);
        }
    }

    protected buy(currentPrice: number, strategy: StrategyDocument) {
        let buyAmount: number = strategy.wallet.fiat * strategy.buyAmountPercent / 100;
        let wallet: WalletDocument = strategy.wallet as WalletDocument;
        if (buyAmount < strategy.exchange.minimumBuyAmount) {
            if (strategy.wallet.fiat < strategy.exchange.minimumBuyAmount) {
                throw new Error('Not Enough Money To Buy!')
            } else {
                buyAmount = strategy.exchange.minimumBuyAmount;
            }
        }
        const fee = buyAmount * strategy.exchange.takerFee / 100;
        wallet.fiat -= buyAmount - fee;
        wallet.crypto += buyAmount / currentPrice;
        const trade: CreateTradeDto = {
            strategy: strategy._id,
            price: currentPrice,
            from: strategy.currentState,
            action: TfActionString.BUY,
            value: buyAmount
        };
        this.tradeService.addTradeAction(trade);
        strategy.currentState = EStrategyStates.BOUGHT;
        strategy.stopLossLastPrice = currentPrice;
        this.updateStrategy(strategy);
        this.walletService.updateWallet(wallet._id, wallet);
        this.logger.log('BUY: ', currentPrice)
        this.resolveTest(ETestActionResult.BUY, wallet, trade);
    }

    protected sell(currentPrice: number, strategy: StrategyDocument) {
        let wallet: WalletDocument = strategy.wallet as WalletDocument;
        const sellAmount: number = currentPrice * strategy.wallet.crypto;
        const fee = sellAmount * strategy.exchange.takerFee / 100;
        wallet.fiat += sellAmount - fee;
        wallet.crypto = 0;
        const trade: CreateTradeDto = {
            strategy: strategy._id,
            price: currentPrice,
            from: strategy.currentState,
            action: TfActionString.SELL,
            value: sellAmount
        };
        this.tradeService.addTradeAction(trade);
        strategy.currentState = EStrategyStates.NONE;
        //this.updateWallet(wallet._id, wallet);
        this.updateStrategy(strategy);
        this.logger.log('SELL: ', currentPrice);
        this.resolveTest(ETestActionResult.SELL, wallet, trade);
    }

    // protected updateWallet(id: mongoose.Schema.Types.ObjectId, update: UpdateWalletDto): void {
    //     const index = _.findIndex(this.strategies, (strat: StrategyDocument) => {
    //         return strat.wallet['_id'] === id
    //     });
    //     if (index >= 0) {
    //         this.strategies[index].wallet.crypto = update.crypto;
    //         this.strategies[index].wallet.fiat = update.fiat;
    //     }
    //     this.walletService.updateWallet(id, update);
    // }
    //
    protected updateStrategy(strategy: StrategyDocument): void {
        // const index = _.findIndex(this.strategies, (strat: StrategyDocument) => {
        //     return strategy._id === strat._id
        // });
        // if (index >= 0) {
            this.update(strategy.id, strategy);
        // }
    }

    protected resolveTest(action: ETestActionResult, wallet?: Wallet, trade?: CreateTradeDto) {
        if (!_.isNil(this.testResolver)) {
            this.testResolver({
                action,
                wallet,
                trade
            });
            this.testResolver = null;
        }
    }

}
