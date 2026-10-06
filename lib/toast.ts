import { toast as sonnerToast } from "sonner";
import { readableErrorMessage } from "@/lib/errors/readable-message";

const ERROR_FALLBACK = "Something went wrong. Try again.";

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(readableErrorMessage(message, ERROR_FALLBACK), { description }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),
};
