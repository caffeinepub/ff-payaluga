import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import WalletDeposit from './pages/WalletDeposit';
import TournamentPage from './pages/TournamentPage';
import AdminPanel from './pages/AdminPanel';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginRegister,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletDeposit,
});

const tournamentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tournament',
  component: TournamentPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  walletRoute,
  tournamentRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
