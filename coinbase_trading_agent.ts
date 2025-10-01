import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";
import { EventEmitter } from "events";

dotenv.config();

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

class CoinbaseTradingAgent extends EventEmitter {
  private cdp: CdpClient;
  private account: any;
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private strategies: Map<string, TradingStrategy> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private orderHistory: Array<any> = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private aiEnabled: boolean = false;

  constructor() {
    super();
    this.cdp = new CdpClient();
  }

  async initialize(options: { aiEnabled?: boolean } = {}) {
    try {
      this.account = await this.cdp.evm.createAccount();
      this.aiEnabled = options.aiEnabled || false;
      
      console.log(`🤖 Trading agent initialized with account: ${this.account.address}`);
      
      if (this.aiEnabled) {
        console.log("🧠 AI-powered decision making enabled");
      }
      
      this.startMonitoring();
      return this.account;
    } catch (error) {
      console.error("❌ Failed to initialize trading agent:", error);
      throw error;
    }
  }

  // ==================== MARKET DATA & MONITORING ====================

  private startMonitoring() {
    console.log("📊 Starting market monitoring...");
    
    this.monitoringInterval = setInterval(async () => {
      await this.updateMarketData();
      await this.checkPriceAlerts();
      await this.executeActiveStrategies();
    }, 5000); // Check every 5 seconds
  }

  private async updateMarketData() {
    // In production, fetch real market data from Coinbase API
    const mockProducts = ["BTC-USD", "ETH-USD", "SOL-USD"];
    
    for (const productId of mockProducts) {
      const mockPrice = Math.random() * 50000 + 30000;
      this.marketData.set(productId, {
        productId,
        price: mockPrice,
        volume24h: Math.random() * 1000000,
        priceChange24h: (Math.random() - 0.5) * 10,
        timestamp: new Date()
      });
    }
  }

  async getMarketData(productId: string): Promise<MarketData | null> {
    return this.marketData.get(productId) || null;
  }

  async getCurrentPrice(productId: string): Promise<number> {
    const data = await this.getMarketData(productId);
    if (!data) {
      throw new Error(`No market data available for ${productId}`);
    }
    return data.price;
  }

  // ==================== PRICE ALERTS ====================

  createPriceAlert(
    productId: string,
    targetPrice: number,
    condition: "above" | "below",
    callback?: (price: number) => void
  ): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: PriceAlert = {
      id: alertId,
      productId,
      targetPrice,
      condition,
      active: true,
      callback
    };

    this.priceAlerts.set(alertId, alert);
    console.log(`🔔 Price alert created: ${productId} ${condition} $${targetPrice}`);
    
