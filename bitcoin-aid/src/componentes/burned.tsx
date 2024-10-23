"use client"
import { useEffect, useState } from "react";
import {totalBurned,
    totalBtcaNft
} from "@/services/Web3Services";
import { FaFire } from "react-icons/fa";


export default function datas(){

const [burned, setBurned] = useState(0);
const [toNft, setToNft] = useState(0);

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
  fetchBurned();
  fetchTotalToNft();
},[])


return(
    <div className=" w-full border-b-2 border-b-[#3f3f3f] flex flex-col mt-[10px]">
    <div className="flex flex-col md:flex-row w-[96%] md:w-[70%] m-auto justify-between p-4">
      <p className="flex flex-row items-center mb-[10px] md:mb-0 md:text-[20px] text-[14px]">Total Burned: {burned.toFixed(2)} BTCA <FaFire className="text-orange-400"></FaFire></p>
      <p className="flex flex-row items-center right-0 mb-[10px] md:mb-0 md:text-[20px] text-[14px]">Total Distributed to Nft's: {toNft.toFixed(2)} BTCA <FaFire className="text-orange-400"></FaFire></p>
    </div>      
  </div>
)}