import { Module } from '@nestjs/common';
import {join} from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from "@nestjs/config";
import { DataModule } from './data/data.module';
import {ScheduleModule} from "@nestjs/schedule";
import { PredictionModule } from './prediction/prediction.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import { TradeModule } from './trade/trade.module';
import {MongooseModule} from "@nestjs/mongoose";
import { StrategyModule } from './strategy/strategy.module';
import { ExchangeModule } from './exchange/exchange.module';
import { WalletModule } from './wallet/wallet.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'scaleData'),
    }),
    MongooseModule.forRoot(
        process.env.MONGODB_CONNECTION_STRING,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
    ),
    DataModule,
    ScheduleModule.forRoot(),
    PredictionModule,
    TradeModule,
    StrategyModule,
    ExchangeModule,
    WalletModule,
    BlockchainModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