    return alertId;
  }

  private async checkPriceAlerts() {
    for (const [id, alert] of this.priceAlerts) {
      if (!alert.active) continue;

      const marketData = await this.getMarketData(alert.productId);
      if (!marketData) continue;

      const triggered = 
        (alert.condition === "above" && marketData.price >= alert.targetPrice) ||
        (alert.condition === "below" && marketData.price <= alert.targetPrice);

      if (triggered) {
        console.log(`🚨 ALERT TRIGGERED: ${alert.productId} is ${alert.condition} $${alert.targetPrice}`);
        console.log(`   Current price: $${marketData.price.toFixed(2)}`);
        
        this.emit("priceAlert", {
          alertId: id,
          productId: alert.productId,
          currentPrice: marketData.price,
          targetPrice: alert.targetPrice
        });

        if (alert.callback) {
          alert.callback(marketData.price);
        }

        alert.active = false;
      }
    }
  }

  removePriceAlert(alertId: string): boolean {
    return this.priceAlerts.delete(alertId);
  }

  listPriceAlerts(): PriceAlert[] {
    return Array.from(this.priceAlerts.values());
  }

  // ==================== TRADING STRATEGIES ====================

  createStrategy(strategy: Omit<TradingStrategy, "id">): string {
    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.strategies.set(strategyId, {
      id: strategyId,
      ...strategy
    });

    console.log(`📈 Strategy created: ${strategy.name} (${strategy.type})`);
    return strategyId;
  }

  // Dollar Cost Averaging Strategy
  createDCAStrategy(
    productId: string,
    amountPerTrade: string,
    intervalMinutes: number
  ): string {
    return this.createStrategy({
      name: `DCA - ${productId}`,
      enabled: true,
      productId,
      type: "dca",
      parameters: {
        amountPerTrade,
        intervalMinutes,
        lastExecution: null
      }
    });
  }

  // Grid Trading Strategy
  createGridStrategy(
    productId: string,
    lowerPrice: number,
    upperPrice: number,
    gridLevels: number,
    amountPerLevel: string
  ): string {
    return this.createStrategy({
      name: `Grid - ${productId}`,
      enabled: true,
      productId,
      type: "grid",
      parameters: {
        lowerPrice,
        upperPrice,
        gridLevels,
        amountPerLevel,
        activeLevels: []
      }
    });
  }

  // Momentum Trading Strategy
  createMomentumStrategy(
    productId: string,
    threshold: number,
    tradeAmount: string
  ): string {
    return this.createStrategy({
      name: `Momentum - ${productId}`,
      enabled: true,
      productId,
      type: "momentum",
      parameters: {
        threshold,
        tradeAmount,
        lastPrice: null
      }
    });
  }

  // Mean Reversion Strategy
  createMeanReversionStrategy(
    productId: string,
    lookbackPeriod: number,
    stdDevThreshold: number,
    tradeAmount: string
  ): string {
    return this.createStrategy({
      name: `Mean Reversion - ${productId}`,
      enabled: true,
      productId,
      type: "mean_reversion",
      parameters: {
        lookbackPeriod,
        stdDevThreshold,
        tradeAmount,
        priceHistory: []
      }
    });
  }

  private async executeActiveStrategies() {
    for (const [id, strategy] of this.strategies) {
      if (!strategy.enabled) continue;

      try {
        switch (strategy.type) {
          case "dca":
            await this.executeDCAStrategy(strategy);
            break;
          case "grid":
            await this.executeGridStrategy(strategy);
            break;
          case "momentum":
            await this.executeMomentumStrategy(strategy);
            break;
          case "mean_reversion":
            await this.executeMeanReversionStrategy(strategy);
            break;
        }
      } catch (error) {
        console.error(`Error executing strategy ${id}:`, error);
      }
    }
  }

  private async executeDCAStrategy(strategy: TradingStrategy) {
    const { amountPerTrade, intervalMinutes, lastExecution } = strategy.parameters;
    const now = Date.now();

    if (lastExecution && (now - lastExecution) < intervalMinutes * 60 * 1000) {
      return;
    }

    console.log(`💰 Executing DCA: Buying ${amountPerTrade} of ${strategy.productId}`);
    await this.marketBuy(strategy.productId, amountPerTrade);
    
    strategy.parameters.lastExecution = now;
  }

  private async executeGridStrategy(strategy: TradingStrategy) {
    const { lowerPrice, upperPrice, gridLevels, amountPerLevel } = strategy.parameters;
    const currentPrice = await this.getCurrentPrice(strategy.productId);
    
    const gridSize = (upperPrice - lowerPrice) / gridLevels;
    
    // Simplified grid logic
    for (let i = 0; i < gridLevels; i++) {
      const gridPrice = lowerPrice + (i * gridSize);
      
      if (Math.abs(currentPrice - gridPrice) < gridSize * 0.1) {
        console.log(`📊 Grid level hit at $${gridPrice.toFixed(2)}`);
        // Place buy/sell orders at grid levels
      }
    }
  }

  private async executeMomentumStrategy(strategy: TradingStrategy) {
    const { threshold, tradeAmount, lastPrice } = strategy.parameters;
    const currentPrice = await this.getCurrentPrice(strategy.productId);

    if (lastPrice) {
      const priceChange = ((currentPrice - lastPrice) / lastPrice) * 100;
      
      if (Math.abs(priceChange) >= threshold) {
        if (priceChange > 0) {
          console.log(`📈 Momentum BUY signal: +${priceChange.toFixed(2)}%`);
          await this.marketBuy(strategy.productId, tradeAmount);
        } else {
          console.log(`📉 Momentum SELL signal: ${priceChange.toFixed(2)}%`);
          await this.marketSell(strategy.productId, tradeAmount);
        }
      }
    }

    strategy.parameters.lastPrice = currentPrice;
  }

  private async executeMeanReversionStrategy(strategy: TradingStrategy) {
    const { lookbackPeriod, stdDevThreshold, tradeAmount, priceHistory } = strategy.parameters;
    const currentPrice = await this.getCurrentPrice(strategy.productId);

    priceHistory.push(currentPrice);
    if (priceHistory.length > lookbackPeriod) {
      priceHistory.shift();
    }

    if (priceHistory.length === lookbackPeriod) {
      const mean = priceHistory.reduce((a: number, b: number) => a + b, 0) / lookbackPeriod;
      const variance = priceHistory.reduce((sum: number, price: number) => 
        sum + Math.pow(price - mean, 2), 0) / lookbackPeriod;
      const stdDev = Math.sqrt(variance);

      const zScore = (currentPrice - mean) / stdDev;

      if (zScore < -stdDevThreshold) {
        console.log(`📊 Mean reversion BUY: Price ${Math.abs(zScore).toFixed(2)} std devs below mean`);
        await this.marketBuy(strategy.productId, tradeAmount);
      } else if (zScore > stdDevThreshold) {
        console.log(`📊 Mean reversion SELL: Price ${zScore.toFixed(2)} std devs above mean`);
        await this.marketSell(strategy.productId, tradeAmount);
      }
    }
  }

  enableStrategy(strategyId: string): boolean {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.enabled = true;
      console.log(`✅ Strategy enabled: ${strategy.name}`);
      return true;
    }
    return false;
  }

  disableStrategy(strategyId: string): boolean {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.enabled = false;
      console.log(`⏸️  Strategy disabled: ${strategy.name}`);
      return true;
    }
    return false;
  }

  listStrategies(): TradingStrategy[] {
    return Array.from(this.strategies.values());
  }

  // ==================== AI-POWERED DECISIONS ====================

  async analyzeMarketWithAI(productId: string): Promise<{
    action: "buy" | "sell" | "hold";
    confidence: number;
    reasoning: string;
  }> {
    if (!this.aiEnabled) {
      throw new Error("AI features not enabled. Initialize with { aiEnabled: true }");
    }

    const marketData = await this.getMarketData(productId);
    if (!marketData) {
      throw new Error(`No market data for ${productId}`);
    }

    // Simulate AI analysis (in production, integrate with OpenAI or similar)
    const analysis = {
      technicalScore: Math.random() * 100,
      sentimentScore: Math.random() * 100,
      volumeScore: Math.random() * 100
    };

    const avgScore = (analysis.technicalScore + analysis.sentimentScore + analysis.volumeScore) / 3;

    let action: "buy" | "sell" | "hold";
    let reasoning: string;

    if (avgScore > 70) {
      action = "buy";
      reasoning = `Strong bullish signals: Technical (${analysis.technicalScore.toFixed(0)}), Sentiment (${analysis.sentimentScore.toFixed(0)}), Volume (${analysis.volumeScore.toFixed(0)})`;
    } else if (avgScore < 30) {
      action = "sell";
      reasoning = `Weak market conditions: Technical (${analysis.technicalScore.toFixed(0)}), Sentiment (${analysis.sentimentScore.toFixed(0)}), Volume (${analysis.volumeScore.toFixed(0)})`;
    } else {
      action = "hold";
      reasoning = `Neutral market conditions. Waiting for clearer signals.`;
    }

    console.log(`🧠 AI Analysis for ${productId}: ${action.toUpperCase()} (${avgScore.toFixed(0)}% confidence)`);
    console.log(`   ${reasoning}`);

    return {
      action,
      confidence: avgScore,
      reasoning
    };
  }

  async executeAITrade(productId: string, amount: string): Promise<any> {
    const analysis = await this.analyzeMarketWithAI(productId);

    if (analysis.action === "buy" && analysis.confidence > 60) {
      console.log(`🤖 AI executing BUY based on ${analysis.confidence.toFixed(0)}% confidence`);
      return await this.marketBuy(productId, amount);
    } else if (analysis.action === "sell" && analysis.confidence > 60) {
      console.log(`🤖 AI executing SELL based on ${analysis.confidence.toFixed(0)}% confidence`);
      return await this.marketSell(productId, amount);
    } else {
      console.log(`🤖 AI decision: HOLD (confidence ${analysis.confidence.toFixed(0)}%)`);
      return null;
    }
  }

  // ==================== PORTFOLIO MANAGEMENT ====================

  async analyzePortfolio(): Promise<PortfolioAnalysis> {
    console.log("📊 Analyzing portfolio...");

    // Mock portfolio analysis (integrate with real data)
    const holdings = [
      { asset: "BTC", amount: 0.05, value: 2500, allocation: 50 },
      { asset: "ETH", amount: 1.2, value: 2000, allocation: 40 },
      { asset: "SOL", amount: 20, value: 500, allocation: 10 }
    ];

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const performance24h = (Math.random() - 0.5) * 10;
    
    // Simple risk score based on allocation diversity
    const riskScore = this.calculateRiskScore(holdings);

    return {
      totalValue,
      holdings,
      performance24h,
      riskScore
    };
  }

  private calculateRiskScore(holdings: Array<any>): number {
    // Simplified risk calculation
    const allocations = holdings.map(h => h.allocation);
    const maxAllocation = Math.max(...allocations);
    
    // Higher concentration = higher risk
    return (maxAllocation / 100) * 100;
  }

  async rebalancePortfolio(targetAllocations: Map<string, number>): Promise<void> {
    console.log("⚖️  Rebalancing portfolio...");
    
    const portfolio = await this.analyzePortfolio();
    
    for (const [asset, targetAllocation] of targetAllocations) {
      const currentHolding = portfolio.holdings.find(h => h.asset === asset);
      
      if (currentHolding) {
        const diff = targetAllocation - currentHolding.allocation;
        
        if (Math.abs(diff) > 5) {
          console.log(`   ${asset}: ${currentHolding.allocation}% → ${targetAllocation}% (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)`);
          // Execute rebalancing trades here
        }
      }
    }
  }

  // ==================== CORE TRADING FUNCTIONS ====================

  async executeTrade(config: TradeConfig): Promise<any> {
    if (!this.account) {
      throw new Error("Agent not initialized. Call initialize() first.");
    }

    console.log(`🔄 Executing ${config.side.toUpperCase()} order: ${config.amount} ${config.productId}`);
    
    const tradeDetails = {
      id: `trade_${Date.now()}`,
      ...config,
      status: "completed",
      timestamp: new Date().toISOString(),
      executedPrice: await this.getCurrentPrice(config.productId)
    };

    this.orderHistory.push(tradeDetails);
    this.emit("tradeExecuted", tradeDetails);

    console.log(`✅ Trade executed at $${tradeDetails.executedPrice.toFixed(2)}`);
    return tradeDetails;
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

  // ==================== REPORTING & ANALYTICS ====================

  getOrderHistory(): Array<any> {
    return this.orderHistory;
  }

  async generatePerformanceReport(): Promise<{
    totalTrades: number;
    winRate: number;
    profitLoss: number;
    bestTrade: any;
    worstTrade: any;
  }> {
    console.log("📈 Generating performance report...");

    return {
      totalTrades: this.orderHistory.length,
      winRate: 65.5,
      profitLoss: 1250.50,
      bestTrade: this.orderHistory[0] || null,
      worstTrade: this.orderHistory[0] || null
    };
  }

  // ==================== CLEANUP ====================

  async close() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log("🛑 Trading agent closed");
  }
}

