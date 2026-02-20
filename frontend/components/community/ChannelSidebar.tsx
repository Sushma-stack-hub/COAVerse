
import { Hash, Megaphone } from "lucide-react";
import { CHANNELS, Channel } from "./mockData";
import { cn } from "@/lib/utils";

interface ChannelSidebarProps {
    selectedChannelId: string;
    onSelectChannel: (channelId: string) => void;
}

export function ChannelSidebar({ selectedChannelId, onSelectChannel }: ChannelSidebarProps) {
    return (
        <div className="w-64 bg-card/50 border-r border-border flex flex-col h-full">
            <div className="p-4 border-b border-border/50">
                <h2 className="font-bold text-lg tracking-tight">Channels</h2>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
                {CHANNELS.map((channel) => {
                    const isSelected = selectedChannelId === channel.id;
                    const Icon = channel.type === 'announcement' ? Megaphone : Hash;

                    return (
                        <button
                            key={channel.id}
                            onClick={() => onSelectChannel(channel.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                                isSelected
                                    ? "bg-primary/15 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "h-4 w-4",
                                isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {channel.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
