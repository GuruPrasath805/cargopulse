import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export interface ApprovalEmailPayload {
  to: string;
  name: string;
  role: string;
  portalTitle: string;
  loginUrl: string;
}

export interface DirectiveEmailPayload {
  to: string;
  name: string;
  role: string;
  subject: string;
  directiveType: 'SOP_UPDATE' | 'URGENT_ALERT' | 'AUDIT_NOTICE' | 'QUALITY_DIRECTIVE' | 'GENERAL_DIRECTIVE';
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  message: string;
  actionUrl?: string;
  actionText?: string;
}

// Read logo as base64 fallback
const getLogoBase64 = (): string => {
  const possiblePaths = [
    path.join(__dirname, '../assets/cargopulse-logo.png'),
    path.join(process.cwd(), 'src/assets/cargopulse-logo.png'),
    path.join(process.cwd(), 'dist/assets/cargopulse-logo.png'),
    path.join(process.cwd(), '../frontend/public/cargopulse-logo.png'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const buf = fs.readFileSync(p);
        return `data:image/png;base64,${buf.toString('base64')}`;
      } catch (e) {
        // ignore
      }
    }
  }
  return '';
};

const getLogoFilePath = (): string | null => {
  const possiblePaths = [
    path.join(__dirname, '../assets/cargopulse-logo.png'),
    path.join(process.cwd(), 'src/assets/cargopulse-logo.png'),
    path.join(process.cwd(), '../frontend/public/cargopulse-logo.png'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

interface RoleGuide {
  title: string;
  department: string;
  primaryResponsibilities: string[];
  operationalProtocols: { step: string; desc: string }[];
  keySop: string;
  badgeColor: string;
  accentColor: string;
}

const getRoleGuidelines = (role: string): RoleGuide => {
  switch (role) {
    case 'WAREHOUSE_MANAGER':
    case 'WAREHOUSE_STAFF':
      return {
        title: 'Warehouse & Inventory Command Center',
        department: 'Intralogistics & Inventory Control',
        badgeColor: '#ea580c',
        accentColor: '#fff7ed',
        primaryResponsibilities: [
          'Inbound pallet receiving & Goods Receipt Note (GRN) sign-off',
          'Dynamic bin allocation (Zone A fast-movers through Zone D cold chain)',
          'Safety stock monitoring & automated supplier purchase requests',
          'Cycle count audits with double-entry variance reconciliation',
        ],
        operationalProtocols: [
          { step: '1. Inbound Inspection', desc: 'Scan Bill of Lading (BOL), verify seal integrity, and log quantities in under 2 hours.' },
          { step: '2. Put-Away SOP', desc: 'Assign items to designated bin coordinates. Keep high-frequency SKUs in lower bays of Zone A.' },
          { step: '3. Low-Stock Alerts', desc: 'When stock crosses the safety threshold, trigger instant PO notifications via the portal.' },
          { step: '4. PulseAI Assistant', desc: 'Use PulseAI (bottom right of your screen) anytime to forecast replenishment cycles or query bin capacity.' },
        ],
        keySop: 'Never dispatch or stow unverified pallets without generating a barcode-verified GRN.',
      };

    case 'LOGISTICS_MANAGER':
      return {
        title: 'Logistics, Fleet & RouteIQ Dispatch Portal',
        department: 'Line-Haul Fleet & Multimodal Transport',
        badgeColor: '#2563eb',
        accentColor: '#eff6ff',
        primaryResponsibilities: [
          'Real-time GPS telematics, driver tracking & geofencing',
          'RouteIQ automated routing to avoid weather and traffic bottlenecks',
          'Electronic Proof of Delivery (e-POD) and OTP signature verification',
          'Carrier SLA governance, turnaround time (TAT) & fuel telemetry',
        ],
        operationalProtocols: [
          { step: '1. Dispatch Verification', desc: 'Confirm vehicle fitness, driver assignment, and RouteIQ corridor prior to greenlighting dispatch.' },
          { step: '2. Live Milestone Tracking', desc: 'Monitor telemetry pings every 60 seconds. Address waypoint deviations immediately.' },
          { step: '3. Delay Mitigation', desc: 'For transit delays > 30 minutes, update consignee alerts and reroute via secondary corridors.' },
          { step: '4. PulseAI Fleet Copilot', desc: 'Ask PulseAI: "List delayed shipments" or "Analyze fuel consumption on Route NH-44".' },
        ],
        keySop: 'Always review high-risk weather alerts and hill ghat sections before clearing long-haul interstate trips.',
      };

    case 'SUPPLIER':
      return {
        title: 'Supplier Procurement & PO Portal',
        department: 'Vendor Network & Order Fulfillment',
        badgeColor: '#059669',
        accentColor: '#ecfdf5',
        primaryResponsibilities: [
          'Digital Purchase Order (PO) acceptance & lead-time confirmation',
          'Advanced Shipping Notice (ASN) submission with packing lists',
          'Material Certificate of Analysis (COA) compliance & batch tracing',
          '3-way matching automated invoice reconciliation',
        ],
        operationalProtocols: [
          { step: '1. PO Acknowledgment', desc: 'Accept or adjust scheduled delivery dates within 4 business hours of order placement.' },
          { step: '2. ASN Generation', desc: 'File the ASN and tracking numbers at least 4 hours before vehicle dispatch.' },
          { step: '3. Batch QA', desc: 'Ensure every pallet contains high-contrast GS1 barcodes and batch compliance sheets.' },
          { step: '4. PulseAI Vendor Guide', desc: 'Use PulseAI to review SLA metrics, dispute resolutions, and payment milestones.' },
        ],
        keySop: 'Maintain on-time delivery rate above 95% and submit ASNs ahead of dispatch to guarantee zero dock hold-ups.',
      };

    case 'CUSTOMER':
      return {
        title: 'Consignment Tracking & RMA Portal',
        department: 'Client Deliveries & Reverse Logistics',
        badgeColor: '#7c3aed',
        accentColor: '#f5f3ff',
        primaryResponsibilities: [
          'Real-time minute-by-minute consignment tracking and ETA countdown',
          'Digital Proof of Delivery (e-POD) sign-off and receipt downloading',
          'One-click Return Merchandise Authorization (RMA) ticket filing',
          'Direct messaging with dispatch coordinators and PulseAI',
        ],
        operationalProtocols: [
          { step: '1. Live Tracking', desc: 'Enter your tracking ID (e.g. SH-10021) into the portal for live GPS location and status.' },
          { step: '2. Delivery Updates', desc: 'Provide gate access codes or reschedule preferred delivery windows before last-mile delivery.' },
          { step: '3. Easy RMA Returns', desc: 'Submit return requests within 48 hours directly through the portal with condition photos.' },
          { step: '4. PulseAI Assistant', desc: 'Ask PulseAI anytime: "Where is my shipment SH-10021?" for instant transit progress.' },
        ],
        keySop: 'Report any package damage upon unboxing within 48 hours for immediate expedited replacement.',
      };

    default:
      return {
        title: 'CargoPulse Unified Operations Portal',
        department: 'Platform Administration & Control',
        badgeColor: '#ff7a00',
        accentColor: '#fff7ed',
        primaryResponsibilities: [
          'Cross-portal user management, role approvals & access security',
          'System audit trail monitoring & performance metrics',
          'Centralized operations governance and notifications dispatch',
        ],
        operationalProtocols: [
          { step: '1. User Governance', desc: 'Review and approve new registrations across all portals.' },
          { step: '2. PulseAI Copilot', desc: 'Monitor platform intelligence and predictive supply chain risks in real time.' },
        ],
        keySop: 'Maintain strict role-based access control and review pending registrations daily.',
      };
  }
};

/**
 * Builds the enterprise HTML email with the embedded CargoPulse logo.
 */
const buildApprovalEmailHtml = (payload: ApprovalEmailPayload): string => {
  const guide = getRoleGuidelines(payload.role);
  const logoBase64 = getLogoBase64();
  const logoSrc = 'cid:cargopulselogo'; // Primary CID attachment

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CargoPulse Access Authorized</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
    
    <!-- HEADER WITH CARGOPULSE LOGO -->
    <tr>
      <td style="background-color: #090d16; padding: 28px 32px; border-bottom: 3px solid #ff7a00;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="56" style="vertical-align: middle;">
              <!-- Embedded CargoPulse Logo -->
              <img src="${logoSrc}" alt="CargoPulse" width="48" height="48" style="display: block; border-radius: 10px; border: 2px solid rgba(255,122,0,0.4);" />
            </td>
            <td style="vertical-align: middle; padding-left: 16px;">
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Cargo<span style="color: #ff7a00;">Pulse</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-top: 2px;">
                Next-Gen Supply Chain & Logistics Intelligence
              </div>
            </td>
            <td align="right" style="vertical-align: middle;">
              <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                &#10003; Approved
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- HERO BANNER -->
    <tr>
      <td style="padding: 32px 32px 24px 32px;">
        <div style="background-color: ${guide.accentColor}; border: 1px solid ${guide.badgeColor}33; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${guide.badgeColor}; margin-bottom: 4px;">
            ${guide.department} &bull; Access Granted
          </div>
          <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
            Welcome aboard, ${payload.name}
          </h1>
          <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
            Your registration for the <strong>${payload.portalTitle}</strong> has been officially approved by the CargoPulse Platform Administrator.
          </p>
        </div>

        <!-- CREDENTIALS & ACCESS BOX -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 28px;">
          <tr>
            <td style="padding: 20px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px;">
                Authorized Account Details
              </div>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                <tr>
                  <td width="130" style="color: #64748b; font-weight: 600;">Authorized Email:</td>
                  <td style="color: #0f172a; font-weight: 700; font-family: monospace;">${payload.to}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Assigned Role:</td>
                  <td>
                    <span style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                      ${payload.role}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Target Portal:</td>
                  <td style="color: #0f172a; font-weight: 600;">${payload.portalTitle}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Security Status:</td>
                  <td style="color: #16a34a; font-weight: 700;">Active &bull; Two-Factor Enabled &bull; Full Permissions</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- PRIMARY CALL TO ACTION BUTTON -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${payload.loginUrl}" style="background-color: #ff7a00; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(255, 122, 0, 0.35);">
            Launch ${payload.portalTitle} &rarr;
          </a>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
            Direct URL: <a href="${payload.loginUrl}" style="color: #ff7a00; text-decoration: underline;">${payload.loginUrl}</a>
          </div>
        </div>

        <!-- ROLE-SPECIFIC OPERATIONAL DIRECTIVE & SOP -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
          <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
            Role Operating Directives & Best Practices
          </h3>
          <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0; line-height: 1.5;">
            As an authorized <strong>${payload.role.replace(/_/g, ' ')}</strong>, you are responsible for maintaining system compliance in accordance with CargoPulse Standard Operating Procedures (SOP):
          </p>

          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
            ${guide.operationalProtocols.map(p => `
              <tr>
                <td style="padding: 8px 12px; vertical-align: top; background-color: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${p.step}</div>
                  <div style="font-size: 12px; color: #475569; line-height: 1.5;">${p.desc}</div>
                </td>
              </tr>
              <tr><td height="6"></td></tr>
            `).join('')}
          </table>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">
              Mandatory Platform SOP
            </div>
            <div style="font-size: 12px; color: #7f1d1d; margin-top: 2px; line-height: 1.4;">
              ${guide.keySop}
            </div>
          </div>
        </div>

        <!-- PULSE AI ASSISTANT HIGHLIGHT -->
        <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin-top: 28px; color: #ffffff;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="36" style="vertical-align: top;">
                <span style="font-size: 24px;">&#10024;</span>
              </td>
              <td style="padding-left: 12px;">
                <div style="font-size: 14px; font-weight: 800; color: #ff7a00; margin-bottom: 4px;">
                  PulseAI Operational Copilot is Ready to Assist You
                </div>
                <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                  Have questions about warehouse bin allocation, shipment GPS milestones, or supplier PO tracking? Click the orange PulseAI assistant button in the bottom right corner of any page for instant AI answers and automated platform navigation.
                </div>
              </td>
            </tr>
          </table>
        </div>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <strong>CargoPulse Enterprise Logistics Platform</strong><br/>
              Next-Gen Supply Chain Intelligence &bull; Track. Manage. Predict. Deliver.<br/>
              Support: <a href="mailto:support@cargopulse.io" style="color: #ff7a00; text-decoration: none;">support@cargopulse.io</a>
            </td>
            <td align="right" style="vertical-align: bottom;">
              <span style="font-size: 11px; color: #94a3b8;">Automated System Dispatch</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
};

/**
 * Builds direct operational directive email from Admin to a specific manager.
 */
const buildDirectiveEmailHtml = (payload: DirectiveEmailPayload): string => {
  const guide = getRoleGuidelines(payload.role);
  const logoSrc = 'cid:cargopulselogo';

  const priorityColors = {
    URGENT: { border: '#ef4444', bg: '#fef2f2', text: '#b91c1c', label: 'CRITICAL PRIORITY' },
    HIGH: { border: '#f59e0b', bg: '#fffbeb', text: '#b45309', label: 'HIGH PRIORITY' },
    NORMAL: { border: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', label: 'STANDARD NOTICE' },
  };

  const pri = priorityColors[payload.priority || 'NORMAL'];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${payload.subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
    
    <!-- HEADER WITH LOGO -->
    <tr>
      <td style="background-color: #090d16; padding: 24px 32px; border-bottom: 3px solid #ff7a00;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="48">
              <img src="${logoSrc}" alt="CargoPulse" width="44" height="44" style="display: block; border-radius: 8px;" />
            </td>
            <td style="padding-left: 14px;">
              <div style="font-size: 20px; font-weight: 800; color: #ffffff;">
                Cargo<span style="color: #ff7a00;">Pulse</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                Central Administration &bull; Operational Directive
              </div>
            </td>
            <td align="right">
              <span style="background-color: ${pri.bg}; border: 1px solid ${pri.border}; color: ${pri.text}; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px;">
                ${pri.label}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CONTENT -->
    <tr>
      <td style="padding: 32px;">
        <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
          Directive dispatched to: <strong>${payload.name}</strong> (${payload.role.replace(/_/g, ' ')})
        </div>
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
          ${payload.subject}
        </h2>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${payload.message}
        </div>

        ${payload.actionUrl ? `
          <div style="text-align: center; margin: 28px 0;">
            <a href="${payload.actionUrl}" style="background-color: #ff7a00; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              ${payload.actionText || 'Open Portal Dashboard'} &rarr;
            </a>
          </div>
        ` : ''}

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b;">
          <strong>Manager Note:</strong> Please acknowledge receipt or action this directive immediately through your assigned module portal. If you need clarification, open <strong>PulseAI</strong> inside the platform or reply to the platform administrator.
        </div>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        CargoPulse Enterprise Administration &bull; Automated Operations Dispatch<br/>
        Track. Manage. Predict. Deliver.
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Sends the approval email with embedded logo and role-tailored operational content.
 */
export const sendApprovalEmail = async (
  payload: ApprovalEmailPayload
): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || 'notifications@cargopulse.io';

  const htmlContent = buildApprovalEmailHtml(payload);
  const logoPath = getLogoFilePath();

  const attachments = logoPath
    ? [
        {
          filename: 'cargopulse-logo.png',
          path: logoPath,
          cid: 'cargopulselogo',
        },
      ]
    : [];

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: `"CargoPulse Platform" <${fromEmail}>`,
        to: payload.to,
        subject: `CargoPulse Access Authorized — Welcome to ${payload.portalTitle}`,
        text: `Hello ${payload.name}, your account registration for CargoPulse (${payload.portalTitle}) has been approved. You can sign in at ${payload.loginUrl}`,
        html: htmlContent,
        attachments,
      });

      console.log(`[EmailService] Sent approval email with logo to ${payload.to}, messageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] SMTP send error (falling back to audit log):', err);
    }
  }

  // Simulated log dispatch when SMTP is not configured in environment
  console.log('================================================================');
  console.log('[EMAIL SERVICE - APPROVAL DISPATCH WITH EMBEDDED LOGO]');
  console.log(`TO: ${payload.to} (${payload.name})`);
  console.log(`ROLE: ${payload.role}`);
  console.log(`PORTAL: ${payload.portalTitle}`);
  console.log(`LOGIN LINK: ${payload.loginUrl}`);
  console.log(`LOGO EMBEDDED: ${logoPath ? 'YES (CID: cargopulselogo)' : 'NO'}`);
  console.log('================================================================');

  return { success: true, simulated: true };
};

/**
 * Sends a custom operational directive or guidance email from Admin to a manager.
 */
export const sendDirectiveEmail = async (
  payload: DirectiveEmailPayload
): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || 'admin@cargopulse.io';

  const htmlContent = buildDirectiveEmailHtml(payload);
  const logoPath = getLogoFilePath();

  const attachments = logoPath
    ? [
        {
          filename: 'cargopulse-logo.png',
          path: logoPath,
          cid: 'cargopulselogo',
        },
      ]
    : [];

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: `"CargoPulse Central Admin" <${fromEmail}>`,
        to: payload.to,
        subject: `[CargoPulse Directive] ${payload.subject}`,
        text: `Attention ${payload.name} (${payload.role}): ${payload.message}`,
        html: htmlContent,
        attachments,
      });

      console.log(`[EmailService] Dispatched directive email to ${payload.to}, messageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] SMTP error sending directive:', err);
    }
  }

  // Simulated log dispatch
  console.log('================================================================');
  console.log('[EMAIL SERVICE - OPERATIONAL DIRECTIVE DISPATCH WITH LOGO]');
  console.log(`TO: ${payload.to} (${payload.name})`);
  console.log(`ROLE: ${payload.role}`);
  console.log(`PRIORITY: ${payload.priority || 'NORMAL'}`);
  console.log(`SUBJECT: ${payload.subject}`);
  console.log(`MESSAGE:
${payload.message}`);
  console.log('================================================================');

  return { success: true, simulated: true };
};
