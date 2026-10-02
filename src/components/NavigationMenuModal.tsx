import React from 'react';
import {
  X,
  Users,
  User,
  FileText,
  CreditCard,
  Building2,
  UserPlus,
  Radio,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  Activity,
  PhoneCall,
  Clock,
  Sparkles
} from 'lucide-react';
import { ResqLogo } from './ResqLogo';
import { UserEmergencyProfile, FamilyMemberProfile, EmergencyCase } from '../types/emergency';

interface NavigationMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserEmergencyProfile;
  familyCount: number;
  recordsCount: number;
  insuranceCount: number;
  hospitalsCount: number;
  activeCasesCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigate: (view: 'DASHBOARD' | 'ACTIVE_TRACKER' | 'MEDICAL_RECORDS' | 'INSURANCE' | 'HOSPITAL_PREFERENCES' | 'SIGN_UP' | 'DOCTOR_PORTAL' | 'OPERATIONS_PORTAL' | 'HOSPITAL_PORTAL' | 'ADMIN_PORTAL') => void;
  onOpenSelfProfile: () => void;
  onOpenFamilyManagement: () => void;
  onTriggerSOS: () => void;
  onOpenPortal?: (portal: 'PATIENT' | 'DOCTOR' | 'OPERATIONS' | 'HOSPITAL' | 'ADMIN') => void;
}

