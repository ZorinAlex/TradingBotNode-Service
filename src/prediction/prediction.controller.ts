import {Controller, Post, Param, Body} from '@nestjs/common';
import {PredictionService} from "./prediction.service";
import ModelPredictionDto from "../dto/model-prediction-dto";

@Controller('prediction')
export class PredictionController {
    constructor(
        protected predictionService: PredictionService
    ){}

    @Post()
    async predict(@Body() data: ModelPredictionDto){
        return  await this.predictionService.predictAction(data);
    }
}
