import { TokenWithBalance, ProviderId, ProviderStatuses } from "@types-app";
import { ethers } from "ethers";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { chainIDs } from "../constants";
import useInjectedWallet from "./useInjectedProvider";

type IWalletInfo = {
  icon: string;
  displayCoin: { amount: number; symbol: string };
  coins: TokenWithBalance[];
  address: string;
  chainId: string;
  id?: ProviderId;
};

type IWalletState = IWalletInfo & { isLoading: boolean };

type Setters = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const initialState: IWalletState = {
  isLoading: false,
  icon: "",
  displayCoin: { amount: 0, symbol: "ETH" },
  coins: [],
  address: "",
  chainId: chainIDs.eth_main,
};

export default function WalletContext(props: PropsWithChildren<{}>) {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<IWalletState>(initialState);
  const {
    isLoading: isMetamaskLoading, //requesting permission, attaching event listeners
    connect: connectMetamask,
    disconnect: disconnectMetamask,
    providerInfo: metamaskInfo,
  } = useInjectedWallet("metamask");

  const walletStatuses: ProviderStatuses = [[metamaskInfo, isMetamaskLoading]];
  const [activeWalletInfo] =
    walletStatuses.find(
      ([providerInfo, isLoading]) => !isLoading && providerInfo !== undefined
    ) || [];

  //get wallet Balance
  useEffect(() => {
    if (activeWalletInfo) {
      setLoading(true);
      setWallet({ ...wallet });
      setLoading(false);
    }
  }, [activeWalletInfo]);

  return (
    <getContext.Provider value={initialState}>
      <setContext.Provider
        value={{ connect: connectMetamask, disconnect: disconnectMetamask }}
      >
        {props.children}
      </setContext.Provider>
    </getContext.Provider>
  );
}

const getContext = createContext<IWalletState>(initialState);
const setContext = createContext<Setters>({
  connect: async () => {},
  disconnect: async () => {},
});

export const useSetWallet = () => useContext(setContext);
export const useGetWallet = () => useContext(getContext);
