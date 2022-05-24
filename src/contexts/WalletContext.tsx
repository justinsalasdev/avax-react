import { TokenWithBalance, ProviderId, ProviderStatuses } from "@types-app";
import { ethers, utils } from "ethers";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { chainIDs, tokenList } from "../constants";

import useInjectedWallet from "./useInjectedProvider";

type IWalletState = {
  icon: string;
  displayCoin: { amount: number; symbol: string };
  coins: TokenWithBalance[];
  address: string;
  chainId: string;
  id?: ProviderId;
};

type IState = IWalletState & {
  isWalletLoading: boolean;
  isProviderInitializing: boolean;
};

type Setters = {
  connect: () => Promise<void>;
  disconnect: () => void;
};

const initialWalletState: IWalletState = {
  icon: "",
  displayCoin: { amount: 0, symbol: "ETH" },
  coins: [],
  address: "",
  chainId: chainIDs.eth_main,
};

const initialState: IState = {
  ...initialWalletState,
  isWalletLoading: false,
  isProviderInitializing: false,
};

export default function WalletContext(props: PropsWithChildren<{}>) {
  const [isWalletLoading, setIsWalletLoading] = useState(false); //getting wallet resources
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
        //fetch wallet resources
        setIsWalletLoading(true);
        const { address, id, chainId } = activeProviderInfo!; //found to be defined;

        //get token list from server and query corresponding rpc
        const balanceQueries = tokenList.map((token) => {
          const jsonProvider = new ethers.providers.JsonRpcProvider(
            token.rpcUrl
          );
          return jsonProvider.getBalance(address);
        });
        const queryResult = await Promise.allSettled(balanceQueries);

        //map balances
        const balances: TokenWithBalance[] = queryResult.map((result, i) =>
          result.status === "fulfilled"
            ? {
                ...tokenList[i],
                balance: utils.formatUnits(result.value, tokenList[i].decimals),
              }
            : { ...tokenList[i], balance: "0" }
        );

        const dispBalance = balances.find(
          (balance) => balance.chainId === chainId
        );

        const walletInfo: IWalletState = {
          icon: "",
          displayCoin: {
            amount: +(dispBalance?.balance || "0"),
            symbol: dispBalance?.symbol || "ETH",
          },
          coins: balances,
          address,
          chainId,
          id,
        };
        setWallet(walletInfo);
      }
      setIsWalletLoading(false);
    })();
  }, [activeProviderInfo, prevProviderInfo]);

  const disconnect = useCallback(() => {
    switch (wallet.id) {
      case "metamask":
        disconnectMetamask();
        break;
      case "binance-wallet":
        disconnectBinanceWallet();
        break;
      default:
        throw new Error("no wallet is connected");
    }
  }, [wallet, disconnectBinanceWallet, disconnectMetamask]);

  return (
    <getContext.Provider
      value={{
        ...wallet,
        isWalletLoading,
        isProviderInitializing: isBinanceWalletLoading || isMetamaskLoading,
      }}
    >
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
   * @param value shallow object
   */
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]); //
  return ref.current;
}
