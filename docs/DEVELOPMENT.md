# Development Guide
This document provides step-by-step instructions for cloning and running the project in your local environment.

### [Clone and install dependencies](#clone-and-install-dependencies)
### [Enironmental variables](#enironmental-variable)
### [Gmail setup](#gmail-setup)
### [AWS setup](#aws-setup)
### [MongoDB Atlas setup](#mongodb-atlas-setup)

## Clone and install dependencies
Execute the following commands sequentially to clone the project and install all its dependencies:
```sh
git clone https://github.com/TeamShiksha/logoexecutive.git
cd logoexecutive-backend
yarn install
```

## Enironmental variable
The repository currently comprises three environments. Please create the environment file based on the specific environment you are operating.
| Environment   | Environmental File     | Run Command        |
|---------------|------------------------|--------------------|
| Production    | .env                   | npm start          |
| Development   | .env.development       | npm run dev          |
| Test          | .env.test              | npm run test       |

Duplicate the `.env_example` file into your environment variable file.

Substitute the right-hand value of each environment variable with the corresponding value (you can obtain these values by following the next step in the documentation).

## Gmail setup
- Establish a Gmail account if you don't already have one.
- Log in to your Gmail account and choose "Manage your Google Account".
- Head to the Security tab on the left panel.
- Enable 2-step verification if it's not already activated.
- Scroll down to the App passwords section and generate a new app password.
- Securely store this generated password in a safe location for use.

## AWS setup
- Follow the guide given [here](./guides/CLOUDFORMATION.md) for setting up AWS.

## MongoDB Atlas setup
1. **Create a MongoDB Atlas Account**:
    - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.

2. **Create a Cluster**:
    - Once logged in, click on `Create a Cluster`.
    - Choose the free tier `M0` and configure your cluster as needed.
    - Click `Create Deployment`. This may take a few minutes.

3. **Create a Database User**:
    - In your cluster view, go to the `Database Access` tab.
    - Click `+ Add New Database User`.
    - Create a new user with the appropriate roles and a strong password.

4. **Configure Network Access**:
    - Go to the `Network Access` tab.
    - Click `+ Add IP Address`.
    - Add your IP address or allow access from anywhere (`0.0.0.0/0`), though this is not recommended for production.

5. **Get the Connection String**:
    - In your cluster view, click `Connect`.
    - Select driver as Node.js and version as 5.5 or later
    - Copy the connection string. It should look something like this:
      ```
      mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
      ```

6. **Set Up Environment Variable**:
    - Create a `.env` file in the root of your project.
    - Add your MongoDB connection string to the `.env` file:
      ```env
      MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
      ```
6. **For testing purpose**:
    - We recommend having two seperate clusters i.e. one for dev and another for testing
    - However it's upto the user to decide
    - For a separate cluster, create the cluster as described before and copy its connection string and add it to the '.env' file
      ```env
      TEST_MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
      ```

## All set! 
In a new terminal, execute the following command to initiate the development environment.
```sh
yarn dev
```
