# BackEnd

Rules
For running this code make sure to run this before: docker network create my_shared_net

- Use `docker compose up --build` to build the docker container
- Use the format given in the commitformat.txt while committing your code.
- Replace the x in above mentioned file with your JIRA ticket number to associate commits with JIRA issue/tasks
- Backend port is 3001 for this project

1. Signup + Login logic

- Redirect all the signup api calls to localhost:6000/api/auth/signup with JSON body of name, email and password
  - Returns 201 if user created successfully
  - Returns 400 if user is already created
  - Returns 500 if error occured
- Redirect all the login api calls to localhost:6000/api/auth/login with JSON body of email and password
  - Returns 400 if credentials are wrong
  - Returns 500 if error occured
  - Returns 200 if succesfully logged in and returns user id and JWT token.
- Use authMiddleware.js on all the routes for keeping all the routes protected.
  - send Authorization header like this or through api call => curl -X GET http://localhost:5000/api/protected/dashboard -H "Authorization: Bearer your_generated_jwt_token"
