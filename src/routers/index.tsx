import { createElement, lazy } from 'react';
import { createHashRouter } from 'react-router-dom';

const router = createHashRouter([
  {
    path: '/',
    element: createElement(lazy(() => import('@/pages/home'))),
  },
  {
    path: '/marquee',
    element: createElement(lazy(() => import('@/pages/marquee'))),
  },
]);

export default router;
