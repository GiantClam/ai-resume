'use client';

import PageDwellTimeListener from '../components/ui/page-dwell-time-listener';
import BookmarkPromptContainer from '../components/ui/bookmark-prompt-container';

export default function ClientComponents() {
  return (
    <>
      <PageDwellTimeListener />
      <BookmarkPromptContainer />
    </>
  );
}
