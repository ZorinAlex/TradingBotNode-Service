import {Body, Controller, Get, Post} from '@nestjs/common';
import {StrategyService} from "./strategy.service";
import {CreateStrategyDto} from "../dto/create-strategy-dto";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";
import StrategyTestDto from "../dto/strategy-test-dto";

@Controller('strategy')
export class StrategyController {
    constructor(private strategyService: StrategyService){}

    @Get()
    async getList(){
        return await this.strategyService.getList()
    }

    @Post()
    add(@Body() createStrategyDto: CreateStrategyDto){
        return this.strategyService.add(createStrategyDto);
    }

    @Post('addTestInput')
    async addInput(@Body() inputSignal: StrategyTestDto){
        return await this.strategyService.processInputSignalTest(inputSignal);
    }
}
