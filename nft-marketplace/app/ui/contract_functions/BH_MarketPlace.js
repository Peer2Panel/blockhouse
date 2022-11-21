import Web3Modal from 'web3modal';
import { getProviderOptions } from "../util/ethers_utils";
import { ethers } from 'ethers';
import BH_MarketPlace_abi from "../abis/BH_MarketPlace.json";
import BH_HouseT_abi from "../abis/BH_HouseT.json";
import BH_FungibleBlockhouse_abi from "../abis/BH_FungibleBlockhouse.json";
import USDC_test_abi from "../abis/USDC_testnet.json";

import addresses_mainnet from "./addresses_mainnet.json";
import addresses_testnet from "./addresses.json";
let addresses;
if(true){
  addresses = addresses_mainnet;
}

import { getSigner, getSimpleSigner } from "./utils";

import { balanceOfUSDC } from "./USDC_test";
import { areOptionsEqual } from '@mui/base';

const BH_MarketPlace_address = addresses.BH_MarketPlace_address;
const BH_HouseT_address = addresses.BH_HouseT_address;
const BH_FungibleBlockhouse_address = addresses.BH_FungibleBlockhouse_address;

async function buy_HouseT(loggedInAddress, tokenID = "", setApprove = ()=>{}) {
    //alert("Executing. Please open wallet connect or metamask.");
    if(tokenID == ""){
      tokenID = document.getElementById("tokenID").value;
    }
    const signer = await getSigner(loggedInAddress);

    const balance = await balanceOfUSDC(loggedInAddress);
    const marketPlaceContract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);
    const listing_price = (await marketPlaceContract.HouseT_Price(tokenID)).toNumber();
    //console.log(balance)
    //console.log(listing_price)
    if(balance < listing_price){
      alert("You do not have enough USDC to buy this token.");
      return;
    }

    //alert("Please approve USDC spending first.");
    const USDCcontract = new ethers.Contract(addresses.USDC_address, USDC_test_abi.abi, signer);
    const allowance = await USDCcontract.allowance(loggedInAddress, addresses.BH_MarketPlace_address);
    if(allowance < listing_price){
      setApprove(true);
      return;
    }
 
    const contract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);
    const transaction = await contract.buy_HouseT(tokenID);
    await transaction.wait();
  }

async function approve_USDC(loggedInAddress, tokenID = "", setApprove = ()=>{}) {
  if(tokenID == ""){
    tokenID = document.getElementById("tokenID").value;
  }
  const signer = await getSigner(loggedInAddress);
  const marketPlaceContract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);
  const listing_price = (await marketPlaceContract.HouseT_Price(tokenID)).toNumber();

  const USDCcontract = new ethers.Contract(addresses.USDC_address, USDC_test_abi.abi, signer);
  const amountEther = ethers.utils.parseUnits(listing_price+"", 'ether');
  const transactiona = await USDCcontract.approve(addresses.BH_MarketPlace_address, amountEther);
  await transactiona.wait();
  setApprove(false);
}

async function list_HouseT(loggedInAddress, tokenID = "", listing_price = "", setSellItem = ()=>{}, setApprove = ()=>{}) {
  //alert("Executing. Please open wallet connect or metamask.");
  if(tokenID == ""){
    tokenID = document.getElementById("tokenID").value;
  }
  if(listing_price == ""){
    listing_price = document.getElementById("price").value;
  }

  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);

  const houseTContract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  
  const approved_address = await houseTContract.getApproved(tokenID);
  if(approved_address != BH_MarketPlace_address){
    setApprove(true);
    return;
  }

  // accepts ether value as input
  const transaction = await contract.list_HouseT(tokenID, listing_price * 10**6);
  await transaction.wait();

  //const marketPlaceContract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);
  //const listed_price = (await marketPlaceContract.HouseT_Price(tokenID)).toNumber();
  //console.log(listed_price)

  //await loadNFT();
  setSellItem(false);
}

async function approve_HouseT(loggedInAddress, tokenID = "", listing_price = "", setApprove = ()=>{}) {
  if(tokenID == ""){
    tokenID = document.getElementById("tokenID").value;
  }
  const signer = await getSigner(loggedInAddress);
  const houseTContract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  //alert("Please approve listing your token.")
  const transactiona = await houseTContract.approve_listing(tokenID);
  await transactiona.wait();
  setApprove(false);
}

async function list_HouseT_batch(loggedInAddress, tokenID = "", listing_price = "", setSellItem = ()=>{}) {
  //alert("Executing. Please open wallet connect or metamask.");
  const tokenIDs = [...Array(50).keys()];

  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);

  const houseTContract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  
  alert("Please approve listing your token.")
  //const transactiona = await houseTContract.approve_listing_batch(tokenIDs);
  //await transactiona.wait();

  // accepts ether value as input
  const transaction = await contract.list_HouseT_batch(tokenIDs, Array(50).fill(420 * 10**6));
  await transaction.wait();

  setSellItem(false);
}

async function unlist_HouseT(loggedInAddress, tokenID = "") {
  //alert("Executing. Please open wallet connect or metamask.");
  if(tokenID == ""){
    tokenID = document.getElementById("tokenID").value;
  }
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);
  const transaction = await contract.unlist_HouseT(tokenID);
  await transaction.wait();

  await loadNFT();
}

