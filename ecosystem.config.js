/**
 * @description pm2 configuration file.
 * Stockage PDF local : une seule instance API (évite fichiers absents entre workers).
 * Avec STORAGE_DRIVER=s3, vous pouvez remonter instances > 1.
 */
module.exports = {
  apps: [
    {
      name: 'prod',
      script: 'dist/server.js',
      exec_mode: 'fork',
      instance_var: 'INSTANCE_ID',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      merge_logs: true,
      output: './logs/access.log',
      error: './logs/error.log',
      env: {
        PORT: 8080,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'front',
      script: 'node_modules/.bin/next',
      args: 'start -p 5011',
      exec_mode: 'cluster',
      cwd: '/var/www/vhosts/cellulenoire.fr/httpdocs',
      instance_var: 'INSTANCE_ID',
      instances: 2,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      merge_logs: true,
      output: './logs/access.log',
      error: './logs/error.log',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5011,
      },
    },
  ],
};
