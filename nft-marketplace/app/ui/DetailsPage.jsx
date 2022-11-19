import React from 'react';
import { useEffect, useState } from 'react';
import { Button } from "./components/Button";
import { RoutePaths } from "./common/RoutePaths";
import {Link, useNavigate, useParams, useOutletContext} from "react-router-dom";
import truncateEthAddress from "truncate-eth-address";
import { usePriceConverter } from "./util/usePriceConverter";
import { InputField } from "./components/Fields/InputField";
import { loadNFT, list_HouseT, unlist_HouseT, buy_HouseT, approve_USDC, approve_HouseT } from './contract_functions/BH_MarketPlace';
import addresses_mainnet from "./contract_functions/addresses_mainnet.json";
import addresses_testnet from "./contract_functions/addresses.json";
let addresses;
if(true){
  addresses = addresses_mainnet;
}
import Linkify from 'react-linkify';
import { SecureLink } from "react-secure-link"
import { stake_HouseT, approve_HouseT_staking, unstake_HouseT } from './contract_functions/BH_FungibleSolar';

export default function DetailsPage() {
  const [nft, setNft] = useState(null);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [sellItem, setSellItem] = useState(false);
  const [formInput, setFormInput] = useState({ price: '0' });
  const [approving, setApprove] = useState(false);
  const [approvingStaking, setApproveStaking] = useState(false);
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { converterData } = usePriceConverter();
  const [ web3_, connected, setConnection, onConnect, resetApp, loggedInAddress] = useOutletContext();
  const is_admin = loggedInAddress == "0xC117E7247be4830D169da13427311F59BD25d669" || loggedInAddress == "0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607"

  useEffect(() => {
    loadNFT(loggedInAddress, itemId, setNft, setLoadingState);
  }, []);


  return (
    <>
      <div className="max-w-7xl mx-auto mt-16 pt-2.5 px-2 sm:px-6 lg:px-8">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 w-full container mx-auto">
          {loadingState === 'loaded' && (
            nft ? (
              <>
                <div className="col-span-1">
                  <img src={nft.image.replace("ipfs.infura.io", "blockhouse.infura-ipfs.io")} alt="NFT image"/>
                </div>

                <div className="col-span-2">
                  <h2 className="text-h2 text-rhino font-bold">{nft.name}</h2>
                  <p className="text-p text-manatee mt-2 mb-8">Owned by <Link className="text-dodger" to={`${RoutePaths.ACCOUNT}/${nft.owner}`}>{truncateEthAddress(nft.owner)} {is_admin ? "(Blockhouse Admin)": ""}</Link> 
                    {nft.owner && nft.owner.toLowerCase() == addresses.BH_MarketPlace_address.toLowerCase() ? " (Blockhouse marketplace)" : ""}
                    {nft.owner && nft.owner.toLowerCase() == addresses.BH_FungibleSolar_address.toLowerCase() ? " (Blockhouse staking)" : ""}
                  </p>

                  {(connected && nft.listed && nft.seller.toLowerCase() === loggedInAddress.toLowerCase()) && (
                    <>
                      <div className="flex items-baseline">
                        <h2 className="text-h2 text-rhino font-bold mr-2">Listing price: {nft.listing_price} USDC</h2>
                      </div>

                      <Button className="mt-4" text="Remove Listing" type="danger" onClick={() => { unlist_HouseT(loggedInAddress, nft.tokenId) }} />
                      <br /><br />
                      <p className="text-p text-manatee font-light">This will remove the item from the general listing.</p>
                      <p className="text-p text-manatee font-light">Other people will no longer be able to buy it.</p>
                      <p className="text-p text-manatee font-light">After unlisting you will be able to stake again.</p>
                    </>
                  )}

                  {(!connected || nft.listed && nft.seller.toLowerCase() !== loggedInAddress.toLowerCase()) && (
                    <>
                      <div className="flex items-baseline">
                        <h2 className="text-h2 text-rhino font-bold mr-2">Listing price: {nft.listing_price} USDC</h2>
                      </div>

                      <Button disabled={approving} className="mt-4" text="Buy HouseT" onClick={() => { buy_HouseT(loggedInAddress, nft.tokenId, setApprove) }} />
                      {" "}{ approving ?                       
                        <Button className="mt-4" text="Approve USDC spending" onClick={() => { approve_USDC(loggedInAddress, nft.tokenId, setApprove) }} />
                        : ""}
                    </>
                  )}

                  {!nft.listed && !nft.staked && nft.owner.toLowerCase() === loggedInAddress.toLowerCase() && !sellItem && (
                    <>
                      <Button disabled={approving} className="mb-2" text="List HouseT" type="secondary" onClick={() => { setSellItem(true) }} />
                      <p className="text-p text-manatee font-light">Tokens you own can be listed for sale (1% commission).</p>
                    </>
                  )}

                  <br /> 

                  {!nft.listed && !nft.staked && nft.owner.toLowerCase() === loggedInAddress.toLowerCase() && !sellItem && (
                    <>
                      <Button disabled={approvingStaking} className="mb-2" text="Stake HouseT" type="secondary" onClick={() => { stake_HouseT(loggedInAddress, nft.tokenId, setApproveStaking) }} />
                      {" "}{ approvingStaking ?                       
                        <Button className="mt-4" text="Approve HouseT staking" onClick={() => { approve_HouseT_staking(loggedInAddress, nft.tokenId, setApproveStaking) }} />
                        : ""}
                      <p className="text-p text-manatee font-light">Or they can be staked to borrow the Fungible Blockhouse stablecoin. The interest rate is 3% p.a. with 85% collateralization ratio.</p>
                    </>
                  )}

                  {nft.staked && nft.owner.toLowerCase() === loggedInAddress.toLowerCase() && !sellItem && (
                    <>
                      <Button className="mb-2" text="Unstake HouseT" type="danger" onClick={() => { unstake_HouseT(loggedInAddress, nft.tokenId) }} />
                      <p className="text-p text-manatee font-light">Repay your loan with interest to unstake your HouseT.</p>
                    </>
                  )}


                  {sellItem && (
                    <div className="flex items-center">
                      <InputField
                        name='price'
                        label="Price in USDC"
                        value={formInput.price}
                        classNameContainer="mr-4"
                        onChange={e => setFormInput({ ...formInput, price: e.target.value })}
                      />
                      <Button disabled={approving} text="Create Listing" type="secondary" onClick={() => { list_HouseT(loggedInAddress, nft.tokenId, formInput.price, setSellItem, setApprove) }} />
                      <span style={{padding: "10px !important", opacity: 0}}> - </span>{ approving ?                       
                        <Button type="secondary" text="Approve HouseT listing" onClick={() => { approve_HouseT(loggedInAddress, nft.tokenId, setApprove) }} />
                        : ""}
                      <span style={{padding: "5px"}}/><Button text="Cancel" type="primary" onClick={() => { setSellItem(false); setApprove(false); }} />
                    </div>
                  )}

                  {nft.description && (
                    <>
                      <h5 className="text-h5 text-rhino font-bold mt-12">Description</h5>
                      <p className="text-p text-rhino font-light mt-3">
                        <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                            <SecureLink href={decoratedHref} key={key}>{decoratedText}</SecureLink>
                        )}>
                          {nft.description}
                        </Linkify>
                      </p>
                    </>
                  )}
                  <h5 className="text-h5 text-rhino font-bold mt-4">Properties</h5>
                  <p className="text-p text-manatee font-light mt-3">{nft.badge == "for sale" ? "Seller" : "Owner"}: <span className="text-rhino">{truncateEthAddress(nft.seller)}</span></p>
                  <p className="text-p text-manatee font-light mt-3">Token ID: <span className="text-rhino">{nft.tokenId}</span></p>
                  <p className="text-p text-manatee font-light mt-3">Country: <span className="text-rhino">{nft.itemCountry}</span></p>
                  <p className="text-p text-manatee font-light mt-3">Serial number #: <span className="text-rhino">{nft.serialnumber || ""}</span></p>
                  <p className="text-p text-manatee font-light mt-3">Book value: $<span className="text-rhino">{nft.price}</span></p>
                  <p className="text-p text-manatee font-light mt-3">Estimated monthly income: $<span className="text-rhino">{nft.monthly_return}</span></p>
                  <p className="text-p text-manatee font-light mt-3">Remaining payments: <span className="text-rhino">{nft.remaining_payments}</span></p>
                  <p className="text-p text-manatee font-light mt-3">Estimated IRR: <span className="text-rhino"> ~ 14%</span></p>
                </div>
              </>
            ) : (
              <h2 className="text-h2 text-rhino font-bold">Invalid NFT</h2>
            )
          )}
        </div>
      </div>
    </>
  );
}
