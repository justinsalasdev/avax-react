import { Dwindow, Token } from "@types-app";

export const EIP1193Events = {
  accountsChanged: "accountsChanged",
  chainChanged: "chainChanged",
};

export const EIP1193Methods = {
  eth_requestAccounts: "eth_requestAccounts",
  wallet_addEthereumChain: "wallet_addEthereumChain",
  eth_chainId: "eth_chainId",
  //others
};

export enum chainIDs {
  eth_main = "1",
  avalanche_test = "43113",
  avalance_main = "43114",
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
  logo: "https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=022",
  decimals: 18,
  chainId: "43113",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  chainName: "Avalanche Fuji Testnet",
  blockExplorerUrl: "https://testnet.snowtrace.io/",
  erc20Tokens: [
    {
      logo: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=022",
      contractAddr: "0x1799aFD227E69e64D8fc55e2B5E62A27e21B33C6",
    },
  ],
};

const binanceToken: Token = {
  min_denom: "bnb",
  symbol: "BNB",
  logo: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=022",
  decimals: 18,
  chainId: "97",
  rpcUrl: "https://data-seed-prebsc-1-s2.binance.org:8545",
  chainName: "Binance Smart Chain Testnet",
  blockExplorerUrl: "https://testnet.bscscan.com/",
  erc20Tokens: [],
};

const ethereumToken: Token = {
  min_denom: "wei",
  symbol: "ETH",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=022",
  decimals: 18,
  chainId: "42",
  rpcUrl: "https://kovan.poa.network",
  chainName: "Kovan Test Network",
  blockExplorerUrl: "https://kovan.etherscan.io/",
  erc20Tokens: [],
};

export const tokenList: Token[] = [avalancheToken, binanceToken, ethereumToken];
