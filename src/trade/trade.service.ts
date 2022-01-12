import { Injectable } from '@nestjs/common';
import {CreateTradeDto} from "../dto/create-trade-dto";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Trade, TradeDocument} from "../schemas/trade.schema";

@Injectable()
export class TradeService {
    constructor(
        @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>
    ){}

    public getList(): Promise<Trade[]>{
        return this.tradeModel.find().exec()
    }

    public addTradeAction(createTradeDto: CreateTradeDto){
        const trade = new this.tradeModel(createTradeDto).save()
    }
}
