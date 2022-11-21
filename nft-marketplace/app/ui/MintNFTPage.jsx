import React, { useState } from 'react';
import { Button } from "./components/Button";
import { InputField } from "./components/Fields/InputField";
import { useNavigate, useOutletContext } from "react-router-dom";
import { onChangeIPFS, uploadToIPFS, switchToNEAR, addFungibleBlockhouseToWallet, addUSDCToWallet } from "./contract_functions/utils";
import { add_address_whitelist, remove_address_whitelist, is_in_whitelist_whitelist, distribute_profit, check_current_profits, Add_HouseT_entilted_amount, update_URI, mint_HouseT } from "./contract_functions/BH_HouseT";
import { list_HouseT_batch } from "./contract_functions/BH_MarketPlace";

export default function MintNFTPage() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '', serialnumber: '', bookvalue: '', total_number_payments: '', country: '' });
  const [ web3_, connected, setConnection, onConnect, resetApp, loggedInAddress] = useOutletContext();
  const is_admin = loggedInAddress == "0xC117E7247be4830D169da13427311F59BD25d669" || loggedInAddress == "0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607"

  return (
    <div className="max-w-lg mx-auto mt-14 mb-2.5 px-2 sm:px-0 ">
      <h2 className="text-h2 text-rhino font-bold text-center">Mint HouseT token</h2>
      <div style={{padding: "20px"}}>Only the admins can use this form to mint tokens.
      <br />After minting, the tokens can be listed on the marketplace.</div>
      <div className="mt-20">
        <label htmlFor="file" className="flex relative">
          <input
            disabled={!is_admin} 
            type="file"
            name="Asset"
            className="file:hidden w-full border-2 border-porcelain bg-white text-manatee rounded-lg px-4 py-5"
            id="file"
            onChange={(e) => onChangeIPFS(e, setFileUrl)}
          />

          <Button disabled={!is_admin} className="bg-rhino absolute top-1 right-1 bottom-1" text="Upload" onClick={(e) => document.querySelector('#file').click()} />
        </label>
        {fileUrl && <img src={fileUrl} />}
        <p className="text-p text-manatee mt-2">Supported file types: JPG, GIF, PNG, list all supported types here. Max 50 Mb</p>

        <InputField
          disabled={!is_admin} 
          name='name'
          label="Address of house (e.g. Hegibachstrasse 110, 8032 Zurich)"
          value={formInput.name}
          classNameContainer="mt-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />

        <InputField
          disabled={!is_admin} 
          name='country'
          label="Country"
          value={formInput.country}
          classNameContainer="mt-4"
          onChange={e => updateFormInput({ ...formInput, country: e.target.value })}
        />

        <InputField
          disabled={!is_admin} 
          name='serialnumber'
          label="Registration number of company (AG)"
          value={formInput.serialnumber}
          classNameContainer="mt-4"
          onChange={e => updateFormInput({ ...formInput, serialnumber: e.target.value })}
        />

        <InputField
          disabled={!is_admin} 
          name='price'
          type='number'
          label="Expected monthly income in USDC"
          value={formInput.price}
          classNameContainer="mt-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />

        <InputField
          disabled={!is_admin} 
          name='bookvalue'
          type='number'
          label="Initial book value"
          value={formInput.bookvalue}
          classNameContainer="mt-4"
          onChange={e => updateFormInput({ ...formInput, bookvalue: e.target.value })}
        />

        <InputField
          disabled={!is_admin} 
          textArea
          name='description'
          label="Description (optional)"
          value={formInput.description}
          classNameContainer="mt-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />

        <p className="text-p text-manatee mt-2">Description will be included on the token details page next to the image.</p>


        <Button disabled={!is_admin} className="mt-4" text="Create Token" onClick={async ()=>{
            console.log(JSON.stringify(formInput))
            const URI = await uploadToIPFS(formInput, fileUrl, (URI) => {
              console.log(URI);
              mint_HouseT(loggedInAddress, URI, formInput.bookvalue, formInput.total_number_payments)
            });}    
          } />
        {!is_admin ? <div style={{padding: "10px"}}><i>Only admins can mint tokens.</i></div> : ""}

        {/*<Button disabled={!is_admin} className="mt-4" text="Update URI" onClick={async ()=>{
            console.log(JSON.stringify(formInput));
            await list_HouseT_batch(loggedInAddress);
            await update_URI(loggedInAddress, 0, "");
          }} />*/}
        {!is_admin ? <div style={{padding: "10px"}}><i>Only admins can update tokens.</i></div> : ""}
      </div>
    </div>
  )
}
