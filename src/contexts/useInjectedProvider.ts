import { useEffect, useState } from "react";
import {
  AccountChangeHandler,
  ChangeChangeHandler,
  Dwindow,
  Web3Provider,
  ProviderId,
  ProviderInfo,
} from "@types-app";
import { EIP1193Events, EIP1193Methods } from "../constants";

export default function useInjectedProvider(providerId: ProviderId) {
  //connect only if there's no active wallet
  const lastAction = retrieveUserAction();
  const shouldReconnect = lastAction === "connect";
  const [isLoading, setIsLoading] = useState(true);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo>();
  const injectedProvider = getInjectedProvider(providerId);

  useEffect(() => {
    requestAccess();
    return () => {
      removeAllListeners(providerId);
    };
    //eslint-disable-next-line
  }, [providerId]);

  async function requestAccess(isNewConnection = false) {
    if (
      injectedProvider &&
      (isNewConnection || shouldReconnect) &&
      !providerInfo
    ) {
      attachAccountChangeHandler(injectedProvider);
      attachChainChangedHandler(injectedProvider);
      const { result: accounts = [] } = await injectedProvider.send(
        EIP1193Methods.eth_requestAccounts,
        []
      );
      setProviderInfo({
        id: providerId,
        address: accounts[0],
        chainId: `${injectedProvider.network.chainId}`,
      });
    }
  }

  //attachers/detachers
  const attachChainChangedHandler = (provider: Web3Provider) => {
    provider.on(EIP1193Events.chainChanged, handleChainChange);
  };
  const attachAccountChangeHandler = (provider: Web3Provider) => {
    provider.on(EIP1193Events.accountsChanged, handleAccountsChange);
  };

  //event handlers
  const handleChainChange: ChangeChangeHandler = (hexChainId) => {
    providerInfo &&
      setProviderInfo({
        ...providerInfo,
        chainId: `${parseInt(hexChainId, 16)}`,
      });
  };

  //useful when user changes account internally via metamask
  const handleAccountsChange: AccountChangeHandler = (accounts) => {
    //requestAccounts(new connection) will set the address so no need to set again
    if (accounts.length > 0 && providerInfo) {
      setProviderInfo({
        ...providerInfo,
        address: accounts[0],
      });
      //if no account is found, means user disconnected
    } else {
      removeAllListeners(providerId);
      setProviderInfo(undefined);
      saveUserAction("disconnect");
    }
  };

  async function disconnect() {
    if (!providerInfo) return;
    if (!injectedProvider) return;
    removeAllListeners(providerId);
    setProviderInfo(undefined);
    saveUserAction("disconnect");
  }

  async function connect() {
    try {
      setIsLoading(true);
      await requestAccess(true);
      saveUserAction("connect");
    } catch (err: any) {
      setIsLoading(false);
      //let caller handle error with UI
      if ("code" in err && err.code === 4001) {
        throw new RejectMetamaskLogin();
      } else {
        throw new Error("Uknown error occured");
      }
    }
  }

  return {
    connect,
    disconnect,
    isLoading,
    providerInfo,
  };
}

const ActionKey = "ethereum_pref";
type Action = "connect" | "disconnect";
function saveUserAction(action: Action) {
  localStorage.setItem(ActionKey, action);
}

function retrieveUserAction(): Action {
  return (localStorage.getItem(ActionKey) as Action) || "disconnect";
}

function removeAllListeners(providerId: ProviderId) {
  getInjectedProvider(providerId)?.removeAllListeners();
}

export class RejectMetamaskLogin extends Error {
  constructor() {
    super();
    this.message = "Metamask login cancelled";
    this.name = "RejectMetamaskLogin";
  }
}

//notes: 1 accountChange handler run only on first connect [] --> [something]
//and revocation of permission [something] --> []

function getInjectedProvider(providerId: ProviderId): Web3Provider | undefined {
  const dwindow = window as Dwindow;
  switch (providerId) {
    case "binance-wallet":
      return dwindow.BinanceChain;
    case "metamask":
      return dwindow.ethereum;
    default:
      throw new Error("wallet is not connected");
  }
}
