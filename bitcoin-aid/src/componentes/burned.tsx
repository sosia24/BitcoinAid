"use client"
import { useEffect, useState } from "react";
import {totalBurned,
    totalBtcaNft,
    pool2,
} from "@/services/Web3Services";
import { FaFire } from "react-icons/fa";


export default function datas(){

const [burned, setBurned] = useState(0);
const [toNft, setToNft] = useState(0);
const [toPool2, setToPool2] = useState(0);

useEffect(() => {
  const fetchBurned = async () => {
    const burned = await totalBurned();
    setBurned(Number(burned)/1000000000000000000);
    console.log("burned: ", burned);
  }
  const fetchTotalToNft = async () => {
    const nft = await totalBtcaNft();
    setToNft(Number(nft)/1000000000000000000);
  }
  const fetchPool2 = async () => {
    const nft = await pool2();
    setToPool2(Number(nft)/1000000000000000000);
  }
  fetchBurned();
  fetchTotalToNft();
  fetchPool2();
},[])


return (
  <div className="w-full border-b-2 border-b-[#3f3f3f] flex flex-col mt-[10px] z-10">
    <div className="overflow-hidden">
      <div className="py-2 animate-marquee whitespace-nowrap" aria-live="polite">
        <span className="mx-4 text-[16px] text-green-700">Total Burned: {burned.toFixed(2)}</span>
        <span className="mx-4 text-[16px] text-[#d79920]">Total Distributed to Nfts: {toNft.toFixed(2)} BTCA</span>
        <span className="mx-4 text-[16px] text-green-700">Pool 2: {toPool2.toFixed(2)} BTCA</span>
        <span className="mx-4 text-[16px] text-[#d79920]">Total Burned: {burned.toFixed(2)}</span>
        <span className="mx-4 text-[16px] text-green-700">Total Distributed to Nfts: {toNft.toFixed(2)} BTCA</span>
        <span className="mx-4 text-[16px] text-[#d79920]">Pool 2: {toPool2.toFixed(2)} BTCA</span>
        <span className="mx-4 text-[16px] text-green-700">Total Burned: {burned.toFixed(2)}</span>
        <span className="mx-4 text-[16px] text-[#d79920]">Total Distributed to Nfts: {toNft.toFixed(2)} BTCA</span>
        <span className="mx-4 text-[16px] text-green-700">Pool 2: {toPool2.toFixed(2)} BTCA</span>
      </div>
    </div>
  </div>
)};
