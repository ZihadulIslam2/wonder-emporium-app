import Svg, {
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Path,
  Ellipse,
} from "react-native-svg";

const COLORS = {
  red: "#E74C3C",
  orange: "#E67E22",
  yellow: "#F1C40F",
  green: "#2ECC71",
  blue: "#3498DB",
  purple: "#9B59B6",
  leaf: "#27AE60",
  leafLight: "#A8E6CF",
};

export function BookStackIllustration({
  width = 280,
  height = 260,
}: {
  width?: number;
  height?: number;
}) {
  const cx = width / 2;
  const baseY = height - 50;

  const books = [
    {
      color: COLORS.red,
      width: 80,
      height: 14,
      x: cx - 40,
      y: baseY - 0,
      rotation: -2,
    },
    {
      color: COLORS.orange,
      width: 90,
      height: 16,
      x: cx - 45,
      y: baseY - 14,
      rotation: 1,
    },
    {
      color: COLORS.yellow,
      width: 85,
      height: 12,
      x: cx - 42,
      y: baseY - 28,
      rotation: -1,
    },
    {
      color: COLORS.green,
      width: 95,
      height: 18,
      x: cx - 47,
      y: baseY - 42,
      rotation: 2,
    },
    {
      color: COLORS.blue,
      width: 75,
      height: 14,
      x: cx - 37,
      y: baseY - 58,
      rotation: -3,
    },
    {
      color: COLORS.purple,
      width: 88,
      height: 16,
      x: cx - 44,
      y: baseY - 74,
      rotation: 1,
    },
  ];

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={COLORS.leafLight} stopOpacity="0.6" />
          <Stop offset="1" stopColor={COLORS.leaf} stopOpacity="0.3" />
        </LinearGradient>
      </Defs>

      {/* Top-left leaf */}
      <G opacity={0.5}>
        <Path
          d={`M20,40 Q10,20 30,5 Q35,15 25,30 Q30,35 20,40Z`}
          fill="url(#leafGrad)"
        />
        <Path
          d={`M20,40 Q28,25 35,30 Q30,38 20,40Z`}
          fill={COLORS.leafLight}
          opacity={0.4}
        />
      </G>

      {/* Top-right leaf */}
      <G opacity={0.5}>
        <Path
          d={`M${width - 20},30 Q${width - 10},15 ${width - 30},5 Q${width - 35},15 ${width - 25},25 Q${width - 30},30 ${width - 20},30Z`}
          fill="url(#leafGrad)"
        />
      </G>

      {/* Books stack */}
      {books.map((book, i) => (
        <G
          key={i}
          rotation={book.rotation}
          origin={`${cx}, ${book.y + book.height / 2}`}
        >
          <Rect
            x={book.x}
            y={book.y}
            width={book.width}
            height={book.height}
            rx={3}
            ry={3}
            fill={book.color}
            opacity={0.9}
          />
          {/* Book spine line */}
          <Rect
            x={book.x + 4}
            y={book.y + 2}
            width={book.width - 8}
            height={2}
            fill="rgba(255,255,255,0.3)"
            rx={1}
          />
        </G>
      ))}

      {/* Shadow under books */}
      <Ellipse cx={cx} cy={baseY + 8} rx={55} ry={6} fill="rgba(0,0,0,0.08)" />

      {/* Bottom-left leaf */}
      <G opacity={0.4}>
        <Path
          d={`M15,${height - 30} Q5,${height - 15} 20,${height - 10} Q30,${height - 20} 15,${height - 30}Z`}
          fill="url(#leafGrad)"
        />
      </G>
    </Svg>
  );
}
