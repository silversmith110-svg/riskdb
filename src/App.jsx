import { useState, useMemo, useEffect } from "react";

// ─── University of Chicago Official Palette ───────────────────
// Maroon #800000 (Pantone 202C) — dominant accent
// Greystone family — structure and data
// Warm white / limestone — primary background (echoes campus architecture)
const C = {
  // Backgrounds — warm limestone, not black
  canvas:    "#F7F4EF",   // warm off-white (limestone buildings)
  surface:   "#FFFFFF",   // card surface
  surfaceAlt:"#F0EDE8",   // subtle alternate row
  headerBg:  "#800000",   // UChicago Maroon header

  // UChicago Maroon family
  maroon:    "#800000",   // official
  maroonDk:  "#5C0000",   // dark — hover, borders
  maroonLt:  "#A01010",   // slightly lighter for text on dark
  maroonTint:"#F5EAEA",   // very pale maroon for selected bg

  // Greystone palette (official secondary)
  gsLight:   "#D9D9D9",   // Light Greystone
  gsMid:     "#8F8F8F",   // Greystone
  gsDark:    "#767676",   // Dark Grey
  gsDeep:    "#3D3D3D",   // near-black neutral

  // Text
  textPrim:  "#1A1A1A",   // primary text
  textSec:   "#4A4A4A",   // secondary
  textMuted: "#767676",   // muted (= Greystone)
  textDim:   "#A0A0A0",   // dim

  // Borders
  border:    "#E0DBD4",   // warm light border
  borderMid: "#C8C0B8",   // mid border

  // Semantic — measured, not alarming
  danger:    "#B91C1C",   // deep red
  dangerBg:  "#FEF2F2",
  warning:   "#92400E",   // amber-brown
  warningBg: "#FFFBEB",
  safe:      "#166534",
  safeBg:    "#F0FDF4",
  info:      "#1E40AF",
  infoBg:    "#EFF6FF",
};

const RISK_TAXONOMY = [
  {
    groupId: "liability", groupLabel: "賠償責任リスク", groupIcon: "⚖",
    color: "#B91C1C", colorBg: "#FEF2F2", colorBorder: "#FECACA",
    desc: "製品・サービス・業務上の過失に起因する対第三者への法的賠償責任リスク。",
    children: [
      { id: "product_liability",  label: "製品・品質事故",         desc: "製品欠陥・品質偽装・リコールによる消費者・取引先への損害賠償" },
      { id: "class_action",       label: "集団訴訟・株主代表訴訟",  desc: "消費者・株主からの組織的賠償請求。経営者個人への責任追及" },
      { id: "professional_liab",  label: "専門家賠償責任（E&O）",  desc: "医療・IT・会計・コンサル等の専門職業務ミスによる賠償" },
    ],
  },
  {
    groupId: "financial", groupLabel: "財務損失リスク", groupIcon: "¥",
    color: "#92400E", colorBg: "#FFFBEB", colorBorder: "#FDE68A",
    desc: "企業の財務健全性に重大な影響を与える損失リスク。信用悪化・資産毀損を含む。",
    children: [
      { id: "credit_default",     label: "信用リスク・取引先倒産",  desc: "取引先の倒産・支払い停止による売掛金貸倒れ・連鎖損失" },
      { id: "impairment",         label: "大規模減損・資産毀損",    desc: "固定資産・のれん・投資有価証券の評価損による財務基盤悪化" },
      { id: "earnings_miss",      label: "業績急悪化・赤字転落",    desc: "想定外の収益悪化・特別損失計上・資本毀損" },
    ],
  },
  {
    groupId: "operational", groupLabel: "事業運営リスク", groupIcon: "⚙",
    color: "#1E40AF", colorBg: "#EFF6FF", colorBorder: "#BFDBFE",
    desc: "日常業務・内部統制・ITシステムに関わるリスク。人的ミス・不正・障害を含む。",
    children: [
      { id: "misconduct",         label: "不正行為・品質偽装",      desc: "データ改ざん・不正会計・品質偽装など内部不正が引き起こす損害" },
      { id: "employee_fraud",     label: "従業員不正・横領",        desc: "従業員による顧客資産横領・業務上横領・内部統制の不備" },
      { id: "cyber_incident",     label: "サイバー攻撃・情報漏洩",  desc: "ランサムウェア・個人情報漏洩・システム障害による損害" },
      { id: "biz_interruption",   label: "事業中断・サプライチェーン断絶", desc: "工場停止・部品供給途絶・大規模システム障害による操業停止" },
    ],
  },
  {
    groupId: "governance", groupLabel: "経営・ガバナンスリスク", groupIcon: "◈",
    color: "#6B21A8", colorBg: "#FAF5FF", colorBorder: "#DDD6FE",
    desc: "経営者・取締役会の意思決定・行動に起因するリスク。M&A判断失敗を含む。",
    children: [
      { id: "director_liability", label: "役員の法的責任",          desc: "経営判断ミス・不正行為による役員個人への損害賠償請求" },
      { id: "ma_failure",         label: "M&A失敗・海外事業撤退",   desc: "大型買収失敗・のれん過大・海外事業清算による損失" },
      { id: "regulatory_penalty", label: "規制違反・行政処分",       desc: "独占禁止法・景表法・各種規制違反による制裁・業務停止" },
    ],
  },
  {
    groupId: "external", groupLabel: "外部環境リスク", groupIcon: "⊛",
    color: "#166534", colorBg: "#F0FDF4", colorBorder: "#BBF7D0",
    desc: "企業のコントロール外の外部要因によるリスク。自然災害・地政学変動を含む。",
    children: [
      { id: "natural_disaster",   label: "自然災害・物的損害",      desc: "地震・台風・洪水による建物・設備・在庫の損害と事業中断" },
      { id: "geopolitical",       label: "地政学・制裁リスク",      desc: "戦争・貿易制裁・輸出規制・政治変動による事業影響" },
      { id: "esg_liability",      label: "ESG責任・環境賠償",       desc: "気候変動・環境汚染・人権問題に起因する法的責任リスク" },
    ],
  },
];

