# Tasks Tracking WebApp

A Vue.js/Express.js Web Application For Tracking Tasks and Updating Statuses of projects.

The Project is a Single Page Application (SPA) aiming to allow users to create tasks and update the status of projects.

it is built using Vue.js (with Vite, Pinia for state management, Vue Router, and Vuetify for UI) on the frontend, and Node.js/Express.js (with Sequelize ORM and SQLite database) on the backend.

The Client (`client/`) and the Server (`server/`) are separate applications. The Client communicates with the Server API using Axios.

- [Tasks Tracking WebApp](#tasks-tracking-webapp)
  - [Technology Stack](#technology-stack)
  - [Current Status](#current-status)
  - [Features](#features)
  - [API Endpoints](#api-endpoints)
  - [Security Considerations](#security-considerations)
  - [Installation](#installation)
  - [Running the application](#running-the-application)

## Technology Stack

*   **Frontend:** Vue.js 3 (Composition API), Vite, Pinia, Vue Router, Vuetify 3, Axios, Material Design Icons
*   **Backend:** Node.js, Express.js, Sequelize, SQLite
*   **Development:** ESLint, Prettier, Vitest (client tests)

## Current Status

As of the last project scan:
*   The basic project structure (client/server separation, build tools, core framework setup) is in place.
*   User registration (frontend form, backend validation & user creation with password hashing) is partially implemented.
*   Login functionality is missing (frontend placeholder view, unimplemented backend route).
*   Core task/project management features are not implemented.

## Features

- User Registration (Partially Implemented - uses bcrypt for hashing)
- User Login (Not Implemented)
- Create Projects (WIP)
- View Projects (WIP)
- Create Tasks (WIP)
- Update Tasks Status (WIP)
- Delete Tasks (WIP)
- View Tasks (WIP)
- Search Tasks (WIP)

## API Endpoints

The following backend API endpoints are defined in `server/src/routes.js`:

*   `GET /`: Returns a simple 'hello world' message.
*   `POST /register`: Handles user registration requests. Includes validation via `AuthenticationControllerPolicy` and user creation with password hashing via `AuthenticationController`.
*   `GET /status`: Returns a simple status message indicating the server is running.
*   `GET /login`: Route defined but **not implemented** (no handler function).

## Security Considerations

*   **Password Storage:** Passwords are now hashed using `bcrypt` before being stored in the database.
*   **Login Implementation:** The login endpoint needs to be implemented securely, including comparing the provided password with the stored hash using `bcrypt.compare`.
*   **Further Security:** Consider adding measures like input sanitization, rate limiting, JWT for sessions, etc., as the application develops.

## Installation

### Clone the repository

```git clone https://github.com/Omaranwa/Tracking-App.git```

### Install dependencies

Install dependencies for the root, client, and server:

```bash
npm install # Installs root dependencies (like concurrently)
cd client && npm install && cd ..
cd server && npm install && cd ..
```

## Running the application

To run both the client and server concurrently for development, run the following command from the **root project directory**:

```bash
npm run dev
```

This will:
*   Start the backend server (usually on port 8081).
*   Start the frontend development server (usually on a port like 5173) and provide a link to open in your browser.

*(Previously, you would run `npm start` in the `server` directory and `npm run dev` in the `client` directory in separate terminals. The `npm run dev` command in the root now handles both.)*