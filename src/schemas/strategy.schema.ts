import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {EStrategyStates} from "../misc/enums/strategy-states";
import {Exchange} from "./exchange.schema";
import {Wallet} from "./wallet.schema";

export type StrategyDocument = Strategy & mongoose.Document;
@Schema({timestamps: true})
export class Strategy {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exchange'})
    exchange: Exchange;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'})
    wallet: Wallet;
    @Prop({required: false, default: EStrategyStates.NONE})
    currentState: EStrategyStates;
    @Prop({required: false, default: 0})
    lastSell: number;
    @Prop({required: true})
    sequential: boolean;
    @Prop({default: false})
    trailingBuy: boolean;
    @Prop({required: false, default: 0})
    trailingBuyPercent: number;
    @Prop({default: 0})
    trailingBuyLastPrice: number;
    @Prop({default: false})
    trailingSell: boolean;
    @Prop({required: false, default: 0})
    trailingSellPercent: number;
    @Prop({default: 0})
    trailingSellLastPrice: number;
    @Prop({required: true, default: 0})
    buyAmountPercent: number;
    @Prop({required: true, default: 50})
    buyConfidence: number;
    @Prop({required: true, default: 50})
    sellConfidence: number;
    @Prop({default: false})
    stopLoss: boolean;
    @Prop({required: true, default: 1})
    stopLossPercent: number;
    @Prop({default: 0})
    stopLossLastPrice: number;
    @Prop({default: false})
    stopLossIsTrailing: boolean;
    @Prop({required: true, default: true})
    isActive: boolean;
}

export const StrategySchema = SchemaFactory.createForClass(Strategy);
