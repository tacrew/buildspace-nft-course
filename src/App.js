import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import myEpicNft from "./utils/MyEpicNFT.json";
import twitterLogo from "./assets/twitter-logo.svg";

// Constants
const TWITTER_HANDLE = "tacrew";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x7a1c4798B3d8e3a28014C913C255F8FDa41F862B";
const OPENSEA_LINK = "";
// const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    }
    console.log("We have the ethereum object", ethereum);

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (!accounts.length) {
      console.log("No authorized account found");
      return;
    }

    const account = accounts[0];
    console.log(`Found an authorized account: ${account}`);

    const chainId = await ethereum.request({ method: "eth_chainId" });
    console.log(`Connected to chain ${chainId}`);

    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    setCurrentAccount(account);
    setupEventLister();
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(`Connected ${accounts[0]}`);
      setCurrentAccount(accounts[0]);
      setupEventLister();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventLister = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );

      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber());
        alert(
          `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        );
      });

      console.log("Setup event listener!");
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );

      console.log("Going to pop wallet now to pay gas...");
      let nftTxn = await connectedContract.makeAnEpicNFT();

      console.log("Mining...please wait.");
      await nftTxn.wait();

      console.log(
        `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen bg-black overflow-scroll text-center">
      <div className="h-full flex flex-col py-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-300">
          My NFT Collection
        </h1>
        <p className="mt-4 text-white text-2xl">
          Each unique. Each beautiful. Discover your NFT today.
        </p>

        <div className="mt-8 flex justify-center">
          {!currentAccount ? (
            <button
              onClick={connectWallet}
              className="inline-block py-2 px-6 rounded cursor-pointer font-bold text-white bg-gradient-to-r from-emerald-300 to-blue-300"
            >
              Connect to Wallet
            </button>
          ) : (
            <button
              onClick={askContractToMintNft}
              className="inline-block py-2 px-6 rounded cursor-pointer font-bold text-white bg-gradient-to-r from-fuchsia-600 to-pink-600"
            >
              Mint NFT
            </button>
          )}
        </div>

        <div className="flex-1 mt-8">
          <a
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
            className="py-2 px-4 font-bold bg-sky-300/90 rounded"
          >
            Check NFT Collection at Opensea
          </a>
        </div>

        <div className="flex justify-center items-center">
          <img alt="Twitter Logo" className="w-9 h-9" src={twitterLogo} />
          <a
            className="text-white font-bold"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
