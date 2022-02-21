import {Body, Controller, Get, Post} from '@nestjs/common';
import {StrategyService} from "./strategy.service";
import {CreateStrategyDto} from "../dto/create-strategy-dto";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";

@Controller('strategy')
export class StrategyController {
    constructor(private strategyService: StrategyService){}

    @Get('list')
    async getList(){
        return await this.strategyService.getList()
    }

    @Post('add')
    add(@Body() createStrategyDto: CreateStrategyDto){
        return this.strategyService.add(createStrategyDto);
    }

    @Post('addTestInput')
    async addInput(@Body() inputSignal: {modelName: string, modelVersion: string, price: number, isFromTicker: boolean, predictionData?: InterfacePredictionResult}){
        return await this.strategyService.processInputSignalTest(inputSignal.modelName, inputSignal.modelVersion, inputSignal.price, inputSignal.isFromTicker, inputSignal.predictionData);
    }
}
