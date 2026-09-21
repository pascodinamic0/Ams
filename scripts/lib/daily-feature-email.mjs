/** Shared HTML/text builder for daily feature brief emails (CI + scripts). */

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function button(href, label, primary = false) {
  const bg = primary ? "#1b3a4b" : "#ffffff";
  const color = primary ? "#ffffff" : "#1b3a4b";
  const border = primary ? "none" : "1px solid #1b3a4b";
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin:8px 12px 8px 0;padding:12px 22px;background:${bg};color:${color};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;border:${border};border-radius:4px;">${escapeHtml(label)}</a>`;
}

export function buildDailyFeatureBriefHtml(input) {
  const { featureName, gapClosed, prUrl, previewUrl, videoUrl, steps } = input;

  const stepBlocks = steps
    .map((step) => {
      const img = step.screenshotUrl
        ? `<p style="margin:12px 0;"><img src="${escapeHtml(step.screenshotUrl)}" alt="Step ${escapeHtml(step.letter)}" width="560" style="max-width:100%;border:1px solid #d6d3d1;border-radius:4px;" /></p>`
        : "";
      return `
        <div style="margin:0 0 28px 0;padding:0 0 20px 0;border-bottom:1px solid #e7e5e4;">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:9pt;letter-spacing:0.12em;text-transform:uppercase;color:#78716c;margin:0 0 6px 0;">Step ${escapeHtml(step.letter)}</p>
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:12pt;font-weight:700;color:#1b3a4b;margin:0 0 10px 0;">${escapeHtml(step.caption)}</p>
          ${img}
        </div>`;
    })
    .join("");

  const videoBlock = videoUrl
    ? `<p style="margin:20px 0;text-align:center;">${button(videoUrl, "Watch the walkthrough", true)}</p>`
    : `<p style="margin:20px 0;font-size:10pt;color:#78716c;text-align:center;">Video processing — use the preview link below to click through live.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Georgia,'Times New Roman',Times,serif;color:#1c1917;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:9pt;letter-spacing:0.28em;text-transform:uppercase;color:#57534e;text-align:center;margin:0 0 16px 0;">ShuleOS · Daily feature</p>
    <div style="width:72px;height:2px;background:#1b3a4b;margin:0 auto 22px auto;"></div>
    <h1 style="font-family:Arial,Helvetica,sans-serif;font-size:22pt;line-height:1.25;color:#1b3a4b;text-align:center;margin:0 0 12px 0;">${escapeHtml(featureName)}</h1>
    <p style="font-size:12pt;color:#44403c;text-align:center;line-height:1.5;margin:0 auto 28px auto;max-width:520px;">${escapeHtml(gapClosed)}</p>
    <div style="text-align:center;margin:0 0 32px 0;">
      ${button(previewUrl, "Open preview", true)}
      ${button(prUrl, "Open the PR")}
    </div>
    ${videoBlock}
    <h2 style="font-family:Arial,Helvetica,sans-serif;font-size:13pt;color:#1b3a4b;text-align:center;letter-spacing:0.04em;margin:36px 0 8px 0;">A → Z walkthrough</h2>
    <div style="width:48px;height:1.5px;background:#1b3a4b;margin:0 auto 24px auto;"></div>
    ${stepBlocks}
    <p style="font-size:11pt;color:#57534e;text-align:center;margin:32px 0 0 0;line-height:1.6;">
      Merge the PR when you want this live. Close it if you want to drop it.<br />
      <strong style="color:#1b3a4b;">Merge = production on Vercel.</strong>
    </p>
  </div>
</body>
</html>`;
}

export function buildDailyFeatureBriefText(input) {
  const lines = [
    `ShuleOS — feature ready: ${input.featureName}`,
    "",
    input.gapClosed,
    "",
    `Preview: ${input.previewUrl}`,
    `PR: ${input.prUrl}`,
  ];
  if (input.videoUrl) lines.push(`Video: ${input.videoUrl}`);
  lines.push("", "A → Z walkthrough:");
  for (const step of input.steps) {
    lines.push(`  ${step.letter}. ${step.caption}`);
  }
  lines.push("", "Merge the PR to go live.");
  return lines.join("\n");
}
