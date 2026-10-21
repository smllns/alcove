import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { returnOnHistoryBack } from '@/shared/lib/pageTransition';
import { settleEntrances } from '@/shared/lib/settleEntrances';
import '@/styles/index.css';

settleEntrances();
returnOnHistoryBack();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
