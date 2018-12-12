# Introduction
These instructions are to run the app on a Digital Ocean remote server through HTTPS, with a reversed proxy in front, using PM2 as the process manager.

# Before starting
## Code
Before pushing the code to production, make sure the code is production ready in the following ways:
* Do not use session storage
* Set up two different config-files for development and production
* Make sure there are no known security issues in the npm-packages used
* Set express to use trust proxy
* Remove references to console.log
* Pipe error messages to somewhere convenient for you
* Make sure to catch all exceptions
* Listen for SIGNIT to gracefully wrap up activities

## Digital Ocean
* Create an account on [Digital Ocean](https://www.digitalocean.com/)
   * Set up a droplet server on that account, following the instructions on Digital Ocean after your signup. You'll want a server ith nodejs and mongoDB, or install that yourself later.
* Configure your account on Github to associate the IP-address for this remote server with the app you've made, by going into your account > settings > OAuth applications.

# Backend setup

## Git-based deployment
* Setup a git remote to push the existing code to this server as well as Github, by following the unstructions [here](https://www.digitalocean.com/community/tutorials/how-to-set-up-automatic-deployment-with-git-with-a-vps). In short what you'll want to do is:
  1. Init a bare Git repository to push to on the server
  2. Set up a post-receive hook in the hooks-folder to copy all of the files that gets pushed to that repo to the site's app-folder, from which we will run them
  3. Push up the files.

## Install dependencies
Depending on what server you choose to create at Digital Ocean, this might already be done. Otherwise install through the OS running on your server. You might have to look up additional documentation to do this. Install on the server:
* nodejs
* mongodb

## Setup a database
### mlab
* Create an account on [mlab](https://mlab.com/).
* Create a database and a user for that database, following the instructions on mlab.
* Take that database link and link it in in the config-file of the server.

## Setup environment
* install dependencies by running 
`npm install --production`

## Setup process manager
* Install PM2 globally by running `npm install pm2 -g`
* Run PM2 with cluster support, even if the server only have 1 CPU to allow for scaling
   * `pm2 start server.js -1 0` or substitute server js. for the starting point of your server.
* set environment variables locally on the server by using the export-command
```
env export NODE_ENV=production
env export CLIENT_ID=[the client id you got from github]
env export CLIENT_SECRET=[the client sevret you got from github]
env export WEBHK_SECRET=[yout webhook secret]
env export ADMIN_USERNAME=[your mlab user-username]
env export ADMIN_PASS=[your mlab user-password]
env export COOKIE_SECRET=[your cookie secret]
```
* Configure PM2 to start running on upstart of the OS to ensure that the app keeps running even if the server reboots. Save the state of the app and the environment to the upstart-file, to ensure the environment variables stay the same on reboot.
   * `pm2 startup`
   * `pm2 save`
* [See PM2:s documentation for further hints](http://pm2.keymetrics.io/docs/usage/startup/)

# Client setup
* browserify the client-side Javascript-files to the static folder by running 
`browserify -t browserify-handlebars client/js/source/app.js -o public/javascript/bundle.js`

# Proxy setup
## Nginx
Setup a reverse proxy to handle the static files and the https against the client. [This](https://gist.github.com/thajo/d5db8e679c1237dfdb76) is a good gist to use, that'll have to be customized to use the paths you are using. You will want to add http redirection by adding this ore something like it to the top of the file:
```
server {
	listen 80;
	server_name localhost;
	return 301 https://$host$request_uri;
}
```
[This](https://www.bjornjohansen.no/redirect-to-https-with-nginx) is a good place to start reading if you don't want to use the gist or just want to modify it to better suit you.

What you'll want to do is:

### HTTPS
1. Create self signed certificate in anyway you like. If you have a domain-name you could use [letsencrypt](https://letsencrypt.org/). Otherwise use the generate-ssl script that you'll find in the dev-scripts folder.
   1. [Optional] Change the script to use the name of the starting-point of your server instead of server.js.
   2. [Optional] Change the script to store the certificates somewhere else by changing the paths provided.
   3. Make the script executable by running:
   `chmod +x ./dev-scripts/generate.ssl.sh`
   or substitute the path of your file.
   4. Run the script by running
   `./dev-scripts/generate.ssl.sh`
   or substitute the path of your file.
2. Change the default file in /etc/nginx/sites-available
  * Set up to listen on port 80
      * Redirect to https
  * Set up to listen on port 443
  * Set up ssl, link in certificate by using the path where your certificates are being stored.

### Compression
* Change the default file in /etc/nginx/sites-available
   * Set up gzip-compression

### Static files
* Change the default file in /etc/nginx/sites-available
   * Set up path to serve static files and what files to serve
