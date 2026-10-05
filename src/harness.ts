import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function captures(source: string, pattern: RegExp, group = 1): string[] {
  return Array.from(source.matchAll(pattern), (match) => match[group]).filter((value): value is string => value !== undefined);
}

function textContent(markup: string): string {
  return markup.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function includesAll(source: string, fragments: readonly string[], label: string): void {
  for (const fragment of fragments) assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

const paths = ["index.html", "styles.css", ".github/workflows/deploy-pages.yml"] as const;
for (const path of paths) assert.ok(existsSync(resolve(path)), `${path} must exist`);
const html = readFileSync(resolve(paths[0]), "utf8");
const stylesheet = readFileSync(resolve(paths[1]), "utf8");
const workflow = readFileSync(resolve(paths[2]), "utf8");

const title = "Jaewon Kim — Markets & Investment Portfolio";
assert.equal(textContent(captures(html, /<title>([\s\S]*?)<\/title>/g)[0] ?? ""), title);
assert.equal(textContent(captures(html, /<meta property="og:title" content="([^"]+)"/g)[0] ?? ""), title);
assert.doesNotMatch(html, /December|DS투자증권|교보증권/i, "The portfolio stays company-independent");

const sections = captures(html, /<section\b[^>]*class="([^"]+)"[^>]*>/g);
assert.equal(sections.length, 6, "The page has six main sections");
assert.match(sections[0] ?? "", /\bhero\b/);
assert.match(sections[1] ?? "", /\bsection-work\b/);
assert.match(sections[2] ?? "", /\boperations-section\b/);
assert.match(sections[3] ?? "", /\bbackground-section\b/);
assert.match(sections[4] ?? "", /\bcredentials-section\b/);
assert.match(sections[5] ?? "", /\bcontact-section\b/);
assert.doesNotMatch(html, /capability-band|CORE CAPABILITIES|detail-label/, "Repeated capability and English detail labels are absent");

const hero = captures(html, /<section\b[^>]*id="top"[^>]*>[\s\S]*?<\/section>/g, 0)[0] ?? "";
includesAll(
  textContent(hero),
  [
    "GLOBAL MARKETS · INVESTMENT · SEOUL",
    "Rates & Markets · Systematic Investing · Portfolio & Risk",
    "금리와 글로벌 금융시장을 분석하고, 투자 아이디어를 데이터로 검증해 포지션 구성과 실제 운용까지 연결합니다.",
    "경제지표와 시장 데이터를 수집·검증하고, 매크로 및 퀀트 분석을 투자 판단과 리스크 관리, 주문 실행에 활용해왔습니다.",
    "한양대학교 경영학부 · 정보시스템학과 복수전공",
    "2026.08 졸업",
  ],
  "Hero",
);
assert.deepEqual(captures(hero, /class="flow-label">([^<]+)</g), ["Market", "Analysis", "Validation", "Position", "Execution"]);

const work = captures(html, /<section\b[^>]*id="work"[^>]*>[\s\S]*?<\/section>/g, 0)[0] ?? "";
const cards = captures(work, /<article\b[^>]*class="project-card[^>]*>[\s\S]*?<\/article>/g, 0);
assert.equal(cards.length, 4, "Selected Experience has four projects");
assert.deepEqual(
  captures(work, /<h3>([\s\S]*?)<\/h3>/g).map(textContent),
  [
    "한국은행 통화정책과 KTB 금리곡선 분석",
    "미국 대형주 전략 검증 및 실계좌 운용",
    "글로벌 시장 브리핑 자동화로 작성시간 약 75% 단축, K-Skill 정식 기능 채택",
    "K-ICS 환경의 동적 환위험 헤지 전략",
  ],
);
for (const card of cards.slice(0, 2)) assert.match(card, /class="project-card project-featured/);
assert.doesNotMatch(work, /Fama-French|HAQR|기업 RA Agent|기업분석 Skill|AI Agent Skills/i);
assert.ok(captures(work, /class="project-description"/g, 0).length >= 9, "Project narratives remain present");
assert.doesNotMatch(work, /<p class="project-description">[\s\S]*?<br\b/i, "Body copy wraps naturally");

const rates = textContent(cards[0] ?? "");
includesAll(
  rates,
  [
    "인상 8회, 동결 24회, 인하 4회",
    "총 36차례",
    "1,084개",
    "정책결정 유형만으로 커브 방향을 일관되게 설명하기 어렵다",
    "3s10s Steepener",
    "Equal-DV01",
    "사례별로 엇갈렸",
    "UST 2Y/10Y",
    "USD/KRW",
  ],
  "Rates research",
);
assert.doesNotMatch(rates, /\b38\b|1,151|KRX|선물.*실측.*검증(?! 결과가 아닙니다)/);
const us = textContent(cards[1] ?? "");
includesAll(us, ["최근 20거래일", "거래대금 상위 150종목", "60%", "중기 모멘텀 20%", "저변동성 20%", "5-Fold", "10bp", "4개월 Block Bootstrap", "Toss OpenAPI", "매수 29건", "매도 29건", "Excel 원장", "주문 경로 테스트"], "US investing");
assert.match(us, /개별\s*종목[^.]*섹터/);
assert.match(us, /체결 건수는 주문 경로 테스트 결과이며, 장기 투자성과를 의미하지 않습니다\./);
assert.doesNotMatch(us, /CAGR|Sharpe|실현\s*(?:수익률|성과)/i);
const global = textContent(cards[2] ?? "");
includesAll(global, ["Python", "ECOS", "FRED", "공식", "거래일", "관측일", "40분", "10분 이내", "75%", "Multi-Asset Morning Briefing", "공식 기여자"], "Global briefing");
assert.match(cards[2] ?? "", /class="global-research"/);
includesAll(textContent(cards[2] ?? ""), ["글로벌 IB 리서치 분석과 정책 파급경로 정리", "5개 분기 중 4개", "10개 분기 중 9개", "12.5%", "중립금리", "주요 경제지표 발표 일정", "단기금리 pricing"], "IB research vignette");
const fx = textContent(cards[3] ?? "");
includesAll(fx, ["환위험", "K-ICS 요구자본", "시장 국면", "헤지비율", "HMM", "PPO", "10.38%", "Model-implied SCR reduction", "100% 고정헤지 대비", "모형 계산값"], "FX hedging");
assert.doesNotMatch(fx, /요구자본비용[^.]*10\.38%|헤지비용[^.]*10\.38%|실현\s*(?:수익률|성과)\s*(?:을|를)?\s*(?:기록|달성)/);

const process = captures(html, /<section\b[^>]*id="process"[^>]*>[\s\S]*?<\/section>/g, 0)[0] ?? "";
assert.deepEqual(captures(process, /<li>[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<\/li>/g).map(textContent), ["Market & Policy", "Data & Context", "Analysis", "Investment View", "Validation & Risk", "Position", "Execution", "Review"]);
includesAll(textContent(process), ["ECOS · FRED · IB Research", "Event Study · OOS · DV01", "3s10s · Target Weights · Hedge Ratio", "Orders · Fills", "Position · Ledger · Risk"], "Market-to-execution process");
const background = captures(html, /<section\b[^>]*id="background"[^>]*>[\s\S]*?<\/section>/g, 0)[0] ?? "";
includesAll(textContent(background), ["EDUCATION", "한양대학교 서울캠퍼스", "경영학부 주전공", "정보시스템학과 복수전공", "2019.03 – 2026.08", "졸업", "ACTIVITIES & RESEARCH", "GAMMA 글로벌마켓학회", "HY-FIN 재무금융학회", "Quantitative Analytics Lab"], "Education and activities");
assert.match(background, /class="education-panel"[\s\S]*class="activity-list"/);
const credentials = captures(html, /<section\b[^>]*class="credentials-section"[^>]*>[\s\S]*?<\/section>/g, 0)[0] ?? "";
assert.deepEqual(captures(credentials, /class="credential-row">\s*<strong>([\s\S]*?)<\/strong>/g).map(textContent), ["투자자산운용사", "SQLD", "ADsP", "Quantitative Research Consultant"]);
assert.match(credentials, /WorldQuant/);
const contact = captures(html, /<section\b[^>]*id="contact"[^>]*>[\s\S]*?<\/section>/g, 0)[0] ?? "";
assert.match(contact, /Full Project Archive\s*→\s*GitHub/);
assert.match(contact, /href="https:\/\/github\.com\/bucheoncityboy\/portfolio-index"/);

const ids = captures(html, /\bid="([^"]+)"/g);
assert.equal(new Set(ids).size, ids.length, "HTML IDs are unique");
for (const target of captures(html, /href="#([^"]+)"/g)) assert.ok(ids.includes(target), `Internal target #${target} exists`);
for (const anchor of captures(html, /<a\b[^>]*target="_blank"[^>]*>/g, 0)) assert.match(anchor, /rel="[^"]*\b(?:noreferrer|noopener)\b/);
for (const repo of ["krw-rates-integrated-research", "us-robust-live-ops", "multi-asset-morning-briefing", "Dynamic-Shield-K-ICS-AI", "portfolio-index"])
  assert.match(html, new RegExp(`href="https://github.com/bucheoncityboy/${repo}`));

assert.match(stylesheet, /\.project-description\s*\{[^}]*font-size:\s*17px/);
assert.match(stylesheet, /\.project-description\s*\{[^}]*max-width:\s*680px/);
assert.match(stylesheet, /line-height:\s*1\.75/);
assert.match(stylesheet, /text-align:\s*left/);
assert.doesNotMatch(stylesheet, /text-align:\s*justify/i);
assert.match(stylesheet, /@media \(max-width: 720px\)/);
const mobileCss = stylesheet.slice(stylesheet.indexOf("@media (max-width: 720px)"));
assert.match(mobileCss, /\.project-description[^\{]*\{[^}]*font-size:\s*16px/);
assert.match(mobileCss, /\.background-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
assert.match(mobileCss, /\.featured-metrics[^\{]*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);

for (const action of ["actions/upload-pages-artifact@v4", "actions/deploy-pages@v4"])
  assert.ok(workflow.includes(action), `Pages uses ${action}`);
for (const permission of [/contents:\s*read/, /pages:\s*write/, /id-token:\s*write/]) assert.match(workflow, permission);
assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /branches:\s*- main/);
console.log("All 13 portfolio checks passed.");
