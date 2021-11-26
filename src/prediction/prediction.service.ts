import {Injectable, Logger} from '@nestjs/common';
import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";
import axios from "axios";
import argmax from "../utils/argmax";
import dataPreprocess from "../utils/dataPreprocess";
import InterfacePredictionResult from "../misc/interfaces/interface-prediction-result";
import predictionAction from "../utils/predictionAction";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {PredictionDto} from "../dto/prediction-dto";

@Injectable()
export class PredictionService {
    constructor(
        @InjectModel('Prediction') private readonly predictionModel: Model<PredictionDto>
    ){
        this.logger = new Logger(this.name);
    }
    protected name: string = 'Prediction Service';
    protected logger: Logger;

    async predictAction(data: Array<InterfaceDataPriceData>) :Promise<InterfacePredictionResult>{
        const modelName='saved_model';
        const modelExamples = 81;
        const headers = {
            'Content-Type': 'application/json'
        };
        let dataProcessed: Array<number> = await dataPreprocess(modelName,data, ['open', 'high', 'low', 'close']);
        const dataForTF: string = JSON.stringify({instances:[[dataProcessed]]});
        try {
            const timestamp: number = data[data.length - 1].timestamp;
            const predictionResult = await axios.post(`${process.env.TF_ADRESS}:${process.env.TF_PORT}/v1/models/${modelName}:predict`, dataForTF, {headers:headers});
            const predictionsArr: Array<number> = predictionResult.data.predictions[0];
            const predictionIndex: number = argmax(predictionsArr);
            const predictionPercentage: number = Math.floor(predictionsArr[predictionIndex]*100);
            const prediction: InterfacePredictionResult = {
                timestamp,
                predictionsArr,
                predictionPercentage,
                predictionAction: predictionAction(predictionIndex)
            };
            const newPrediction = new this.predictionModel(prediction);
            await newPrediction.save();
            return prediction
        }catch (error) {
            this.logger.error(error.response.data.error)
        }
    }
}
