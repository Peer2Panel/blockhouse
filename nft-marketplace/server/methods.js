const https = require('https');
import {AbortController} from "node-abort-controller";
import { create as ipfsHttpClient } from 'ipfs-http-client';
import * as fs from 'fs';

global.AbortController = AbortController;
const projectId = Meteor.settings.projectId;
const projectSecret = Meteor.settings.projectSecret;

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth
    }
  })

async function dataURLtoFile(dataurl) {
    var arr = dataurl.split(',');
    const data = arr[1];
    fs.writeFileSync("image.png", data, 'base64', function(err) {
        console.log(err);
      });
    const stream = fs.createReadStream("image.png")
    return stream;
}

Meteor.methods({
    'uploadToIPFS': async function (args) {
        //console.log(await dataURLtoFile(args.file))
        const added = await client.add(
            await dataURLtoFile(args.file),
            {
              progress: (prog) => console.log(`received: ${prog}`)
            }
          );
        //console.log(added);
        return added;
    },

    'uploadToIPFSSimple': async function (args) {
      const added = await client.add(
          args.data,
          {
            progress: (prog) => console.log(`received: ${prog}`)
          }
        );
      console.log(added);
      return added;
  },
})