import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  FileText,
  AlertTriangle,
  Stethoscope,
  Activity,
  UserCheck,
  Shield,
  Layers,
  Code
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';
import { supabaseDataService, SUPABASE_SQL_SCHEMA } from '../services/supabaseDataService';
import { MedicalRecord } from '../types/emergency';
import { DoctorOnboardingRequest } from '../types/roles';

interface SupabaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseInspectorModal: React.FC<SupabaseInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'HOW_TO_SEE' | 'LIVE_DATA' | 'SQL_SCHEMA'>('HOW_TO_SEE');
  const [selectedTable, setSelectedTable] = useState<'medical_records' | 'emergency_cases' | 'doctor_onboarding' | 'profiles'>('medical_records');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [onboardingRequests, setOnboardingRequests] = useState<DoctorOnboardingRequest[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const status = getSupabaseConfigStatus();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await supabaseDataService.getMedicalRecords();
      setMedicalRecords(records);
      const requests = await supabaseDataService.getDoctorOnboardingRequests();
      setOnboardingRequests(requests);
    } catch (e) {
      console.warn('Error loading inspector data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0D111A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#111726] to-[#0A0D15] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                  SUPABASE CLOUD SYNC
                </span>
                <span className="text-[11px] text-slate-400">Database & Records Inspector</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                How to View Patient Records & Telemetry on Supabase
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#090C12] border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('HOW_TO_SEE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'HOW_TO_SEE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Supabase Step-by-Step Guide
          </button>
          <button
            onClick={() => setActiveTab('LIVE_DATA')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'LIVE_DATA'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Live Data Browser ({medicalRecords.length} Records)
          </button>
          <button
            onClick={() => setActiveTab('SQL_SCHEMA')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'SQL_SCHEMA'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ SQL Schema & Tables
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: STEP BY STEP GUIDE */}
          {activeTab === 'HOW_TO_SEE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Supabase Cloud Connectivity Status
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                    {status.isConfigured ? 'CONNECTED & SYNCING' : 'READY TO CONNECT'}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Every time a patient uploads a medical or surgical record, creates an account with their emergency passport, or dispatches an emergency, RESQ ONE writes directly to your Supabase PostgreSQL database tables.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                  Follow These Steps to View the Stored Data in Supabase:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-black text-emerald-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[11px]">
                        1
                      </span>
                      <span>Open Supabase Dashboard</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Go to{' '}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 font-mono hover:underline inline-flex items-center gap-1"
                      >
                        supabase.com/dashboard <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      and select your RESQ ONE project.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-black text-emerald-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[11px]">
                        2
                      </span>
                      <span>Click the "Table Editor"</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      In the left vertical sidebar, click the <strong>Table Editor</strong> icon (grid icon <Table className="w-3.5 h-3.5 inline text-emerald-400" />).
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-black text-emerald-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[11px]">
                        3
                      </span>
                      <span>View <code className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded">public.medical_records</code></span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Here you will see every uploaded patient record: title, surgery notes, category, dates, attached files, and treating physicians.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-black text-emerald-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[11px]">
                        4
                      </span>
                      <span>View Other Stored Telemetry Tables</span>
                    </div>
                    <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                      <li><strong className="text-white">emergency_cases</strong>: CAD dispatch, ambulance live GPS coordinates.</li>
                      <li><strong className="text-white">profiles</strong>: Patient blood groups, drug allergies, conditions.</li>
                      <li><strong className="text-white">doctor_onboarding_requests</strong>: Doctor credential applications.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Go to Supabase Dashboard Table Editor</span>
                </a>

                <button
                  onClick={() => setActiveTab('SQL_SCHEMA')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span>Copy SQL Table Script</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DATA BROWSER */}
          {activeTab === 'LIVE_DATA' && (
            <div className="space-y-4">
              {/* Table Selector */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setSelectedTable('medical_records')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTable === 'medical_records'
                      ? 'bg-red-950/80 text-red-300 border border-red-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📁 medical_records ({medicalRecords.length})
                </button>
                <button
                  onClick={() => setSelectedTable('doctor_onboarding')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTable === 'doctor_onboarding'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🩺 doctor_onboarding_requests ({onboardingRequests.length})
                </button>
              </div>

              {/* Table Data View */}
              {selectedTable === 'medical_records' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Showing live patient records uploaded & stored in RESQ ONE</span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      Table: public.medical_records
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#121622] text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">Record ID</th>
                          <th className="p-3">Patient Name</th>
                          <th className="p-3">Title / Document</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Facility</th>
                          <th className="p-3">File Attached</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-200">
                        {medicalRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3 font-mono text-emerald-400 font-bold">{r.id}</td>
                            <td className="p-3 font-medium text-white">{r.patientName}</td>
                            <td className="p-3 font-semibold text-white">{r.title}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {r.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-400">{r.date}</td>
                            <td className="p-3 text-slate-300">{r.facility || 'General Hospital'}</td>
                            <td className="p-3 font-mono text-slate-400">
                              {r.attachments && r.attachments.length > 0
                                ? `📎 ${r.attachments[0].name} (${r.attachments[0].size || 'PDF'})`
                                : 'Text Record'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedTable === 'doctor_onboarding' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Showing physician credential applications queued for verification</span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      Table: public.doctor_onboarding_requests
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#121622] text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">Request ID</th>
                          <th className="p-3">Physician Name</th>
                          <th className="p-3">License #</th>
                          <th className="p-3">Specialty</th>
                          <th className="p-3">Hospital</th>
                          <th className="p-3">Experience</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-200">
                        {onboardingRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3 font-mono text-emerald-400 font-bold">{req.id}</td>
                            <td className="p-3 font-medium text-white">{req.fullName}</td>
                            <td className="p-3 font-mono text-amber-300 font-bold">{req.registrationNumber}</td>
                            <td className="p-3 text-slate-300">{req.specialization}</td>
                            <td className="p-3 text-slate-300">{req.hospitalAffiliation}</td>
                            <td className="p-3 font-mono">{req.experienceYears} yrs</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  req.status === 'APPROVED'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : 'bg-amber-950 text-amber-300 border-amber-800'
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SQL SCHEMA MIGRATION */}
          {activeTab === 'SQL_SCHEMA' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    PostgreSQL Table Creation & RLS Policies
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Paste this into Supabase SQL Editor to initialize all tables with 1 click.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-black/80 border border-slate-800 p-4 overflow-x-auto max-h-72">
                <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
