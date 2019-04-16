import chash from './chash';
import hash from './hash';
import Mnemonic from 'bitcore-mnemonic';
import bip39 from 'bip39';
const mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';
console.log(chash.isChashValid('RMCBQMSNGWCSCO4PIV2CVOM6PU7QIO22'));
console.log(chash.isChashValid2('RMCBQMSNGWCSCO4PIV2CVOM6PU7QIO22'));
// it('tests validation', t => {
//     let key = new Mnemonic(mnemonic).toHDPrivateKey() as HDPrivateKey;
//     let pubkey = key.hdPublicKey.publicKey;
//     let base64 = pubkey.toBuffer().toString('base64');
//     let address = hash.getChash160(['sig', {
//         "pubkey": base64
//     }]) as string;
//     t.true(chash.isChashValid(address));
// });
// it('generally tests', t => {
// })
for (let i = 0; i < 1; i++) {
    let mn = bip39.generateMnemonic();
    let key = new Mnemonic(mn).toHDPrivateKey();
    let pubkey = key.hdPublicKey.publicKey;
    let base64 = pubkey.toBuffer().toString('base64');
    let addr = hash.getChash160(['sig', {
            'pubkey': base64
        }]);
    console.log(chash.isChashValid(addr));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhc2guc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXIvY2hhc2guc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxTQUFTLENBQUM7QUFDNUIsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRTFCLE9BQU8sUUFBUSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUcxQixNQUFNLFFBQVEsR0FBRywwRkFBMEYsQ0FBQztBQUM1RyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUM7QUFFckUsZ0NBQWdDO0FBR2hDLHlFQUF5RTtBQUN6RSw4Q0FBOEM7QUFDOUMseURBQXlEO0FBRXpELCtDQUErQztBQUMvQywyQkFBMkI7QUFDM0IscUJBQXFCO0FBRXJCLDJDQUEyQztBQUMzQyxNQUFNO0FBRU4sK0JBQStCO0FBRS9CLEtBQUs7QUFFTCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3hCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsRUFBa0IsQ0FBQztJQUM1RCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUN2QyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWxELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDaEMsUUFBUSxFQUFFLE1BQU07U0FDbkIsQ0FBQyxDQUFDLENBQUM7SUFFSixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUN6QyJ9