import { useState } from 'react'
import { Link } from 'react-router'

export function meta() {
  return [{ title: 'IELTS Writing Guide – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

interface Section {
  id: string
  title: string
  content: React.ReactNode
}

interface TaskGuide {
  id: string
  task: 'Task 1' | 'Task 2'
  type: string
  band: string
  structure: string[]
  timeGuide: string
  wordCount: string
  tips: string[]
  templateParagraphs: { label: string; template: string; note?: string }[]
  commonMistakes: string[]
  usefulPhrases: string[]
}

// ---------------------------------------------------------------------------
// Guide data
// ---------------------------------------------------------------------------

const GUIDES: TaskGuide[] = [
  // ── TASK 1: Line Graph / Bar Chart ─────────────────────────────────────
  {
    id: 't1-line',
    task: 'Task 1',
    type: 'Line Graph / Bar Chart',
    band: '6.0–7.5',
    structure: ['Introduction (paraphrase)', 'Overview (main trends)', 'Body 1 (key data group A)', 'Body 2 (key data group B)'],
    timeGuide: '20 phút',
    wordCount: '≥ 150 words',
    tips: [
      'KHÔNG viết opinion hoặc lý do — chỉ mô tả dữ liệu',
      'Luôn viết Overview — đây là tiêu chí quan trọng nhất của Task Achievement',
      'So sánh và liên kết các xu hướng, đừng liệt kê từng số liệu',
      'Dùng đa dạng từ chỉ xu hướng: rose, declined, peaked, levelled off, fluctuated',
    ],
    templateParagraphs: [
      {
        label: 'Introduction',
        template: 'The [chart type] illustrates/shows/compares [what] [where/when].',
        note: 'Paraphrase đề bài, KHÔNG copy nguyên văn',
      },
      {
        label: 'Overview',
        template: 'Overall, it is clear that [main trend 1], while [main trend 2]. [The most notable feature is that...]',
        note: 'Viết 2–3 điểm nổi bật nhất, không cần số liệu cụ thể',
      },
      {
        label: 'Body 1',
        template: 'In [year/period], [subject] stood at [figure]. This [rose/fell] [steadily/sharply] to [figure] by [year], before [levelling off/declining to] [figure] in [year].',
        note: 'Tập trung vào 1 nhóm dữ liệu, dùng số liệu cụ thể',
      },
      {
        label: 'Body 2',
        template: 'By contrast/In comparison, [subject] [started at/was] [figure] in [year] and [experienced/saw] a [gradual/dramatic] [increase/decrease] to [figure] by [year].',
        note: 'So sánh với Body 1 bằng linking words',
      },
    ],
    commonMistakes: [
      '❌ Viết opinion: "I think this is because..." → Task 1 KHÔNG cần lý do',
      '❌ Copy nguyên văn đề bài vào Introduction',
      '❌ Bỏ qua Overview paragraph',
      '❌ Liệt kê tất cả số liệu mà không so sánh',
      '❌ Dùng mãi một từ "increase/decrease" — hãy vary: rose, climbed, surged, plummeted...',
    ],
    usefulPhrases: [
      'Tăng: rose, increased, climbed, grew, surged, soared',
      'Giảm: fell, declined, dropped, decreased, plummeted, dipped',
      'Đỉnh cao: peaked at, reached a high of, hit a peak of',
      'Đáy thấp: bottomed out at, reached a low of',
      'Ổn định: remained stable/constant, levelled off, plateaued',
      'Dao động: fluctuated, varied',
      'Tốc độ: gradually, steadily, sharply, dramatically, slightly, marginally',
      'So sánh: by contrast, in comparison, while, whereas, similarly',
    ],
  },
  // ── TASK 1: Pie Chart ──────────────────────────────────────────────────
  {
    id: 't1-pie',
    task: 'Task 1',
    type: 'Pie Chart',
    band: '6.0–7.0',
    structure: ['Introduction (paraphrase)', 'Overview (largest/smallest shares)', 'Body 1 (dominant categories)', 'Body 2 (smaller categories)'],
    timeGuide: '20 phút',
    wordCount: '≥ 150 words',
    tips: [
      'Nhóm các categories tương tự lại với nhau thay vì liệt kê từng cái',
      'So sánh tỉ lệ: "X accounted for twice as much as Y"',
      'Nếu có 2 pie charts (2 năm), tập trung vào sự thay đổi',
      'Overview: nêu category lớn nhất và nhỏ nhất',
    ],
    templateParagraphs: [
      {
        label: 'Introduction',
        template: 'The pie chart(s) show(s) the proportion/distribution of [what] in [where/when].',
      },
      {
        label: 'Overview',
        template: 'Overall, [largest category] accounted for the largest share, while [smallest category] represented the smallest proportion.',
      },
      {
        label: 'Body 1',
        template: '[Category A] made up [X]% of the total, making it the [largest/most significant] category. This was followed by [Category B], which accounted for [Y]%.',
      },
      {
        label: 'Body 2',
        template: 'The remaining proportions were divided among [Category C] ([Z]%) and [Category D] ([W]%), which together constituted [total]% of the whole.',
      },
    ],
    commonMistakes: [
      '❌ Viết từng category riêng lẻ không so sánh',
      '❌ Dùng số tuyệt đối khi đề chỉ cho %',
      '❌ Bỏ sót categories nhỏ hoàn toàn',
    ],
    usefulPhrases: [
      'Tỉ lệ: accounted for, made up, constituted, represented, comprised',
      'Lớn nhất: the largest share, the majority, the dominant category, more than half',
      'Nhỏ nhất: the smallest proportion, a minor share, only X%',
      'So sánh: twice as much as, three times larger than, significantly more/less than',
    ],
  },
  // ── TASK 1: Process / Diagram ──────────────────────────────────────────
  {
    id: 't1-process',
    task: 'Task 1',
    type: 'Process Diagram / Map',
    band: '6.0–7.5',
    structure: ['Introduction (paraphrase)', 'Overview (số bước / thay đổi chính)', 'Body 1 (giai đoạn đầu)', 'Body 2 (giai đoạn sau)'],
    timeGuide: '20 phút',
    wordCount: '≥ 150 words',
    tips: [
      'Process: dùng passive voice — "Raw materials are fed into...", "The mixture is then heated..."',
      'Map: dùng location language — "to the north of", "adjacent to", "opposite"',
      'Overview process: nêu số bước và sản phẩm cuối',
      'Overview map: nêu thay đổi lớn nhất (built/demolished/expanded)',
    ],
    templateParagraphs: [
      {
        label: 'Introduction (Process)',
        template: 'The diagram illustrates the process by which [product] is [produced/manufactured/created].',
      },
      {
        label: 'Introduction (Map)',
        template: 'The maps show how [place] has changed/developed between [year 1] and [year 2].',
      },
      {
        label: 'Overview (Process)',
        template: 'Overall, the process involves [X] main stages, beginning with [first step] and culminating in [final product].',
      },
      {
        label: 'Overview (Map)',
        template: 'Overall, [place] underwent significant development over this period, with [major change 1] and [major change 2].',
      },
      {
        label: 'Body (Process)',
        template: 'In the first stage, [material/input] is [action + past participle]. This is then [action], after which [result]. Subsequently, [next step] occurs, resulting in [output].',
        note: 'Dùng passive và sequence words: firstly, then, after this, subsequently, finally',
      },
    ],
    commonMistakes: [
      '❌ Dùng active voice trong process: "Workers feed..." → ✅ "Raw materials are fed..."',
      '❌ Không dùng sequence words (firstly, then, finally)',
      '❌ Map: không đề cập các tòa nhà/khu vực bị xóa/thêm',
    ],
    usefulPhrases: [
      'Sequence: first, initially, then, next, after this, subsequently, following this, finally, at the last stage',
      'Passive: is/are + V3, is/are then + V3, is/are subsequently + V3',
      'Map directions: to the north/south/east/west of, in the centre, adjacent to, opposite, alongside',
      'Map changes: was replaced by, was demolished, was constructed, was extended, remained unchanged',
    ],
  },
  // ── TASK 2: Discussion (Discuss both views) ────────────────────────────
  {
    id: 't2-discuss',
    task: 'Task 2',
    type: 'Discussion — Discuss Both Views',
    band: '6.5–8.0',
    structure: ['Introduction (paraphrase + thesis)', 'Body 1 (View A + support)', 'Body 2 (View B + support)', 'Conclusion (summary + own view)'],
    timeGuide: '40 phút',
    wordCount: '≥ 250 words',
    tips: [
      'Phải thảo luận CẢ HAI quan điểm — không thiên lệch một bên trong body',
      'Đưa ra ý kiến cá nhân trong Introduction và Conclusion',
      'Mỗi body paragraph: 1 quan điểm + lý do + ví dụ + giải thích',
      'Dùng hedging language: "While some argue... others contend..."',
    ],
    templateParagraphs: [
      {
        label: 'Introduction',
        template: 'It is often argued that [View A], while others maintain that [View B]. Although both perspectives have merit, I believe that [your position].',
      },
      {
        label: 'Body 1 — View A',
        template: 'Those who believe [View A] argue that [reason]. For instance, [example]. This suggests that [implication/analysis]. Consequently, [conclusion for this view].',
      },
      {
        label: 'Body 2 — View B',
        template: 'On the other hand, proponents of [View B] contend that [reason]. A clear example of this can be seen in [example]. This demonstrates that [analysis]. Therefore, [conclusion for this view].',
      },
      {
        label: 'Conclusion',
        template: 'In conclusion, while [View A] has [some/certain] validity, I am more convinced by [View B] because [brief reason]. [Recommendation or prediction if relevant].',
        note: 'Không đưa ý mới trong Conclusion',
      },
    ],
    commonMistakes: [
      '❌ Chỉ thảo luận 1 quan điểm — bị trừ điểm nặng Task Achievement',
      '❌ Không nêu ý kiến cá nhân khi đề yêu cầu',
      '❌ Body paragraphs không có example/evidence',
      '❌ Kết luận quá ngắn hoặc chỉ lặp lại Introduction',
    ],
    usefulPhrases: [
      'Presenting views: It is often argued that, Some people believe, Proponents of X contend that',
      'Contrast: On the other hand, By contrast, However, While, Whereas',
      'Supporting: For instance, A clear example is, This is evident in, Consider the case of',
      'Analysis: This suggests that, This demonstrates that, This implies that, As a result',
      'Conceding: Although, While it is true that, Despite this, Admittedly',
    ],
  },
  // ── TASK 2: Opinion (Agree/Disagree) ──────────────────────────────────
  {
    id: 't2-opinion',
    task: 'Task 2',
    type: 'Opinion — To What Extent Do You Agree?',
    band: '6.5–8.0',
    structure: ['Introduction (state position clearly)', 'Body 1 (main reason 1 + support)', 'Body 2 (main reason 2 + support)', 'Body 3 (concession + rebuttal) — optional', 'Conclusion'],
    timeGuide: '40 phút',
    wordCount: '≥ 250 words',
    tips: [
      'State your position CLEARLY in Introduction — agree/disagree/partially agree',
      'Cả 2 body paragraphs phải support cùng 1 quan điểm của bạn',
      'Thêm 1 "concession paragraph" để thừa nhận quan điểm đối lập — giúp tăng band',
      'Dùng hedging để thể hiện nuanced thinking: "While X may have some merit, overall..."',
    ],
    templateParagraphs: [
      {
        label: 'Introduction',
        template: 'It has been suggested that [statement from question]. I [completely/largely/partially] agree with this view for the following reasons.',
        note: 'Hoặc: "While there is some truth to this, I believe that [counter position]"',
      },
      {
        label: 'Body 1',
        template: 'The primary reason I [agree/disagree] is that [reason]. For example, [evidence/example]. This clearly demonstrates that [analysis], which supports the view that [link back to thesis].',
      },
      {
        label: 'Body 2',
        template: 'Furthermore, [second reason]. This is particularly evident in [example]. As a result, [consequence], reinforcing the argument that [thesis].',
      },
      {
        label: 'Concession (optional)',
        template: 'Admittedly, [opposing view]. However, this does not outweigh [your main argument] because [rebuttal]. Therefore, [restate thesis].',
      },
      {
        label: 'Conclusion',
        template: 'In conclusion, I firmly believe that [restate thesis]. [Summary of key reasons]. [Future prediction or recommendation].',
      },
    ],
    commonMistakes: [
      '❌ Không state position rõ ràng trong Introduction',
      '❌ Body paragraphs đi cả hai hướng — mâu thuẫn với thesis',
      '❌ Không phát triển ý — chỉ nêu ý kiến mà không giải thích/ví dụ',
      '❌ Kết luận lặp lại y hệt Introduction bằng cùng từ ngữ',
    ],
    usefulPhrases: [
      'Strong agreement: I firmly believe, I am convinced that, There is no doubt that',
      'Partial: While X has some merit, I largely believe, To a great extent',
      'Reasons: The primary reason is, Furthermore, In addition, Another key factor is',
      'Examples: For instance, To illustrate, A prime example is, Consider how',
      'Concession: Admittedly, It is true that, While I acknowledge that, Nevertheless',
    ],
  },
  // ── TASK 2: Advantages & Disadvantages ────────────────────────────────
  {
    id: 't2-adv',
    task: 'Task 2',
    type: 'Advantages & Disadvantages',
    band: '6.0–7.5',
    structure: ['Introduction (paraphrase + thesis)', 'Body 1 (Advantages)', 'Body 2 (Disadvantages)', 'Conclusion (summary + opinion)'],
    timeGuide: '40 phút',
    wordCount: '≥ 250 words',
    tips: [
      'Phải discuss CẢ advantages AND disadvantages — không bỏ qua một bên',
      'Đề thường hỏi thêm "Do the advantages outweigh disadvantages?" — cần nêu quan điểm',
      'Mỗi body: 2–3 advantages/disadvantages, không liệt kê nhiều mà không develop',
      'Develop mỗi point đầy đủ: reason + example + explanation',
    ],
    templateParagraphs: [
      {
        label: 'Introduction',
        template: '[Paraphrase topic]. This essay will examine both the advantages and disadvantages of this trend, before concluding that the [benefits/drawbacks] outweigh the [drawbacks/benefits].',
      },
      {
        label: 'Body 1 — Advantages',
        template: 'There are several significant advantages to [topic]. Firstly, [advantage 1]. For example, [evidence]. This means that [analysis]. Additionally, [advantage 2], which leads to [outcome].',
      },
      {
        label: 'Body 2 — Disadvantages',
        template: 'However, there are also notable drawbacks. The most serious disadvantage is [disadvantage 1], which can result in [consequence]. Furthermore, [disadvantage 2] poses a significant challenge because [reason].',
      },
      {
        label: 'Conclusion',
        template: 'In conclusion, while [topic] has clear [advantages/disadvantages] in terms of [summary], the [disadvantages/advantages] — particularly [key point] — ultimately [outweigh/do not outweigh] the [positives/negatives]. [Recommendation].',
      },
    ],
    commonMistakes: [
      '❌ Chỉ liệt kê advantages/disadvantages mà không explain hoặc ví dụ',
      '❌ Không cân bằng hai sides',
      '❌ Quên nêu quan điểm khi đề hỏi "Do advantages outweigh disadvantages?"',
    ],
    usefulPhrases: [
      'Advantages: a key benefit is, one significant advantage is, this can lead to, this enables',
      'Disadvantages: a major drawback is, a significant concern is, this can result in, this poses a risk',
      'Balancing: however, on the other hand, despite this, although, while',
      'Weighing: the advantages clearly outweigh, the benefits do not compensate for, overall the positives prevail',
    ],
  },
  // ── TASK 2: Causes & Solutions ─────────────────────────────────────────
  {
    id: 't2-causes',
    task: 'Task 2',
    type: 'Causes & Solutions (or Causes & Effects)',
    band: '6.0–7.5',
    structure: ['Introduction', 'Body 1 (2–3 causes)', 'Body 2 (2–3 solutions/effects)', 'Conclusion'],
    timeGuide: '40 phút',
    wordCount: '≥ 250 words',
    tips: [
      'Các causes và solutions phải LIÊN QUAN đến nhau logically',
      'Solution phải address trực tiếp cause đã nêu',
      'Dùng topic sentences rõ ràng cho mỗi paragraph',
      'Tránh chỉ nêu causes/solutions mà không explain WHY/HOW',
    ],
    templateParagraphs: [
      {
        label: 'Introduction',
        template: '[Topic] has become an increasingly serious issue in recent decades. This essay will examine the primary causes of this problem and propose effective solutions to address them.',
      },
      {
        label: 'Body 1 — Causes',
        template: 'There are several key reasons why [problem] has emerged. One major cause is [cause 1]. This occurs because [explanation]. Another significant factor is [cause 2], which contributes to the problem by [how].',
      },
      {
        label: 'Body 2 — Solutions',
        template: 'A number of measures could be taken to tackle these issues. To address [cause 1], [solution 1] should be implemented. This would effectively reduce [problem] by [mechanism]. With regard to [cause 2], [solution 2] would help [outcome].',
        note: 'Pair each solution with the cause it addresses',
      },
      {
        label: 'Conclusion',
        template: 'In conclusion, [problem] stems primarily from [summarise causes]. However, by [summarise solutions], it is possible to significantly mitigate this issue. [Outlook/call to action].',
      },
    ],
    commonMistakes: [
      '❌ Solutions không address causes đã nêu trong Body 1',
      '❌ Chỉ nêu 1 cause và 1 solution — quá superficial',
      '❌ Dùng "we" quá nhiều — prefer "governments/individuals/society should..."',
    ],
    usefulPhrases: [
      'Causes: is caused by, stems from, is attributed to, arises from, is a consequence of',
      'Solutions: should be implemented, could be addressed by, would help to, it is essential that',
      'Suggestions: governments should, individuals ought to, authorities must, it is recommended that',
      'Effects: leads to, results in, contributes to, has a significant impact on',
    ],
  },
  // ── TASK 2: Problem & Solution ─────────────────────────────────────────
  {
    id: 't2-problem',
    task: 'Task 2',
    type: 'Problem & Solution',
    band: '6.0–7.5',
    structure: ['Introduction', 'Body 1 (problems)', 'Body 2 (solutions)', 'Conclusion'],
    timeGuide: '40 phút',
    wordCount: '≥ 250 words',
    tips: [
      'Khác Causes & Solutions: đây focus vào consequences/problems hiện tại',
      'Mỗi problem nên được address bởi 1 solution cụ thể',
      'Dùng modal verbs cho solutions: should, must, could, ought to',
      'Nêu WHO nên implement solution: governments, schools, individuals, companies',
    ],
    templateParagraphs: [
      {
        label: 'Introduction',
        template: '[Paraphrase topic]. This has created a number of serious problems. This essay will identify these problems and suggest practical solutions to overcome them.',
      },
      {
        label: 'Body 1 — Problems',
        template: '[Topic] has given rise to several significant problems. The most pressing issue is [problem 1], which manifests in [how]. A further problem is [problem 2], which has [negative consequence].',
      },
      {
        label: 'Body 2 — Solutions',
        template: 'These problems can be effectively addressed through several measures. [Problem 1] could be tackled by [solution], which would [outcome]. To resolve [problem 2], [solution] should be introduced because [reason].',
      },
      {
        label: 'Conclusion',
        template: 'In conclusion, [topic] has resulted in serious challenges including [problems]. Nevertheless, through [solutions], these obstacles can be overcome. [Final recommendation].',
      },
    ],
    commonMistakes: [
      '❌ Nhầm lẫn Problems với Causes — problems là hậu quả đang xảy ra',
      '❌ Giải pháp quá chung chung: "Education is important" — cần specific',
    ],
    usefulPhrases: [
      'Problems: a serious problem is, this poses a significant challenge, one of the main concerns is',
      'Solutions: this could be addressed by, a possible solution is, one effective measure would be',
      'Implementation: governments should, schools ought to, companies must, individuals can',
    ],
  },
]

// ---------------------------------------------------------------------------
// Task type colors
// ---------------------------------------------------------------------------

const TASK_COLORS = {
  'Task 1': { badge: 'bg-blue-100 text-blue-700', header: 'bg-blue-600', light: 'bg-blue-50 border-blue-200' },
  'Task 2': { badge: 'bg-purple-100 text-purple-700', header: 'bg-purple-600', light: 'bg-purple-50 border-purple-200' },
}

// ---------------------------------------------------------------------------
// GuideCard component
// ---------------------------------------------------------------------------

function GuideCard({ guide }: { guide: TaskGuide }) {
  const [expanded, setExpanded] = useState(false)
  const colors = TASK_COLORS[guide.task]

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 focus:outline-none"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`shrink-0 text-xs font-semibold rounded-full px-2.5 py-0.5 ${colors.badge}`}>
            {guide.task}
          </span>
          <h3 className="text-sm font-semibold text-gray-900">{guide.type}</h3>
          <span className="text-xs text-gray-400">• {guide.wordCount} • {guide.timeGuide}</span>
        </div>
        <svg
          className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">
          {/* Structure */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Cấu trúc bài</p>
            <div className="flex flex-wrap gap-2">
              {guide.structure.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center ${colors.header}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{s}</span>
                  {i < guide.structure.length - 1 && <span className="text-gray-300">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className={`rounded-lg border p-4 ${colors.light}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">💡 Tips quan trọng</p>
            <ul className="space-y-1.5">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 text-blue-500">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Template paragraphs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">📝 Template các đoạn văn</p>
            <div className="space-y-3">
              {guide.templateParagraphs.map((para, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">{para.label}</p>
                  <p className="text-sm text-indigo-800 font-mono leading-relaxed bg-indigo-50 rounded px-3 py-2 border border-indigo-100">
                    {para.template}
                  </p>
                  {para.note && (
                    <p className="mt-2 text-xs text-amber-700 italic">⚠️ {para.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Common mistakes */}
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">🚫 Lỗi thường gặp</p>
            <ul className="space-y-1.5">
              {guide.commonMistakes.map((m, i) => (
                <li key={i} className="text-sm text-red-800">{m}</li>
              ))}
            </ul>
          </div>

          {/* Useful phrases */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">🔤 Cụm từ hữu ích</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {guide.usefulPhrases.map((phrase, i) => (
                <div key={i} className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700">
                  {phrase}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function WritingGuidePage() {
  const [filter, setFilter] = useState<'All' | 'Task 1' | 'Task 2'>('All')

  const filtered = filter === 'All' ? GUIDES : GUIDES.filter(g => g.task === filter)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-2">
        <Link to="/grammar/essay" className="text-sm text-indigo-600 hover:underline">
          ← Essay Practice
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IELTS Writing Guide</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hướng dẫn chi tiết cách viết từng dạng bài IELTS Writing Task 1 và Task 2 — cùng template, tips, và lỗi cần tránh.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        {(['All', 'Task 1', 'Task 2'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'All' ? 'Tất cả' : f}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} dạng bài</span>
      </div>

      {/* Guide cards */}
      <div className="space-y-3">
        {filtered.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {/* Link to practice */}
      <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-center text-white">
        <p className="font-semibold">Đã nắm lý thuyết?</p>
        <p className="mt-1 text-sm text-blue-200">Luyện tập ngay với AI scoring để nhận feedback chi tiết</p>
        <Link
          to="/grammar/essay"
          className="mt-3 inline-block rounded-lg bg-white px-5 py-2 text-sm font-semibold text-indigo-700 hover:bg-blue-50 transition-colors"
        >
          ✍️ Bắt đầu Essay Practice
        </Link>
      </div>
    </div>
  )
}
