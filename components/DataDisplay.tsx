import React from "react";
import { SimulationState, PhysicsParams } from "../types";
import { GRAVITY, COLORS } from "../constants";
import { MathJaxLabel } from "./MathJaxLabel";

interface DataDisplayProps {
  state: SimulationState;
  params: PhysicsParams;
}

// Extract Row component outside to prevent re-creation on every render (fixes flickering)
const Row = ({
  label,
  symbol,
  value,
  unit,
  colorClass,
  hexColor,
}: {
  label: string;
  symbol: string;
  value: number;
  unit: string;
  colorClass?: string;
  hexColor?: string;
}) => (
  <div className="flex items-center justify-between border-b border-slate-700 py-4 last:border-0">
    <div className="flex items-center gap-3">
      {/* Symbol with MathJax */}
      <div className="w-8 flex justify-center">
        <MathJaxLabel latex={symbol} className="text-xl" color={hexColor} />
      </div>
      <span className="text-slate-300 text-lg">{label}</span>
    </div>
    <div className="text-right">
      <span
        className={`text-2xl font-mono font-bold ${colorClass || "text-slate-100"}`}
      >
        {value.toFixed(2)}
      </span>
      <span className="text-slate-500 ml-2 text-lg">{unit}</span>
    </div>
  </div>
);

export const DataDisplay: React.FC<DataDisplayProps> = ({ state, params }) => {
  // Calculations
  const period = 2 * Math.PI * Math.sqrt(params.length / GRAVITY);

  // Tangential Acceleration: a_t = g * sin(theta)
  const a_t = Math.abs(GRAVITY * Math.sin(state.theta));

  // Radial (Centripetal) Acceleration: a_n = L * omega^2
  const a_n = params.length * (state.omega * state.omega);

  // Total Acceleration
  const a_total = Math.sqrt(a_t * a_t + a_n * a_n);

  // Velocity: v = L * omega
  const v = Math.abs(state.omega * params.length);

  // Tension: T = m(g*cos(theta) + a_n)
  const tension = params.mass * (GRAVITY * Math.cos(state.theta) + a_n);

  // Gravity: G = mg
  const gravityForce = params.mass * GRAVITY;

  return (
    <div className="h-full flex flex-col p-6 bg-slate-800 border-l border-slate-700 shadow-xl w-[420px] overflow-y-auto">
      <div className="border-b border-slate-600 pb-4 mb-2">
        <h2 className="text-2xl font-bold text-white mb-2">实时数据</h2>
        <p className="text-slate-400 text-sm">单摆运动物理量</p>
      </div>

      <div className="flex-1">
        <Row
          label="理论周期"
          symbol="T"
          value={period}
          unit="s"
          colorClass="text-white"
          hexColor="#ffffff"
        />
        <div className="h-8"></div> {/* Spacer */}
        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">
          动力学
        </h3>
        <Row
          label="重力"
          symbol="G"
          value={gravityForce}
          unit="N"
          colorClass="text-blue-400"
          hexColor={COLORS.forceGravity}
        />
        <Row
          label="绳拉力"
          symbol="F_{\text{T}}"
          value={tension}
          unit="N"
          colorClass="text-pink-400"
          hexColor={COLORS.forceTension}
        />
        <div className="h-8"></div> {/* Spacer */}
        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">
          运动学
        </h3>
        <Row
          label="线速度"
          symbol="v"
          value={v}
          unit="m/s"
          colorClass="text-green-400"
          hexColor={COLORS.velocity}
        />
        <Row
          label="合加速度"
          symbol="a"
          value={a_total}
          unit="m/s²"
          colorClass="text-amber-400"
          hexColor={COLORS.accelTotal}
        />
        <Row
          label="切向加速度"
          symbol="a_t"
          value={a_t}
          unit="m/s²"
          colorClass="text-purple-400"
          hexColor={COLORS.accelTangential}
        />
        <Row
          label="径向加速度"
          symbol="a_n"
          value={a_n}
          unit="m/s²"
          colorClass="text-red-400"
          hexColor={COLORS.accelRadial}
        />
      </div>

      <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <h4 className="text-slate-400 text-sm mb-2 font-semibold">图例说明</h4>
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>
              <MathJaxLabel latex="v" /> 速度
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            <span>
              <MathJaxLabel latex="a" /> 合加速度
            </span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span>
              <MathJaxLabel latex="a_t" /> 切向
            </span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>
              <MathJaxLabel latex="a_n" /> 径向
            </span>
          </div>
          <div className="flex items-center gap-2 text-pink-400">
            <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
            <span>
              <MathJaxLabel latex="F_T" /> 拉力
            </span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>
              <MathJaxLabel latex="G" /> 重力
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
