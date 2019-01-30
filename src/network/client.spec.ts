import test from 'ava';
import Client from './client';

let client = new Client();

test.before(async () => {
    await client.connect('ws://10.168.3.131:6635');
});

test('gets mci', async t => {
    let joints = await client.getJointsByMci(1);
    t.true(joints.length > 0);
});

test('gets a joint', async t => {
    let joint = await client.getJoint('sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
    t.true(joint != null);
    t.true(joint.joint.unit.unit === 'sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
});

test('gets balance', async t => {
    let balance = await client.getBalance('3JX4UBJW463VJFBNEO2WOJFTPK2WLI5A');
    t.true(balance.balance > 0);

    balance = await client.getBalance('3JX4UBJW463VJFBNEO2WOJFTPK2WLI5B');
    t.true(balance.balance === 0);
});