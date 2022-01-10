import {Body, Controller, Get, Post} from '@nestjs/common';
import {ExchangeService} from "./exchange.service";
import {CreateExchangeDto} from "../dto/create-exchange-dto";

@Controller('exchange')
export class ExchangeController {
    constructor(private exchangeService: ExchangeService){}

    @Post('add')
    async add(@Body() createExchangeDto: CreateExchangeDto){
        return await this.exchangeService.add(createExchangeDto)
    }

    @Get('list')
    async getList(){
        return await this.exchangeService.getList();
    }
}
