
module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: '44.211.184.91',
      username: 'ubuntu',
      //pem: '~/Downloads/rl_grabigo.pem'
    }
  },

  app: {
    name: 'Earningspool',
    path: '../',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      ROOT_URL: "https://earningspool.jonathanlehner.com",
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
    domains: 'earningspool.jonathanlehner.com',
    ssl: {
      letsEncryptEmail: 'jonathan@milliwayszurich.com',
      forceSSL: true 
    },
    nginxLocationConfig: './config.txt'
  }

};
