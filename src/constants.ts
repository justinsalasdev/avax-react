import { Dwindow, Token } from "@types-app";

export const EIP1193Events = {
  accountsChanged: "accountsChanged",
  chainChanged: "chainChanged",
};

export const EIP1193Methods = {
  eth_requestAccounts: "eth_requestAccounts",
  wallet_addEthereumChain: "wallet_addEthereumChain",
  //others
};

export enum chainIDs {
  avalanche_test = "0xa869",
  avalance_main = "0xa86a",
}

export const dwindow = window as Dwindow;

/**
 * 
 * {
      chainId: "0xA869",
      chainName: "Avalanche Testnet C-Chain",
      nativeCurrency: {
        name: "Avalanche",
        symbol: "AVAX",
        decimals: 18,
      },
      rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
      blockExplorerUrls: ["https://testnet.snowtrace.io/"],
    }
 */

/**
 * 
 * type Token = {
    min_denom: string; //avax
    symbol: string; //AVAX
    logo: string;
    decimals: number; //18
    erc20_contract?: string; //if not included means, native chain currency
    chainIdNum: number; // 1-mainnet 97-binance-test 43017-avax
   

    //additional info for adding chain in wallet
    rpcUrl: string;
    chainName: string; //Avalanche
    blockExplorerUrl: string; //https://testnet.snowtrace.io
  };
 */

const avalancheToken: Token = {
  min_denom: "avax",
  symbol: "AVAX",
  logo: "",
  decimals: 18,
  erc20_contract: "",
  chainIdNum: 43114,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  chainName: "Avalanche Fuji Testnet",
  blockExplorerUrl: "https://testnet.snowtrace.io/",
};
export const tokenList: Token[] = [avalancheToken];
