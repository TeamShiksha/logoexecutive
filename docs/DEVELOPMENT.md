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

### Creating env for dev environment

The project relies on setting up enviroment. Dev environment allows you to run the command from provided dev script, which hot reloads the project whenever you run the file.
Following are the steps to create env file for development
- Create file named `.env`
- Copy `.env_example` into `.env`
- Replace the right hand value of the environment variable with the appropriate value.

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

**Creating serviceAccountKey**
Now that you've created your firestore database, let's connect it with our backend.
- In the project dashboard sidebar, click on settings icon
- Select `Project Settings`
- Choose `Service Account` tab.
- Select the relevant sdk in our case it is `nodejs`
- Click on `Generate new private key`
- This will prompt you to download the file, name the file as `serviceAccountKey.json` and make sure to match the formatting.

## All set!
Now you should be able to run the project! Happy Coding :)

## Run command
```sh
yarn dev
```
