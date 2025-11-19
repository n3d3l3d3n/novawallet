
import React, { useState, useEffect } from 'react';
import { ViewState, User, Friend, Group } from '../types';
import { authService } from '../services/authService';
import { BayMarket } from './BayMarket';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Row } from '../components/native';
import { Search, UserPlus, QrCode, Users, Plus, ShoppingBag, Check, X, Loader2, Lock, Globe } from 'lucide-react';

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

  const handleAddFriend = async () => {
    setIsLoading(true);
    setAddError('');
    setAddSuccess('');

    try {
      await authService.addFriend(user.id, addInput);
      setAddSuccess(`Successfully added ${addInput}`);
      setAddInput('');
      const updatedUser = await authService.getCurrentUser();
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
      <View className="flex-1 h-full relative">
         <Row className="items-center justify-between mt-4 px-5">
          <Text className="text-2xl font-bold">Social Hub</Text>
          <Row className="gap-2">
             <TouchableOpacity className="p-2 bg-surface border border-white/10 rounded-full items-center justify-center">
               <QrCode size={20} className="text-slate-400" />
             </TouchableOpacity>
          </Row>
        </Row>

        {/* Navigation Tabs */}
        <View className="px-5 mt-4">
          <Row className="p-1 bg-surface rounded-xl border border-white/5">
            <TouchableOpacity 
              onPress={() => setActiveTab('chats')}
              className="flex-1 py-2 items-center rounded-lg"
            >
              <Text className="text-xs font-medium text-slate-400">Chats</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('groups')}
              className="flex-1 py-2 items-center rounded-lg"
            >
              <Text className="text-xs font-medium text-slate-400">Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('market')}
              className="flex-1 py-2 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-sm"
            >
              <Row className="items-center gap-1">
                <ShoppingBag size={12} className="text-white" />
                <Text className="text-xs font-medium text-white">BayMarket</Text>
              </Row>
            </TouchableOpacity>
          </Row>
        </View>

        {/* Market Component */}
        <BayMarket user={user} />
      </View>
    );
  }

  return (
    <View className="flex-1 h-full p-5 pb-24 relative">
      {/* Header */}
      <Row className="items-center justify-between mt-4 mb-6">
        <Text className="text-2xl font-bold">Social Hub</Text>
        <Row className="gap-2">
           {activeTab === 'chats' ? (
             <TouchableOpacity onPress={() => setIsAddingFriend(true)} className="p-2 bg-primary/20 rounded-full items-center justify-center">
               <UserPlus size={20} className="text-primary" />
             </TouchableOpacity>
           ) : (
             <TouchableOpacity onPress={() => setIsCreatingGroup(true)} className="p-2 bg-primary/20 rounded-full items-center justify-center">
               <Plus size={20} className="text-primary" />
             </TouchableOpacity>
           )}
           <TouchableOpacity className="p-2 bg-surface border border-white/10 rounded-full items-center justify-center">
             <QrCode size={20} className="text-slate-400" />
           </TouchableOpacity>
        </Row>
      </Row>

      {/* Tabs */}
      <Row className="p-1 bg-surface rounded-xl border border-white/5 mb-6">
        <TouchableOpacity 
          onPress={() => setActiveTab('chats')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'chats' ? 'bg-white/10 shadow-sm' : ''}`}
        >
          <Text className={`text-xs font-medium ${activeTab === 'chats' ? 'text-white' : 'text-slate-400'}`}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('groups')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'groups' ? 'bg-white/10 shadow-sm' : ''}`}
        >
          <Text className={`text-xs font-medium ${activeTab === 'groups' ? 'text-white' : 'text-slate-400'}`}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('market')}
          className="flex-1 py-2 items-center justify-center gap-1 rounded-lg"
        >
          <Row className="items-center gap-1">
            <ShoppingBag size={12} className="text-slate-400" />
            <Text className="text-xs font-medium text-slate-400">BayMarket</Text>
          </Row>
        </TouchableOpacity>
      </Row>

      {/* Search */}
      <View className="relative mb-6">
        <Search className="absolute left-4 top-3 text-slate-400 z-10" size={18} />
        <TextInput 
          placeholder={activeTab === 'chats' ? "Search friends..." : "Search groups..."}
          className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white"
        />
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
      {activeTab === 'chats' ? (
        <View>
          {/* Online Users */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pb-2">
             {friends.filter(f => f.status === 'online').length === 0 && (
                 <Text className="text-xs text-slate-500 italic px-2">No friends online</Text>
             )}
             {friends.filter(f => f.status === 'online').map(friend => (
               <View key={friend.id} className="items-center gap-1 mr-4 min-w-[60px]">
                 <View className="relative">
                    <View className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 items-center justify-center">
                      <View className="w-full h-full rounded-full bg-surface items-center justify-center">
                        <Text className="text-xs font-bold">{friend.name[0]}</Text>
                      </View>
                    </View>
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background rounded-full items-center justify-center">
                       <View className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    </View>
                 </View>
                 <Text className="text-[10px] font-medium text-center">{friend.name.split(' ')[0]}</Text>
               </View>
             ))}
          </ScrollView>

          <View className="gap-2">
            {friends.length === 0 ? (
              <View className="items-center py-12 opacity-50">
                <Users size={48} className="text-slate-600 mb-3" />
                <Text className="text-sm text-slate-400">No friends yet.</Text>
                <TouchableOpacity onPress={() => setIsAddingFriend(true)}>
                  <Text className="text-primary text-sm mt-2 font-bold">Add a friend</Text>
                </TouchableOpacity>
              </View>
            ) : (
              friends.map(friend => (
                <Card 
                  key={friend.id} 
                  onClick={() => onSelectChat(friend.id, false)}
                  className="p-4"
                >
                  <Row className="items-center gap-4">
                    <View className="relative">
                      <View className="w-12 h-12 rounded-full bg-slate-700 items-center justify-center">
                        <Text className="font-bold text-lg">{friend.name[0]}</Text>
                      </View>
                      <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background rounded-full items-center justify-center">
                         <View className={`w-2.5 h-2.5 rounded-full ${getStatusColor(friend.status)}`} />
                      </View>
                    </View>
                    <View className="flex-1">
                      <Row className="justify-between items-baseline">
                         <Text className="font-bold text-sm">{friend.name}</Text>
                         <Text className="text-[10px] text-slate-500">{friend.lastSeen}</Text>
                      </Row>
                      <Text className="text-xs text-slate-400 mt-1">Tap to start chat</Text>
                    </View>
                  </Row>
                </Card>
              ))
            )}
          </View>
        </View>
      ) : (
        <View>
          {/* My Groups */}
          <View className="mb-6">
             <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">My Groups</Text>
             {groups.length === 0 ? (
               <View className="p-4 bg-surface/30 rounded-xl items-center">
                  <Text className="text-sm text-slate-500">You haven't joined any groups yet.</Text>
               </View>
             ) : (
               <View className="gap-2">
               {groups.map(group => (
                  <Card 
                    key={group.id} 
                    onClick={() => onSelectChat(group.id, true)}
                    className="p-4"
                  >
                    <Row className="items-center gap-4">
                      <View className="w-12 h-12 rounded-xl bg-surface border border-white/10 items-center justify-center">
                         <Text className="text-2xl">{group.icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Row className="justify-between items-baseline">
                           <Text className="font-bold text-sm">{group.name}</Text>
                           <Text className="text-[10px] text-slate-500">
                             {group.lastMessageTime ? new Date(group.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                           </Text>
                        </Row>
                        <Text className="text-xs text-slate-400 mt-1">{group.lastMessage || 'No messages yet'}</Text>
                      </View>
                    </Row>
                  </Card>
               ))}
               </View>
             )}
          </View>

          {/* Discover Public Groups */}
          <View>
             <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">Discover</Text>
             <View className="gap-2">
             {publicGroups.filter(pg => !groups.find(g => g.id === pg.id)).map(group => (
                <Card key={group.id} className="p-4">
                   <Row className="items-center justify-between">
                     <Row className="items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-indigo-500/10 items-center justify-center">
                           <Text className="text-xl">{group.icon}</Text>
                        </View>
                        <View>
                           <Text className="font-bold text-sm">{group.name}</Text>
                           <Text className="text-xs text-slate-500">{group.members.length} members</Text>
                        </View>
                     </Row>
                     <TouchableOpacity 
                       onPress={() => handleJoinGroup(group.id)}
                       className="px-3 py-1.5 bg-surface border border-white/10 rounded-lg items-center"
                     >
                        <Text className="text-xs font-bold">Join</Text>
                     </TouchableOpacity>
                   </Row>
                </Card>
             ))}
             </View>
          </View>
        </View>
      )}
      </ScrollView>

      {/* Add Friend Modal */}
      {isAddingFriend && (
        <View className="absolute inset-0 bg-black/90 z-50 items-center justify-center p-4">
           <View className="bg-surface w-full max-w-sm rounded-2xl border border-white/10 p-6 relative shadow-2xl">
              <TouchableOpacity onPress={() => setIsAddingFriend(false)} className="absolute right-4 top-4">
                  <X size={20} className="text-slate-400" />
              </TouchableOpacity>
              <Text className="text-xl font-bold mb-4">Add Contact</Text>
              
              <View className="space-y-4">
                 <TextInput 
                    autoFocus
                    value={addInput}
                    onChange={(e) => setAddInput(e.target.value)}
                    placeholder="@username or +123..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white"
                 />
                 {addError ? <Text className="text-red-400 text-xs">{addError}</Text> : null}
                 {addSuccess ? <Text className="text-emerald-400 text-xs">{addSuccess}</Text> : null}
                 <TouchableOpacity 
                    onPress={handleAddFriend} 
                    disabled={isLoading || !addInput} 
                    className="w-full bg-primary items-center justify-center py-3 rounded-xl"
                 >
                   {isLoading ? <Loader2 className="animate-spin text-white" size={16} /> : <Text className="text-white font-bold">Add User</Text>}
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      )}

      {/* Create Group Modal */}
      {isCreatingGroup && (
        <View className="absolute inset-0 bg-black/90 z-50 items-center justify-center p-4">
           <View className="bg-surface w-full max-w-sm rounded-2xl border border-white/10 p-6 relative shadow-2xl max-h-[90vh]">
              <TouchableOpacity onPress={() => setIsCreatingGroup(false)} className="absolute right-4 top-4">
                  <X size={20} className="text-slate-400" />
              </TouchableOpacity>
              <Text className="text-xl font-bold mb-6">Create Group</Text>
              
              <ScrollView className="space-y-4">
                 {/* Icon & Name */}
                 <Row className="gap-3 mb-4">
                    <TextInput 
                       value={groupIcon}
                       onChange={(e) => setGroupIcon(e.target.value)}
                       className="w-14 text-center bg-black/30 border border-white/10 rounded-xl py-3 text-2xl"
                       maxLength={2}
                    />
                    <TextInput 
                       value={groupName}
                       onChange={(e) => setGroupName(e.target.value)}
                       placeholder="Group Name"
                       className="flex-1 bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white"
                    />
                 </Row>

                 {/* Type */}
                 <Row className="gap-3 mb-4">
                    <TouchableOpacity 
                      onPress={() => setGroupType('private')}
                      className={`flex-1 p-3 rounded-xl border ${groupType === 'private' ? 'bg-primary/20 border-primary' : 'bg-black/30 border-white/10'}`}
                    >
                       <Lock size={20} className={groupType === 'private' ? 'text-primary' : 'text-slate-400'} />
                       <View className="mt-2">
                          <Text className={`text-xs font-bold ${groupType === 'private' ? 'text-primary' : 'text-slate-400'}`}>Private</Text>
                          <Text className="text-[10px] opacity-70 text-slate-500">Invite only</Text>
                       </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setGroupType('public')}
                      className={`flex-1 p-3 rounded-xl border ${groupType === 'public' ? 'bg-primary/20 border-primary' : 'bg-black/30 border-white/10'}`}
                    >
                       <Globe size={20} className={groupType === 'public' ? 'text-primary' : 'text-slate-400'} />
                       <View className="mt-2">
                          <Text className={`text-xs font-bold ${groupType === 'public' ? 'text-primary' : 'text-slate-400'}`}>Public</Text>
                          <Text className="text-[10px] opacity-70 text-slate-500">Anyone can join</Text>
                       </View>
                    </TouchableOpacity>
                 </Row>

                 {/* Members */}
                 <View className="space-y-2">
                    <Text className="text-xs font-bold text-slate-500 uppercase">Add Members</Text>
                    <ScrollView className="max-h-40 pr-2">
                       {friends.map(friend => (
                          <TouchableOpacity 
                             key={friend.id}
                             onPress={() => toggleMemberSelection(friend.id)}
                             className={`flex-row items-center justify-between p-3 rounded-xl border mb-2 ${selectedMembers.includes(friend.id) ? 'bg-primary/10 border-primary' : 'bg-black/30 border-white/5'}`}
                          >
                             <Row className="items-center gap-3">
                                <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center">
                                   <Text className="text-xs font-bold">{friend.name[0]}</Text>
                                </View>
                                <Text className="text-sm font-medium">{friend.name}</Text>
                             </Row>
                             {selectedMembers.includes(friend.id) && <Check size={16} className="text-primary" />}
                          </TouchableOpacity>
                       ))}
                       {friends.length === 0 && <Text className="text-xs text-slate-500 text-center py-2">No friends to add.</Text>}
                    </ScrollView>
                 </View>

                 <TouchableOpacity 
                   onPress={handleCreateGroup}
                   disabled={isLoading || !groupName}
                   className="w-full bg-primary items-center justify-center py-3 rounded-xl mt-4"
                 >
                   {isLoading ? <Loader2 className="animate-spin text-white" size={16} /> : <Text className="text-white font-bold">Create Group</Text>}
                 </TouchableOpacity>
              </ScrollView>
           </View>
        </View>
      )}
    </View>
  );
};
