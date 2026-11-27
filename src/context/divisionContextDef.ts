import { createContext } from 'react';
import type { DivisionMeta, DivisionSlug } from '../types/app.types';

export type FeatureTab = 'overview' | 'toolkits' | 'opportunities' | 'community' | 'summits' | 'pricing';

export interface DivisionContextType {
  currentDivision: DivisionSlug;
  divisionMeta: DivisionMeta;
  setDivision: (slug: DivisionSlug) => void;
  allDivisions: DivisionMeta[];
  registeredDivisions: DivisionMeta[];
  unregisteredDivisions: DivisionMeta[];
  isJoined: (slug: DivisionSlug) => boolean;
  isExploring: boolean;
  activeFeatureTab: FeatureTab;
  setActiveFeatureTab: (tab: FeatureTab) => void;
}

export const DivisionContext = createContext<DivisionContextType | undefined>(undefined);
