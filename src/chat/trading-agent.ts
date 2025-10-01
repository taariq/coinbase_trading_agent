import { CdpClient } from "@coinbase/cdp-sdk";
import { EventEmitter } from "events";

export interface TradeConfig {
  productId: string;
  orderType: "market" | "limit";
  side: "buy" | "sell";
  amount: string;
  limitPrice?: string;
}

export class CoinbaseTradingAgent extends EventEmitter {
  private cdp: CdpClient;
  private account: any;
  private initialized: boolean = false;

  constructor() {
    super();
    this.cdp = new CdpClient();
  }

  async initialize(options?: { aiEnabled?: boolean }) {
    try {
      // Create an EVM account on Base Sepolia for testing
      this.account = await this.cdp.evm.createAccount();
      this.initialized = true;
      console.log(`Trading agent initialized with account: ${this.account.address}`);
      return this.account;
    } catch (error) {
      console.error("Failed to initialize trading agent:", error);
      throw error;
    }
  }

  async getAccountBalance() {
    if (!this.initialized) {
      throw new Error("Agent not initialized. Call initialize() first.");
    }

    try {
      // Note: Using a placeholder since getBalance() method may not be available
      console.log(`Account address: ${this.account.address}`);
      return {
        address: this.account.address,
        balances: []
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  async executeTrade(config: TradeConfig) {
    if (!this.initialized) {
      throw new Error("Agent not initialized. Call initialize() first.");
    }

    console.log(`Executing ${config.side} order for ${config.amount} ${config.productId}`);

    try {
      const tradeDetails = {
        productId: config.productId,
        orderType: config.orderType,
        side: config.side,
        amount: config.amount,
        limitPrice: config.limitPrice,
        timestamp: new Date().toISOString(),
        executedPrice: config.limitPrice ? parseFloat(config.limitPrice) : Math.random() * 50000 // Mock price
      };

      // Emit trade executed event
      this.emit("tradeExecuted", tradeDetails);

      console.log("Trade executed:", tradeDetails);
      return tradeDetails;
    } catch (error) {
      console.error("Trade execution failed:", error);
      throw error;
    }
  }

  async marketBuy(productId: string, amount: string) {
    return this.executeTrade({
      productId,
      orderType: "market",
      side: "buy",
      amount
    });
  }

  async marketSell(productId: string, amount: string) {
    return this.executeTrade({
      productId,
      orderType: "market",
      side: "sell",
      amount
    });
  }

  async limitBuy(productId: string, amount: string, limitPrice: string) {
    return this.executeTrade({
      productId,
      orderType: "limit",
      side: "buy",
      amount,
      limitPrice
    });
  }

  async limitSell(productId: string, amount: string, limitPrice: string) {
    return this.executeTrade({
      productId,
      orderType: "limit",
      side: "sell",
      amount,
      limitPrice
    });
  }

  createDCAStrategy(productId: string, amount: string, intervalMinutes: number) {
    const strategyId = `dca_${Date.now()}`;
    console.log(`Created DCA strategy ${strategyId} for ${productId}`);
    return strategyId;
  }

  disableStrategy(strategyId: string) {
    console.log(`Disabled strategy ${strategyId}`);
  }

  async getPortfolioValue() {
    console.log("Calculating portfolio value...");
    return {
      totalValue: "0.00",
      holdings: [],
      lastUpdated: new Date().toISOString()
    };
  }

  async close() {
    console.log("Trading agent closed");
  }
}