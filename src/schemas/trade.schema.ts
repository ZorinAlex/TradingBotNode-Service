import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {EStrategyStates} from "../misc/enums/strategy-states";
import {Exchange} from "./exchange.schema";
import {TfActionString} from "../misc/enums/tf-action-string";

export type TradeDocument = Trade & mongoose.Document;
@Schema({timestamps: true})
export class Trade {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Strategy'})
    strategy: Exchange;
    @Prop({required: true})
    price: number;
    @Prop({required: true})
    from: EStrategyStates;
    @Prop({required: true})
    action: TfActionString;
    @Prop({required: true})
    value: TfActionString;
}

export const TradeSchema = SchemaFactory.createForClass(Trade);
