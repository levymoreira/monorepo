require('dotenv').config({ path: '.env.local', quiet: true });

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Check if .env exists and load it
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const GROK_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

if (!GROK_API_KEY) {
  console.error('❌ Error: XAI_API_KEY or GROK_API_KEY environment variable is required');
  console.error('Please set your Grok API key in the .env file');
  process.exit(1);
}

// Model and search configuration options
const MODEL_OPTIONS = {
  1: { model: 'grok-code-fast-1', searchMode: 'on', name: 'grok-code-fast-1 with search ON' },
  2: { model: 'grok-4-0709', searchMode: 'on', name: 'grok-4-0709 with search ON' },
  3: { model: 'grok-3', searchMode: 'on', name: 'grok-3 with search ON' },
  4: { model: 'grok-code-fast-1', searchMode: 'auto', name: 'grok-code-fast-1 with search AUTO' },
  5: { model: 'grok-4-0709', searchMode: 'auto', name: 'grok-4-0709 with search AUTO' },
  6: { model: 'grok-3', searchMode: 'auto', name: 'grok-3 with search AUTO' }
};

// Calculate date 6 months ago for search filtering
function getSixMonthsAgoDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Load initial chat messages
function loadInitialChat() {
  try {
    const initialChatPath = path.join(__dirname, 'InitialChat.js');
    delete require.cache[require.resolve(initialChatPath)];
    const { messages } = require(initialChatPath);
    return messages || [];
  } catch (error) {
    console.error('⚠️  Warning: Could not load InitialChat.js, using fallback messages');
    return [
      {
        role: "system",
        content: "You are a helpful assistant that is helping the user create a engaging linkedin post."
      },
      {
        role: "user",
        content: "Look what's trending on linkedin this week and come up with 3 post ideas"
      }
    ];
  }
}

// Parse JSON from potentially mixed content
function extractJSON(text) {
  // Try multiple patterns to extract JSON
  const patterns = [
    /```json\s*([\s\S]*?)```/,  // JSON in code blocks
    /```\s*([\s\S]*?)```/,       // Generic code blocks
    /(\{[\s\S]*\})/              // Raw JSON object
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const jsonStr = match[1] || match[0];
        return JSON.parse(jsonStr.trim());
      } catch (e) {
        // Continue to next pattern
      }
    }
  }
  
  // Last attempt: try parsing the entire text
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    return null;
  }
}

// Display formatted LinkedIn post ideas
function displayFormattedResponse(jsonData) {
  console.log('\n📊 Structured Response:');
  console.log('========================\n');
  
  if (jsonData.shortIntroduction) {
    console.log('👋', jsonData.shortIntroduction, '\n');
  }
  
  if (jsonData.posts && Array.isArray(jsonData.posts)) {
    jsonData.posts.forEach((post, index) => {
      console.log(`📝 Post Idea ${index + 1}:`);
      console.log('━'.repeat(50));
      
      if (post.linkedInPostIdea?.text) {
        console.log('\n📄 Content:');
        console.log(post.linkedInPostIdea.text);
      }
      
      if (post.linkedInPostIdea?.imagePrompt) {
        console.log('\n🎨 Image Suggestion:');
        console.log(post.linkedInPostIdea.imagePrompt);
      }
      
      if (post.linkedInPostIdea?.firstComment) {
        console.log('\n💬 First Comment:');
        console.log(post.linkedInPostIdea.firstComment);
      }
      
      if (post.shortDescription) {
        console.log('\n📋 Description:', post.shortDescription);
      }
      
      console.log('\n');
    });
  }
}

// Make API call to Grok
async function callGrokAPI(messages, modelConfig, expectJSON = false) {
  const fromDate = getSixMonthsAgoDate();
  
  // Enhance messages if expecting JSON
  let enhancedMessages = [...messages];
  if (expectJSON && enhancedMessages.length > 0) {
    // Check if this is the initial request with the system prompt
    const systemMessage = enhancedMessages.find(m => m.role === 'system');
    if (systemMessage && systemMessage.content.includes('Response format')) {
      // Add stronger JSON enforcement
      enhancedMessages = enhancedMessages.map(msg => {
        if (msg.role === 'system') {
          return {
            ...msg,
            content: msg.content + '\n\nCRITICAL: Return ONLY the JSON object. No explanatory text, no markdown, just the raw JSON object starting with { and ending with }'
          };
        }
        return msg;
      });
    }
  }
  
  const payload = {
    model: modelConfig.model,
    messages: enhancedMessages,
    temperature: 0.7,
    max_tokens: 4000
  };

  // Add search parameters based on mode
  if (modelConfig.searchMode === 'on') {
    payload.search_parameters = {
      mode: 'on',
      from_date: fromDate,
      max_search_results: 10,
      return_citations: true
    };
  } else if (modelConfig.searchMode === 'auto') {
    payload.search_parameters = {
      mode: 'auto',
      from_date: fromDate,
      max_search_results: 10,
      return_citations: true
    };
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ API Error:', error.message);
    return null;
  }
}

