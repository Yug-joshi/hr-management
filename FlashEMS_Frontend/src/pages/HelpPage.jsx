import React, { useState } from 'react';
import { FiHelpCircle, FiBook, FiMessageCircle, FiMail, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'How do I apply for leave?', a: 'Navigate to "Leave Management" from the sidebar, select the "Apply for Leave" tab, fill in the form with your leave type, dates, and reason, then click Submit.' },
    { q: 'How do I download my payslip?', a: 'Go to "Salary / Payslips" section. You\'ll see your payslip history with a Download button next to each record.' },
    { q: 'How can I update my profile?', a: 'Visit "My Profile" page, click "Edit Profile", make your changes, then click "Save Changes".' },
    { q: 'Who can see my performance reviews?', a: 'Your performance reviews are visible to you, your HR Manager, and the System Administrator. Other employees cannot see your reviews.' },
    { q: 'How do I submit daily work updates?', a: 'Go to "Work Updates" in the sidebar, click "Submit Update", fill in the title and description of your work, then submit.' },
  ];

  return (
    <div className="animate-in">
      <div className="mb-6">
        <div className="page-label">Support</div>
        <h1 className="page-title">Help Center</h1>
        <p className="page-subtitle">Find answers to common questions and get support.</p>
      </div>

      <div className="grid-3 mb-8">
        {[
          { icon: <FiBook />, title: 'Documentation', desc: 'Read the user guide', color: '#2b3bf7', bg: '#eceeff' },
          { icon: <FiMessageCircle />, title: 'Live Chat', desc: 'Chat with support', color: '#10b981', bg: '#d1fae5' },
          { icon: <FiMail />, title: 'Email Support', desc: 'support@flashems.com', color: '#f59e0b', bg: '#fef3c7' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => alert(`${item.title}: Coming soon!`)}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem' }}>{item.icon}</div>
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm text-muted mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="font-bold text-lg mb-4">Frequently Asked Questions</h2>
      <div className="flex-col gap-3" style={{ maxWidth: '700px' }}>
        {faqs.map((faq, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer', padding: '1rem 1.5rem' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">{faq.q}</span>
              {openFaq === i ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {openFaq === i && <p className="text-sm text-muted mt-3" style={{ lineHeight: 1.6 }}>{faq.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
