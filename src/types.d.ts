declare module "@types-app" {
  import { ethers } from "ethers";
  export interface Web3Provider extends ethers.providers.Web3Provider {}

  /*** EIP1193 spec https://eips.ethereum.org/EIPS/eip-1193*/
  //request
  interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
  }

  //event handler types
  interface ProviderRpcError extends Error {
    message: string;
    code: number;
    data?: unknown;
  }
  interface ProviderConnectInfo {
    readonly chainId: string;
  }
  type DisconnectHandler = (error: ProviderRpcError) => void;
  type ConnectHandler = (connectInfo: ProviderConnectInfo) => void;
  type AccountChangeHandler = (accounts: string[]) => void;
  type ChainChangeHandler = (chainId: string) => void;

  type InjectedProvider = {
    chainId: string;

    request: <T>(args: RequestArguments) => Promise<T>;
    on(ev: "connect", listener: ConnectHandler);
    on(ev: "disconnect", listener: DisconnectHandler);
    on(ev: "chainChanged", listener: ChainChangeHandler);
    on(ev: "accountsChanged", listener: AccountChangeHandler);

    removeListener(ev: "connect", listener: ConnectHandler);
    removeListener(ev: "disconnect", listener: DisconnectHandler);
    removeListener(ev: "chainChanged", listener: ChainChangeHandler);
    removeListener(ev: "accountsChanged", listener: AccountChangeHandler);

    removeAllListeners(): unknown;
  };

  interface Dwindow extends Window {
    xfi?: {
      ethereum?: any;
    };
    ethereum?: any;
    BinanceChain?: any;
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

  type Connection = {
    name: "";
  };

  type ProviderId = "binance-wallet" | "metamask";
  type ProviderInfo = {
    id: WalletIDs;
    chainId: string;
    address: string;
  };
  type ProviderStatus = { providerInfo?: ProviderInfo; isLoading: boolean };
  type ProviderStatuses = ProviderStatus[];

  type Token = {
    min_denom: string; //avax
    symbol: string; //AVAX
    logo: string;
    decimals: number; //18
    erc20_contract?: string; //if not included means, native chain currency
    chainId: string; // "1"-mainnet "97"-binance-test "43017"-avax
    rpcUrl: string;

    //additional info for adding chain in wallet
    chainName: string; //Avalanche
    blockExplorerUrl: string; //https://testnet.snowtrace.io
  };

  type TokenWithBalance = Token & { balance: string };
}
