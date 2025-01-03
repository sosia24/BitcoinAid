"use client";
import { TbLockAccess } from "react-icons/tb";
import { useEffect } from "react";
import { useState } from "react";
import { useWallet } from "@/services/walletContext";
import Slider from "react-slick";
import Error from "@/componentes/erro";
import Alert from "@/componentes/alert";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoTriangle } from "react-icons/io5";
import {
  getQueue,
  getCurrentBatch,
  addQueue,
  mintNft,
  nftPrice,
  approveMint,
  balanceFree,
  totalNfts,
  isApproveToQueue,
  approveToAll,
  haveNft,
  claimQueue,
  totalMintedOnBatch,
  getTokenPrice,
  getAllowanceUsdt,
  getNftUserByBatch,
} from "@/services/Web3Services";
import { nftQueue } from "@/services/types";
import { blockData } from "@/services/types";
import Image from "next/image";
import { BlockList } from "net";
import React, { useRef } from 'react';
import { FaAngleDoubleLeft } from "react-icons/fa";
import { FaAngleDoubleRight } from "react-icons/fa";

const SimpleSlider = () => {
  const [loading, setLoading] = useState(false);
  const [queueData, setQueueData] = useState<nftQueue[][]>([]);
  const [blockData, setBlockData] = useState<blockData[][]>([]);
  const [nextPaid, setNextPaid] = useState<nftQueue[]>();
  const [balance, setBalance] = useState<number>(0);
  const [valuesNextFour, setValuesNextFour] = useState<number[]>([]);
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const [addNftOpen, setNftAddOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number | "">("");
  const [nftCurrentPrice, setNftCurrentPrice] = useState<number>(0);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const { address, setAddress } = useWallet();
  const [approveToMint, setApproveToMint] = useState<number>(0);
  const [approveToMintOpen, setApproveToMintOpen] = useState<boolean>(false);
  const [approveQueue, setApproveQueue] = useState<boolean>(false);
  const [minted, setMinted] = useState<number>(0);
  const [newQueue, setNewQueue] = useState<blockData[][]>([]);
  const [priceToken, setPriceToken] = useState<number>(0);
  const [lastBatchWithNft, setLastBatchWithNft] = useState<number>(0);
  const [allowanceUsdt, setAllowanceUsdt] = useState<number>(0);
  const [totalNftToPaid, setTotalNftToPaid] = useState<number>(0)
  const [imageError, setImageError] = useState(false);



  async function getLastBatch(){
    const result = await getCurrentBatch();
    setCurrentBatch(result);
    if (address) {
      for (let i = 1; i <= result; i++) {
        const value = await getNftUserByBatch(address, i);
        if(value){
          setLastBatchWithNft(i);
          handleSubmit();
          return;
        }
      }
      setNftAddOpen(false);
      setError("You don't have Nft's");
    }
  }

  async function handleApproveOpen(){
    setApproveToMintOpen(prevValue => !prevValue);
  }

  async function verificaApprove(){
    if(address){
      if(allowanceUsdt >= nftCurrentPrice){
        buyNft();
      }else{
        goApproveMint();
      }
    }
    
  }

  function goApproveMint(){
    setApproveToMintOpen(true);
  }

  function handleApproveMintOpen(){
    setApproveToMintOpen(prevValue => !prevValue);
  }

  async function doClaimQueue(index: number, queueId: number) {
    if (address) {
      try {
        setLoading(true);
        const result = await claimQueue(index, queueId);
        if (result) {
          setLoading(false);
          setAlert(
            "Be happy! The distribution was a success"
          );
          fetchQueue();
        }
      } catch (err: any) {
        setLoading(false);

        setError("Ops! Something went wrong!");
      }
    }
  }

  async function totalSendInBatch() {
    try {
      const result = await totalMintedOnBatch();
      setMinted(Number(result));
    } catch (err) {
      ("");
    }
  }

  useEffect(() =>{
    totalSendInBatch();
    const fetchAllowance = async ()=>{
      if(address){
        const result = await getAllowanceUsdt(address);
        setAllowanceUsdt(result);
      }
    }
    fetchAllowance();
  })

  const handleApproveQueueOpen = () => {
    setApproveQueue(false);
    setNftAddOpen(false);
  };

  async function doApproveNft() {
    setLoading(true);
    setApproveQueue(false);
    try {
      if (address) {
        await approveToAll();
        setLoading(false);
        setAlert("Very good! Now you can add your NFTs to the queues");
      }
    } catch (err: any) {
      setLoading(false);
      setError("Something went wrong: " + err.reason);
    }
  }

  async function isApprovedForAll() {
    if (address) {
      const result = await isApproveToQueue(address);
      if (result) {
        setNftAddOpen(true);
      } else {
        setApproveQueue(true);
      }
    } else {
      setError("You need to connect wallet to interact with the project");
    }
  }

  async function approveToMintNft(value:number){
    try{
      setLoading(true);
      const priceInWei = Number(value) * 1000000;
      const result = await approveMint(priceInWei);
      if (result) {
        setLoading(false);
        setAlert("Now you can buy NFT's");
      }
    } catch (err: any) {
      setLoading(false);
      setError("Failed to buy nft: " + err.reason);
    }
  }

  const doApproveMint = () => {
    const priceInWei: number = Number(nftCurrentPrice)*100000;
    if (address) {
      approveToMintNft(priceInWei);
    } else {
      setError("You need connect your wallet");
    }
  };

  const handleSubmit = async () => {
      if (address && lastBatchWithNft) {
        const result = await haveNft(address, lastBatchWithNft);
        if (result > 0) {
          setNftAddOpen(false);
          setLoading(true);
          try {
            const tx = await addQueue(lastBatchWithNft);
            if (tx) {
              setLoading(false);
              setAlert("Your nft has been successfully queued");
              fetchQueue();
            }
          } catch (err: any) {
            setLoading(false);
            setError("Ops! Something went wrong: " + err.reason);
          }
        } else {
          setNftAddOpen(false);
          setError("You don't have any NFTs from this batch");
        }
      }
  };


  const buyNft = async () => {
    try {
      setLoading(true);
      const result = await mintNft();
      if (result) {
        setLoading(false);
        setAlert("Congratulations on purchasing your NFT");
        totalSendInBatch();
      } else {
        setError("Failed to purchase nft");
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setError("Failed to purchase nft: " + err.reason);
    }
  };

  async function getNftPrice(currentBatch: number) {
    try {
      const result = await nftPrice(currentBatch);
      setNftCurrentPrice(result);
    } catch (err: any) {
      setError("Failed on get NFT's price: " + err.reason);
    }
  }

  const clearError = () => {
    setError("");
  };
  const clearAlert = () => {
    setAlert("");
  };

  const fetchQueue = async () => {
    try {
      const result = await getCurrentBatch();
      setCurrentBatch(result);
      const promises = [];
      for (let i = 1; i <= result; i++) {
        promises.push(getQueue(i));
      }

      const results = await Promise.all(promises);
      setQueueData(results);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchQueue();
    };
    totalSendInBatch();
    fetchData();
  }, []);
  
  

  useEffect(() => {
    if (currentBatch) {
      getNftPrice(currentBatch);
    }
  }, [currentBatch]);

  const slidersRefs = useRef<(Slider | null)[]>([]);
  const goToLastSlide = (index: number) => {
    const sliderRef = slidersRefs.current[index];
    if (sliderRef) {
      const totalSlides = React.Children.count(sliderRef.props.children);
      if(totalSlides > 4){
        sliderRef.slickGoTo(totalSlides - 1);
      }
    }
  };

  const goToFirstSlide = (index: number) => {
    const sliderRef = slidersRefs.current[index];
    if (sliderRef) {
      sliderRef.slickGoTo(0);
    }
  };
  const settings = (dataSetLength: number) => {
    const handleBeforeChange = (next: number) => {
      // Previne ir além do número total de slides
      if (next >= dataSetLength) {
        return false; // Impede a transição se o próximo slide ultrapassar o limite
      }
    };
    const maxSlidesToShow = 4;
    return {
      dots: false,
      infinite: false, // Desativa o loop infinito
      speed: 300,
      slidesToShow:   Math.min(maxSlidesToShow, dataSetLength), // Mostra no máximo 4 slides ou menos
      slidesToScroll: 1, // Desliza no máximo 1 slide por vez
      adaptiveHeight: true,
      arrows: dataSetLength > maxSlidesToShow, // Exibe setas se houver mais que 4 slides
      swipe: true,
      touchMove: true,
      draggable: dataSetLength > 1,
      beforeChange: handleBeforeChange,
       // Permite arrastar se houver mais de 1 slide

      responsive: [
        {
          breakpoint: 1300,
          settings: {
            slidesToShow: Math.min(3, dataSetLength),
            slidesToScroll: 1,
            beforeChange: handleBeforeChange,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(3, dataSetLength),
            slidesToScroll: 1,
            beforeChange: handleBeforeChange,
          },
        },
        {
          breakpoint: 950,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: false,
            arrows: false,
            beforeChange: handleBeforeChange,
          },
        },
      ],
    };
  };





  // Função que retorna o valor a ser deduzido com base na fila
function getPaymentAmountForQueue(queueIndex: number):number {
  let start = 10;
  let batchDecimal = queueIndex % 10;
  let valueNft = 0;
  if(batchDecimal == 0){
    valueNft = 5120*3;
  }else{
    for(let i = 1; i < batchDecimal; i++){
      start = start*2;
    }
    valueNft = start*3;
  }
  return valueNft;
}

async function getBalanceFree(){
    const result = await balanceFree();
    if(result){
      setBalance(Number(result));
    }
}

async function veSePaga(queue: nftQueue[][]) {
  setTotalNftToPaid(0);
  let balanceToPaidNfts = Number(await balanceFree());
  balanceToPaidNfts = (balanceToPaidNfts / 10 ** 18) * Number(priceToken);
  let i = 0; // Índice da fila atual
  let first = true; // Define se é o primeiro ou o último elemento da fila atual


  // Matriz que vai armazenar os resultados com booleano (true/false)
  const queueDataNew: blockData[][] = Array.from({ length: queue.length }, () => []);

  // Variável de controle para indicar quando o saldo acabou
  let hasBalance = true;

  // Loop principal até o saldo acabar ou todos os elementos serem processados
  while (queue.some((fila) => fila.length > 0)) {
    // Verifica se ainda existem elementos na fila atual
    if (queue[i] && queue[i].length > 0) {
      let element;

      // Verifica se estamos processando o primeiro ou o último elemento
      if (first) {
        element = queue[i][0]; // Primeiro elemento da fila
      } else {
        element = queue[i][queue[i].length - 1]; // Último elemento da fila
      }

      // Se ainda há saldo, calcula o pagamento, caso contrário marca como não pago
      let paymentAmount = 0;
      if (hasBalance) {
        // Recupera o valor a ser deduzido com base na fila atual
        paymentAmount = getPaymentAmountForQueue(i + 1);

        // Verifica se há saldo suficiente para processar o elemento
        if (balanceToPaidNfts >= paymentAmount) {
          // Deduz do saldo
          balanceToPaidNfts = balanceToPaidNfts - paymentAmount;

          // Adiciona o elemento com true (pago) à nova matriz
          queueDataNew[i].push({
            user: element.user,
            index: element.index,
            batchLevel: element.batchLevel,
            nextPaied: true,
          });
          setTotalNftToPaid(prevValue => prevValue+1);

          // Remove o elemento da fila após o processamento
          if (first) {
            queue[i] = queue[i].slice(1); // Remove o primeiro elemento
          } else {
            queue[i] = queue[i].slice(0, -1); // Remove o último elemento
          }
        } else {
          // Se não há saldo suficiente, ativa o controle para parar de pagar os próximos
          hasBalance = false;
        }
      }

      // Se não há saldo, todos os próximos elementos são marcados como não pagos
      if (!hasBalance) {
        queueDataNew[i].push({
          user: element.user,
          index: element.index,
          batchLevel: element.batchLevel,
          nextPaied: false,
        });

        // Remove o elemento da fila
        if (first) {
          queue[i] = queue[i].slice(1); // Remove o primeiro elemento
        } else {
          queue[i] = queue[i].slice(0, -1); // Remove o último elemento
        }
      }

      // Alterna entre o primeiro e o último elemento
      first = !first;
    }

    // Se todos os elementos de uma fila forem processados, avançamos para a próxima fila
    if (queue[i].length === 0) {
      // Verifica se está na última fila
      if (i === queue.length - 1) {
        // Se estiver na última fila e não houver mais elementos, saia do loop
        break;
      } else {
        // Muda para a próxima fila de forma circular
        i = (i + 1) % queue.length; // Muda para a próxima fila
      }
    }
  }

  // Ordena a matriz antes de definir a nova fila
  queueDataNew.forEach((subArray) => {
    subArray.sort((a, b) => {
      if (a.index < b.index) return -1; // a deve vir antes de b
      if (a.index > b.index) return 1; // b deve vir antes de a
      return 0; // a e b são iguais
    });
  });

  // Define a nova matriz de fila com os resultados processados
  setNewQueue(queueDataNew);
}


async function getPriceToken() {
  const result = await getTokenPrice();
  if(result!=null){
  const cotation = parseFloat(result) / 1000000;
  setPriceToken(cotation);
}
}
  useEffect(() =>{
      getPriceToken();
      getBalanceFree();
  })

  useEffect(() =>{
    if(priceToken!=null){
    veSePaga(queueData);
  }
  },[queueData, priceToken]);

  async function verifyBatchToPaid(){
    for(let i = 0; i < currentBatch; i++){
      if(newQueue[i][0] && totalNftToPaid >= 4){
        doClaimQueue(
          Number(newQueue[i][0].index),
          Number(newQueue[i][0].batchLevel)
        )
        return;
      }
    }
    setAlert("There is not enough balance to pay for 4 NFTs");
  }
  const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
      if(videoRef.current){
        videoRef.current.load();
      }
    }, [])


  return (
    <>
      {error && <Error msg={error} onClose={clearError} />}
      {alert && <Alert msg={alert} onClose={clearAlert} />}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-10 h-10 border-t-4 border-b-4 border-[#d79920] rounded-full animate-spin"></div>
        </div>
      )}

      <div className=" w-full sm:max-w-[90%] max-w-[98%] m-auto sm:p-4">
        <p className="mt-[90px] mb-[40px] leading-tight font-Agency text-[50px] sm:text-[80px] font-normal w-full">
          Bitcoin AiD Protocol - NFT Payment Queue
        </p>
        <div className=" mx-auto lg:w-[35%] w-[90%] bg-[#26251f35] rounded-3xl mb-[10px] flex flex-col py-[30px] shadow-lg glossy">
          <div className="glossy-content flex items-center justify-center flex-col">
          <p className=" mx-auto text-[30px] mb-[8px]">{currentBatch ? `Buy NFT - Batch #${currentBatch}` : 'Loading...'}</p>
          <Image
            src={imageError ? "/images/NFTSATOSHI.png" : "/images/satoshiGif.gif"}
            alt="NFT"
            width={1000}
            height={1000}
            className="mx-auto max-w-[60%] max-h-[55%]"
            onError={() => setImageError(true)}
          ></Image>
          <p>{minted !== undefined? `${minted}/100` : "Loading..."}</p>
          <div className="mt-[15px] w-[100%] flex flex-row items-center justify-center">
          <p className=" text-[20px] font-semibold">{nftCurrentPrice ? `${nftCurrentPrice}$` : "Loading..."} </p>
          <IoTriangle className="ml-[10px] text-green-600 "></IoTriangle><p>{nftCurrentPrice ? (Number(nftCurrentPrice)-10)*10:"..."}%</p>
          </div>
          {allowanceUsdt >= nftCurrentPrice ? (
              <button
                onClick={buyNft}
                className=" hover:bg-[#a47618] mx-auto p-[10px] w-[200px] bg-[#d79920] rounded-full mt-[10px] glossy_cta"
              >
                Buy Nft
            </button>
          ):(
            <>
            <button
                onClick={handleApproveOpen}
                className=" hover:bg-[#299508] mx-auto p-[10px] w-[200px] rounded-full mt-[10px] glossy_claim"
              >
                Approve USDT
            </button>
              <button
                
                className="cursor-not-allowed mx-auto p-[10px] w-[200px] border-[2px] border-white rounded-full mt-[10px] glossy_cta"
              >
                Buy Nft
            </button>
            </>
          )}
          
           
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-6 mb-[30px] mt-[25px]">
          <div className="mx-auto lg:w-[40%] w-full bg-[#26251f35] h-[200px] mt-[20px] flex flex-col justify-between items-center p-4  border-2 border-[#d79920]">
            <p className=" text-center text-[24px] mt-[20px]">
              Add your NFT's to Queue
            </p>
            <div className="w-full flex justify-center">
              <button
                onClick={isApprovedForAll}
                className="bg-[#d79920] w-[200px] p-[10px] rounded-full mb-[20px] glossy_cta hover:bg-[#a47618]"
              >
                <p className="text-[20px] font-semibold">Add NFT +</p>
              </button>
            </div>
          </div>
        </div>
        
        <div className=" mx-auto max-w-[100%] overflow-y-auto slider-container p-2 mt-[50px]">
          <div className="w-[100%] flex lg:flex-row flex-col items-center mb-[30px] justify-end">

          <div className="flex lg:w-[50%] w-[100%] p-6 border-l-2 border-gray-600 flex-col">
            <p className="text-[40px] font-semibold">{((balance/10**18)*priceToken).toFixed(2)}$ </p>
            <p className="text-[16px] text-[#d79920] font-semibold">Balance to Paid Nft</p>
          </div>  

            <div className="lg:w-[40%] w-[100%] flex flex-row items-center lg:justify-center ">
              <div className="w-[10px] h-[10px] bg-yellow-500 ml-[15px]"></div>
              <p className="ml-[5px]">All Nfts</p>
              <div className=" bg-[#008510] w-[10px] h-[10px]  ml-[15px]"></div>
              <p className="ml-[5px]">Next paid nfts</p>
              <div className="bg-blue-600 w-[10px] h-[10px] ml-[15px]"></div>
              <p className="ml-[5px]">Your Nft's</p>
            </div>
          </div>
          
        </div>
          {newQueue.map((dataSet, index) => {
            const hasUserData = dataSet.some((item) => item.user);
            return hasUserData ? (

              
            <div key={index} className="mb-2 h-full">
              
              <h2 className="text-xl font-semibold mb-[5px]">
                Queue {index + 1}
              </h2>
             
             <div className="w-full flex flex-row justify-between items-end">
                <button onClick={() => goToFirstSlide(index)} className="mt-4 p-2 ml-[35px] glossy text-white rounded">
                  <FaAngleDoubleLeft></FaAngleDoubleLeft>
                </button>

                {totalNftToPaid >= 4 ?(
                  <button className="p-2 glossy_claim rounded-xl hover:bg-green-700"  
                  onClick={() =>
                  verifyBatchToPaid()
                  }>
                  Distribute Balance
                  </button>
                ):(
                  <button className="p-2 border-2 md:text-[16px] text-[12px]  border-white rounded-xl cursor-not-allowed">
                  Distribute Balance
                  </button>
                )}

                <button onClick={() => goToLastSlide(index)} className="mt-4 p-2 mr-[35px] glossy  text-white rounded">
                  <FaAngleDoubleRight></FaAngleDoubleRight>
                </button>
              </div>

              
              <div key={index}>
              <Slider 
               ref={(el) => {
                slidersRefs.current[index] = el;
              }}
                {...settings(dataSet.length)}
                className=" w-full sm:max-w-[90%] max-w-[95%] lg:ml-[30px] ml-[10px] h-full mt-[10px] lg:text-[16px] sm:text-[12px] text-[10px] mb-[120px]">
                  
                  
                {dataSet.map((item, itemIndex) => (
                  
                  item.user && item.nextPaied === false && item.user.toLowerCase() === address?.toLowerCase()?(
                  <div key={itemIndex} className="">
                    
                    <div className="mt-[50px] nftUserPiscando p-2 lg:p-4 caixa3d transform transition-transform">
                      <div className="">
                      <p className="font-semibold">{address && item.user.toLowerCase() == address.toLowerCase() ? "Your" : ""}</p>
                        <h3>Position in the queue: {itemIndex + 1}</h3>
                      </div>
                      <p>
                        User:{" "}
                        <span>
                          {" "}
                          {item.user
                            ? `${item.user.slice(0, 6)}...${item.user.slice(
                                -4
                              )}`
                            : ""}
                        </span>
                      </p>
                      <p>
                      Index: {Number(item.index)}
                      </p>
                      <p>
                      Will Receive: {getPaymentAmountForQueue(Number(item.batchLevel))}$
                      </p>
                      
                    </div>
                  </div>
                  ) : item.user && item.nextPaied === true ?(
                    <div key={itemIndex} className="relative">
                      <div className="nftPaidPiscando mt-[50px] p-2 lg:p-4 transform transition-transform caixa3d h-full flex flex-col justify-between">
                        <div className="">
                        <p className="font-semibold">
                              {address &&
                              item.user.toLowerCase() ==
                                address.toLowerCase()
                                ? "Your"
                                : ""}
                            </p>
                            <h3>Position in the queue: {itemIndex + 1}</h3>
                        </div>
                        <p>
                            User:{" "}
                            <span>
                              {" "}
                              {item.user
                                ? `${item.user.slice(0, 6)}...${item.user.slice(
                                    -4
                                  )}`
                                : "N/A"}
                            </span>
                          </p>
                          <p>Index: {Number(item.index)}</p>
                          <p className="font-semibold">
                             Will Receive: {Number(getPaymentAmountForQueue(
                                  Number(item.batchLevel)
                                ))}$
                          </p>

                           {totalNftToPaid >=4 ? (
                            <button
                              onClick={() =>
                                doClaimQueue(
                                  Number(item.index),
                                  Number(item.batchLevel)
                                )
                              }
                              className="flex items-center justify-center left-1/2 transform -translate-x-1/2 sm:py-[2px] py-[6px] w-[80%] bottom-0 border-[1px] text-[8px] md:text-[12px] border-white rounded-lg mt-[10px] glossy_claim"
                            >
                              CLAIM
                            </button>
                          ) : (
                            ""
                          )}
                      </div>
                    </div>
                  ) : item.user && item.nextPaied === false && item.user.toLowerCase() != address?.toLowerCase()?(
                    <div key={itemIndex} className="">
                    <div className="mt-[50px] nftPiscando p-2 lg:p-4 caixa3d transform transition-transform">
                      <div className="">
                      <p className="font-semibold">{address && item.user == address ? "Your" : ""}</p>
                        <h3>Position in the queue: {itemIndex + 1}</h3>
                      </div>
                      <p>
                        User:{" "}
                        <span>
                          {" "}
                          {item.user
                            ? `${item.user.slice(0, 6)}...${item.user.slice(
                                -4
                              )}`
                            : ""}
                        </span>
                      </p>
                      <p>
                      Index: {Number(item.index)}
                      </p>
                      <p>
                      Will Receive: {getPaymentAmountForQueue(Number(item.batchLevel))}$
                      </p>
                    </div>
                  </div>
                  
                  ):(
                    ""
                  )
                ))}
       
              </Slider>
              </div>
            </div> 
            ) : null
        })}
        </div>
        

      {addNftOpen ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-80"
            onClick={handleApproveQueueOpen}
          ></div>
          <div className="relative bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <button
              className="absolute top-4 right-4 text-red-600"
              onClick={handleApproveQueueOpen}
            >
              <p className="font-bold">X</p>
            </button>
            <p className="text-center text-white text-[30px] font-Agency">
              ADD NFT QUEUE
            </p>
            <div className="w-full flex flex-col items-center mb-[15px] mt-[20px]">
              <button
                onClick={getLastBatch}
                className="w-[150px] font-semibold rounded-3xl bg-[#eda921] p-[8px]"
              >
                Go Queue
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {approveToMintOpen ? (
        <div
          onClick={handleApproveMintOpen}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="fixed inset-0 bg-black opacity-80"></div>
          <div className="relative items-center justify-center flex bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <div className="w-[100%] flex items-center justify-center flex-col">
              <TbLockAccess className="border-2 text-[80px] rounded-full p-[20px] border-white" />
              <p className="font-Agency text-[35px] mt-[10px]">Unlock USDT</p>
              <p className="text-center text-[18px] mt-[6px]">
                We need your permission to move
               USDT on
                your behalf
              </p>
              {address ? (
                <button
                  onClick={doApproveMint}
                  className=" font-semibold rounded-3xl bg-[#eda921] px-[30px] py-[12px] my-[20px]"
                >
                  Approve USDT
                </button>
              ) : (
                <p className="text-red-600">You need to connect your wallet!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {approveQueue ? (
        <div
          onClick={handleApproveQueueOpen}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="fixed inset-0 bg-black opacity-80"></div>
          <div className="relative items-center justify-center flex bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <div className="w-[100%] flex items-center justify-center flex-col">
              <TbLockAccess className="border-2 text-[80px] rounded-full p-[20px] border-white" />
              <p className="font-Agency text-[35px] mt-[10px]">Unlock NFT's</p>
              <p className="text-center text-[18px] mt-[6px]">
                We need your permission to add your NFTs to the queue on your
                behalf!
              </p>
              <p className="text-center text-[14px] mt-[6px]">
                You only need to do this once
              </p>
              {address ? (
                <button
                  onClick={doApproveNft}
                  className=" font-semibold rounded-3xl bg-[#eda921] px-[30px] py-[12px] my-[20px]"
                >
                  Approve NFT's
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default SimpleSlider;

/*<p>Prox: {item.next ? item.next.toString() : 'N/A'}</p>
              <p>Anterior: {item.prev ? item.prev.toString() : 'N/A'}</p>
              <p>Index: {item.index ? item.index.toString() : 'N/A'}</p>
              <p>Batch Level: {item.batchLevel ? item.batchLevel.toString() : 'N/A'}</p>
              <p>Dollars Claimed: {item.dollarsClaimed ? item.dollarsClaimed.toString() : 'N/A'}</p>*/
