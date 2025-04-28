interface ErrorAlertProps {
    readonly message: string;
  }
  
  export default function ErrorAlert({ message }: ErrorAlertProps) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {message}
      </div>
    );
  }
  