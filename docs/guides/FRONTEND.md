# Frontend Project Structure

## Overview

This document aims to provide a comprehensive understanding of the structure and organization of our frontend application.

## Folder Structure

Below is the representation of the main file structure:

```
├── public
├── src
│   ├── assets
│   ├── components
│   │   └── common
│   ├── hooks
│   ├── pages
│   ├── utils
│   ├── App.js
│   ├── constants.js
│   ├── index.css
│   ├── index.js
```

- `public`: This directory contains the main `index.html` file.

The structure of our `src` directory is as follows:

- `assets`: This directory is used to store static files such as images and markdowns used in the app.

- `components`: This directory contains folders like `common`, `footer`, `header`, `herosection`, etc., where components related to a certain page or section are grouped together.
    - `common`: This subdirectory inside the `components` directory is used for storing reusable components like `input`, `divider`, `accordion`, `modal`, etc.

- `hooks`: This directory contains custom React hooks.

- `pages`: This directory contains components that represent different pages of the application. The routing to these pages is handled by React Router.

- `utils`: This directory contains utility functions and helper functions that are used across multiple components or pages in the application.

- `constants.js`: This file contains constant values that are used throughout the application. These could be URLs for API endpoints, content of the app, etc.

- `App.js`: This file serves as the main entry point for the application’s components, hooks, and pages. It also manages user navigation within the application.

- `index.css`: This is the main CSS file. It defines global styles and CSS variables.

- `index.js`: This is the entry point of the application. It imports the App component and enables routing.

We hope this helps! Reach out to us on Discord if you need more information or if there's anything else we can assist you with. Happy coding! 🚀

