import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { keepWindowStill } from '@/shared/lib/pageScroll';
import { returnOnHistoryBack } from '@/shared/lib/pageTransition';
import { settleEntrances } from '@/shared/lib/settleEntrances';
import '@/styles/index.css';

settleEntrances();
returnOnHistoryBack();
keepWindowStill();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
