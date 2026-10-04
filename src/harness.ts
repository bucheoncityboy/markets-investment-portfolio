import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function captures(source: string, pattern: RegExp, group = 1): string[] {
  return Array.from(source.matchAll(pattern), (match) => match[group]).filter((value): value is string => value !== undefined);
}

function textContent(markup: string): string {
  return markup
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAll(source: string, fragments: readonly string[], label: string): void {
  for (const fragment of fragments) {
    assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
  }
}

const paths = ["index.html", "styles.css", ".github/workflows/deploy-pages.yml"] as const;
for (const path of paths) assert.ok(existsSync(resolve(path)), `${path} must exist`);
const html = readFileSync(resolve(paths[0]), "utf8");
const stylesheet = readFileSync(resolve(paths[1]), "utf8");
const workflow = readFileSync(resolve(paths[2]), "utf8");
const passedChecks: string[] = [];

const portfolioTitle = "Jaewon Kim — Markets & Investment Portfolio";
assert.equal(textContent(captures(html, /<title>([\s\S]*?)<\/title>/g)[0] ?? ""), portfolioTitle);
assert.equal(textContent(captures(html, /<meta property="og:title" content="([^"]+)"/g)[0] ?? ""), portfolioTitle);
const description = "김재원 — 금리와 글로벌 금융시장을 분석하고 투자 아이디어를 데이터로 검증해 포지션 구성과 실제 운용까지 연결한 Markets & Investment Portfolio.";
assert.equal(textContent(captures(html, /<meta name="description" content="([^"]+)"/g)[0] ?? ""), description);
assert.doesNotMatch(html, /December|DS투자증권|교보증권/i, "Page content and metadata must remain company-independent");
passedChecks.push("generic Markets & Investment title and metadata");

const sections = captures(html, /<section\b[^>]*>[\s\S]*?<\/section>/g, 0);
const sectionMarkers = ["hero", "capability-band", "section-work", "operations-section", "background-section", "credentials-section", "contact-section"] as const;
assert.equal(sections.length, sectionMarkers.length, "The page must have exactly seven sections");
for (const [index, marker] of sectionMarkers.entries()) {
  assert.match(sections[index] ?? "", new RegExp(`<section[^>]*class="[^"]*\\b${marker}\\b`), `Section ${index + 1} must be ${marker}`);
}
assert.doesNotMatch(html, /ADDITIONAL RESEARCH|section-additional|skills-section|id="research"/, "Additional research and skills sections must be absent");
const hero = sections[0] ?? "";
const capabilities = sections[1] ?? "";
const work = sections[2] ?? "";
const process = sections[3] ?? "";
const background = sections[4] ?? "";
const credentials = sections[5] ?? "";
const contact = sections[6] ?? "";
passedChecks.push("exact seven-section narrative order");

includesAll(
  textContent(hero),
  [
    "GLOBAL MARKETS · INVESTMENT · SEOUL",
    "Rates & Markets · Systematic Investing · Portfolio & Risk",
    "금리와 글로벌 금융시장을 분석하고, 투자 아이디어를 데이터로 검증해 포지션 구성과 실제 운용까지 연결합니다.",
    "경제지표와 시장 데이터를 수집·검증하고, 매크로 및 퀀트 분석을 투자 판단과 리스크 관리, 주문 실행에 활용해왔습니다.",
    "HANYANG UNIVERSITY · BUSINESS ADMINISTRATION & INFORMATION SYSTEMS",
    "MARKETS TO EXECUTION",
  ],
  "Hero",
);
assert.doesNotMatch(hero, /GAMMA|HY-FIN|Quantitative Analytics Lab/, "Activities belong in Background");
assert.deepEqual(captures(hero, /class="flow-label">([^<]+)</g), ["Market", "Analysis", "Validation", "Position", "Execution"]);
assert.deepEqual(captures(capabilities, /<h2>([\s\S]*?)<\/h2>/g).map(textContent), ["Markets & Rates", "Quant & Validation", "Portfolio & Risk", "Execution & Data"]);
includesAll(textContent(capabilities), ["Monetary Policy · Yield Curve · FX · Cross-Asset", "Event Study · OOS · Walk-Forward · Bootstrap", "Relative Value · Target Weights · Hedging · Position Sizing", "Orders · Fills · Reconciliation · Python · API · SQL"], "Capabilities");
passedChecks.push("markets-first hero, five-stage graphic, and four concise capabilities");

const cards = captures(work, /<article\b[^>]*class="project-card[^>]*>[\s\S]*?<\/article>/g, 0);
const projectTitles = ["한국은행 통화정책과 KTB 수익률곡선 분석", "미국 대형주 전략 검증 및 실계좌 운용 파이프라인", "글로벌 멀티에셋 시장 분석 및 Morning Briefing 자동화", "K-ICS 환경의 동적 환위험 헤지 전략"] as const;
assert.equal(cards.length, 4, "Selected Work must have exactly four project cards");
assert.deepEqual(captures(work, /<h3>([\s\S]*?)<\/h3>/g).map(textContent), projectTitles, "Project titles must follow the requested order");
for (const card of cards.slice(0, 2)) assert.match(card, /class="project-card project-featured/, "Rates and US execution must retain featured prominence");
assert.doesNotMatch(work, /Fama-French|HAQR|deep-quant-risk|기업 RA Agent|기업분석 Skill|AI Agent Skills/i, "Unselected projects must stay in the archive");
const bodyParagraphs = captures(html, /<p class="(?:project-description|hero-lede|hero-english)">[\s\S]*?<\/p>/g, 0);
assert.ok(bodyParagraphs.length >= 14, "All project and hero explanations must remain present");
assert.ok(
  bodyParagraphs.every((paragraph) => !/<br\b/i.test(paragraph)),
  "Body copy must wrap naturally",
);
assert.doesNotMatch(captures(work, /<h3>[\s\S]*?<\/h3>/g, 0).join(""), /<br\b/i, "Project titles must wrap naturally");
const expectedDetailLabels = [
  ["RESEARCH QUESTION", "ANALYSIS", "POSITION & RISK"],
  ["STRATEGY & VALIDATION", "PORTFOLIO", "EXECUTION"],
  ["MARKET RESEARCH", "DATA & VALIDATION", "WORKFLOW & RESULT"],
  ["PROBLEM", "APPROACH", "RISK FRAMEWORK"],
] as const;
for (const [index, labels] of expectedDetailLabels.entries()) {
  assert.deepEqual(captures(cards[index] ?? "", /class="detail-label">([\s\S]*?)<\/span>/g).map(textContent), labels, `Project ${index + 1} must have three ordered explanatory labels`);
}
passedChecks.push("four featured/standard projects in order with short labels and natural wrapping");

const rates = textContent(cards[0] ?? "");
assert.deepEqual(captures(cards[0] ?? "", /class="featured-metric[^\"]*"><strong>([\s\S]*?)<\/strong><span>/g).map(textContent), ["36", "1,084", "D-1 / D+1 / D+5", "19 / 36", "21 / 36"], "Rates metrics must use verified final data");
includesAll(rates, ["36", "1,084", "19", "21", "Equal-DV01", "UST 2Y", "USD/KRW", "거래비용", "잔여위험", "현물 명목금액과 듀레이션 가정에 기반한 예시", "실측 DV01이나 선물 체결 검증 결과가 아닙니다."], "Rates evidence");
assert.match(rates, /D[-−–]1\s*\/\s*D\+1\s*\/\s*D\+5/, "Rates windows must be D-1 / D+1 / D+5");
assert.doesNotMatch(rates, /\b38\b|1,151|KRX|선물.*실측.*검증(?! 결과가 아닙니다)/, "Unverified rates counts and futures claims must be absent");
const us = textContent(cards[1] ?? "");
includesAll(us, ["5-Fold", "10", "29", "월말", "OOS", "Walk-Forward", "Bootstrap", "민감도", "목표비중", "현재 포지션", "리밸런싱", "Excel 원장", "주문 경로 테스트", "장기 투자성과를 의미하지 않습니다."], "US strategy evidence");
assert.match(us, /29\s*\/\s*29/, "US evidence must identify 29 buy and 29 sell executions");
assert.match(us, /10\s*bp/, "The tested strategy must include the 10bp round-trip cost assumption");
assert.doesNotMatch(us, /CAGR|Sharpe|실현\s*(?:수익률|성과)|LIVE EXECUTION TRACKED|지속(?:적인)?\s*실계좌 운용/i, "Order-route evidence must not imply realized returns or sustained operations");
const markets = textContent(cards[2] ?? "");
includesAll(markets, ["ECOS", "FRED", "ECB", "U.S. Treasury", "Cboe", "40분", "10분 이내", "Multi-Asset Morning Briefing"], "Morning briefing evidence");
assert.match(markets, /(?:공식|official)\s*contributor/i, "The accepted feature must credit the contributor");
assert.match(cards[2] ?? "", /href="https:\/\/github\.com\/NomaDamas\/k-skill\/blob\/[^\"]+\/docs\/features\/multi-asset-morning-briefing\.md"/, "Official feature documentation must remain linked");
const fx = textContent(cards[3] ?? "");
includesAll(fx, ["Model-implied SCR reduction", "maximum", "내부모형 가정", "100% 고정헤지 대비", "모형 계산값", "헤지비율", "HMM", "PPO"], "FX risk evidence");
assert.match(fx, /10\.38\s*%/, "FX evidence must retain the model-implied 10.38% maximum");
assert.doesNotMatch(fx, /요구자본비용(?:을)?\s*(?:최대\s*)?10\.38%|헤지비용(?:을)?\s*(?:최대\s*)?10\.38%|실현\s*수익률/, "Model-implied capital reduction must not become measured costs or returns");
passedChecks.push("verified research figures, order-route scope, and FX model assumptions");

assert.match(process, /id="process"/);
assert.match(textContent(process), /FROM MARKETS TO EXECUTION/);
assert.deepEqual(captures(process, /<li>[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<\/li>/g).map(textContent), ["Market & Policy", "Data & Context", "Analysis", "Investment View", "Validation & Risk", "Position", "Execution", "Review"]);
includesAll(
  textContent(process),
  ["BOK · Global Markets · Macro Events", "ECOS · FRED · Treasury · IB Research", "Rates · FX · Quant", "Curve · Cross-Asset · Strategy", "Event Study · OOS · Walk-Forward · Bootstrap · DV01", "3s10s · Target Weights · Hedge Ratio", "Orders · Fills", "Position · Ledger · Risk Review"],
  "Eight-stage process",
);
assert.deepEqual(captures(background, /<div class="activity-head"><h3>([\s\S]*?)<\/h3>/g).map(textContent), ["GAMMA Global Markets Society", "HY-FIN Finance Society", "Quantitative Analytics Lab"]);
includesAll(textContent(background), ["Market Briefing · Global IB Research · BOK / KRW Rates", "Quantitative Finance · Asset Pricing · FX Risk", "Financial ML · Downside Risk · Position Sizing"], "Background");
assert.deepEqual(captures(credentials, /class="credential-row">\s*<strong>([\s\S]*?)<\/strong>/g).map(textContent), ["투자자산운용사", "SQLD", "ADsP", "Quantitative Research Consultant"]);
assert.match(credentials, /<strong>\s*투자자산운용사\s*<\/strong>\s*<span>\s*Certified Investment Manager\s*<\/span>/);
assert.match(credentials, /WorldQuant/);
assert.match(textContent(contact), /Full Project Archive\s*→\s*GitHub/);
passedChecks.push("eight process steps, three background activities, ordered credentials, and archive label");

const ids = captures(html, /\bid="([^"]+)"/g);
const uniqueIds = new Set(ids);
assert.equal(uniqueIds.size, ids.length, "HTML IDs must be unique");
for (const target of captures(html, /href="#([^"]+)"/g)) assert.ok(uniqueIds.has(target), `Internal target #${target} must exist`);
const nav = captures(html, /<nav\b[^>]*>([\s\S]*?)<\/nav>/g)[0] ?? "";
for (const [target, label] of [
  ["work", "Work"],
  ["process", "Process"],
  ["background", "Background"],
] as const)
  assert.deepEqual(captures(nav, new RegExp(`<a\\b[^>]*href="#${target}"[^>]*>([\\s\\S]*?)<\\/a>`, "g")).map(textContent), [label], `Navigation must link ${label} to #${target}`);
const projectRepositories = ["krw-rates-integrated-research", "us-robust-live-ops", "multi-asset-morning-briefing", "Dynamic-Shield-K-ICS-AI"] as const;
for (const [index, repository] of projectRepositories.entries()) assert.match(cards[index] ?? "", new RegExp(`href="https://github.com/bucheoncityboy/${repository}"`));
assert.equal(captures(html, /href="(https:\/\/github\.com\/bucheoncityboy\/portfolio-index)"/g).length, 3, "Nav, hero, and contact must link to the archive");
assert.match(contact, /href="https:\/\/github\.com\/bucheoncityboy\/portfolio-index"/);
assert.doesNotMatch(html, /href="https:\/\/github\.com\/bucheoncityboy"|\b010[- ]\d{3,4}[- ]\d{4}\b/, "Profile-only links and private phone numbers must be absent");
for (const anchor of captures(html, /<a\b[^>]*target="_blank"[^>]*>/g, 0)) assert.match(anchor, /rel="[^"]*\b(?:noreferrer|noopener)\b/, "External tabs must protect the opener");
passedChecks.push("unique IDs, working navigation, public project/archive links, and contact privacy");

for (const action of ["actions/upload-pages-artifact@v4", "actions/deploy-pages@v4"] as const) assert.ok(workflow.includes(action), `Pages needs ${action}`);
for (const permission of [/contents:\s*read/, /pages:\s*write/, /id-token:\s*write/]) assert.match(workflow, permission);
assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /branches:\s*- main/);
passedChecks.push("GitHub Pages artifact, permissions, and main/manual deployment");

assert.match(stylesheet, /@media \(max-width: 720px\)/, "A mobile breakpoint must remain");
const mobileCss = stylesheet.slice(stylesheet.indexOf("@media (max-width: 720px)"));
assert.match(mobileCss, /\.project-featured\s*\{[^}]*grid-template-columns:\s*1fr/);
assert.match(mobileCss, /\.project-grid[^\{]*\{[^}]*grid-template-columns:\s*1fr/);
assert.match(mobileCss, /\.background-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
assert.match(mobileCss, /\.contact-layout\s*\{[^}]*grid-template-columns:\s*1fr/);
assert.match(stylesheet, /\.project-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(stylesheet, /text-align:\s*left/);
assert.match(stylesheet, /word-break:\s*keep-all/);
assert.match(stylesheet, /overflow-wrap:\s*break-word/);
assert.doesNotMatch(stylesheet, /text-align:\s*justify/i, "Body copy must remain left-aligned");
assert.match(stylesheet, /prefers-reduced-motion:\s*reduce/);
assert.doesNotMatch(stylesheet, /\.ops-summary|project-cross-market/, "Unused legacy workflow and project styling must stay absent");
passedChecks.push("responsive cards/contact/background, natural Korean wrapping, left alignment, and reduced motion");

for (const check of passedChecks) console.log(`PASS ${check}`);
console.log(`All ${passedChecks.length} portfolio checks passed.`);
