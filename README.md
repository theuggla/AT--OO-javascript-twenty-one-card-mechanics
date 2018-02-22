# ma222jp-examination-2
Examination tillhörande Molly Arhammar Andersson, WP2016

Live version is at: https://travel-together-api.herokuapp.com/

To run the tests against the live version, pull down the postman test and environments file, and import them into a Postman program to run.  
Alternatively, run command line with Newman client with the command
```
newman run TravelTogetherAPI.postman_collection.json -e TravelTogetherEnv.postman_environment.json 
```

To run the tests against a local version, pull down the whole repo, run
```
npm start
```
and change the ROOT_URL variable in the the **TravelTogetherEnv.postman_environment.json** to **http://127.0.0.1:8443**

**How have you implemented the idea of HATEOAS in your API? Motivate your choices and how it support the idea of HATEOAS.**

**If your solution should implement multiple representations of the resources. How would you do it?**

**Motivate and defend your authentication solution? Why did you choose the one you did? Pros/Cons.**

**Explain how your web hook works.**

**Since this is your first own web API there are probably things you would solve in an other way looking back at this assignment.**

**Write your thoughts down.**

**Did you do something extra besides the fundamental requirements? Explain them.**
