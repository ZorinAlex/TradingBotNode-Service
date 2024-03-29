import { Module } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { StrategyController } from './strategy.controller';
import {Strategy, StrategySchema} from "../schemas/strategy.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {WalletModule} from "../wallet/wallet.module";
import {TradeModule} from "../trade/trade.module";
import {PredictionModule} from "../prediction/prediction.module";

@Module({
  imports: [MongooseModule.forFeature([{name: Strategy.name, schema: StrategySchema}]), WalletModule, TradeModule, PredictionModule],
  providers: [StrategyService],
  controllers: [StrategyController],
  exports: [StrategyService]
})
export class StrategyModule {}