const ALL_CATEGORIES = RISK_TAXONOMY.flatMap(g =>
  g.children.map(c => ({ ...c, groupId: g.groupId, groupLabel: g.groupLabel, groupColor: g.color, groupColorBg: g.colorBg, groupColorBorder: g.colorBorder }))
);

// ─────────────────────────────────────────────────────────────
//  Supabase 接続設定
//  ※ SUPABASE_KEY は anon（公開用）キーを使用
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://wshprbmphtipdvjlzbdt.supabase.co";
const SUPABASE_KEY = "sb_publishable_ho6NEWsVfg8td7SLLtpvng_WSoRCBHq";

async function fetchRiskEvents({ riskType, keyword, minSev, limit = 500 } = {}) {
  let url = `${SUPABASE_URL}/rest/v1/risk_events?select=*&limit=${limit}&order=event_date.desc`;
  if (riskType && riskType !== "all") url += `&risk_type=eq.${encodeURIComponent(riskType)}`;
  if (keyword)  url += `&keyword=eq.${encodeURIComponent(keyword)}`;
  if (minSev > 1) url += `&severity=gte.${minSev}`;

  const res = await fetch(url, {
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// Supabaseのデータ → UIのデータ形式に変換
function toUIRecord(r) {
  return {
    id:             r.id,
    company:        r.company_name || r.company_name_raw || "（企業名不明）",
    ticker:         r.ticker || "",
    sector:         r.sector || "",
    riskType:       r.risk_type || "other",
    severity:       parseInt(r.severity) || 5,
    date:           r.event_date || "",
    title:          r.title || "",
    summary:        r.summary || r.title || "",
    financialImpact:r.financial_impact || "",
    stockImpact:    "",
    period:         "",
    stockRecovery:  "",
    source:         r.source || "適時開示",
    tags:           [r.keyword, r.year, r.classified_by].filter(Boolean),
    lesson:         "",
    keyword:        r.keyword || "",
    year:           r.year || "",
    refno:          r.refno || "",
    sourceUrl:      r.source_url || "",
  };
}

const SAMPLE_DATA = [
  {
    id: 1, company: "東芝株式会社", ticker: "6502", sector: "電気機器",
    riskType: "director_liability", severity: 10, date: "2015-05-08",
    title: "不正会計発覚・歴代3社長による株主損害賠償責任",
    summary: "過去7年間にわたる約2,248億円の利益水増し計上が発覚。歴代3社長を含む役員が株主から損害賠償請求を受けた。上場廃止危機から半導体事業売却まで事業解体に至った。経営者の不正に対する株主責任の典型事例。",
    financialImpact: "約2,248億円の利益修正", stockImpact: "−35.2%", period: "発覚後1ヶ月",
    stockRecovery: "永続的毀損（事業解体）", source: "適時開示 / EDINET",
    tags: ["株主代表訴訟", "役員個人責任", "経営陣総退陣", "監査人交代"],
    lesson: "経営トップが長年にわたり組織的に不正を指示・隠蔽していた場合、D&O保険の免責条項が適用されるリスクがある。内部通報制度と独立した監査体制の整備が不可欠。",
  },
  {
    id: 2, company: "神戸製鋼所", ticker: "5406", sector: "鉄鋼",
    riskType: "product_liability", severity: 9, date: "2017-10-08",
    title: "アルミ・銅製品の強度データ改ざんによる大規模PL問題",
    summary: "アルミニウム・銅製品の強度・寸法データを長年改ざんして出荷。自動車・航空機・宇宙産業に影響が及び国際問題に発展。取引先への製品賠償リスクが業界全体に波及した。",
    financialImpact: "約120億円の損失・賠償", stockImpact: "−36.8%", period: "発覚後1週間",
    stockRecovery: "+12.1%（6ヶ月後）", source: "適時開示 / EDINET",
    tags: ["品質偽装", "B2B製品賠償", "国際問題", "刑事捜査"],
    lesson: "B2B製品の品質偽装は下流サプライチェーン全体への波及リスクが大きい。単品のPL保険では補償が不十分になるケースがあり、契約範囲の精査が必要。",
  },
  {
    id: 3, company: "第一生命保険（元従業員事件）", ticker: "8750", sector: "保険業",
    riskType: "employee_fraud", severity: 7, date: "2021-11-17",
    title: "元営業職員による顧客資産19年間・19.4億円の横領",
    summary: "元営業職員が約19年間にわたり170名超の顧客から現金を詐取。被害総額は約19.4億円に及び、内部統制の長期的な不備が明らかになった。同業他社も同種リスクの再点検を余儀なくされた。",
    financialImpact: "約19.4億円（顧客被害・補償額）", stockImpact: "−3.1%", period: "発表翌日",
    stockRecovery: "+4.2%（3ヶ月後）", source: "適時開示 / 報道",
    tags: ["従業員横領", "顧客被害補償", "内部統制不備", "長期継続不正"],
    lesson: "長期間の継続的な不正は発覚が遅れるほど被害が拡大する。営業職員の顧客訪問記録・入金記録の定期的な独立チェックが再発防止の鍵。",
  },
  {
    id: 4, company: "オリンパス", ticker: "7733", sector: "精密機器",
    riskType: "director_liability", severity: 10, date: "2011-10-14",
    title: "20年超の損失隠蔽・経営陣の株主への損害賠償責任",
    summary: "バブル期の損失を20年以上隠蔽。飛ばしと呼ばれる手口でM&A関連費用として処理。経営陣が株主から総額数十億円規模の損害賠償請求を受けた。D&O保険が実際に適用された事例。",
    financialImpact: "約1,177億円の損失隠蔽", stockImpact: "−80.2%", period: "発覚後1ヶ月",
    stockRecovery: "+120%（ソニー傘下・3年後）", source: "適時開示 / EDINET",
    tags: ["損失隠蔽", "株主代表訴訟", "D&O保険適用", "上場廃止危機"],
    lesson: "歴代経営陣が引き継ぎながら隠蔽を継続した事例。外部取締役・監査委員会の独立性確保と、M&A時の買収対価の第三者検証が不可欠。",
  },
  {
    id: 5, company: "東京電力ホールディングス", ticker: "9501", sector: "電気・ガス",
    riskType: "natural_disaster", severity: 10, date: "2011-03-11",
    title: "東日本大震災・福島第一原発事故による未曾有の損害",
    summary: "地震・津波・原発事故の複合災害。設備損害だけでなく周辺住民・農漁業者への賠償が22兆円超に。企業保険では補填不可能な規模となり国家補償スキームが導入された。BCPの限界を示す事例。",
    financialImpact: "22兆円超（政府試算）", stockImpact: "−88.5%", period: "発災後3ヶ月",
    stockRecovery: "実質的な国有化", source: "適時開示 / 政府資料",
    tags: ["自然災害", "複合災害", "BCP限界", "国家補償"],
    lesson: "単一企業の保険でカバーできる上限を超える巨大リスクの存在。事業継続計画（BCP）は最悪シナリオを想定した複数シナリオの策定が必要。",
  },
  {
    id: 6, company: "三菱自動車工業", ticker: "7211", sector: "輸送用機器",
    riskType: "product_liability", severity: 8, date: "2016-04-20",
    title: "25年以上継続した燃費試験データ不正と大規模消費者補償",
    summary: "軽自動車の燃費試験データを25年以上不正操作。消費者への直接補償に加え、日産自動車・三菱商事等取引先への損害賠償が発生。経営危機から日産の資本参加へ。",
    financialImpact: "約1,000億円の補償コスト", stockImpact: "−50.4%", period: "発覚後1週間",
    stockRecovery: "日産傘下で安定化", source: "適時開示 / EDINET",
    tags: ["燃費不正", "消費者補償", "B2B賠償", "経営危機"],
    lesson: "長期的な組織的不正は発覚時の損害が指数的に拡大する。定期的な第三者監査と内部通報制度が不正の早期発見に不可欠。",
  },
  {
    id: 7, company: "NTTドコモ", ticker: "9437", sector: "情報・通信",
    riskType: "cyber_incident", severity: 7, date: "2020-09-10",
    title: "docomo口座を悪用した不正引出・2.9億円の顧客被害",
    summary: "銀行口座との不正連携による不正出金。被害件数2,800件・2.9億円。本人確認プロセスの不備が原因。複数銀行との連携停止に至り、デジタルサービスの信頼性に打撃を与えた。",
    financialImpact: "約2.9億円の顧客被害", stockImpact: "−2.3%（NTT株）", period: "発覚後1週間",
    stockRecovery: "影響限定的（迅速対応）", source: "報道 / 適時開示",
    tags: ["サイバー犯罪", "本人確認不備", "顧客被害補償", "サービス停止"],
    lesson: "外部と連携するデジタルサービスは最も脆弱なインターフェース部分が攻撃対象になる。本人確認の多要素化とリアルタイム不正検知の仕組みが必須。",
  },
  {
    id: 8, company: "積水ハウス", ticker: "1928", sector: "建設業",
    riskType: "employee_fraud", severity: 7, date: "2018-08-02",
    title: "地面師グループによる55.5億円の詐欺被害と役員責任問題",
    summary: "地面師グループによる土地売却詐欺で55.5億円の損失。社長・会長の責任が問われ、株主総会で異例の混乱が生じた。不動産取引における詐欺リスクと内部チェックの重要性を示す事例。",
    financialImpact: "55.5億円の詐欺被害", stockImpact: "−6.2%", period: "発覚後1週間",
    stockRecovery: "+8.1%（3ヶ月後）", source: "適時開示 / 報道",
    tags: ["詐欺被害", "不動産リスク", "役員責任", "内部チェック不備"],
    lesson: "大型取引では通常とは異なる複数の意思決定者・外部専門家によるダブルチェックが不可欠。急ぐ取引ほど詐欺のリスクが高い。",
  },
  {
    id: 9, company: "LIXILグループ", ticker: "5938", sector: "金属製品",
    riskType: "ma_failure", severity: 7, date: "2015-03-12",
    title: "中国子会社への投資焦げ付き・520億円の損失",
    summary: "中国の衛生設備企業「浙江喬羽（ジョウユウ）」への投資が焦げ付き、約520億円の損失を計上。海外M&Aにおけるガバナンス不全と財務不正が発覚。デューデリジェンスの重要性を示す。",
    financialImpact: "約520億円の損失", stockImpact: "−22.1%", period: "発表後1ヶ月",
    stockRecovery: "−15%（1年後）", source: "EDINET / 適時開示",
    tags: ["M&A失敗", "海外投資リスク", "DD不備", "のれん減損"],
    lesson: "新興国M&Aでは現地の法制度・会計基準の違いを踏まえた徹底的なDDが必要。特に非上場先の財務データの信頼性検証には現地独立監査人の活用が有効。",
  },
  {
    id: 10, company: "パナソニック（震災時）", ticker: "6752", sector: "電気機器",
    riskType: "biz_interruption", severity: 6, date: "2011-03-11",
    title: "東日本大震災によるサプライチェーン断絶・操業停止",
    summary: "震災で部品供給が途絶し国内外の工場が生産停止。BCP未整備・単一調達依存の企業で事業中断損失が甚大。「代替調達先の確保」と「利益保険の加入」の重要性が業界全体に認識された。",
    financialImpact: "操業停止による損失 数百億円規模", stockImpact: "−18.0%（震災後）", period: "震災後1ヶ月",
    stockRecovery: "段階的復旧", source: "適時開示 / 報道",
    tags: ["BCP", "サプライチェーン断絶", "単一調達リスク", "事業中断"],
    lesson: "重要部品の単一調達依存は事業中断リスクを最大化する。調達先の地理的分散と代替調達プランの事前策定が不可欠。",
  },
  {
    id: 11, company: "東洋ゴム工業（現TOYO TIRE）", ticker: "5105", sector: "ゴム製品",
    riskType: "product_liability", severity: 8, date: "2015-03-06",
    title: "免震ゴム性能偽装・建物オーナーへの500億円超の賠償",
    summary: "免震ゴム製品の性能データ偽装が発覚。学校・病院・マンション等の施設オーナーへの損害賠償と建替・改修費用が発生。建設・不動産業界全体での品質管理と製品保証の見直しが起きた。",
    financialImpact: "改修費用・賠償 推計500億円超", stockImpact: "−31.5%", period: "発覚後1ヶ月",
    stockRecovery: "+22%（2年後）", source: "適時開示 / 国交省",
    tags: ["品質偽装", "建設賠償", "長期潜在リスク", "公共安全"],
    lesson: "公共安全に関わる製品の品質偽装は被害者が広範かつ潜在的であり、長期にわたる賠償リスクが発生する。製品認証の外部第三者検証が必要。",
  },
  {
    id: 12, company: "日本製鉄", ticker: "5401", sector: "鉄鋼",
    riskType: "geopolitical", severity: 6, date: "2024-01-05",
    title: "USスチール買収・米大統領命令による差し止めと機会損失",
    summary: "約2兆円のUSスチール買収が米政府安全保障審査（CFIUS）で大統領命令により差し止め。地政学リスクが大型クロスボーダーM&Aを阻止した事例として広く参照される。",
    financialImpact: "違約金リスク・機会損失 数千億円規模", stockImpact: "−8.1%", period: "差止命令後",
    stockRecovery: "訴訟継続中", source: "適時開示 / 報道",
    tags: ["地政学リスク", "CFIUS審査", "海外M&A", "政治リスク"],
    lesson: "米国・欧州の外資規制審査は安全保障分野の拡大解釈が進んでいる。クロスボーダーM&Aでは規制審査リスクの事前評価と撤退シナリオの策定が必要。",
  },
  {
    id: 13, company: "ソフトバンクグループ", ticker: "9984", sector: "情報・通信",
    riskType: "credit_default", severity: 7, date: "2023-02-06",
    title: "ビジョン・ファンド投資先の評価損6兆円超・信用格付け引下げ",
    summary: "世界的な金利上昇・テック株下落により投資先評価損が累計6兆円超に拡大。財務健全性への懸念からデット格付けが引き下げられた。投資先への取引与信管理の重要性を示す事例。",
    financialImpact: "累計6兆円超の投資損失", stockImpact: "−18.4%", period: "決算発表後",
    stockRecovery: "+35%（1年後）", source: "適時開示 / EDINET",
    tags: ["投資評価損", "信用格付低下", "金利上昇リスク", "与信管理"],
    lesson: "スタートアップへの集中投資は金利環境の変化に極めて脆弱。ポートフォリオの分散と市場変動シナリオを前提とした流動性管理が必要。",
  },
  {
    id: 14, company: "明治ホールディングス", ticker: "2269", sector: "食料品",
    riskType: "regulatory_penalty", severity: 5, date: "2022-08-24",
    title: "景品表示法違反・消費者庁措置命令と二次的訴訟リスク",
    summary: "機能性表示食品の優良誤認表示で消費者庁から措置命令。行政制裁は軽微だったが、関連する集団訴訟リスクや売上減少が続いた。広告表現のコンプライアンス管理の重要性を示す。",
    financialImpact: "約15億円の損失見込み", stockImpact: "−2.1%", period: "措置命令翌日",
    stockRecovery: "+5.3%（1ヶ月後）", source: "消費者庁 / 適時開示",
    tags: ["景表法違反", "措置命令", "広告コンプライアンス", "集団訴訟リスク"],
    lesson: "機能性表示食品の効能表示は景表法・薬機法の双方のリスクがある。広告制作段階での法務審査と社外専門家によるダブルチェックが必要。",
  },
];

const SECTORS = ["すべて","電気機器","輸送用機器","食料品","銀行業","保険業","建設業","情報・通信","電気・ガス","ゴム製品","鉄鋼","金属製品","精密機器"];

function getCat(id) {
  return ALL_CATEGORIES.find(c => c.id === id) || { label: id, groupColor: C.maroon, groupColorBg: C.maroonTint, groupColorBorder: C.border };
}
function scoreColor(s) {
  if (s >= 9) return C.danger;
  if (s >= 7) return C.warning;
  if (s >= 5) return C.gsDark;
  return C.safe;
}
function scoreLabel(s) {
  if (s >= 9) return "極めて重大";
  if (s >= 7) return "重大";
  if (s >= 5) return "中程度";
  return "軽微";
}
function scoreBg(s) {
  if (s >= 9) return C.dangerBg;
  if (s >= 7) return C.warningBg;
  if (s >= 5) return C.surfaceAlt;
  return C.safeBg;
}

function RiskBadge({ riskId }) {
  const m = getCat(riskId);
  return (
    <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 3, background: m.groupColorBg, color: m.groupColor, border: `1px solid ${m.groupColorBorder}`, fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function SeverityBar({ score, showLabel = true }) {
  const col = scoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 4, background: C.gsLight, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score * 10}%`, background: col, borderRadius: 2 }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, color: col, fontWeight: 600, minWidth: 80, textAlign: "right" }}>
          {score}/10 · {scoreLabel(score)}
        </span>
      )}
    </div>
  );
}

function RiskCard({ item, onClick, selected }) {
  const col = scoreColor(item.severity);
  return (
    <div
      onClick={() => onClick(item)}
      style={{
        background: selected ? C.maroonTint : C.surface,
        border: `1px solid ${selected ? C.maroon : C.border}`,
        borderLeft: `4px solid ${selected ? C.maroon : col}`,
        borderRadius: 6,
        padding: "14px 16px",
        cursor: "pointer",
        marginBottom: 8,
        boxShadow: selected ? "0 1px 4px rgba(128,0,0,.12)" : "0 1px 2px rgba(0,0,0,.04)",
        transition: "all .15s",
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = C.gsMid; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,.08)"; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,.04)"; }}}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ color: C.textPrim, fontWeight: 700, fontSize: 14 }}>{item.company}</span>
            <span style={{ color: C.textDim, fontSize: 11 }}>{item.ticker}</span>
            <RiskBadge riskId={item.riskType} />
          </div>
          <div style={{ color: C.textSec, fontSize: 12, lineHeight: 1.45 }}>{item.title}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ color: C.textDim, fontSize: 11, marginBottom: 3 }}>{item.date}</div>
          <span style={{ color: item.stockImpact.startsWith("−") ? C.danger : C.safe, fontWeight: 700, fontSize: 14 }}>
            {item.stockImpact}
          </span>
        </div>
      </div>
      <SeverityBar score={item.severity} />
    </div>
  );
}

function DetailPanel({ item, onClose }) {
  if (!item) return null;
  const sc = scoreColor(item.severity);
  const meta = getCat(item.riskType);

  return (
    <div style={{ flex: "0 0 400px", background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: "-2px 0 8px rgba(0,0,0,.06)" }}>
      {/* Maroon header */}
      <div style={{ background: C.maroon, padding: "16px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 3, background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", fontWeight: 600 }}>
                {meta.label}
              </span>
              <span style={{ color: "rgba(255,255,255,.55)", fontSize: 10 }}>{meta.groupLabel}</span>
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 10 }}>{item.date}</span>
            </div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "Georgia, serif", lineHeight: 1.3 }}>{item.company}</div>
            <div style={{ color: "rgba(255,255,255,.75)", fontSize: 12, marginTop: 5, lineHeight: 1.45 }}>{item.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,.25)", border: "none", color: "#fff", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 11, marginLeft: 12, flexShrink: 0 }}>✕</button>
        </div>
      </div>

      <div style={{ padding: "18px 20px", flex: 1 }}>
        {/* Score block */}
        <div style={{ background: scoreBg(item.severity), border: `1px solid ${scoreColor(item.severity)}33`, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ color: C.textMuted, fontSize: 10, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>リスク重大度スコア</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 52, fontWeight: 900, color: sc, lineHeight: 1 }}>{item.severity}</span>
            <span style={{ color: C.textMuted, fontSize: 18 }}>/10</span>
            <span style={{ color: sc, fontSize: 13, fontWeight: 700, marginLeft: 6 }}>{scoreLabel(item.severity)}</span>
          </div>
          <SeverityBar score={item.severity} showLabel={false} />
        </div>

        {/* Summary */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: C.maroon, fontSize: 10, letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>事案概要</div>
          <p style={{ color: C.textSec, fontSize: 13, lineHeight: 1.85, margin: 0 }}>{item.summary}</p>
        </div>

        {/* Impact grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "損害・財務影響", val: item.financialImpact, col: C.danger },
            { label: `株価影響（${item.period}）`, val: item.stockImpact, col: item.stockImpact.startsWith("−") ? C.danger : C.safe },
            { label: "業種", val: item.sector, col: C.textSec },
            { label: "株価回復", val: item.stockRecovery, col: C.textMuted },
          ].map(({ label, val, col }) => (
            <div key={label} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px" }}>
              <div style={{ color: C.textDim, fontSize: 10, marginBottom: 4 }}>{label}</div>
              <div style={{ color: col, fontSize: 11, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Lesson */}
        {item.lesson && (
          <div style={{ background: "#F7F4EF", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.maroon}`, borderRadius: 4, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ color: C.maroon, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>同じ轍を踏まないために</div>
            <p style={{ color: C.textSec, fontSize: 12, lineHeight: 1.7, margin: 0 }}>{item.lesson}</p>
          </div>
        )}

        {/* Tags */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: C.maroon, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>関連キーワード</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.surfaceAlt, color: C.textSec, border: `1px solid ${C.border}` }}>{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 16 }}>
          <div style={{ color: C.textDim, fontSize: 10, marginBottom: 3 }}>データソース</div>
          <div style={{ color: C.textMuted, fontSize: 12 }}>{item.source}</div>
        </div>

        <button style={{ width: "100%", padding: "11px", background: C.maroon, border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: "0.03em" }}>
          リスク説明資料として出力（PDF）
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, col }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 16px", flex: 1 }}>
      <div style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ color: col || C.textPrim, fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [query, setQuery]    = useState("");
  const [selGroup, setGroup] = useState("all");
  const [selType, setType]   = useState("all");
  const [sector, setSector]  = useState("すべて");
  const [minSev, setMinSev]  = useState(1);
  const [sortBy, setSortBy]  = useState("date");
  const [detail, setDetail]  = useState(null);
  const [dbData, setDbData]  = useState([]);
  const [loading, setLoading]= useState(true);
  const [dbError, setDbError]= useState("");

  // Supabaseからデータを取得
  useEffect(() => {
    const isConfigured = SUPABASE_URL && !SUPABASE_URL.includes("%%");
    if (!isConfigured) {
      // 未設定の場合はサンプルデータを使用
      setDbData(SAMPLE_DATA.map(toUIRecord || (x => x)));
      setLoading(false);
      return;
    }
    fetchRiskEvents({ limit: 1000 })
      .then(rows => {
        setDbData(rows.map(toUIRecord));
        setLoading(false);
      })
      .catch(err => {
        console.error("Supabase fetch error:", err);
        setDbError("データの取得に失敗しました。サンプルデータを表示します。");
        setDbData(SAMPLE_DATA);
        setLoading(false);
      });
  }, []);

  const allData = dbData.length > 0 ? dbData : SAMPLE_DATA;

  function handleGroup(gid) { setGroup(gid); setType("all"); }

  const filtered = useMemo(() => {
    let d = [...allData];
    if (query) {
      const q = query.toLowerCase();
      d = d.filter(x => (x.company||"").toLowerCase().includes(q) || (x.title||"").toLowerCase().includes(q) || (x.summary||"").toLowerCase().includes(q) || (x.tags||[]).some(t => (t||"").includes(query)));
    }
    if (selType !== "all") {
      d = d.filter(x => x.riskType === selType);
    } else if (selGroup !== "all") {
      const ids = RISK_TAXONOMY.find(g => g.groupId === selGroup)?.children.map(c => c.id) || [];
      d = d.filter(x => ids.includes(x.riskType));
    }
    if (sector !== "すべて") d = d.filter(x => x.sector === sector);
    d = d.filter(x => x.severity >= minSev);
    if (sortBy === "severity") d.sort((a, b) => b.severity - a.severity);
    else d.sort((a, b) => b.date.localeCompare(a.date));
    return d;
  }, [query, selGroup, selType, sector, minSev, sortBy]);

  const avg = filtered.length ? (filtered.reduce((s, d) => s + d.severity, 0) / filtered.length).toFixed(1) : "—";
  const critical = filtered.filter(d => d.severity >= 9).length;
  const activeGroup = RISK_TAXONOMY.find(g => g.groupId === selGroup);

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, color: C.textPrim, fontFamily: "'DM Sans','Hiragino Sans',sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ background: C.maroon, padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 24, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.35)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "Georgia, serif" }}>RDB</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "Georgia, serif", letterSpacing: "0.01em" }}>Risk DB</div>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, letterSpacing: "0.06em" }}>Corporate Risk Intelligence — 過去の失敗から学ぶ</div>
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 520 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="企業名・リスク種別・キーワードで検索…" style={{ width: "100%", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 6, padding: "8px 15px", color: "#fff", fontSize: 13, outline: "none" }} />
        </div>
        <div style={{ marginLeft: "auto", color: "rgba(255,255,255,.55)", fontSize: 10, textAlign: "right", flexShrink: 0 }}>
          <div>上場企業 4,000社 ｜ EDINET / 官報 / 金融庁</div>
          <div>5大分類 16小分類 ｜ 収録期間: 過去10年</div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <aside style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, padding: "18px 14px", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ color: C.maroon, fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12 }}>リスク大分類</div>

          {[{ groupId: "all", groupLabel: "すべてのリスク", groupIcon: "≡", color: C.maroon, colorBg: C.maroonTint, colorBorder: C.maroon + "33" }, ...RISK_TAXONOMY].map(g => (
            <button
              key={g.groupId}
              onClick={() => handleGroup(g.groupId)}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 2, background: selGroup === g.groupId ? g.colorBg || C.maroonTint : "transparent", color: selGroup === g.groupId ? g.color : C.textMuted, border: `1px solid ${selGroup === g.groupId ? (g.colorBorder || C.maroon + "55") : "transparent"}`, borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: selGroup === g.groupId ? 600 : 400 }}
            >
              <span style={{ fontSize: 12, color: g.color, flexShrink: 0 }}>{g.groupIcon}</span>
              {g.groupLabel}
            </button>
          ))}

          {activeGroup && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <div style={{ color: activeGroup.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
                小分類
              </div>
              <div style={{ color: C.textDim, fontSize: 11, lineHeight: 1.6, marginBottom: 10 }}>{activeGroup.desc}</div>
              {[{ id: "all", label: "すべて" }, ...activeGroup.children].map(c => (
                <button key={c.id} onClick={() => setType(c.id)} title={c.desc || ""} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 2, background: selType === c.id ? activeGroup.colorBg : "transparent", color: selType === c.id ? activeGroup.color : C.textMuted, border: `1px solid ${selType === c.id ? activeGroup.colorBorder : "transparent"}`, borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: selType === c.id ? 600 : 400 }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ color: C.maroon, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>業種</div>
            <select value={sector} onChange={e => setSector(e.target.value)} style={{ width: "100%", background: C.canvas, border: `1px solid ${C.border}`, color: C.textSec, borderRadius: 4, padding: "6px 8px", fontSize: 11 }}>
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: C.maroon, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>最低スコア</span>
              <span style={{ color: C.maroon, fontSize: 13, fontWeight: 800 }}>{minSev}+</span>
            </div>
            <input type="range" min={1} max={10} step={1} value={minSev} onChange={e => setMinSev(Number(e.target.value))} style={{ width: "100%", accentColor: C.maroon }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: C.textDim, fontSize: 10, marginTop: 4 }}>
              <span>軽微(1)</span><span>重大(10)</span>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ color: C.maroon, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>並び順</div>
            {[["date", "発生日（新しい順）"], ["severity", "重大度（高い順）"]].map(([v, l]) => (
              <button key={v} onClick={() => setSortBy(v)} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 2, background: sortBy === v ? C.maroonTint : "transparent", color: sortBy === v ? C.maroon : C.textMuted, border: `1px solid ${sortBy === v ? C.maroon + "44" : "transparent"}`, borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: sortBy === v ? 600 : 400 }}>{l}</button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <Stat label="検索結果" value={filtered.length} />
            <Stat label="平均スコア" value={avg} col={C.warning} />
            <Stat label="重大事例（9〜10）" value={critical} col={C.danger} />
            <Stat label="収録期間" value="10年" col={C.gsDark} />
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: C.textDim }}>
              <div style={{ fontSize: 32, marginBottom: 12, color: C.gsLight }}>◎</div>
              <div style={{ fontSize: 14 }}>条件に一致するリスク事例が見つかりません</div>
            </div>
          ) : filtered.map(item => (
            <RiskCard key={item.id} item={item} onClick={setDetail} selected={detail?.id === item.id} />
          ))}
        </main>

        {detail && <DetailPanel item={detail} onClose={() => setDetail(null)} />}
      </div>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "10px 24px", display: "flex", justifyContent: "space-between", background: C.surface, flexShrink: 0 }}>
        <span style={{ color: C.textDim, fontSize: 11 }}>データソース：EDINET API · 東証適時開示 · 官報 · 金融庁 · 消費者庁</span>
        <span style={{ color: C.textDim, fontSize: 11 }}>情報提供のみ。意思決定の最終判断はご自身でご確認ください</span>
      </footer>
    </div>
  );
}
