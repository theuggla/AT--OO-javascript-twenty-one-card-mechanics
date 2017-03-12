#Introduction
The app is being run on a Digital Ocean remote server through HTTPS, with a reversed proxy in front, using PM2 as the process manager.

#Before starting
##Code
Before pushing the code to production, make sure the code is production ready in the following ways:
* Do not use session storage
* Set up two different config-files for development and production
* Make sure there are no known security issues in the npm-packages used
* Set express to use trust proxy
* Remove references to console.log
* Pipe error messages somewhere
* Make sure to catch exceptions
* Listen for SIGNIT to gracefully wrap up activities

##Digital Ocean
* Create an account with a remote server running on Digital Ocean
* Configure account on Github to associate the IP-address for this remote server with the app

#Backend setup

##Git-based deployment
* Setup a git remote to push the existing code to this server as well as Github
  1. Init a bare Git repository to push to on the server
  2. Set up a post-receive hook in the hooks-folder to copy all of the files that gets pushed to the site's app-folder, from which we will run them

##Install dependencies
Install on the server:
* nodejs
* mongodb

##Setup a database
###mlab
* Make an account on mlab.
* Create a database and a user for that database.
* Link the database in in the config-file of the server.

##Setup environment
* npm install production dependencies
* set the node environment to production
* set environment variables locally on the server by using the export-command

##Setup process manager
* Install PM2
* Configure pm2 to start running on upstart of the OS to ensure that the app keeps running even if the server reboots
* Run PM2 with cluster support, even if the server only have 1 CPU to allow for scaling
* Save the state of the app and the environment to the upstart-file, to ensure the environment variables stay the same on reboot

#Client setup
* browserify the client-side Javascript-files to the static folder

#Proxy setup
##Nginx
Setup a reverse proxy to handle the static files and the https against the client.
###HTTPS
1. Create self signed certificate
2. Change the default file in /etc/nginx/sites-available
  * Set up to listen on port 80
      * Redirect to https
  * Set up to listen on port 443
  * Set up ssl, link in certificate
###Compression
* Change the default file in /etc/nginx/sites-available
   * Set up gzip-compression
###Static files
*. Change the default file in /etc/nginx/sites-available
   * Set up path to serve static files and what files to serve