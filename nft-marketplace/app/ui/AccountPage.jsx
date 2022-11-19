import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { useParams, useLocation } from "react-router-dom";
import truncateEthAddress from "truncate-eth-address";
import { SortOptions } from "./common/SortOptions";
import { Select } from "./components/Fields/Select";
import { CategoryOptions } from "./common/CategoryOptions";
import { useOutletContext } from "react-router-dom";
import { RoutePaths } from "./common/RoutePaths";
import { Link } from "react-router-dom";

import ExchangeFBHUSDC from './infoboxes/ExchangeFBHUSDC.jsx';
import CustomizedSwitches from './components/Switches.jsx';
import { addFungibleBlockhouseToWallet, addUSDCToWallet } from "./contract_functions/utils";
import { balanceOfUSDC, mintUSDC } from "./contract_functions/USDC_test";
import { balanceOfFS } from "./contract_functions/BH_FungibleBlockhouse";
import { loadNFTs } from './contract_functions/BH_MarketPlace';
import { is_in_whitelist_whitelist } from './contract_functions/BH_HouseT';

import addresses_mainnet from "./contract_functions/addresses_mainnet.json";
import addresses_testnet from "./contract_functions/addresses.json";
let addresses;
if(true){
  addresses = addresses_mainnet;
}

