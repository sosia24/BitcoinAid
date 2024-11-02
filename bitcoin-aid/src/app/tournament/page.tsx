"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { FaCrown } from "react-icons/fa6";
import { PiMedalFill } from "react-icons/pi";
import { tournamentDonation } from "@/services/Web3Services";
export default function Tournament() {

  
    const [todayDate, setTodayDate] = useState('');
    const [dataDonationDaily, setDataDonationDaily] = useState([]);
    const [dataDonationMonthly, setDataDonationMonthly] = useState([]);
    const [dataTokenDaily, setDataTokenDaily] = useState([]);
    const [dataTokenMonthly, setDataTokenMonthly] = useState([]);
    const [dataNftDaily, setDataNftDaily] = useState([]);
    const [dataNftMonthly, setDataNftMonthly] = useState([]);

    const [searchDate, setSearchDate] = useState('');
    const [searchHistorical, setSearchHistorical] = useState([]);
    const [HistoricalOpen, setHistoricalOpen] = useState(false);

    const [timeDayRemaining, setTimeDayRemaining] = useState(0);
    const [timeMonthlyRemaining, setTimeMonthlyRemaining] = useState(0);

    const [donationRewards24, setDonationRewards24] = useState(0);
    const [donationRewards30, setDonationRewards30] = useState(0);


    async function rewardsDonation(){
      try{
      const {token24, token30} = await tournamentDonation();
      setDonationRewards24(Number(token24)/1000000)
      setDonationRewards30(Number(token30)/1000000)
      console.log(token24)
      console.log(token30)
      }catch(err){
        console.log("Erro")
      }
    }

    useEffect(() =>{
      rewardsDonation();
    })


    // Função para formatar a data de hoje no formato YYYY-MM-DD
    useEffect(() => { 
        // Função para formatar a data  de hoje no formato YYYY-MM-DD
        const formatDate = (date: Date) => {
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Mês começa em 0
          const day = String(date.getUTCDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
    
        // Definindo a data de hoje no formato correto e obtendo dados da API
        const today = new Date();
        setTodayDate(formatDate(today));
        
        // Função para buscar os dados da API
       /* const fetchDataToken = async (max = 3, delay = 1000) => {
          let attemp = 1;
          while(attemp < max){
          try {
            const dataDay = todayDate;
            const urlDay = `http://67.217.228.116:3000/api/leaderboard_token?data=${dataDay}`;
        
            const dataMonthly = '2024-10-01';
            const urlMonthly = `http://67.217.228.116:3000/api/leaderboard_token_monthly?data=${dataMonthly}`;
        
            // Faz a requisição e aguarda a resposta
            const resDay = await fetch(urlDay);
            const resMonthly = await fetch(urlMonthly);
        
            // Verifica se a resposta é bem-sucedida
            if (!resDay.ok) {
              throw new Error(`HTTP error! status: ${resDay.status}`);
            }
            if (!resMonthly.ok) {
              throw new Error(`HTTP error! status: ${resMonthly.status}`);
            }
        
            // Processa o resultado JSON
            const resultDay = await resDay.json();
            const resultMonthly = await resMonthly.json();
            setDataTokenDaily(resultDay);
            setDataTokenMonthly(resultMonthly); // Atualiza o estado com os dados recebidos
          } catch (error) {
            console.error('Erro ao buscar dados:', error);
          }
          attemp++;

          await new Promise(resolve => setTimeout(resolve, delay));
        }
        };*/


        const fetchDataDonation = async (max = 3, delay = 1000) => {
          let attemp = 1;
          while(attemp < max){
          try {
            const dataDay = todayDate;
            const urlDay = `http://67.217.228.116:3000/api/leaderboard_donation?data=${dataDay}`;
        
            const currentMonthUTC = String(new Date().getUTCMonth() + 1).padStart(2, '0');
            const dataMonthly = '2024-'+currentMonthUTC+'-01';
            const urlMonthly = `http://67.217.228.116:3000/api/leaderboard_donation_monthly?data=${dataMonthly}`;
        
            // Faz a requisição e aguarda a resposta
            const resDay = await fetch(urlDay);
            const resMonthly = await fetch(urlMonthly);
        
            // Verifica se a resposta é bem-sucedida
            if (!resDay.ok) {
              throw new Error(`HTTP error! status: ${resDay.status}`);
            }
            if (!resMonthly.ok) {
              throw new Error(`HTTP error! status: ${resMonthly.status}`);
            }
        
            // Processa o resultado JSON
            const resultDay = await resDay.json();
            const resultMonthly = await resMonthly.json();
            setDataDonationDaily(resultDay);
            setDataDonationMonthly(resultMonthly); // Atualiza o estado com os dados recebidos
          } catch (error) {
            console.error('Erro ao buscar dados:', error);
          }
          attemp++;

          await new Promise(resolve => setTimeout(resolve, delay));
        }
        };
        
        // Chama a função para buscar os dados uma vez ao carregar o componente
      //fetchDataToken();
      fetchDataDonation();

  });


    useEffect(() => {
        // Função que calcula o tempo restante até o final do dia
        const calculateTimeRemaining = () => {
          const now = new Date(Date.now());
          const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          return endOfDay.getTime() - now.getTime();
        };
    
        // Atualizar o estado imediatamente
        setTimeDayRemaining(calculateTimeRemaining());
    
        // Atualizar o estado a cada milissegundo
        const interval = setInterval(() => {
          const remaining = calculateTimeRemaining();
          if (remaining <= 0) {
            clearInterval(interval); // Parar o countdown ao atingir zero
            setTimeDayRemaining(0);
          } else {
            setTimeDayRemaining(remaining);
          }
        }, 1);
    
        // Limpar o intervalo quando o componente for desmontado
        return () => clearInterval(interval);
      }, []);
    

      const formatTime = (time: number) => {
        const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((time / (1000 * 60)) % 60);
        const seconds = Math.floor((time / 1000) % 60);
    
        // Formatar para garantir duas casas em horas, minutos e segundos
        const format = (num: number, digits: number = 2) => String(num).padStart(digits, '0');
    
        return `${format(hours)}H:${format(minutes)}M:${format(seconds)}S`;
      };


      useEffect(() => {
        // Função que calcula o tempo restante até o final do mês
        const calculateTimeRemaining = () => {
          const now = new Date();
          const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
          return endOfMonth.getTime() - now.getTime();
        };
    
        setTimeMonthlyRemaining(calculateTimeRemaining());
    
        // Atualizar o estado a cada segundo
        const interval = setInterval(() => {
          const remaining = calculateTimeRemaining();
          if (remaining <= 0) {
            clearInterval(interval); // Parar o countdown ao atingir zero
            setTimeMonthlyRemaining(0);
          } else {
            setTimeMonthlyRemaining(remaining);
          }
        }, 1000); // Atualização a cada segundo
    
        // Limpar o intervalo quando o componente for desmontado
        return () => clearInterval(interval);
      }, []);
    
      // Converter o tempo restante em dias, horas, minutos e segundos
      const formatTimeMonthly = (time: number) => {
        const days = Math.floor(time / (1000 * 60 * 60 * 24));
        const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((time / (1000 * 60)) % 60);
        const seconds = Math.floor((time / 1000) % 60);
    
        // Formatar para garantir duas casas em horas, minutos e segundos
        const format = (num: number, digits: number = 2) => String(num).padStart(digits, '0');
    
        return `${days}D ${format(hours)}H ${format(minutes)}M ${format(seconds)}S`;
      };

    return (
        <>
        <div className="container min-h-screen max-w-[98%] lg:max-w-[98%] m-auto flex flex-wrap items-center p-[20px] lg:p-[60px]">
        <div className="w-[100%]">
            <p className="text-center mt-[30px] text-[26px]">24h Tournaments</p>
            <div className="md:w-[80%] w-[100%] m-auto items-center justify-center flex md:flex-row flex-col">


                <div className="mt-[20px] mr-[15px] podio md:w-[40%] w-[70%] md:text-[18px] text-[14px] glossy p-2 rounded-lg shadow-2xl border-2 border-green-500">
                    <div className="w-[100%] flex flex-row text-[16px]">
                        <p className="md:text-[20px] text-[16px] p-[6px]">Donation Daily Tournament</p>
                    </div>
                    <div className="w-[100%] p-2">
                        <div className="flex flex-col items-center mt-[2px]">
                          {dataDonationDaily.length === 0?(
                            <p className="text-red-500">No Data</p>
                          ):(
                            null
                          )}
                            {dataDonationDaily.map((item:any, index:number) => (
                                <>
                                {item.score > 0 && item.rank <= 10?(
                                  <div className="w-[100%] flex flex-row p-2">
                                  <p className="" key={index}>{item.rank}° {item.user_address.slice(0,4)}...{item.user_address.slice(-6)}</p>
                                  {item.rank == 1?(
                                    <PiMedalFill className="mx-2 text-yellow-400" />
                                  ):item.rank == 2?(
                                    <PiMedalFill className="mx-2 text-gray-400" />
                                  ):item.rank == 3?(
                                    <PiMedalFill className="mx-2 text-[#804a00]" />
                                  ):(
                                    ""
                                  )}
                                  <p className="ml-auto">{item.score} $</p>
                                  </div>
                                ):(
                                  ""
                                )}
                                
                                </>
                           ))}
                        </div>
                        <p  className="text-[18px] p-[4px] r-0">Finish in {formatTime(timeDayRemaining)}</p>
                        <p className="text-[18px] p-[4px] r-0 text-green-700">Actually Rewards: {donationRewards30 ? `${donationRewards30} $` : "Loading..."}</p>
                    </div>
                </div>
            </div>
        </div>


        <div className="w-[100%]">
        <p className="text-center mt-[30px] text-[26px]">30-Days Tournaments</p>
        <div className="w-[80%] m-auto flex flex-col">

            <div className="mt-[20px] m-auto podio lg:w-[80%] w-[100%] lg:text-[20px] text-[16px] glossy p-2 rounded-lg shadow-2xl border-2 border-green-500">
                <div className="w-[100%] flex flex-row text-[16px]">
                    <p className="text-[20px] p-[6px]">Donation Monthly Tournament</p>
                </div>
                <div className="w-[100%] p-2">
                    <div className="flex flex-col items-center mt-[2px]">
                    {dataDonationMonthly.length === 0?(
                            <p className="text-red-500">No Data</p>
                          ):(
                            null
                          )}
                    {dataDonationMonthly.map((item:any, index:number) => (
                                <>
                                {item.score > 0 && item.rank <= 10?(
                                  <div className="w-[100%] flex flex-row p-2">
                                  <p className="" key={index}>{item.rank}° {item.user_address.slice(0,4)}...{item.user_address.slice(-6)}</p>
                                  {item.rank == 1?(
                                    <PiMedalFill className="mx-2 text-yellow-400" />
                                  ):item.rank == 2?(
                                    <PiMedalFill className="mx-2 text-gray-400" />
                                  ):item.rank == 3?(
                                    <PiMedalFill className="mx-2 text-[#804a00]" />
                                  ):(
                                    ""
                                  )}
                                  <p className="ml-auto">{item.score} $</p>
                                  </div>
                                ):(
                                  ""
                                )}
                                
                                </>
                           ))}
                    </div>
                    <p  className="text-[18px] p-[6px] r-0">Finish in {formatTimeMonthly(timeMonthlyRemaining)}</p>
                    <p className="text-[18px] p-[4px] r-0 text-green-700">Actually Rewards: {donationRewards30 ? `${donationRewards30} $` : "Loading..."}</p>
                </div>
            </div>

            </div>
        </div>
        </div>
    </>
    );
}
