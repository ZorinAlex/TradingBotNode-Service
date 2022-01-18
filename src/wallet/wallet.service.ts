import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import { Model } from 'mongoose';
import {Wallet, WalletDocument} from "../schemas/wallet.schema";
import {CreateWalletDto} from "../dto/create-wallet-dto";
import * as mongoose from "mongoose";
import {UpdateWalletDto} from "../dto/update-wallet-dto";
import removeFields from "../utils/mongoObjectClean";

@Injectable()
export class WalletService {
    constructor(@InjectModel(Wallet.name) private walletModel: Model<WalletDocument>){}

    async add(createWalletDto: CreateWalletDto): Promise<Wallet>{
        const wallet = new this.walletModel(createWalletDto);
        return wallet.save();
    }

    async getList(): Promise<Wallet[]>{
        return this.walletModel.find().exec()
    }

    async getWallet(id: mongoose.Schema.Types.ObjectId): Promise<Wallet>{
        return this.walletModel.findById(id).exec()
    }

    async updateWallet(id: mongoose.Schema.Types.ObjectId, update: UpdateWalletDto){
        removeFields(update, ['_id', 'name']);
        return this.walletModel.findByIdAndUpdate(id, update).exec();
    }
}
