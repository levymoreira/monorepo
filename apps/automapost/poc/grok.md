I want you to implement a nodejs terminal based iteractive chat using grok api and live-search (read https://docs.x.ai/docs/guides/live-search) functionality. 

1. The program should start when I run node poc/grok.js 
2. the program should consist of an infinite loop that only stops when I press ctrl c 
2. always pass the param "return_citations": true, and show after the response the citations
3. Set date range of the search data. You should restrict the date range of search data used by specifying 
"from_date" and setting it's value to the last 6 months.
4. The first thing after running the program it should ask me to choose between these 3 models and search configs:
Option 1 - grok-code-fast-1 with search_parameters mode on
Option 2 - grok-4-0709 with search_parameters mode on
Option 3 - grok-3 with search_parameters mode on
Option 4 - grok-code-fast-1 with search_parameters mode auto
Option 5 - grok-4-0709 with search_parameters mode auto
Option 6 - grok-3 with search_parameters mode auto
6. After the user type one of the options (1 to 6) the chat should start, the initial chat is already on InitalChat.js, read it from there and use it to start the convesation
7. wait until the user type something and press enter to submit then add that to the convesation and send back to the AI to get the next answer
8. then keep going in loop until the user types ctrl c to terminate 














