// src/lib/email/templates/reviewReminderTemplate.ts

interface ReviewReminderEmailData {
  name?: string
  stateCode: string
  dueDate: string
  notes?: string
  dashboardUrl: string
}

export function getReviewReminderEmailHTML(data: ReviewReminderEmailData): string {
  const { name, stateCode, dueDate, notes, dashboardUrl } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Review Reminder: ${stateCode}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #1a2a4f 0%, #0f1a33 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      opacity: 0.8;
      font-size: 14px;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1a2a4f;
    }
    .state-badge {
      display: inline-block;
      background: #e5e7eb;
      color: #1f2937;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .info-box {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
      border-left: 4px solid #c8a23b;
    }
    .info-box p {
      margin: 8px 0;
    }
    .info-box p:first-child {
      margin-top: 0;
    }
    .info-box p:last-child {
      margin-bottom: 0;
    }
    .label {
      font-weight: 600;
      color: #4b5563;
    }
    .tables-list {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .tables-list h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    .tables-list ul {
      margin: 0;
      padding-left: 20px;
    }
    .tables-list li {
      margin: 8px 0;
      color: #4b5563;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #c8a23b;
      color: white;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 500;
      margin: 24px 0 16px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background: #b08a2e;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #c8a23b;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>📋 Data Review Reminder</h1>
        <p>Veridian Group Compliance Platform</p>
      </div>
      
      <div class="content">
        <div class="greeting">
          ${name ? `Hello ${name},` : 'Hello,'}
        </div>
        
        <div class="state-badge">
          ${stateCode}
        </div>
        
        <p>This is a reminder that you have a <strong>scheduled data review</strong> for <strong>${stateCode}</strong>.</p>
        
        <div class="info-box">
          <p><span class="label">📅 Due Date:</span> ${dueDate}</p>
          ${notes ? `<p><span class="label">📝 Notes:</span> ${notes}</p>` : ''}
        </div>
        
        <div class="tables-list">
          <h4>📊 Tables to Review:</h4>
          <ul>
            <li><strong>Technology Vendors</strong> - Verify pricing, vendor recommendations, and implementation timelines</li>
            <li><strong>Budget Templates</strong> - Confirm budget ranges by company size are accurate</li>
            <li><strong>Market Metrics</strong> - Check growth rates, competitor density, and opportunity scores</li>
            <li><strong>Talent Metrics</strong> - Validate salary data, talent availability, and recruitment channels</li>
            <li><strong>Next Steps</strong> - Review action items and compliance calendar accuracy</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">
            Go to Verification Dashboard →
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
          Please log in to review and verify the data. Once completed, mark the review as complete in the dashboard.
        </p>
      </div>
      
      <div class="footer">
        <p>You're receiving this email because you're assigned to review data for ${stateCode}.</p>
        <p>© ${new Date().getFullYear()} Veridian Group · Compliance Intelligence Platform</p>
        <p><a href="${dashboardUrl}">Manage your review settings</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export function getReviewReminderEmailText(data: ReviewReminderEmailData): string {
  const { name, stateCode, dueDate, notes, dashboardUrl } = data

  return `
DATA REVIEW REMINDER: ${stateCode}
${'='.repeat(40)}

${name ? `Hello ${name},` : 'Hello,'}

This is a reminder that you have a scheduled data review for ${stateCode}.

Due Date: ${dueDate}
${notes ? `Notes: ${notes}` : ''}

Tables to Review:
- Technology Vendors - Verify pricing, vendor recommendations, and implementation timelines
- Budget Templates - Confirm budget ranges by company size are accurate  
- Market Metrics - Check growth rates, competitor density, and opportunity scores
- Talent Metrics - Validate salary data, talent availability, and recruitment channels
- Next Steps - Review action items and compliance calendar accuracy

Please log in to review and verify the data:
${dashboardUrl}

Once completed, mark the review as complete in the dashboard.

---
You're receiving this email because you're assigned to review data for ${stateCode}.
Veridian Group · Compliance Intelligence Platform
  `
}