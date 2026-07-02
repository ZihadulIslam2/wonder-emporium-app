import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
} from "react-native-svg";

const COLORS = {
  stone: "#D5C4A1",
  stoneDark: "#B8A88A",
  red: "#E74C3C",
  blue: "#2980B9",
  green: "#27AE60",
  purple: "#8E44AD",
  orange: "#E67E22",
  leaf: "#27AE60",
  leafLight: "#A8E6CF",
  white: "#FFFFFF",
  black: "#333333",
};

export function BooksDeviceIllustration({
  width = 280,
  height = 260,
}: {
  width?: number;
  height?: number;
}) {
  const cx = width / 2;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={COLORS.leafLight} stopOpacity="0.6" />
          <Stop offset="1" stopColor={COLORS.leaf} stopOpacity="0.3" />
        </LinearGradient>
        <LinearGradient id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COLORS.stone} />
          <Stop offset="1" stopColor={COLORS.stoneDark} />
        </LinearGradient>
      </Defs>

      {/* Top-left leaf */}
      <G opacity={0.5}>
        <Path
          d={`M20,40 Q10,20 30,5 Q35,15 25,30 Q30,35 20,40Z`}
          fill="url(#leafGrad)"
        />
      </G>
      {/* Top-right leaf */}
      <G opacity={0.5}>
        <Path
          d={`M${width - 20},30 Q${width - 10},15 ${width - 30},5 Q${width - 35},15 ${width - 25},25 Q${width - 30},30 ${width - 20},30Z`}
          fill="url(#leafGrad)"
        />
      </G>

      {/* Circular stone platform */}
      <Ellipse
        cx={cx}
        cy={180}
        rx={90}
        ry={30}
        fill="url(#stoneGrad)"
        opacity={0.7}
      />
      <Ellipse
        cx={cx}
        cy={178}
        rx={85}
        ry={26}
        fill={COLORS.stone}
        opacity={0.5}
      />

      {/* Book 1 - standing (blue) */}
      <Rect
        x={cx - 50}
        y={128}
        width={18}
        height={50}
        rx={2}
        fill={COLORS.blue}
      />
      <Rect
        x={cx - 48}
        y={130}
        width={14}
        height={4}
        rx={1}
        fill="rgba(255,255,255,0.2)"
      />

      {/* Book 2 - standing (red) */}
      <Rect
        x={cx - 30}
        y={133}
        width={15}
        height={45}
        rx={2}
        fill={COLORS.red}
      />

      {/* Book 3 - open book */}
      <G rotation={-5} origin={`${cx + 10}, ${165}`}>
        <Path
          d={`M${cx + 5},165 L${cx + 5},145 Q${cx + 15},150 ${cx + 25},148 L${cx + 25},168 Q${cx + 15},168 ${cx + 5},165Z`}
          fill={COLORS.green}
          opacity={0.8}
        />
        {/* Book title "big deal" */}
        <Rect
          x={cx + 8}
          y={150}
          width={14}
          height={3}
          rx={1}
          fill={COLORS.white}
          opacity={0.7}
        />
        <Rect
          x={cx + 8}
          y={155}
          width={10}
          height={2}
          rx={1}
          fill={COLORS.white}
          opacity={0.5}
        />
      </G>

      {/* Book 4 - lying (purple) */}
      <Rect
        x={cx + 15}
        y={155}
        width={40}
        height={14}
        rx={2}
        fill={COLORS.purple}
        rotation={8}
        origin={`${cx + 15}, 155`}
      />

      {/* Book 5 - small (orange) */}
      <Rect
        x={cx - 60}
        y={140}
        width={12}
        height={38}
        rx={2}
        fill={COLORS.orange}
        rotation={-10}
        origin={`${cx - 60}, 140`}
      />

      {/* Smartphone */}
      <G>
        {/* Phone body */}
        <Rect
          x={cx + 30}
          y={115}
          width={36}
          height={64}
          rx={6}
          fill={COLORS.black}
        />
        <Rect
          x={cx + 32}
          y={119}
          width={32}
          height={56}
          rx={4}
          fill={COLORS.white}
        />
        {/* Screen content - music player */}
        <Rect
          x={cx + 34}
          y={126}
          width={28}
          height={28}
          rx={3}
          fill="#F0F0F0"
        />
        {/* Album art placeholder */}
        <Circle cx={cx + 48} y={140} r={8} fill={COLORS.blue} opacity={0.3} />
        {/* Play button */}
        <Path
          d={`M${cx + 44},135 L${cx + 52},140 L${cx + 44},145Z`}
          fill={COLORS.blue}
        />
        {/* Progress bar */}
        <Rect x={cx + 34} y={157} width={28} height={3} rx={1.5} fill="#DDD" />
        <Rect
          x={cx + 34}
          y={157}
          width={14}
          height={3}
          rx={1.5}
          fill={COLORS.green}
        />
        {/* Title text */}
        <Rect x={cx + 34} y={162} width={20} height={2} rx={1} fill="#BBB" />
      </G>

      {/* Earbuds */}
      <G opacity={0.8}>
        {/* Left earbud */}
        <Circle
          cx={cx - 5}
          cy={148}
          r={4}
          fill={COLORS.white}
          stroke="#CCC"
          strokeWidth={1}
        />
        {/* Right earbud */}
        <Circle
          cx={cx + 72}
          cy={142}
          r={4}
          fill={COLORS.white}
          stroke="#CCC"
          strokeWidth={1}
        />
        {/* Wire */}
        <Path
          d={`M${cx - 1},150 Q${cx + 10},155 ${cx + 30},152 Q${cx + 50},149 ${cx + 68},144`}
          fill="none"
          stroke="#999"
          strokeWidth={1}
          strokeDasharray="1 2"
        />
      </G>

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
