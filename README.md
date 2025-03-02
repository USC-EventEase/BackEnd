# BackEnd

Rules to follow while running and commiting the code:

- For running the docker container use this command: docker compose up --build
- Use the commitformat.txt file for committing.
- Replace the x in commitformat.txt with the ticket number on jira to link your commits to that ticket.

1. Signup + Login logic

All passwords are hashed and stored in the DB, keeping it secure.

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
