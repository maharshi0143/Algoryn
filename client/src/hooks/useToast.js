import toast from "react-hot-toast";

export function useToast() {
  const showSuccess = (message) => toast.success(message);
  const showError = (message) => toast.error(message);
  const showInfo = (message) => toast(message);

  return { showSuccess, showError, showInfo };
}
