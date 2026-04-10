'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsItem {
    label: string;
    value: number;
}

interface StatsBreakdownProps {
    title: string;
    icon: ReactNode;
    data: StatsItem[];
}

export default function StatsBreakdown({ title, icon, data }: StatsBreakdownProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-muted-foreground">{icon}</span>
                    <h3 className="text-sm font-medium">{title}</h3>
                </div>

                {data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data available</p>
                ) : (
                    <div className="space-y-3">
                        {data.map((item) => {
                            const pct = total > 0 ? (item.value / total) * 100 : 0;
                            return (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="truncate font-medium">{item.label}</span>
                                        <span className="ml-2 shrink-0 text-muted-foreground">
                                            {item.value.toLocaleString()}{' '}
                                            <span className="text-xs">({pct.toFixed(1)}%)</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-foreground/70 transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
