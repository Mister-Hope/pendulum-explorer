import React, { useState, useEffect, useRef, useCallback } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { DataDisplay } from "./components/DataDisplay";
import { Visualizer } from "./components/Visualizer";
import {
  SimulationState,
  PhysicsParams,
  SimulationMode,
  VectorConfig,
} from "./types";
import { GRAVITY, DT, MAX_ANGLE_DEG } from "./constants";

const INITIAL_PARAMS: PhysicsParams = {
  mass: 2.0,
  length: 2.0,
  gravity: GRAVITY,
};

const INITIAL_STATE: SimulationState = {
  theta: MAX_ANGLE_DEG * (Math.PI / 180), // Start at 30 degrees
  omega: 0,
  alpha: 0,
  time: 0,
};

// Start with all vectors hidden
const INITIAL_VECTORS: VectorConfig = {
  showForces: false,
  showVelocity: false,
  showAcceleration: false,
};

const App: React.FC = () => {
  const [params, setParams] = useState<PhysicsParams>(INITIAL_PARAMS);
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [mode, setMode] = useState<SimulationMode>(SimulationMode.PAUSED);
  const [vectors, setVectors] = useState<VectorConfig>(INITIAL_VECTORS);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setMode(SimulationMode.PAUSED);
  }, []);

  const updatePhysics = useCallback(
    (
      currentState: SimulationState,
      currentParams: PhysicsParams,
      dt: number,
    ): SimulationState => {
      // Simple Pendulum Equation: alpha = -(g/L) * sin(theta)
      // Using semi-implicit Euler integration for better stability

      const alpha =
        -(currentParams.gravity / currentParams.length) *
        Math.sin(currentState.theta);
      const newOmega = currentState.omega + alpha * dt;
      const newTheta = currentState.theta + newOmega * dt;

      return {
        theta: newTheta,
        omega: newOmega,
        alpha: alpha,
        time: currentState.time + dt,
      };
    },
    [],
  );

  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current !== undefined) {
        // Use fixed time step for physics consistency, but run loop
        // We process only if mode is running or specific pause conditions are active

        setState((prevState) => {
          // If hard paused, don't update
          if (mode === SimulationMode.PAUSED) return prevState;

          // Calculate next step
          const nextState = updatePhysics(prevState, params, DT);

          // Check Pause Conditions
          if (mode === SimulationMode.PAUSE_AT_BOTTOM) {
            // Detect zero crossing of Theta
            if (
              (prevState.theta > 0 && nextState.theta <= 0) ||
              (prevState.theta < 0 && nextState.theta >= 0)
            ) {
              setMode(SimulationMode.PAUSED);
              return { ...nextState, theta: 0 }; // Snap to 0
            }
          }

          if (mode === SimulationMode.PAUSE_AT_TOP) {
            // Detect velocity zero crossing (Turning point) AND we are on the positive side (Right)
            // We define "Right" as theta > 0.
            // Turning point means omega changes sign.

            // Note: omega changes sign at both extremes. We only want right side (positive theta).
            if (prevState.theta > 0.1) {
              // Ensure we aren't near bottom
              if (
                (prevState.omega > 0 && nextState.omega <= 0) ||
                (prevState.omega < 0 && nextState.omega >= 0)
              ) {
                // We reached the peak
                setMode(SimulationMode.PAUSED);
                return { ...nextState, omega: 0 }; // Snap velocity to 0
              }
            }
          }

          return nextState;
        });
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [mode, params, updatePhysics],
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-slate-100 font-sans bg-slate-900">
      {/* Navigation Bar */}
      <header class="px-6 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0 h-16">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          单摆演示教学系统
        </h1>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Controls */}
        <ControlPanel
          params={params}
          setParams={setParams}
          mode={mode}
          setMode={setMode}
          reset={reset}
          vectors={vectors}
          setVectors={setVectors}
        />

        {/* Center: Visualization */}
        <Visualizer state={state} params={params} vectors={vectors} />

        {/* Right: Data */}
        <DataDisplay state={state} params={params} />
      </div>
    </div>
  );
};

export default App;
