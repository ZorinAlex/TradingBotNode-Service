import {Controller, Get, Param} from '@nestjs/common';
import {DataService} from "./data.service";

@Controller('data')
export class DataController {
    constructor(private dataService: DataService){}

    @Get('/:start/:end/:granularity')
    /**
     * granularity:
     * 1H  - 3600
     * 15M - 900
     * 5M  - 300
     * 1M  - 60
     */
    async getDataInRange(@Param('start') start: number, @Param('end') end: number, @Param('granularity') granularity: number){
        return  await this.dataService.getDataInRange(start, end, granularity);
    }

    @Get('datafiles')
    async getDatafile(){
        return await this.dataService.getDataFile()
    }
}
