import { createContext, useContext, useState, useCallback } from 'react';
import WorkLightbox from './WorkLightbox';

// Shared work-detail overlay. Both the museum grids and the 3D cosmos call
// openWork(w) — one detail view, two ways in.
const Ctx = createContext(null);

export const usePortfolio = () => useContext(Ctx);

export function PortfolioProvider({ children }) {
  const [work, setWork] = useState(null);
  const openWork = useCallback(w => setWork(w), []);
  const closeWork = useCallback(() => setWork(null), []);
  return (
    <Ctx.Provider value={{ openWork, closeWork }}>
      {children}
      {work && <WorkLightbox work={work} onClose={closeWork} />}
    </Ctx.Provider>
  );
}
