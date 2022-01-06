import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Wallet, WalletSchema} from "../schemas/wallet.schema";

@Module({
  imports: [MongooseModule.forFeature([{name: Wallet.name, schema: WalletSchema}])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule {}
