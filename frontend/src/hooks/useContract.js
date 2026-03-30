import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContract, getProvider } from '../utils/web3';

export function useContract(contractAddress) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReadContract = useCallback(async () => {
    const provider = getProvider();
    return getContract(contractAddress, provider);
  }, [contractAddress]);

  const getWriteContract = useCallback(async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return getContract(contractAddress, signer);
  }, [contractAddress]);

  // ─── Blind Mint ───
  const mint = useCallback(async (quantity, mintPriceWei) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getWriteContract();
      const totalCost = BigInt(mintPriceWei) * BigInt(quantity);
      const tx = await contract.mint(quantity, { value: totalCost });
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message || 'Minting failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getWriteContract]);

  // ─── Choose Your Mint ───
  const mintSpecific = useCallback(async (tokenId, priceWei) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getWriteContract();
      const tx = await contract.mintSpecific(tokenId, { value: BigInt(priceWei) });
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message || 'Minting failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getWriteContract]);

  // ─── Presale Blind Mint ───
  const mintPresale = useCallback(async (quantity, mintPriceWei, proof) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getWriteContract();
      const totalCost = BigInt(mintPriceWei) * BigInt(quantity);
      const tx = await contract.mintPresale(quantity, proof, { value: totalCost });
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message || 'Presale minting failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getWriteContract]);

  // ─── Presale Choose Mint ───
  const mintPresaleSpecific = useCallback(async (tokenId, priceWei, proof) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getWriteContract();
      const tx = await contract.mintPresaleSpecific(tokenId, proof, { value: BigInt(priceWei) });
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message || 'Presale minting failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getWriteContract]);

  // ─── View Functions ───
  const getTotalSupply = useCallback(async () => {
    const contract = await getReadContract();
    return Number(await contract.totalSupply());
  }, [getReadContract]);

  const getMaxSupply = useCallback(async () => {
    const contract = await getReadContract();
    return Number(await contract.maxSupply());
  }, [getReadContract]);

  const getMintPrice = useCallback(async () => {
    const contract = await getReadContract();
    return await contract.mintPrice();
  }, [getReadContract]);

  const getCurrentPrice = useCallback(async () => {
    try {
      const contract = await getReadContract();
      return await contract.getCurrentPrice();
    } catch {
      // V1 contracts don't have this, fall back to mintPrice
      return getMintPrice();
    }
  }, [getReadContract, getMintPrice]);

  const isPaused = useCallback(async () => {
    const contract = await getReadContract();
    return contract.paused();
  }, [getReadContract]);

  const isTokenMinted = useCallback(async (tokenId) => {
    try {
      const contract = await getReadContract();
      return await contract.tokenMinted(tokenId);
    } catch {
      return false;
    }
  }, [getReadContract]);

  const getPresaleStatus = useCallback(async () => {
    try {
      const contract = await getReadContract();
      const [isPresale, isPublic] = await Promise.all([
        contract.isPresaleActive(),
        contract.isPublicMintActive(),
      ]);
      return { isPresale, isPublic };
    } catch {
      return { isPresale: false, isPublic: true }; // V1 = always public
    }
  }, [getReadContract]);

  return {
    mint,
    mintSpecific,
    mintPresale,
    mintPresaleSpecific,
    getTotalSupply,
    getMaxSupply,
    getMintPrice,
    getCurrentPrice,
    isPaused,
    isTokenMinted,
    getPresaleStatus,
    isLoading,
    error,
  };
}
