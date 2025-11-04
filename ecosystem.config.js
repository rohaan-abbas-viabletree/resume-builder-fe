// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: process.env.DEVRIMS_PROJECT_NAME,
      cwd: __dirname, // <-- change this
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${process.env.PORT} -H 0.0.0.0`, // serve on port 5000
      instances: 1, // or "max" for all CPU cores
      exec_mode: "fork", // use "cluster" with instances > 1
      watch: true, // set true only for dev
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 5000, // mainly for libraries that read PORT
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      },
    },
  ],
};
