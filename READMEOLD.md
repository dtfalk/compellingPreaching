This code was written by David Falk, a staff member at the APEX Lab at the University of Chicago.
===============================================================================================
===============================================================================================
Required packages:
fs (filesystem), 
fsp (filesystem.promises), 
Node.js, 
path (e.g. require('path')), 
express (as in node.js express), 
npm (this is a node thing). Please give me the ability to install npm and use "npm install" 
    for whatever packages I need to install, 
Please also give me access to upload video and audio folders to the server (~50 GB)

Notes: Please let me know if this list is not descriptive enough. I can provide more details
upon request. If you need more information, then please feel free to contact me anytime
via my email (dtfalk@uchicago.edu) or my phone number (413-884-2553). Feel free to either
text or call. Please text first as it is likely that I will think that your number is spam
if you do not send me a text before you call to identify yourself. 
I cannot promise an immediate response, but you will not ever bug me if you text, call or email 
me at any hour of the day. Feel free to contact me, and never feel bad about the time of day that
you decide to do it at.
===============================================================================================
===============================================================================================
Description: This is code for an online psychology experiment in which the user will be shown
homilies and asked questions about the homilies they are shown. There are two versions of the 
experiment: one is for preachers to review other preachers' homilies and the other is for 
"laymen" to review homilies and answer  questions about those homilies. 

Code Structure: I have decided to write this code in java script for both server-side and client-side
operations. The client-side code is pure javascript, html, and css. The server-side code is java script
using the Node.js package. This code is complete with middleware and various bug testing to prevent a server failure. Please let me know if you spot any vulnerabilites or code issues. I am learning as I 
go and I will never take offense to suggestions (no promise that I will implement the suggestions, but
suggestions are always appreciated and it will never bug me to be given suggestions).

The code is broken up into various folders. The "public" folder is where I am serving video/audio content
and the HTML files that the user will have access to. These files are served statically. The "data" folder
is where user data is stored to upon completion of questionnaires and other saveable data. This folder has subfolders for expert and laymen data and various templates for user progress data (e.g. "usedHomilies.json"). The "routes" folder contains a file that acts as middle-ware so that the user can retrieve data
on the server and post questionnaire results and homily usage data to the server in the proper folder.
The "utilities" folder contains helper functions that the file in the "routes" folder call upon. These 
two folders work in tandem to act as middle-ware for the server. The "other" folder contains other bits
and pieces of data such as how to convert between homily numbers and the original names of the homilies.
That information is mostly for the experimenters in the lab. Finally there is this README, the json packages and the app.js file. The app.js file is sort of like the initializer for the server and the required packages ought be installed so that I can run this file so that we can give the resulting link
to potential subjects. It is currently set to be a local host, but I will update the host and see what it
takes to implement an https encryption once I get access to a formal server.
===============================================================================================
===============================================================================================
Once again, please reach out with any questions comments or concerns.
Email: dtfalk@uchicago.edu
Phone (for calls and for texts): 413-884-2553

All the best,
David Falk

