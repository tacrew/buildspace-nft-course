import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";

import myEpicNft from "./utils/MyEpicNFT.json";
import twitterLogo from "./assets/twitter-logo.svg";

// Constants
const TWITTER_HANDLE = "tacrew";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x0355013b3442d544Dc663107f23d9091575559b5";
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/squarenft-kjjv4nppth";
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentMintCount, setCurrentMintCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasSoldOut = currentMintCount >= TOTAL_MINT_COUNT;

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

    // check connected network
    const chainId = await ethereum.request({ method: "eth_chainId" });
    console.log(`Connected to chain ${chainId}`);

    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    setCurrentAccount(account);
    await getCurrentMintCount();
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
        setCurrentMintCount(tokenId.toNumber() + 1);
        toast(
          (t) => (
            <div className="">
              <div>We've minted your NFT and sent it to your wallet</div>
              <div>
                It may be blank right now. It can take a max of 10 min to show
                up on OpenSea.
              </div>
              <a
                className="text-blue-700 font-bold underline"
                href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`}
                target="_blank"
                rel="noreferrer"
              >
                Here's the link
              </a>
            </div>
          ),
          { duration: 4000 }
        );
      });

      console.log("Setup event listener!");
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentMintCount = async () => {
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

      const mintCount = await connectedContract.getTotalNFTsMintedSoFar();
      setCurrentMintCount(mintCount.toNumber());
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen bg-black overflow-scroll text-center">
      <Toaster />
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
              className="inline-block py-2 px-6 rounded cursor-pointer font-bold text-white bg-gradient-to-r from-emerald-300 to-blue-300 hover:opacity-75"
            >
              Connect to Wallet
            </button>
          ) : (
            <button
              onClick={!hasSoldOut && askContractToMintNft}
              disabled={hasSoldOut || isLoading}
              className="inline-block py-2 px-6 rounded cursor-pointer font-bold text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:opacity-75 disabled:from-gray-500 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              {!isLoading ? (
                <span>{hasSoldOut ? "Sold out" : "Mint NFT"}</span>
              ) : (
                <div className="flex justify-center items-center space-x-4">
                  <span className="animate-spin h-6 w-6 border-4 border-white-500 rounded-full border-t-transparent" />
                  <span>minting...</span>
                </div>
              )}
            </button>
          )}
        </div>

        <div className="mt-2 text-white">{`${currentMintCount} / ${TOTAL_MINT_COUNT} NFTs minted`}</div>

        <div className="flex-1 mt-8">
          <a
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
            className="py-2 px-4 font-bold bg-sky-300/90 rounded cursor-pointer hover:opacity-75"
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
