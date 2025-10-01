# 🤖 Coinbase Trading Agent Chat

An AI-powered cryptocurrency trading agent built with the Coinbase CDP SDK. Chat with your agent using natural language or commands to execute trades, monitor your portfolio, and manage trading strategies.

## ✨ Features

- 💬 **Interactive CLI Chat Interface** - Chat with your trading agent in real-time
- 🔄 **Market & Limit Orders** - Execute buy/sell orders with simple commands
- 📊 **Portfolio Tracking** - Monitor your holdings and account balance
- 🎯 **DCA Strategies** - Set up dollar-cost averaging strategies
- 🚨 **Price Alerts** - Get notified when prices hit your targets
- 🤖 **Natural Language Support** - Use plain English to interact with your agent (with OpenAI)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd coinbase_trading_agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the trading agent
npm run dev
```

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **Coinbase CDP API credentials** (get them from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/))
- **OpenAI API key** (optional, for natural language processing)

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Coinbase CDP SDK Configuration
CDP_API_KEY_NAME=your_api_key_name
CDP_API_KEY_PRIVATE_KEY=your_private_key

# Optional: OpenAI for natural language chat
OPENAI_API_KEY=your_openai_api_key

# Optional: PostgreSQL database (defaults to SQLite in-memory)
POSTGRES_URL=postgresql://user:password@localhost:5432/trading_agent
```

### 3. Verify Configuration

Your `tsconfig.json` should use CommonJS for compatibility with `ts-node`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## 🎮 Running the App

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Available npm Scripts

```bash
npm run dev      # Start with nodemon (auto-reload on changes)
npm start        # Start the trading agent
npm run build    # Compile TypeScript to JavaScript
npm run chat     # Alternative chat interface
```

## 💬 Using the Chat Interface

Once the agent starts, you'll see the welcome message and available commands:

```
💬 Welcome to Coinbase Trading Agent Chat!
=====================================
Available commands:
  /help - Show this help message
  /balance - Check account balance
  /portfolio - View portfolio value
  /buy <amount> <symbol> - Market buy order
  /sell <amount> <symbol> - Market sell order
  /limit buy <amount> <symbol> <price> - Limit buy order
  /limit sell <amount> <symbol> <price> - Limit sell order
  /exit - Exit the chat
=====================================
```

### Example Commands

```bash
# Check your balance
/balance

# View your portfolio
/portfolio

# Buy Bitcoin (market order)
/buy 0.001 BTC-USD

# Sell Ethereum (market order)
/sell 0.5 ETH-USD

# Place a limit buy order
/limit buy 0.001 BTC-USD 45000

# Place a limit sell order
/limit sell 0.5 ETH-USD 3500

# Natural language (with OpenAI configured)
What's my account balance?
Buy 100 dollars worth of Bitcoin
```

## 🎨 Vibe Coding with Claude Code

This project is designed for rapid, iterative development using **Claude Code** - an agentic coding tool that lets you delegate tasks to Claude directly from your terminal.

### Setting Up Claude Code

1. **Install Claude Code**
   ```bash
   # Follow instructions at https://docs.claude.com/en/docs/claude-code
   ```

2. **Initialize in Your Project**
   ```bash
   cd coinbase_trading_agent
   claude-code init
   ```

### Vibe Coding Workflow

#### 1. Adding New Features

Use natural language to describe what you want to build:

```bash
# Example: Add a new feature
"Add a command to set price alerts for any cryptocurrency. 
When the price hits the target, emit an event and log it to the console."
```

Claude Code will:
- Understand your requirements
- Generate the necessary code
- Update relevant files
- Test the implementation
- Explain what was changed

#### 2. Debugging Issues

When you encounter errors:

```bash
# Example: Debug an error
"I'm getting a module not found error when importing trading-agent. 
Can you fix the import paths?"
```

Claude Code will:
- Analyze the error
- Identify the root cause
- Fix the issue
- Test the fix
- Explain the solution

#### 3. Refactoring Code

Improve code quality iteratively:

```bash
# Example: Refactor
"Refactor the trading agent to use a strategy pattern for different 
order types. Make it easier to add new order types in the future."
```

#### 4. Adding Tests

```bash
# Example: Add tests
"Create unit tests for the CoinbaseTradingAgent class using Jest. 
Cover all the main trading functions."
```

#### 5. Building New Features - Examples

**Add Portfolio Analytics**
```bash
"Add a /analytics command that shows:
- Total profit/loss
- Best performing asset
- Trading volume for the last 24 hours
- Win rate percentage"
```

