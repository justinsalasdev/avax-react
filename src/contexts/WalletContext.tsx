import { TokenWithBalance, WalletIDs } from "@types-app";
import { PropsWithChildren, createContext, useContext } from "react";
import useInjectedWallet from "./useInjectedWallet";

interface IWalletState {
  icon: string;
  displayCoin: { amount: number; symbol: string };
  coins: TokenWithBalance[];
  address: string;
  chainId: string;
  id: WalletIDs | undefined;
}

type Setters = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

export default function Metamask(props: PropsWithChildren<{}>) {
  const { connect, disconnect } = useInjectedWallet();

  return (
    <getContext.Provider value={state}>
      <setContext.Provider value={setters}>
        {props.children}
      </setContext.Provider>
    </getContext.Provider>
  );
}

const initialState: IMetamaskState = {
  loading: false,
  connected: false,
  address: null,
};
const getContext = createContext<IMetamaskState>(initialState);
const setContext = createContext<Setters>({
  connect: async () => {},
  disconnect: async () => {},
});

export const useSetMetamask = () => useContext(setContext);
export const useGetMetamask = () => useContext(getContext);
