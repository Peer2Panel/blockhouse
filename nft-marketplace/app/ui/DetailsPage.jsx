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
import { stake_HouseT, approve_HouseT_staking, unstake_HouseT } from './contract_functions/BH_FungibleBlockhouse';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import T from "./Translator.jsx";
import i18n from 'meteor/universe:i18n';

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

  console.log(nft);

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
                  <h2 className="text-h2 text-rhino font-bold">{nft.name} [#{nft.tokenId}]</h2>
                  <p className="text-p text-manatee mt-2 mb-8"><T>Common.owned-by</T> <Link className="text-dodger" to={`${RoutePaths.ACCOUNT}/${nft.owner}`}>{truncateEthAddress(nft.owner)} {is_admin ? "(Blockhouse Admin)": ""}</Link> 
                    {nft.owner && nft.owner.toLowerCase() == addresses.BH_MarketPlace_address.toLowerCase() ? " (Blockhouse marketplace)" : ""}
                    {nft.owner && nft.owner.toLowerCase() == addresses.BH_FungibleBlockhouse_address.toLowerCase() ? " (Blockhouse staking)" : ""}
                  </p>

                  {(connected && nft.listed && nft.seller.toLowerCase() === loggedInAddress.toLowerCase()) && (
                    <>
                      <div className="flex items-baseline">
                        <h2 className="text-h2 text-rhino font-bold mr-2"><T>Common.listing-price</T>: {nft.listing_price} USDC</h2>
                      </div>

                      <Button className="mt-4" text={i18n.getTranslation("Common.Remove Listing")} type="danger" onClick={() => { unlist_HouseT(loggedInAddress, nft.tokenId) }} />
                      <br /><br />
                      <p className="text-p text-manatee font-light">This will remove the item from the general listing.</p>
                      <p className="text-p text-manatee font-light">Other people will no longer be able to buy it.</p>
                      <p className="text-p text-manatee font-light">After unlisting you will be able to stake again.</p>
                    </>
                  )}

                  {(!connected || nft.listed && nft.seller.toLowerCase() !== loggedInAddress.toLowerCase()) && (
                    <>
                      <div className="flex items-baseline">
                        <h2 className="text-h2 text-rhino font-bold mr-2"><T>Common.listing-price</T>: {nft.listing_price} USDC</h2>
                      </div>

                      <Button disabled={approving} className="mt-4" text={i18n.getTranslation("Common.Buy HouseT")} onClick={() => { buy_HouseT(loggedInAddress, nft.tokenId, setApprove) }} />
                      {" "}{ approving ?                       
                        <Button className="mt-4" text={i18n.getTranslation("Common.Approve USDC spending")} onClick={() => { approve_USDC(loggedInAddress, nft.tokenId, setApprove) }} />
                        : ""}
                    </>
                  )}

                  {!nft.listed && !nft.staked && nft.owner.toLowerCase() === loggedInAddress.toLowerCase() && !sellItem && (
                    <>
                      <Button disabled={approving} className="mb-2" text="List HouseT" type="secondary" onClick={() => { setSellItem(true) }} />
                      <p className="text-p text-manatee font-light"><T>Common.listing-info</T></p>
                    </>
                  )}

                  <br /> 

                  {!nft.listed && !nft.staked && nft.owner.toLowerCase() === loggedInAddress.toLowerCase() && !sellItem && (
                    <>
                      <Button disabled={approvingStaking} className="mb-2" text="Stake HouseT" type="secondary" onClick={() => { stake_HouseT(loggedInAddress, nft.tokenId, setApproveStaking) }} />
                      {" "}{ approvingStaking ?                       
                        <Button className="mt-4" text="Approve HouseT staking" onClick={() => { approve_HouseT_staking(loggedInAddress, nft.tokenId, setApproveStaking) }} />
                        : ""}
                      <p className="text-p text-manatee font-light"><T>Common.staking-info</T></p>
                    </>
                  )}

                  {nft.staked && nft.owner.toLowerCase() === loggedInAddress.toLowerCase() && !sellItem && (
                    <>
                      <Button className="mb-2" text="Unstake HouseT" type="danger" onClick={() => { unstake_HouseT(loggedInAddress, nft.tokenId) }} />
                      <p className="text-p text-manatee font-light"><T>Common.repayment-info</T></p>
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

                  <AccessibleTabs1 nft={nft}/>
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

function AccessibleTabs1({nft}) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Tabs
          onChange={handleChange}
          value={value}
          aria-label="Tabs where selection follows focus"
          selectionFollowsFocus
        >
          <Tab label="Highlights" />
          <Tab label={i18n.getTranslation("Common.Financials")} />
          <Tab label="Details" />         
          <Tab label="Blockchain" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {nft.description && (
          <>
            <p className="text-p text-rhino font-light mt-3">
              <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                  <SecureLink href={decoratedHref} key={key}>{decoratedText}</SecureLink>
              )}>
                <T>Common.nft-description</T>
               {/*nft.description"*/}
              </Linkify>
            </p>
          </>
        )}
        <a href={"/documents/Dokumentation-Däderizstrasse 30 - 2540 Grenchen.pdf"} download><Button className="mt-4" text={i18n.getTranslation("Common.info-sheet")} type="primary"/></a> (<T>Common.in-German</T>)

        <h5 className="text-h5 text-rhino font-bold mt-4"><T>Common.Properties</T></h5>
        <p className="text-p text-manatee font-light mt-3">{nft.badge == "for sale" ? <T>Common.Seller</T> : <T>Common.Owner</T>}: <span className="text-rhino">{truncateEthAddress(nft.seller)}</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Monthly rent per token</T>: <span className="text-rhino">CHF 7.8 {/*nft.monthly_return*/}</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Total number of tokens</T>: <span className="text-rhino">500</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.rent_start_date</T>: <span className="text-rhino">01.05.2023</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.est_irr</T>: <span className="text-rhino">7.11%</span></p>

      </TabPanel>
      <TabPanel value={value} index={1}>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Total purchase price</T>: <span className="text-rhino">CHF 1'095'000</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Equity Financing</T>: <span className="text-rhino">CHF 470'000</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Gross rent</T> / <T>Common.year</T>: <span className="text-rhino">CHF 52'392</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Gross rent</T> / <T>Common.month</T>: <span className="text-rhino">CHF 4'366</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Monthly costs</T>: <span className="text-rhino">CHF 800</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Net rent</T> / <T>Common.month</T>: <span className="text-rhino">CHF 3'566</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Net rent</T> / <T>Common.year</T>: <span className="text-rhino">CHF 42'792</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.External Financing</T>: <span className="text-rhino">CHF 625'000</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Interest costs</T> / <T>Common.month</T>: <span className="text-rhino">CHF 781.25</span> (<T>Common.interest-rate</T>: 1.5%)</p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Principal payments</T>: <span className="text-rhino">CHF 781.25</span> (<T>Common.repayment-rate</T>: 1.5%)</p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Expected profit</T> / <T>Common.year</T>: <span className="text-rhino">CHF 33'417</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.est_irr</T>: <span className="text-rhino">7.11%</span></p>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Country</T>: <span className="text-rhino">{i18n.getTranslation("Common."+nft.itemCountry)}</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Address</T>: <span className="text-rhino">{nft.name}</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Holding company registration number</T>: <a style={{textDecoration: "underline", color: "blue"}} target={"_blank"} href={"https://www.moneyhouse.ch/en/company/immotrust-schweiz-ag-13471144491"}><span className="text-rhino">CH-170.3.045.945-2</span></a></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Number of apartments</T>: <span className="text-rhino">4 </span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Area</T>: <span className="text-rhino">208 m2</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Number of parking spots</T>: <span className="text-rhino">5</span></p>
        <p className="text-p text-manatee font-light mt-3"><T>Common.Estimated value for tax purposes</T>: <span className="text-rhino">CHF 1'095'000</span> (10.12.2022)</p>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <p className="text-p text-manatee font-light mt-3">Smart contract: <a style={{textDecoration: "underline", color: "blue"}} target={"_blank"} href={`https://aurorascan.dev/token/0xe8bBF732c32814F6106F286B6BF34E3F27f2551E`}><span className="text-rhino">0xe8bBF732c32814F6106F286B6BF34E3F27f2551E</span></a></p>
        <p className="text-p text-manatee font-light mt-3">Token ID: <a style={{textDecoration: "underline", color: "blue"}} target={"_blank"} href={`https://aurorascan.dev/token/0xe8bBF732c32814F6106F286B6BF34E3F27f2551E?a=${nft.tokenId}`}><span className="text-rhino">{nft.tokenId}</span></a></p>
      </TabPanel>
    </>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}