import test from 'ava';
import Client from './client';
let client = new Client();
test.before(async () => {
    await client.connect('ws://10.168.3.131:6635');
});
test('gets mci', async (t) => {
    t.true(client.connected);
    let joints = await client.getJointsByMci(1);
    t.true(joints.length > 0);
});
test('gets balance', async (t) => {
    t.true(client.connected);
    let balance = await client.getBalance('3JX4UBJW463VJFBNEO2WOJFTPK2WLI5A');
    t.true(!balance.error);
    t.true(balance.balance > 0);
    balance = await client.getBalance('WUUWY32RQTXHSIYIDBPUW7AOEEAFKQOH');
    t.true(balance.balance > 0);
    let joint = await client.getJoint('sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
    t.true(!joint.error);
    t.true(joint.joint.unit.unit === 'sKm2SUIwJ37KPHNCGF2616+VmdqLRnyuV5WfVq9Xj8Q=');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmV0d29yay9jbGllbnQuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLElBQUksTUFBTSxLQUFLLENBQUM7QUFDdkIsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFDO0FBRTlCLElBQUksTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7QUFFMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNuQixNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNuRCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFFO0lBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXpCLElBQUksTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtJQUMzQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV6QixJQUFJLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsa0NBQWtDLENBQUMsQ0FBQztJQUMxRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUU1QixPQUFPLEdBQUcsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFDdEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTVCLElBQUksS0FBSyxHQUFHLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0lBQ2xGLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssOENBQThDLENBQUMsQ0FBQztBQUNyRixDQUFDLENBQUMsQ0FBQyJ9