"use client";
import { useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { FaReddit } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image"; // Certifique-se de que esta importação está presente

export default function Links() {
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => {
        setOpen(prevValue => !prevValue);
    };

    return (
        <>

                <Image
                    onClick={handleOpen}
                    src={"/images/LogoBTCA-PNG.png"}
                    alt="logobtca"
                    width={100}
                    height={100}
                    className="fixed cursor-pointer md:bottom-[90px] bottom-[80px] right-[2%] text-white rounded-full transition transform hover:scale-110 md:w-[100px] w-[80px] h-[80px] md:h-[100px]"
                />


            {open && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div onClick={handleOpen} className="fixed inset-0 bg-black opacity-80"></div>
                    <div className="p-[20px] text-center fixed top-0 right-0 h-[100%] overflow-y-auto w-[300px] bg-[#201f1b] border-l-2 border-[#d79920] shadow-lg z-10">
                        <button onClick={handleOpen} className="text-[#ed4021] absolute top-2 right-4">
                            <IoMdClose className="text-[25px]" />
                        </button>
                        <p className="mt-[20px] text-[20px]">Links</p>

                        <a href="https://t.me/BitcoinAidspanish" target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-row bg-blue-500 text-white p-2 rounded-full shadow-lg mt-[15px] hover:bg-blue-600 transition transform hover:scale-110">
                                <FaTelegramPlane className=" w-6 h-6" />
                                <p className="ml-[10px] text-[18px]">Telegram Spain</p>
                                <span className="fi fi-es ml-[20px]"></span>
                            </div>
                        </a>

                        <a href="https://t.me/BitcoinAidEng" target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-row bg-blue-500 text-white p-2 rounded-full shadow-lg mt-[15px] hover:bg-blue-600 transition transform hover:scale-110">
                                <FaTelegramPlane className="w-6 h-6" />
                                <p className="ml-[10px] text-[18px]">Telegram EUA</p>
                                <span className="fi fi-us ml-[20px]"></span>
                            </div>
                        </a>

                        <a href="https://t.me/BTCAIDBrasil" target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-row bg-blue-500 text-white p-2 rounded-full shadow-lg mt-[15px] hover:bg-blue-600 transition transform hover:scale-110">
                                <FaTelegramPlane className=" w-6 h-6" />
                                <p className="ml-[10px] text-[18px]">Telegram Brasil</p>
                                <span className="fi fi-br ml-[20px]"></span>
                            </div>
                        </a>

                        <a href="https://chat.whatsapp.com/FEUqYqQFIIR50DdWB1gpxj" target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-row bg-green-500 text-white p-2 rounded-full shadow-lg mt-[15px] hover:bg-green-600 transition transform hover:scale-110">
                                <FaWhatsapp className=" w-6 h-6" />
                                <p className="ml-[10px] text-[18px]">Whatsapp Community</p>
                            </div>
                        </a>

                        <a href="https://www.reddit.com/user/BTC_Aid/" target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-row bg-orange-500 text-white p-2 rounded-full shadow-lg mt-[15px] hover:bg-orange-600 transition transform hover:scale-110">
                                <FaReddit className=" w-6 h-6" />
                                <p className="ml-[10px] text-[18px]">Reddit</p>
                            </div>
                        </a>

                        <a href="https://x.com/BTC_Aid" target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-row bg-black text-white p-2 rounded-full shadow-lg mt-[15px] transition transform hover:scale-110">
                                <FaXTwitter className="w-6 h-6" />
                                <p className="ml-[10px] text-[18px]">X/Twitter</p>
                            </div>
                        </a>
                        <a href="https://polygonscan.com/address/0x8E60D47Ec05dAe2Bd723600c2B3CD8321D775d22" target="_blank" rel="noopener noreferrer">
                            <div className="flex flex-row bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-lg mt-[15px] transition transform hover:scale-110">
                                <Image alt="btca logo" src={"/images/logoBTCA-PNG.png"} width={100} height={100} className="w-10 h-10 mt-[2px]"></Image>
                                <p className="ml-[-5px] text-[18px] p-2">BTCA Token</p>
                            </div>
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
