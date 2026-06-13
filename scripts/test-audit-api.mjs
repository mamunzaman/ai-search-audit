const API_URL = process.env.AUDIT_API_URL ?? "http://localhost:3000/api/audit";

const tests = [
  { label: "https://example.com", url: "https://example.com", expectStatus: 200 },
  {
    label: "https://musikfest-bremen.de/",
    url: "https://musikfest-bremen.de/",
    expectStatus: 200,
  },
  { label: "musikfest-bremen.de", url: "musikfest-bremen.de", expectStatus: 200 },
  { label: "invalid-url", url: "invalid-url", expectStatus: 400 },
];

function isAuditResponse(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  const requiredStrings = [
    "url",
    "finalUrl",
    "title",
    "metaDescription",
    "canonical",
    "robotsMeta",
  ];

  for (const key of requiredStrings) {
    if (typeof data[key] !== "string") {
      return false;
    }
  }

  if (typeof data.statusCode !== "number") {
    return false;
  }

  if (!data.headings || typeof data.headings !== "object") {
    return false;
  }

  for (const tag of ["h1", "h2", "h3"]) {
    if (!Array.isArray(data.headings[tag])) {
      return false;
    }
  }

  if (!Array.isArray(data.schemaTypes)) {
    return false;
  }

  if (
    !data.links ||
    typeof data.links.internal !== "number" ||
    typeof data.links.external !== "number"
  ) {
    return false;
  }

  if (!Array.isArray(data.checks)) {
    return false;
  }

  if (
    !data.trustSignals ||
    typeof data.trustSignals.aboutPage !== "boolean" ||
    typeof data.trustSignals.contactPage !== "boolean" ||
    typeof data.trustSignals.privacyPage !== "boolean" ||
    typeof data.trustSignals.legalPage !== "boolean" ||
    typeof data.trustSignals.socialLinks !== "number" ||
    typeof data.trustSignals.externalAuthorityLinks !== "number"
  ) {
    return false;
  }

  if (
    !data.aiVisibilitySignals ||
    typeof data.aiVisibilitySignals.organizationSchema !== "boolean" ||
    typeof data.aiVisibilitySignals.faqSchema !== "boolean" ||
    typeof data.aiVisibilitySignals.clearH1 !== "boolean" ||
    typeof data.aiVisibilitySignals.metaDescription !== "boolean" ||
    typeof data.aiVisibilitySignals.structuredHeadings !== "boolean" ||
    typeof data.aiVisibilitySignals.internalLinks !== "boolean" ||
    typeof data.aiVisibilitySignals.trustPages !== "boolean" ||
    typeof data.aiVisibilitySignals.visibleFaqHints !== "boolean"
  ) {
    return false;
  }

  return data.checks.every(
    (check) =>
      check &&
      typeof check.id === "string" &&
      typeof check.label === "string" &&
      typeof check.status === "string" &&
      typeof check.message === "string",
  );
}

function summarizeChecks(checks) {
  const pass = checks.filter((check) => check.status === "pass").length;
  const fail = checks.filter((check) => check.status === "fail").length;
  const warn = checks.filter((check) => check.status === "warn").length;
  return `${checks.length} total (${pass} pass, ${fail} fail, ${warn} warn)`;
}

async function runTest(test) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: test.url }),
  });

  const data = await response.json();
  const statusOk = response.status === test.expectStatus;

  console.log(`\n=== ${test.label} ===`);
  console.log(`status: ${response.status}${statusOk ? "" : ` (expected ${test.expectStatus})`}`);

  if (data.error) {
    console.log(`error: ${data.error}`);
    return statusOk;
  }

  const shapeOk = isAuditResponse(data);
  console.log(`shape: ${shapeOk ? "valid AuditResponse" : "INVALID"}`);
  console.log(`url: ${data.url}`);
  console.log(`finalUrl: ${data.finalUrl}`);
  console.log(`title: ${data.title}`);
  console.log(`schemaTypes: [${data.schemaTypes.join(", ")}]`);
  console.log(
    `trustSignals: about=${data.trustSignals.aboutPage}, contact=${data.trustSignals.contactPage}, privacy=${data.trustSignals.privacyPage}, legal=${data.trustSignals.legalPage}, social=${data.trustSignals.socialLinks}`,
  );
  console.log(
    `aiVisibility: org=${data.aiVisibilitySignals.organizationSchema}, faq=${data.aiVisibilitySignals.faqSchema}, trustPages=${data.aiVisibilitySignals.trustPages}`,
  );
  console.log(`checks: ${summarizeChecks(data.checks)}`);

  return statusOk && shapeOk;
}

async function main() {
  console.log(`Testing ${API_URL}`);

  const results = [];

  for (const test of tests) {
    results.push(await runTest(test));
  }

  const passed = results.filter(Boolean).length;
  console.log(`\nResult: ${passed}/${results.length} passed`);

  if (passed !== results.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
