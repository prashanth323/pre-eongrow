import React, { useState } from 'react';
import { DIVISIONS_CATALOG } from '../lib/divisions';
import type { DivisionSlug } from '../types/app.types';
import { DivisionContext, type FeatureTab } from './divisionContextDef';
import { useAuth } from './useAuth';

export const DivisionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile } = useAuth();
  const [activeDivision, setActiveDivision] = useState<DivisionSlug>(
    profile?.currentDivision || 'student'
  );
  const [activeFeatureTab, setActiveFeatureTab] = useState<FeatureTab>('overview');

  const handleSetDivision = (slug: DivisionSlug) => {
    setActiveDivision(slug);
    setActiveFeatureTab('overview');
    if (profile) {
      updateProfile({ currentDivision: slug });
    }
  };

  const isJoined = (slug: DivisionSlug) => {
    return Boolean(profile?.joinedDivisions?.includes(slug));
  };

  const currentMeta = DIVISIONS_CATALOG[activeDivision] || DIVISIONS_CATALOG.student;
  const all = Object.values(DIVISIONS_CATALOG);
  const registeredDivisions = all.filter((d) => isJoined(d.slug));
  const unregisteredDivisions = all.filter((d) => !isJoined(d.slug));
  const isExploring = !isJoined(activeDivision);

  return (
    <DivisionContext.Provider
      value={{
        currentDivision: activeDivision,
        divisionMeta: currentMeta,
        setDivision: handleSetDivision,
        allDivisions: all,
        registeredDivisions,
        unregisteredDivisions,
        isJoined,
        isExploring,
        activeFeatureTab,
        setActiveFeatureTab,
      }}
    >
      {children}
    </DivisionContext.Provider>
  );
};
