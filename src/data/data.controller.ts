import {Controller, Get, Param} from '@nestjs/common';
import {DataService} from "./data.service";

@Controller('data')
export class DataController {
    constructor(private dataService: DataService){}

    @Get('pred')
    async getPrediction(){
        return await this.dataService.getPrediction();
    }

    @Get('/:hours')
    async getData(@Param('hours') hours: number){
        let dat = await this.dataService.getData(Number(hours))
        return dat
    }
}
