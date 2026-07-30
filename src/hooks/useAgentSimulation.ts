'use client';

import { useState, useCallback, useRef } from 'react';
import { AgentInfo, AgentStatusType } from '@/types';
import { AGENTS } from '@/data/mockData';

interface UseAgentSimulationReturn {
  agents: AgentInfo[];
  isRunning: boolean;
  isComplete: boolean;
  startSimulation: () => void;
  reset: () => void;
}

export function useAgentSimulation(onComplete?: () => void): UseAgentSimulationReturn {
  const [agents, setAgents] = useState<AgentInfo[]>(AGENTS.map(a => ({ ...a, status: 'pending' })));
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const setAgentStatus = useCallback((id: string, status: AgentStatusType) => {
    setAgents(prev =>
      prev.map(agent => (agent.id === id ? { ...agent, status } : agent))
    );
  }, []);

  const startSimulation = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setIsComplete(false);
    setAgents(AGENTS.map(a => ({ ...a, status: 'pending' })));

    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    let cumulativeDelay = 0;

    AGENTS.forEach((agent, index) => {
      // Start this agent
      const startTimeout = setTimeout(() => {
        setAgentStatus(agent.id, 'running');
      }, cumulativeDelay);
      timeoutsRef.current.push(startTimeout);

      cumulativeDelay += agent.durationMs;

      // Complete this agent
      const completeTimeout = setTimeout(() => {
        setAgentStatus(agent.id, 'completed');

        // If last agent, trigger completion
        if (index === AGENTS.length - 1) {
          const finalTimeout = setTimeout(() => {
            setIsRunning(false);
            setIsComplete(true);
            onComplete?.();
          }, 600);
          timeoutsRef.current.push(finalTimeout);
        }
      }, cumulativeDelay);
      timeoutsRef.current.push(completeTimeout);

      // Small gap between agents
      cumulativeDelay += 400;
    });
  }, [isRunning, setAgentStatus, onComplete]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setAgents(AGENTS.map(a => ({ ...a, status: 'pending' })));
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  return { agents, isRunning, isComplete, startSimulation, reset };
}
