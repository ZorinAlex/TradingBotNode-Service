import {EStrategyStates} from "../misc/enums/strategy-states";

export default interface IStrategy{
    isActive: boolean,
    sequential: boolean,
    buyConfidence: number,
    buyAmountPercent: number,
    trailingBuy: boolean,
    trailingBuyPercent: number,
    sellConfidence: number,
    trailingSell: boolean,
    trailingSellPercent: number,
    stopLoss: boolean,
    stopLossIsTrailing: boolean,
    stopLossPercent: number,
    state: EStrategyStates
}
