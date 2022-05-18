declare module "@types-app" {
  import { ethers } from "ethers";
  export interface Ethereum extends ethers.providers.Web3Provider {}
  //event handler types
  type AccountChangeHandler = (accounts: string[]) => void;
  type ChangeChangeHandler = (chainId: string) => void;
  interface Dwindow extends Window {
    ethereum?: any;
  }
}
