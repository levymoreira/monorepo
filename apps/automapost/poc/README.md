# Grok Interactive Chat with Live Search

A Node.js terminal-based interactive chat application using the Grok API with live-search functionality.

## Features

- ✅ Interactive terminal chat interface
- ✅ 6 different model and search configurations:
  - `grok-code-fast-1`, `grok-4-0709`, `grok-3`
  - Search modes: `on` (always search) or `auto` (search when needed)
- ✅ Live-search with real-time web data (last 6 months)
- ✅ Citation display for search results
- ✅ Loads initial conversation from `InitialChat.js`
- ✅ Graceful exit with Ctrl+C
- ✅ Comprehensive error handling

## Setup

1. **Install dependencies:**
   ```bash
   yarn add dotenv
   ```

2. **Set up API key:**
   Add your Grok API key to `.env` file:
   ```env
   XAI_API_KEY=your_grok_api_key_here
   # OR
   GROK_API_KEY=your_grok_api_key_here
   ```

3. **Requirements:**
   - Node.js 18+ (for native fetch support)
   - Grok API key from X.AI

## Usage

Run the interactive chat:
```bash
node poc/grok.js
```

### Model Selection

Choose from 6 options:
1. **grok-code-fast-1 with search ON** - Fast coding model with always-on search
2. **grok-4-0709 with search ON** - Advanced model with always-on search
3. **grok-3 with search ON** - Standard model with always-on search
4. **grok-code-fast-1 with search AUTO** - Fast coding model with automatic search
5. **grok-4-0709 with search AUTO** - Advanced model with automatic search
6. **grok-3 with search AUTO** - Standard model with automatic search

### Chat Features

- **Initial conversation**: Automatically loads from `InitialChat.js`
- **Live search**: Uses web data from the last 6 months
- **Citations**: Shows sources for search-based responses
- **Continuous chat**: Keep chatting until you press Ctrl+C
- **Real-time responses**: Streaming responses from Grok API

### Search Configuration

All requests include:
- `return_citations: true` - Get source citations
- `from_date: [6 months ago]` - Limit search data to recent results
- Search mode based on your selection:
  - `on`: Always perform web search
  - `auto`: Search automatically when needed

## Files

- **`grok.js`** - Main interactive chat application
- **`InitialChat.js`** - Initial conversation messages
- **`test-grok.js`** - Test script to verify setup
- **`README.md`** - This documentation

## Example Session

```bash
$ node poc/grok.js

🚀 Grok Interactive Chat with Live Search
==========================================

Choose a model and search configuration:
1. grok-code-fast-1 with search_parameters mode ON
2. grok-4-0709 with search_parameters mode ON
3. grok-3 with search_parameters mode ON
4. grok-code-fast-1 with search_parameters mode AUTO
5. grok-4-0709 with search_parameters mode AUTO
6. grok-3 with search_parameters mode AUTO

Press Ctrl+C at any time to exit

Select option (1-6): 2

✅ Starting chat with grok-4-0709 with search ON
🔍 Search date range: Last 6 months (from 2025-03-05)
📝 Type your messages and press Enter. Press Ctrl+C to exit.

🤖 Getting initial response...

🤖 Assistant: [Response with trending LinkedIn post ideas...]

📚 Citations:
=============
1. LinkedIn Business Blog
   URL: https://business.linkedin.com/...
   Snippet: Recent trends in professional content...

💬 Chat started! Type your message:

You: Can you help me create a post about AI trends?
```

## Error Handling

- **Missing API key**: Clear error message and instructions
- **API errors**: Detailed error messages with status codes
- **Network issues**: Graceful handling with retry suggestions
- **Invalid responses**: Fallback error handling

## Troubleshooting

1. **"XAI_API_KEY environment variable is required"**
   - Add your API key to the `.env` file

2. **"This script requires Node.js 18+ for fetch support"**
   - Upgrade Node.js to version 18 or higher

3. **API connection issues**
   - Check your internet connection
   - Verify your API key is correct
   - Check Grok API status

4. **InitialChat.js not found**
   - The script will use fallback messages if the file is missing