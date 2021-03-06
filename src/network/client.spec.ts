import test from 'ava';
import Client from './client';

let client = new Client({ peerId: 'KOQXPPXPNJL5RYI4JO37HEBDTMYB7BGT' });

test.before(async () => {
    await client.connect('ws://10.168.1.123:6615');
});

test('gets free joints', async t => {
    let joints = await client.getFreeJoints();
    t.true(joints.length > 0);
});

test('gets mci', async t => {
    t.true(client.connected);

    let joints = await client.getJointsByMci(1);
    t.true(joints.length > 0);

    let jointsLevel = await client.getJointsByLevel(20, 50);
    t.true(jointsLevel.length > 0);

    let statistics = await client.getNetStatistics();
    t.true(statistics != null);

});

test('gets balance', async t => {
    t.true(client.connected);

    let balance = await client.getBalance('KOQXPPXPNJL5RYI4JO37HEBDTMYB7BGT');
    t.true(!balance.error)
    t.true(balance.balance >= 0);

    // balance = await client.getBalance('WUUWY32RQTXHSIYIDBPUW7AOEEAFKQOH');
    // t.true(balance.balance > 0);

    // let joint = await client.getJoint('sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
    // t.true(!joint.error);
    // t.true(joint.joint.unit.unit === 'sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
});

test('get current tps', async t => {
    let tps = await client.getCurrentTps();
    t.true(typeof tps === 'number');
});

test('get daily tps', async t => {
    let data = await client.getDailyTps();
    t.deepEqual(data, {});
});