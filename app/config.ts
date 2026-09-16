export const ARC = {
  id: 5042,
  caipNetworkId: "eip155:5042",
  chainNamespace: "eip155",
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.blockdaemon.mainnet.arc.io"] } },
  blockExplorers: { default: { name: "Arc Explorer", url: "https://explorer.arc.io" } },
} as const;

// Paste the deployed NakaTown NFT address here after deployment.
export const NFT_CONTRACT = "";

export const NFT_ABI = [
  "function totalMinted() view returns (uint256)",
  "function mintOpen() view returns (bool)",
  "function mintedByWallet(address) view returns (uint256)",
  "function quote(address,uint256) view returns (uint256 freeQuantity,uint256 totalPrice)",
  "function mint(uint256 quantity) payable",
];
