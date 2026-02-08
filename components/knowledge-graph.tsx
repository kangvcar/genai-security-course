'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

interface Node {
  id: string;
  label: string;
  href: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  label: string;
  dashed?: boolean;
}

const nodes: Node[] = [
  { id: '01', label: 'AI 安全基础',  href: '/docs/01-ai-security-basics',  x: 240, y: 32  },
  { id: '02', label: '提示词攻击',    href: '/docs/02-prompt-attacks',       x: 96,  y: 136 },
  { id: '03', label: '安全防御',      href: '/docs/03-ai-defense',           x: 384, y: 136 },
  { id: '04', label: '风险全景',      href: '/docs/04-risk-landscape',       x: 96,  y: 240 },
  { id: '05', label: '评估与展望',    href: '/docs/05-assessment-outlook',   x: 384, y: 240 },
];

const edges: Edge[] = [
  { from: '01', to: '02', label: '攻击技术' },
  { from: '01', to: '03', label: '防御策略' },
  { from: '02', to: '03', label: '知攻善防', dashed: true },
  { from: '02', to: '04', label: '风险拓展' },
  { from: '03', to: '05', label: '体系评估' },
  { from: '04', to: '05', label: '风险驱动', dashed: true },
];

const W = 480;
const H = 280;
const DOT_R = 5;
const HIT_R = 28;

function edgePath(from: Node, to: Node): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = DOT_R + 4;
  const sx = from.x + (dx / dist) * offset;
  const sy = from.y + (dy / dist) * offset;
  const ex = to.x - (dx / dist) * offset;
  const ey = to.y - (dy / dist) * offset;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const px = -dy / dist;
  const py = dx / dist;
  const curvature = dist * 0.08;
  const cx = mx + px * curvature;
  const cy = my + py * curvature;
  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
}

function labelPos(from: Node, to: Node) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const px = -dy / dist;
  const py = dx / dist;
  const curvature = dist * 0.08;
  return { x: mx + px * curvature * 0.5, y: my + py * curvature * 0.5 };
}

export function KnowledgeGraph() {
  const [active, setActive] = useState<string | null>(null);

  const connected = useMemo(() => {
    if (!active) return new Set<string>();
    const s = new Set<string>([active]);
    edges.forEach((e) => {
      if (e.from === active) s.add(e.to);
      if (e.to === active) s.add(e.from);
    });
    return s;
  }, [active]);

  const isEdgeActive = useCallback(
    (e: Edge) => active !== null && (e.from === active || e.to === active),
    [active],
  );

  return (
    <section className="pb-16">
      <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-500 uppercase tracking-wide mb-6">
        知识图谱
      </h2>

      <div
        className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onMouseLeave={() => setActive(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Edges */}
          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.from)!;
            const to = nodes.find((n) => n.id === edge.to)!;
            const d = edgePath(from, to);
            const ea = isEdgeActive(edge);
            const dimmed = active !== null && !ea;
            const mid = labelPos(from, to);

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={d}
                  fill="none"
                  strokeWidth={ea ? 1.2 : 0.8}
                  strokeDasharray={edge.dashed ? '3 2.5' : undefined}
                  className={`transition-all duration-200 ${
                    ea
                      ? 'stroke-neutral-800 dark:stroke-neutral-200'
                      : dimmed
                        ? 'stroke-neutral-100 dark:stroke-neutral-800/60'
                        : 'stroke-neutral-200 dark:stroke-neutral-700'
                  }`}
                />
                <text
                  x={mid.x}
                  y={mid.y - 4}
                  textAnchor="middle"
                  className={`text-[7px] tracking-wide transition-all duration-200 select-none ${
                    ea
                      ? 'fill-neutral-600 dark:fill-neutral-300 opacity-100'
                      : dimmed
                        ? 'opacity-0'
                        : 'fill-neutral-300 dark:fill-neutral-600 opacity-100'
                  }`}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelf = active === node.id;
            const isConn = connected.has(node.id);
            const dimmed = active !== null && !isConn;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setActive(node.id)}
                onClick={() => setActive(node.id === active ? null : node.id)}
              >
                <circle cx={node.x} cy={node.y} r={HIT_R} fill="transparent" />

                {isSelf && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={DOT_R + 6}
                    fill="none"
                    strokeWidth={0.6}
                    className="stroke-neutral-400 dark:stroke-neutral-500 animate-pulse"
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={DOT_R}
                  className={`transition-all duration-200 ${
                    isSelf
                      ? 'fill-neutral-900 dark:fill-neutral-100'
                      : isConn
                        ? 'fill-neutral-600 dark:fill-neutral-400'
                        : dimmed
                          ? 'fill-neutral-200 dark:fill-neutral-700'
                          : 'fill-neutral-400 dark:fill-neutral-500'
                  }`}
                />

                <text
                  x={node.x}
                  y={node.y + 20}
                  textAnchor="middle"
                  className={`text-[8px] font-mono transition-all duration-200 select-none ${
                    isSelf
                      ? 'fill-neutral-900 dark:fill-neutral-100'
                      : dimmed
                        ? 'fill-neutral-200 dark:fill-neutral-700'
                        : 'fill-neutral-400 dark:fill-neutral-500'
                  }`}
                >
                  {node.id}
                </text>

                <text
                  x={node.x}
                  y={node.y + 32}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-all duration-200 select-none ${
                    isSelf
                      ? 'fill-neutral-900 dark:fill-neutral-100'
                      : isConn
                        ? 'fill-neutral-700 dark:fill-neutral-300'
                        : dimmed
                          ? 'fill-neutral-200 dark:fill-neutral-700'
                          : 'fill-neutral-600 dark:fill-neutral-400'
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Bottom bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between min-h-[44px]">
          {active ? (() => {
            const node = nodes.find((n) => n.id === active)!;
            const related = edges
              .filter((e) => e.from === active || e.to === active)
              .map((e) => {
                const otherId = e.from === active ? e.to : e.from;
                return nodes.find((n) => n.id === otherId)!.label;
              });
            return (
              <>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  <span className="font-mono text-neutral-400 dark:text-neutral-500 mr-1.5">{node.id}</span>
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">{node.label}</span>
                  <span className="text-neutral-300 dark:text-neutral-700 mx-1.5">·</span>
                  {related.join('、')}
                </p>
                <Link
                  href={node.href}
                  className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex-shrink-0 ml-4"
                >
                  进入 →
                </Link>
              </>
            );
          })() : (
            <p className="text-[11px] text-neutral-400 dark:text-neutral-600">
              悬停查看模块关联 · 实线为学习路径 · 虚线为知识互联
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
