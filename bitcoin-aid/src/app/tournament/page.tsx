"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { FaCrown } from "react-icons/fa6";
import Error from "@/componentes/erro";
import Alert from "@/componentes/alert";
import { PiMedalFill } from "react-icons/pi";
import { tournamentDonation,
          tournamentDonationRewards,
          claimDonationRewards,
 } from "@/services/Web3Services";
import { useWallet } from "@/services/walletContext";

export default function Tournament() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");

    const { address, setAddress } = useWallet();
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

    const[donationWithdrawals, setDonationWithdrawals] = useState(0);
    const[claimDonationRewardsOpen, setClaimDonationRewardsOpen] = useState(false);


    async function collectDonationRewards(){
      setLoading(true);
      try{
        if(address){
          await claimDonationRewards();
          setLoading(false);
        }
      }catch(err){
        setLoading(false)
        setError("Unable to collect your reward ${err.message || err}");
      }
      setLoading(false);
    }

    async function handleClaimDonationsOpen(){
      setClaimDonationRewardsOpen(prevValue => !prevValue);
    }

    async function rewardsDonation(){
      try{
      const {token24, token30} = await tournamentDonation();
      setDonationRewards24(Number(token24)/1000000)
      setDonationRewards30(Number(token30)/1000000)
      }catch(err){
        console.log("Erro")
      }
    }

    async function withdrawalsDonation(){
      try{
        if(address){
        const {amount, expired} = await tournamentDonationRewards(address);
        setDonationWithdrawals(Number(amount)/1000000);
        if(amount > 0){
          setClaimDonationRewardsOpen(true);
        }
      }
      }catch(err){
        console.log("Erro")
      }
    }

    useEffect(() =>{
      rewardsDonation();
      withdrawalsDonation();
    })


    async function clearError(){
      setError('');
    }
    async function clearAlert(){
      setAlert('');
    }

    useEffect(() => { 
      const formatDate = (date: Date) => {
        const year = date.getUTCFullYear();
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Mês começa em 0
        return `${year}-${month}-${day}`;
      };
    
      // Definindo a data de hoje no formato correto
      const today = new Date();
      const formattedDate = formatDate(today);
      setTodayDate(formattedDate);
    
      // Função para buscar os dados da API
      const fetchDataDonation = async (max = 3, delay = 1000) => {
        let attempt = 1;
        while (attempt <= max) {
          try {
            const dataDay = formattedDate; // Use formattedDate
            const urlDay = `/api/proxy?data=${dataDay}&type=day`;
    
            const currentMonthUTC = String(new Date().getUTCMonth() + 1).padStart(2, '0');
            const dataMonthly = '2024-'+currentMonthUTC+'-01'; // Considera que a data é fixa aqui
            const urlMonthly = `/api/proxy?data=${dataMonthly}&type=monthly`;
            console.log(urlMonthly);
    
            // Faz a requisição e aguarda a resposta
            const resDay = await fetch(urlDay);
            const resMonthly = await fetch(urlMonthly);
    
            // Verifica se a resposta é bem-sucedida
            if (!resDay.ok) {
              console.log("HTTP error! status: ${resDay.status}");
            }
            if (!resMonthly.ok) {
              console.log("HTTP error! status: ${resMonthly.status}");
            }
    
            // Processa o resultado JSON
            const resultDay = await resDay.json();
            const resultMonthly = await resMonthly.json();
            setDataDonationDaily(resultDay);
            setDataDonationMonthly(resultMonthly); // Atualiza o estado com os dados recebidos
            break; // Se a requisição for bem-sucedida, sai do loop
          } catch (error) {
            console.error('Erro ao buscar dados:', error);
            if (attempt === max) {
              // Se for a última tentativa, você pode adicionar alguma lógica aqui, como um alerta ao usuário.
            }
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      };
    
      // Chama a função para buscar os dados uma vez ao carregar o componente
      fetchDataDonation();
    }, []); // Adicione dependências aqui, se necessário
    


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
        {error && <Error msg={error} onClose={clearError} />}
        {alert && <Alert msg={alert} onClose={clearAlert} />}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-10 h-10 border-t-4 border-b-4 border-[#d79920] rounded-full animate-spin"></div>
          </div>
          )}
        <div className="container min-h-screen sm:max-w-[98%] max-w-[100%] lg:max-w-[98%] m-auto flex flex-wrap items-center p-[20px] lg:p-[60px]">
        {donationWithdrawals?(
          
          <div className="animate-bounce mt-[60px] sm:mt-[30px] w-[50%] h-[200x] border-2 border-green-600 m-auto text-center justify-center p-4">
            <Image
              src="/images/Trophy.png"
              alt="NFT"
              layout="responsive"
              width={150}
              height={150}
              className="mx-auto max-w-[40%] max-h-[30%]"
              />
            <p className="sm:text-[20px] text-[14px]">Congratulations</p>
            <p className="sm:text-[20px] text-[14px]">You have {String(donationWithdrawals)}$ to claim</p>
            <button
              onClick={collectDonationRewards}
              className="flex m-auto items-center justify-center glossy_claim hover:bg-[#346301] mx-auto sm:p-[10px] p-[4px] w-[60%] rounded-full mt-[10px] glossy_cta"
            >
              <p className="sm:text-[20px] text-[12px]">Claim Now</p>
            </button>
          </div>
        ):(
          ""
        )}
        <div className="w-[100%]">
            <p className="text-center mt-[30px] text-[26px]">24h Tournaments</p>
            <div className="md:w-[80%] w-[100%] m-auto items-center justify-center flex md:flex-row flex-col">


                <div className="mt-[20px] sm:mr-[15px] podio md:w-[60%] lg:w-[40%] w-[100%] md:text-[18px] text-[14px] glossy sm:p-2 rounded-lg shadow-2xl border-2 border-green-500">
                    <div className="w-[100%] flex flex-row text-[16px]">
                        <p className="md:text-[20px] sm:text-[16px] text-[14px] p-[6px]">Donation Daily Tournament</p>
                    </div>
                    <div className="w-[100%] sm:p-2">
                        <div className="flex flex-col items-center mt-[2px]">
                          {dataDonationDaily.length === 0?(
                            <p className="text-red-500">No Data</p>
                          ):(
                            null
                          )}
                            {dataDonationDaily.map((item:any, index) => (
                                <>
                                {item.score > 0 && item.rank <= 10?(
                                  <div className="w-[100%] flex flex-row p-2">
                                  {(item.user_address).toLowerCase() == address?(
                                    <p className="md:text-[20px] sm:text-[16px] text-[12px] text-blue-600" key={index}>{item.rank}° {item.user_address.slice(0,4)}...{item.user_address.slice(-6)}</p>
                                  ):(
                                    <p className="md:text-[20px] sm:text-[16px] text-[12px]" key={index}>{item.rank}° {item.user_address.slice(0,4)}...{item.user_address.slice(-6)}</p>
                                  )}
                                  {item.rank == 1?(
                                    <PiMedalFill className="sm:mx-2 text-yellow-400 sm:text-[16px] text-[12px]" />
                                  ):item.rank == 2?(
                                    <PiMedalFill className="sm:mx-2 text-gray-400 sm:text-[16px] text-[12px]" />
                                  ):item.rank == 3?(
                                    <PiMedalFill className="sm:mx-2 text-[#804a00] sm:text-[16px] text-[12px]" />
                                  ):(
                                    ""
                                  )}
                                  <p className="ml-auto md:text-[20px] sm:text-[16px] text-[12px]">{item.score} $</p>
                                  </div>
                                ):(
                                  ""
                                )}
                                
                                </>
                           ))}
                        </div>
                        <p  className="sm:text-[18px] text-[14px] p-[4px] r-0">Finish in {formatTime(timeDayRemaining)}</p>
                        <p className="sm:text-[18px] text-[14px] p-[4px] r-0 text-green-700">Actually Rewards: {donationRewards24 ? `${donationRewards24} $` : "Loading..."}</p>
                    </div>
                </div>
            </div>
        </div>


        <div className="w-[100%]">
        <p className="text-center mt-[30px] text-[26px]">30-Days Tournaments</p>
        <div className="w-[100%] m-auto flex flex-col">

            <div className="mt-[20px] mb-[50px] m-auto podio lg:w-[80%] w-[100%] lg:text-[20px] text-[16px] glossy sm:p-2 rounded-lg shadow-2xl border-2 border-green-500">
                <div className="w-[100%] flex flex-row text-[16px]">
                    <p className="text-[20px] p-[6px]">Donation Monthly Tournament</p>
                </div>
                <div className="w-[100%] sm:p-2">
                    <div className="flex flex-col items-center mt-[2px] ">
                    {dataDonationMonthly.length === 0?(
                            <p className="text-red-500">No Data</p>
                          ):(
                            null
                          )}
                    {dataDonationMonthly.map((item:any, index:number) => (
                                <>
                                {item.score > 0 && item.rank <= 10?(
                                  <div className="w-[100%] flex flex-row p-2">
                                  <p className="md:text-[20px] sm:text-[16px] text-[12px]" key={index}>{item.rank}° {item.user_address.slice(0,4)}...{item.user_address.slice(-6)}</p>
                                  {item.rank == 1?(
                                    <PiMedalFill className="sm:mx-2 text-yellow-400 sm:text-[16px] text-[12px]" />
                                  ):item.rank == 2?(
                                    <PiMedalFill className="sm:mx-2 text-gray-400 sm:text-[16px] text-[12px]" />
                                  ):item.rank == 3?(
                                    <PiMedalFill className="sm:mx-2 text-[#804a00] sm:text-[16px] text-[12px]" />
                                  ):(
                                    ""
                                  )}
                                  <p className="ml-auto md:text-[20px] sm:text-[16px] text-[12px]">{item.score} $</p>
                                  </div>
                                ):(
                                  ""
                                )}
                                
                                </>
                           ))}
                    </div>
                    <p  className="sm:text-[18px] text-[14px] p-[6px] r-0">Finish in {formatTimeMonthly(timeMonthlyRemaining)}</p>
                    <p className="sm:text-[18px] text-[14px] p-[4px] r-0 text-green-700">Actually Rewards: {donationRewards30 ? `${donationRewards30} $` : "Loading..."}</p>
                </div>
            </div>

            </div>
        </div>
        </div>

        {claimDonationRewardsOpen?(
          <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-90"
            onClick={handleClaimDonationsOpen}
          ></div>
          <div className="relative bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[90%] max-w-lg z-10 glossy">
            <button
              className="absolute top-4 right-4 text-red-600"
              onClick={handleClaimDonationsOpen}
            >
              <p className="font-bold">X</p>
            </button>
            <div className="w-[100%] items-center justify-center text-center">
              <p className="font-semibold text-[26px] items-center justify-center text-green-500">Be happy!</p>
              <p className="text-[22px] text-center"> The community thanks you for your collaboration </p>
              <Image
              src="/images/Trophy.png"
              alt="NFT"
              layout="responsive"
              width={300}
              height={300}
              className="mx-auto max-w-[60%] max-h-[55%]"
              />
      
              <p className="mt-[20px] text-[22px] font-semibold">You Won {String(donationWithdrawals)} $ in the Donation Tournament</p>
            </div>
            <button
                onClick={collectDonationRewards}
                className="flex m-auto items-center justify-center glossy_claim hover:bg-[#346301] mx-auto p-[10px] w-[200px] rounded-full mt-[10px] glossy_cta"
              >
                Claim Now
              </button>
            </div>
            </div>
        ):(
          ""
        )}
    </>
    );
}
