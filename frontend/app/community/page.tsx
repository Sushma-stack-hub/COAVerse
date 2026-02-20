"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { COACommunity } from "@/components/community/COACommunity"

export default function CommunityPage() {
    return (
        <DashboardLayout>
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">COA Arena Community</h1>
                    <p className="text-muted-foreground">
                        Connect with fellow learners, ask doubts, and share knowledge
                    </p>
                </div>
                <COACommunity />
            </div>
        </DashboardLayout>
    )
}
