module.exports = {
  apps: [
    {
      name: 'xbit-backend',
      script: './dist/main.js',
      node_args: ['-r dotenv/config'],
    },
  ],
};
