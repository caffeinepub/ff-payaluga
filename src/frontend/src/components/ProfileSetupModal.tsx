import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import GamingButton from './common/GamingButton';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import type { UserProfile } from '../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const profile: UserProfile = {
      userId: BigInt(0),
      name: name.trim(),
      email: email.trim(),
    };

    saveProfile.mutate(profile);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md bg-card border-ff-orange/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ff-orange">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Welcome to FF PAYALUGA! Please provide your details to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-muted-foreground/20 focus:border-ff-orange"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-muted-foreground/20 focus:border-ff-orange"
              required
            />
          </div>
          <GamingButton
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending || !name.trim() || !email.trim()}
          >
            {saveProfile.isPending ? 'Saving...' : 'Complete Registration'}
          </GamingButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
