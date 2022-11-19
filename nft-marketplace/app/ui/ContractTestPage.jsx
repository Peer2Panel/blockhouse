import React, { useState } from 'react';
import { Button } from "./components/Button";
import { useNavigate, useOutletContext } from "react-router-dom";

import addresses_mainnet from "./contract_functions/addresses_mainnet.json";
import addresses_testnet from "./contract_functions/addresses.json";
let addresses;
if(true){
  addresses = addresses_mainnet;
}
import { mintUSDC } from "./contract_functions/USDC_test";
import { stake_HouseT, unstake_HouseT, update_HouseT_value, exchange_FBH_TO_USDC, approve_USDC, exchange_USDC_TO_FBH } from "./contract_functions/BH_FungibleSolar";
import { buy_HouseT, list_HouseT, unlist_HouseT, get_USDC_Balcance } from "./contract_functions/BH_MarketPlace";
import { add_address_whitelist, remove_address_whitelist, is_in_whitelist_whitelist, distribute_profit, check_current_profits, Add_HouseT_entilted_amount, mint_HouseT } from "./contract_functions/BH_HouseT";
import { onChangeIPFS, uploadToIPFS, switchToPolygon, addFungibleBlockhouseToWallet, addUSDCToWallet } from "./contract_functions/utils";

