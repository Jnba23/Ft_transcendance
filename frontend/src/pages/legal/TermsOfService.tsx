import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TermsOfService(): React.JSX.Element {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <div className={`w-full max-w-4xl bg-[#16213E]/30 border border-white/10 rounded-xl shadow-2xl p-8 md:p-12 h-fit mb-8 mx-auto`}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-white/10 pb-4">Terms of Service</h1>

            <div className="space-y-6 text-white/80 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the ft_transcendence gaming platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
                    </p>
                    <p className="mt-2 text-white/60 text-sm">
                        <i>Note: The development team consists of students at 42 school building this as an educational project.</i>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                    <p>
                        ft_transcendence is an online multiplayer gaming platform (featuring games like Pong) that includes real-time communication, match tracking, and social features. The service is provided "as is" and may be updated, modified, or discontinued at any time without prior notice.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
                    <p>
                        To access certain features of the service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and any other credentials used to access your account. You agree not to disclose your password to any third party and to notify us immediately of any unauthorized use of your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">4. Rules of Conduct & Fair Play</h2>
                    <p>While using ft_transcendence, you agree that you will not:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Use the service for any illegal or unauthorized purpose.</li>
                        <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.</li>
                        <li>Use cheats, exploits, automation software, bots, hacks, mods, or any unauthorized third-party software designed to modify or interfere with the ft_transcendence experience.</li>
                        <li>Attempt to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the service.</li>
                    </ul>
                    <p className="mt-2 text-[#E94560]">
                        Violation of these rules may result in immediate termination of your account and access to the platform without prior notice.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
                    <p>
                        All content, features, and functionality of ft_transcendence, including but not limited to design, text, graphics, logos, images, and software, are the exclusive property of its developers (students at 42 school) and are protected by copyright, trademark, and other intellectual property laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
                    <p>
                        In no event shall ft_transcendence, its developers, or its affiliates be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the service; (ii) any conduct or content of any third party on the service; or (iii) unauthorized access, use or alteration of your transmissions or content.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">7. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify or replace these Terms at any time. Material changes will be communicated through the platform. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
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

export default TermsOfService;
