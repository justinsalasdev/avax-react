import { EIP1193Methods } from "../constants";
import useAvalanche, { getEthereum } from "./useAvalanche";
export default function App() {
  const {
    connect,
    disconnect,
    address,
    balance,
    isBalanceLoading,
    loading,
    isAvalanche,
  } = useAvalanche();

  if (loading) return <div>loading...</div>;

  return (
    <div>
      {!isAvalanche && (
        <div>
          <p>not connected to avalanche network</p>
          <button onClick={addAvalancheNetwork}>
            switch to avalanche network
          </button>
        </div>
      )}
      <p>address: {address}</p>
      <p>balance: {isBalanceLoading ? "..loading" : `${balance} AVAX`}</p>
      {(address && <button onClick={disconnect}> disconnect</button>) || (
        <button onClick={connect}>connect metamask</button>
      )}

      <br />
      <br />
      <h4>Features</h4>
      <ul>
        <li>balance</li>
        <li>address</li>
        <li>option to change to avax network when incorrect network</li>
        <li>TODO: send avax to c-chain address</li>
      </ul>
    </div>
  );
}

async function addAvalancheNetwork() {
  await getEthereum()?.send(EIP1193Methods.wallet_addEthereumChain, [
    {
      chainId: "0xA869",
      chainName: "Avalanche Testnet C-Chain",
      nativeCurrency: {
        name: "Avalanche",
        symbol: "AVAX",
        decimals: 18,
      },
      rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
      blockExplorerUrls: ["https://testnet.snowtrace.io/"],
    },
  ]);
}
