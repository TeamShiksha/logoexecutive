# Development Guide
This document provides step-by-step instructions for cloning and running the project in your local environment.

### [Clone and install dependencies](#clone-and-install-dependencies)
### [Enironmental variables](#enironmental-variable)
### [Gmail setup](#gmail-setup)
### [AWS setup](#aws-setup)
### [Firebase setup](#firebase-setup)
### [Firebase emulator setup](#firebase-emulator-setup)

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

## Firebase setup
- Sign in to [firebase](https://firebase.google.com/)  using your Google account and go to the Firebase console.
- Select `Add Project`.
- Enter the `project name`.
- Analytics are optional, and you can disable them if you prefer.

Once you have set up your project, proceed to create a Firestore instance.
- Navigate to the project dashboard and click on the `Cloud Firestore` card.
- Select `Create database` to initiate the database creation process.
- You have the option to commence your project in either `production` or `test` mode.
- Choose a `location`, ideally the one nearest to you, to ensure better latency.

Once you've configured Firestore, proceed to generate the service account credentials:
- Navigate to the `settings icon` in the sidebar of your project dashboard.
- Choose `Project Settings` from the options available in the settings menu.
- Navigate to the `Service Account` tab in the Project Settings.
- Choose the appropriate SDK, in our case, it is `Node.js`.
- Select `Generate new private key` to generate the necessary credentials.
- Upon selection, a file download prompt will appear. Save the file as `serviceAccountKey.json` and ensure the formatting is matched accurately.

## Firebase emulator setup
- To utilize the emulator in the project, set the `EMULATED_FIRESTORE` environmental variable to `1`.
- Additionally, ensure that you provide the correct Firebase `project ID` in the `FIRESTORE_PROJECT_ID` environmental variable.
- Ensure you have Java 11 or a later version installed to run the Firebase emulator. We suggest [Java 19](https://www.oracle.com/java/technologies/javase/jdk19-archive-downloads.html)
- Enter the project directory and execute the commands below one by one to install and launch the Firebase emulator. Messages starting with `#` are provided for your assistance and do not need to be executed along with the commands.
```sh
# Install Firebase CLI globally
npm install -g firebase-tools

# Log in to Firebase
firebase login
# When prompted to allow data collection, type 'n'
# Follow the redirection in your default browser, select your Google account, and click 'allow'

# Set the project ID
firebase use {project_id}
# Replace {project_id} with the project ID obtained from the service account file

# Initialize Firebase
firebase init
# When prompted, type 'Y'
# Choose "Emulators: Set up local emulators for Firebase products"
# Select "Firestore Emulator"
# When asked if you want to download the emulators, type 'Y'

# Once initialization is complete
firebase emulators:start
# To start the emulator

# You can access the Firebase UI at http://localhost:4040
```

## All set! 
In a new terminal, execute the following command to initiate the development environment.
```sh
yarn dev
```
**NOTE**: If you are utilizing the emulator, make sure to run `firebase emulators:start` before starting the Node.js server. Failure to do so might result in errors.
