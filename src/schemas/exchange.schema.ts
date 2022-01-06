import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type ExchangeDocument = Exchange & mongoose.Document;
@Schema()
export class Exchange {
    @Prop({ required: true })
    name: string;
    @Prop({ required: true })
    takerFee: number;
    @Prop({ required: true })
    makerFee: number;
    @Prop({ required: true })
    minimumBuyAmount: number;
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);
