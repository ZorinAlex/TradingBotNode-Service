import {EStrategyStates} from "../misc/enums/strategy-states";

export class UpdateStrategyDto{
    readonly currentState: EStrategyStates;
    readonly lastSell: number;
    readonly sequential: boolean;
    readonly trailingBuy: boolean;
    readonly trailingBuyPercent: number;
    readonly trailingBuyLastPrice: number;
    readonly trailingSell: boolean;
    readonly trailingSellPercent: number;
    readonly trailingSellLastPrice: number;
    readonly buyAmountPercent: number;
    readonly buyConfidence: number;
    readonly sellConfidence: number;
    readonly stopLoss: boolean;
    readonly stopLossPercent: number;
    readonly stopLossIsTrailing: boolean;
    readonly isActive: boolean;
    readonly stopLossLastPrice: number;
}
