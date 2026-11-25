import { createBrowserRouter, Navigate } from 'react-router-dom';
import InspectionPage from '../features/inspection/InspectionPage';

/**
 * Only the inspection feature exists for now, so "/" and any unknown URL
 * land on it. When AppLayout is built, wrap these routes in it:
 *   { element: <AppLayout />, children: [ ...routes ] }
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/inspection" replace /> },
  { path: '/inspection', element: <InspectionPage /> },
  { path: '*', element: <Navigate to="/inspection" replace /> },
]);