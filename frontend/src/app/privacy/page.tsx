import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-8 md:p-16 font-sans">
      <div className="max-w-3xl mx-auto bg-[#121721] p-8 md:p-12 rounded-2xl shadow-xl border border-[#2A3143]">
        <h1 className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-8">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-sm text-gray-500">Last Updated: July 3, 2026</p>
          
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Clean Connect ("we," "our," or "us") operates the Knot mobile application and website. This Privacy Policy explains how we collect, use, and protect your information when you use our elite matchmaking service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-[#D4AF37]">Personal Data:</strong> Name, email address, phone number, and age.</li>
              <li><strong className="text-[#D4AF37]">Biometric & Identity Data:</strong> Photos and government ID scans used strictly for identity verification and safety.</li>
              <li><strong className="text-[#D4AF37]">Usage Data:</strong> Device information, app activity, and chat logs to ensure community safety.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use your data exclusively to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Verify your identity and maintain a secure, high-trust community.</li>
              <li>Provide AI-driven matchmaking services.</li>
              <li>Improve our application's performance and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal data to third parties. We only share data with trusted security partners (such as ID verification services) strictly for the purpose of keeping the Knot community safe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p>
              You have the right to access, modify, or permanently delete your account and all associated data at any time through the app settings or via our Data Deletion request page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact our support team at <a href="mailto:cleanconnectng@gmail.com" className="text-[#D4AF37] hover:underline">cleanconnectng@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Child Safety Standards</h2>
            <p className="mb-2">
              Knot is strictly for adults aged 18 and over. We maintain a zero-tolerance policy against any form of Child Sexual Abuse Material (CSAM) and Child Sexual Abuse and Exploitation (CSAE).
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Zero Tolerance:</strong> Any user found distributing, promoting, or possessing CSAM/CSAE will be permanently banned and immediately reported to the relevant national authorities and law enforcement.</li>
              <li><strong>Reporting:</strong> Users can instantly report any child safety concerns directly within the app using the "Report User" feature, or by immediately emailing <a href="mailto:cleanconnectng@gmail.com" className="text-[#D4AF37] hover:underline">cleanconnectng@gmail.com</a>.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
