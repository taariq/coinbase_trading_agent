import { CoinbaseTradingAgent } from "./trading-agent";
import { TradingAgentChat } from "./chat-interface";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Initializing Coinbase Trading Agent...\n");

  // Initialize the trading agent
  const agent = new CoinbaseTradingAgent();
  
  try {
    // Initialize with AI features enabled
    await agent.initialize({ aiEnabled: true });

    // Optional: Set up some default strategies
    console.log("Setting up default configurations...\n");

    // Create a DCA strategy (disabled by default)
    const dcaId = agent.createDCAStrategy("BTC-USD", "0.001", 1440); // Daily
    agent.disableStrategy(dcaId); // Disable until user enables it

    // Set up event listeners for important events
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

    // Get OpenAI API key from environment (optional)
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.log("⚠️  OpenAI API key not found. Using command parsing only.");
      console.log("   Set OPENAI_API_KEY in .env for natural language chat.\n");
    } else {
      console.log("✅ OpenAI integration enabled for natural language understanding.\n");
    }

    // Start the chat interface
    const chat = new TradingAgentChat(agent, openaiKey);
    await chat.start();

  } catch (error) {
    console.error("❌ Error starting trading agent:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

// Run the application
main().catch(console.error);
