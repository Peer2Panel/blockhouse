import React, { useEffect, useState} from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from "./common/NavBar";
import { Footer } from "./common/Footer";
import Web3 from "web3";
import { getWeb3Modal } from "./contract_functions/utils";
import T from "./Translator.jsx";

window.Buffer = require('buffer/').Buffer;

// Jonathan
function initWeb3(provider) {
  const web3 = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber
      }
    ]
  });

  return web3;
}

const INITIAL_STATE = {
  fetching: false,
  address: "0xe7E3E925E5dcFeaF5C5CEBfbc6EfD4B404B0e607",
  web3: null,
  provider: null,
  connected: false,
  chainId: 80001,
  networkId: 1,
  assets: [],
  showModal: false,
  pendingRequest: false,
  result: null
};

// Jonathan
const getAccountAssets = () => {return []}
const web3Modal = getWeb3Modal()


export const App = () => {
  const [connection, setConnection] = useState(false);
  const [state, setState] = useState({});

  subscribeProvider = async (provider) => {
    provider.on("close", () => resetApp());
    provider.on("accountsChanged", async (accounts) => {
      await setState({ ...state, address: accounts[0] });
      await getAccountAssets();
    });
    provider.on("chainChanged", async (chainId) => {
      const { web3 } = state;
      const networkId = ethereum.chainId; //await web3.eth.net.getId();
      await setState({ ...state, chainId, networkId });
      await getAccountAssets();
    });
  
    provider.on("networkChanged", async (networkId) => {
      let { web3 } = state;
      if(!web3){
        web3 = new Web3(provider);
      }
      const chainId = await web3.eth.getChainId();
      await setState({ ...state, chainId, networkId });
      await getAccountAssets();
    });
  };
  
  onConnect = async () => {
    const provider = await web3Modal.connect();

    //  Enable session (triggers QR Code modal)
    await provider.enable();
    await subscribeProvider(provider);
    await provider.enable();
    const web3 = initWeb3(provider);
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0] || "";
    const networkId = await web3.eth.net.getId();
    const chainId = await web3.eth.chainId();
    //console.log("setting state")
    //console.log(web3)
    await setState({
      web3,
      provider,
      connected: true,
      address,
      chainId,
      networkId
    });
    await getAccountAssets();
  };

  resetApp = async () => {
    const { web3 } = state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
    setState({ ...INITIAL_STATE });
  };

  if(!state || Object.keys(state).length == 0){
    setState(INITIAL_STATE);
  }

  let {
    web3,
    assets,
    address,
    connected,
    chainId,
    fetching,
    showModal,
    pendingRequest,
    result
  } = state;

  //if (window.ethereum !== undefined) {
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      onConnect();
    }
  }, []);

  return (
    <>
      {/*<T>Common.intro</T>*/}
      <div className="flex flex-col min-h-screen">
        <NavBar connection={connected} onConnect={onConnect} loggedInAddress={address} />
        <div className="grow">
          <Outlet context={[web3, connected, setConnection, onConnect, resetApp, address]} />
        </div>
        <Footer/>
      </div>
    </>
  );
  
};
