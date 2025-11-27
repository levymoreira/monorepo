// Mock AI Service for Chat Implementation
// This will be replaced with actual AI service integration later

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  createdAt: Date;
}

export interface AIResponse {
  content: string;
  metadata?: {
    type?: string;
    actions?: string[];
    suggestions?: string[];
  };
}

// Mock responses for different scenarios
const MOCK_RESPONSES = [
  {
    content: "That's a great topic! I can help you expand on that idea. Have you considered adding some personal experience or statistics to make it more engaging?",
    metadata: {
      type: 'suggestion',
      actions: ['expand_content', 'add_statistics', 'personalize'],
      suggestions: ['Add a personal anecdote', 'Include relevant data', 'Ask an engaging question']
    }
  },
  {
    content: "I love the direction you're taking with this post! To make it even more impactful, you could try structuring it with bullet points or adding a call-to-action at the end.",
    metadata: {
      type: 'improvement',
      actions: ['restructure', 'add_cta', 'format_better'],
      suggestions: ['Use bullet points for clarity', 'Add a strong call-to-action', 'Include relevant hashtags']
    }
  },
  {
    content: "This content has great potential! Would you like me to help you optimize it for better engagement? I can suggest some hashtags or help you craft a compelling hook.",
    metadata: {
      type: 'optimization',
      actions: ['optimize_hashtags', 'improve_hook', 'increase_engagement'],
      suggestions: ['Add trending hashtags', 'Create a stronger opening', 'Include a question to spark discussion']
    }
  },
  {
    content: "Your post is looking good! For maximum reach, consider posting this during peak hours (9-10 AM or 3-4 PM on weekdays). Should I help you schedule it for the optimal time?",
    metadata: {
      type: 'scheduling',
      actions: ['optimize_timing', 'schedule_post', 'analyze_audience'],
      suggestions: ['Schedule for peak hours', 'Consider your audience timezone', 'Add engagement hooks']
    }
  },
  {
    content: "I notice this post could benefit from a more professional tone. Would you like me to help you refine the language while keeping your authentic voice?",
    metadata: {
      type: 'tone_adjustment',
      actions: ['refine_tone', 'maintain_authenticity', 'professional_polish'],
      suggestions: ['Adjust tone for professionalism', 'Keep your unique voice', 'Add industry-specific terms']
    }
  }
];

const FOLLOW_UP_RESPONSES = [
  "I see you're refining your post. That edit looks great! Consider adding a relevant emoji or two to make it more visually appealing.",
  "Nice changes! The flow is much better now. Have you thought about adding a question at the end to encourage comments?",
  "Your post is evolving nicely! To boost engagement, you might want to include a personal insight or lesson learned.",
  "Good progress! This version is more engaging. Consider adding 2-3 relevant hashtags to increase visibility.",
  "I love the direction this is going! The content feels more authentic now. Maybe add a call-to-action to drive engagement?"
];

const INITIAL_RESPONSES = {
  hasPublishedPosts: [
    "Hi there! 👋 I see you've created a new post. Based on your previous content, I can help you craft something engaging. What would you like to focus on today?",
    "Welcome back! 🎉 Ready to create another amazing post? I'm here to help you make it even better than your last ones. What's on your mind?",
    "Hey! Great to see you creating new content. I've learned from your previous posts - let's make this one shine! What topic are you exploring?"
  ],
  firstTime: [
    "Welcome to AutomaPost! 🎉 I'm excited to help you create your first post. Let's make it something special that resonates with your audience. What topic are you thinking about?",
    "Hi there! 👋 This is your first post - how exciting! I'm here to guide you through creating content that will make a great impression. What would you like to share?",
    "Welcome! 🌟 I'm your AI assistant, ready to help you craft an amazing first post. Let's start with something that shows your expertise. What's your area of focus?"
  ]
};

// Simulate AI processing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateAIResponse(params: {
  messages: ChatMessage[];
  userContent: string;
}): Promise<AIResponse> {
  // Simulate AI processing time (500-1500ms)
  await delay(500 + Math.random() * 1000);
  
  // Get a random response
  const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
  return MOCK_RESPONSES[randomIndex];
}

export async function generateInitialMessage(postId: string, userId: string, hasPublishedPosts: boolean, userName: string = 'there'): Promise<string> {
  // Simulate AI processing time
  await delay(300 + Math.random() * 500);
  
  const responses = hasPublishedPosts ? INITIAL_RESPONSES.hasPublishedPosts : INITIAL_RESPONSES.firstTime;
  const randomIndex = Math.floor(Math.random() * responses.length);
  
  return responses[randomIndex].replace('there', userName);
}

export async function generateFollowUpMessage(params: {
  postId: string;
  postContent: string;
  previousMessages: ChatMessage[];
}): Promise<AIResponse> {
  // Simulate AI processing time
  await delay(800 + Math.random() * 1200);
  
  // Get a random follow-up response
  const randomIndex = Math.floor(Math.random() * FOLLOW_UP_RESPONSES.length);
  
  return {
    content: FOLLOW_UP_RESPONSES[randomIndex],
    metadata: {
      type: 'follow_up',
      actions: ['continue_editing', 'review_content', 'optimize_further'],
      suggestions: ['Keep refining', 'Review for clarity', 'Optimize for engagement']
    }
  };
}