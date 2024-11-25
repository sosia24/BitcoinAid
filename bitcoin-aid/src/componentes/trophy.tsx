import Image from "next/image"
export default function Trophy(){
    return(
        <>
        <div className="fixed cursor-pointer md:bottom-[180px] bottom-[150px] right-[2%] text-white rounded-full transition transform hover:scale-110 md:w-[90px] w-[70px] h-[70px] md:h-[90px]">
        <a href="https://ethaid.io">
        <Image 
        alt="trophy" 
        src={'/images/EthLogoPNG.png'} 
        width={100} 
        height={100} 
        className="">
        </Image>
        </a>
        </div>
        </>
    )
}