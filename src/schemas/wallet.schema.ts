import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type WalletDocument = Wallet & mongoose.Document;
@Schema()
export class Wallet {
    @Prop({ required: true })
    name: string;
    @Prop({ required: true })
    fiat: number;
    @Prop({ required: true })
    crypto: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
