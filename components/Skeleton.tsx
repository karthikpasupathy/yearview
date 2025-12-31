'use client';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export default function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-neutral-200';

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
}

export function CalendarSkeleton() {
    return (
        <div className="space-y-0 pb-4">
            {Array.from({ length: 12 }).map((_, monthIndex) => (
                <div key={monthIndex} className="bg-white border-b border-neutral-200 flex">
                    {/* Month Label Skeleton */}
                    <div className="bg-neutral-50 px-3 py-2 border-r border-neutral-200 flex items-center justify-center min-w-[60px]">
                        <Skeleton width={20} height={40} />
                    </div>

                    {/* Days Grid Skeleton */}
                    <div className="flex-1 relative">
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: 'repeat(31, minmax(0, 1fr))',
                                height: '60px'
                            }}
                        >
                            {Array.from({ length: 31 }).map((_, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className="h-full border-r border-neutral-100 p-1"
                                >
                                    <Skeleton width="100%" height={12} className="mb-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function HeaderSkeleton() {
    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-300">
            <div className="max-w-[1800px] mx-auto px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <Skeleton width={40} height={40} className="rounded-2xl" />
                            <Skeleton width={150} height={28} />
                        </div>
                        <Skeleton width={100} height={40} className="rounded-xl" />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Skeleton width={120} height={40} className="rounded-xl" />
                        <Skeleton width={150} height={24} />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Skeleton width={80} height={20} />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} width={100} height={32} className="rounded-full" />
                        ))}
                    </div>
                    <Skeleton width={120} height={36} className="rounded-xl" />
                </div>
            </div>
        </header>
    );
}
