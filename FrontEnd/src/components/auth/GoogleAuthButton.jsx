const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const GoogleAuthButton = ({ label = 'Continuar con Google' }) => {
  const handleGoogleLogin = () => {
    window.location.assign(`${API_BASE_URL}/auth/google`);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full mt-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center gap-3"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.5-5.4 3.5-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 2.8 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.2-4.8 9.2-7.3 0-.5-.1-.9-.1-1.3H12z"/>
      </svg>
      <span>{label}</span>
    </button>
  );
};

export default GoogleAuthButton;
