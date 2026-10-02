import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  PhoneOff,
  Shield,
  Activity,
  Heart,
  AlertTriangle,
  Send,
  User,
  CheckCircle2,
  X
} from 'lucide-react';
import { EmergencyCase } from '../types/emergency';

interface DoctorConsultModalProps {
  isOpen: boolean;
  emergencyCase: EmergencyCase;
  initialMode?: 'video' | 'audio';
  onClose: () => void;
}

export const DoctorConsultModal: React.FC<DoctorConsultModalProps> = ({
  isOpen,
  emergencyCase,
  initialMode = 'video',
  onClose
}) => {
  const [consultMode, setConsultMode] = useState<'video' | 'audio'>(initialMode);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [pulse, setPulse] = useState(emergencyCase.doctor.vitals?.heartRate || 96);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: emergencyCase.doctor.name,
      text: `Hello ${emergencyCase.requesterName}, I am ${emergencyCase.doctor.name} reviewing ${emergencyCase.patientName}'s telemetry. Paramedic crew is approximately ${emergencyCase.ambulance.etaMinutes} minutes away.`,
      time: 'Live'
    },
    {
      sender: emergencyCase.doctor.name,
      text: emergencyCase.doctor.instructions[0] || 'Keep the patient still and calm.',
      time: 'Live'
    }
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setConsultMode(initialMode);
      setCallDurationSec(0);
    }
  }, [isOpen, initialMode]);

  // Call duration counter
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCallDurationSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Subtle vital fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: emergencyCase.requesterName, text: newMsg.trim(), time: 'Just now' }
    ]);
    const replyText = `Noted. Transmitting directly to Paramedic Unit ${emergencyCase.ambulance.unitId} in transit.`;
    setNewMsg('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: emergencyCase.doctor.name, text: replyText, time: 'Just now' }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0C0F17] border-2 border-red-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 bg-[#121622] border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {consultMode === 'video' ? 'EMERGENCY TELEMEDICINE VIDEO CHAT' : 'CELLULAR AUDIO CALL TO EMERGENCY PHYSICIAN'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold">
                  CASE #{emergencyCase.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Patient: <strong className="text-slate-200">{emergencyCase.patientName}</strong> ({emergencyCase.relationship}) · Doctor: {emergencyCase.doctor.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-[#090C12] p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setConsultMode('audio')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  consultMode === 'audio'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Phone Call</span>
              </button>
              <button
                type="button"
                onClick={() => setConsultMode('video')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  consultMode === 'video'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Chat</span>
              </button>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-black/60 font-mono text-emerald-400 text-xs font-bold border border-slate-800">
              {formatCallTime(callDurationSec)}
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen & Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
          {/* Main Simulated Video / Audio Feed */}
          <div className="lg:col-span-2 bg-[#06080D] relative flex flex-col justify-between p-4 min-h-[300px] sm:min-h-[400px]">
            {/* Top Telemetry Strip */}
            <div className="flex flex-wrap items-center gap-2 z-10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur border border-red-800/80 text-xs font-mono text-red-400">
                <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="font-bold">HR: {pulse} BPM</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur border border-slate-800 text-xs font-mono text-slate-300">
                BP: {emergencyCase.doctor.vitals?.bp || '130/85 mmHg'}
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur border border-slate-800 text-xs font-mono text-blue-400">
                SpO2: {emergencyCase.doctor.vitals?.spo2 || 97}%
              </div>
              <div className="ml-auto px-2.5 py-1 rounded bg-red-950/80 border border-red-800 text-[10px] font-mono text-red-300 font-bold">
                ETA TO PATIENT: {emergencyCase.ambulance.etaMinutes} MINS
              </div>
            </div>

            {/* Simulated Stream View */}
            <div className="my-auto flex flex-col items-center justify-center text-center py-6 relative">
              {consultMode === 'video' ? (
                <>
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-800 border-2 border-emerald-500/80 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <User className="w-14 h-14 text-emerald-400" />
                    </div>
                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                      <Activity className="w-3 h-3 text-black" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-3">
                    {emergencyCase.doctor.name}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {emergencyCase.doctor.specialty} · {emergencyCase.doctor.hospitalAffiliation}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>ENCRYPTED HD TELEMEDICINE VIDEO LINK ACTIVE</span>
                  </div>

                  {/* Picture-in-picture patient camera */}
                  <div className="absolute right-2 bottom-0 w-28 h-20 bg-slate-900 rounded-xl border border-slate-700 shadow-xl p-2 flex flex-col justify-between hidden sm:flex">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">You (Front Cam)</span>
                    <span className="text-[10px] text-white font-bold truncate">Patient Side</span>
                  </div>
                </>
              ) : (
                /* Cellular Audio Call Mode View */
                <div className="space-y-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mx-auto">
                    <Activity className="w-12 h-12 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{emergencyCase.doctor.name}</h3>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">DIRECT HIGH-PRIORITY CELLULAR VOICE LINK CONNECTED</p>
                    <p className="text-xs text-slate-400 mt-1">Speakerphone Active · Live Audio Telemetry Streamed</p>
                  </div>
                  {/* Waveform graphic */}
                  <div className="flex items-center justify-center gap-1 h-8 pt-1">
                    {[16, 28, 40, 24, 36, 48, 30, 18, 44, 28, 14, 38, 50, 32, 20].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full animate-pulse inline-block"
                        style={{ height: `${h * 0.5}px`, animationDelay: `${(i % 5) * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Instruction Card on Bottom of Video */}
            <div className="bg-red-950/80 backdrop-blur border border-red-800/80 rounded-xl p-3 text-xs text-red-200 z-10">
              <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PHYSICIAN DIRECTED ACTIONS WHILE AMBULANCE IS ARRIVING:</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-200">
                {emergencyCase.doctor.instructions.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>

            {/* Call Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-3 z-10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition-colors ${
                  isMuted
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call & Return to Tracker</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Clinical Chat & Handover Notes */}
          <div className="bg-[#0E121B] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between h-[300px] lg:h-auto">
            <div className="p-3 border-b border-slate-800 bg-[#121622] text-xs font-bold text-slate-300">
              Clinical Tele-Chat & Crew Relay
            </div>

            {/* Message Feed */}
            <div className="p-3 space-y-2.5 overflow-y-auto flex-1 text-xs">
              {chatMessages.map((m, i) => {
                const isDoc = m.sender === emergencyCase.doctor.name;
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border ${
                      isDoc
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                        : 'bg-red-950/50 border-red-900/60 text-white ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                      <span>{m.sender}</span>
                      <span className="font-mono text-[9px]">{m.time}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-2.5 border-t border-slate-800 flex gap-2 bg-[#0A0D14]">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Ask emergency doctor or relay patient change..."
                className="flex-1 bg-[#141824] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
