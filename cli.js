const { Issuer, errors: { OPError } } = require('openid-client');
const prompts = require('prompts');
const open = require('open');
const questions = require('./questions');
const SwaggerClient = require('swagger-client');

const AUTH0_CLIENT_ID = 'edunyHPs31vIJOaOCYD5yxKS1Y8M9vIL';
const AUTH0_DOMAIN = 'frozenmountain.auth0.com';
const LSIO_DOMAIN = 'api.liveswitch.io';

;(async () => {
  /*const response = await prompts(questions);

  if (!response.audience) {
    delete response.audience;
  }*/
  const scope = 'profile openid'//response.scope.join(' ');
  const audience = null

  // fetches the .well-known endpoint for endpoints, issuer value etc.
  const auth0 = await Issuer.discover(`https://${AUTH0_DOMAIN}`);

  // instantiates a client
  const client = new auth0.Client({
    client_id: AUTH0_CLIENT_ID,
    token_endpoint_auth_method: 'none',
    id_token_signed_response_alg: 'RS256',
  });

  // Device Authorization Request - https://tools.ietf.org/html/rfc8628#section-3.1
  const handle = await client.deviceAuthorization({ scope: scope, audience: audience })

  // Device Authorization Response - https://tools.ietf.org/html/rfc8628#section-3.2
  const { verification_uri_complete, user_code, expires_in } = handle

  // User Interaction - https://tools.ietf.org/html/rfc8628#section-3.3
  await prompts({
    type: 'invisible',
    message: `Press any key to open up the browser to login or press ctrl-c to abort. You should see the following code: ${user_code}. It expires in ${expires_in % 60 === 0 ? `${expires_in / 60} minutes` : `${expires_in} seconds`}.`,
  });
  // opens the verification_uri_complete URL using the system-register handler for web links (browser)
  open(verification_uri_complete);

  // Device Access Token Request - https://tools.ietf.org/html/rfc8628#section-3.4
  // Device Access Token Response - https://tools.ietf.org/html/rfc8628#section-3.5
  let tokens;
  try {
    tokens = await handle.poll()
  } catch (err) {
    switch (err.error) {
      case 'access_denied': // end-user declined the device confirmation prompt, consent or rules failed
        console.error('\n\ncancelled interaction');
        break;
      case 'expired_token': // end-user did not complete the interaction in time
        console.error('\n\ndevice flow expired');
        break;
      default:
        if (err instanceof OPError) {
          console.error(`\n\nerror = ${err.error}; error_description = ${err.error_description}`);
        } else {
          throw err;
        }
    }
  }

  if (tokens) {
    console.log('\n\nresult tokens', { ...tokens });
    
    // 
    // TODO: we have a token; exchange for an API key for the LS Cloud Console
    
    // now that we have the API key, get a list of Applications
      /*new SwaggerClient(`https://${LSIO_DOMAIN}/swagger/1.0/swagger.json`, {
        requestInterceptor: (req) => {
          req.headers['x-api-key'] = ''
          return req;
        },
      })
        .then(
          client => client.apis.ApiKeys.get_ApiKeys(),
          reason => console.error('failed to load the spec: ' + reason)
        )
        .then(
          getApiKeysResult => console.log(getApiKeysResult),
          reason => console.error('failed on api call: ' + reason)
        );

    

    // requests without openid scope will not contain an id_token
    if (tokens.id_token) {
      console.log('\n\nID Token Claims', tokens.claims());
    }
*/
    // try-catching this since resource may have been used and the access token may
    // not be eligible for accessing the UserInfo Response
    try {
      console.log('\n\nUserInfo response', await client.userinfo(tokens));
    } catch (err) {
      //
    }
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
})
