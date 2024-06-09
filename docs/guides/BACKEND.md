# Backend Project Structure

## Overview
The backend app contains several folder. These folders are mentioned below with their roles

```
.
├── assets
├── controllers
│   └── auth
├── docs
├── middlewares
├── models
├── routes
├── services
├── __tests__
│   └── unit
│       ├── controllers
│       │   └── auth
│       ├── middlewares
│       └── utils
│           └── scripts
└── utils
    ├── mocks
    └── scripts
```

## Folder structure summary
1. `assets/` - Assets directory contains the image assets once the image is dropped in this folder a record will be created in the firebase collection.
2. `controllers/` - Controllers directory, contains controllers. Controllers are functions that runs when the user hits an endpoint. This function receives a request and response object. Controllers in our app are express middlewares.
3. `docs/` - Contains file with README and setup guide.
4. `models/` - `models`, not to be confused with models provided by ORMs, are classes that are used for the following things
- Model the db collection
- Providing an interface to process firestore data in the collection
5. `middlewares/` - Middlewares are functions that intercepts the request to process some data.
6. `routes/` - Routes contain the routes for the application, they contain different directories based on different route groups.
7. `services/` - This directory contains functions which are responsible for fetching or storing data in firestore.
8. `utils/` - Utils contian reusable code which cannot be categorized into directories.
9. `__tests__` - Contains unit tests for the applcation.
