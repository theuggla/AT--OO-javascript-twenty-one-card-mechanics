An exercise in building a REST-api in nodejs relying on HATEOAS priciples. 

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

## Thoughts

### HATEOAS
I've focused on two parts of HATEOAS: firstly, the idea of hypermedia as a _state_ driving thing. To support this I have tried to supply related links that changes depending on where you are in the application at the moment - if you request the root without authentication, you get a suggestion of navigationg to /authenticate, whereas if you request the root with authentication, or if you POST to /authenticate, you get suggested the link to your own user profile. To support the idea of having _state_ in the hypermedia, I have also tried to implement the Hydra _operation_ syntax, to return a súggestion of what HTTP methods can be used on a certain URL, as well as what attributes the application is expecting in the body of the request if those mmethods are used, and what attributes are optional. 

Suggestions for improvements is to be clearer about what kind of actions the different methods are taking on the API. I return different method-suggestions depending on authorization level and what you are allowed to do. I wanted to do this, especially with the methods, to especially focus on the HATEOAS principle that you can use hypermedia to _communicate_ with the user, not just about navigation, but about interaction as well.


The second part of HATEOAS is hypermedia and Linked documents in general, not specifically as an engine of the application state. I have tried to use JsonLD for this, and supply relevant links to relevant documents at different parts of the application: the user have links to trips they are a passenger of and a driver of, the /users collection have links to all the different users, the trips have links to its driver and its passengers, and so on.

I've also used schema.org to try and reference the different types of attributes I am using for my resources, to take a stab at the semantic-web-thing. 

### Improvements regarding supplying multiple representations of resources
To support this it would be possible to add sub-categories with different representations of the same resource under the resource directory, and navigate which one to use depending on the content-type negotioation. This would make it so that nothing else of the code had to be changed, only the resource directory. That's why I tried to keep all the resource representations in one place and separate from the database calls, although I am repeating myself tremendously in every resource as it is, with the contexts and everything. I'm sure it could have been done much much cleaner and better. But I do feel confident that I could have added another resource representation without disrupting the whole ecosystem of my code.

### Authentication
I have chosen to use token based authentication with a JWT that references the user by reference (an ID) and gets translated to a by value-token when it enters into the system. I do not save state on the server, baing a REST api. I use a public and a private PEM-encoded key to sign and verify the JWT. Pros is that the sign in and the handling becomes very easy - you supply your username and password in a POST-request, get a JWT back, and then use that in the authentication header for other requests. Since the api runs over HTTPs, the initial information exchange is not insecure, and the whole system is very light-weight. 

Cons are that if you wanted to set up ore than one client application talking to the system it becomes quite cumbersome - a user would have to lend their account to represent all the applications that user were making. There is, as of now, also no way of revoking JWT-tokens. If you wanted to do that there would have to be some sort of blacklist. You also have to sign up for the api as a user to use it, and at this point there is no way of signing up. 

It would be nice to integrate the API with an oauth server to have the users not having to sign up for the API specifically, or possibly to implement the api as an oauth server. On the other hand, the backside of that is that it becomes significantly harder for the individual user to use the api, since you would have to register your application and do a lot of back and forth with it befor being able to use it, and you would still have to make your account to tie the application to. The pros of having an external oauth server do the authentication for you is that you don't have to handle any of the users-in-the-database problems, but on the other hand you involve an external server that this api doesnt have anything to do with - I don't want to access the users facebook or github account in my API, for example. 

I chose the JWT-token based way because it was a lightwaight enough middle rooad, that doesn't give away any information out to the user - (just the reference id) - and still comes with a lot of the security benefits, when it's being done over HTTPS and with pem-encoded keys. If the API were to go into production there would of course still have to be a way to register a client application to recieve the public part of the key so that you can verify the JWTs being sent from the API: as it is not, both the public and the private key just resides on the server.

### Web Hook
The web hook is registred by posting a callbackURL in the body of a POST request to /plannedtrips/webhook. The webhook is then called every time someone adds a trip, with the information about the trip in the body of the call as JSON. As of now the event that the webhook gets registred on is automatically the "AddTrip"-event, but the system is built so that other events could easily be added and supplied when someone registers the webhook.

### General improvement suggestions
On the server, it would be nice to do some sort of cache-control through headers, as well as more of the semantic web and hydra. Security could be improved with an API-key.

Cetralized error handling could be handled better through restify. It is also very possible to be more consistent with the way the server is retruning JSON-LD and the way the resources are formed, Sometimes when referencing a collection from anther document it points to a collection-resource and sometimes it returns links to all the individual resources in the collection instead. 

It would also be nice to do more fine-grained cors-control, as it is now the server allows everything, basically. Regarding resources validation should be handled better and links should be returned to newly created resources more consistently, when they are created,  Additionaly look into pagination of collection resources, as it is now the system isn't very stable if it should grow and become big.

### Other thoughts
I tried to learn restify instead of express, and enjoyed the experience. I've very much tried to return the correct Error-codes for everything. As mentioned, I used schema.org to try and reference the different types of attributes I am using for my resources, to take a stab at the semantic-web-thing. I've done multiple levels of authentication and authorization in relation to the resources - some of them you can see when you are unauthenticated, some of them you get a different version whether you are authorized (for example, if you are the user you are looking at) or just authenticated (you can see some information about other users if you are authenticated, but not all, and if you are not authenticated you can't see anything). I return different method-suggestions depending on authorization level. I've implemented the options-method for all of my routes as well, and it returns different options depending on your authentication and authorization level.
