import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">Last updated: July 25, 2024</p>

        <p className="mb-4">
          Welcome to wozza ("us", "we", or "our"). We operate the wozza website and the AI-powered WhatsApp bot building service (hereinafter referred to as the "Service").
        </p>

        <p className="mb-4">
          Our Privacy Policy governs your visit to our website and use of our Service, and explains how we collect, safeguard and disclose information that results from your use of our Service.
        </p>

        <p className="mb-4">
          We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Information Collection and Use</h2>
        <p className="mb-4">
          We collect several different types of information for various purposes to provide and improve our Service to you.
        </p>

        <h3 className="text-xl font-bold mt-4 mb-2">Types of Data Collected</h3>
        <p className="mb-4">
          <strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Email address</li>
          <li>First name and last name</li>
          <li>Phone number</li>
          <li>Cookies and Usage Data</li>
        </ul>

        <p className="mb-4">
          <strong>Usage Data:</strong> We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Use of Data</h2>
        <p className="mb-4">
          wozza uses the collected data for various purposes:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>To provide and maintain our Service</li>
          <li>To notify you about changes to our Service</li>
          <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information so that we can improve our Service</li>
          <li>To monitor the usage of our Service</li>
          <li>To detect, prevent and address technical issues</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-2">Data Security</h2>
        <p className="mb-4">
          The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>

        <p className="mb-4">
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us by email: support@wozza.io
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 