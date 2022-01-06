import {Body, Controller, Post} from '@nestjs/common';
import {StrategyService} from "./strategy.service";
import {CreateStrategyDto} from "../dto/create-strategy-dto";

@Controller('strategy')
export class StrategyController {
    constructor(private strategyService: StrategyService){}

    @Post('add')
    add(@Body() createStrategyDto: CreateStrategyDto){
        return this.strategyService.add(createStrategyDto);
    }
}
