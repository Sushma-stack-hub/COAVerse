import { useState, useRef, useEffect } from "react";
import { Send, ThumbsUp, Flame, Star, Shield, Lock, Swords } from "lucide-react";
import { Channel, Message, User, AnnouncementData } from "./mockData";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatPanelProps {
    channel: Channel;
    messages: Message[];
    currentUser: User;
    onSendMessage: (content: string) => void;
    onReaction: (messageId: string, emoji: string) => void;
    onChallenge?: () => void;
    usersMap: Record<string, User>;
}

export function ChatPanel({ channel, messages, currentUser, onSendMessage, onReaction, onChallenge, usersMap }: ChatPanelProps) {
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const canPost = channel.allowedRoles.includes(currentUser.role);
    const isAnnouncementChannel = channel.type === 'announcement';
    const isLoungeChannel = channel.id === 'lounge';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !canPost) return;
        onSendMessage(inputValue);
        setInputValue("");
    };

    const getRoleBadge = (role: string) => {
        if (role === 'bot') return <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">🤖 BOT</span>;
        if (role === 'faculty') return <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1"><Shield className="h-2 w-2" /> FACULTY</span>;
        if (role === 'admin') return <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">ADMIN</span>;
        return null;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background/50 relative">
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl text-muted-foreground opacity-50">#</span>
                    <div>
                        <h3 className="font-bold text-lg leading-none">{channel.name}</h3>
                        {isAnnouncementChannel && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Lock className="h-3 w-3" /> System Announcements
                            </p>
                        )}
                    </div>
                </div>

                {/* Competition Button - Only in Student Lounge */}
                {isLoungeChannel && onChallenge && (
                    <Button
                        onClick={onChallenge}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all group"
                    >
                        <Swords className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Challenge Random Student
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <div className="space-y-6">
                    <div className="opacity-50 text-center py-10">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">#</span>
                        </div>
                        <h3 className="font-bold text-xl">Welcome to #{channel.name}</h3>
                        <p className="text-muted-foreground">This is the start of the {channel.name} channel.</p>
                    </div>

                    {messages.map((message) => {
                        const user = usersMap[message.userId];
                        const isFacultyOrBot = user?.role === 'faculty' || user?.role === 'bot';
                        const announcement = message.announcement;
                        const isSystemMessage = message.content.includes("Duel Result");

                        // Simple markdown parser for bold text
                        const renderContent = (content: string) => {
                            const parts = content.split(/(\*\*.*?\*\*)/g);
                            return parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i} className="text-primary font-bold">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            });
                        };

                        return (
                            <div
                                key={message.id}
                                className={cn(
                                    "group flex gap-4 p-4 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5 hover:bg-card/50",
                                    isFacultyOrBot ? "bg-primary/5 border border-primary/10" : "border border-transparent"
                                )}
                            >
                                <Avatar className="h-10 w-10 shrink-0 border border-border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                    <AvatarFallback className={cn("font-bold text-xs", isFacultyOrBot && "bg-primary/20 text-primary")}>
                                        {user?.avatar || "??"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className={cn("font-semibold text-sm", isFacultyOrBot ? "text-primary filter drop-shadow-sm" : "text-foreground")}>
                                            {user?.name || "Unknown User"}
                                        </span>
                                        {getRoleBadge(user?.role)}
                                        <span className="text-xs text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* Render Announcement Card if present */}
                                    {announcement ? (
                                        <div className="mt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                            <div className="rounded-lg overflow-hidden border border-border bg-card/50 max-w-xl group-hover:border-primary/50 transition-colors">
                                                {announcement.imageUrl && (
                                                    <div className="h-48 w-full bg-muted relative overflow-hidden">
                                                        <img
                                                            src={announcement.imageUrl}
                                                            alt={announcement.title}
                                                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-700 ease-out"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4 border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-sm", announcement.tagColor || "bg-primary")}>
                                                            {announcement.tag}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-lg mb-1 tracking-tight">{announcement.title}</h4>
                                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                                        {announcement.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={cn("text-sm leading-relaxed whitespace-pre-wrap", isSystemMessage ? "mt-2" : "text-foreground/90")}>
                                            {isSystemMessage ? (
                                                <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                                        <Swords className="w-16 h-16 text-yellow-500" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        {renderContent(message.content)}
                                                    </div>
                                                </div>
                                            ) : (
                                                renderContent(message.content)
                                            )}
                                        </div>
                                    )}

                                    {/* Reactions */}
                                    <div className="flex items-center gap-2 mt-3">
                                        {Object.entries(message.reactions || {}).map(([emoji, count]) => (
                                            <button
                                                key={emoji}
                                                onClick={() => onReaction(message.id, emoji)}
                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                                            >
                                                <span className="text-xs">{emoji}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground">{count}</span>
                                            </button>
                                        ))}

                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 ml-2 transform translate-x-[-10px] group-hover:translate-x-0">
                                            {['👍', '🔥', '⭐'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => onReaction(message.id, emoji)}
                                                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted hover:scale-110 text-xs transition-all"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
                {canPost ? (
                    <form onSubmit={handleSubmit} className="relative">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Message #${channel.name}...`}
                            className="pr-12 bg-muted/50 border-input/50 focus-visible:ring-primary/20 h-11"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                            disabled={!inputValue.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                ) : (
                    <div className="h-11 rounded-md bg-muted/30 border border-border/50 flex items-center justify-center text-sm text-muted-foreground gap-2 cursor-not-allowed">
                        <Lock className="h-4 w-4" />
                        Only faculty can post in this channel
                    </div>
                )}
            </div>
        </div>
    );
}
