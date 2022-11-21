import { ethers } from 'ethers';
import BH_HouseT_abi from "../abis/BH_HouseT.json";
import BH_FungibleBlockhouse_abi from "../abis/BH_FungibleBlockhouse.json";

let addresses;
import addresses_mainnet from "./addresses_mainnet.json";
import addresses_testnet from "./addresses.json";
if(true){
  addresses = addresses_mainnet;
}
import { getSigner, getSimpleSigner } from "./utils";

const BH_HouseT_address = addresses.BH_HouseT_address;
const BH_FungibleBlockhouse_address = addresses.BH_FungibleBlockhouse_address;

async function add_address_whitelist(loggedInAddress) {
    //alert("Executing. Please open wallet connect or metamask.");
    const amount = document.getElementById("amount").value;
    const signer = await getSigner(loggedInAddress);
    const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
    const transaction = await contract.add_address_whitelist(loggedInAddress, amount);
    
    await transaction.wait();
  }

async function remove_address_whitelist(loggedInAddress) {
  //alert("Executing. Please open wallet connect or metamask.");
  const address = document.getElementById("address").value;
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  //const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
  const transaction = await contract.remove_address_whitelist(address);
  
  await transaction.wait();
}

async function is_in_whitelist_whitelist(loggedInAddress, address = "") {
  if(address == ""){
    address = document.getElementById("address").value;
  }
  //console.log("is_in_whitelist")
  const signer = await getSimpleSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  const result = await contract.is_in_whitelist(address);
  //console.log(result)
  return result;
}


async function distribute_profit(loggedInAddress) {
  //alert("Executing. Please open wallet connect or metamask.");
  const address = document.getElementById("address").value || "";
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  try {
    const transaction = await contract.distribute_profit(address);
    
    await transaction.wait();
  } catch (error) {
    console.error(error);
    alert("There was an error. Please make sure the input is correct.")
    // expected output: ReferenceError: nonExistentFunction is not defined
    // Note - error messages will vary depending on browser
  }
}


async function check_current_profits(loggedInAddress) {
  //alert("Executing. Please open wallet connect or metamask.");
  const address = document.getElementById("address").value;
  const signer = await getSimpleSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  //const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
  const result = await contract.check_current_profits(address);
  alert(result);
}


async function Add_HouseT_entilted_amount(loggedInAddress) {
  //alert("Executing. Please open wallet connect or metamask.");
  const address = document.getElementById("address").value;
  const value = document.getElementById("value").value;
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  //const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
  const transaction = await contract.Add_HouseT_entilted_amount(address, value);
  
  await transaction.wait();
}

async function update_URI(loggedInAddress, tokenID = 0, URI = "") {
  
  alert("Listing batch of tokens. Please open wallet connect or metamask.");
  tokenID = 0;
  URI = "https://blockhouse.infura-ipfs.io/ipfs/QmZ4AVSrnca4REMpYGQ4qwJEpqrPu71Vr5s3gtdge5YJJ4"
  if(URI == ""){
    URI = document.getElementById("URI").value;
  }
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  const transaction = await contract.update_URI([tokenID], [URI], {
    gasLimit: 1000000,
  });
  await transaction.wait();
  list_HouseT_batch
  
  /*alert("Updating batch of URIs. Please open wallet connect or metamask.");
  tokenID = 0;
  URI = "https://blockhouse.infura-ipfs.io/ipfs/QmZ4AVSrnca4REMpYGQ4qwJEpqrPu71Vr5s3gtdge5YJJ4"
  if(URI == ""){
    URI = document.getElementById("URI").value;
  }
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  const transaction = await contract.update_URI([tokenID], [URI], {
    gasLimit: 1000000,
  });
  await transaction.wait();*/

  /*alert("Updating URI. Please open wallet connect or metamask.");
  tokenID = 0;
  URI = "https://blockhouse.infura-ipfs.io/ipfs/QmZ4AVSrnca4REMpYGQ4qwJEpqrPu71Vr5s3gtdge5YJJ4"
  if(URI == ""){
    URI = document.getElementById("URI").value;
  }
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  const transaction = await contract.update_URI(tokenID, URI, {
    gasLimit: 1000000,
  });
  await transaction.wait();*/
}

async function mint_HouseT(loggedInAddress, URI = "", bookvalue = 0, total_number_payments = 0) {
  //alert("Executing. Please open wallet connect or metamask.");
  if(URI == ""){
    URI = document.getElementById("URI").value;
  }
  const signer = await getSigner(loggedInAddress);
  const contract = new ethers.Contract(BH_HouseT_address, BH_HouseT_abi.abi, signer);
  console.log(loggedInAddress)
  console.log(URI)
  console.log(bookvalue)
  console.log(total_number_payments)
  const transaction = await contract.mint_HouseT_with_info(loggedInAddress, URI, bookvalue * (10**6), 99999, {
    gasLimit: 10000000,
  });
  await transaction.wait();
}

export { add_address_whitelist, remove_address_whitelist, is_in_whitelist_whitelist, distribute_profit, check_current_profits, Add_HouseT_entilted_amount, update_URI, mint_HouseT }