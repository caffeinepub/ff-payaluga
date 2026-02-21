import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import TournamentPasswordGuard from '../components/admin/TournamentPasswordGuard';
import AccessDeniedScreen from '../components/admin/AccessDeniedScreen';
import MatchManagement from '../components/admin/MatchManagement';
import JoinRequestsList from '../components/admin/JoinRequestsList';
import TournamentConfig from '../components/admin/TournamentConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Users, Settings } from 'lucide-react';

const SESSION_KEY = 'tnff_admin_role';

export default function TournamentAdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorLoading } = useActor();
  const [isValidatingRole, setIsValidatingRole] = useState(true);
  const [roleValid, setRoleValid] = useState(false);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/login' });
    }
  }, [identity, navigate]);

  // Validate admin role with backend on mount
  useEffect(() => {
    const validateAdminRole = async () => {
      const timestamp = new Date().toISOString();
      
      if (!actor || actorLoading) {
        console.log(`[${timestamp}] TournamentAdminPage - Waiting for actor initialization`);
        return;
      }

      const sessionRole = sessionStorage.getItem(SESSION_KEY);
      console.log(`[${timestamp}] TournamentAdminPage - Validating admin role. Session role:`, sessionRole);

      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log(`[${timestamp}] TournamentAdminPage - Backend validation result:`, { isAdmin });

        if (isAdmin) {
          // Ensure session storage is in sync
          if (sessionRole !== 'admin') {
            console.log(`[${timestamp}] TournamentAdminPage - Syncing session storage with backend role`);
            sessionStorage.setItem(SESSION_KEY, 'admin');
          }
          setRoleValid(true);
        } else {
          // Backend says not admin, clear stale session
          console.warn(`[${timestamp}] TournamentAdminPage - Backend validation failed, clearing stale session`);
          if (sessionRole) {
            sessionStorage.removeItem(SESSION_KEY);
          }
          setRoleValid(false);
        }
      } catch (error: any) {
        console.error(`[${timestamp}] TournamentAdminPage - Role validation error:`, error);
        setRoleValid(false);
      } finally {
        setIsValidatingRole(false);
      }
    };

    if (identity && actor && !actorLoading) {
      validateAdminRole();
    }
  }, [actor, actorLoading, identity]);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if role validation completed and role is invalid
  if (!isValidatingRole && !roleValid && !actorLoading) {
    return <AccessDeniedScreen />;
  }

  return (
    <TournamentPasswordGuard>
      {(actorLoading || isValidatingRole) ? (
        <div className="min-h-screen flex items-center justify-center bg-gaming-texture">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isValidatingRole ? 'Validating admin access...' : 'Loading...'}
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gaming-texture">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-ff-orange mb-2 flex items-center">
                <Trophy className="mr-3" size={36} />
                Tournament Management Portal
              </h1>
              <p className="text-muted-foreground">Manage tournament matches, join requests, and configuration</p>
            </div>

            <Tabs defaultValue="matches" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="matches" className="flex items-center gap-2">
                  <Trophy size={18} />
                  Matches
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <Users size={18} />
                  Join Requests
                </TabsTrigger>
                <TabsTrigger value="config" className="flex items-center gap-2">
                  <Settings size={18} />
                  Configuration
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matches">
                <MatchManagement />
              </TabsContent>

              <TabsContent value="requests">
                <JoinRequestsList />
              </TabsContent>

              <TabsContent value="config">
                <TournamentConfig />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </TournamentPasswordGuard>
  );
}
