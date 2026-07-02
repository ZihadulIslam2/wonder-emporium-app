import Svg, {
  Circle,
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
  Line,
} from "react-native-svg";

const COLORS = {
  skin: "#FDDCB5",
  hair: "#5D4037",
  sweater: "#E8D5B7",
  pants: "#4CAF50",
  book: "#388E3C",
  bookPage: "#FFF8E1",
  headphones: "#616161",
  headphonePad: "#757575",
  leaf: "#27AE60",
  leafLight: "#A8E6CF",
};

export function ReaderIllustration({
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

      {/* Shadow under person */}
      <Ellipse cx={cx} cy={210} rx={50} ry={8} fill="rgba(0,0,0,0.08)" />

      {/* Headphones band */}
      <Path
        d={`M${cx - 25},95 Q${cx - 30},75 ${cx},70 Q${cx + 30},75 ${cx + 25},95`}
        fill="none"
        stroke={COLORS.headphones}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Headphone left pad */}
      <Rect
        x={cx - 30}
        y={92}
        width={10}
        height={18}
        rx={5}
        fill={COLORS.headphonePad}
      />
      {/* Headphone right pad */}
      <Rect
        x={cx + 20}
        y={92}
        width={10}
        height={18}
        rx={5}
        fill={COLORS.headphonePad}
      />

      {/* Hair */}
      <Path
        d={`M${cx - 22},90 Q${cx - 30},70 ${cx},65 Q${cx + 30},70 ${cx + 22},90 Q${cx + 20},85 ${cx},82 Q${cx - 20},85 ${cx - 22},90Z`}
        fill={COLORS.hair}
      />

      {/* Head */}
      <Circle cx={cx} cy={95} r={20} fill={COLORS.skin} />

      {/* Eyes */}
      <Circle cx={cx - 7} cy={93} r={2.5} fill={COLORS.hair} />
      <Circle cx={cx + 7} cy={93} r={2.5} fill={COLORS.hair} />

      {/* Smile */}
      <Path
        d={`M${cx - 6},102 Q${cx},108 ${cx + 6},102`}
        fill="none"
        stroke={COLORS.hair}
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* Body / Sweater */}
      <Path
        d={`M${cx - 25},112 L${cx - 28},145 Q${cx},155 ${cx + 28},145 L${cx + 25},112Z`}
        fill={COLORS.sweater}
      />

      {/* Collar */}
      <Path
        d={`M${cx - 5},112 L${cx},118 L${cx + 5},112Z`}
        fill={COLORS.sweater}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1}
      />

      {/* Left leg (cross-legged) */}
      <Path
        d={`M${cx - 10},143 L${cx - 35},175 Q${cx - 20},185 ${cx - 5},180 L${cx - 8},155Z`}
        fill={COLORS.pants}
      />
      {/* Right leg (cross-legged) */}
      <Path
        d={`M${cx + 10},143 L${cx + 35},175 Q${cx + 20},185 ${cx + 5},180 L${cx + 8},155Z`}
        fill={COLORS.pants}
      />

      {/* Left arm */}
      <Path
        d={`M${cx - 25},118 Q${cx - 40},135 ${cx - 25},155`}
        fill="none"
        stroke={COLORS.sweater}
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Left hand */}
      <Circle cx={cx - 25} cy={155} r={6} fill={COLORS.skin} />

      {/* Right arm holding book */}
      <Path
        d={`M${cx + 25},118 Q${cx + 35},130 ${cx + 20},148`}
        fill="none"
        stroke={COLORS.sweater}
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Right hand */}
      <Circle cx={cx + 20} cy={148} r={6} fill={COLORS.skin} />

      {/* Book */}
      <G rotation={-10} origin={`${cx - 15}, ${155}`}>
        {/* Book left page */}
        <Path
          d={`M${cx - 30},155 L${cx - 30},138 Q${cx - 15},140 ${cx - 5},145 L${cx - 5},162 Q${cx - 15},160 ${cx - 30},155Z`}
          fill={COLORS.book}
        />
        {/* Book right page */}
        <Path
          d={`M${cx - 5},162 L${cx - 5},145 Q${cx + 5},142 ${cx + 15},140 L${cx + 15},157 Q${cx + 5},160 ${cx - 5},162Z`}
          fill={COLORS.bookPage}
        />
        {/* Book spine */}
        <Line
          x1={cx - 5}
          y1={145}
          x2={cx - 5}
          y2={162}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={1.5}
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
