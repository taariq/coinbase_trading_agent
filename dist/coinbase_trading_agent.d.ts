import { EventEmitter } from "events";
interface TradeConfig {
    productId: string;
    orderType: "market" | "limit";
    side: "buy" | "sell";
    amount: string;
    limitPrice?: string;
}
interface PriceAlert {
    id: string;
    productId: string;
    targetPrice: number;
    condition: "above" | "below";
    active: boolean;
    callback?: (price: number) => void;
}
interface TradingStrategy {
    id: string;
    name: string;
    enabled: boolean;
    productId: string;
    type: "dca" | "grid" | "momentum" | "mean_reversion";
    parameters: any;
}
interface MarketData {
    productId: string;
    price: number;
    volume24h: number;
    priceChange24h: number;
    timestamp: Date;
}
interface PortfolioAnalysis {
    totalValue: number;
    holdings: Array<{
        asset: string;
        amount: number;
        value: number;
        allocation: number;
    }>;
    performance24h: number;
    riskScore: number;
}
declare class CoinbaseTradingAgent extends EventEmitter {
    private cdp;
    private account;
    private priceAlerts;
    private strategies;
    private marketData;
    private orderHistory;
    private monitoringInterval;
    private aiEnabled;
    constructor();
    initialize(options?: {
        aiEnabled?: boolean;
    }): Promise<any>;
    private startMonitoring;
    private updateMarketData;
    getMarketData(productId: string): Promise<MarketData | null>;
    getCurrentPrice(productId: string): Promise<number>;
    createPriceAlert(productId: string, targetPrice: number, condition: "above" | "below", callback?: (price: number) => void): string;
    private checkPriceAlerts;
    removePriceAlert(alertId: string): boolean;
    listPriceAlerts(): PriceAlert[];
    createStrategy(strategy: Omit<TradingStrategy, "id">): string;
    createDCAStrategy(productId: string, amountPerTrade: string, intervalMinutes: number): string;
    createGridStrategy(productId: string, lowerPrice: number, upperPrice: number, gridLevels: number, amountPerLevel: string): string;
    createMomentumStrategy(productId: string, threshold: number, tradeAmount: string): string;
    createMeanReversionStrategy(productId: string, lookbackPeriod: number, stdDevThreshold: number, tradeAmount: string): string;
    private executeActiveStrategies;
    private executeDCAStrategy;
    private executeGridStrategy;
    private executeMomentumStrategy;
    private executeMeanReversionStrategy;
    enableStrategy(strategyId: string): boolean;
    disableStrategy(strategyId: string): boolean;
    listStrategies(): TradingStrategy[];
    analyzeMarketWithAI(productId: string): Promise<{
        action: "buy" | "sell" | "hold";
        confidence: number;
        reasoning: string;
    }>;
    executeAITrade(productId: string, amount: string): Promise<any>;
    analyzePortfolio(): Promise<PortfolioAnalysis>;
    private calculateRiskScore;
    rebalancePortfolio(targetAllocations: Map<string, number>): Promise<void>;
    executeTrade(config: TradeConfig): Promise<any>;
    marketBuy(productId: string, amount: string): Promise<any>;
    marketSell(productId: string, amount: string): Promise<any>;
    limitBuy(productId: string, amount: string, limitPrice: string): Promise<any>;
    limitSell(productId: string, amount: string, limitPrice: string): Promise<any>;
    getOrderHistory(): Array<any>;
    generatePerformanceReport(): Promise<{
        totalTrades: number;
        winRate: number;
        profitLoss: number;
        bestTrade: any;
        worstTrade: any;
    }>;
    close(): Promise<void>;
}
export { CoinbaseTradingAgent, TradeConfig, PriceAlert, TradingStrategy };
