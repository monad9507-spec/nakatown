"use client";

import { useEffect, useState } from "react";
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract, JsonRpcProvider, formatUnits } from "ethers";
import "./wallet";
import { ARC, NFT_ABI, NFT_CONTRACT } from "./config";

const slides = [
  { src: "/characters/naka-01.jpeg", name: "Red Visor" },
  { src: "/characters/naka-02.jpeg", name: "Gold Frame" },
  { src: "/characters/naka-03.jpeg", name: "Pink Shade" },
  { src: "/characters/naka-04.jpeg", name: "Purple Cap" },
  { src: "/characters/naka-05.jpeg", name: "Crown Club" },
];
const configured = /^0x[a-fA-F0-9]{40}$/.test(NFT_CONTRACT);
const short = (a?: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

function WalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  return <button className="wallet-button" onClick={() => open({ view: isConnected ? "Account" : "Connect" })}><i />{isConnected ? short(address) : "Connect wallet"}</button>;
}

function WalletSync() {
  const { isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");
  useEffect(() => { if (isConnected && walletProvider && Number(chainId) !== ARC.id) switchNetwork(ARC).catch(() => undefined); }, [chainId, isConnected, switchNetwork, walletProvider]);
  return null;
}

function Slider() {
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setActive(i => (i + 1) % slides.length), 4200); return () => clearInterval(t); }, []);
  return <section className="gallery-shell" aria-label="NakaTown preview gallery">
    <div className="gallery-topline"><span>Town portraits</span><span>{String(active + 1).padStart(2, "0")} / 05</span></div>
    <div className="slider">{slides.map((slide, i) => { const o=(i-active+slides.length)%slides.length; const pos=o===0?"active":o===1?"right":o===slides.length-1?"left":"hidden"; return <figure key={slide.name} className={`slide ${pos}`}><img src={slide.src} alt={`NakaTown character: ${slide.name}`}/><figcaption>{slide.name}</figcaption></figure>; })}</div>
    <div className="slider-controls"><button aria-label="Previous portrait" onClick={() => setActive(i => (i + slides.length - 1) % slides.length)}>←</button><div className="slider-dots">{slides.map((s,i) => <button key={s.name} aria-label={`Show ${s.name}`} className={i===active?"current":""} onClick={() => setActive(i)} />)}</div><button aria-label="Next portrait" onClick={() => setActive(i => (i + 1) % slides.length)}>→</button></div>
  </section>;
}

