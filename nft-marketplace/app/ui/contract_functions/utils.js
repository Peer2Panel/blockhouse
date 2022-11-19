

import Web3Modal from 'web3modal';
import { getProviderOptions } from "../util/ethers_utils";
import { ethers } from 'ethers';
import addresses from "./addresses.json";
import addresses_mainnet from "./addresses_mainnet.json";
import Web3 from "web3";
import { Biconomy } from "@biconomy/mexa";

const USDC_address = addresses.USDC_address;
const BH_FungibleSolar_address = addresses.BH_FungibleSolar_address;
const BH_HouseT_address = addresses.BH_HouseT_address;
const BH_MarketPlace_address = addresses.BH_MarketPlace_address;

const USDC_address_mainnet = addresses_mainnet.USDC_address;
const BH_FungibleSolar_address_mainnet = addresses_mainnet.BH_FungibleSolar_address;
const BH_HouseT_address_mainnet = addresses_mainnet.BH_HouseT_address;
const BH_MarketPlace_address_mainnet = addresses_mainnet.BH_MarketPlace_address;

const mainnet = "https://polygon-mainnet.infura.io/v3/52d870bea786485393defdf70053a904";
const mumbai = "https://polygon-mumbai.infura.io/v3/52d870bea786485393defdf70053a904";

//const mainnet_vigil = "https://rpc-mainnet.maticvigil.com/v1/d18c4ef3633bbba571022437f4755bc505138762"
//const testnet_vigil = "https://rpc-mumbai.maticvigil.com/v1/d18c4ef3633bbba571022437f4755bc505138762", // or infuraId

function getWeb3Modal() {
  //const network_status = localStorage.getItem("network") == "true";
  const providerOptions = getProviderOptions();
  const web3Modal = new Web3Modal({
    //network: network_status ? "matic" : "mumbai", // matic, mumbai
    //rpc: network_status ? mainnet : mumbai,
    //infuraId: "52d870bea786485393defdf70053a904",
    //chainId: network_status ? 137 : 80001,
    cacheProvider: true,
    providerOptions
  });
  return web3Modal;
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function getSimpleSigner(loggedInAddress) {
  const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
  const signer = provider.getSigner(loggedInAddress);
  return signer;
}

let provider;
async function getSigner(loggedInAddress) {
  //await delay(10); // prevent having more than 40 rpc requests per minute which can crash metamask, smart contracts will be updated
  const network_status = true; // localStorage.getItem("network") == "true";
  const gasless_status = false; // localStorage.getItem("gasless") == "true";

  if(!provider){
    const web3Modal = getWeb3Modal();
    const connection = await web3Modal.connect();
    await connection.enable();
    provider = new ethers.providers.Web3Provider(connection);
  }
  
  if(gasless_status || gasless_status == null) {

    const biconomy = new Biconomy(provider.provider, { // provider.provider or window.ethereum
      apiKey: network_status ? "HlTosOkeC.f8d893b9-2d2c-4689-bd6b-693b8b1acae7" : "0pczykuSe.b08b47ed-1162-4b7b-aab7-facfe50912a0",
      contractAddresses: network_status ? [ USDC_address_mainnet, BH_FungibleSolar_address_mainnet, BH_HouseT_address_mainnet, BH_MarketPlace_address_mainnet ] : 
      [ USDC_address, BH_FungibleSolar_address, BH_HouseT_address, BH_MarketPlace_address ],
      debug: true,
      strictMode: true
      });      
    let ethersProvider = new ethers.providers.Web3Provider(biconomy.provider);
  
    await biconomy.init();
    biconomy.on("txMined", (data) => {
      // Event emitter to monitor when a transaction is mined
      console.log("transaction data", data);
    });
    biconomy.on("txHashGenerated", (data) => {
        // Event emitter to monitor when a transaction hash is generated
        console.log("transaction data", data);
    });
    biconomy.on("txHashChanged", (data) => {
        // Event emitter to monitor when a transaction hash is changed in case of gas price bump
        console.log("transaction data", data);
    });
    biconomy.on("error", (data) => {
        // Event emitter to monitor when an error occurs
        console.log("transaction data", data);
    });
    console.log(`Biconomy initialized`); 

    const signer = ethersProvider.getSigner(loggedInAddress)
    return signer;
  }

  else {
    //return biconomy.ethersProvider;
    const signer = provider.getSigner(loggedInAddress);
    return signer;
  }
}

async function getBase64(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  })
}

async function onChangeIPFS(e, setFileUrl) {  
  const file = e.target.files[0];
  try {
    await Meteor.call("uploadToIPFS", {file: await getBase64(file)}, (error, result) => { 
      const url = `https://blockhouse.infura-ipfs.io/ipfs/${result.path}`;
      setFileUrl(url);
     }
    );
  } catch (error) {
    console.log('Error uploading file: ', error);
  }
}

async function uploadToIPFS (formInput, fileUrl, callback) {
  let { name, serialnumber, description, price, total_number_payments, country } = formInput;
  description = description || " "; // add default for description, which seems not working from form
  if (!name || !serialnumber || !description || !price || !fileUrl || !total_number_payments || !country) {
    console.log(name)
    console.log(serialnumber)
    console.log(description)
    console.log(price)
    console.log(fileUrl)
    console.log(total_number_payments)
    console.log(country)
    alert("Please fill out all fields!")
    return -1;
  }
  /* first, upload to IPFS */
  const data = JSON.stringify({
    name, serialnumber, description, image: fileUrl, expected_return: price, total_number_payments, country
  });
  try {
    await Meteor.call("uploadToIPFSSimple", {data}, (error, result) => { 
      console.log(result)
      const url = `https://blockhouse.infura-ipfs.io/ipfs/${result.path}`;
      callback(url);
     }
    );
  } catch (error) {
    console.log('Error uploading file: ', error);
  }
}


async function switchToPolygon(loggedInAddress, chainId = 80001){
  const switchNetwork = async (chainId) => {

    const currentChainId = parseInt(ethereum.chainId);
    console.log(currentChainId) 
    if (currentChainId !== chainId) {
      try {
        console.log("requesting")
        await web3.currentProvider.request({
          method: 'wallet_switchEthereumChain',
            params: [{ chainId: Web3.utils.toHex(chainId) }],
          });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          alert('add this chain id')
        }
        console.log(switchError)
      }
    }
    else(
      alert("already on correct network!")
    )
  }
  switchNetwork(chainId) // 80001 is Polygon Mumbai Testnet, 137 is Polygon Mainnet
}

async function addFungibleBlockhouseToWallet(loggedInAddress){
  const tokenAddress = addresses.BH_FungibleSolar_address;
  const tokenSymbol = 'FBH';
  const tokenDecimals = 18;
  const tokenImage = 'https://blockhouse.jonathanlehner.com/images/blockhouse-icon.jpeg';

  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });

    if (wasAdded) {
      console.log('FBH was added!');
    } else {
      console.log('Your loss!');
    }
  } catch (error) {
    console.log(error);
  }
}

async function addUSDCToWallet(loggedInAddress){
  const tokenAddress = addresses.USDC_address;
  const tokenSymbol = 'BH-USDC';
  const tokenDecimals = 18;
  const tokenImage = 'https://build.Blockhouse.com/images/usdc-icon.jpeg';

  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });

    if (wasAdded) {
      console.log('BH-USDC was added!');
    } else {
      console.log('Your loss!');
    }
  } catch (error) {
    console.log(error);
  }
}


export { getWeb3Modal, getSigner, getSimpleSigner, onChangeIPFS, uploadToIPFS, switchToPolygon, addFungibleBlockhouseToWallet, addUSDCToWallet }