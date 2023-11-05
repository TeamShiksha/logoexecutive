# Development Guide
This doc contains the instructions to follow to clone and run the project in your local enviroment.

### Cloning the project
First step should be self-explanatory is to clone the project. Clone the project using the ssh url
Example:
```sh
git clone git@github.com:FrontendArmy/logoexecutive-backend.git
```
### Installing dependencies
The project currently uses yarn, so make sure you have yarn install. To install the dependencies run the following command
```sh
yarn install
```
Alternatively you can install the dependencies using any package manager like `npm`, `bun` or `pnpm` but make sure to delete the lock file created by them respectively.

### Development Environments
The repo currently contains 3 environments:
- production -> emulates the app running on production. `npm start` is used to run the app in production.
- development -> runs the file in dev mode, with hot reload. `npm run dev` is used to run the app in development.
- test (TBD)

### Creating env variables
**For non-production environments**
- Create a file named `.env.<environment_name>`; where `<environment_name>` is the name of environment the variables will be loaded into. E.g for development environment create file named `env.development`.
- Copy `.env_example` into your environment variable file.
- Replace the right hand value of the environment variable with the appropriate value.

**For production environment**
- Create a file named `.env`
- Follow the same steps as mentioned above.

### Setting up firebase
The project uses firestore to store data. To work in development enviroment create your own firestore backend on [firebase](https://firebase.google.com/) website.
**Creating Project**
- Login to [firebase](https://firebase.google.com/) with your google account and navigate to firebase console.
- Click on add project
- Enter project's name
- Analytics are optional, you can disable them.

**Creating firesotre instance**
After you've created your project, create a firestore instance.
- Click on `cloud firestore` card on your project dashboard.
- Click on `Create database`
- You can start your project in either of the modes i.e `production` or `test`. 
- Select location, ideally your nearest location for better latency.

#### Firebase service account
Firebase requires you to authenticate your app with a valid credentials, to connect your app to your firebase app.
There are 2 ways to add service account credentials for firebase.
**Using serviceAccountKey file (Recommended for local setup)**
- In the project dashboard sidebar, click on settings icon
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

## All set!
Now you should be able to run the project! Happy Coding :)

## Run command
```sh
yarn dev
```
