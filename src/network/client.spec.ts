import test from 'ava';
import Client from './client';

let client = new Client();

test.before(async () => {
    await client.connect('ws://10.168.3.131:6635');
});

test('gets mci', async t => {
    t.true(client.connected);

    let joints = await client.getJointsByMci(1);
    t.true(joints.length > 0);

    let jointsLevel = await client.getJointsByLevel(20, 50);
    t.true(jointsLevel.length > 0);
});

test('gets balance', async t => {
    t.true(client.connected);

    let balance = await client.getBalance('3JX4UBJW463VJFBNEO2WOJFTPK2WLI5A');
    t.true(!balance.error)
    t.true(balance.balance > 0);

    balance = await client.getBalance('WUUWY32RQTXHSIYIDBPUW7AOEEAFKQOH');
    t.true(balance.balance > 0);

    let joint = await client.getJoint('sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
    t.true(!joint.error);
    t.true(joint.joint.unit.unit === 'sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
});
