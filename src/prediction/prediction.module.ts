import { Module } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import {MongooseModule} from "@nestjs/mongoose";
import { PredictionController } from './prediction.controller';
import PredictionSchema from "../schemas/prediction.schema";

@Module({
  imports: [MongooseModule.forFeature([
    {name: 'Prediction', schema: PredictionSchema}
  ])],
  providers: [PredictionService],
  exports: [PredictionService],
  controllers: [PredictionController]
})
export class PredictionModule {}
