import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MemberInviteModal } from '@/components/organization/MemberInviteModal';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Crown, 
  Shield, 
  User,
  Mail,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'active' | 'inactive';
  joined_at: string;
  users: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
}

interface Invite {
  id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  expires_at: string;
  created_at: string;
}

const getRoleConfig = (role: string) => {
  switch (role) {
    case 'owner':
      return { icon: Crown, label: 'Owner', variant: 'default' as const };
    case 'admin':
      return { icon: Shield, label: 'Admin', variant: 'secondary' as const };
    default:
      return { icon: User, label: 'Member', variant: 'outline' as const };
  }
};

export const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Fetch organization data
  const { data: organization, mutate: mutateOrg } = useSWR(
    user ? 'organization' : null,
    async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  );

  // Fetch members
  const { data: members, mutate: mutateMembers } = useSWR(
    organization ? `org-members-${organization.id}` : null,
    async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          users:user_id (
            email,
            user_metadata
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Member[];
    }
  );

  // Fetch pending invites
  const { data: invites, mutate: mutateInvites } = useSWR(
    organization ? `org-invites-${organization.id}` : null,
    async () => {
      const { data, error } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organization.id)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invite[];
    }
  );

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The member has been removed from the organization.",
      });

      mutateMembers();
    } catch (error) {
      toast({
        title: "Error removing member",
        description: "There was an error removing the member.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Invite revoked",
        description: "The invitation has been revoked.",
      });

      mutateInvites();
    } catch (error) {
      toast({
        title: "Error revoking invite",
        description: "There was an error revoking the invitation.",
        variant: "destructive",
      });
    }
  };

  if (!organization) {
    return (
      <div className="container mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Users className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-6 text-xl font-semibold">No organization found</h3>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            You're not part of any organization yet. Create one or ask to be invited.
          </p>
        </motion.div>
      </div>
    );
  }

  const isOwner = organization.owner_id === user?.id;
  const currentMember = members?.find(m => m.user_id === user?.id);
  const canManageMembers = isOwner || currentMember?.role === 'admin';

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization settings and members
            </p>
          </div>
          {canManageMembers && (
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">{organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="font-mono text-sm">{organization.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{new Date(organization.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Members & Invites */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({members?.length || 0})
                </CardTitle>
                <CardDescription>
                  People who have access to this organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members?.map((member) => {
                    const roleConfig = getRoleConfig(member.role);
                    const RoleIcon = roleConfig.icon;
                    
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.users.user_metadata?.full_name || member.users.email}
                            </p>
                            <p className="text-sm text-muted-foreground">{member.users.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={roleConfig.variant}>
                            <RoleIcon className="mr-1 h-3 w-3" />
                            {roleConfig.label}
                          </Badge>
                          {canManageMembers && member.role !== 'owner' && member.user_id !== user?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Pending Invites */}
            {invites && invites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Pending Invites ({invites.length})
                  </CardTitle>
                  <CardDescription>
                    Invitations that haven't been accepted yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invites.map((invite) => {
                      const roleConfig = getRoleConfig(invite.role);
                      const RoleIcon = roleConfig.icon;
                      
                      return (
                        <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Invited {new Date(invite.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={roleConfig.variant}>
                              <RoleIcon className="mr-1 h-3 w-3" />
                              {roleConfig.label}
                            </Badge>
                            {canManageMembers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeInvite(invite.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>

      <MemberInviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        organizationId={organization.id}
        onSuccess={() => {
          mutateInvites();
          setShowInviteModal(false);
        }}
      />
    </div>
  );
};