export default function MyNftsPage(props) {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [category, setCategory] = useState(CategoryOptions[0].value);
  const [sortBy, setSortBy] = useState(SortOptions[0].value);
  const loadMoreInitialState = 4;
  const loadMoreIncrementSize = 4;
  const [loadMore, setLoadMore] = useState(loadMoreInitialState);
  const { address } = useParams();
  const location = useLocation();
  const [web3, connection, setConnection, onConnect, resetApp, loggedInAddress] = useOutletContext();
  const is_admin = loggedInAddress == "0xC117E7247be4830D169da13427311F59BD25d669" || loggedInAddress == "0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607"
  const [amount, setAmount] = useState("");
  const [verified, setVerified] = useState("-");
  const [FSBalance, setFSBalance] = useState("-");
  const [USDCBalance, setUSDCBalance] = useState("-");

  onChange = (e) => {
    const new_value = e.target.value;
    setAmount(new_value);
  }

  let pluralize = require('pluralize');

  useEffect(async () => {
    let balance = await balanceOfFS(address);
    let ethValue = ethers.utils.formatEther(balance);
    setFSBalance(ethValue);

    balance = await balanceOfUSDC(address)
    ethValue = ethers.utils.formatEther(balance);
    setUSDCBalance(ethValue);

    is_verified = await is_in_whitelist_whitelist(loggedInAddress, address);
    setVerified(is_verified);
  }, []);

  useEffect(() => {
    loadNFTs(address, setNfts, setLoadingState);
  }, [location, category, sortBy, loadMore]);

  items = nfts;
  let filteredItems = items;

  if (category === 'owned') {
    filteredItems = items.filter((item) => item.badge === 'owned' );
  } else if (category === 'for-sale') {
    filteredItems = items.filter((item) => item.badge === 'for sale' );
  } else if (category === 'staked') {
    filteredItems = items.filter((item) => item.badge === 'staked' );
  }

  if (sortBy === 'oldest') {
    filteredItems.sort((a,b) => a.tokenId - b.tokenId);
  } else if (sortBy === 'newest') {
    filteredItems.sort((a,b) => b.tokenId - a.tokenId);
  } else if (sortBy === 'price-low') {
    filteredItems.sort((a,b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredItems.sort((a,b) => b.price - a.price);
  }

  const initialValueIncome = 0;
  const monthly_income = nfts.reduce(
    (previousValue, currentNFT) => {
      return previousValue + parseFloat(currentNFT.monthly_return);
    },
    initialValueIncome
  );

  const initialValueStaked = 0;
  //console.log(nfts)
  //console.log("staked")
  const total_staked = nfts.reduce(
    (previousValue, currentNFT) => {
      if(currentNFT.staked){
        //console.log(currentNFT)
        const added_debt = parseFloat(currentNFT.price)*0.85;
        //console.log(added_debt);
        return previousValue + added_debt; // now collateralization ration is 85%
      }
      else {
        return previousValue;
      }
    },
    initialValueStaked
  );
  //console.log(total_staked);

  const initialValueEarned = 0;
  const total_earned = nfts.reduce(
    (previousValue, currentNFT) => {
      return previousValue + parseFloat(currentNFT.earned);
    },
    initialValueEarned
  );

  return (
    <div className="max-w-7xl mx-auto mt-16 pt-2.5 px-2 sm:px-6 lg:px-8">
      <img className="w-20 h-20 mx-auto rounded-full" src="/images/default-profile-avatar.png" alt="Profile avatar"/>
      <h1 className="text-h1 text-rhino text-center font-bold mb-7 mt-4">{truncateEthAddress(address+"")} {address == addresses.BH_MarketPlace_address.toLowerCase() ? <div>(Blockhouse smart contract)</div> : ""}</h1>
      { loggedInAddress && loggedInAddress.toLowerCase() == address.toLowerCase() ?
        <span>{ !connection ?
          <div><Button onClick={()=>onConnect()}>Connect</Button></div>:
          <div>My own account: <a href="#" onClick={()=>resetApp()} style={{textDecoration: "underline", margin: "20px 0px"}}>Disconnect</a></div>
        }</span>
        : ""
      }
      <div>
        Verification status: {verified == "-" ? "-" : verified ? 
          <span style={{color: "green"}}>verified</span> : 
          <span>
            <span style={{color: "red"}}>not verified</span>*
            <p style={{maxWidth: "500px", fontSize: "9px"}}>
              <i>Only whitelisted accounts can receive revenues or stake HouseT. The official ownership transfer of the solar panel is only complete once the new owner is verified. For whitelisting please send a photo of your valid passport to jonathan.lehner@Blockhouse.com.</i>
            </p>
          </span>}
      </div>
      { loggedInAddress && loggedInAddress.toLowerCase() == address.toLowerCase() ?
        <div style={{padding: "10px 0px"}}>
          <CustomizedSwitches />
        </div> : ""
      }
      <div>
        Total earned so far: ${total_earned} USDC
      </div>
      <div>
        Monthly income: ${monthly_income} USDC
      </div>
      <div>
        Total borrowed: ${total_staked} FBH
      </div>
      <div>
        Current Fungible Blockhouse balance: ${FSBalance} <a onClick={() => addFungibleBlockhouseToWallet(loggedInAddress)} style={{color: "blue"}} href="#">(add to wallet)</a> / <a style={{color: "blue"}} href="#"><ExchangeFBHUSDC amount={amount}/></a>
      </div>
      {is_admin ?
        <div>
          <Button disabled={localStorage.getItem("network") == "true"}
            className="mt-8 mx-auto bg-rhino"
            ><Link to={localStorage.getItem("network") == "true" ? "" : RoutePaths.MINT_NFT}>Mint HouseT</Link>
          </Button>
          <div>{localStorage.getItem("network") == "true" ? "You can mint your own HouseT tokens on the testnet" : ""}</div>
        </div> : ""
      }
      <br/><br/>

      {(loadingState !== 'loaded') ? (
        <></>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            {!filteredItems.length ? <h2 className="text-h2 text-rhino font-bold">No panels in this account</h2> : 
            <h2 className="text-h2 text-rhino font-bold">{pluralize('item', filteredItems.length, true)}</h2>}

            <div className="flex items-center">
              <Select className="mr-4" onChange={e => {
                setCategory(e.target.value);
                setLoadMore(loadMoreInitialState);
              }}>
                {CategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select onChange={e => {
                setSortBy(e.target.value);
                setLoadMore(loadMoreInitialState);
              }}>
                {SortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full container mx-auto">
            {filteredItems.slice(0, loadMore).map((nft, index) => {
              console.log(nft)
              return(
                <Card
                  key={nft.tokenId}
                  itemImg={nft.image}
                  itemName={nft.name}
                  itemPrice={nft.badge == "for sale" ? nft.listing_price : nft.price}
                  itemId={nft.tokenId}
                  badge={nft.badge}
                  loggedInAddress={loggedInAddress}
                  nft={nft}
                  monthlyRevenue={nft.monthly_return}
                  itemCountry={nft.itemCountry}
                  remaining_payments={nft.remaining_payments.toString()}
                />
              )}
            )}
          </div>

          {loadMore < filteredItems.length && (
            <div className="mt-14 text-center">
              <Button
                className="bg-dodger"
                text="Load More"
                onClick={() => {
                  setLoadMore(loadMore + loadMoreIncrementSize);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

