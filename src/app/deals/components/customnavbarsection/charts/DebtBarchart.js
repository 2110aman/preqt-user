"use client";
import React from "react";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";

const DebtBarChart = ({ isPrivate, data: apiData }) => {
    // Transform API data to chart format with error handling
    const transformData = (data) => {
        try {
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.warn('DebtBarChart: No valid data provided, using fallback');
                return [];
            }

            return data
                .map(item => {
                    if (!item || typeof item !== 'object' || item.observation_and_insights || !item.year) {
                        return null;
                    }

                    return {
                        year: Math.floor(Number(item.year)).toString(),
                        // FIX: convert string/number to number
                        value: Number(item.debt_to_equity) || 0
                    };
                })
                .filter(item => item !== null);
        } catch (error) {
            console.error('DebtBarChart: Error transforming data', error);
            return [];
        }
    };

    // Safe data selection with fallback
    const chartData = (() => {
        try {
            if (apiData) {
                const transformed = transformData(apiData);
                return transformed.length > 0 ? transformed : [
                    { year: "2022", value: 1.28 },
                    { year: "2023", value: 0.88 },
                    { year: "2024", value: 1.09 }
                ];
            }
            return [
                { year: "2022", value: 1.28 },
                { year: "2023", value: 0.88 },
                { year: "2024", value: 1.09 }
            ];
        } catch (error) {
            console.error('DebtBarChart: Error selecting chart data', error);
            return [
                { year: "2022", value: 1.28 },
                { year: "2023", value: 0.88 },
                { year: "2024", value: 1.09 }
            ];
        }
    })();

    const { ticks, domain } = React.useMemo(() => {
        const maxVal = Math.max(...chartData.map(d => d.value), 0) || 1.28;
        
        // Calculate nice intervals dynamically for all values
        const rawInterval = maxVal / 3.5;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
        const normalized = rawInterval / magnitude;
        
        // Finer nice steps for beautiful numbers
        const niceSteps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
        const step = niceSteps.find(s => s >= normalized) || 10;
        
        const interval = step * magnitude;
        const generatedTicks = [
            0,
            Number(interval.toFixed(4)),
            Number((2 * interval).toFixed(4)),
            Number((3 * interval).toFixed(4)),
            Number((4 * interval).toFixed(4))
        ];
        
        return {
            ticks: generatedTicks,
            domain: [0, Number((4 * interval).toFixed(4))]
        };
    }, [chartData]);

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart key={JSON.stringify(chartData)} data={chartData} barSize={77} margin={{ top: 25, right: 10, left: 15, bottom: 5 }}>
                <defs>
                    <linearGradient id="debtLatestBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E4C575" />
                        <stop offset="100%" stopColor="#B57D23" />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isPrivate ? "#374151" : "#F3F4F6"}
                />
                <XAxis
                    dataKey="year"
                    tick={{
                        fill: "var(--Gray-500, #4B5563)", // text color
                        fontSize: 13,
                        fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                        fontWeight: 500,
                    }}
                    axisLine={{ stroke: isPrivate ? "#374151" : "#E2E8F0" }}
                    tickLine={false}
                />
                <YAxis
                    domain={domain}
                    ticks={ticks}
                    width={65}
                    tick={{
                        fill: "var(--Gray-500, #4B5563)", // text color
                        fontSize: 13,
                        fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                        fontWeight: 500,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div
                                    style={{
                                        background: isPrivate ? "#1F2937" : "#fff",
                                        padding: "8px 12px",
                                        border: `1px solid ${isPrivate ? "#374151" : "#E5E7EB"}`,
                                        borderRadius: "6px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                        color: isPrivate ? "#fff" : "#1F2937",
                                    }}
                                >
                                    <p style={{ margin: 0, fontWeight: "600", fontSize: 13 }}>{label}</p>
                                    <p style={{ margin: 0, color: "#B57D23", fontSize: 13, fontWeight: "500" }}>
                                        D/E: {Number(payload[0].value).toFixed(2)} x
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]} // rounded top corners
                >
                    {chartData.map((entry, index) => {
                        const isLatest = index === chartData.length - 1;
                        return (
                            <Cell
                                key={`cell-${index}`}
                                fill={isLatest ? "url(#debtLatestBarGradient)" : "#F5E3B2"}
                            />
                        );
                    })}
                    <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(val) => `${Number(val).toFixed(2)} x`}
                        style={{
                            fill: "var(--Gray-500, #4B5563)",
                            fontSize: "13px",
                            fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                            fontWeight: 500
                        }}
                        offset={10}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DebtBarChart;
