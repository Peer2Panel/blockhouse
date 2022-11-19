
module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: '18.212.3.45',
      username: 'ubuntu',
      pem: '~/Downloads/rl.pem'
    }
  },

  app: {
    name: 'Blockhouse',
    path: '../',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      ROOT_URL: "https://blockhouse.jonathanlehner.com",
    },

    docker: {
      image: 'zodern/meteor:root',
      prepareBundle: true,
      //image: 'guillim/meteord:node14.18.2',
    },

    /*volumes: {
        '/home': '/home',
    },*/

    //deployCheckWaitTime: 60,
    enableUploadProgressBar: true
  },

  mongo: {
    version: '4.0.2', //'4.0.2', //'5.0.5',
    servers: {
      one: {}
    }
  },

  proxy: {
    domains: 'blockhouse.jonathanlehner.com',
    ssl: {
      letsEncryptEmail: 'jonathan@milliwayszurich.com',
      forceSSL: true 
    },
    nginxLocationConfig: './config.txt'
  }

};
