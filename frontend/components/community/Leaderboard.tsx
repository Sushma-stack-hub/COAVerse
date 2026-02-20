
import { Trophy, Medal, Crown } from "lucide-react";
import { User } from "./mockData";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
    users: User[];
    currentUserId: string;
}

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
    // Sort users by XP descending and take top 5
    const sortedUsers = [...users].sort((a, b) => b.xp - a.xp).slice(0, 5);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />;
            case 1: return <Medal className="h-4 w-4 text-gray-400" />;
            case 2: return <Medal className="h-4 w-4 text-amber-700" />;
            default: return <span className="text-xs font-mono text-muted-foreground w-4 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="w-72 bg-card/30 border-l border-border flex flex-col h-full hidden lg:flex">
            <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="font-bold text-lg tracking-tight">Leaderboard</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sortedUsers.map((user, index) => {
                    const isCurrentUser = user.id === currentUserId;

                    return (
                        <div
                            key={user.id}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg transition-all border",
                                isCurrentUser
                                    ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_-5px_hsl(var(--primary))]"
                                    : "bg-card/50 border-border/50 hover:bg-muted/50"
                            )}
                        >
                            <div className="flex items-center justify-center w-6 shrink-0">
                                {getRankIcon(index)}
                            </div>

                            <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border border-border">
                                    {user.avatar}
                                </div>
                                {/* Online indicator mock */}
                                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium truncate", isCurrentUser && "text-primary")}>
                                    {user.name}
                                    {isCurrentUser && <span className="ml-1 text-[10px] opacity-70">(You)</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{user.xp} XP</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
