import { useEffect, useState } from "react";
import {
  AccountChangeHandler,
  ChainChangeHandler,
  ProviderId,
  ProviderInfo,
  InjectedProvider,
} from "@types-app";
import { EIP1193Methods } from "../constants";
import { getProvider } from "../helpers/getProvider";

export default function useInjectedProvider(providerId: ProviderId) {
  const actionKey = `${providerId}__pref`;
  //connect only if there's no active wallet
  const lastAction = retrieveUserAction(actionKey);
  const shouldReconnect = lastAction === "connect";
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState<string>();
  const [chainId, setChainId] = useState<string>();

  const injectedProvider = getProvider(providerId);
  console.log(injectedProvider);

  useEffect(() => {
    requestAccess();
    return () => {
      removeAllListeners(providerId);
    };
    //eslint-disable-next-line
  }, [providerId]);

  async function requestAccess(isNewConnection = false) {
    if (injectedProvider && (isNewConnection || shouldReconnect) && !address) {
      attachAccountChangeHandler(injectedProvider);
      attachChainChangedHandler(injectedProvider);
      const accounts = await injectedProvider.request<string[]>({
        method: EIP1193Methods.eth_requestAccounts,
      });
      const hexChainId = await injectedProvider.request<string>({
        method: EIP1193Methods.eth_chainId,
      });

      console.log({ accounts, hexChainId });

      setAddress(accounts[0]);
      setChainId(`${parseInt(hexChainId, 16)}`);
      setIsLoading(false);
    }
  }

  //attachers/detachers
  const attachChainChangedHandler = (provider: InjectedProvider) => {
    provider.on("chainChanged", handleChainChange);
  };

  const attachAccountChangeHandler = (provider: InjectedProvider) => {
    provider.on("accountsChanged", handleAccountsChange);
  };

  //event handlers
  const handleChainChange: ChainChangeHandler = (hexChainId) => {
    setChainId(`${parseInt(hexChainId, 16)}`);
  };

  //useful when user changes account internally via metamask
  const handleAccountsChange: AccountChangeHandler = (accounts) => {
    console.log(accounts);
    //requestAccounts(new connection) will set the address so no need to set again
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      //if no account is found, means user disconnected
    } else {
      setAddress(undefined);
      setChainId(undefined);
      saveUserAction(actionKey, "disconnect");
      removeAllListeners(providerId);
    }
  };

  async function disconnect() {
    if (!address) return;
    if (!injectedProvider) return;
    removeAllListeners(providerId);
    setAddress(undefined);
    setChainId(undefined);
    saveUserAction(actionKey, "disconnect");
  }

  async function connect() {
    try {
      setIsLoading(true);
      await requestAccess(true);
      saveUserAction(actionKey, "connect");
    } catch (err: any) {
      console.log(err);
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
    providerInfo:
      (address && ({ address, chainId, id: providerId } as ProviderInfo)) ||
      undefined,
  };
}

type Action = "connect" | "disconnect";
function saveUserAction(key: string, action: Action) {
  localStorage.setItem(key, action);
}

function retrieveUserAction(key: string): Action {
  return (localStorage.getItem(key) as Action) || "disconnect";
}

function removeAllListeners(providerId: ProviderId) {
  getProvider(providerId)?.removeAllListeners();
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
