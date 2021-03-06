# jexia-simple-angular-chat
[![Code Climate](https://codeclimate.com/repos/56fba4a14286184f73002343/badges/23e34f957cb815e7b65d/gpa.svg)](https://codeclimate.com/repos/56fba4a14286184f73002343/feed)

A simple chat example using Jexia.

NOTE: This is an ongoing project and it will be updated in the next few days.
In the next version we gone use the upcoming Jexia SDK for better authentication and less, less code ;)

## Demo
You can see a working example here: http://jexia.pixelnet.gr/chat

## Get it ready
To use this project you should have a Jexia account. You can get one for free at www.jexia.com

## Make it play
1. Login to Jexia.com
2. Create a Data App
3. Create two (2) Data Sets (users & feed)
4. Add two (2) fields (name & msg) with type 'string' to Data Set 'feed'
5. Add two (2) fields (username & loggedIn) with types 'string' and 'boolean' to Data Set 'users'

## Install
1. Clone Repo (Well a fork is always nicer)
2. ```cd jexia-simple-angular-chat```
3. ```npm install```
4. ```bower install```
5. Edit file ```js/config.js``` with your Jexia credentials
6. ```grunt run```

Project should run on ```http://localhost:8000```

## CONTRIBUTING

Fork the repository and clone it locally.
Create a branch for your edits.
When finished create a Pull Request
Tip: Connect your local to the original ‘upstream’ repository by adding it as a remote. Pull in changes from ‘upstream’ often so that you stay up to date so that when you submit your pull request, merge conflicts will be less likely.
