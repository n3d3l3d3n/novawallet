
import React, { useState, useEffect } from 'react';
import { ViewState, Proposal, Asset } from '../types';
import { governanceService } from '../services/governanceService';
import { View, Text, TouchableOpacity, ScrollView, Row } from '../components/native';
import { ChevronLeft, Loader2, Clock, CheckCircle, XCircle, Vote, PieChart } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface GovernanceProps {
  assets: Asset[];
  onNavigate: (view: ViewState) => void;
}

export const Governance: React.FC<GovernanceProps> = ({ assets, onNavigate }) => {
  const [tab, setTab] = useState<'active' | 'closed'>('active');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await governanceService.getProposals(assets);
      setProposals(data);
      setIsLoading(false);
    };
    load();
  }, [assets]);

  const handleVote = async (optionId: string) => {
      if (!selectedProposal) return;
      setIsVoting(true);
      try {
          await governanceService.castVote(selectedProposal.id, optionId, selectedProposal.userVotingPower);
          setVoteSuccess(true);
          
          // Optimistic Update
          setProposals(prev => prev.map(p => {
              if (p.id === selectedProposal.id) {
                  return { ...p, userVotedOptionId: optionId };
              }
              return p;
          }));

          setTimeout(() => {
              setVoteSuccess(false);
              setSelectedProposal(null);
              setIsVoting(false);
          }, 2000);
      } catch (e) {
          setIsVoting(false);
      }
  };

  const filteredProposals = proposals.filter(p => 
      tab === 'active' ? (p.status === 'Active' || p.status === 'Pending') : (p.status === 'Closed' || p.status === 'Passed' || p.status === 'Rejected')
  );

  // --- DETAIL VIEW ---
  if (selectedProposal) {
      const totalVotes = selectedProposal.totalVotes + (selectedProposal.userVotedOptionId ? selectedProposal.userVotingPower : 0); // Simple adjustment for viz
      
      if (voteSuccess) {
          return (
              <View className="flex-1 h-full bg-black items-center justify-center p-6">
                  <View className="w-24 h-24 bg-emerald-500/20 rounded-full items-center justify-center mb-6 animate-bounce">
                      <CheckCircle size={48} className="text-emerald-500" />
                  </View>
                  <Text className="text-2xl font-bold text-white mb-2">Vote Cast!</Text>
                  <Text className="text-slate-400 text-center">
                      You used {selectedProposal.userVotingPower.toFixed(2)} {selectedProposal.assetSymbol} voting power.
                  </Text>
              </View>
          );
      }

      return (
          <View className="flex-1 h-full bg-black">
              <View className="px-4 py-3 flex-row items-center gap-3 bg-background border-b border-white/5">
                  <TouchableOpacity onPress={() => setSelectedProposal(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                      <ChevronLeft size={24} className="text-white" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold truncate max-w-[80%]">{selectedProposal.daoName} Proposal</Text>
              </View>
              
              <ScrollView contentContainerStyle="p-5 pb-24">
                  <Row className="items-center gap-3 mb-4">
                      <View className="w-12 h-12 rounded-full bg-surface border border-white/10 items-center justify-center">
                          <Text className="text-2xl">{selectedProposal.daoIcon}</Text>
                      </View>
                      <View className="flex-1">
                          <Text className="font-bold text-lg leading-snug">{selectedProposal.title}</Text>
                          <Row className="items-center gap-2 mt-1">
                              <View className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedProposal.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                  <Text className="text-current">{selectedProposal.status}</Text>
                              </View>
                              <Text className="text-xs text-slate-500">Ends {new Date(selectedProposal.endDate).toLocaleDateString()}</Text>
                          </Row>
                      </View>
                  </Row>

                  <Text className="text-sm text-slate-300 leading-relaxed mb-6">
                      {selectedProposal.description}
                  </Text>

                  <View className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <Text className="text-xs font-bold text-indigo-300 uppercase mb-1">Your Voting Power</Text>
                      <Text className="text-2xl font-bold text-white">{selectedProposal.userVotingPower.toFixed(4)} {selectedProposal.assetSymbol}</Text>
                      {selectedProposal.userVotingPower === 0 && (
                          <Text className="text-xs text-slate-400 mt-1">You need to hold {selectedProposal.assetSymbol} to vote.</Text>
                      )}
                  </View>

                  <Text className="text-xs font-bold text-slate-500 uppercase mb-3">Current Results</Text>
                  <View className="space-y-4">
                      {selectedProposal.options.map(opt => {
                          const percent = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                          const isSelected = selectedProposal.userVotedOptionId === opt.id;
                          
                          return (
                              <TouchableOpacity 
                                 key={opt.id}
                                 disabled={isVoting || selectedProposal.userVotingPower === 0 || !!selectedProposal.userVotedOptionId}
                                 onPress={() => handleVote(opt.id)}
                                 className={`relative overflow-hidden rounded-xl border ${isSelected ? 'border-emerald-500' : 'border-white/10'} ${selectedProposal.userVotingPower > 0 && !selectedProposal.userVotedOptionId ? 'active:bg-white/5' : ''}`}
                              >
                                  {/* Progress Bar Background */}
                                  <View 
                                     className={`absolute top-0 bottom-0 left-0 opacity-20 ${isSelected ? 'bg-emerald-500' : 'bg-white'}`} 
                                     style={{ width: `${percent}%` }} 
                                  />
                                  
                                  <View className="p-4 flex-row items-center justify-between relative z-10">
                                      <View>
                                          <Text className={`font-bold text-sm ${isSelected ? 'text-emerald-400' : 'text-white'}`}>{opt.label}</Text>
                                          <Text className="text-xs text-slate-400">{opt.votes.toLocaleString()} votes</Text>
                                      </View>
                                      <Text className="font-bold text-sm text-white">{percent.toFixed(1)}%</Text>
                                  </View>
                              </TouchableOpacity>
                          );
                      })}
                  </View>
                  
                  {isVoting && (
                      <Row className="justify-center items-center gap-2 mt-6">
                          <Loader2 className="animate-spin text-emerald-400" size={20} />
                          <Text className="text-emerald-400 font-bold">Signing Vote...</Text>
                      </Row>
                  )}
              </ScrollView>
          </View>
      );
  }

  // --- LIST VIEW ---
  return (
    <View className="flex-1 h-full bg-black">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between z-10 bg-background border-b border-white/5">
        <Row className="items-center gap-3">
            <TouchableOpacity onPress={() => onNavigate(ViewState.HOME)} className="p-2 rounded-full bg-surface border border-white/10">
                <ChevronLeft size={20} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">Governance</Text>
        </Row>
      </View>

      <ScrollView contentContainerStyle="p-5 pb-24">
         {/* Tabs */}
         <Row className="p-1 bg-surface rounded-xl border border-white/5 mb-6">
            <TouchableOpacity 
              onPress={() => setTab('active')}
              className={`flex-1 py-2 items-center rounded-lg ${tab === 'active' ? 'bg-white/10 shadow-sm' : ''}`}
            >
               <Text className={`text-sm font-bold ${tab === 'active' ? 'text-white' : 'text-slate-400'}`}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setTab('closed')}
              className={`flex-1 py-2 items-center rounded-lg ${tab === 'closed' ? 'bg-white/10 shadow-sm' : ''}`}
            >
               <Text className={`text-sm font-bold ${tab === 'closed' ? 'text-white' : 'text-slate-400'}`}>Closed</Text>
            </TouchableOpacity>
         </Row>

         {isLoading ? (
             <View className="items-center py-10">
                 <Loader2 className="animate-spin text-primary" />
             </View>
         ) : (
             <View className="gap-3">
                 {filteredProposals.length === 0 ? (
                     <View className="items-center py-10 border border-dashed border-white/10 rounded-xl">
                        <Vote className="text-slate-600 mb-2" size={32} />
                        <Text className="text-slate-500 text-sm">No proposals found.</Text>
                     </View>
                 ) : (
                     filteredProposals.map(prop => (
                         <Card 
                            key={prop.id} 
                            onClick={() => setSelectedProposal(prop)}
                            className="p-4"
                         >
                             <Row className="justify-between items-start mb-2">
                                 <Row className="items-center gap-2">
                                     <Text className="text-lg">{prop.daoIcon}</Text>
                                     <Text className="font-bold text-xs text-slate-400 uppercase tracking-wider">{prop.daoName}</Text>
                                 </Row>
                                 <View className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${prop.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : prop.status === 'Passed' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'}`}>
                                    <Text className="text-current">{prop.status}</Text>
                                 </View>
                             </Row>
                             <Text className="font-bold text-sm mb-3 line-clamp-2">{prop.title}</Text>
                             
                             <Row className="justify-between items-center border-t border-white/5 pt-3">
                                 <Row className="items-center gap-1">
                                     <Clock size={12} className="text-slate-500" />
                                     <Text className="text-xs text-slate-500">
                                         {prop.status === 'Active' ? `Ends ${new Date(prop.endDate).toLocaleDateString()}` : `Ended ${new Date(prop.endDate).toLocaleDateString()}`}
                                     </Text>
                                 </Row>
                                 {prop.userVotingPower > 0 && (
                                     <Row className="items-center gap-1">
                                         <PieChart size={12} className="text-primary" />
                                         <Text className="text-xs text-primary font-bold">You can vote</Text>
                                     </Row>
                                 )}
                             </Row>
                         </Card>
                     ))
                 )}
             </View>
         )}
      </ScrollView>
    </View>
  );
};
