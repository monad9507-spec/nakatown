"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { ARC } from "./config";

const projectId = "4f71172824a0ea69b0270161482356fe";

if (typeof window !== "undefined") {
  createAppKit({
    adapters: [new EthersAdapter()],
    networks: [ARC],
    defaultNetwork: ARC,
    projectId,
    metadata: {
      name: "NakaTown",
      description: "10,000 collectables on Arc",
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.svg`],
    },
    themeMode: "light",
    themeVariables: {
      "--w3m-accent": "#245bc8",
      "--w3m-border-radius-master": "18px",
    },
    features: { analytics: true, email: false, socials: [] },
  });
}
