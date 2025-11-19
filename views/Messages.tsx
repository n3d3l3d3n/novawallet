
import React, { useState, useEffect } from 'react';
import { ViewState, User, Friend, Group } from '../types';
import { authService } from '../services/authService';
import { BayMarket } from './BayMarket';
import { Card } from '../components/ui/Card';
import { Search, UserPlus, QrCode, Users, Plus, Hash, Lock, Globe, X, Loader2, Check, ShoppingBag } from 'lucide-react';

interface MessagesProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onSelectChat: (id: string, isGroup: boolean) => void;
}

export const Messages: React.FC<MessagesProps> = ({ user, onNavigate, onSelectChat }) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'market'>('chats');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  
  // Modal States
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Add Friend Inputs
  const [addInput, setAddInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Create Group Inputs
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'private' | 'public'>('private');
  const [groupIcon, setGroupIcon] = useState('💬');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    refreshData();
  }, [user.friends]);

  const refreshData = () => {
    setFriends(authService.getFriends(user.friends));
    setGroups(authService.getGroups(user.id));
    setPublicGroups(authService.getPublicGroups());
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAddError('');
    setAddSuccess('');

    try {
      await authService.addFriend(user.id, addInput);
      setAddSuccess(`Successfully added ${addInput}`);
      setAddInput('');
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
         setFriends(authService.getFriends(updatedUser.friends));
      }
    } catch (err: any) {
      setAddError(err.message || 'Could not add user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName) return;
    setIsLoading(true);
    try {
      await authService.createGroup(user.id, groupName, groupType, selectedMembers, groupIcon);
      setIsCreatingGroup(false);
      setGroupName('');
      setSelectedMembers([]);
      refreshData();
      setActiveTab('groups');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await authService.joinGroup(user.id, groupId);
      refreshData();
      onSelectChat(groupId, true);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMemberSelection = (friendId: string) => {
    if (selectedMembers.includes(friendId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== friendId));
    } else {
      setSelectedMembers([...selectedMembers, friendId]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  // Render BayMarket View
  if (activeTab === 'market') {
    return (
      <div className="h-full relative">
         <div className="flex items-center justify-between mt-4 px-5">
          <h1 className="text-2xl font-bold">Social Hub</h1>
          <div className="flex gap-2">
             <button className="p-2 bg-surface border border-white/10 rounded-full text-slate-400 hover:text-white">
               <QrCode size={20} />
             </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 mt-4">
          <div className="flex p-1 bg-surface rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('chats')}
              className="flex-1 py-2 text-xs font-medium rounded-lg transition-all text-slate-400"
            >
              Chats
            </button>
            <button 
              onClick={() => setActiveTab('groups')}
              className="flex-1 py-2 text-xs font-medium rounded-lg transition-all text-slate-400"
            >
              Groups
            </button>
            <button 
              onClick={() => setActiveTab('market')}
              className="flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
            >
              <ShoppingBag size={12} /> BayMarket
            </button>
          </div>
        </div>

        {/* Market Component */}
        <BayMarket user={user} />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 pb-24 animate-in fade-in duration-500 relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-2xl font-bold">Social Hub</h1>
        <div className="flex gap-2">
           {activeTab === 'chats' ? (
             <button onClick={() => setIsAddingFriend(true)} className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors">
               <UserPlus size={20} />
             </button>
           ) : (
             <button onClick={() => setIsCreatingGroup(true)} className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors">
               <Plus size={20} />
             </button>
           )}
           <button className="p-2 bg-surface border border-white/10 rounded-full text-slate-400 hover:text-white">
             <QrCode size={20} />
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface rounded-xl border border-white/5">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'chats' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400'}`}
        >
          Chats
        </button>
        <button 
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'groups' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400'}`}
        >
          Groups
        </button>
        <button 
          onClick={() => setActiveTab('market')}
          className="flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 text-slate-400"
        >
          <ShoppingBag size={12} /> BayMarket
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder={activeTab === 'chats' ? "Search friends..." : "Search groups..."}
          className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
        />
      </div>

      {/* Content */}
      {activeTab === 'chats' ? (
        <>
          {/* Online Users */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
             {friends.filter(f => f.status === 'online').length === 0 && (
                 <p className="text-xs text-slate-500 italic px-2">No friends online</p>
             )}
             {friends.filter(f => f.status === 'online').map(friend => (
               <div key={friend.id} className="flex flex-col items-center gap-1 min-w-[60px]">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xs font-bold">
                        {friend.name[0]}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center">
                       <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                 </div>
                 <span className="text-[10px] font-medium truncate w-full text-center">{friend.name.split(' ')[0]}</span>
               </div>
             ))}
          </div>

          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-12 opacity-50">
                <Users size={48} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm">No friends yet.</p>
                <button onClick={() => setIsAddingFriend(true)} className="text-primary text-sm mt-2 hover:underline">Add a friend</button>
              </div>
            ) : (
              friends.map(friend => (
                <Card 
                  key={friend.id} 
                  onClick={() => onSelectChat(friend.id, false)}
                  className="p-4 flex items-center gap-4 hover:bg-surface/80 active:scale-98 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg">
                      {friend.name[0]}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center`}>
                       <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(friend.status)}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                       <h4 className="font-bold text-sm truncate">{friend.name}</h4>
                       <span className="text-[10px] text-slate-500">{friend.lastSeen}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">Tap to start chat</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* My Groups */}
          <div className="space-y-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">My Groups</h3>
             {groups.length === 0 ? (
               <div className="p-4 bg-surface/30 rounded-xl text-center text-sm text-slate-500">
                  You haven't joined any groups yet.
               </div>
             ) : (
               groups.map(group => (
                  <Card 
                    key={group.id} 
                    onClick={() => onSelectChat(group.id, true)}
                    className="p-4 flex items-center gap-4 hover:bg-surface/80 active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-2xl shadow-sm">
                       {group.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                         <h4 className="font-bold text-sm truncate">{group.name}</h4>
                         <span className="text-[10px] text-slate-500">
                           {group.lastMessageTime ? new Date(group.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                         </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{group.lastMessage || 'No messages yet'}</p>
                    </div>
                  </Card>
               ))
             )}
          </div>

          {/* Discover Public Groups */}
          <div className="space-y-2 mt-4">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">Discover</h3>
             {publicGroups.filter(pg => !groups.find(g => g.id === pg.id)).map(group => (
                <Card key={group.id} className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl">
                         {group.icon}
                      </div>
                      <div>
                         <h4 className="font-bold text-sm">{group.name}</h4>
                         <p className="text-xs text-slate-500">{group.members.length} members</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleJoinGroup(group.id)}
                     className="px-3 py-1.5 bg-surface border border-white/10 rounded-lg text-xs font-bold hover:bg-white hover:text-black transition-colors"
                   >
                      Join
                   </button>
                </Card>
             ))}
          </div>
        </>
      )}

      {/* Add Friend Modal */}
      {isAddingFriend && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-surface w-full max-w-sm rounded-2xl border border-white/10 p-6 relative shadow-2xl">
              <button onClick={() => setIsAddingFriend(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-xl font-bold mb-4">Add Contact</h2>
              <form onSubmit={handleAddFriend} className="space-y-4">
                 <input 
                    autoFocus
                    type="text" 
                    value={addInput}
                    onChange={(e) => setAddInput(e.target.value)}
                    placeholder="@username or +123..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                 />
                 {addError && <p className="text-red-400 text-xs">{addError}</p>}
                 {addSuccess && <p className="text-emerald-400 text-xs">{addSuccess}</p>}
                 <button type="submit" disabled={isLoading || !addInput} className="w-full bg-primary text-white font-bold py-3 rounded-xl">
                   {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Add User'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isCreatingGroup && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-surface w-full max-w-sm rounded-2xl border border-white/10 p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <button onClick={() => setIsCreatingGroup(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-xl font-bold mb-6">Create Group</h2>
              
              <div className="space-y-4">
                 {/* Icon & Name */}
                 <div className="flex gap-3">
                    <input 
                       type="text" 
                       value={groupIcon}
                       onChange={(e) => setGroupIcon(e.target.value)}
                       className="w-14 text-center bg-black/30 border border-white/10 rounded-xl py-3 text-2xl focus:outline-none"
                       maxLength={2}
                    />
                    <input 
                       type="text" 
                       value={groupName}
                       onChange={(e) => setGroupName(e.target.value)}
                       placeholder="Group Name"
                       className="flex-1 bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                 </div>

                 {/* Type */}
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setGroupType('private')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-2 ${groupType === 'private' ? 'bg-primary/20 border-primary text-primary' : 'bg-black/30 border-white/10 text-slate-400'}`}
                    >
                       <Lock size={20} />
                       <div>
                          <div className="text-xs font-bold">Private</div>
                          <div className="text-[10px] opacity-70">Invite only</div>
                       </div>
                    </button>
                    <button 
                      onClick={() => setGroupType('public')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-2 ${groupType === 'public' ? 'bg-primary/20 border-primary text-primary' : 'bg-black/30 border-white/10 text-slate-400'}`}
                    >
                       <Globe size={20} />
                       <div>
                          <div className="text-xs font-bold">Public</div>
                          <div className="text-[10px] opacity-70">Anyone can join</div>
                       </div>
                    </button>
                 </div>

                 {/* Members */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Add Members</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                       {friends.map(friend => (
                          <div 
                             key={friend.id}
                             onClick={() => toggleMemberSelection(friend.id)}
                             className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedMembers.includes(friend.id) ? 'bg-primary/10 border-primary' : 'bg-black/30 border-white/5 hover:bg-white/5'}`}
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                                   {friend.name[0]}
                                </div>
                                <span className="text-sm font-medium">{friend.name}</span>
                             </div>
                             {selectedMembers.includes(friend.id) && <Check size={16} className="text-primary" />}
                          </div>
                       ))}
                       {friends.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No friends to add.</p>}
                    </div>
                 </div>

                 <button 
                   onClick={handleCreateGroup}
                   disabled={isLoading || !groupName}
                   className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-4 disabled:opacity-50"
                 >
                   {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Create Group'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
