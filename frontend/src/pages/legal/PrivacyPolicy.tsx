import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function PrivacyPolicy(): React.JSX.Element {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={'w-full max-w-4xl bg-[#16213E]/30 border border-white/10 rounded-xl shadow-2xl p-8 md:p-12 h-fit mb-8 mx-auto'}>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-white/10 pb-4">Privacy Policy</h1>

      <div className="space-y-6 text-white/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>
                        When you use ft_transcendence, we collect information that you provide to us directly, such as when you create an account, update your profile, or communicate with us. This includes your username, email address, password, and avatar. If you choose to authenticate via Google (OAuth), we collect basic profile information provided by the Google API.
          </p>
          <p className="mt-2 text-white/60 text-sm">
            <i>Note: The development team consists of students at 42 school building this as an educational project.</i>
          </p>
          <p className="mt-2">
                        We also automatically collect certain information when you access or use our platform, including game statistics, match history, and interaction logs within the application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide, maintain, and improve the ft_transcendence platform.</li>
            <li>Track your match history, calculate rankings, and update game statistics.</li>
            <li>Facilitate user-to-user communication, such as chat and direct messaging.</li>
            <li>Secure your account using algorithms like Two-Factor Authentication (2FA).</li>
            <li>Personalize your experience (e.g., displaying your chosen avatar).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Sharing of Information</h2>
          <p>
                        Your public profile, including your username, avatar, and match statistics, will be visible to other users on the platform to foster a competitive and social environment. We do not sell your personal information to third parties. We may share your information if required to do so by law or to protect the rights and safety of ft_transcendence and its users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Security</h2>
          <p>
                        We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet transmission is entirely secure, and we cannot guarantee absolute security. We encourage you to use distinct passwords and enable Two-Factor Authentication.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Your Choices</h2>
          <p>
                        You may update or correct your account information at any time by accessing your settings profile. You may also configure your privacy preferences regarding visibility and communication within the platform where applicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
          <p>
                        ft_transcendence uses cookies and similar tracking technologies to securely manage your sessions, remember your preferences, and understand how you interact with our platform. You can control cookies through your browser settings, but disabling them may limit your ability to use certain features of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Contact Us</h2>
          <p>
                        If you have any questions about this Privacy Policy, please contact the development team through the official project repository or the provided feedback channels.
          </p>
        </section>
      </div>

      <div className="mt-12 flex justify-center border-t border-white/10 pt-8">
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          className="px-6 py-2 bg-[#0d59f2] text-white rounded-lg hover:bg-[#0d59f2]/90 transition-colors font-medium">
          {isAuthenticated ? 'Return to Dashboard' : 'Return to Login'}
        </button>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