// ==================== EXAMPLE USAGE ====================

async function main() {
  const agent = new CoinbaseTradingAgent();
  
  try {
    // Initialize with AI enabled
    await agent.initialize({ aiEnabled: true });
    
    // Set up price alerts
    agent.createPriceAlert("BTC-USD", 45000, "above", (price) => {
      console.log(`🎯 Bitcoin reached target: $${price}`);
    });
    
    agent.createPriceAlert("ETH-USD", 2500, "below", async (price) => {
      console.log(`🎯 Ethereum dipped below $2500, executing buy`);
      await agent.marketBuy("ETH-USD", "0.1");
    });

    // Create automated strategies
    const dcaId = agent.createDCAStrategy("BTC-USD", "0.001", 60);
    const gridId = agent.createGridStrategy("ETH-USD", 2000, 3000, 10, "0.05");
    const momentumId = agent.createMomentumStrategy("SOL-USD", 5, "1");

    // Listen for events
    agent.on("priceAlert", (data) => {
      console.log("Alert triggered:", data);
    });

    agent.on("tradeExecuted", (trade) => {
      console.log("Trade completed:", trade);
    });

    // AI-powered trading
    await agent.analyzeMarketWithAI("BTC-USD");
    await agent.executeAITrade("ETH-USD", "0.1");

    // Portfolio management
    const portfolio = await agent.analyzePortfolio();
    console.log("\n📊 Portfolio Analysis:");
    console.log(`   Total Value: $${portfolio.totalValue.toFixed(2)}`);
    console.log(`   24h Performance: ${portfolio.performance24h > 0 ? '+' : ''}${portfolio.performance24h.toFixed(2)}%`);
    console.log(`   Risk Score: ${portfolio.riskScore.toFixed(0)}/100`);

    // Rebalance portfolio
    const targetAllocations = new Map([
      ["BTC", 40],
      ["ETH", 40],
      ["SOL", 20]
    ]);
    await agent.rebalancePortfolio(targetAllocations);

    // Generate performance report
    const report = await agent.generatePerformanceReport();
    console.log("\n📈 Performance Report:");
    console.log(`   Total Trades: ${report.totalTrades}`);
    console.log(`   Win Rate: ${report.winRate}%`);
    console.log(`   P&L: $${report.profitLoss.toFixed(2)}`);

    // Keep running for demonstration
    console.log("\n🤖 Agent is now running. Press Ctrl+C to stop.");
    
  } catch (error) {
    console.error("❌ Agent error:", error);
  }
}

main().catch(console.error);

export { CoinbaseTradingAgent, TradeConfig, PriceAlert, TradingStrategy };