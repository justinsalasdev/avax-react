declare module "@types-app" {
  import { ethers } from "ethers";
  export interface Ethereum extends ethers.providers.Web3Provider {}
  //event handler types
  type AccountChangeHandler = (accounts: string[]) => void;
  type ChangeChangeHandler = (chainId: string) => void;
  interface Dwindow extends Window {
    ethereum?: any;
  }

  //specs: https://eips.ethereum.org/EIPS/eip-3085
  // interface EthereumChain {
  //   chainId: string;
  //   blockExplorerUrls?: string[];
  //   chainName?: string;
  //   iconUrls?: string[];
  //   nativeCurrency?: {
  //     name: string;
  //     symbol: string;
  //     decimals: number;
  //   };
  //   rpcUrls?: string[];
  // }

  type WalletIDs = "binance-wallet" | "metamask";
  type Token = {
    min_denom: string; //avax
    symbol: string; //AVAX
    logo: string;
    decimals: number; //18
    erc20_contract?: string; //if not included means, native chain currency
    chainIdNum: number; // 1-mainnet 97-binance-test 43017-avax
    rpcUrl: string;

    //additional info for adding chain in wallet
    chainName: string; //Avalanche
    blockExplorerUrl: string; //https://testnet.snowtrace.io
  };

  type TokenWithBalance = {};
}
