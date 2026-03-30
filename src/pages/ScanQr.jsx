// src/pages/ScanQrCodePage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCodeIcon, ArrowLeftIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export default function ScanQr() {
    const navigate = useNavigate();
    const [scanStatus, setScanStatus] = useState('idle');

    const simulateScan = () => {
        setScanStatus('scanning');
        setTimeout(() => {
            setScanStatus('success');
            navigate('/game');
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8">

            {/* Header / Navigation Rapide */}
            <div className="w-full max-w-7xl flex items-center justify-between mb-12">
                <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition group">
                    <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Retour
                </Link>

            </div>

            {/* Contenu Principal Centré */}
            <div className="flex-grow flex flex-col items-center justify-center w-full max-w-xl text-center">

                {/* Icône et Titre */}
                <div className="bg-indigo-100 p-4 rounded-full mb-6 shadow-inner">
                    <QrCodeIcon className="h-12 w-12 text-indigo-600" />
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Rejoins la partie <span className="text-indigo-600">Challenge-48H</span>
                </h1>



                {/* Zone du QR Code (Le "Viseur") */}
                <div className="relative group mb-12">
                    {/* Les coins stylisés du viseur */}
                    <div className="absolute -top-4 -left-4 h-12 w-12 border-l-4 border-top-4 border-indigo-500 rounded-tl-lg"></div>
                    <div className="absolute -top-4 -right-4 h-12 w-12 border-r-4 border-top-4 border-indigo-500 rounded-tr-lg"></div>
                    <div className="absolute -bottom-4 -left-4 h-12 w-12 border-l-4 border-bottom-4 border-indigo-500 rounded-bl-lg"></div>
                    <div className="absolute -bottom-4 -right-4 h-12 w-12 border-r-4 border-bottom-4 border-indigo-500 rounded-br-lg"></div>

                    {/* Le conteneur du QR (remplace par ton composant QR réel) */}
                    <div className="relative bg-white p-6 shadow-2xl rounded-3xl border border-gray-100 transform group-hover:scale-105 transition-transform duration-300 ease-out">
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Challenge48H-G6-Lobby"
                            alt="QR Code de la partie"
                            className="w-64 h-64 md:w-80 md:h-80 opacity-90 group-hover:opacity-100 transition"
                        />

                        {/* Ligne de scan animée */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-lg animate-scan-line opacity-0 group-hover:opacity-100"></div>
                    </div>
                </div>

                {/* Bouton d'Action / Statut */}
                {scanStatus === 'idle' && (
                    <button
                        onClick={simulateScan}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-indigo-200 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <QrCodeIcon className="h-6 w-6" />
                        Simuler le Scan (Dev)
                    </button>
                )}

                {scanStatus === 'scanning' && (
                    <div className="text-indigo-600 font-medium flex items-center gap-3 text-lg animate-pulse">
                        <div className="w-5 h-5 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        Validation du code en cours...
                    </div>
                )}

                {scanStatus === 'success' && (
                    <div className="text-green-600 font-bold text-xl flex items-center gap-2 bg-green-50 px-6 py-3 rounded-full shadow-inner border border-green-200">
                        ✅ Code validé ! Redirection...
                    </div>
                )}

            </div>

            {/* Footer discret */}
            <footer className="w-full text-center py-6 border-t border-gray-100 mt-16 text-gray-400 text-sm">
                Challenge 48H - Groupe G6 • Powered by React & Tailwind
            </footer>

            {/* Styles personnalisés pour l'animation de scan (à ajouter dans ton index.css) */}
            <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
        </div>
    );
}   