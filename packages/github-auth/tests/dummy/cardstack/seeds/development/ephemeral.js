/* eslint-env node */
const JSONAPIFactory = require('@cardstack/test-support/jsonapi-factory');

module.exports = [
  {
    type: 'plugin-configs',
    id: '@cardstack/ephemeral'
  },
  {
    type: 'data-sources',
    id: 'default',
    attributes: {
      'source-type': '@cardstack/ephemeral',
      params: {
        initialModels: initialModels()
      }
    }
  },
  {
    type: 'plugin-configs',
    id: '@cardstack/hub',
    relationships: {
      'default-data-source': {
        data: { type: 'data-sources', id: 'default' }
      }
    }
  }
];

function initialModels() {
  let factory = new JSONAPIFactory();
  factory.addResource('authentication-sources', 'github')
    .withAttributes({
      authenticatorType: '@cardstack/github-auth',
      params: {
        'client-id': process.env.GITHUB_CLIENT_ID,
        'client-secret': process.env.GITHUB_CLIENT_SECRET
      }
    })
  return factory.getModels()
}
