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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0C0F17] border border-[#DCE3EC] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-[#FAFBFC] dark:bg-[#121622] border-b border-[#DCE3EC] dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18A66A] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#082B5C] dark:text-white">
                  {consultMode === 'video' ? 'EMERGENCY TELEMEDICINE VIDEO CHAT' : 'CELLULAR AUDIO CALL TO EMERGENCY PHYSICIAN'}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF1E8] border border-[#F36C21]/20 text-[#F36C21] font-bold">
                  CASE #{emergencyCase.id}
                </span>
              </div>
              <p className="text-[11px] text-[#596579] dark:text-slate-400 mt-0.5">
                Patient: <strong className="text-[#082B5C] dark:text-slate-200">{emergencyCase.patientName}</strong> ({emergencyCase.relationship}) · Doctor: {emergencyCase.doctor.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-white dark:bg-[#090C12] p-1 rounded-xl border border-[#DCE3EC] dark:border-slate-700 text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setConsultMode('audio')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  consultMode === 'audio'
                    ? 'bg-[#18A66A] text-white shadow-xs'
                    : 'text-[#596579] dark:text-slate-400 hover:text-[#082B5C] dark:hover:text-white'
                }`}
              >
                <span>Phone Call</span>
              </button>
              <button
                type="button"
                onClick={() => setConsultMode('video')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  consultMode === 'video'
                    ? 'bg-[#2F80C9] text-white shadow-xs'
                    : 'text-[#596579] dark:text-slate-400 hover:text-[#082B5C] dark:hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Chat</span>
              </button>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-[#EAF8F1] dark:bg-black/60 font-mono text-[#18A66A] text-xs font-bold border border-[#18A66A]/20">
              {formatCallTime(callDurationSec)}
            </div>

            <button
              onClick={onClose}
              className="text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen & Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
          {/* Main Simulated Video / Audio Feed */}
          <div className="lg:col-span-2 bg-[#061C3D] relative flex flex-col justify-between p-5 min-h-[300px] sm:min-h-[400px]">
            {/* Top Telemetry Strip */}
            <div className="flex flex-wrap items-center gap-2 z-10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-xs font-mono text-white">
                <Heart className="w-3.5 h-3.5 text-[#F36C21] animate-pulse" />
                <span className="font-bold">HR: {pulse} BPM</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-xs font-mono text-white">
                BP: {emergencyCase.doctor.vitals?.bp || '130/85 mmHg'}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-xs font-mono text-[#EAF4FF]">
                SpO2: {emergencyCase.doctor.vitals?.spo2 || 97}%
              </div>
              <div className="ml-auto px-3 py-1 rounded-xl bg-[#FFF1E8] border border-[#F36C21]/20 text-[10px] font-bold text-[#F36C21]">
                ETA TO PATIENT: {emergencyCase.ambulance.etaMinutes} MINS
              </div>
            </div>

            {/* Simulated Stream View */}
            <div className="my-auto flex flex-col items-center justify-center text-center py-6 relative">
              {consultMode === 'video' ? (
                <>
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 border-2 border-[#18A66A] flex items-center justify-center shadow-lg">
                      <User className="w-14 h-14 text-white" />
                    </div>
                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#18A66A] border-2 border-[#061C3D] flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-3">
                    {emergencyCase.doctor.name}
                  </h3>
                  <p className="text-xs text-white/80 max-w-sm">
                    {emergencyCase.doctor.specialty} · {emergencyCase.doctor.hospitalAffiliation}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18A66A]/20 border border-[#18A66A]/40 text-[#18A66A] text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#18A66A] animate-ping" />
                    <span>ENCRYPTED HD TELEMEDICINE VIDEO LINK ACTIVE</span>
                  </div>

                  {/* Picture-in-picture patient camera */}
                  <div className="absolute right-2 bottom-0 w-28 h-20 bg-black/60 backdrop-blur rounded-xl border border-white/10 shadow-xl p-2 flex flex-col justify-between hidden sm:flex">
                    <span className="text-[9px] font-bold text-white/60 uppercase">You (Front Cam)</span>
                    <span className="text-[10px] text-white font-bold truncate">Patient Side</span>
                  </div>
                </>
              ) : (
                /* Cellular Audio Call Mode View */
                <div className="space-y-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 border-2 border-[#18A66A] flex items-center justify-center shadow-lg mx-auto">
                    <Activity className="w-12 h-12 text-[#18A66A] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{emergencyCase.doctor.name}</h3>
                    <p className="text-xs text-[#EAF4FF] font-medium mt-0.5">DIRECT HIGH-PRIORITY CELLULAR VOICE LINK CONNECTED</p>
                    <p className="text-xs text-white/70 mt-1">Speakerphone Active · Live Audio Telemetry Streamed</p>
                  </div>
                  {/* Waveform graphic */}
                  <div className="flex items-center justify-center gap-1 h-8 pt-1">
                    {[16, 28, 40, 24, 36, 48, 30, 18, 44, 28, 14, 38, 50, 32, 20].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-[#18A66A] rounded-full animate-pulse inline-block"
                        style={{ height: `${h * 0.5}px`, animationDelay: `${(i % 5) * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Instruction Card on Bottom of Video */}
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-3.5 text-xs text-white z-10">
              <div className="flex items-center gap-1.5 font-bold text-[#FF7A00] mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PHYSICIAN DIRECTED ACTIONS WHILE AMBULANCE IS ARRIVING:</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-white/90">
                {emergencyCase.doctor.instructions.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>

            {/* Call Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-3 z-10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-[#F36C21] text-white border-[#F36C21]'
                    : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-[#D92D20] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call & Return to Tracker</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Clinical Chat & Handover Notes */}
          <div className="bg-white dark:bg-[#0E121B] border-t lg:border-t-0 lg:border-l border-[#DCE3EC] dark:border-slate-800 flex flex-col justify-between h-[300px] lg:h-auto">
            <div className="p-3.5 border-b border-[#DCE3EC] dark:border-slate-800 bg-[#FAFBFC] dark:bg-[#121622] text-xs font-bold text-[#082B5C] dark:text-slate-300">
              Clinical Tele-Chat & Crew Relay
            </div>

            {/* Message Feed */}
            <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1 text-xs">
              {chatMessages.map((m, i) => {
                const isDoc = m.sender === emergencyCase.doctor.name;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border ${
                      isDoc
                        ? 'bg-[#FAFBFC] dark:bg-slate-900/90 border-[#DCE3EC] dark:border-slate-800 text-[#082B5C] dark:text-slate-200'
                        : 'bg-[#FFF1E8] border-[#F36C21]/20 text-[#082B5C] ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#596579] dark:text-slate-400 mb-1 font-semibold">
                      <span>{m.sender}</span>
                      <span className="font-mono text-[9px]">{m.time}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#DCE3EC] dark:border-slate-800 flex gap-2 bg-[#FAFBFC] dark:bg-[#0A0D14]">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Ask emergency doctor or relay patient change..."
                className="flex-1 bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#F36C21]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white transition-colors cursor-pointer shadow-xs"
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
