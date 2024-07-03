# Blockchain Bootcamp2.0


## Project setup:

First, ensure you have Node.js installed, with a version of at least 16.15.1.

## Setup Instructions:

### Go to project root folder and run below commands to setup:
### Step 1:
Run `npm i` in the project root folder to install all dependencies.

### Step 2:
Start the Hardhat blockchain node by running:
```
npx hardhat node
```
To learn more about Hardhat [check here](https://hardhat.org/hardhat-runner/docs/getting-started#installation)

### Step 3:
Create the React development environment by running:
```
npm run start
```

### Step 4:
Deploy the smart contracts for the initial setup by running:
```
npx hardhat run --network localhost scripts/01_deploy.js
```

Finally, to seed the exchange and show some data on the page, run the following command:
```
npx hardhat run --network localhost scripts/02_seed-exchange.js

```

You should now see the project running at [http://localhost:3000/](http://localhost:3000/)



