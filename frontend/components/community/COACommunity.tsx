
"use client"

import { useState, useMemo } from "react";
import { ChannelSidebar } from "./ChannelSidebar";
import { ChatPanel } from "./ChatPanel";
import { Leaderboard } from "./Leaderboard";
import {
    CHANNELS,
    INITIAL_MESSAGES,
    MOCK_USERS,
    CURRENT_USER,
    Message,
    User
} from "./mockData";

export function COACommunity() {
    const [selectedChannelId, setSelectedChannelId] = useState(CHANNELS[1].id); // Default to Lounge
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);

    const selectedChannel = CHANNELS.find(c => c.id === selectedChannelId) || CHANNELS[0];

    // Helper map for O(1) user lookup
    const usersMap = useMemo(() => {
        return users.reduce((acc, user) => ({ ...acc, [user.id]: user }), {} as Record<string, User>);
    }, [users]);

    // Filter messages for current channel
    const channelMessages = messages.filter(m => m.channelId === selectedChannelId);

    const handleSendMessage = (content: string) => {
        const newMessage: Message = {
            id: `m-${Date.now()}`,
            channelId: selectedChannelId,
            userId: CURRENT_USER.id,
            content,
            timestamp: new Date().toISOString(),
            reactions: {}
        };

        setMessages(prev => [...prev, newMessage]);

        // Give XP to current user (+5 per message)
        setUsers(prev => prev.map(user => {
            if (user.id === CURRENT_USER.id) {
                return { ...user, xp: user.xp + 5 };
            }
            return user;
        }));
    };

    const handleReaction = (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const currentCount = msg.reactions?.[emoji] || 0;
                return {
                    ...msg,
                    reactions: {
                        ...msg.reactions,
                        [emoji]: currentCount + 1
                    }
                };
            }
            return msg;
        }));
    }

    const handleChallenge = () => {
        // 1. Pick random opponent (not current user, not bot)
        const validOpponents = users.filter(u => u.id !== CURRENT_USER.id && u.role !== 'bot' && u.role !== 'faculty');
        if (validOpponents.length === 0) return;

        const opponent = validOpponents[Math.floor(Math.random() * validOpponents.length)];

        // 2. Determine winner (50/50 for now)
        const currentUserWins = Math.random() > 0.5;
        const winner = currentUserWins ? CURRENT_USER : opponent;
        const xpGain = 50;

        // 3. Post system message
        const duelMessage: Message = {
            id: `duel-${Date.now()}`,
            channelId: 'lounge',
            userId: 'bot',
            content: `⚔️ **Duel Result**\n\n**${CURRENT_USER.name}** challenged **${opponent.name}** to a rapid-fire quiz!\n\n🏆 Winner: **${winner.name}** (+${xpGain} XP)\n*The duel involved 5 questions on Pipeline Hazards.*`,
            timestamp: new Date().toISOString(),
            reactions: { '🔥': 1, '👏': 1 }
        };

        setMessages(prev => [...prev, duelMessage]);

        // 4. Update XP
        setUsers(prev => prev.map(u => {
            if (u.id === winner.id) {
                return { ...u, xp: u.xp + xpGain };
            }
            return u;
        }));
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] min-h-[500px] border border-border rounded-xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-md">
            {/* Left Sidebar - Channels */}
            <ChannelSidebar
                selectedChannelId={selectedChannelId}
                onSelectChannel={setSelectedChannelId}
            />

            {/* Center - Chat */}
            <ChatPanel
                channel={selectedChannel}
                messages={channelMessages}
                currentUser={CURRENT_USER}
                onSendMessage={handleSendMessage}
                onReaction={handleReaction}
                onChallenge={handleChallenge}
                usersMap={usersMap}
            />

            {/* Right Sidebar - Leaderboard */}
            <Leaderboard
                users={users}
                currentUserId={CURRENT_USER.id}
            />
        </div>
    );
}
