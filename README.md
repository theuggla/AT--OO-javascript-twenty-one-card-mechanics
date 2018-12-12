Exercise in building an application using a microservice architecture.

The application is supposed to work as a notification hub and dashboard for a user's github organizations. In the application the user is able to list and select his/her organizations as well as receive notifications, for example, the latest releases, latest commits etc. for repos in the selected organization.

The application is able to notify the user about certain events that occur in the various organizations even if the user is not running the application. This is solved using browser notifications. The user is inside of the application be able to configure which organizations events will be sent as notifications in this way.

The client is live at: https://shiny-github-dash.herokuapp.com/

To recieve offline notifications you will have to allow notifications from the site as well activate them when logged in. If you are the first user on your computer, the site will ask you to allow notifications when you activate. If another user of the site on the same computer has previously disallowed notifications, you will have to change the notification settings on the site by clocking the padlock to the left of the url and allowing notifications.

The application is availiable for adding to your homescreen on an android phone, and will then push notifications to your phone as well.
