import test from 'ava';
import Client from './client';
import { detect } from 'detect-browser';


let client = new Client();

test.before(async () => {
    await client.connect('ws://10.168.3.131:6635');
});

test('gets mci', async t => {
    let joints = await client.getJointsByMci(1);
    t.true(joints.length > 0);
});