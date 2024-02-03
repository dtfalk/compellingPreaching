NOTE: you may need to change the port number in the app.js server.
=================================
CompellingPreaching Project Setup
=================================

This README provides instructions on how to set up and run the CompellingPreaching experiment. Please follow the steps below.

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
Prerequisites:

Before proceeding, ensure you have the following applications installed:

Node.js and npm (Node Package Manager): Download and install Node.js (which includes npm) from the official Node.js website (https://nodejs.org/en/download) or from the command line using the instructions below (hopefully these work I have only tested on Windows but I know that your servers are linux):

For Ubuntu/Debian-based Linux Distributions:
You can use the NodeSource repository to install Node.js. This allows you to choose between different versions of Node.js. For example, to install Node.js version 14.x, you can use the following commands (v20.10.0 is what I am using):
===================================================
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
(Note: Replace 14.x with your desired version.[20.10.0 is what I am using])
======================================================================


For CentOS/RHEL-based Linux Distributions:
Similar to Debian-based distributions, you can use the NodeSource repository. For example, to install Node.js version 14.x, you can run:
=======================================================================
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs
(Again, replace 14.x with your desired version. [20.10.0 is what I am using])
=======================================================================


-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
Code and Dependency Installation Steps:

1. Clone the Repository
Clone the CompellingPreaching project repository to your local machine using Git. Open your terminal, navigate to the directory where you want to clone the repository, and run:
========================================================
git clone https://github.com/dtfalk/compellingPreaching
(or potentially: "https://github.com/dtfalk/compellingPreaching.git")
(try the first one first)
========================================================

2. Navigate to the Project Directory
Change into the project directory:
========================================================
cd compellingpreaching
(or whatever cd commands get you to ../../../compellingPreaching)
========================================================


3. Install Node Dependencies
Within the project directory, install the necessary Node.js dependencies specified in the package.json file:
========================================================================
npm install
(This command installs all the required packages to run the CompellingPreaching application according to the package.json file. If I missed a dependency, then you can likely use "npm install missing_dependency_name" to install the missing dependency)
========================================================================


-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
Setting Up Media Files:
The application serves audio and video files from specific directories within the project. Here's how to set them up:

You will be able to find the audio and video files that should be uploaded to the server in the following locations:
INSERT LOCATION TO FIND THE AUDIO AND VIDEO FILES HERE

You will need to drop the two stimuli folders (audioFiles and videoFiles) into the "stimuli" folder on the server. The location to drop these files/folders is "compellingPreaching/public/stimuli".

Audio Files:
Place the audioFiles folder in the public/stimuli directory. In this audioFiles folder there should be a couple of subfolders. As it stands, there are four subfolders in the audioFiles folder: one that contains all of the audio files, one that contains all of the "strong" audio files, one that contains all of the "weak" audio files, and a folder containing the audio files that we are actually going to distribute to the experimental subjects ("servingFiles" is the name of this folder). The reason for this setup is that this experiment will change over time and we are only using a subset of our audio files for the time being, but that may need to be changed later. Once we settle on a location for the audioFiles (location above), all you need to do is transfer the audioFiles folder to the CompellingPreaching/public/stimuli directory.

Video Files:
Symmetrically, video files (coming from the videoFiles folder at the location described above) should be placed in the compellingPreaching/public/stimuli directory according to the "Audio Files:" instructions above.

If the "compellingPreaching/public/stimuli" directory does not exist, then create it and put the files into the directory accordingly. The end result should be that there is a "compellingPreaching/public/stimuli/audioFiles" folder and a "compellingPreaching/public/stimuli/videoFiles" folder. The audio files will be mp3 and the video files will be mp4.

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
Configuring the server:
I have configured my code (as a result of needing to test the code on my own device) with a locally hosted node.js/node.express server. The uchicago servers use Apache to run their servers. In order to get this code working you will need to take a reverse-proxy mentality. You will need to run the node server on the server and then reroute the data to this local server once it reaches the uchicago server. So the user connects to the server with Apache (https), and then Apache reroutes the get/post requests to the locally hosted node server (http). I do not know how exactly to do this, but Eric Hoy was able to get this to work.

Writing Permissions in this server:
The code on the server is stored in the "server/compellingPreaching/public" folder. The data from the users is stored in the "server/data" folder. The "server/compellingPreaching/public" folder needs permission to write to the "server/data" folder. This should be the only permissions requirement, assuming that every folder is allowed to read from every other folder. 

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------

------------------------------------------------------------------------------------------

Running the Application:
With all dependencies installed and files in place, you're ready to run the application. Ensure you are in the project's root directory (/compellingPreaching), then start the server:

==========================================================================================

npm install pm2 -g

pm2 start /var/www/compellingPreaching/app.js --name="compellingPreaching"

pm2 startup

systemctl restart httpd

systemctl enable pm2-root

systemctl start pm2-root
(This command initiates the server by running "app.js")
==========================================================================================

-----------------------------------------------------------------------------
-----------------------------------------------------------------------------
Notes and Comments:

Hopefully this should work. Lord knows. I wish you luck. Please feel free to contact me at (413)-884-2553 [for text] or dtfalk@uchicago.edu [for email]. Either one works perfectly fine for me, but if you choose to contact me over text then please identify yourself so I know that you are not spam. 

- David Falk (APEX Lab/Nusbaum Lab at the University of Chicago)