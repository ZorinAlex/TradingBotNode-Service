import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Trade, TradeSchema} from "../schemas/trade.schema";
import { TradeController } from './trade.controller';

@Module({
  imports: [MongooseModule.forFeature([{name: Trade.name, schema: TradeSchema}]), TradeModule],
  providers: [TradeService],
  exports: [TradeService],
  controllers: [TradeController]
})
export class TradeModule {}
