import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../types';
import { Colors } from '../theme/colors';

type LegalRoute = RouteProp<RootStackParamList, 'Legal'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LegalScreen() {
  const { params } = useRoute<LegalRoute>();
  const navigation = useNavigation<Nav>();
  const { isDarkMode } = useTheme();

  const type = params.type;
  const title = type === 'tos' ? 'Terms of Service' : type === 'privacy' ? 'Privacy Policy' : 'Community Guidelines & Safety Standards';

  const tosContent = `TERMS OF SERVICE

Last Updated: July 17, 2026

These Terms of Service ("Terms") govern your access to and use of the Knot application, website, and related services.
By creating an account or using Knot, you agree to these Terms, our Privacy Policy, and our Community Guidelines.
If you do not agree to these Terms, you must not use the Services.

1. ABOUT KNOT

Knot is a technology platform designed to help users discover, connect with, communicate with, and learn about potential matches.
Knot may provide:
• User profiles
• Matchmaking features
• AI-powered recommendations
• Identity verification
• Messaging
• AI Coach features
• AI Chat Assistant features
• Safety tools
• Reporting and blocking tools

Knot does not guarantee that any user is truthful, safe, compatible, trustworthy, or suitable for a relationship.

2. ELIGIBILITY

You may use Knot only if:
• You meet the minimum legal age required to use the Services in your jurisdiction;
• You are legally capable of entering into these Terms;
• You are not prohibited from using the Services under applicable law;
• You provide accurate information.

Knot is not intended for children.
You may not create an account for another person without authorization.

3. YOUR ACCOUNT

You are responsible for:
• Providing accurate information
• Maintaining the security of your account
• Keeping your login credentials confidential
• All activity occurring through your account

You must notify us if you believe your account has been compromised.
You may not:
• Create fraudulent accounts
• Create multiple accounts to evade enforcement
• Impersonate another person
• Use another person's identity
• Misrepresent your age
• Sell, transfer, or rent your account

4. IDENTITY VERIFICATION

Knot may offer or require identity verification.
Verification may involve:
• A selfie
• Identity documents
• Automated identity analysis
• Facial comparison
• Document authenticity checks
• Fraud detection

Knot may restrict profile visibility or access to certain features until verification is completed.
A verified account does not mean that Knot guarantees the user's:
• Character
• Honesty
• Safety
• Relationship intentions
• Criminal history
• Financial reliability
• Compatibility

Users should exercise independent judgment when interacting with others.

5. PUBLIC PROFILE VISIBILITY

Knot may allow users to create profiles that can be discovered by other users.
Knot may restrict public visibility until:
• Required information is provided;
• Identity verification is completed;
• Safety checks are completed;
• Other applicable requirements are satisfied.

Knot may remove, restrict, suspend, or limit profile visibility where we believe doing so is necessary for safety, fraud prevention, policy enforcement, or legal compliance.

6. AI FEATURES

Knot may provide AI Coach, AI Chat Assistant, AI matching, recommendation, moderation, and other automated features.

AI is not human. Knot's AI features are artificial intelligence systems.
They are not:
• Human users
• Romantic partners
• Real members of the Knot community
• Licensed professionals unless expressly stated otherwise

AI-generated information may be:
• Inaccurate
• Incomplete
• Inappropriate
• Outdated
• Misleading

You are responsible for evaluating AI-generated content before relying on it.
AI output does not constitute professional medical, psychological, legal, financial, or other regulated advice.
You must not rely solely on AI output in emergencies or other situations requiring professional assistance.

7. USER CONTENT

You retain ownership of content that you submit to Knot, subject to the rights necessary for us to operate the Services.
By submitting content, you grant Knot a limited, non-exclusive, worldwide license to host, store, process, reproduce, display, transmit, and technically modify that content as reasonably necessary to provide, secure, moderate, and improve the Services.
This license ends when the content is deleted, except where retention is reasonably necessary for legal, security, fraud-prevention, dispute-resolution, or backup purposes.
You represent that:
• You own or have permission to submit your content;
• Your content is accurate where you represent it as factual;
• Your content does not violate applicable law;
• Your content does not violate these Terms or the Community Guidelines.

8. PROHIBITED USES

You may not use Knot to:
• Commit fraud
• Scam or deceive users
• Impersonate another person
• Create fake identities
• Harass, threaten, stalk, or intimidate
• Promote terrorism or violent criminal activity
• Facilitate trafficking or exploitation
• Promote prostitution or sexual services
• Exploit minors
• Groom minors
• Distribute child sexual abuse material
• Share non-consensual intimate material
• Threaten or encourage violence
• Promote illegal drugs or illegal activities
• Circumvent safety systems
• Attempt to access another user's account
• Introduce malware or malicious code
• Scrape or collect user information without authorization
• Use bots or automated systems to abuse the Services
• Use Knot for unauthorized commercial solicitation
• Use AI features to create scams, impersonation content, harassment, or illegal content

9. USER-TO-USER INTERACTIONS

You are solely responsible for your interactions with other users.
Knot does not guarantee the identity, intentions, safety, or honesty of any user.
You should:
• Avoid sending money to people you have only met online;
• Be cautious about sharing sensitive information;
• Use blocking and reporting tools where necessary;
• Exercise caution before meeting anyone in person;
• Tell a trusted person about planned meetings;
• Seek help if you feel threatened or unsafe.

Knot does not conduct a complete background investigation of every user.

10. REPORTING AND MODERATION

Users may report content or behavior that violates these Terms or our Community Guidelines.
We may:
• Review reports
• Remove content
• Restrict visibility
• Limit account functionality
• Require verification
• Suspend accounts
• Permanently terminate accounts
• Preserve information for safety or legal purposes
• Report conduct to appropriate authorities where legally required or appropriate

We may use human review, automated systems, artificial intelligence, or a combination of methods to detect violations.
We do not guarantee that every violation will be detected or prevented.

11. SUSPENSION AND TERMINATION

We may suspend or terminate your account if:
• You violate these Terms;
• You violate the Community Guidelines;
• You provide false or fraudulent information;
• You create a safety risk;
• You engage in illegal activity;
• You attempt to evade enforcement;
• We are legally required to do so;
• We reasonably believe action is necessary to protect users or the Services.

You may stop using Knot at any time.
Certain provisions of these Terms may survive termination, including provisions relating to intellectual property, liability, disputes, and information that must be retained by law.

12. INTELLECTUAL PROPERTY

The Services and their content, excluding user content, may be owned by or licensed to Knot.
This includes:
• Software
• Branding
• Logos
• Designs
• Text
• Graphics
• AI interfaces
• Features
• Technology

You may not copy, modify, distribute, sell, reverse engineer, or commercially exploit the Services except as permitted by law or with our written permission.

13. DISCLAIMERS

To the maximum extent permitted by law, the Services are provided on an "as available" basis.
Knot does not guarantee:
• Continuous availability
• Error-free operation
• That all users are genuine
• That all information is accurate
• That matches will be successful
• That users will be safe
• That AI outputs will be accurate
• That the Services will meet every individual expectation

Knot is a technology platform and does not guarantee personal, romantic, financial, physical, or emotional outcomes.

14. LIMITATION OF LIABILITY

To the maximum extent permitted by applicable law, Knot and its operators, employees, affiliates, contractors, and service providers will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Services.
Nothing in these Terms excludes liability that cannot legally be excluded.

15. INDEMNIFICATION

To the extent permitted by applicable law, you agree to defend, indemnify, and hold harmless Knot and its representatives from claims, losses, liabilities, damages, and expenses arising from:
• Your violation of these Terms;
• Your violation of applicable law;
• Your user content;
• Your interactions with other users;
• Your misuse of the Services.

16. CHANGES TO THE SERVICES

We may modify, suspend, or discontinue features or Services.
We may introduce new features, including new AI features, security features, or verification methods.
Material changes to these Terms may be communicated through appropriate means.

17. GOVERNING LAW AND DISPUTES

These Terms shall be governed by the laws of [Insert Jurisdiction], subject to applicable mandatory consumer-protection laws.
Disputes shall be handled in the courts or dispute-resolution forum legally applicable to [Insert Jurisdiction], unless applicable law requires otherwise.

18. CONTACT

Company: Clean Connect
Email: cleanconnectng@gmail.com`;

  const privacyContent = `PRIVACY POLICY

Last Updated: July 17, 2026

Knot ("Knot," "we," "us," or "our") is a matchmaking and relationship platform operated by Clean Connect ("Company").
This Privacy Policy explains how we collect, use, disclose, store, protect, and otherwise process personal information when you use the Knot mobile application, website, and related services (collectively, the "Services").
By using Knot, you acknowledge that you have read and understood this Privacy Policy.

1. INFORMATION WE COLLECT

The information we collect depends on how you use the Services.

1.1 Account and Registration Information
When you create an account, we may collect:
• Name or display name
• Email address
• Telephone number
• Password or authentication credentials
• Date of birth or age information
• Gender and relationship preferences
• Account identifiers
• Login and authentication information

You are responsible for ensuring that the information you provide is accurate and truthful.

1.2 Profile Information
You may voluntarily provide information for your Knot profile, including:
• Profile photographs
• Biography and personal description
• Location or general area
• Education
• Profession or occupation
• Interests and hobbies
• Relationship preferences
• Lifestyle preferences
• Religious or cultural information, where voluntarily provided
• Other information you choose to include in your profile

Some information may be visible to other users depending on your privacy settings and the functionality of the Services.

1.3 Identity Verification Information
Knot may provide identity verification features designed to improve trust, authenticity, fraud prevention, and platform safety.
Where you choose or are required to complete verification, we may collect:
• A selfie or verification photograph
• Images of identity documents
• Information extracted from identity documents
• Verification results
• Information used to compare a selfie with an identity document photograph
• Fraud-prevention and authenticity signals

Depending on the technology used, identity verification may involve automated systems, artificial intelligence, facial comparison, document analysis, or third-party verification service providers.

We process verification information for purposes including:
• Confirming that an account is associated with a real person
• Detecting fraudulent or manipulated identity documents
• Preventing impersonation
• Preventing duplicate or fraudulent accounts
• Protecting users and platform integrity
• Determining whether a profile may become publicly visible or receive a verification status

Verification does not guarantee that a user is completely safe, truthful, trustworthy, or suitable for a relationship.
We retain verification information only for as long as reasonably necessary for the purposes described in this Privacy Policy, applicable legal requirements, fraud prevention, dispute resolution, and legitimate platform-safety purposes.

2. ARTIFICIAL INTELLIGENCE FEATURES

Knot may use artificial intelligence and automated technologies to provide certain features.

2.1 AI Matching and Recommendations
Knot may process information such as: Profile information, Preferences, Interests, Interaction information, Compatibility information, and User-provided preferences to generate recommendations, compatibility suggestions, and potential matches.
AI-generated recommendations are suggestions only. Knot does not guarantee that a recommended person is compatible, trustworthy, safe, truthful, or suitable for a relationship.

2.2 AI Coach
Knot may provide an AI Coach to assist with matters such as: Profile improvement, Communication suggestions, Conversation guidance, Relationship-related general guidance, Dating suggestions, Questions about using Knot, and General interpersonal advice.
The AI Coach is an automated software system. It is not a human being and does not provide professional medical, psychological, legal, financial, or other regulated professional advice.
AI responses may be incomplete, inaccurate, outdated, or unsuitable for your particular circumstances. You remain responsible for your own decisions.

2.3 AI Chat Assistant
Knot may provide an AI Chat Assistant that allows users to interact with an artificial intelligence system.
The AI Chat Assistant:
• Is not a human user
• Is not a romantic partner
• Is not a real member of the Knot community
• Does not represent an actual person
• May generate inaccurate or inappropriate responses

Information submitted to AI features may be processed by Knot and, where applicable, authorized third-party AI technology providers to generate responses, recommendations, moderation results, or other requested functionality.

3. THIRD-PARTY AI AND TECHNOLOGY PROVIDERS

Knot may use third-party service providers to provide certain technologies, including: Artificial intelligence services, Identity verification, Cloud hosting, Database infrastructure, Security services, Analytics, Communication services, Email and SMS services, and Customer support tools.
Where information is sent to a third-party provider, it is processed for the relevant service or business purpose, subject to applicable contractual, technical, and legal safeguards.
The exact providers used by Knot may change over time. We will update this Privacy Policy or provide appropriate notices where required.

4. INFORMATION FROM COMMUNICATIONS AND INTERACTIONS

If you communicate with other users through Knot, we may process information associated with those interactions, including: Messages, Reports, Block information, Content submitted for moderation, Safety complaints, and Metadata associated with interactions.
We may process communications and related information to: Provide the messaging service, Detect fraud and scams, Investigate reports, Enforce Community Guidelines, Prevent harassment/abuse/exploitation/illegal activity, Protect users and the platform, and Comply with legal obligations.
We do not guarantee that every harmful, fraudulent, or illegal activity will be detected.

5. DEVICE AND TECHNICAL INFORMATION

When you use Knot, we may automatically collect information such as: Device type, Operating system, App version, IP address, Device identifiers, Crash information, Log information, Network information, General location information, Usage information, and Security and fraud-prevention signals.
We use this information to operate, secure, improve, and troubleshoot the Services.

6. LOCATION INFORMATION

Knot may process location information where you provide it or where it is technically collected with appropriate permission.
Location information may be used for: Showing approximate location or distance, Improving match recommendations, Providing location-related features, Security and fraud prevention, and Improving the Services.
Knot may use approximate location rather than precise location where precise location is not necessary.
We do not publicly display your exact residential address unless you voluntarily provide such information in a manner that makes it visible.

7. HOW WE USE INFORMATION

We may use information to: Create and manage accounts, Provide matchmaking services, Generate recommendations, Provide AI features, Conduct identity verification, Prevent fraud and impersonation, Protect users, Moderate content and activity, Process reports and complaints, Provide customer support, Improve and develop the Services, Communicate with users, Detect security incidents, Comply with applicable laws, and Enforce our Terms of Service and Community Guidelines.

8. HOW WE SHARE INFORMATION

We may share information with:
Service Providers – Companies that help us operate the Services, including providers of: Hosting, Databases, AI technology, Identity verification, Security, Analytics, Communications, and Customer support.
Other Users – Information that you choose to place on your public or discoverable profile may be visible to other users.
Legal and Safety Authorities – We may disclose information where we reasonably believe disclosure is necessary to: Comply with law, Respond to valid legal processes, Protect users, Prevent fraud, Investigate suspected criminal conduct, Address threats to safety, and Protect our rights or property.
Business Transfers – Information may be transferred in connection with a merger, acquisition, restructuring, financing, sale of assets, or similar transaction.
We do not sell personal information in the ordinary sense of selling user databases to third parties for their independent marketing purposes.

9. DATA RETENTION

We retain information for as long as reasonably necessary for: Providing the Services, Maintaining accounts, Safety and fraud prevention, Legal compliance, Dispute resolution, Enforcing agreements, and Legitimate business purposes.
Different categories of information may be retained for different periods.
When information is no longer reasonably necessary, we may delete, anonymize, or securely dispose of it, subject to legal, security, and fraud-prevention requirements.

10. DATA SECURITY

We use reasonable technical and organizational safeguards designed to protect information from unauthorized access, alteration, disclosure, or destruction.
However, no internet transmission or storage system can be guaranteed to be completely secure.
You are responsible for protecting your account credentials and should immediately report suspected unauthorized access.

11. YOUR RIGHTS AND CHOICES

Depending on applicable law, you may have rights to: Access personal information, Request correction of inaccurate information, Request deletion, Request restriction of processing, Object to certain processing, Request data portability, and Withdraw consent where processing is based on consent.
Some requests may be subject to legal limitations or verification requirements.
To exercise applicable rights, contact: cleanconnectng@gmail.com

12. CHILDREN AND MINORS

Knot is not intended for children or users who are below the minimum age permitted under applicable law.
We do not knowingly permit children to create accounts or use adult matchmaking services.
If we learn that a child has created an account in violation of applicable requirements, we may take appropriate action, including removing the account and associated information where appropriate.
Users must not use Knot to: Groom minors, Exploit minors, Facilitate sexual exploitation of minors, Contact minors for illegal or abusive purposes, or Upload or distribute child sexual abuse material.
Any suspected child exploitation or abuse may be reported to appropriate authorities where required or permitted by law.

13. INTERNATIONAL DATA PROCESSING

Depending on where our service providers are located, information may be processed in countries other than the country in which you live.
Where required by applicable law, we will use appropriate safeguards for international transfers.

14. THIRD-PARTY LINKS AND SERVICES

Knot may contain links to third-party services.
We are not responsible for the privacy practices of third-party websites or services that we do not control.
You should review the privacy policies of third-party services before providing information to them.

15. CHANGES TO THIS PRIVACY POLICY

We may update this Privacy Policy from time to time.
When we make material changes, we may provide notice through the Services or other appropriate means.
The "Last Updated" date indicates when this Privacy Policy was most recently revised.

16. CONTACT US

For privacy questions or requests:
Company: Clean Connect
Email: cleanconnectng@gmail.com`;

  const communityContent = `KNOT COMMUNITY GUIDELINES & SAFETY STANDARDS

Last Updated: July 17, 2026

Knot is designed to help people connect in a respectful, authentic, and safer environment.
These Community Guidelines apply to all users, profiles, messages, photographs, interactions, and content on Knot.
Violations may result in content removal, account restrictions, suspension, permanent termination, or referral to appropriate authorities where necessary.

1. BE AUTHENTIC

Users must:
• Use their real identity;
• Use recent and authentic photographs;
• Provide truthful information;
• Accurately represent their age;
• Avoid impersonation;
• Avoid creating fake accounts;
• Avoid creating accounts for other people without authorization.

You must not use another person's photographs or identity to mislead users.

2. RESPECT OTHER USERS

Treat other people with respect.
Prohibited conduct includes:
• Harassment
• Threats
• Bullying
• Intimidation
• Stalking
• Persistent unwanted contact
• Abusive or degrading conduct
• Targeted humiliation
• Blackmail
• Extortion

A user may block or report another user at any time.

3. NO FRAUD OR SCAMS

Knot must not be used to:
• Request money through deception;
• Run investment scams;
• Promote fake financial opportunities;
• Impersonate officials or organizations;
• Obtain passwords or financial information fraudulently;
• Manipulate users for financial gain;
• Conduct romance scams;
• Promote fraudulent schemes.

Users should be extremely cautious if another user:
• Quickly asks for money;
• Claims to have an emergency;
• Requests cryptocurrency or financial transfers;
• Requests banking information;
• Avoids video or other reasonable identity confirmation;
• Pressures you to move to another platform immediately.

4. NO ILLEGAL ACTIVITIES

Users may not use Knot to:
• Promote criminal activity;
• Buy or sell illegal goods;
• Facilitate trafficking;
• Promote terrorism;
• Promote violent criminal activity;
• Facilitate fraud;
• Promote illegal drugs;
• Arrange illegal services;
• Engage in other unlawful conduct.

5. SEXUAL EXPLOITATION AND MINOR SAFETY

Knot does not tolerate:
• Sexual exploitation of minors;
• Grooming;
• Sexual solicitation involving minors;
• Child sexual abuse material;
• Sexual trafficking;
• Sexual coercion;
• Sexual blackmail;
• Attempts to arrange sexual exploitation.

Users must not use Knot to target, exploit, groom, or sexually abuse minors.
We may take immediate action and report suspected child exploitation or abuse to appropriate authorities where required or appropriate.

6. SEXUAL CONTENT AND SERVICES

Users must not use Knot to:
• Solicit prostitution;
• Promote sexual services;
• Arrange sexual exploitation;
• Share intimate content without consent;
• Threaten to distribute intimate content;
• Use sexual content to harass or exploit another person.

Users should respect consent and personal boundaries.

7. HATE AND DISCRIMINATORY ABUSE

Knot does not permit targeted abuse or threats against people based on protected characteristics.
Content intended to promote hatred, dehumanization, violence, or targeted abuse is prohibited.
Respectful discussion of differences is not the same as targeted harassment or hate-based abuse.

8. AI SAFETY AND TRANSPARENCY

Knot's AI Coach and AI Chat Assistant are artificial intelligence features.
They are not:
• Human users;
• Real romantic partners;
• Real members of the Knot community.

Users must not:
• Present AI-generated content as the identity of a real person;
• Use AI to impersonate another person;
• Use AI to create scams;
• Use AI to manipulate users for fraud;
• Use AI to generate prohibited abusive content;
• Use AI to circumvent safety systems;
• Use AI to facilitate illegal activities.

AI-generated advice may be inaccurate and should be assessed using independent judgment.

9. AUTHENTIC PHOTOGRAPHS AND CONTENT

Users must not upload:
• Stolen photographs;
• Impersonation content;
• Fraudulent identity documents;
• Misleading identity materials;
• Content designed to deceive users.

Manipulated or AI-generated images may not be used to impersonate a real person or mislead others about identity.

10. PRIVACY AND PERSONAL INFORMATION

Do not publish another person's private information without authorization.
This includes:
• Home addresses;
• Private telephone numbers;
• Passwords;
• Financial information;
• Private identity documents;
• Private communications;
• Sensitive personal information.

Do not attempt to obtain another user's personal information through deception or unauthorized means.

11. SAFE MEETINGS

If you decide to meet someone you met through Knot:
• Take reasonable precautions;
• Consider meeting in an appropriate public place;
• Tell someone you trust about your plans;
• Avoid sharing unnecessary sensitive information;
• Do not send money to someone you have only met online;
• Leave if you feel unsafe or pressured.

Knot cannot guarantee the safety or conduct of any user.

12. REPORTING AND BLOCKING

If you believe that a user or content violates these Guidelines, use the available reporting tools.
Reports may relate to: Fraud, Harassment, Threats, Impersonation, Illegal activity, Exploitation, Suspicious conduct, Safety concerns, Prohibited content.
You may block users whose communications or conduct you do not wish to receive.
Knot may investigate reports using automated systems, AI-assisted systems, human review, or a combination of methods.

13. ENFORCEMENT

Depending on the circumstances, enforcement may include:
• Warning;
• Content removal;
• Reduced visibility;
• Feature restrictions;
• Required identity verification;
• Temporary suspension;
• Permanent account termination;
• Preservation of relevant information;
• Referral to law enforcement or other authorities where appropriate.

The severity of enforcement may depend on:
• The seriousness of the violation;
• Whether the conduct was repeated;
• Whether a user attempted to evade enforcement;
• Whether another person's safety was threatened;
• Applicable legal requirements.

14. FALSE REPORTS AND ABUSE OF SAFETY SYSTEMS

Users must not knowingly submit false reports designed to harass, defraud, or improperly remove another user.
However, users are encouraged to report genuine safety concerns in good faith.

15. OUR SAFETY APPROACH

Knot may use a combination of:
• Identity verification;
• Automated systems;
• Artificial intelligence;
• Human review;
• User reports;
• Account security controls;
• Content moderation;
• Fraud-prevention systems.

No safety system can prevent every harmful action.
Users should continue to exercise reasonable judgment and personal safety precautions.

16. CHANGES TO THESE GUIDELINES

We may update these Guidelines as the Services, technology, laws, and safety risks evolve.
Continued use of Knot after updated Guidelines take effect may constitute acceptance of the updated rules where permitted by law.

17. CONTACT AND REPORTING

For safety concerns or policy questions:

Company: Clean Connect
Email: cleanconnectng@gmail.com

If you are in immediate danger, contact the appropriate emergency services in your location.`;

  const content = type === 'tos' ? tosContent : type === 'privacy' ? privacyContent : communityContent;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
      <View style={[styles.header, { borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? Colors.white : Colors.dark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.text, { color: isDarkMode ? Colors.gray200 : Colors.gray800 }]}>
          {content.trim()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
});
