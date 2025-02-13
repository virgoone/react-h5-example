import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { QueryProvider } from './providers/query-provider';
import router from './routers';

import './styles/global.css';

// import 'virtual:uno.css'

const container = document.querySelector('#root') as Element;
const root = createRoot(container);

root.render(
  <QueryProvider>
    <RouterProvider router={router} />
  </QueryProvider>,
);
