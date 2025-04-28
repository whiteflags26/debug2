interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: 'primary' | 'danger' | 'warning';
  loading?: boolean;
  children: React.ReactNode;
}

export function ActionButton({
  onClick,
  disabled,
  variant,
  loading,
  children,
}: ActionButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-md font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <span className="inline-flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
