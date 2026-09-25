const nodes = [
  { x: 250, y: 230, r: 42, type: "origin" },
  { x: 125, y: 100, r: 19, type: "claim" },
  { x: 407, y: 138, r: 27, type: "claim" },
  { x: 367, y: 358, r: 20, type: "claim" },
  { x: 91, y: 330, r: 14, type: "conversation" },
  { x: 298, y: 58, r: 10, type: "conversation" },
  { x: 472, y: 287, r: 12, type: "conversation" },
  { x: 197, y: 406, r: 9, type: "conversation" },
  { x: 42, y: 198, r: 8, type: "conversation" },
];
const edges = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 6],
  [3, 7],
  [4, 7],
  [1, 8],
  [4, 8],
];

const nodeColors: Record<string, string> = {
  origin: "fill-accent",
  claim: "fill-sage",
  conversation: "fill-dark-surface stroke-dark-muted",
};

export default function NarrativeNetwork() {
  return (
    <svg
      className="narrative-network block w-full"
      viewBox="0 0 520 460"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="network-orbit stroke-dark-border [stroke-dasharray:2_8]"
        cx="250"
        cy="230"
        r="178"
      />
      <circle
        className="network-orbit stroke-dark-border [stroke-dasharray:2_8]"
        cx="250"
        cy="230"
        r="110"
      />
      {edges.map(([a, b]) => (
        <line
          className="network-edge stroke-dark-muted/40 stroke-[1.5]"
          key={`${a}-${b}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
        />
      ))}
      <circle
        className="network-pulse origin-[250px_230px] stroke-accent opacity-40 motion-safe:animate-signal"
        cx="250"
        cy="230"
        r="58"
      />
      {nodes.map((node, i) => (
        <g key={i}>
          <circle
            className={nodeColors[node.type]}
            cx={node.x}
            cy={node.y}
            r={node.r}
          />
          <circle
            className="node-center fill-inverse"
            cx={node.x}
            cy={node.y}
            r={i === 0 ? 5 : 2}
          />
        </g>
      ))}
    </svg>
  );
}
