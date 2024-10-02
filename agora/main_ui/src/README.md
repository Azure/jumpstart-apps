# Introduction

This is a step by step guide to run the latest Agora UI on local environment.

## Prerequisites

- Install Node.js
If you do not have Node installed, please use the following insturctuions for that which installs the Node version 22.

```bash

# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
nvm install 22

# verifies the right Node.js version is in the environment
node -v # should print `v22.9.0`

# verifies the right npm version is in the environment
npm -v # should print `10.8.3`

```

## Initial Setup

- Clone the repo

    ```bash

    git clone https://github.com/nabeelmsft/jumpstart-apps.git

    ```

- [Optional]Checkout the hypermarket-ui-changes-to-main_ui branch to get the latest updates

    ```bash
    git checkout hypermarket-ui-changes-to-main_ui
    ```

## Running the App

- Browse to cloned repo. We want to make sure we are at the project folder (/jumpstart-apps/agora/main_ui/src)

    ```bash
    cd ~/jumpstart-apps/agora/main_ui/src$

    ```

- Building the app

    ```bash
    npm start
    ```

- Running the app: In the project directory, you can run:

    ```bash
    npm start
    ```

This runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

[Note]: Please make sure you have port 3000 open

The page will reload if you make edits.\
