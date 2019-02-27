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

```javascript
import { HubClient } from 'sdag.js';

let client = new HubClient();
```

| Method | Description | Return | 
|---|---|---|
|  connect | Connect to a hub | boolean |  
| getJoint  | Get a joint from hub  | PropertyJoint  |   
|  getNetworkInfo | Get the latest net info  | NetworkInfo  | 
| getBalance | Query the balance of specified address | Balance |
| getTxsByAddress | Query history txs of specified address | Transaction[] |
| getJointsByMci | Query joints by mci | Joint[] |
| getJointsByLevel | Query joints between levels | JointLevel[][] |
| getFreeJoints | Query free joints | Joint[] |
| transfer | Transfer assets | string |

### Keyman

SDAG keys manager. You should use this class to manage users' addresses and private keys.

```javascript
import { Keyman , HubClient } from 'sdag.js';

let client = new HubClient();
let man = new Keyman(mnemnoic, passphrase);

// Sign a transaction when transferring assets

await client.transfer({ to: 'To', from: 'From', amount: 2, ecdsaPubkey: man.mainEcdsaPubKey }, (hash) => man.sign(hash));

```

| Method | Description | Return |
|---|---|---|
|  constructor | The mnemonic code is required  | |
| genAddress  | Generate a address by index  | string |
|  sign | Sign unit hash when you transfer assets  | string | 
| verify | Verify a signed string | boolean |
| ecdsaPubkey | Gen a ecdsa pub key by index | string |

## License