// Display model selection menu
function displayModelOptions() {
  console.log('\n🚀 Grok Interactive Chat with Live Search');
  console.log('==========================================');
  console.log('\nChoose a model and search configuration:');
  console.log('1. grok-code-fast-1 with search_parameters mode ON');
  console.log('2. grok-4-0709 with search_parameters mode ON');
  console.log('3. grok-3 with search_parameters mode ON');
  console.log('4. grok-code-fast-1 with search_parameters mode AUTO');
  console.log('5. grok-4-0709 with search_parameters mode AUTO');
  console.log('6. grok-3 with search_parameters mode AUTO');
  console.log('\nPress Ctrl+C at any time to exit\n');
}

// Display citations if available
function displayCitations(citations) {
  if (!citations || citations.length === 0) {
    return;
  }

  console.log('\n📚 Citations:');
  console.log('=============');
  citations.forEach((citation, index) => {
    console.log(citation);
  });
}

// Main chat function
async function startChat(modelConfig, rl) {
  console.log(`\n✅ Starting chat with ${modelConfig.name}`);
  console.log(`🔍 Search date range: Last 6 months (from ${getSixMonthsAgoDate()})`);
  console.log('📝 Type your messages and press Enter. Press Ctrl+C to exit.\n');

  // Load initial conversation
  let messages = loadInitialChat();
  
  // Check if we expect JSON format for the initial response
  const expectJSON = messages[0]?.content?.includes('Response format');
  
  // Start timing the initial response
  const startTime = Date.now();
  console.log('🤖 Getting initial response...\n');
  
  const initialResponse = await callGrokAPI(messages, modelConfig, expectJSON);
  
  // Calculate and display response time
  const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱️  Response received in ${responseTime} seconds\n`);
  
  if (initialResponse && initialResponse.choices && initialResponse.choices[0]) {
    const aiMessage = initialResponse.choices[0].message.content;
    
    // Try to parse and display JSON if expected
    if (expectJSON) {
      const jsonData = extractJSON(aiMessage);
      if (jsonData) {
        displayFormattedResponse(jsonData);
        
        // Store the raw response for conversation history
        messages.push({
          role: 'assistant',
          content: JSON.stringify(jsonData, null, 2)
        });
      } else {
        // Fallback to showing raw response if JSON parsing fails
        console.log('🤖 Assistant:', aiMessage);
        messages.push({
          role: 'assistant',
          content: aiMessage
        });
      }
    } else {
      console.log('🤖 Assistant:', aiMessage);
      messages.push({
        role: 'assistant',
        content: aiMessage
      });
    }

    // Display citations if available
    if (initialResponse.citations) {
      displayCitations(initialResponse.citations);
    }
  } else {
    console.log('❌ Failed to get initial response from API');
    return;
  }

  // Start interactive loop
  console.log('\n💬 Chat started! Type your message:\n');
  
  const chatLoop = () => {
    rl.question('You: ', async (userInput) => {
      if (userInput.trim() === '') {
        chatLoop();
        return;
      }

      // Add user message to conversation
      messages.push({
        role: 'user',
        content: userInput.trim()
      });

      console.log('\n🤖 Assistant is thinking...\n');

      // Get AI response (for follow-up messages, don't expect JSON format)
      const response = await callGrokAPI(messages, modelConfig, false);
      
      if (response && response.choices && response.choices[0]) {
        const aiMessage = response.choices[0].message.content;
        
        // Check if this looks like JSON
        const jsonData = extractJSON(aiMessage);
        if (jsonData && jsonData.posts) {
          displayFormattedResponse(jsonData);
          messages.push({
            role: 'assistant',
            content: JSON.stringify(jsonData, null, 2)
          });
        } else {
          console.log('🤖 Assistant:', aiMessage);
          messages.push({
            role: 'assistant',
            content: aiMessage
          });
        }

        // Display citations if available
        if (response.citations) {
          displayCitations(response.citations);
        }
      } else {
        console.log('❌ Failed to get response from API');
      }

      console.log('\n💬 Continue chatting:\n');
      chatLoop();
    });
  };

  chatLoop();
}

// Main function
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Handle Ctrl+C gracefully
  rl.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye! Thanks for using Grok Interactive Chat!');
    process.exit(0);
  });

  displayModelOptions();

  const selectModel = () => {
    rl.question('Select option (1-6): ', (answer) => {
      const option = parseInt(answer);
      
      if (MODEL_OPTIONS[option]) {
        const modelConfig = MODEL_OPTIONS[option];
        startChat(modelConfig, rl);
      } else {
        console.log('❌ Invalid option. Please choose 1-6.');
        selectModel();
      }
    });
  };

  selectModel();
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Error: This script requires Node.js 18+ for fetch support');
  console.error('Please upgrade your Node.js version or install node-fetch');
  process.exit(1);
}

// Start the program
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});