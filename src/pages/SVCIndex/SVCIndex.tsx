import { Camera, CheckCircle, Loader2, ScanLine, X } from "lucide-react";
import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

export const SVCIndex = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [partNumber, setPartNumber] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(URL.createObjectURL(file));
            setPartNumber(null);
            setOcrProgress(0);

            processImage(file);
        }
    };

    const processImage = async (file: File) => {
        setIsProcessing(true);
        try {
            const { data: { text } } = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setOcrProgress(Math.floor(m.progress * 100));
                        }
                    }
                }
            );

            const match = text.match(/\b([A-Z0-9]{5,15})\b/);

            if (match) {
                setPartNumber(match[0]);
            } else {
                setPartNumber("No detectado - Intentar de nuevo");
            }

        } catch (error) {
            console.error(error);
            setPartNumber("Error en lectura");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setPartNumber(null);
        setOcrProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-white text-xl font-bold flex items-center justify-center gap-2">
                        <ScanLine className="w-6 h-6" />
                        Verificador de material
                    </h1>
                    <p className="text-blue-100 text-sm mt-1">
                        Escanea de la hoja de producción
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {
                        !selectedImage ? (
                            <label
                                htmlFor="camera-input"
                                className="border-2 border-dashed border-blue-200 rounded-xl p-8 flex flex-col 
                                items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors 
                                group h-64 relative"
                            >
                                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Camera className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-gray-600 font-medium text-center">
                                    Toca para abrir cámara <br /> o galería
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Soporta JPG, PNG
                                </p>
                            </label>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <img
                                    src={selectedImage}
                                    alt="Preview"
                                    className="w-full h-64 object-cover"
                                />
                                {
                                    !isProcessing && (
                                        <button
                                            onClick={handleReset}
                                            className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500
                                            shadow-sm hover:bg-red-50 z-10"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )
                                }

                                {
                                    isProcessing && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center 
                                            justify-center text-white backdrop-blur-sm z-20">
                                            <Loader2 className="w-10 h-10 animate-spin mb-2" />
                                            <p className="font-semibold">Analizando imagen...</p>
                                            <div className="w-3/4 bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="bg-blue-500 h-full transition-all duration-300"
                                                    style={{ width: `${ocrProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs mt-1">{ocrProgress}%</p>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    <input
                        id="camera-input"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                    />

                    {
                        partNumber && !isProcessing && (
                            <div className={`p-4 rounded-xl border ${partNumber.includes("No detectado") ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} animate-in fade-in slide-in-from-bottom-4`}>
                                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                                    Número de Parte Detectado
                                </p>
                                <div className="flex items-center gap-3">
                                    {partNumber.includes("No detectado") ? (
                                        <ScanLine className="text-orange-500 w-6 h-6" />
                                    ) : (
                                        <CheckCircle className="text-green-600 w-6 h-6" />
                                    )}
                                    <span className={`text-2xl font-mono font-bold ${partNumber.includes("No detectado") ? 'text-orange-700' : 'text-green-700'}`}>
                                        {partNumber}
                                    </span>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};