import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import {PredictionModule} from "../prediction/prediction.module";

@Module({
  imports: [PredictionModule],
  providers: [DataService],
  controllers: [DataController]
})
export class DataModule {}
