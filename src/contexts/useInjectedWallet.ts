import { useEffect, useState } from "react";
import {
  AccountChangeHandler,
  ChangeChangeHandler,
  Ethereum,
} from "@types-app";
import { chainIDs, dwindow, EIP1193Events, EIP1193Methods } from "../constants";
import { ethers } from "ethers";

export default function useAvalanche() {
  //connect only if there's no active wallet
  const lastAction = retrieveUserAction();
  const shouldReconnect = lastAction === "connect";
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(true);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [isAvalanche, setIsAvalanche] = useState(true);

  useEffect(() => {
    requestAccess();
    return () => {
      removeAllListeners();
    };
    //eslint-disable-next-line
  }, []);

  //balance getter
  useEffect(() => {
    (async () => {
      if (!address) return;
      //at first run get chainId from injected provider
      //and update via chainChangeHandler
      if (!isAvalanche) return;

      const provider = new ethers.providers.Web3Provider(dwindow.ethereum);
      const signer = provider.getSigner();
      const chainIdNum = await signer.getChainId();
      if (chainIdNum !== parseInt(chainIDs.avalanche_test, 16)) {
        setIsAvalanche(false);
        return;
      }
      setIsBalanceLoading(true);
      const balance = await signer.getBalance();
      setBalance(ethers.utils.formatUnits(balance, 18));
      setIsBalanceLoading(false);
    })();
  }, [isAvalanche, address]);

  async function requestAccess(isNewConnection = false) {
    const ethereum = getEthereum();
    if (ethereum && (isNewConnection || shouldReconnect) && !address) {
      attachAccountChangeHandler(ethereum);
      attachChainChangedHandler(ethereum);
      const { result: accounts = [] } = await ethereum.send(
        EIP1193Methods.eth_requestAccounts,
        []
      );
      setAddress(accounts[0]);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }

  //attachers/detachers
  const attachChainChangedHandler = (ethereum: Ethereum) => {
    ethereum.on(EIP1193Events.chainChanged, handleChainChange);
  };
  const attachAccountChangeHandler = (ethereum: Ethereum) => {
    ethereum.on(EIP1193Events.accountsChanged, handleAccountsChange);
  };

  //event handlers
  const handleChainChange: ChangeChangeHandler = (hexChainId) => {
    setIsAvalanche(hexChainId === chainIDs.avalanche_test);
  };

  //useful when user changes account internally via metamask
  const handleAccountsChange: AccountChangeHandler = (accounts) => {
    //requestAccounts(new connection) will set the address so no need to set again
    if (accounts.length > 0 && !address) {
      setAddress(accounts[0]);
      //if no account is found, means user disconnected
    } else {
      removeAllListeners();
      setAddress("");
      saveUserAction("disconnect");
    }
  };

  async function disconnect() {
    if (!address) return;
    const ethereum = getEthereum();
    if (!ethereum) return;
    removeAllListeners();
    setAddress("");
    setBalance("0");
    saveUserAction("disconnect");
  }

  async function connect() {
    try {
      setLoading(true);
      await requestAccess(true);
      saveUserAction("connect");
    } catch (err: any) {
      setLoading(false);
      //let caller handle error with UI
      if ("code" in err && err.code === 4001) {
        throw new RejectMetamaskLogin();
      } else {
        throw new Error("Uknown error occured");
      }
    }
  }

  return {
    balance,
    connect,
    disconnect,
    isAvalanche,
    loading,
    isBalanceLoading,
    address,
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

export function getEthereum() {
  return (window as any).ethereum as Ethereum;
}

function removeAllListeners() {
  getEthereum().removeAllListeners();
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
