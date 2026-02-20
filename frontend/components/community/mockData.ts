export type Role = 'student' | 'faculty' | 'admin' | 'bot';

export interface User {
    id: string;
    name: string;
    avatar: string;
    role: Role;
    xp: number;
}

export interface AnnouncementData {
    title: string;
    description: string;
    imageUrl?: string;
    tag: string;
    tagColor?: string;
}

export interface Message {
    id: string;
    channelId: string;
    userId: string;
    content: string;
    timestamp: string;
    reactions: Record<string, number>; // emoji -> count
    announcement?: AnnouncementData;
}

export interface Channel {
    id: string;
    name: string;
    type: 'public' | 'announcement';
    allowedRoles: Role[]; // Roles that can post
}

export const CURRENT_USER: User = {
    id: 'current-user',
    name: 'Arena User',
    avatar: 'AU',
    role: 'student',
    xp: 1500,
};

export const MOCK_USERS: User[] = [
    CURRENT_USER,
    { id: 'bot', name: 'COA Bot', avatar: '🤖', role: 'bot', xp: 999999 },
    { id: 'u1', name: 'Dr. Sarah Smith', avatar: 'SS', role: 'faculty', xp: 5000 },
    { id: 'u2', name: 'John Doe', avatar: 'JD', role: 'student', xp: 3200 },
    { id: 'u3', name: 'Alice Cooper', avatar: 'AC', role: 'student', xp: 2800 },
    { id: 'u4', name: 'Mike Ross', avatar: 'MR', role: 'student', xp: 2100 },
    { id: 'u5', name: 'Rachel Zane', avatar: 'RZ', role: 'student', xp: 1900 },
    { id: 'u6', name: 'Harvey Specter', avatar: 'HS', role: 'student', xp: 4500 },
];

export const CHANNELS: Channel[] = [
    {
        id: 'announcements',
        name: 'announcements',
        type: 'announcement',
        allowedRoles: ['faculty', 'admin', 'bot']
    },
    {
        id: 'lounge',
        name: 'student-lounge',
        type: 'public',
        allowedRoles: ['student', 'faculty', 'admin', 'bot']
    },
];

export const INITIAL_MESSAGES: Message[] = [
    {
        id: 'm1',
        channelId: 'announcements',
        userId: 'bot',
        content: '',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        reactions: { '🚀': 45, '🔥': 20 },
        announcement: {
            title: 'New Game Mode Unlocked: CPU Builder',
            description: 'The long-awaited CPU Builder/Simulator is now live! Design your own datapath and control unit. Complete the tutorial to earn the "Architect" badge.',
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000',
            tag: 'New Feature',
            tagColor: 'bg-green-500'
        }
    },
    {
        id: 'm2',
        channelId: 'announcements',
        userId: 'bot',
        content: '',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        reactions: { '🏆': 32, '💪': 15 },
        announcement: {
            title: 'Monthly Leaderboard Reset',
            description: 'The monthly competitive season has ended. Congratulations to the top 3 performers! All monthly XP has been archived and season levels reset.',
            imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=1000',
            tag: 'Competition',
            tagColor: 'bg-yellow-500'
        }
    },
    {
        id: 'm3',
        channelId: 'announcements',
        userId: 'u1',
        content: '',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        reactions: { '🤖': 25, '📈': 18 },
        announcement: {
            title: 'AI & Tech Job Market Update',
            description: 'Analysis of Q1 2026 trends shows a 40% increase in demand for Computer Architecture specialists in AI hardware firms. Check the resources tab for the full report.',
            imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000',
            tag: 'Career Insights',
            tagColor: 'bg-blue-500'
        }
    },
    {
        id: 'm4',
        channelId: 'lounge',
        userId: 'u2',
        content: 'Has anyone claimed the "Architect" badge yet? The control unit level is insane!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        reactions: { '👀': 3 },
    },
    {
        id: 'm5',
        channelId: 'lounge',
        userId: 'u3',
        content: 'I\'m stuck on the ALU design part. Can someone help?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        reactions: { '👍': 1 },
    },
];
