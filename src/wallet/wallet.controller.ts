import {Body, Controller, Get, Post} from '@nestjs/common';
import {WalletService} from "./wallet.service";
import {CreateWalletDto} from "../dto/create-wallet-dto";

@Controller('wallet')
export class WalletController {
    constructor(private walletService: WalletService){}

    @Post('add')
    async add(@Body() createWalletDto: CreateWalletDto){
        return await this.walletService.add(createWalletDto)
    }

    @Get('list')
    async getList(){
        return await this.walletService.getList()
    }
}