function MintPanel() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [data, setData] = useState({ total:0n, isOpen:false, minted:0n, price:0n, loading:true });
  const refresh = async () => {
    if (!configured) return setData(d => ({...d, loading:false}));
    try {
      const nft = new Contract(NFT_CONTRACT, NFT_ABI, new JsonRpcProvider(ARC.rpcUrls.default.http[0]));
      const [total, isOpen, minted, quote] = await Promise.all([nft.totalMinted(), nft.mintOpen(), address ? nft.mintedByWallet(address) : Promise.resolve(0n), nft.quote(address ?? "0x0000000000000000000000000000000000000000", quantity)]);
      setData({total, isOpen, minted, price:quote[1], loading:false});
    } catch { setData(d => ({...d, loading:false})); }
  };
  useEffect(() => { refresh(); }, [address, quantity]);
  const mint = async () => {
    if (!isConnected) return open({view:"Connect"});
    if (!configured) return setStatus("NFT contract address has not been set yet.");
    if (!data.isOpen) return setStatus("Mint is not open yet.");
    if (!walletProvider) return open({view:"Connect"});
    try {
      setStatus("Confirm the transaction in your wallet…");
      const nft = new Contract(NFT_CONTRACT, NFT_ABI, await new BrowserProvider(walletProvider).getSigner());
      const quote = await nft.quote(address, quantity);
      const tx = await nft.mint(quantity, { value: quote[1] });
      setStatus("Transaction sent. Waiting for confirmation…"); await tx.wait();
      setStatus("Mint complete. Welcome to NakaTown."); refresh();
    } catch (e: unknown) {
      const m=e instanceof Error?e.message:"Mint cancelled.";
      setStatus(m.includes("0.5") ? "Keep at least 0.5 USDC in your wallet to use the first free mint." : m);
    }
  };
  const price=data.price===0n?"Free":`${formatUnits(data.price,18)} USDC`;
  return <section id="mint" className="mint-section"><div className="mint-intro"><p className="eyebrow">Mint on Arc</p><h2>YOUR KEY<br/>TO TOWN.</h2><p>First collectible is free for each wallet. Keep at least <strong>0.5 USDC</strong> in your wallet to qualify. Every next mint is 0.15 USDC.</p><div className="mini-rule"><span>01</span><b>1 free mint per wallet</b></div><div className="mini-rule"><span>02</span><b>Native USDC on Arc</b></div></div>
  <div className="mint-card"><div className="mint-card-head"><span>Mint terminal</span><span>{data.loading?"…":`${data.total.toLocaleString()} / 10,000`}</span></div><div className="mint-progress"><i style={{width:`${Math.min(100,Number(data.total)/100)}%`}}/></div><div className="mint-row"><span>Quantity</span><div className="counter"><button aria-label="Decrease quantity" disabled={quantity===1} onClick={() => setQuantity(v => Math.max(1,v-1))}>−</button><b>{quantity}</b><button aria-label="Increase quantity" disabled={quantity===20} onClick={() => setQuantity(v => Math.min(20,v+1))}>+</button></div></div><div className="mint-row"><span>Mint price</span><b>{price}</b></div><div className="mint-row"><span>Free mint</span><b>{data.minted===0n?"Available*":"Used"}</b></div><div className="notice-box"><span>✦</span><p>* Free mint requires a wallet balance of 0.5 USDC or more before minting.</p></div><button className="mint-button" onClick={mint}>{isConnected?"Mint NakaTown":"Connect to mint"} <span>↗</span></button>{status && <p className="mint-status" role="status">{status}</p>}</div></section>;
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  return <main><WalletSync/><header className="site-header"><a className="brand" href="#">NAKA<span>TOWN</span></a><nav className={menu?"nav open":"nav"}><a href="#collection" onClick={() => setMenu(false)}>Collection</a><a href="#mint" onClick={() => setMenu(false)}>Mint</a><a href="#how" onClick={() => setMenu(false)}>How it works</a></nav><div className="header-actions"><WalletButton/><button className="menu" aria-label="Toggle menu" onClick={() => setMenu(v => !v)}>☰</button></div></header>
  <section className="hero"><div className="hero-copy"><p className="eyebrow">Arc · Collectible town</p><h1>MAKE<br/>YOUR MARK.</h1><p className="lead">10,000 strange faces, one growing town. Mint your character directly on Arc.</p><div className="hero-actions"><a className="primary-link" href="#mint">Mint a character <span>↘</span></a><a className="text-link" href="#collection">Meet the town ↓</a></div></div><Slider/></section>
  <section id="collection" className="numbers"><article><b>10,000</b><span>NakaTown characters</span></article><article><b>01</b><span>free mint per wallet</span></article><article><b>0.15</b><span>USDC after the first</span></article><article><b>ARC</b><span>native USDC network</span></article></section>
  <section id="how" className="about"><p className="eyebrow">A place for originals</p><div className="about-grid"><h2>NO TWO<br/>TOWNIES<br/>FEEL THE SAME.</h2><div><p>NakaTown is a 10,000-piece character collection for Arc. Choose a face, claim your place, and let the town grow one wallet at a time.</p><a href="#mint" className="underlined">Enter the mint terminal <span>→</span></a></div></div></section>
  <MintPanel/><footer><a className="brand" href="#">NAKA<span>TOWN</span></a><span>Built for Arc · Native USDC</span><a href="#mint">Mint now ↑</a></footer></main>;
}
