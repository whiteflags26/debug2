import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  statusCode?: number;
}

export default function ErrorDisplay({
  title = 'Error',
  message = 'An error occurred',
  showBackButton = true,
  statusCode,
}: ErrorDisplayProps) {
  const router = useRouter();

  const getErrorContent = (status?: number) => {
    switch (status) {
      case 403:
        return {
          title: 'Access Denied',
          message: 'You are not authorized to perform this action',
        };
      case 404:
        return {
          title: 'Not Found',
          message: 'The requested resource was not found',
        };
      default:
        return {
          title,
          message,
        };
    }
  };

  const errorContent = getErrorContent(statusCode);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 mb-6">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {errorContent.title}
        </h2>
        <p className="text-gray-600 mb-6">{errorContent.message}</p>
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
