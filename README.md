# SDAG.js

A Javascript SDAG library for Web broswers and Node.js.

## Installing

```
npm install sdag.js
```

## API Documentation

Almost all network APIs are promise-style, await/async is recommended.

### HubClient

The core class of SDAG.js.

```
import { HubClient } from 'sdag.js';
```

| Method | Description | Return |   |   |
|---|---|---|---|---|
|  connect | Connect to a hub | boolean |   |   |
| getJoint  | Get a joint from hub  | PropertyJoint  |   |   |
|  getNetworkInfo | Get the latest net info  | NetworkInfo  |   |   |
| getBalance | Query the balance of specified address | Balance |
| getTxsByAddress | Query history txs of specified address | Transaction[] |
| getJointsByMci | Query joints by mci | Joint[] |
| getJointsByLevel | Query joints between levels | JointLevel[][] |
| getFreeJoints | Query free joints | Joint[] |
| transfer | Transfer assets | string |