// import { EIP1193Methods } from "../constants";
import { useGetWallet, useSetWallet } from "../contexts/WalletContext";
import "./app.css";
// import useIncrement from "./useIncrement";
export default function App() {
  const {
    isWalletLoading,
    isProviderInitializing,
    displayCoin,
    coins,
    address,
    chainId,
    icon: displayIcon,
    id,
  } = useGetWallet();
  const { connect, disconnect } = useSetWallet();

  if (isProviderInitializing) return <div>loading...</div>;

  return (
    <div>
      {/* {!isAvalanche && (
        <div>
          <p>not connected to avalanche network</p>
          <button onClick={addAvalancheNetwork}>
            switch to avalanche network1
          </button>
        </div>
      )} */}
      <p>wallet id: {id || "none"}</p>
      <p>chainId: {isWalletLoading ? "loading" : chainId}</p>
      <p>address: {isWalletLoading ? "loading" : address}</p>
      <div>
        balance:
        <Coin
          logoSrc={displayIcon}
          amount={displayCoin.amount}
          symbol={displayCoin.symbol}
        />
      </div>
      <div>
        other balances:
        {coins.map((coin) => (
          <Coin
            key={coin.min_denom}
            logoSrc={coin.logo}
            amount={+coin.balance}
            symbol={coin.symbol}
          />
        ))}
      </div>
      {(id && <button onClick={disconnect}> disconnect</button>) || (
        <button onClick={connect}>connect metamask</button>
      )}

      {/* <br />
      <br />
      <h4>Features</h4>
      <ul>
        <li>balance</li>
        <li>address</li>
        <li>option to change to avax network when incorrect network</li>
        <li>TODO: send avax to c-chain address</li>
      </ul> */}
    </div>
  );
}

function Coin(props: { logoSrc: string; amount: number; symbol: string }) {
  return (
    <div className="coin">
      <img src={props.logoSrc} alt="" className="coin__logo" />
      <span>{props.amount}</span>
    </div>
  );
}

// async function addAvalancheNetwork() {
//   await getEthereum()?.send(EIP1193Methods.wallet_addEthereumChain, [
//     {
//       chainId: "0xA869",
//       chainName: "Avalanche Testnet C-Chain",
//       nativeCurrency: {
//         name: "Avalanche",
//         symbol: "AVAX",
//         decimals: 18,
//       },
//       rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
//       blockExplorerUrls: ["https://testnet.snowtrace.io/"],
//     },
//   ]);
// }
