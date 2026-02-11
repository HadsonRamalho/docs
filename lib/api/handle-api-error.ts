import { toast } from "sonner";

interface HandleErrorOptions {
  err: any;
  t: (key: string, values?: any) => string;
  setError?: (msg: string) => void;
}

export function handleApiError({ err, t, setError }: HandleErrorOptions) {
  const errorCode = err?.code || "UNKNOWN_ERROR";
  const errorDetails = err?.details || {};

  const translatedMessage = t(errorCode, errorDetails);

  if (setError) {
    setError(translatedMessage);
  }

  toast.error(translatedMessage);
}
