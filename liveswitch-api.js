const SwaggerClient = require('swagger-client');

const liveswitchapi = {
    apiKey: '',
    apiUrl: 'https://api.liveswitch.io/swagger/1.0/swagger.json',
    getApiKeys: async function(oauthToken){
        var promise = new Promise(function(resolve, reject) {

            reject('Not implemented yet - need to have the new key exchange api');
            /*new SwaggerClient(liveswitchapi.apiUrl)
            .then(
                // the swagger client loaded - get the applications list
                client => client.apis.ApplicationConfigs.get_ApplicationConfigs(),
                reason => reject('failed to load the spec: ' + reason)
            )
            .then(
                // success with the app list
                applicationsResult => resolve(applicationsResult.body.value),
                reason => reject('failed on api call: ' + reason)
            );*/
        });
        return promise;
    },
    getApplications: async function(){
        var promise = new Promise(function(resolve, reject) {
            new SwaggerClient(liveswitchapi.apiUrl, {
                requestInterceptor: (req) => {
                    req.headers['x-api-key'] = liveswitchapi.apiKey;
                    return req;
                },
            })
            .then(
                // the swagger client loaded - get the applications list
                client => client.apis.ApplicationConfigs.get_ApplicationConfigs(),
                reason => reject('failed to load the spec: ' + reason)
            )
            .then(
                // success with the app list
                applicationsResult => resolve(applicationsResult.body.value),
                reason => reject('failed on api call: ' + reason)
            );
        });
        return promise;
    }
}
module.exports = liveswitchapi