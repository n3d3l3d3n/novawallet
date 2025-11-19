
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, MessageCircle, HelpCircle, ChevronDown, Send, LifeBuoy } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';

interface SupportProps {
  onNavigate: (view: ViewState) => void;
}

export const Support: React.FC<SupportProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [tickets, setTickets] = useState(authService.getSupportTickets());
  const [tab, setTab] = useState<'faq' | 'tickets'>('faq');

  const faqs = [
    { q: 'How do I verify my identity?', a: 'Go to Profile > Legal & Compliance and follow the KYC steps to upload your ID document.' },
    { q: 'Are my funds secure?', a: 'Yes. We use cold storage wallets and never share your private keys. You are the sole owner of your assets.' },
    { q: 'How long do withdrawals take?', a: 'Crypto withdrawals are instant. Fiat bank transfers typically take 1-3 business days.' },
    { q: 'Can I recover my account without a phrase?', a: 'No. Your recovery phrase is the only way to restore your wallet. We do not store it.' },
  ];

  const handleSubmitTicket = async () => {
     if (!ticketSubject) return;
     await authService.createSupportTicket(ticketSubject);
     setTicketSubject('');
     setTickets(authService.getSupportTickets());
     alert('Ticket submitted!');
  };

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Help & Support</Text>
        </Row>

        <Row className="p-1 bg-surface rounded-xl border border-white/5 mb-6">
          <TouchableOpacity 
            onPress={() => setTab('faq')}
            className={`flex-1 py-2 items-center rounded-lg ${tab === 'faq' ? 'bg-white/10' : ''}`}
          >
            <Text className={`text-xs font-medium ${tab === 'faq' ? 'text-white' : 'text-slate-400'}`}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setTab('tickets')}
            className={`flex-1 py-2 items-center rounded-lg ${tab === 'tickets' ? 'bg-white/10' : ''}`}
          >
            <Text className={`text-xs font-medium ${tab === 'tickets' ? 'text-white' : 'text-slate-400'}`}>My Tickets</Text>
          </TouchableOpacity>
        </Row>

        {tab === 'faq' ? (
          <View className="space-y-3">
             {faqs.map((faq, i) => (
                <Card key={i} className="overflow-hidden">
                   <TouchableOpacity 
                     onPress={() => setOpenFaq(openFaq === i ? null : i)}
                     className="w-full p-4"
                   >
                      <Row className="items-center justify-between">
                          <Text className="font-bold text-sm">{faq.q}</Text>
                          <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                      </Row>
                   </TouchableOpacity>
                   {openFaq === i && (
                      <View className="px-4 pb-4 pt-0 border-t border-white/5 mt-2 pt-2">
                         <Text className="text-xs text-slate-300 leading-relaxed">{faq.a}</Text>
                      </View>
                   )}
                </Card>
             ))}
             
             <View className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl items-center">
                <LifeBuoy className="text-indigo-400 mb-2" size={24} />
                <Text className="font-bold text-sm mb-1">Still need help?</Text>
                <Text className="text-xs text-slate-400 mb-3">Our support team is available 24/7.</Text>
                <TouchableOpacity onPress={() => setTab('tickets')} className="px-4 py-2 bg-indigo-500 rounded-lg">
                   <Text className="text-white text-xs font-bold">Contact Us</Text>
                </TouchableOpacity>
             </View>
          </View>
        ) : (
          <View className="space-y-6">
             <View className="space-y-3">
                <Text className="text-xs font-bold text-slate-500 uppercase ml-1">New Ticket</Text>
                <Row className="gap-2">
                   <TextInput 
                     value={ticketSubject}
                     onChange={(e) => setTicketSubject(e.target.value)}
                     placeholder="Describe your issue..."
                     className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                   />
                   <TouchableOpacity onPress={handleSubmitTicket} className="bg-primary px-4 rounded-xl items-center justify-center">
                      <Send size={18} className="text-white" />
                   </TouchableOpacity>
                </Row>
             </View>

             <View className="space-y-3">
                <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Your Tickets</Text>
                {tickets.length === 0 && <Text className="text-xs text-slate-500 text-center py-4">No tickets yet.</Text>}
                {tickets.map(t => (
                   <Card key={t.id} className="p-4">
                      <Row className="items-center justify-between">
                         <View>
                            <Text className="font-bold text-sm mb-1">{t.subject}</Text>
                            <Text className="text-[10px] text-slate-500">ID: {t.id} • {new Date(t.lastUpdate).toLocaleDateString()}</Text>
                         </View>
                         <View className={`px-2 py-1 rounded ${t.status === 'open' ? 'bg-emerald-500/10' : 'bg-slate-700'}`}>
                            <Text className={`text-[10px] font-bold uppercase ${t.status === 'open' ? 'text-emerald-400' : 'text-slate-400'}`}>
                               {t.status}
                            </Text>
                         </View>
                      </Row>
                   </Card>
                ))}
             </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
