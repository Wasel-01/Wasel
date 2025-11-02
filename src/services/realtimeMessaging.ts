import { supabase } from '../utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'location' | 'system';
  created_at: string;
  read_by?: string[];
}

export const realtimeMessaging = {
  // Send message
  async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'image' | 'location' = 'text') {
    if (!supabase) throw new Error('Messaging not configured');

    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: type,
      read_by: [senderId]
    }).select().single();

    if (error) throw error;
    return data;
  },

  // Subscribe to conversation messages
  subscribeToConversation(conversationId: string, onMessage: (message: Message) => void): RealtimeChannel | null {
    if (!supabase) return null;

    return supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload: any) => {
          if (payload.new) {
            onMessage(payload.new as Message);
          }
        }
      )
      .subscribe();
  },

  // Mark messages as read
  async markAsRead(messageIds: string[], userId: string) {
    if (!supabase) return;

    for (const messageId of messageIds) {
      await supabase.rpc('add_user_to_read_by', {
        message_id: messageId,
        user_id: userId
      });
    }
  },

  // Get conversation messages
  async getMessages(conversationId: string, limit = 50) {
    if (!supabase) throw new Error('Messaging not configured');

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  },

  // Get user conversations
  async getConversations(userId: string) {
    if (!supabase) throw new Error('Messaging not configured');

    const { data, error } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at, sender_id')
      .or(`sender_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation and get latest message
    const conversations = new Map();
    data?.forEach(msg => {
      if (!conversations.has(msg.conversation_id)) {
        conversations.set(msg.conversation_id, msg);
      }
    });

    return Array.from(conversations.values());
  },

  // Subscribe to typing indicator
  subscribeToTyping(conversationId: string, onTyping: (userId: string, isTyping: boolean) => void): RealtimeChannel | null {
    if (!supabase) return null;

    return supabase
      .channel(`typing:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = supabase.channel(`typing:${conversationId}`).presenceState();
        Object.entries(state).forEach(([userId, presence]: [string, any]) => {
          onTyping(userId, presence[0]?.typing || false);
        });
      })
      .subscribe();
  },

  // Send typing indicator
  async sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean) {
    if (!supabase) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    await channel.track({ userId, typing: isTyping });
  },

  // Unsubscribe from channel
  unsubscribe(channel: RealtimeChannel) {
    channel.unsubscribe();
  }
};
