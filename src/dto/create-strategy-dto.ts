import {EStrategyStates} from "../misc/enums/strategy-states";
import {Schema} from "mongoose";

export class CreateStrategyDto{
    readonly exchange: Schema.Types.ObjectId;
    readonly wallet: Schema.Types.ObjectId;
    readonly model: string;
    readonly version: string;
    readonly currentState: EStrategyStates;
    readonly lastSell: number;
    readonly sequential: boolean;
    readonly trailingBuy: boolean;
    readonly trailingBuyPercent: number;
    readonly trailingSell: boolean;
    readonly trailingSellPercent: number;
    readonly buyAmountPercent: number;
    readonly buyConfidence: number;
    readonly sellConfidence: number;
    readonly stopLoss: boolean;
    readonly stopLossPercent: number;
    readonly stopLossIsTrailing: boolean;
    readonly isActive: boolean;
}