export const NavigationMenuModal: React.FC<NavigationMenuModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  familyCount,
  recordsCount,
  insuranceCount,
  hospitalsCount,
  activeCasesCount,
  soundEnabled,
  onToggleSound,
  onNavigate,
  onOpenSelfProfile,
  onOpenFamilyManagement,
  onTriggerSOS,
  onOpenPortal
}) => {
  if (!isOpen) return null;

  const menuSections = [
    {
      category: 'MULTI-ROLE RESQ ONE ECOSYSTEM',
      items: [
        {
          id: 'portal-doctor',
          title: 'Emergency Doctor Portal',
          description: 'Physician triage, vital telemetry link, clinical directives & hospital referral',
          badge: '/doctor',
          badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-900',
          icon: Activity,
          iconColor: 'text-emerald-400 bg-emerald-600/15 border-emerald-500/30',
          action: () => {
            onClose();
            if (onOpenPortal) onOpenPortal('DOCTOR');
            else onNavigate('DOCTOR_PORTAL');
          }
        },
        {
          id: 'portal-operations',
          title: 'Ambulance CAD & Fleet Operations',
          description: 'Paramedic dispatch console, live GPS coordinates & unit coordination',
          badge: '/operations',
          badgeColor: 'bg-amber-950 text-amber-400 border-amber-900',
          icon: Clock,
          iconColor: 'text-amber-400 bg-amber-600/15 border-amber-500/30',
          action: () => {
            onClose();
            if (onOpenPortal) onOpenPortal('OPERATIONS');
            else onNavigate('OPERATIONS_PORTAL');
          }
        },
        {
          id: 'portal-hospital',
          title: 'Hospital Trauma Bay Portal',
          description: 'Inbound trauma pre-notifications, bed prep & patient admission handover',
          badge: '/hospital',
          badgeColor: 'bg-purple-950 text-purple-400 border-purple-900',
          icon: Building2,
          iconColor: 'text-purple-400 bg-purple-600/15 border-purple-500/30',
          action: () => {
            onClose();
            if (onOpenPortal) onOpenPortal('HOSPITAL');
            else onNavigate('HOSPITAL_PORTAL');
          }
        },
        {
          id: 'portal-admin',
          title: 'Super Admin Command Center',
          description: 'Incident overwatch, provider verification, immutable audit logs & analytics',
          badge: '/admin',
          badgeColor: 'bg-blue-950 text-blue-400 border-blue-900',
          icon: ShieldCheck,
          iconColor: 'text-blue-400 bg-blue-600/15 border-blue-500/30',
          action: () => {
            onClose();
            if (onOpenPortal) onOpenPortal('ADMIN');
            else onNavigate('ADMIN_PORTAL');
          }
        }
      ]
    },
    {
      category: 'CLINICAL & EMERGENCY PASSPORT',
      items: [
        {
          id: 'self-profile',
          title: 'Health Passport',
          description: `Blood: ${currentUser.bloodGroup} · Allergies: ${currentUser.allergies.join(', ') || 'NKDA'} · Medications`,
          badge: 'Verified Identity',
          badgeColor: 'bg-red-950 text-red-400 border-red-900',
          icon: User,
          iconColor: 'text-[#FF2B44] bg-red-600/15 border-red-500/30',
          action: () => {
            onClose();
            onOpenSelfProfile();
          }
        },
        {
          id: 'family-circle',
          title: 'Family Circle & Relatives',
          description: `${familyCount} linked family profiles with live location & emergency contacts`,
          badge: `${familyCount} Members`,
          badgeColor: 'bg-blue-950 text-blue-400 border-blue-900',
          icon: Users,
          iconColor: 'text-blue-400 bg-blue-600/15 border-blue-500/30',
          action: () => {
            onClose();
            onOpenFamilyManagement();
          }
        },
        {
          id: 'medical-records',
          title: 'Past Medical Records',
          description: 'Operative summaries, discharge reports, ECGs & clinical documents',
          badge: `${recordsCount} Records`,
          badgeColor: 'bg-purple-950 text-purple-400 border-purple-900',
          icon: FileText,
          iconColor: 'text-purple-400 bg-purple-600/15 border-purple-500/30',
          action: () => {
            onClose();
            onNavigate('MEDICAL_RECORDS');
          }
        }
      ]
    },
    {
      category: 'COVERAGE & HOSPITAL PREFERENCES',
      items: [
        {
          id: 'insurance-docs',
          title: 'Insurance Documents & Cards',
          description: 'Front & back digital insurance cards, member IDs, emergency copays',
          badge: `${insuranceCount} Policies`,
          badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-900',
          icon: CreditCard,
          iconColor: 'text-emerald-400 bg-emerald-600/15 border-emerald-500/30',
          action: () => {
            onClose();
            onNavigate('INSURANCE');
          }
        },
        {
          id: 'hospital-preferences',
          title: 'Hospital Preferences & Routing',
          description: 'Ranked trauma centers, ambulance bay entrances & clinical directions',
          badge: `${hospitalsCount} Facilities`,
          badgeColor: 'bg-amber-950 text-amber-400 border-amber-900',
          icon: Building2,
          iconColor: 'text-amber-400 bg-amber-600/15 border-amber-500/30',
          action: () => {
            onClose();
            onNavigate('HOSPITAL_PREFERENCES');
          }
        },
        {
          id: 'sign-up',
          title: 'Sign Up / Registration Portal',
          description: 'Register a new account or complete multi-step clinical onboarding',
          badge: '6-Step Portal',
          badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-900',
          icon: UserPlus,
          iconColor: 'text-cyan-400 bg-cyan-600/15 border-cyan-500/30',
          action: () => {
            onClose();
            onNavigate('SIGN_UP');
          }
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D1017] border-2 border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#121622] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ResqLogo variant="compact" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">
                MAIN SERVICES MENU
              </span>
              <span className="text-[11px] text-slate-500">
                All features, profiles, records & preferences
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={soundEnabled ? 'Mute CAD audio' : 'Unmute CAD audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Emergency SOS Strip inside Menu */}
        <div className="px-6 py-3 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-white">Emergency SOS Available:</span>
            <span className="text-xs text-red-300 hidden sm:inline">1-Click Dispatch for Myself, Family, or Others</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onTriggerSOS();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-[#FF2B44] text-white text-xs font-black tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-1.5"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Launch SOS</span>
          </button>
        </div>

        {/* Active Cases Quick Jump (if active) */}
        {activeCasesCount > 0 && (
          <div className="px-6 py-2.5 bg-blue-950/40 border-b border-blue-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>{activeCasesCount} active emergency case(s) currently being tracked</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigate('ACTIVE_TRACKER');
              }}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
            >
              View Active Tracker →
            </button>
          </div>
        )}

        {/* Scrollable Menu Items */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h3 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
                {section.category}
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="p-4 rounded-2xl bg-[#121622] hover:bg-[#161B2B] border border-slate-800 hover:border-slate-700 text-left transition-all group flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${item.iconColor} group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors truncate">
                              {item.title}
                            </h4>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeColor} shrink-0`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0A0D14] border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Logged in as: <strong className="text-slate-300">{currentUser.fullName}</strong></span>
          </div>
          <button
            onClick={() => {
              onClose();
              onNavigate('DASHBOARD');
            }}
            className="text-red-400 hover:text-white font-bold transition-colors"
          >
            ← Return to Emergency SOS
          </button>
        </div>
      </div>
    </div>
  );
};