async function loadNFTs(loggedInAddress, setNfts, setLoadingState, loadAll = false) {
  //console.log("lNFT1")
  let signer;
  if(loadAll){
    const provider = new ethers.providers.JsonRpcProvider('https://aurora-mainnet.infura.io/v3/40ebc8fff15d4ca6aaa594d4d87710cd');
    signer = provider.getSigner(loggedInAddress);
    //console.log(signer)
  }
  else{
    signer = await getSimpleSigner(loggedInAddress);
  }

  const houseTContract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  const allInfo = await houseTContract.get_all_HouseT_info();

  console.log(allInfo)

  const [addresses, metadata, listed, staked, concatenated_uint] = allInfo;
  const [bookvalue, listing_prices, earned_profits,remaining_payment_list] = concatenated_uint;
  const fungibleBlockhouseContract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);

  const ownerList_Marketplace = await houseTContract.get_list_of_HouseT_owner();
  const ownerList_Staking = (await fungibleBlockhouseContract.get_list_of_HouseT_staker())["0"];
  let myTokenIDs;
  if(loadAll){
    myTokenIDs = ownerList_Marketplace.map((_, idx) => idx);
  }
  else{
    const myTokenIDs_Marketplace = ownerList_Marketplace.map((ownerAddress, idx) => ownerAddress == loggedInAddress ? idx : '').filter(String);
    const myTokenIDs_Staking = ownerList_Staking.map((ownerAddress, idx) => ownerAddress == loggedInAddress ? idx : '').filter(String);
    myTokenIDs = myTokenIDs_Marketplace.concat(myTokenIDs_Staking);
  }

  const processTokenId = async (tokenId) => {
    //const tokenURI = await houseTContract.tokenURI(tokenId);
    const tokenURI = metadata[tokenId];
    const meta = JSON.parse(await (await fetch(`${tokenURI}`).then((response) => {
      return response.text();
    })));

    const is_listed = listed[tokenId];
    const is_staked = staked[tokenId];
    const price_ = bookvalue[tokenId] / 10**6 || 0;
    const price = price_ < 0.001 ? 0 : price_;
    const listing_price_BigInt = listing_prices[tokenId]; 
    const listing_price = listing_price_BigInt / 10**6 || 0;
    const badge = is_listed ? "for sale" : is_staked ? "staked" : "owned";
    const earned_profit_BigInt = earned_profits[tokenId];
    const earned_profit = earned_profit_BigInt / 10**6 || 0;
    const remaining_payments = remaining_payment_list[tokenId];

    let item = {
      monthly_return: meta.price || meta.expected_return,
      price,
      listing_price,
      badge,
      tokenId,
      seller: is_staked ? ownerList_Staking[tokenId] : ownerList_Marketplace[tokenId],
      owner: is_staked ? ownerList_Staking[tokenId] : ownerList_Marketplace[tokenId],
      name: meta.name,
      serialnumber: meta.serialnumber,
      image: meta.image,
      description: meta.description,
      earned: earned_profit,
      staked: is_staked,
      listed: is_listed,
      tokenURI,
      remaining_payments,
      itemCountry: meta.country
    };

    return item;
  }

  const items = []
  for (var i = 0; i < myTokenIDs.length; i++) {
    const tokenId = myTokenIDs[i];
    const item = await processTokenId(tokenId);
    items.push(item);
  }

  setNfts(items);
  setLoadingState('loaded');
}

async function loadNFT(loggedInAddress, tokenId, setNft, setLoadingState) {
  const signer = await getSimpleSigner(loggedInAddress);

  const houseTContract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  const tokenURI = await houseTContract.tokenURI(parseInt(tokenId));
  const fungibleBlockhouseContract = new ethers.Contract(BH_FungibleBlockhouse_address, BH_FungibleBlockhouse_abi.abi, signer);
  const marketPlaceContract = new ethers.Contract(BH_MarketPlace_address, BH_MarketPlace_abi.abi, signer);
  const ownerList_Staking = (await fungibleBlockhouseContract.get_list_of_HouseT_staker())["0"];

  const ownerList_Marketplace = await houseTContract.get_list_of_HouseT_owner();
  console.log(tokenURI)
  const meta = JSON.parse(await (await fetch(`${tokenURI}`).then((response) => {
    return response.text();
  })));
  const listing_price_BigInt = (await marketPlaceContract.HouseT_Price(tokenId));
  const listing_price = listing_price_BigInt / 10**6 || 0;
  const is_listed = listing_price != 0;
  const is_staked = await fungibleBlockhouseContract.HouseT_Owner(tokenId) !=0;

  const badge = is_listed ? "for sale" : is_staked ? "staked" : "owned";
  const priceBigInt = await fungibleBlockhouseContract.HouseT_Values(parseInt(tokenId));
  const price_ = priceBigInt / 10**6 || 0;
  const price = price_ < 0.001 ? 0 : price_;
  const earned_profit_BigInt = await houseTContract.Generated_profit_per_panel(parseInt(tokenId))
  const earned_profit = earned_profit_BigInt / 10**6 || 0;
  const remaining_payments = await fungibleBlockhouseContract.HouseT_Remaining_payments(parseInt(tokenId));

  console.log(meta)
  let item = {
    monthly_return: meta.price || meta.expected_return,
    price,
    listing_price,
    badge,
    tokenId,
    seller: is_staked ? ownerList_Staking[tokenId] : ownerList_Marketplace[tokenId],
    owner: is_staked ? ownerList_Staking[tokenId] : ownerList_Marketplace[tokenId],
    name: meta.name,
    serialnumber: meta.serialnumber,
    image: meta.image,
    description: meta.description,
    earned: earned_profit,
    staked: is_staked,
    listed: is_listed,
    tokenURI,
    remaining_payments: remaining_payments.toString(),
    itemCountry: meta.country
  };

  setNft(item);
  setLoadingState('loaded');
}

export { buy_HouseT, approve_USDC, approve_HouseT, list_HouseT, list_HouseT_batch, unlist_HouseT, loadNFTs, loadNFT }