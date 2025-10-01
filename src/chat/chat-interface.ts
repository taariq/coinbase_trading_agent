import * as readline from 'readline';
import { CoinbaseTradingAgent } from './trading-agent';

export class TradingAgentChat {
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
      const balance = await this.agent.getAccountBalance();
      console.log('\n💰 Account Balance:');
      console.log(`   Address: ${balance.address}`);
      console.log('   Balances: (Balance checking not fully implemented yet)');
      console.log('   Note: This is a test environment\n');
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

    // Simple pattern matching for common queries
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