const https = require('https');
import {AbortController} from "node-abort-controller";
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Blob } from "buffer";
import * as fs from 'fs';
const { Readable } = require('stream');

global.AbortController = AbortController;
const projectId = '2DEHWaDAbvuSe9H8iSYrpocOdub';
const projectSecret = '5f2aeb3e7fa3d5ed05e3044fe5bb75a3';

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
  
    //buffer = Buffer.from(base64Image, 'base64');
    //const stream = Readable.from(buffer);
    //console.log(stream);
    //const file = {content: buffer};
    return stream;
  
}

/*
async function dataURLtoFile(base64Image) {
  fs.writeFileSync("image.png", base64Image);
  const stream = fs.createReadStream("image.png");

  buffer = Buffer.from(base64Image, 'base64');
  //const stream = Readable.from(buffer);
  console.log(stream);
  const file = {content: buffer};
  return stream;
}
*/

/*
var arr = dataurl.split(',');
    buffer = Buffer.from(arr[1], 'base64');
    mime = arr[0].match(/:(.*?);/)[1];
    const blob = new Blob(buffer, {type: mime});
    const arrayBuffer = await blob.arrayBuffer()
    console.log(typeof arrayBuffer)
    console.log(typeof blob)
*/


Meteor.methods({
    'uploadToIPFS': async function (args) {
        console.log(await dataURLtoFile(args.file))
        const added = await client.add(
            await dataURLtoFile(args.file),
            {
              progress: (prog) => console.log(`received: ${prog}`)
            }
          );
        console.log(added);
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