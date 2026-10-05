import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  RefreshCw,
  X,
  QrCode,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
  Users
} from 'lucide-react';
import { FamilyGroup } from '../../types/family';
import { familyService } from '../../services/familyService';

interface FamilyInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: FamilyGroup;
  isAdmin: boolean;
  currentUser: { id: string; fullName: string };
  onCodeRegenerated: (newCode: string) => void;
}

export const FamilyInvitationModal: React.FC<FamilyInvitationModalProps> = ({
  isOpen,
  onClose,
  family,
  isAdmin,
  currentUser,
  onCodeRegenerated
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://resqone.health';
  const joinLink = `${currentOrigin}/?joinFamily=${family.familyCode}`;
  const invitationText = `Join ${family.name} on RESQ ONE Emergency Network! Enter code: ${family.familyCode} or click: ${joinLink} for secure emergency assistance.`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(family.familyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(joinLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${family.name} on RESQ One`,
          text: invitationText,
          url: joinLink
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(invitationText)}`;
    window.open(waUrl, '_blank');
  };

  const handleRegenerateCode = () => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to generate a new family code? The previous code will no longer work for new join requests.')) {
      setIsRegenerating(true);
      const newCode = familyService.regenerateFamilyCode(family.id, currentUser.id);
      onCodeRegenerated(newCode);
      setTimeout(() => setIsRegenerating(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F131D] border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Invite Family Member</h2>
              <span className="text-[10px] text-slate-400 font-mono">{family.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Family Code Card */}
          <div className="p-4 rounded-2xl bg-[#141926] border border-blue-900/60 text-center space-y-3 shadow-inner">
            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold block">
              Permanent Family RESQ Code
            </span>

            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider py-1 selection:bg-blue-600">
              {family.familyCode}
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleShareNative}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Share Code</span>
              </button>
            </div>
          </div>

          {/* Social & Direct Invitation Options */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block px-1">
              Quick Share Channels
            </span>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-white block">WhatsApp Share</strong>
                  <span className="text-[10px] text-emerald-300">Send direct invitation with link & code</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Direct Join Link */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Direct Invitation Link:</span>
                <button onClick={handleCopyLink} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={joinLink}
                className="w-full bg-[#0A0D14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-400 select-all"
              />
            </div>
          </div>

          {/* Family Admin Tools: Regenerate Code */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Need a fresh code?</span>
                  <span className="text-[10px] text-slate-400">Previous code will be invalidated</span>
                </div>
                <button
                  onClick={handleRegenerateCode}
                  disabled={isRegenerating}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Generate New Code</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-[10px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 text-center leading-relaxed">
            Family code is only for discovering and requesting to join this family circle. No medical records or live
            locations are shared until an authorized admin approves the member.
          </p>
        </div>
      </div>
    </div>
  );
};
