# ma222jp-examination-2
Examination tillhörande Molly Arhammar Andersson, WP2016

Live version is at: https://travel-together-api.herokuapp.com/

To run the tests against the live version, pull down the postman test and environments file, and import them into a Postman program to run.  
Alternatively, run command line with Newman client with the command
´´´
newman run TravelTogetherAPI.postman_collection.json -e TravelTogetherEnv.postman_environment.json 
´´´

To run the tests against a local version, pull down the whole repo, run
´´´
npm start
´´´
and change the ROOT_URL variable in the the **TravelTogetherEnv.postman_environment.json** to **http://127.0.0.1:8443**
