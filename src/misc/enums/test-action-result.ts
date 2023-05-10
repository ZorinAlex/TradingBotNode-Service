import {Wallet} from "../../schemas/wallet.schema";
import {CreateTradeDto} from "../../dto/create-trade-dto";

export enum ETestActionResult {
    NONE = 'NONE',
    BUY = 'BUY',
    SELL = 'SELL',
    TB_STEP = 'TB_STEP',
    TS_STEP = 'TS_STEP',
    SL_STEP = 'SL_STEP'
}

export interface ITestResult {
    action: ETestActionResult,
    currentState: number,
    wallet?: Wallet
    trade?: CreateTradeDto
}
