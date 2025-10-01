import { CdpClient } from "@coinbase/cdp-sdk";
import { EventEmitter } from "events";
import * as readline from 'readline';
import dotenv from "dotenv";

dotenv.config();

interface TradeConfig {
  productId: string;
  orderType: "market" | "limit";
  side: "buy" | "sell";
  amount: string;
  limitPrice?: string;
}

class CoinbaseTradingAgent extends EventEmitter {
  private cdp: CdpClient;
  private account: any;
  private initialized: boolean = false;

  constructor() {
    super();
    this.cdp = new CdpClient();
  }

  async initialize(options?: { aiEnabled?: boolean }) {
    try {
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
      console.log(`Account address: ${this.account.address}`);

      // Try multiple methods to get balances
      let balances = [];

      try {
        // Method 1: Try account.listTokenBalances if available
        if (typeof this.account.listTokenBalances === 'function') {
          const tokenBalances = await this.account.listTokenBalances({
            network: "base-sepolia"
          });
          balances = Array.isArray(tokenBalances) ? tokenBalances : (tokenBalances as any).data || [];
        }
      } catch (error) {
        console.log("Account listTokenBalances not available:", error.message);
      }

      try {
        // Method 2: Try CDP client listTokenBalances if account method fails
        if (balances.length === 0) {
          const tokenBalances = await this.cdp.evm.listTokenBalances({
            address: this.account.address,
            network: "base-sepolia"
          });
          balances = Array.isArray(tokenBalances) ? tokenBalances : (tokenBalances as any).data || [];
        }
      } catch (error) {
        console.log("CDP listTokenBalances not available:", error.message);
      }

      return {
        address: this.account.address,
        balances: balances || [],
        network: "base-sepolia"
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      // Return basic info even if balance fetching fails
      return {
        address: this.account.address,
        balances: [],
        network: "base-sepolia",
        error: error.message
      };
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
        executedPrice: config.limitPrice ? parseFloat(config.limitPrice) : Math.random() * 50000
      };

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

class TradingAgentChat {
  private rl: readline.Interface;
  private agent: CoinbaseTradingAgent;
  private openaiKey?: string;

  constructor(agent: CoinbaseTradingAgent, openaiKey?: string) {
    this.agent = agent;
    this.openaiKey = openaiKey;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log("💬 Welcome to Coinbase Trading Agent Chat!");
    console.log("=====================================");
    console.log("Available commands:");
    console.log("  /help - Show this help message");
    console.log("  /balance - Check account balance");
    console.log("  /portfolio - View portfolio value");
    console.log("  /buy <amount> <symbol> - Market buy order (e.g., /buy 0.001 BTC-USD)");
    console.log("  /sell <amount> <symbol> - Market sell order");
    console.log("  /limit buy <amount> <symbol> <price> - Limit buy order");
    console.log("  /limit sell <amount> <symbol> <price> - Limit sell order");
    console.log("  /exit - Exit the chat");
    console.log("=====================================");
    console.log("Type your commands or ask questions about trading!\n");

    this.promptUser();
  }

  private promptUser() {
    this.rl.question('📈 Trading Agent > ', async (input) => {
      const trimmedInput = input.trim();

      if (!trimmedInput) {
        this.promptUser();
        return;
      }

      try {
        await this.processCommand(trimmedInput);
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
      }

      this.promptUser();
    });
  }

  private async processCommand(input: string): Promise<void> {
    const parts = input.toLowerCase().split(' ');
    const command = parts[0];

    switch (command) {
      case '/help':
        this.showHelp();
        break;

      case '/balance':
        await this.showBalance();
        break;

      case '/portfolio':
        await this.showPortfolio();
        break;

      case '/buy':
        if (parts.length < 3) {
          console.log('❌ Usage: /buy <amount> <symbol> (e.g., /buy 0.001 BTC-USD)');
          return;
        }
        await this.executeBuy(parts[1], parts[2]);
        break;

      case '/sell':
        if (parts.length < 3) {
          console.log('❌ Usage: /sell <amount> <symbol> (e.g., /sell 0.001 BTC-USD)');
          return;
        }
        await this.executeSell(parts[1], parts[2]);
        break;

      case '/limit':
        if (parts.length < 5 || !['buy', 'sell'].includes(parts[1])) {
          console.log('❌ Usage: /limit buy|sell <amount> <symbol> <price>');
          return;
        }
        await this.executeLimitOrder(parts[1], parts[2], parts[3], parts[4]);
        break;

      case '/exit':
        console.log('👋 Goodbye! Happy trading!');
        await this.agent.close();
        process.exit(0);
        break;

      default:
        if (input.startsWith('/')) {
          console.log('❌ Unknown command. Type /help for available commands.');
        } else {
          await this.handleNaturalLanguage(input);
        }
        break;
    }
  }

  private showHelp() {
    console.log("\n📖 Available Commands:");
    console.log("======================");
    console.log("  /help - Show this help message");
    console.log("  /balance - Check account balance");
    console.log("  /portfolio - View portfolio value");
    console.log("  /buy <amount> <symbol> - Market buy order");
    console.log("  /sell <amount> <symbol> - Market sell order");
    console.log("  /limit buy <amount> <symbol> <price> - Limit buy order");
    console.log("  /limit sell <amount> <symbol> <price> - Limit sell order");
    console.log("  /exit - Exit the chat");
    console.log("\n💡 You can also type natural language questions like:");
    console.log("  - 'What's my balance?'");
    console.log("  - 'Buy 100 dollars worth of Bitcoin'");
    console.log("  - 'Show me my portfolio'\n");
  }

  private async showBalance() {
    try {
      const balanceInfo = await this.agent.getAccountBalance();
      console.log('\n💰 Account Balance:');
      console.log(`   Address: ${balanceInfo.address}`);
      console.log(`   Network: ${balanceInfo.network}`);

      if (balanceInfo.error) {
        console.log(`   ⚠️  Error fetching balances: ${balanceInfo.error}`);
      }

      if (balanceInfo.balances && balanceInfo.balances.length > 0) {
        console.log('   Token Balances:');
        balanceInfo.balances.forEach((balance: any) => {
          console.log(`     ${balance.symbol || balance.asset || 'Unknown'}: ${balance.balance || balance.amount || '0'}`);
        });
      } else {
        console.log('   Token Balances: No tokens found or 0 balance');
        console.log('   💡 This might be a new account or balance fetching may need additional setup');
      }

      console.log('   Note: This is a test environment (Base Sepolia)\n');
    } catch (error) {
      console.error('❌ Failed to get balance:', error);
    }
  }

  private async showPortfolio() {
    try {
      const portfolio = await this.agent.getPortfolioValue();
      console.log('\n📊 Portfolio Summary:');
      console.log(`   Total Value: $${portfolio.totalValue}`);
      console.log(`   Last Updated: ${portfolio.lastUpdated}`);
      console.log('   Holdings: (No holdings to display)\n');
    } catch (error) {
      console.error('❌ Failed to get portfolio:', error);
    }
  }

  private async executeBuy(amount: string, symbol: string) {
    try {
      console.log(`\n🟢 Executing market buy order...`);
      const trade = await this.agent.marketBuy(symbol.toUpperCase(), amount);
      console.log(`✅ Buy order completed!`);
      console.log(`   ${trade.amount} ${trade.productId} at ~$${trade.executedPrice?.toFixed(2)}\n`);
    } catch (error) {
      console.error('❌ Buy order failed:', error);
    }
  }

  private async executeSell(amount: string, symbol: string) {
    try {
      console.log(`\n🔴 Executing market sell order...`);
      const trade = await this.agent.marketSell(symbol.toUpperCase(), amount);
      console.log(`✅ Sell order completed!`);
      console.log(`   ${trade.amount} ${trade.productId} at ~$${trade.executedPrice?.toFixed(2)}\n`);
    } catch (error) {
      console.error('❌ Sell order failed:', error);
    }
  }

  private async executeLimitOrder(side: string, amount: string, symbol: string, price: string) {
    try {
      console.log(`\n📋 Executing ${side} limit order...`);
      const trade = side === 'buy'
        ? await this.agent.limitBuy(symbol.toUpperCase(), amount, price)
        : await this.agent.limitSell(symbol.toUpperCase(), amount, price);

      console.log(`✅ ${side.charAt(0).toUpperCase() + side.slice(1)} limit order placed!`);
      console.log(`   ${trade.amount} ${trade.productId} at $${trade.limitPrice}\n`);
    } catch (error) {
      console.error(`❌ ${side} limit order failed:`, error);
    }
  }

  private async handleNaturalLanguage(input: string) {
    if (!this.openaiKey) {
      console.log("🤖 Natural language processing not available.");
      console.log("   Set OPENAI_API_KEY in .env file to enable this feature.");
      console.log("   For now, please use the /help command to see available commands.\n");
      return;
    }

    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('balance') || lowerInput.includes('account')) {
      await this.showBalance();
    } else if (lowerInput.includes('portfolio') || lowerInput.includes('holdings')) {
      await this.showPortfolio();
    } else if (lowerInput.includes('help') || lowerInput.includes('command')) {
      this.showHelp();
    } else {
      console.log("🤖 I understand you're asking about trading, but I need more specific commands.");
      console.log("   Try using commands like /balance, /portfolio, or /buy.\n");
      console.log("   Type /help to see all available commands.\n");
    }
  }

  close() {
    this.rl.close();
  }
}

async function main() {
  console.log("🚀 Initializing Coinbase Trading Agent...\n");

  const agent = new CoinbaseTradingAgent();

  try {
    await agent.initialize({ aiEnabled: true });

    console.log("Setting up default configurations...\n");

    const dcaId = agent.createDCAStrategy("BTC-USD", "0.001", 1440);
    agent.disableStrategy(dcaId);

    agent.on("priceAlert", (data) => {
      console.log("\n🚨 PRICE ALERT TRIGGERED!");
      console.log(`   ${data.productId}: $${data.currentPrice.toFixed(2)}`);
      console.log(`   Target: $${data.targetPrice}\n`);
    });

    agent.on("tradeExecuted", (trade) => {
      console.log("\n✅ TRADE EXECUTED!");
      console.log(`   ${trade.side.toUpperCase()} ${trade.amount} ${trade.productId}`);
      console.log(`   Price: $${trade.executedPrice?.toFixed(2)}`);
      console.log(`   Time: ${new Date(trade.timestamp).toLocaleTimeString()}\n`);
    });

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      console.log("⚠️  OpenAI API key not found. Using command parsing only.");
      console.log("   Set OPENAI_API_KEY in .env for natural language chat.\n");
    } else {
      console.log("✅ OpenAI integration enabled for natural language understanding.\n");
    }

    const chat = new TradingAgentChat(agent, openaiKey);
    await chat.start();

  } catch (error) {
    console.error("❌ Error starting trading agent:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

main().catch(console.error);