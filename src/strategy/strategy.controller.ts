import {Body, Controller, Post} from '@nestjs/common';
import {StrategyService} from "./strategy.service";
import {CreateStrategyDto} from "../dto/create-strategy-dto";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";

@Controller('strategy')
export class StrategyController {
    constructor(private strategyService: StrategyService){}

    @Post('add')
    add(@Body() createStrategyDto: CreateStrategyDto){
        return this.strategyService.add(createStrategyDto);
    }

    //tests
    @Post('addInput')
    addInput(@Body() inputSignal: {price: number, isFromTicker: boolean, predictionData?: InterfacePredictionResult}){
        return this.strategyService.processInputSignal(inputSignal.price, inputSignal.isFromTicker, inputSignal.predictionData );
    }
}
