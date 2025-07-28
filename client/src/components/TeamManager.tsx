import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusIcon, UserGroupIcon, LinkIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
    joinedAt: string;
  }>;
  referralLink: {
    code: string;
    isActive: boolean;
    expiresAt?: string;
    maxUses?: number;
    currentUses: number;
  };
  settings: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
  };
}

interface TeamManagerProps {
  teams: Team[];
  onTeamCreated: (team: Team) => void;
  onTeamUpdated: (team: Team) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, onTeamCreated, onTeamUpdated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showReferralLink, setShowReferralLink] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post('/api/teams', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Team created successfully!');
      onTeamCreated(response.data.team);
      setIsCreating(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const generateReferralLink = async (teamId: string) => {
    try {
      const response = await axios.post(`/api/teams/${teamId}/referral-link`, {
        expiresInDays: 30,
        maxUses: 10
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setShowReferralLink(response.data.referralLink.fullUrl);
      toast.success('Referral link generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate referral link');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-gray-600">Manage your teams and invite members</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Team
        </button>
      </div>

      {/* Create Team Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Team</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Team name is required' })}
                  className="input-field"
                  placeholder="Enter team name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="input-field"
                  rows={3}
                  placeholder="Enter team description"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('settings.allowMemberInvites')}
                    className="mr-2"
                    defaultChecked
                  />
                  <span className="text-sm">Allow member invites</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team._id} className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">{team.name}</h3>
              </div>
              <button
                onClick={() => generateReferralLink(team._id)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Generate referral link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>

            {team.description && (
              <p className="text-sm text-gray-600 mb-3">{team.description}</p>
            )}

            <div className="space-y-2 text-sm text-gray-500">
              <div>Owner: {team.owner.name}</div>
              <div>Members: {team.members.length}</div>
              <div>Created: {formatDate(team.createdAt)}</div>
            </div>

            {/* Referral Link */}
            {showReferralLink && selectedTeam?._id === team._id && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Referral Link:</span>
                  <button
                    onClick={() => copyToClipboard(showReferralLink)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-blue-700 mt-1 break-all">{showReferralLink}</p>
              </div>
            )}

            {/* Team Actions */}
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setSelectedTeam(team)}
                className="btn-secondary text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-600 mb-4">Create your first team to start collaborating</p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Team
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamManager; 