**Add Webhook Notifications**
```bash
"Integrate Discord webhooks so I get notified when:
- A trade executes
- Portfolio value changes by more than 5%
- Price alerts trigger"
```

**Add Technical Indicators**
```bash
"Add support for technical indicators like RSI, MACD, and moving averages.
Create a /indicators command to view them for any symbol."
```

**Add Risk Management**
```bash
"Implement risk management features:
- Maximum position size limits
- Stop-loss orders
- Daily trading limits
- Risk/reward ratio calculator"
```

### Best Practices for Vibe Coding

1. **Be Specific**: Clearly describe what you want to achieve
2. **Iterate**: Start simple, then add complexity
3. **Test Frequently**: Run `npm run dev` after each change
4. **Ask Questions**: Claude Code can explain any part of the codebase
5. **Review Changes**: Always review the code Claude generates
6. **Version Control**: Commit working versions frequently

### Example Vibe Coding Session

```bash
# Terminal 1: Run Claude Code
claude-code

# You: "Add a new feature to track my trading history"
# Claude: [Generates code, updates files]

# Terminal 2: Test the changes
npm run dev

# You: "Great! Now add a command to export the history as CSV"
# Claude: [Adds export functionality]

# Test again
npm run dev

# You: "Perfect! Add unit tests for the history tracking"
# Claude: [Creates test files]

# Run tests
npm test
```

## 📁 Project Structure

```
coinbase_trading_agent/
├── src/
│   ├── cache/           # Cache management
│   ├── chat/            # Chat interface and trading agent
│   │   ├── chat-interface.ts    # CLI chat UI
│   │   ├── trading-agent.ts     # Core trading logic
│   │   └── index.ts             # Chat entry point
│   ├── clients/         # Client integrations (Discord, Telegram, etc.)
│   ├── config/          # Configuration utilities
│   ├── database/        # Database adapters
│   ├── character.ts     # Agent character/personality
│   └── index.ts         # Main entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── .env                 # Environment variables (create this)
└── README.md           # This file
```

## 🏗️ Architecture

The trading agent is built with a modular architecture:

- **CoinbaseTradingAgent**: Core trading logic using CDP SDK
- **TradingAgentChat**: CLI interface for user interaction
- **Event-Driven**: Uses EventEmitter for real-time notifications
- **Extensible**: Easy to add new commands, strategies, and features

## 🔌 Key Components

### Trading Agent (`src/chat/trading-agent.ts`)

The main trading engine that handles:
- Account initialization
- Order execution (market & limit)
- Portfolio tracking
- Strategy management
- Event emissions

### Chat Interface (`src/chat/chat-interface.ts`)

Interactive CLI that provides:
- Command parsing
- Natural language support (with OpenAI)
- Real-time feedback
- Trade confirmations

## 🛠️ Extending the Agent

### Adding New Commands

1. Add the command handler in `chat-interface.ts`:
```typescript
case '/mycommand':
  await this.handleMyCommand(args);
  break;
```

2. Implement the handler method:
```typescript
private async handleMyCommand(args: string[]) {
  // Your command logic
}
```

3. Add the agent method in `trading-agent.ts`:
```typescript
async myNewFeature() {
  // Implementation
}
```

### Adding New Events

Emit custom events from the trading agent:

```typescript
this.emit('myEvent', { data: 'value' });
```

Listen for events in your chat interface:

```typescript
agent.on('myEvent', (data) => {
  console.log('Event triggered:', data);
});
```

## 🐛 Troubleshooting

### Module Not Found Error

If you see `Cannot find module` errors:

1. Check your `tsconfig.json` uses `"moduleResolution": "Node"`
2. Ensure imports include proper extensions or paths
3. Run `npm install` to verify all dependencies

### CDP SDK Issues

If you encounter CDP SDK errors:

1. Verify your API credentials in `.env`
2. Check you're using the correct network (testnet vs mainnet)
3. Ensure your account has sufficient permissions

### TypeScript Errors

1. Run `npm run build` to check for type errors
2. Ensure all dependencies are installed
3. Check `tsconfig.json` configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Use Claude Code to implement your feature
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📚 Resources

- [Coinbase CDP SDK Documentation](https://docs.cdp.coinbase.com/)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [ElizaOS Framework](https://github.com/elizaos/eliza)

## ⚠️ Disclaimer

This is a development tool for testing and learning. Never use it with real funds without thorough testing. Cryptocurrency trading carries significant risk.

## 📄 License

MIT

---

**Happy Vibe Coding! 🎉** Use Claude Code to rapidly iterate and build amazing features into your trading agent!