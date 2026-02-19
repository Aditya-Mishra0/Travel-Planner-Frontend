// Simple toast notification system
export const showNotification = (message, type = 'success', duration = 3000) => {
  // Create a simple alert-like notification
  // For a more sophisticated approach, you could use a toast library like react-hot-toast
  const notification = document.createElement('div');
  
  const bgColor = type === 'error' ? 'bg-rose-500' : type === 'warning' ? 'bg-amber-500' : 'bg-green-500';
  const textColor = 'text-white';
  
  notification.innerHTML = `
    <div class="fixed top-4 right-4 z-40 ${bgColor} ${textColor} px-6 py-3 rounded-2xl font-bold shadow-lg animation-fade-in-out">
      ${message}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      10% { opacity: 1; transform: translateY(0); }
      90% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
    .animation-fade-in-out {
      animation: fadeInOut ${duration}ms ease-in-out forwards;
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    notification.remove();
  }, duration);
};

export const showSuccess = (message) => showNotification(message, 'success');
export const showError = (message) => showNotification(message, 'error');
export const showWarning = (message) => showNotification(message, 'warning');
