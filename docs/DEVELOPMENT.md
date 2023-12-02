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

**Using environment variables (Recommended for Railway deployment)**
To set firestore credentials firestore environment variables need to be appended in your respective environment file.
- Open `utils/firestore.js` file and make sure all the environment variables related to firestore are present in your environment file.

#### Firebase emulator setup
Firebase emulator makes it very convinient to get responses quickly during development environment. Emulator is also used to run our test scripts.
**Pre-requisites**
- Java
- Firebase CLI. [Follow this](https://firebase.google.com/docs/cli).

**Installing firebase emulators**
- Install firebase emulator, follow [firebase official docs](https://firebase.google.com/docs/emulator-suite/install_and_configure). 
- Run `firebase init` command in terminal.
- Select `firestore emulator.
- Link your project you setup on firebase.

**Using emulator in project**
- To use emulator in project a flag named `EMULATED_FIRESTORE` needs to be set in the respective environment file that you're using. You can set the value of flag to `1`.

## Firebase emulator setup

## All set!
Now you should be able to run the project! Happy Coding :)

## Run command
```sh
yarn dev
```

### My Multi Word Header
