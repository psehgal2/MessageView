Website functionality:
When the website is loaded, all unread messages are called from the server and populated. Each message includes the sender name, the platform icon, and up to 50 characters of one of the messages with the sender on that platform.
Moreover, the supported platforms are retrieved. They are displayed when the sort by button is clicked. The user can select different platforms via the dropdown and the corresponding chats will populate on the screen. When no platforms are selected, all the unread messages are displayed again. 
Selecting one chat takes the user to the messages view, where it displays the sender, platform, user’s own messages (on the right), sender’s messages (on the left). All of this was pulled from the server. Then, the user can send a message, and it displays it on the page and updates the server. The user’s new message will now always show any time the chat is clicked. Selecting the back to message view takes the user back to the main page with all of the chats (notice that the state will be exactly as the user left it -> if certain platforms were selected, they would still be selected).
Since this message was clicked on, it is now read, and it is removed from the unread messages section and added to the read messages section which can be accessed via the read messages button on the left hand side. This is also stored in the local storage so that the read and unread messages list stays the same regardless of whether the browser is closed. Clicking the read messages button displays all of the read messages. Clicking on the message displays the chat with that person (with the message you sent too!). Selecting back to message view takes the user back to the unread messages page. On the unread messages page, if a message has been marked as read, it will not populate on the unread messages page (even if it is selected in the dropdown). 
There is a contact us page, in which users can submit the form, and it populates all the information on the server. Since all the fields are required, if the user tries to submit without filling out a section, it displays an error. Otherwise, it displays that the form has been submitted. 
Selecting the q and a button takes users to the page with questions and answers. All the information is fetched from the server. The back to message view takes the user back to the main page. 
There is appropriate error handling for all the sections (a message popups on the page with the error)

Required:
“main view” -> All message chats page
“single view” -> All messages for each chat page
“customer service view” -> Contact us page
“filter” -> Sort by button
“cart” -> Used local storage to store messages as “read” after messages have been clicked on
“google font imported”

Chosen Features:
1.	Gets the supported platforms and populates when the sort by button is clicked
2.	User can send a message. Program updates the server and on the page
3.	Q and A form (gets q and a information from the server)
4.	Implemented separate read and unread messages pages


