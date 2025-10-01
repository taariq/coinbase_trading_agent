import { CoinbaseTradingAgent } from './trading-agent';
export declare class TradingAgentChat {
    private rl;
    private agent;
    private openaiKey?;
    constructor(agent: CoinbaseTradingAgent, openaiKey?: string);
    start(): Promise<void>;
    private promptUser;
    private processCommand;
    private showHelp;
    private showBalance;
    private showPortfolio;
    private executeBuy;
    private executeSell;
    private executeLimitOrder;
    private handleNaturalLanguage;
    close(): void;
}
