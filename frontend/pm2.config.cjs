// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'xbit-fronentend-app-v2',
      script: 'serve -s build-app -p 9302',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'xbit-fronentend-dev-v2',
      script: 'serve -s build-dev -p 9301',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'xbit-frontend-home-v2',
      script: 'serve -s build-home -p 9300',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
