import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Shield,
  Stethoscope,
  Ambulance,
  Building2,
  User,
  Radio
} from 'lucide-react';
import { CaseMessage, UserRole, AppUserSession } from '../../types/roles';
import { emergencyService } from '../../services/emergencyService';

interface CaseChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  patientName: string;
  currentSession: AppUserSession;
}

export const CaseChatDrawer: React.FC<CaseChatDrawerProps> = ({
  isOpen,
  onClose,
  caseId,
  patientName,
  currentSession
}) => {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    setMessages(emergencyService.getMessages(caseId));
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const unsubscribe = emergencyService.subscribe(() => {
        loadMessages();
      });
      return unsubscribe;
    }
  }, [isOpen, caseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    emergencyService.sendMessage(
      caseId,
      inputText.trim(),
      {
        id: currentSession.id,
        name: currentSession.fullName,
        role: currentSession.role
      },
      false
    );

    setInputText('');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'DOCTOR':
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />;
      case 'AMBULANCE_OPERATOR':
        return <Ambulance className="w-3.5 h-3.5 text-amber-400" />;
      case 'HOSPITAL':
        return <Building2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'SUPER_ADMIN':
      case 'RESQ_ADMIN':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#0A0C12] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0E121B]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/20 text-[#FF2B44] border border-red-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white">{caseId}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-slate-400 border border-slate-800">
                CAD CHANNEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Comms Relay · {patientName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No messages on this channel yet.</p>
            <p className="text-[11px] text-slate-600">All transmissions are encrypted and logged.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === currentSession.id;
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl text-xs space-y-1 ${
                  msg.isSystemEvent
                    ? 'bg-slate-900/90 border border-slate-800/80 text-slate-300'
                    : isSelf
                    ? 'bg-red-950/40 border border-red-900/50 text-slate-100 ml-6'
                    : 'bg-[#121622] border border-slate-800 text-slate-200 mr-6'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    {getRoleIcon(msg.senderRole)}
                    <span className="text-white truncate max-w-[150px]">{msg.senderName}</span>
                    <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-slate-400 uppercase">
                      {msg.senderRole.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">{msg.timestamp}</span>
                </div>
                <p className="text-[12px] leading-relaxed break-words">{msg.message}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Comms Chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0B0E17] flex items-center gap-1.5 overflow-x-auto text-[10px]">
        <button
          onClick={() => setInputText('Paramedic ALS en route, patient conscious.')}
          className="px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
        >
          ALS En Route
        </button>
        <button
          onClick={() => setInputText('Vitals stable, preparing pre-arrival ECG.')}
          className="px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
        >
          Vitals Stable
        </button>
        <button
          onClick={() => setInputText('Trauma Bay ready, lead surgeon on standby.')}
          className="px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
        >
          Bay Ready
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-[#0E121B] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Transmit as ${currentSession.fullName}...`}
          className="flex-1 bg-black/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-[#FF2B44] hover:bg-red-600 disabled:opacity-40 text-white transition-all shadow-md shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
