'use client';

import PageDwellTimeListener from '../components/ui/page-dwell-time-listener';
// BookmarkPromptContainer import removed as it's now handled by BookmarkProvider

export default function ClientComponents() {
  return (
    <>
      <PageDwellTimeListener />
      {/* BookmarkPromptContainer removed to avoid duplicate prompt rendering */}
    </>
  );
}
