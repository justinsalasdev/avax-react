import {
  TokenWithBalance,
  ProviderId,
  ProviderStatuses,
  ProviderInfo,
} from "@types-app";
import { ethers } from "ethers";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { chainIDs } from "../constants";
import { getProvider } from "../helpers/getProvider";
import useInjectedWallet from "./useInjectedProvider";

type IWalletState = {
  icon: string;
  displayCoin: { amount: number; symbol: string };
  coins: TokenWithBalance[];
  address: string;
  chainId: string;
  id?: ProviderId;
};

type IState = IWalletState & { isLoading: boolean };

type Setters = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const initialWalletState: IWalletState = {
  icon: "",
  displayCoin: { amount: 0, symbol: "ETH" },
  coins: [],
  address: "",
  chainId: chainIDs.eth_main,
};

const initialState: IState = { ...initialWalletState, isLoading: false };

export default function WalletContext(props: PropsWithChildren<{}>) {
  const [isLoading, setIsLoading] = useState(false); //getting wallet resources
  const [wallet, setWallet] = useState<IWalletState>(initialState);

  const {
    isLoading: isMetamaskLoading, //requesting permission, attaching event listeners
    connect: connectMetamask,
    disconnect: disconnectMetamask,
    providerInfo: metamaskInfo,
  } = useInjectedWallet("metamask");

  const {
    isLoading: isBinanceWalletLoading,
    connect: connectBinanceWallet,
    disconnect: disconnectBinanceWallet,
    providerInfo: binanceWalletInfo,
  } = useInjectedWallet("binance-wallet");

  const providerStatuses: ProviderStatuses = [
    {
      providerInfo: binanceWalletInfo,
      isLoading: isBinanceWalletLoading,
    },
    {
      providerInfo: metamaskInfo,
      isLoading: isMetamaskLoading,
    },
  ];
  const activeProviderInfo = providerStatuses.find(
    ({ providerInfo, isLoading }) => !isLoading && providerInfo !== undefined
  )?.providerInfo;

  const prevProviderInfo = usePrevious(activeProviderInfo);
  console.log({ activeProviderInfo, prevProviderInfo });

  //get wallet Balance
  useEffect(() => {
    (async () => {
      if (!activeProviderInfo && prevProviderInfo) {
        setWallet(initialWalletState);
        return;
      }
      if (!activeProviderInfo) return;

      if (
        (!prevProviderInfo && !activeProviderInfo) ||
        JSON.stringify(activeProviderInfo) !== JSON.stringify(prevProviderInfo)
      ) {
        setIsLoading(true);
        const { address, id, chainId } = activeProviderInfo!; //found to be defined;
        const provider = new ethers.providers.Web3Provider(
          getProvider(id) as any
        );
        const min_balance = await provider.getBalance(address);

        const balance = ethers.utils.formatUnits(min_balance, 18);
        const walletInfo: IWalletState = {
          icon: "",
          displayCoin: { amount: +balance, symbol: "ETH" },
          coins: [],
          address,
          chainId,
          id,
        };
        setWallet(walletInfo);
      }
      setIsLoading(false);
    })();
  }, [activeProviderInfo]);

  const disconnect = useCallback(async () => {
    console.log(wallet);
    switch (wallet.id) {
      case "metamask":
        await disconnectMetamask();
        break;

      case "binance-wallet":
        await disconnectBinanceWallet();
        break;
      default:
        console.log("hello");
    }
  }, [wallet]);

  return (
    <getContext.Provider value={{ ...wallet, isLoading }}>
      <setContext.Provider
        value={{
          connect: connectBinanceWallet,
          disconnect: disconnect,
        }}
      >
        {props.children}
      </setContext.Provider>
    </getContext.Provider>
  );
}

const getContext = createContext<IState>(initialState);
const setContext = createContext<Setters>({
  connect: async () => {},
  disconnect: async () => {},
});

export const useSetWallet = () => useContext(setContext);
export const useGetWallet = () => useContext(getContext);

function usePrevious<T extends object>(value?: T) {
  /**
   * @param value 1 level deep object
   */
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]); //
  return ref.current;
}
