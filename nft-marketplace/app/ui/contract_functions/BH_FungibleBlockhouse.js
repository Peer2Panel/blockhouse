import Web3Modal from 'web3modal';
import { getProviderOptions } from "../util/ethers_utils";
import { ethers } from 'ethers';
import BH_FungibleBlockhouse_abi from "../abis/BH_FungibleBlockhouse.json";
import BH_HouseT_abi from "../abis/BH_HouseT.json";

let addresses;
import addresses_mainnet from "./addresses_mainnet.json";
import addresses_testnet from "./addresses.json";
if(true){
  addresses = addresses_mainnet;
}

import { getSigner, getSimpleSigner } from "./utils";
import USDC_test_abi from "../abis/USDC_testnet.json";

const BH_FungibleBlockhouse_address = addresses.BH_FungibleBlockhouse_address;
const BH_HouseT_address = addresses.BH_HouseT_address;

async function balanceOfFS(loggedInAddress) {
  const signer = await getSimpleSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
  const result = await contract.balanceOf(loggedInAddress);
  return result;
}

async function stake_HouseT(loggedInAddress, tokenID = "", setApproveStaking = ()=>{}) {
    //alert("Executing. Please open wallet connect or metamask.");
    if(tokenID == ""){
      tokenID = document.getElementById("tokenID").value;
    }
    const signer = await getSigner(loggedInAddress);
    const contract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
    const solarTContract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);

    // const owner = await solarTContract.ownerOf(tokenID);
    //const is_verified = await solarTContract.is_in_whitelist(loggedInAddress);
  
    //console.log(owner)
    /*if(!is_verified){
      alert("Only whitelisted addresses can use the loan service");
      return;
    }*/

    const approved_address = await solarTContract.getApproved(tokenID);
    if(approved_address != BH_FungibleBlockhouse_address){
      setApproveStaking(true);
      return;
    }  

    const transaction = await contract.stake_HouseT(tokenID);
    
    await transaction.wait();
  }

async function approve_HouseT_staking(loggedInAddress, tokenID = "", setApproveStaking = ()=>{}) {
    if(tokenID == ""){
      tokenID = document.getElementById("tokenID").value;
    }
    const signer = await getSigner(loggedInAddress);
    const solarTContract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
    const transactiona = await solarTContract.approve_staking(tokenID);
    await transactiona.wait();

    setApproveStaking(false);
  }

async function unstake_HouseT(loggedInAddress, tokenID = "") {
  //alert("Executing. Please open wallet connect or metamask.");
  if(tokenID == ""){
    tokenID = document.getElementById("tokenID").value;
  }
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
  const transaction = await contract.unstake_HouseT(tokenID);
  
  await transaction.wait();
}

async function update_HouseT_value(loggedInAddress) {
  //alert("Executing. Please open wallet connect or metamask.");
  const tokenID = document.getElementById("tokenID").value;
  const value = document.getElementById("value").value;
  const amountEther = ethers.utils.parseUnits(value, 'ether');
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
  //const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
  const transaction = await contract.update_HouseT_value(tokenID, amountEther);
  
  await transaction.wait();
}

async function exchange_FBH_TO_USDC(loggedInAddress, amount = "") {
  //alert("Executing. Please open wallet connect or metamask.");
  if(amount == ""){
    amount = document.getElementById("amount").value;
  }
  const amountEther = ethers.utils.parseUnits(amount, 'ether');
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
  const transaction = await contract.exchange_FBH_TO_USDC(amountEther);
  
  await transaction.wait();
}

async function exchange_USDC_TO_FBH(loggedInAddress, amount = "") {
  //alert("Executing. Please open wallet connect or metamask.");
  if(amount == ""){
    amount = document.getElementById("amount").value;
  }
  console.log(amount)
  const amountEther = ethers.utils.parseUnits(amount, 'ether');
  console.log(amountEther)
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
  console.log(contract)
  const transaction = await contract.exchange_USDC_TO_FBH(amountEther);
  
  await transaction.wait();
}

async function approve_USDC(loggedInAddress, amount = ""){
  //alert("Executing. Please open wallet connect or metamask.");
  if(amount == ""){
    amount = document.getElementById("amount").value;
  }
  const amountEther = ethers.utils.parseUnits(amount, 'ether');
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(addresses.USDC_address, USDC_test_abi.abi, signer);
  console.log(contract)
  console.log(amountEther)
  const transaction = await contract.approve(addresses.BH_FungibleBlockhouse_address, amountEther);
  
  await transaction.wait();
}

async function Amount_in_contract(loggedInAddress, setAmountInContract) {
  const signer = await getSimpleSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
  const amount = await contract.Amount_in_contract();
  const amountInFSContract = amount[0].toString();
  //const amountInMarketplaceContract = amount[1]; // currently not used
  const amountEther = ethers.utils.formatEther(amountInFSContract);
  setAmountInContract(amountEther);
}

export { Amount_in_contract, balanceOfFS, stake_HouseT, approve_HouseT_staking, unstake_HouseT, update_HouseT_value, exchange_FBH_TO_USDC, approve_USDC, exchange_USDC_TO_FBH }