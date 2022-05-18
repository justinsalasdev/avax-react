import { Dwindow } from "@types-app";

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
