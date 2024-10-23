"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti"; // Importa a biblioteca de confete

export default function Tournament() {
    const [confettiStarted, setConfettiStarted] = useState(false); // Estado para verificar se o confete já começou

    useEffect(() => {
        if (!confettiStarted) {
            setConfettiStarted(true); // Marca que os confetes foram iniciados

            // Inicia os confetes
            const startConfetti = () => {
                confetti({
                    spread: 70,
                    startVelocity: 30,
                    particleCount: 100,
                    decay: 0.9,
                    scalar: 1.2,
                });
            };

            startConfetti(); // Dispara os confetes

            // Parar os confetes após 3 segundos
            const stopConfettiTimeout = setTimeout(() => {
                // Limpa o canvas (não há função stop específica)
            }, 3000);

            return () => {
                clearTimeout(stopConfettiTimeout); // Limpa o timeout ao desmontar
            };
        }
    }, [confettiStarted]); // Executa apenas quando confettiStarted muda

    return (
        <div className="w-full h-[500px] flex justify-center text-center mt-[120px]">
            <div className="flex flex-col items-center">
                <Image 
                    alt="trophy" 
                    src={'/images/TrophyComing.png'} 
                    width={500} 
                    height={100} 
                    className="md:max-w-[200px] max-w-[120px] md:max-h-[180px] max-h-[100px]"
                />
                <p className="text-[30px]">Coming Soon!</p>
                <p className="text-[20px]">The biggest tournament BTCA</p>
            </div>
        </div>
    );
}
