import { LawyerServiceQuestion } from '../../core/api.service';
import { isBooleanQuestion, isNoAplicaQuestion } from './lawyer-services.model';

export type FlowPort = 'yes' | 'no' | 'next';

export interface GraphNodePos {
  id: string;
  q: LawyerServiceQuestion;
  x: number;
  y: number;
  depth: number;
  col: number;
  w: number;
  h: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  port: FlowPort;
  label: string;
  d: string;
  midX: number;
  midY: number;
}

export const NODE_W = 248;
export const NODE_H_BOOL = 132;
export const NODE_H_SINGLE = 108;
export const NODE_H = NODE_H_BOOL;
const GAP_X = 88;
const GAP_Y = 56;

export function nodeHeight(q: LawyerServiceQuestion): number {
  if (isNoAplicaQuestion(q)) return NODE_H_SINGLE;
  return isBooleanQuestion(q) ? NODE_H_BOOL : NODE_H_SINGLE;
}

/** Layered left→right layout (n8n-style flow). */
export function layoutQuestionGraph(
  questions: LawyerServiceQuestion[],
  positions?: Map<string, { x: number; y: number }>,
): {
  nodes: GraphNodePos[];
  edges: GraphEdge[];
  width: number;
  height: number;
} {
  if (!questions.length) {
    return { nodes: [], edges: [], width: 640, height: 360 };
  }

  const byId = new Map(questions.map((q) => [q.id!, q]));
  const start = questions[0]?.id;
  const depthOf = new Map<string, number>();
  const order: string[] = [];

  const queue: string[] = start ? [start] : [];
  if (start) depthOf.set(start, 0);
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    const q = byId.get(id);
    if (!q) continue;
    const d = depthOf.get(id) ?? 0;
    for (const next of outgoing(q)) {
      if (!byId.has(next) || depthOf.has(next)) continue;
      depthOf.set(next, d + 1);
      queue.push(next);
    }
  }

  for (const q of questions) {
    if (!q.id || depthOf.has(q.id)) continue;
    depthOf.set(q.id, Math.max(0, ...depthOf.values()) + 1);
    order.push(q.id);
  }

  const layers = new Map<number, string[]>();
  for (const id of order) {
    const d = depthOf.get(id) ?? 0;
    const row = layers.get(d) ?? [];
    row.push(id);
    layers.set(d, row);
  }

  const nodes: GraphNodePos[] = [];
  let maxRows = 1;
  for (const [depth, ids] of [...layers.entries()].sort((a, b) => a[0] - b[0])) {
    maxRows = Math.max(maxRows, ids.length);
    ids.forEach((id, col) => {
      const q = byId.get(id)!;
      const h = nodeHeight(q);
      const saved = positions?.get(id);
      const autoX = depth * (NODE_W + GAP_X) + 48;
      const autoY = col * (NODE_H_BOOL + GAP_Y) + 48;
      nodes.push({
        id,
        q,
        depth,
        col,
        w: NODE_W,
        h,
        x: saved?.x ?? autoX,
        y: saved?.y ?? autoY,
      });
    });
  }

  // Center shorter columns vertically when no manual positions
  if (!positions?.size) {
    for (const n of nodes) {
      const colIds = layers.get(n.depth) ?? [];
      const colH =
        colIds.reduce((sum, id) => sum + nodeHeight(byId.get(id)!) + GAP_Y, 0) - GAP_Y;
      const offset = Math.max(0, (maxRows * (NODE_H_BOOL + GAP_Y) - GAP_Y - colH) / 2);
      const idx = colIds.indexOf(n.id);
      let y = 48 + offset;
      for (let i = 0; i < idx; i++) {
        y += nodeHeight(byId.get(colIds[i])!) + GAP_Y;
      }
      n.y = y;
    }
  }

  const pos = new Map(nodes.map((n) => [n.id, n]));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const q of questions) {
    if (!q.id) continue;
    const from = pos.get(q.id);
    if (!from) continue;

    const links: { to: string; port: FlowPort; label: string }[] = [];
    if (isNoAplicaQuestion(q)) {
      // terminal — no edges out
    } else if (isBooleanQuestion(q)) {
      if (q.branch_yes) links.push({ to: q.branch_yes, port: 'yes', label: 'Sí' });
      if (q.branch_no) links.push({ to: q.branch_no, port: 'no', label: 'No' });
    } else if (q.next) {
      links.push({ to: q.next, port: 'next', label: 'Siguiente' });
    }

    for (const link of links) {
      const to = pos.get(link.to);
      if (!to) continue;
      const key = `${q.id}:${link.port}->${link.to}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const a = portPoint(from, link.port, 'out');
      const b = portPoint(to, 'next', 'in');
      edges.push({
        id: key,
        from: q.id,
        to: link.to,
        port: link.port,
        label: link.label,
        ...bezier(a.x, a.y, b.x, b.y),
      });
    }
  }

  const width = Math.max(...nodes.map((n) => n.x + n.w + 80), 720);
  const height = Math.max(...nodes.map((n) => n.y + n.h + 80), 420);

  return { nodes, edges, width, height };
}

export function portPoint(
  n: Pick<GraphNodePos, 'x' | 'y' | 'w' | 'h' | 'q'>,
  port: FlowPort | 'in',
  side: 'in' | 'out',
): { x: number; y: number } {
  if (side === 'in' || port === 'in') {
    return { x: n.x, y: n.y + n.h / 2 };
  }
  if (isBooleanQuestion(n.q)) {
    if (port === 'yes') return { x: n.x + n.w, y: n.y + 58 };
    if (port === 'no') return { x: n.x + n.w, y: n.y + 96 };
  }
  return { x: n.x + n.w, y: n.y + n.h / 2 };
}

export function bezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { d: string; midX: number; midY: number } {
  const dx = Math.max(48, Math.abs(x2 - x1) * 0.45);
  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  return { d, midX: (x1 + x2) / 2, midY: (y1 + y2) / 2 };
}

function outgoing(q: LawyerServiceQuestion): string[] {
  if (isNoAplicaQuestion(q)) return [];
  if (isBooleanQuestion(q)) {
    return [q.branch_yes, q.branch_no].filter((x): x is string => !!x);
  }
  return q.next ? [q.next] : [];
}
