import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Button = ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-900/20 border border-primary-500/50',
        secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
        outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800',
        danger: 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20',
        ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </button>
    );
};

export const Input = ({ label, error, className, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>}
            <input
                className={cn(
                    "w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all",
                    error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
};

export const Select = ({ label, options = [], error, className, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>}
            <select
                className={cn(
                    "w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all appearance-none",
                    error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
};

export const Card = ({ children, className, title, subtitle, footer }) => {
    return (
        <div className={cn("glass rounded-3xl overflow-hidden flex flex-col", className)}>
            {(title || subtitle) && (
                <div className="px-6 py-5 border-b border-white/5">
                    {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
                    {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-6 flex-1">{children}</div>
            {footer && (
                <div className="px-6 py-4 bg-white/5 border-t border-white/5">
                    {footer}
                </div>
            )}
        </div>
    );
};
