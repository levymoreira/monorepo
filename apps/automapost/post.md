You are working as a senior software engineer and ux designer for automapost.com. 
We are creating a platform that allows you to create and schedule posts across social media platforms.

You had created the frontend page /app/[locale]/(app)/portal/posts/edit/page.tsx where the user can create/schedule new posts;
Now we are working on creating the backend APIs and connecting it. 
This is the most important feature for the platform, we can't take shortcuts.

Database:
1- Update the backend adding a new table where we can store the posts.
   It must support the text of the post, the date it is scheduled to go live, a flag if it was posted and the timestamp of the posted date/time. 
   It must also support a First comment, so users can add the first comment to their post themselfs.
   The post must be linked to one OR more Auth_Provider (in the posts table we can save just ["linkedin"], and the [authProviderId] linking to the auth_providers.id), while creating posts the frontend must send this information (the id and the provider name). 
   The posts table also must support a flag isDraft to identify if this post is a draft.
2- Linked to the posts table we must have a post_chat table. on this table we are going to save the chat conversations between the user and the ai-assistant. On this table we need to save who send the message (user vs ai-assistant) the order in which they should be shown, and the date they were sent/updated. It must also support soft-delete.

APIs:
1- Create the APIs to save/edit and delete (soft delete) the posts and the chat messages.
Follow the restfull rules for the api naming and conventions.

Frontend:
1- The user will click on "new post" button, this should trigger a POST to /api/posts to create a new post, we will be sending the selected auth providers (based on the left sidebar the user can have "all channels" selected, which means it's a post to all their channels and we need to pass all auth providers listed, or they can have 1 provider selected, in which case we need to pass only that one).
2- The POST request will return an object with the basic post data and we must add the id to the url, like portal/posts/edit/<ID>, if the user refreshs the page we should be able to do a GET and load the same post again to the user. 
3- The user can close the page (clicking back button on top left) and we should show a message asking if they want to discard or save the changes. If they select discard and the post is new (we can have it as a flag on the client since we know it's a new post or not based on the flow), we delete (soft delete) the post; if the post is NOT new (they are editing an existing post) discart will just not save the new changes. 

the chat edit API needs the hability to delete and edit a message. the posts api also needs the hability to edit a post. implement them.
   
update the portal/posts page to show the list of posts, make sure it only loads the necessary data respecting the channel(s) selected and the filter (queue(sc), drea)