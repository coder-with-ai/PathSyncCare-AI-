import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Loader2, Clock, ChevronDown, ChevronUp,
  Database, Cpu, Target, Brain, ShieldCheck, BarChart3, Send, Filter
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
  success: { icon: CheckCircle, color: '#10B981', label: 'Success', nodeClass: 'pipeline-node-success' },
  running: { icon: Loader2, color: '#3B82F6', label: 'Running', nodeClass: 'pipeline-node-running' },
  failed: { icon: XCircle, color: '#EF4444', label: 'Failed', nodeClass: 'pipeline-node-failed' },
  pending: { icon: Clock, color: '#6B7280', label: 'Pending', nodeClass: 'pipeline-node-pending' },
};

interface PipelineDAGProps {
  run: PipelineRun | null;
}

export default function PipelineDAG({ run }: PipelineDAGProps) {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  if (!run) {
    return (
      <div className="glass-card p-8 text-center">
        <Clock className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Select a pipeline run to view its execution graph</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-5">
        Pipeline Execution — {run.id}
      </h3>

      <div className="flex flex-col items-center gap-2">
        {run.nodes.map((node, i) => {
          const config = statusConfig[node.status];
          const StatusIcon = config.icon;
          const NodeIcon = nodeIcons[node.type] || Cpu;
          const isExpanded = expandedNode === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="w-full max-w-md"
            >
              {/* Connector */}
              {i > 0 && (
                <div className="flex justify-center py-1">
                  <div className="w-0.5 h-4" style={{
                    background: run.nodes[i-1].status === 'success' ? '#10B981' : 'var(--color-border)'
                  }} />
                </div>
              )}

              {/* Node */}
              <div
                onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                className={`pipeline-node ${config.nodeClass} cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <NodeIcon className="w-4 h-4" style={{ color: config.color }} />
                  <span className="flex-1 text-left text-[var(--color-text-primary)]">
                    {node.name}
                  </span>
                  <StatusIcon
                    className={`w-4 h-4 ${node.status === 'running' ? 'animate-spin' : ''}`}
                    style={{ color: config.color }}
                  />
                  {node.duration_ms !== null && (
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-1">
                      {node.duration_ms}ms
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  )}
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-[var(--color-border)] text-left"
                  >
                    {node.input_summary && (
                      <div className="mb-2">
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Input</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{node.input_summary}</p>
                      </div>
                    )}
                    {node.output_summary && (
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Output</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{node.output_summary}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Output Nodes */}
        <div className="flex justify-center py-1">
          <div className="w-0.5 h-4 bg-[var(--color-border)]" />
        </div>
        <div className="flex gap-3">
          {[
            { icon: '🖥️', label: 'Dashboard' },
            { icon: '💬', label: 'WhatsApp' },
            { icon: '🗄️', label: 'ABDM + Audit' },
          ].map((output, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]"
            >
              {output.icon} {output.label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
