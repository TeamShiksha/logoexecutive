# DO NOT DIRECTLY MAKE CHANGES TO THE MAIN BRANCH

# Introduction

We're building a website that will be hosted on **logoexecutive.in** (though this might change). This site will give you logos of big companies (from 32px to 256px) when you use API keys.

You can find a similar website at this link: [HERE](https://brandfetch.com/). Upon accessing the pricing section, it becomes evident that the costs are considerably high, while the allocation of API calls is limited. In our application, our aim is to optimize expenses and enhance the availability of API calls.

## Backend options

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

## Database options

![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

## Others

1. Razor pay integration.
2. CloudFare integration.
3. CI/CD

## API

1. Sign Up
2. Sign In
3. Forgot password
4. Password reset
5. create API key
6. Email verification
7. get API for logo and more

## What we need for now ?

1. Brand name (brandname should not indicate that we only provide fortune 500 logos, as we might have modification to add more things)
2. Logos of all fortune 500 companies (In high quality). We will be following [THIS LIST](https://www.50pros.com/fortune500)

## Installation

- Clone repository.

```bash
git clone https://github.com/FrontendArmy/logoexecutive-backend.git
```

- Change directory.

```bash
cd logoexecutive-backend
```

- Install dependencies.

```bash
yarn
```

- Start the server.

```bash
yarn dev
```
