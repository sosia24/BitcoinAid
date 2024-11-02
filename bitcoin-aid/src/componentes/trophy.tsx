import Image from "next/image"
export default function Trophy(){
    return(
        <>
        <div className="text-center fixed cursor-pointer md:bottom-[200px] bottom-[180px] md:right-[3%] right-[4%] text-white rounded-full transition transform hover:scale-110 md:w-[80px] w-[60px] h-[40px] md:h-[60px]">
        <a href="tournament">
        <Image 
        alt="trophy" 
        src={'/images/Trophy.png'} 
        width={100} 
        height={100} 
        className="">
        </Image>
        </a>
        </div>
        </>
    )
}