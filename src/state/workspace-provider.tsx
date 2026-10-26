import { useMemo, useReducer, type ReactNode } from 'react'
import { createInitialState, workspaceReducer } from './reducer'
import { WorkspaceContext } from './workspace-context'

interface WorkspaceProviderProps {
  children: ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, () => createInitialState())

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
