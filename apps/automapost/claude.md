# Claude Code Rules

Never delete database data, if you have to ask first.

## Project Information
- **Project**: AutomaPost: AI-Powered Scheduling and Posting Automation Tool
- **Description**: Automate content creation, scheduling, and analytics to grow your professional network effortlessly
- **Website**: automapost.com 
- **Framework**: NextJS, Tailwind CSS
- **Icons**: Lucide Icons

### Product Overview
AutomaPost is an AI-powered LinkedIn automation platform that helps professionals, marketing specialists, entrepreneurs, and business teams streamline their LinkedIn presence. The tool focuses on:

- **AI Content Generation**: Creates engaging text and images tailored to user's professional style
- **Smart Scheduling**: Optimizes posting times for maximum engagement  
- **Advanced Analytics**: Provides detailed performance metrics and insights
- **Team Collaboration**: Multi-user support for agencies and teams
- **Time Savings**: Up to 89% reduction in content creation time
- **Engagement Boost**: Reported 3x increase in LinkedIn engagement

### Target Users
- Professionals seeking to build their personal brand
- Marketing specialists managing multiple accounts
- Entrepreneurs and solo founders
- Business teams and agencies
- Anyone looking to maintain consistent, high-quality LinkedIn presence

## Development Guidelines
- Use semantic HTML5 structure
- Follow Tailwind CSS utility-first approach
- Maintain responsive design (mobile-first)
- Use Lucide icons for consistency
- Keep animations smooth with CSS transitions
- Follow existing color scheme and design patterns

## Commit and Push Instructions
When the user types only "commit":
1. Run `git status` and `git diff` to see all changes
2. Generate a concise, descriptive commit message based on the changes
3. Stage all relevant files with `git add .`
4. Create a commit using the generated message with the format:
   ```
   <type>: <description>
   
   🤖 Generated with Claude Code
   
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
5. Push the changes with `git push`
6. Confirm the commit and push were successful

## Code Style
- No unnecessary comments unless specifically requested
- Use consistent indentation (2 spaces)
- Keep line lengths reasonable
- Use meaningful class names and IDs to elements
- Maintain existing naming conventions

## Testing
- Always test responsive design on mobile and desktop
- Verify all interactive elements work properly
- Check accessibility features (focus states, ARIA labels)
- Validate HTML structure and CSS syntax


## Others
In this project we use yarn instead of npm.

Never delete anything from the database, and always ask the user before executing migrations/changes to the database.

If you need to verify anything in production the url is automapost.com

Aways kill the server before running "yarn dev", kill it with:
lsof -ti:3000 | xargs kill -9
and
ps aux | grep next-server | grep v15.2.4 | awk '{print $2}' | xargs kill -9

This project runs on bare metal server, with ubuntu.