import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import {DataModule} from "../data/data.module";
import {PredictionModule} from "../prediction/prediction.module";
import {StrategyModule} from "../strategy/strategy.module";

@Module({
  imports: [DataModule, PredictionModule, StrategyModule],
  providers: [BlockchainService]
})
export class BlockchainModule {}
