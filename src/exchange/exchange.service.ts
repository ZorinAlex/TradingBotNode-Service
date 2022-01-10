import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Exchange, ExchangeDocument} from "../schemas/exchange.schema";
import { Model } from 'mongoose';
import {CreateExchangeDto} from "../dto/create-exchange-dto";

@Injectable()
export class ExchangeService {
    constructor(@InjectModel(Exchange.name) private exchangeModel: Model<ExchangeDocument> ){}

    async add(createExchangeDto: CreateExchangeDto): Promise<Exchange>{
        const exchange = new this.exchangeModel(createExchangeDto);
        return exchange.save();
    }

    async getList(): Promise<Exchange[]>{
        return this.exchangeModel.find().exec()
    }
}
