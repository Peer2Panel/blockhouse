# NFT Marketplace

This is from Nader's tutorial, but with Meteor. You can check the original tutorial here: https://dev.to/edge-and-node/building-scalable-full-stack-apps-on-ethereum-with-polygon-2cfb

To run it locally, you will need to open two terminals.

## Installation
`meteor npm install` 


## Development
`meteor` -- IMPORTANT!! must be run in root folder due to tailwind.css

## Deployment
### Smart contracts
The `npx hardhat node` command will give you 20 accounts for you to test locally. 

```
npx hardhat run scripts/deploy.js --network localhost
export privateKey="your-private-key"
npx hardhat run scripts/deploy.js --network mumbai
meteor
```

### Application
```
cd .deploy && mup deploy --verbose
```
*Deployed on AWS VM*




## How to test our deployed version

You can check our deployed version using this link: https://meteor-nft-marketplace.meteorapp.com

To use this version you will need to add the Mumbai Testnet to your Metamask. You can do it by following the screenshots from Nader's tutorial. You will go to Metamask settings:

![1](https://user-images.githubusercontent.com/41165990/171486860-3f06f3ea-1915-48c2-9cb8-7b58b66c4127.png)

Then Networks and then Add Network.

![2](https://user-images.githubusercontent.com/41165990/171486872-855eca67-a453-4cc3-945e-16a8774c1edb.png)

After that, you will add the following info from Polygon [docs](https://docs.polygon.technology/docs/develop/network-details/network/):

Network Name: Mumbai TestNet

New RPC URL: https://rpc-mumbai.maticvigil.com

Chain ID: 80001

Currency Symbol: Matic

Click save and then you should be able to switch to this new network and use it. You will need some testnet Matic tokens, but you can get them [here](https://faucet.matic.network/)

## Screenshots of the application

![Screenshot 2022-05-25 at 11-23-41 Dummy Page](https://user-images.githubusercontent.com/41165990/170509257-e4adabaa-c0d4-4d4d-9fb5-4a4e851f365e.png)

![Screenshot 2022-06-28 at 23-51-54 Dummy Page](https://user-images.githubusercontent.com/41165990/176348036-67f4d3fd-8eba-4cde-bacb-c14abecef9ed.png)

![Screenshot 2022-06-28 at 23-52-15 Dummy Page](https://user-images.githubusercontent.com/41165990/176348065-05ef0658-3366-4eca-bbf8-db729b057b19.png)

![Screenshot 2022-06-28 at 23-53-22 Dummy Page](https://user-images.githubusercontent.com/41165990/176348085-3896af2b-2e36-41d1-9df5-e1e7de7c7d98.png)

![Screenshot 2022-06-28 at 23-54-11 Dummy Page](https://user-images.githubusercontent.com/41165990/176348099-baadb92b-9a8b-4db0-ae47-ccce00e02625.png)
