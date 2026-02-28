import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  checkNetwork: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Sepolia network configuration
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_NETWORK = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: "Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.infura.io/v3/5c300a194498431384650c5e84f5c4bd"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  // Check network
  const checkNetwork = async (): Promise<boolean> => {
    if (typeof window.ethereum === "undefined") {
      return false;
    }

    try {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(
        typeof chainId === "string" ? chainId : String(chainId),
        16
      );
      setChainId(currentChainId);
      return currentChainId === SEPOLIA_CHAIN_ID;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  };

  // Switch to Sepolia network
  const switchToSepolia = async (): Promise<void> => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_NETWORK.chainId }],
      });
      setChainId(SEPOLIA_CHAIN_ID);
      toast.success("Switched to Sepolia network");
    } catch (switchError: unknown) {
      // If the network doesn't exist, add it
      if (
        switchError &&
        typeof switchError === "object" &&
        "code" in switchError &&
        switchError.code === 4902
      ) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_NETWORK],
          });
          setChainId(SEPOLIA_CHAIN_ID);
          toast.success("Added and switched to Sepolia network");
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
          toast.error("Failed to add Sepolia network");
          throw addError;
        }
      } else if (
        switchError &&
        typeof switchError === "object" &&
        "code" in switchError &&
        switchError.code === 4001
      ) {
        toast.error("Please approve the network switch");
        throw new Error("Network switch rejected");
      } else {
        console.error("Error switching network:", switchError);
        toast.error("Failed to switch to Sepolia network");
        throw switchError;
      }
    }
  };

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
            setIsConnected(true);
          }
          // Check network
          await checkNetwork();
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        if (newChainId !== SEPOLIA_CHAIN_ID) {
          toast.warning("Please switch to Sepolia network");
        }
      });
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);

        // Check and switch to Sepolia if needed
        const isSepolia = await checkNetwork();
        if (!isSepolia) {
          toast.info("Switching to Sepolia network...");
          await switchToSepolia();
        }

        toast.success("Wallet connected successfully!");
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 4001
      ) {
        toast.error("Please connect to MetaMask.");
      } else {
        toast.error("Failed to connect wallet. Please try again.");
      }
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        chainId,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
        checkNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// Extend Window interface for TypeScript
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (data?: unknown) => void) => void;
  removeAllListeners: (event: string) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
