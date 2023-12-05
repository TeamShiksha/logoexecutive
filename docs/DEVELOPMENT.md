# Development Guide
This document provides step-by-step instructions for cloning and running the project in your local environment.

### [Clone and install dependencies](#clone-and-install-dependencies)
### [Enironmental variables](#enironmental-variable)
### [Gmail setup](#gmail-setup)
### [AWS setup](#aws-setup)
### [Firebase setup](#firebase-setup)
### [Firebase emulator setup](#firebase-emulator-setup)

## Clone and install dependencies
Run the commands below one by one to clone and install all the dependencies of the project:
```sh
git clone https://github.com/FrontendArmy/logoexecutive-backend.git
cd logoexecutive-backend
yarn install
```

## Enironmental variable
The repository currently includes three environments. Create the environmental file according to the specific environment you are running.
| Environment   | Environmental File     | Run Command        |
|---------------|------------------------|--------------------|
| Production    | .env                   | npm start          |
| Development   | .env.development       | npm run dev          |
| Test          | .env.test              | npm run test       |

Copy `.env_example` into your environment variable file.

Replace the right hand value of the environment variable with the appropriate value(you can get this values by following the next step of the documentation).

## Gmail setup
- Create a gmail account, if you don't have any.
- Open your Gmail account and select `Manage your Google Account`
- Navigate to the `Security` tab in the left panel.
- Turn on 2-step verification if not enabled.
- Scroll down to the `App passwords` section and create a new app password.
- Save this generated password somewhere safe.

## AWS setup
- This setup is only requried if you are working with the business APIs. If you, you can just keep the example values.

## Firebase setup
- Login to [firebase](https://firebase.google.com/) with your google account and navigate to firebase console.
- Click on add project
- Enter project's name
- Analytics are optional, you can disable them.

After you've created your project, create a firestore instance.
- Click on `cloud firestore` card on your project dashboard.
- Click on `Create database`
- You can start your project in either of the modes i.e `production` or `test`. 
- Select location, ideally your nearest location for better latency.

After setting up the firestore, generate the service account credentials:
- In your project dashboard sidebar, click on settings icon.
- Select `Project Settings`
- Choose `Service Account` tab.
- Select the relevant sdk in our case it is `nodejs`
- Click on `Generate new private key`
- This will prompt you to download the file, name the file as `serviceAccountKey.json` and make sure to match the formatting.

## Firebase emulator setup
- To use emulator in project a flag named `EMULATED_FIRESTORE` needs to be set in the respective environment file that you're using. You can set the value of flag to `1`.
- To run the firebase emulator you must have Java 11 or above. We suggest [Java 19](https://www.oracle.com/java/technologies/javase/jdk19-archive-downloads.html)
- Go inside the project directory and run the command one by one given below in order to install and run the firebase emulator. Message starting with # are for your help and need not be run with the commands.
```sh
npm install -g firebase-tools
firebase login
# Allow Firebase to collect CLI and Emulator Suite usage and error reporting information? (Y/n) n
# Now, you will be redirected on your default browser. Select the Google account which you used to create the firebase account
# Select allow in next window
firebase use {project_id}
# You can get the project id from the service account file you create earlier
firebase init
# Are you ready to proceed? Y
# Select "Emulators: Set up local emulators for Firebase products" from the options provided
# Select "Firestore Emulator" from the next set of options
# Would you like to download the emulators now? (Y/n) Y
# Once done you will see a message "Firebase initialization complete!"
firebase emulators:start
# To start the emulator
```


## All set!
Now you should be able to run the project! Happy Coding :)
```sh
yarn dev
```
