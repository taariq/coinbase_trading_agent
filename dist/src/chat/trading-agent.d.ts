import { EventEmitter } from "events";
export interface TradeConfig {
    productId: string;
    orderType: "market" | "limit";
    side: "buy" | "sell";
    amount: string;
    limitPrice?: string;
}
export declare class CoinbaseTradingAgent extends EventEmitter {
    private cdp;
    private account;
    private initialized;
    constructor();
    initialize(options?: {
        aiEnabled?: boolean;
    }): Promise<any>;
    getAccountBalance(): Promise<{
        address: any;
        balances: any[];
    }>;
    executeTrade(config: TradeConfig): Promise<{
        productId: string;
        orderType: "market" | "limit";
        side: "buy" | "sell";
        amount: string;
        limitPrice: string;
        timestamp: string;
        executedPrice: number;
    }>;
    marketBuy(productId: string, amount: string): Promise<{
        productId: string;
        orderType: "market" | "limit";
        side: "buy" | "sell";
        amount: string;
        limitPrice: string;
        timestamp: string;
        executedPrice: number;
    }>;
    marketSell(productId: string, amount: string): Promise<{
        productId: string;
        orderType: "market" | "limit";
        side: "buy" | "sell";
        amount: string;
        limitPrice: string;
        timestamp: string;
        executedPrice: number;
    }>;
    limitBuy(productId: string, amount: string, limitPrice: string): Promise<{
        productId: string;
        orderType: "market" | "limit";
        side: "buy" | "sell";
        amount: string;
        limitPrice: string;
        timestamp: string;
        executedPrice: number;
    }>;
    limitSell(productId: string, amount: string, limitPrice: string): Promise<{
        productId: string;
        orderType: "market" | "limit";
        side: "buy" | "sell";
        amount: string;
        limitPrice: string;
        timestamp: string;
        executedPrice: number;
    }>;
    createDCAStrategy(productId: string, amount: string, intervalMinutes: number): string;
    disableStrategy(strategyId: string): void;
    getPortfolioValue(): Promise<{
        totalValue: string;
        holdings: any[];
        lastUpdated: string;
    }>;
    close(): Promise<void>;
}
