import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { Web3Auth } from "@web3auth/web3auth";

const mainnet = "https://aurora-mainnet.infura.io/v3/40ebc8fff15d4ca6aaa594d4d87710cd";
const testnet = "https://aurora-testnet.infura.io/v3/40ebc8fff15d4ca6aaa594d4d87710cd";
const REACT_APP_INFURA_ID = "52d870bea786485393defdf70053a904";

export function getProviderOptions(){
    const infuraId = REACT_APP_INFURA_ID;
    const providerOptions = {
      injected: {
        package: null,
        options: {
          infuraId,
          rpc: {
            1: mainnet,
            137: mainnet,
            80001: testnet
          },
        }
      },    
      walletconnect: {
        package: WalletConnect,
        options: {
          infuraId,
          rpc: {
            1: mainnet,
            137: mainnet,
            80001: testnet
          },
        }
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: "Blockhouse",
          infuraId,
          rpc: {
            1: mainnet,
            137: mainnet,
            80001: testnet
          },
        }
      },
      web3auth: {
        package: Web3Auth,
        options: {
          infuraId,
          rpc: {
            1: mainnet,
            137: mainnet,
            80001: testnet
          },
        }
      }
    };
    return providerOptions;
  };