const liveswitchapi = require('../liveswitch-api');
const apikey = '';

test('applications are listed', async () => {
    liveswitchapi.apiKey = apikey;
    const data = await liveswitchapi.getApplications();
    expect(data.length).toBeGreaterThan(0);
});