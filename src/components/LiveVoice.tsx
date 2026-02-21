import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, X, Loader2, Volume2 } from "lucide-react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function LiveVoice({ onClose }: { onClose: () => void }) {
  const [connected, setConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  
  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setConnected(false);
    setIsRecording(false);
  };

  const startSession = async () => {
    try {
      setConnected(false);
      
      // Initialize Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      const ws = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: { parts: [{ text: "You are Aletheo's voice assistant. Be helpful and concise." }] },
        },
        callbacks: {
          onopen: () => {
            console.log("Connected to Live API");
            setConnected(true);
            startRecording();
          },
          onmessage: (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              playAudio(audioData);
            }
          },
          onclose: () => {
            console.log("Disconnected");
            setConnected(false);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
          }
        }
      });
      
      sessionRef.current = ws;

    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const startRecording = async () => {
    if (!audioContextRef.current || !sessionRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for UI visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        setVolume(Math.sqrt(sum / inputData.length));

        // Convert Float32 to base64 PCM16
        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        
        sessionRef.current.sendRealtimeInput({
          media: {
            mimeType: "audio/pcm;rate=16000",
            data: base64
          }
        });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      processorRef.current = processor;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  };

  const playAudio = (base64Data: string) => {
    // Simple decoding and playback
    // In a real app, use a proper audio queue to avoid gaps
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert PCM16 to Float32
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    // Play
    if (audioContextRef.current) {
      const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000); // Model output is usually 24kHz
      buffer.getChannelData(0).set(float32);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    }
  };

  // Helper to convert Float32 audio to Int16 PCM
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4 relative">
            {connected && (
              <div 
                className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
                style={{ animationDuration: `${Math.max(0.5, 2 - volume * 10)}s` }}
              />
            )}
            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center z-10">
              <Mic size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Live Voice Mode</h2>
          <p className="text-slate-500 mt-2">
            {connected ? "Listening..." : "Connecting to Gemini..."}
          </p>
        </div>

        {!connected && (
          <button
            onClick={startSession}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Loader2 className="animate-spin" /> Connecting...
          </button>
        )}

        {connected && (
          <div className="space-y-4">
            <div className="h-12 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1.5 bg-blue-600 rounded-full transition-all duration-100"
                  style={{ 
                    height: `${Math.max(8, volume * 100 * (Math.random() + 0.5))}px`,
                    opacity: 0.5 + volume * 2
                  }}
                />
              ))}
            </div>
            <button
              onClick={disconnect}
              className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <MicOff size={20} /> End Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
