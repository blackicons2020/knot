import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-8 md:p-16 font-sans">
      <div className="max-w-4xl mx-auto bg-[#121721] p-8 md:p-12 rounded-2xl shadow-xl border border-[#2A3143]">
        <h1 className="text-3xl md:text-5xl font-bold text-[#D4AF37] mb-4 text-center">
          Privacy Policy & Community Guidelines
        </h1>
        <p className="text-center text-gray-500 mb-12">Last Updated: July 3, 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          
          {/* SECTION 1: PRIVACY POLICY */}
          <div>
            <h2 className="text-2xl font-bold text-white border-b border-[#2A3143] pb-2 mb-4">Part 1: Privacy Policy</h2>
            
            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">1. Introduction</h3>
              <p className="mb-2">Welcome to Knot, operated by Clean Connect ("we," "our," or "us"). We are committed to protecting your privacy and handling your personal information responsibly.</p>
              <p className="mb-2">This Privacy Policy explains how we collect, use, store, disclose, and protect your information when you use the Knot mobile application, website, and related services.</p>
              <p>By using Knot, you agree to the practices described in this Privacy Policy.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">2. Information We Collect</h3>
              <h4 className="font-semibold text-white mt-4 mb-2">Personal Information</h4>
              <p className="mb-2">We may collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Full name</li><li>Email address</li><li>Phone number</li><li>Date of birth</li><li>Gender</li><li>Profile information</li><li>Interests and preferences</li>
              </ul>

              <h4 className="font-semibold text-white mt-4 mb-2">Identity Verification</h4>
              <p className="mb-2">To maintain a trusted community, we may collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Government-issued identification</li><li>Selfie verification</li><li>Profile photographs</li>
              </ul>
              <p className="text-sm italic mb-4">Identity verification information is used solely for safety, fraud prevention, and account verification.</p>

              <h4 className="font-semibold text-white mt-4 mb-2">Usage Information</h4>
              <p className="mb-2">We automatically collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Device information</li><li>IP address</li><li>Operating system</li><li>App activity</li><li>Log files</li><li>Crash reports</li><li>Chat moderation data used for safety purposes</li>
              </ul>

              <h4 className="font-semibold text-white mt-4 mb-2">Location Information</h4>
              <p>If you grant permission, we may collect approximate or precise location information to improve matchmaking and location-based features.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">3. How We Use Your Information</h3>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create and manage your account</li><li>Verify identity</li><li>Provide AI-powered matchmaking</li><li>Improve compatibility recommendations</li><li>Prevent fraud and abuse</li><li>Maintain platform security</li><li>Respond to customer support requests</li><li>Improve our products and services</li><li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">4. Data Sharing</h3>
              <p className="mb-2">We do not sell your personal information.</p>
              <p className="mb-2">We may share information with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Identity verification providers</li><li>Cloud hosting providers</li><li>Analytics providers</li><li>Fraud prevention partners</li><li>Law enforcement when legally required</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">5. Data Security</h3>
              <p>We use reasonable administrative, technical, and physical safeguards to protect your information. While we strive to protect your data, no method of electronic transmission or storage is completely secure.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">6. Data Retention</h3>
              <p className="mb-2">We retain information only as long as necessary to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide our services</li><li>Meet legal obligations</li><li>Resolve disputes</li><li>Enforce our agreements</li>
              </ul>
              <p>When an account is permanently deleted, personal information is deleted or anonymized unless retention is required by law.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">7. Your Rights</h3>
              <p className="mb-2">Depending on applicable laws, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your information</li><li>Correct inaccurate information</li><li>Delete your account</li><li>Withdraw consent where applicable</li><li>Request a copy of your personal information</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">8. Children's Privacy</h3>
              <p className="mb-2">Knot is intended only for users aged 18 years or older.</p>
              <p>We do not knowingly collect information from anyone under 18. If we discover an account belonging to a minor, we will remove it promptly.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">9. Changes to this Policy</h3>
              <p>We may update this Privacy Policy periodically. Changes become effective when published on this page.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">10. Contact</h3>
              <p>Clean Connect</p>
              <p>Email: <a href="mailto:cleanconnectng@gmail.com" className="text-[#D4AF37] hover:underline">cleanconnectng@gmail.com</a></p>
            </section>
          </div>

          {/* SECTION 2: CHILD SAFETY STANDARDS */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white border-b border-[#2A3143] pb-2 mb-4">Part 2: Child Safety Standards</h2>
            
            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Our Commitment</h3>
              <p className="mb-2">Clean Connect is committed to protecting children from exploitation and abuse.</p>
              <p className="mb-2">Knot is designed exclusively for adults aged 18 years and older.</p>
              <p className="font-bold text-white bg-red-900/20 border border-red-500/30 p-4 rounded-lg">We maintain a zero-tolerance policy toward Child Sexual Abuse Material (CSAM), Child Sexual Abuse and Exploitation (CSAE), grooming, trafficking, or any activity that endangers minors.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Age Requirement</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Only users 18 years or older may create accounts.</li>
                <li>Users who falsely claim to be adults will have their accounts permanently removed.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Prohibited Conduct</h3>
              <p className="mb-2">The following is strictly prohibited:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Uploading CSAM</li><li>Requesting CSAM</li><li>Sharing CSAM</li><li>Promoting CSAM</li><li>Grooming minors</li><li>Sexual exploitation of children</li><li>Human trafficking involving minors</li><li>Soliciting minors</li><li>Impersonating minors</li><li>Any illegal activity involving children</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Reporting</h3>
              <p className="mb-2">Users can report:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Suspicious profiles</li><li>Child exploitation</li><li>Illegal activity</li><li>Abuse</li><li>Harassment</li>
              </ul>
              <p className="mb-2">Reports can be submitted:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Through the in-app Report User feature</li>
                <li>By emailing <a href="mailto:cleanconnectng@gmail.com" className="text-[#D4AF37] hover:underline">cleanconnectng@gmail.com</a></li>
              </ul>
              <p className="mt-4 italic">Reports are reviewed as quickly as possible.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Enforcement</h3>
              <p className="mb-2">Violations may result in:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Immediate account suspension</li><li>Permanent account termination</li><li>Removal of offending content</li><li>Reporting to law enforcement where legally required</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Identity Verification</h3>
              <p>To promote user safety, Knot may require identity verification using government-issued identification or other verification methods.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Cooperation with Authorities</h3>
              <p>Where legally required, we cooperate with law enforcement agencies and child protection organizations investigating child exploitation or abuse.</p>
            </section>
          </div>

          {/* SECTION 3: COMMUNITY GUIDELINES */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white border-b border-[#2A3143] pb-2 mb-4">Part 3: Community Guidelines</h2>
            <p className="mb-6 text-lg">Our goal is to create a respectful, authentic, and safe matchmaking community.</p>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Be Respectful</h3>
              <p className="mb-2">Treat everyone with kindness. Do not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Harass</li><li>Threaten</li><li>Bully</li><li>Intimidate</li><li>Stalk</li><li>Hate speech</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Be Honest</h3>
              <p className="mb-2">Users must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use real photographs</li><li>Provide truthful information</li><li>Avoid impersonation</li><li>Avoid fake accounts</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">No Illegal Activities</h3>
              <p className="mb-2">Users may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Buy or sell illegal goods</li><li>Promote criminal activities</li><li>Share illegal content</li><li>Commit fraud</li><li>Solicit prostitution</li><li>Promote trafficking</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">No Sexual Exploitation</h3>
              <p className="mb-2">We strictly prohibit:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Child exploitation</li><li>Non-consensual sexual content</li><li>Revenge pornography</li><li>Sexual coercion</li><li>Blackmail</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Privacy</h3>
              <p className="mb-2">Respect other users' privacy. Do not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Share personal information without permission</li><li>Publish private conversations</li><li>Dox other users</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Fraud Prevention</h3>
              <p className="mb-2">Do not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Scam users</li><li>Request money deceptively</li><li>Operate fake investment schemes</li><li>Catfish</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Reporting & Blocking</h3>
              <p className="mb-2">If you experience harassment, abuse, scams, fake profiles, or child safety concerns, use the in-app <strong>Report User</strong> feature immediately.</p>
              <p>Users may also block anyone they no longer wish to communicate with.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">Enforcement</h3>
              <p className="mb-2">Violations may result in:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Warning</li><li>Temporary suspension</li><li>Permanent account removal</li><li>Reporting to law enforcement where appropriate</li>
              </ul>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
