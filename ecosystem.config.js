/**
 * @description pm2 configuration file.
 * @example
 */
module.exports = {
  apps: [
    {
      name: 'prod', // pm2 start App name
      script: 'dist/server.js',
      exec_mode: 'cluster', // 'cluster' or 'fork'
      instance_var: 'INSTANCE_ID', // instance variable
      instances: 2, // pm2 instance count
      autorestart: true, // auto restart if process crash
      watch: false, // files change automatic restart
      ignore_watch: ['node_modules', 'logs'], // ignore files change
      max_memory_restart: '1G', // restart if process use more than 1G memory
      merge_logs: true, // if true, stdout and stderr will be merged and sent to pm2 log
      output: './logs/access.log', // pm2 log file
      error: './logs/error.log', // pm2 error log file
      env: {
        // environment variable
        PORT: 8080,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'front',
      script: 'node_modules/.bin/next',
      args: 'start -p 5011',
      exec_mode: 'cluster', // 'cluster' or 'fork'
      cwd: '/var/www/vhosts/cellulenoire.fr/httpdocs',
      instance_var: 'INSTANCE_ID', // instance variable
      instances: 2, // pm2 instance count
      autorestart: true, // auto restart if process crash
      watch: false, // files change automatic restart
      ignore_watch: ['node_modules', 'logs'], // ignore files change
      max_memory_restart: '1G', // restart if process use more than 1G memory
      merge_logs: true, // if true, stdout and stderr will be merged and sent to pm2 log
      output: './logs/access.log', // pm2 log file
      error: './logs/error.log', // pm2 error log file
      env_production: {
        NODE_ENV: 'production',
        PORT: 5011,
      },
    },
  ],
};
