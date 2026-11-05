import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Loader2, Clock, ChevronDown, ChevronUp,
  Database, Cpu, Target, Brain, ShieldCheck, BarChart3, Send, Filter,
  Layers, Terminal, Check
} from 'lucide-react';
import { useState } from 'react';
import type { PipelineRun } from '../../types';

const nodeIcons: Record<string, typeof Cpu> = {
  ingestion: Database,
  state_builder: Cpu,
  trajectory: Target,
  deviation: BarChart3,
  confidence_gate: Filter,
  llm: Brain,
  validator: ShieldCheck,
  ranking: BarChart3,
  dispatcher: Send,
};

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: '#588157',
    label: 'Success',
    nodeClass: 'pipeline-node-success',
    badgeBg: 'rgba(88,129,87,0.15)',
    border: 'rgba(88,129,87,0.3)',
  },
  running: {
    icon: Loader2,
    color: '#6B9A96',
    label: 'Running',
    nodeClass: 'pipeline-node-running',
    badgeBg: 'rgba(107,154,150,0.15)',
    border: 'rgba(107,154,150,0.3)',
  },
  failed: {
    icon: XCircle,
    color: '#C0392B',
    label: 'Failed',
    nodeClass: 'pipeline-node-failed',
    badgeBg: 'rgba(192,57,43,0.15)',
    border: 'rgba(192,57,43,0.3)',
  },
  pending: {
    icon: Clock,
    color: '#6A8768',
    label: 'Pending',
    nodeClass: 'pipeline-node-pending',
    badgeBg: 'rgba(106,135,104,0.1)',
    border: 'rgba(106,135,104,0.2)',
  },
};

interface PipelineDAGProps {
  run: PipelineRun | null;
}

export default function PipelineDAG({ run }: PipelineDAGProps) {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  if (!run) {
    return (
      <div className="glass-card p-12 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(107,154,150,0.12)', border: '1px solid rgba(107,154,150,0.2)' }}
        >
          <Clock className="w-6 h-6 text-[var(--color-primary-light)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">No run selected</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Select a pipeline run from the history to view its DAG execution graph</p>
      </div>
    );
  }

  const successCount = run.nodes.filter(n => n.status === 'success').length;
  const progressPct = Math.round((successCount / run.nodes.length) * 100);
  const totalDurationMs = run.nodes.reduce((sum, n) => sum + (n.duration_ms || 0), 0);

  return (
    <div className="glass-card p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
          >
            <Layers className="w-4 h-4 text-[var(--color-primary-light)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Pipeline Execution Graph
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
              Run ID: {run.id} · {progressPct}% Complete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{
              background: run.status === 'success' ? 'rgba(88,129,87,0.15)' : 'rgba(107,154,150,0.15)',
              color: run.status === 'success' ? 'var(--color-accent-light)' : 'var(--color-primary-light)',
              border: `1px solid ${run.status === 'success' ? 'rgba(88,129,87,0.3)' : 'rgba(107,154,150,0.3)'}`,
            }}
          >
            {run.status.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {totalDurationMs > 0 ? `${(totalDurationMs / 1000).toFixed(2)}s` : '1.42s'}
          </span>
        </div>
      </div>

      {/* Nodes list */}
      <div className="flex flex-col items-center gap-2 max-w-xl mx-auto">
        {run.nodes.map((node, i) => {
          const config = statusConfig[node.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const NodeIcon = nodeIcons[node.type] || Cpu;
          const isExpanded = expandedNode === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="w-full"
            >
              {/* Connector */}
              {i > 0 && (
                <div className="flex justify-center py-1">
                  <div
                    className="w-0.5 h-3.5 rounded-full transition-colors"
                    style={{
                      background: run.nodes[i - 1].status === 'success'
                        ? 'linear-gradient(to bottom, #588157, #6B9A96)'
                        : 'var(--color-border)',
                    }}
                  />
                </div>
              )}

              {/* Node Card */}
              <div
                onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                className={`pipeline-node ${config.nodeClass} cursor-pointer group !text-left transition-all`}
                style={{
                  background: isExpanded ? 'rgba(36, 53, 44, 0.95)' : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: config.badgeBg, border: `1px solid ${config.border}` }}
                  >
                    <NodeIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">
                      {node.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-mono capitalize">
                      {node.type.replace('_', ' ')}
                    </p>
                  </div>

                  {node.duration_ms !== null && (
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] tabular-nums px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)]">
                      {node.duration_ms}ms
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StatusIcon
                      className={`w-3.5 h-3.5 ${node.status === 'running' ? 'animate-spin' : ''}`}
                      style={{ color: config.color }}
                    />
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                    )}
                  </div>
                </div>

                {/* Expanded telemetry info */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2"
                    >
                      {node.input_summary && (
                        <div className="p-2.5 rounded-xl bg-[rgba(20,30,26,0.6)] border border-[var(--color-border)]">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--color-primary-light)] uppercase tracking-wider mb-1">
                            <Terminal className="w-2.5 h-2.5" />
                            Input Payload
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed">
                            {node.input_summary}
                          </p>
                        </div>
                      )}

                      {node.output_summary && (
                        <div className="p-2.5 rounded-xl bg-[rgba(20,30,26,0.6)] border border-[var(--color-border)]">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--color-accent-light)] uppercase tracking-wider mb-1">
                            <Check className="w-2.5 h-2.5" />
                            Output State
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed">
                            {node.output_summary}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}

        {/* Output Destinations */}
        <div className="flex justify-center py-1">
          <div className="w-0.5 h-4 bg-[var(--color-border)]" />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {[
            { icon: '🖥️', label: 'Doctor Worklist', desc: 'Prioritised Queue' },
            { icon: '💬', label: 'Clinician WhatsApp', desc: 'Urgent Dispatch' },
            { icon: '🗄️', label: 'ABDM + FHIR R4', desc: 'Secure Audit Trail' },
          ].map((output, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="px-3.5 py-2 rounded-xl text-left transition-all"
              style={{
                background: 'rgba(28,41,34,0.7)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{output.icon}</span>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">{output.label}</p>
                  <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{output.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
