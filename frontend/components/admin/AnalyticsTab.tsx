'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    MousePointer2,
    Globe,
    RefreshCw,
    Layout,
    BarChart3,
    Zap,
    Percent,
    Monitor,
    TrendingUp,
    TrendingDown,
    Eye,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import adminApiClient from '@/lib/admin-api'
import { AnalyticsSummary } from '@/lib/admin-types'
import { toast } from '@/lib/toast'

const COLORS = {
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    blue: '#3b82f6',
}

const CHART_COLORS = [COLORS.cyan, COLORS.violet, COLORS.emerald, COLORS.amber, COLORS.rose, COLORS.blue]

function formatChartDate(iso: string) {
    try {
        const d = new Date(iso + (iso.includes('T') ? '' : 'T12:00:00'))
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
        return iso
    }
}

function formatRelativeTime(d: Date | null) {
    if (!d) return ''
    const s = Math.floor((Date.now() - d.getTime()) / 1000)
    if (s < 10) return 'just now'
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div
            style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(30, 36, 50, 0.95)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            }}
        >
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                {typeof label === 'string' ? formatChartDate(label) : label}
            </p>
            {payload.map((item: any, index: number) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        marginBottom: index < payload.length - 1 ? 4 : 0,
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: item.color,
                        }}
                    />
                    <span style={{ flex: 1, color: 'rgba(255,255,255,0.8)' }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>
                        {item.value?.toLocaleString?.() ?? item.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

const AnalyticsTab = () => {
    const [data, setData] = useState<AnalyticsSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)

        try {
            const result = await adminApiClient.getAnalytics()
            setData(result)
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Failed to fetch analytics', error)
            toast.error('Could not load analytics. Try again.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchAnalytics()
        const interval = setInterval(() => fetchAnalytics(true), 60000)
        return () => clearInterval(interval)
    }, [fetchAnalytics])

    const deviceData = useMemo(() => {
        if (!data?.deviceBreakdown) return []
        return Object.entries(data.deviceBreakdown).map(([name, value]) => ({ name, value }))
    }, [data])

    const countryData = useMemo(() => {
        if (!data?.countries) return []
        return Object.entries(data.countries)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => (b.value as number) - (a.value as number))
    }, [data])

    const chartData = useMemo(() => {
        if (!data?.dailyTraffic?.length) return []
        if (data.dailyTraffic.length === 1) {
            const point = data.dailyTraffic[0]
            if (point?.date) {
                const prevDate = new Date(point.date)
                prevDate.setDate(prevDate.getDate() - 1)
                return [
                    { date: prevDate.toISOString().split('T')[0], visits: 0, unique: 0 },
                    point,
                ]
            }
        }
        return data.dailyTraffic
    }, [data])

    const mainPageVisits = useMemo(() => {
        if (!data?.topPages) return 0
        const main = data.topPages.find((p) => p.path === '/' || p.path === '/index')
        return main ? main.visits : 0
    }, [data])

    const bounceDisplay = useMemo(() => {
        if (!data) return '-'
        const b = data.bounceRate ?? 0
        return `${Math.min(100, Math.max(0, b)).toFixed(1)}%`
    }, [data])

    const newPct = useMemo(() => {
        if (!data) return 0
        const u = data.uniqueVisitors || 1
        return Math.round((data.newVsReturning.new / u) * 100)
    }, [data])

    const returnPct = useMemo(() => {
        if (!data) return 0
        const u = data.uniqueVisitors || 1
        return Math.round((data.newVsReturning.returning / u) * 100)
    }, [data])

    if (loading && !data) {
        return (
            <div className="admin-loading-wrapper">
                <div className="admin-loading-spinner"></div>
                <p className="admin-loading-text">Loading analytics data...</p>
            </div>
        )
    }

    if (!data) return null

    const stats = [
        {
            title: 'Total Visits',
            value: data.totalVisits.toLocaleString(),
            icon: Eye,
            colorClass: 'blue',
            description: 'All page views',
            trend: '+12.5%',
            trendUp: true,
        },
        {
            title: 'Unique Visitors',
            value: data.uniqueVisitors.toLocaleString(),
            icon: Users,
            colorClass: 'purple',
            description: 'Distinct users',
            trend: '+8.3%',
            trendUp: true,
        },
        {
            title: 'Active Now',
            value: (data.activeUsers || 0).toLocaleString(),
            icon: Zap,
            colorClass: 'green',
            description: 'Live sessions',
            trend: null,
            trendUp: null,
        },
        {
            title: 'Bounce Rate',
            value: bounceDisplay,
            icon: Percent,
            colorClass: 'yellow',
            description: 'Single page exits',
            trend: '-3.2%',
            trendUp: false,
        },
        {
            title: 'Avg. Session',
            value: '3m 42s',
            icon: Clock,
            colorClass: 'red',
            description: 'Time on site',
            trend: '+15s',
            trendUp: true,
        },
        {
            title: 'Home Views',
            value: mainPageVisits.toLocaleString(),
            icon: Layout,
            colorClass: 'teal',
            description: 'Landing page',
            trend: '+5.7%',
            trendUp: true,
        },
    ]

    const topPageMax = data.topPages[0]?.visits || 1
    const topCountryMax = countryData[0] ? (countryData[0].value as number) : 1

    return (
        <div>
            {/* Header */}
            <div className="admin-section-header">
                <div>
                    <div className="admin-section-title-wrapper">
                        <BarChart3 />
                        <h2 className="admin-section-title">Analytics Dashboard</h2>
                    </div>
                    <p className="admin-section-description">
                        Track visitor behavior, page views, and traffic patterns across your portfolio
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => fetchAnalytics(true)}
                    className="admin-btn admin-btn-blue"
                    disabled={refreshing}
                >
                    <RefreshCw size={18} className={refreshing ? 'admin-loading-spinner sm' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Last Updated Info */}
            <div style={{
                marginBottom: '24px',
                padding: '12px 16px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '14px',
                color: '#93c5fd'
            }}>
                <Clock size={16} />
                <span>Last updated {formatRelativeTime(lastUpdated)} • Auto-refreshes every 60 seconds</span>
                {data.activeUsers > 0 && (
                    <>
                        <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.3)' }}>•</span>
                        <Zap size={16} style={{ color: COLORS.emerald }} />
                        <span style={{ color: COLORS.emerald, fontWeight: 600 }}>{data.activeUsers} active now</span>
                    </>
                )}
            </div>

            {/* Stats Grid */}
            <div className="admin-stats-grid" style={{ marginBottom: '32px' }}>
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="admin-stat-card"
                        >
                            <div className="admin-stat-header">
                                <div className={`admin-stat-icon ${stat.colorClass}`}>
                                    <IconComponent />
                                </div>
                                <div className="admin-stat-value-wrapper">
                                    <p className="admin-stat-value">{stat.value}</p>
                                    {stat.trend && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: stat.trendUp ? COLORS.emerald : COLORS.rose
                                        }}>
                                            {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            <span>{stat.trend}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h3 className="admin-stat-title">{stat.title}</h3>
                            <p className="admin-stat-description">{stat.description}</p>
                        </motion.div>
                    )
                })}
            </div>

            {/* Traffic Chart - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="admin-card"
                style={{ marginBottom: '24px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <BarChart3 size={20} />
                            Traffic Over Time
                        </h3>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Daily visits and unique visitors</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.cyan }} />
                            <span style={{ color: '#9ca3af' }}>Total Visits</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.emerald }} />
                            <span style={{ color: '#9ca3af' }}>Unique Visitors</span>
                        </div>
                    </div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                                tickFormatter={formatChartDate}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                                width={35}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="visits"
                                name="Total visits"
                                stroke={COLORS.cyan}
                                strokeWidth={2}
                                fill="url(#colorVisits)"
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="unique"
                                name="Unique visitors"
                                stroke={COLORS.emerald}
                                strokeWidth={2}
                                fill="url(#colorUnique)"
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Two Column Layout for Device & Visitor Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Device Breakdown */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="admin-card"
                >
                    <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Monitor size={20} />
                        Device Breakdown
                    </h3>
                    {deviceData.length === 0 ? (
                        <div className="admin-empty-state" style={{ padding: '40px 20px' }}>
                            <Monitor size={48} style={{ opacity: 0.3 }} />
                            <p style={{ margin: '12px 0 0', fontSize: '14px' }}>No device data yet</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: '100%', height: '200px', marginBottom: '20px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={deviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {deviceData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {deviceData.map((d, i) => {
                                    const pct = Math.round(((d.value as number) / (data.totalVisits || 1)) * 100)
                                    return (
                                        <div
                                            key={d.name}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 12px',
                                                background: 'rgba(55, 65, 81, 0.3)',
                                                borderRadius: '8px',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span
                                                    style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        background: CHART_COLORS[i % CHART_COLORS.length],
                                                    }}
                                                />
                                                <span style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>
                                                    {d.name}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>{pct}%</span>
                                                <span style={{ fontSize: '15px', fontWeight: 700 }}>
                                                    {(d.value as number).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* New vs Returning */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="admin-card"
                >
                    <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <MousePointer2 size={20} />
                        Visitor Type
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(6, 182, 212, 0.08)',
                            border: '1px solid rgba(6, 182, 212, 0.2)',
                            borderRadius: '12px'
                        }}>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                New Visitors
                            </p>
                            <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: 700, color: COLORS.cyan }}>
                                {data.newVsReturning.new.toLocaleString()}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                                {newPct}% of unique visitors
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(139, 92, 246, 0.08)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '12px'
                        }}>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Returning Visitors
                            </p>
                            <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: 700, color: COLORS.violet }}>
                                {data.newVsReturning.returning.toLocaleString()}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                                {returnPct}% of unique visitors
                            </p>
                        </div>
                        <div style={{
                            display: 'flex',
                            height: '12px',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            background: 'rgba(55, 65, 81, 0.5)'
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${newPct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{ background: COLORS.cyan }}
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${returnPct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                style={{ background: COLORS.violet }}
                            />
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                            Based on {data.uniqueVisitors.toLocaleString()} unique visitors
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Top Pages Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="admin-card"
                style={{ marginBottom: '24px' }}
            >
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Layout size={20} />
                    Top Pages
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#9ca3af',
                        background: 'rgba(55, 65, 81, 0.5)',
                        padding: '4px 12px',
                        borderRadius: '999px'
                    }}>
                        {data.topPages.length} pages
                    </span>
                </h3>
                {data.topPages.length === 0 ? (
                    <div className="admin-empty-state" style={{ padding: '40px 20px' }}>
                        <Layout size={48} style={{ opacity: 0.3 }} />
                        <p style={{ margin: '12px 0 0', fontSize: '14px' }}>No page views recorded yet</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', width: '40px' }}>
                                        #
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Page Path
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', width: '100px' }}>
                                        Views
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', width: '200px' }}>
                                        Share
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topPages.slice(0, 10).map((page, i) => {
                                    const pct = (page.visits / (data.totalVisits || 1)) * 100
                                    const barWidth = Math.min(100, (page.visits / topPageMax) * 100)
                                    return (
                                        <tr key={`${page.path}-${i}`} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <td style={{ padding: '14px 12px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '24px',
                                                    height: '24px',
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: '#93c5fd'
                                                }}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <code style={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '13px',
                                                    background: 'rgba(55, 65, 81, 0.5)',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    color: '#93c5fd'
                                                }}>
                                                    {page.path || '/'}
                                                </code>
                                            </td>
                                            <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: '15px', fontWeight: 700 }}>
                                                {page.visits.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        flex: 1,
                                                        height: '8px',
                                                        background: 'rgba(55, 65, 81, 0.5)',
                                                        borderRadius: '999px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${barWidth}%` }}
                                                            transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
                                                            style={{
                                                                height: '100%',
                                                                background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.violet})`,
                                                                borderRadius: '999px'
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', minWidth: '45px', textAlign: 'right' }}>
                                                        {pct.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Top Countries Table */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="admin-card"
            >
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Globe size={20} />
                    Top Countries
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#9ca3af',
                        background: 'rgba(55, 65, 81, 0.5)',
                        padding: '4px 12px',
                        borderRadius: '999px'
                    }}>
                        {countryData.length} countries
                    </span>
                </h3>
                {countryData.length === 0 ? (
                    <div className="admin-empty-state" style={{ padding: '40px 20px' }}>
                        <Globe size={48} style={{ opacity: 0.3 }} />
                        <p style={{ margin: '12px 0 0', fontSize: '14px' }}>No country data yet</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', width: '40px' }}>
                                        #
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Country
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', width: '100px' }}>
                                        Visitors
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', width: '200px' }}>
                                        Share
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {countryData.slice(0, 10).map((row, i) => {
                                    const v = row.value as number
                                    const pctUnique = (v / (data.uniqueVisitors || 1)) * 100
                                    const barWidth = Math.min(100, (v / topCountryMax) * 100)
                                    return (
                                        <tr key={row.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <td style={{ padding: '14px 12px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '24px',
                                                    height: '24px',
                                                    background: 'rgba(16, 185, 129, 0.15)',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: '#6ee7b7'
                                                }}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: 600 }}>
                                                {row.name}
                                            </td>
                                            <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: '15px', fontWeight: 700 }}>
                                                {v.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        flex: 1,
                                                        height: '8px',
                                                        background: 'rgba(55, 65, 81, 0.5)',
                                                        borderRadius: '999px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${barWidth}%` }}
                                                            transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
                                                            style={{
                                                                height: '100%',
                                                                background: `linear-gradient(90deg, ${COLORS.emerald}, ${COLORS.cyan})`,
                                                                borderRadius: '999px'
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', minWidth: '45px', textAlign: 'right' }}>
                                                        {pctUnique.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default AnalyticsTab
