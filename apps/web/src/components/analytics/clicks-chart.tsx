'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ClicksChartProps {
    data: { date: string; clicks: number }[];
}

export default function ClicksChart({ data }: ClicksChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No click data available for this period
            </div>
        );
    }

    const formatted = data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 12,
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    fill="url(#clickGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