export default function ContractTestPage() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
  const [web3, connected, setConnection, onConnect, resetApp, loggedInAddress] = useOutletContext();

  const [amount, setAmount] = useState(0);
  const [blockchain_address, setAddress] = useState("");
  const [tokenID, setTokenID] = useState(0);

  onChange = (e) => {
    const new_value = e.target.value;
    const type = e.target.name;
    if(type == "blockchain_address"){
      setAddress(new_value);
    }
    else if(type == "amount"){
      setAmount(new_value);
    }
    else if(type == "tokenID"){
      setTokenID(new_value);
    }
  }

  return (
    <div style={{maxWidth: "48rem"}} className=" mx-auto mt-14 mb-2.5 px-2 sm:px-0 ">
      <h2 className="text-h2 text-rhino font-bold text-center">Test Smart Contracts</h2>
      <br />
      <div>
        <h3>1. USDC Contract (testnet only)</h3>
        <div><i>{addresses.USDC_address}</i></div>
        <blockquote>Mints USDC for testnet</blockquote>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="amount"
            placeholder="Amount"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="amount"
            value={amount}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Mint" onClick={()=>mintUSDC(loggedInAddress)} />
        </label>
      </div>
      <br />
      <div>
        <h3>2. HouseT Contract</h3>
        <div><i>{addresses.BH_HouseT_address}</i></div>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="blockchain_address"
            // https://stackoverflow.com/questions/12374442/chrome-ignores-autocomplete-off strange world
            value={blockchain_address} 
            autoComplete={"none"} 
            placeholder="blockchain address"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="blockchain_address"
          />
          <input
            onChange={onChange}
            type="text"
            name="name"
            placeholder="Name"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="name"
          />
          <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Add to whitelist" onClick={() => add_address_whitelist(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="blockchain_address"
            value={blockchain_address} 
            autoComplete={"none"}
            placeholder="blockchain address"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="blockchain_address"
          />
          <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Remove from whitelist" onClick={() => remove_address_whitelist(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="blockchain_address"
            value={blockchain_address} 
            autoComplete={"none"}
            placeholder="blockchain address"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="blockchain_address"
          />
          <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Is in whitelist" onClick={() => is_in_whitelist_whitelist(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="blockchain_address"
            value={blockchain_address} 
            autoComplete={"none"}
            placeholder="blockchain address"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="blockchain_address"
          />
          <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Distribute profit from contract to wallet" onClick={() => distribute_profit(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="blockchain_address"
            value={blockchain_address} 
            autoComplete={"none"}
            placeholder="blockchain address"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="blockchain_address"
          />
          <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Check profit" onClick={() => check_current_profits(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="number"
            name="tokenID"
            placeholder="TokenID"
            className=" border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
          <input
            onChange={onChange}
            type="number"
            name="value"
            placeholder="Value"
            className="border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="value"
            value={amount}
          />
          <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Add HouseT entilted amount for token" onClick={() => Add_HouseT_entilted_amount(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="URI"
            placeholder="URI"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="URI"
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Mint HouseT" onClick={() => mint_HouseT(loggedInAddress)} />
        </label>
      </div>
      <br />
      <div>
        <h3>3. BHMarketplace Contract</h3>
        <div><i>{addresses.BH_MarketPlace_address}</i></div>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="tokenID"
            className="border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
           <input
            onChange={onChange}
            type="text"
            name="price"
            placeholder="price"
            className="border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="price"
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="List HouseT" onClick={() => list_HouseT(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="tokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Unlist HouseT" onClick={() => unlist_HouseT(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="tokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Buy HouseT" onClick={() => buy_HouseT(loggedInAddress)} />
        </label>
        <div style={{padding: "20px"}}>
          <h3>3.1. Price Stability Mechanism (PSM)</h3>
          <label htmlFor="file" className="flex relative">
            <input
              onChange={onChange}
              type="text"
              name="Amount"
              placeholder="Amount in contract"
              className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
              id="balance"
              disabled
            />
              <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Check balance" onClick={() => get_USDC_Balcance(loggedInAddress)} />
          </label>
          <label htmlFor="file" className="flex relative">
            <input
              onChange={onChange}
              type="text"
              name="Amount"
              placeholder="Amount"
              className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
              id="amount"
              value={amount}
            />
              <Button disabled className="bg-rhino absolute top-1 right-1 bottom-1" text="Change USDC to FBH 1:1 - tbd" onClick={() => exchange_USDC_TO_FBH(loggedInAddress)} />
          </label>
          <label htmlFor="file" className="flex relative">
            <input
              onChange={onChange}
              type="text"
              name="Amount"
              placeholder="Amount"
              className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
              id="amount"
              value={amount}
            />
              <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Approve USDC" onClick={() => approve_USDC(loggedInAddress)} />
          </label>
          <label htmlFor="file" className="flex relative">
            <input
              onChange={onChange}
              type="text"
              name="Amount"
              placeholder="Amount"
              className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
              id="amount"
              value={amount}
            />
              <Button disabled className="bg-rhino absolute top-1 right-1 bottom-1" text="Change FBH to USDC 1:1 - tbd" onClick={() => exchange_FBH_TO_USDC(loggedInAddress)} />
          </label>
        </div>
      
      
      </div>
      <br />
      <div>
        <h3>4. FungibleSolar Contract</h3>
        <div><i>{addresses.BH_FungibleSolar_address}</i></div>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="TokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Stake HouseT to receive FBH" onClick={() => stake_HouseT(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="TokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Unstake HouseT / return FBH" onClick={() => unstake_HouseT(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="number"
            name="tokenID"
            placeholder="TokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            value={tokenID}
          />
          <input
            onChange={onChange}
            type="number"
            name="value"
            placeholder="New USDC value"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="value"
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Update_HouseT_value" onClick={() => update_HouseT_value(loggedInAddress)} />
        </label>
      </div>
      <br />
      <div>
        <h3>5. General</h3>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={(e) => onChangeIPFS(e, setFileUrl)}
            type="file"
            name="Asset"
            className="file:hidden w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="fileIPFS"
          />
          <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Upload to IPFS" onClick={(e) => document.querySelector('#fileIPFS').click()} />
        </label>
        {fileUrl && <img src={fileUrl} />}
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="tokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Switch network to Polygon Testnet" onClick={() => switchToPolygon(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="tokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Add FBH to wallet" onClick={() => addFungibleBlockhouseToWallet(loggedInAddress)} />
        </label>
        <label htmlFor="file" className="flex relative">
          <input
            onChange={onChange}
            type="text"
            name="tokenID"
            placeholder="tokenID"
            className="w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="tokenID"
            value={tokenID}
          />
            <Button className="bg-rhino absolute top-1 right-1 bottom-1" text="Add USDC to wallet" onClick={() => addUSDCToWallet(loggedInAddress)} />
        </label>
      </div>
    </div>
  )
}
