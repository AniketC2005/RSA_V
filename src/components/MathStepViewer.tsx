import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export interface ViewerStep {
  step: number;
  title: string;
  expression: string;
  details: string;
  result?: string;
  highlight?: boolean;
}

interface MathStepViewerProps {
  steps: ViewerStep[];
  title?: string;
  subtitle?: string;
  onStepChange?: (index: number) => void;
}

export const MathStepViewer: React.FC<MathStepViewerProps> = ({
  steps,
  title = 'Step-by-Step Calculation Trace',
  subtitle,
  onStepChange,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex);
    }
  }, [currentStepIndex, onStepChange]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, playbackSpeed]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const currentStep = steps[currentStepIndex];

  if (!steps || steps.length === 0) {
    return (
      <div className="p-6 text-center text-lab-muted bg-lab-secondary/50 rounded-xl border border-lab-border text-sm">
        No calculation steps available. Execute key generation or encryption to generate steps.
      </div>
    );
  }

  return (
    <div className="bg-lab-secondary/90 rounded-2xl border border-lab-border p-5 space-y-4">
      {/* Header with Title and Step Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-lab-border/60 gap-2">
        <div>
          <h4 className="font-semibold text-sm sm:text-base text-lab-text flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-lab-accent/10 text-lab-accent border border-lab-accent/30">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </h4>
          {subtitle && <p className="text-xs text-lab-muted mt-0.5">{subtitle}</p>}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto bg-lab-card p-1 rounded-xl border border-lab-border">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-lab-muted hover:text-lab-text hover:bg-lab-cardHover transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`p-1.5 rounded-lg transition-colors ${
              currentStepIndex === 0
                ? 'text-lab-muted/40 cursor-not-allowed'
                : 'text-lab-muted hover:text-lab-text hover:bg-lab-cardHover'
            }`}
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-lab-accent/20 hover:bg-lab-accent/30 text-lab-accent transition-colors"
            title={isPlaying ? 'Pause' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className={`p-1.5 rounded-lg transition-colors ${
              currentStepIndex === steps.length - 1
                ? 'text-lab-muted/40 cursor-not-allowed'
                : 'text-lab-muted hover:text-lab-text hover:bg-lab-cardHover'
            }`}
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="bg-lab-bg text-[11px] text-lab-muted border border-lab-border rounded px-1.5 py-1 ml-1"
          >
            <option value={1500}>0.7x</option>
            <option value={1000}>1.0x</option>
            <option value={500}>2.0x</option>
            <option value={250}>4.0x</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-lab-bg rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-lab-accent h-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Active Step Spotlight Card */}
      {currentStep && (
        <div className="p-4 rounded-xl bg-lab-card border-2 border-lab-accent/50 shadow-cyan-glow transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-lab-accent font-bold">
              {currentStep.title}
            </span>
            {currentStep.result && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-lab-emerald/10 text-lab-emerald border border-lab-emerald/30">
                Result: {currentStep.result}
              </span>
            )}
          </div>
          <div className="font-mono text-base sm:text-lg text-lab-text py-2 px-3 bg-lab-bg/70 rounded-lg border border-lab-border overflow-x-auto">
            {currentStep.expression}
          </div>
          <p className="text-xs text-lab-muted mt-2.5 leading-relaxed">{currentStep.details}</p>
        </div>
      )}

      {/* Steps Table / Timeline List */}
      <div className="max-h-64 overflow-y-auto rounded-xl border border-lab-border divide-y divide-lab-border/40 font-mono text-xs">
        {steps.map((st, idx) => {
          const isActive = idx === currentStepIndex;
          return (
            <div
              key={st.step || idx}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(idx);
              }}
              className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                isActive
                  ? 'bg-lab-accent/10 border-l-4 border-lab-accent text-lab-text'
                  : 'bg-lab-card/40 hover:bg-lab-card/80 text-lab-muted'
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                    isActive
                      ? 'bg-lab-accent text-lab-bg'
                      : 'bg-lab-secondary text-lab-muted border border-lab-border'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="truncate">
                  <span className="font-semibold block truncate">{st.title}</span>
                  <span className="text-[11px] text-lab-muted/80 truncate block">
                    {st.expression}
                  </span>
                </div>
              </div>
              {st.result && (
                <span className="text-[11px] text-lab-emerald font-bold shrink-0 ml-2">
                  {st.result}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
