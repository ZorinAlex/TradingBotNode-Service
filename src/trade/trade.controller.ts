import {Controller, Get} from '@nestjs/common';
import {TradeService} from "./trade.service";

@Controller('trade')
export class TradeController {
    constructor(private tradeService: TradeService){}

    @Get('list')
    async getList(){
        return await this.tradeService.getList()
    }
}
