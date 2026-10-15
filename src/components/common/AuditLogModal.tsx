import React, { useState } from 'react';
import { Shield, X, Filter, History, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && log.resourceType === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">System Audit Trail</h3>
              <p className="text-[11px] text-slate-400">Chronological tamper-evident activity record for organization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/30 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter actions or user..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="all">All Resource Types</option>
              <option value="athlete">Athlete</option>
              <option value="test_session">Test Sessions</option>
              <option value="wrestling_assessment">Wrestling Assessment</option>
              <option value="injury">Medical & Injury</option>
              <option value="competition">Competition</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No audit entries match the current filter.</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-slate-800/50 border border-slate-800 rounded-lg hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-mono text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-700 font-bold uppercase">
                      {log.action}
                    </span>
                    <span className="text-slate-300 font-medium">{log.details || log.resourceType}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-2 rtl:space-x-reverse">
                    <span>By: <strong className="text-slate-300">{log.userName}</strong> ({log.userRole})</span>
                    <span>•</span>
                    <span className="text-slate-400">ID: {log.resourceId || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono self-start sm:self-center">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
