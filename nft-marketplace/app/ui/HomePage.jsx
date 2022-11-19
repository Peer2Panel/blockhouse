import React from 'react';
import { useEffect, useState } from 'react';
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { Select } from "./components/Fields/Select";
import { SortOptions } from "./common/SortOptions";
import { loadNFTs } from './contract_functions/BH_MarketPlace';
import { useOutletContext } from "react-router-dom";
import { switchToNEAR } from "./contract_functions/utils";

export default function HomePage() {
  const [nfts, setNfts] = useState([]);
  const [sortBy, setSortBy] = useState('oldest');
  const [loadingState, setLoadingState] = useState('not-loaded');
  const loadMoreInitialState = 4;
  const loadMoreIncrementSize = 4;
  const [loadMore, setLoadMore] = useState(loadMoreInitialState);
  const [web3, connection, setConnection, onConnect, resetApp, loggedInAddress] = useOutletContext();
  const [chainId, setChainId] = useState("loading");
  const [country, setCountry] = useState("");

  loadChainId = async () => {
    //console.log(web3)
    if(web3){
      const chainId = await web3.eth.chainId();
      setChainId(chainId);
      //console.log(chainId)
    }
    
  }

  useEffect(() => {
    loadChainId();
  }, [web3]);

  useEffect(() => {
    //console.log(loggedInAddress)
    //console.log("loading nNN")
    const active_address = loggedInAddress || "0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607";
    loadNFTs(active_address, setNfts, setLoadingState, loadAll=true);
  }, [sortBy, loadMore]);

  //console.log(nfts)
  items = nfts.filter(nft => nft.listed == true && (nft.itemCountry == country || country == "" || country == "All cantons"));

  if (sortBy === 'oldest') {
    items.sort((a,b) => a.tokenId - b.tokenId); // b - a for reverse sort
  } else if (sortBy === 'newest') {
    items.sort((a,b) => b.tokenId - a.tokenId); // b - a for reverse sort
  } else if (sortBy === 'price-low') {
    items.sort((a,b) => a.price - b.price); // b - a for reverse sort
  } else if (sortBy === 'price-high') {
    items.sort((a,b) => b.price - a.price); // b - a for reverse sort
  }
  //console.log(items)
  //console.log(loadingState)
  //console.log(chainId)
  
  const onMumbai = chainId == 1313161556;
  const onMainnet = chainId == 1313161554;

  //console.log("rendering mainpage")
  const switcher = <a onClick={()=> switchToNEAR("0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607", 1313161554)} href="#" style={{textDecoration: "underline"}}>Connect to Aurora Mainnet</a>;
  return (
    <>
      <div className="bg-rhino bg-bg-stars bg-auto bg-no-repeat bg-center-center py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-big text-white font-bold">Blockhouse Marketplace</h2>
          <p className="text-p font-light mt-5 text-white">Trade asset-backed non-fungible tokens (NFTs). Become a legal owner of real estate. Each object is owned via a Swiss corporation (AG).</p>
          <p className="text-p font-light mt-5 text-white">Earn up to 8% APY. <i>Live on Near now!</i></p>
          <Button
            className="mt-8 mx-auto bg-rhino"
            ><a href="#allnfts">Get Started</a>
          </Button>
        </div>
      </div>
      <div style={{minHeight: "650px"}} className="max-w-7xl mx-auto mt-16 pt-2.5 px-2 sm:px-6 lg:px-8">
        {loadingState != 'loaded' ? `` : Number.isInteger(chainId) && onMumbai ? `You are on the Polygon Mumbai Testnet (80001). Please connect to the Polygon Mainnet.` : Number.isInteger(chainId) && !onMainnet ? <span>You are on chain {chainId}. Please connect to the Aurora Mainnet (1313161554). {switcher}</span> : ""}
        <div>
            <div className="flex items-center justify-between mb-5">
              <h2 id="allnfts" className="text-h2 text-rhino font-bold">All NFTs</h2>
                <div>
                  {loadingState != 'loaded' ? "Loading... " : ""}
                  <Select onChange={e => {
                    setCountry(e.target.value);
                    setLoadMore(loadMoreInitialState);
                  }}>
                    {["All cantons", "Zurich", "Zug", "Bern", "Luzern", "Uri", "Schwyz", "Glarus"].map((option) => (
                      <option key={option} value={option}>{option}</option>
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
        {(loadingState == 'loaded' && items.length == 0 && country != "" && country != "All countries") ? (
          <h2 className="text-h2 text-rhino font-bold">No panels listed</h2>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full container mx-auto">
              {items.slice(0, loadMore).map((nft) => (
                <Card key={nft.tokenId} itemImg={nft.image} itemName={nft.name} itemPrice={nft.listing_price} itemId={nft.tokenId} monthlyRevenue={nft.monthly_return} itemCountry={nft.itemCountry} remaining_payments={nft.remaining_payments.toString()}/>
              ))}
            </div>

            {loadMore < items.length && (
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
      </div>
    </>
  );
}
