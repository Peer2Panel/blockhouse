import React from 'react';
import { useEffect, useState } from 'react';
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { Select } from "./components/Fields/Select";
import { loadNFTs } from './contract_functions/BH_MarketPlace';
import { useOutletContext } from "react-router-dom";
import { switchToNEAR } from "./contract_functions/utils";
import { AntSwitch } from './components/Switches.jsx';
import T from "./Translator.jsx";
import i18n from 'meteor/universe:i18n';

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
  const [groupedByHouse, setGroupedByHouse] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState("");

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
  items = nfts.filter(nft => nft.listed == true && (nft.itemCountry == country || country == "" || country == "All countries"));

  if (sortBy === 'oldest') {
    items.sort((a,b) => a.tokenId - b.tokenId); // b - a for reverse sort
  } else if (sortBy === 'newest') {
    items.sort((a,b) => b.tokenId - a.tokenId); // b - a for reverse sort
  } else if (sortBy === 'price-low') {
    items.sort((a,b) => a.price - b.price); // b - a for reverse sort
  } else if (sortBy === 'price-high') {
    items.sort((a,b) => b.price - a.price); // b - a for reverse sort
  }
  
  if(selectedHouse != ""){
    items = items.filter((item) => item.name == selectedHouse);
    console.log(items)
  }
  else if(groupedByHouse){
    house_names = [...new Set(items.map((item) => item.name))];
    items = house_names.map(house_name => {
      const count = [...items].reduce((total, item) => (item.name == house_name ? total+1 : total), 0);
      const item = [...items].find((item) => item.name == house_name);
      const prices = [...items].filter(item=>item.name == house_name).map((item) => item.listing_price)
      item.num_tokens = count;
      item.min_price = Math.min(...prices);
      item.max_price = Math.max(...prices);
      return item;
    });
  }

  const onTestnet = chainId == 1313161556;
  const onMainnet = chainId == 1313161554;

  const switcher = <a onClick={()=> switchToNEAR("0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607", 1313161554)} href="#" style={{textDecoration: "underline"}}>Connect to Aurora Mainnet</a>;

  const SortOptions = [
    { label: i18n.getTranslation("Common.Oldest-Added"), value: "oldest" },
    { label: i18n.getTranslation("Common.Newest-Added"), value: "newest" },
    { label: i18n.getTranslation("Common.Low-to-High"), value: "price-low" },
    { label: i18n.getTranslation("Common.High-to-Low"), value: "price-high" },
  ];

  return (
    <>
      <div className="bg-rhino bg-bg-stars bg-auto bg-no-repeat bg-center-center py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-big text-white font-bold"><T>Common.marketplace-title</T></h2>
          <p className="text-p font-light mt-5 text-white"><T>Common.marketplace-desc1</T></p>
          <p className="text-p font-light mt-5 text-white"><T>Common.marketplace-desc2</T> <i><T>Common.marketplace-desc3</T></i></p>
          <Button
            className="mt-8 mx-auto bg-rhino"
            ><a href="#allnfts"><T>Common.get-started</T></a>
          </Button>
        </div>
      </div>
      <div style={{minHeight: "650px"}} className="max-w-7xl mx-auto mt-16 pt-2.5 px-2 sm:px-6 lg:px-8">
        {loadingState != 'loaded' ? `` : Number.isInteger(chainId) && onTestnet ? `You are on the Polygon Mumbai Testnet (80001). Please connect to the Polygon Mainnet.` : Number.isInteger(chainId) && !onMainnet ? <span><T>Common.switch-1</T> {chainId}. <T>Common.switch-2</T> {switcher}</span> : ""}
        <div>
            <div className="flex items-center justify-between mb-5">
              <h2 id="allnfts" className="text-h2 text-rhino font-bold"><T>Common.all-nfts</T></h2>
                <div style={{display: "flex"}}>
                  {loadingState != 'loaded' ? <T>Common.loading</T> : ""}
                  <span>
                    {selectedHouse ? 
                      <div>Selected: {selectedHouse} <a hred={"#"} style={{textDecoration: "underline", cursor: "pointer"}}onClick={()=>setSelectedHouse("")}><b>X</b></a></div> : 
                    <span style={{display: "flex", padding: "10px"}}>
                      <span style={{marginTop: "15px", marginLeft: "10px", marginRight: "5px"}}>
                        <T>Common.group-by-house</T>
                      </span>  
                      <span style={{marginTop: "20px", marginLeft: "10px", marginRight: "10px"}}>
                        <AntSwitch onChange={(e) => {console.log(e.target.checked); setGroupedByHouse(e.target.checked)}} checked={groupedByHouse} inputProps={{ 'aria-label': 'ant design' }} />
                      </span>
                      <Select onChange={e => {
                        setCountry(e.target.value);
                        setLoadMore(loadMoreInitialState);
                      }}>
                        {/*["All cantons", "Zurich", "Zug", "Bern", "Luzern", "Uri", "Schwyz", "Glarus"].map((option) => (*/}
                        {[i18n.getTranslation("Common.all-countries"), 
                        i18n.getTranslation("Common.Switzerland"), 
                        i18n.getTranslation("Common.Germany"),
                        i18n.getTranslation("Common.Austria"),
                        i18n.getTranslation("Common.Singapore"),
                        i18n.getTranslation("Common.Korea"),
                        ].map((option) => (
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
                    </span>}
                  </span>
              </div>
            </div>
        {(loadingState == 'loaded' && items.length == 0 && country != "" && country != i18n.getTranslation("Common.all-countries")) ? (
          <h2 className="text-h2 text-rhino font-bold">No house tokens listed</h2>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full container mx-auto">
              {items.slice(0, loadMore).map((nft) => (
                <Card 
                  groupedByHouse={groupedByHouse && selectedHouse == "" ? true : false} 
                  num_tokens={groupedByHouse && selectedHouse == "" ? nft.num_tokens : 0} 
                  min_price={nft.min_price}
                  max_price={nft.max_price}
                  setSelectedHouse={(x) => setSelectedHouse(x)} 
                  key={nft.tokenId} 
                  itemImg={nft.image} 
                  itemName={nft.name} 
                  itemPrice={nft.listing_price} 
                  itemId={nft.tokenId} 
                  monthlyRevenue={nft.monthly_return} 
                  itemCountry={nft.itemCountry} 
                  remaining_payments={nft.remaining_payments.toString()}/>
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
