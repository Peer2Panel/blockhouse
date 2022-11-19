import Web3Modal from 'web3modal';
import { getProviderOptions } from "../util/ethers_utils";
import { ethers } from 'ethers';
import USDC_test_abi from "../abis/USDC_testnet.json";
let addresses;
import addresses_mainnet from "./addresses_mainnet.json";
import addresses_testnet from "./addresses.json";
if(true){
  addresses = addresses_mainnet;
}
import { getSigner, getSimpleSigner} from "./utils";

const USDC_address = addresses.USDC_address;

async function balanceOfUSDC(loggedInAddress) {
  const signer = await getSimpleSigner(loggedInAddress);
  const contract = new ethers.Contract(USDC_address, USDC_test_abi.abi, signer);
  const result = await contract.balanceOf(loggedInAddress);
  return result;
}

async function mintUSDC(loggedInAddress) {
    const amount = document.getElementById("amount").value;
    if(!amount){
      alert("Please specify how much BH-USDC to mint!");
      return;
    }
    //alert("Executing. Please open wallet connect or metamask.");
    const amountEther = ethers.utils.parseUnits(amount, 'ether');
    const signer = await getSigner(loggedInAddress);
    const contract = new ethers.Contract(USDC_address, USDC_test_abi.abi, signer);
    const transaction = await contract.mint(loggedInAddress, amountEther, {
      gasLimit: 1000000,
    });
    
    await transaction.wait();
  }


export { balanceOfUSDC, mintUSDC }