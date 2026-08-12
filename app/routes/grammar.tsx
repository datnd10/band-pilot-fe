import { useState, useMemo } from 'react'

export function meta() {
  return [{ title: 'Grammar Reference – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

type BandLevel = '4.0-5.0' | '5.0-5.5' | '5.5-6.0' | '6.0-6.5' | '6.5-7.0' | '7.0-7.5' | '7.5+'
type Priority = 'required' | 'band-booster' | 'low-priority'
type Status = 'có' | 'thiếu' | 'chưa đủ' | 'một phần'

export interface GrammarRule {
  id: string
  topic: string
  category: string
  band: BandLevel
  title: string
  priority: Priority
  status: Status
  explanation: string
  structure: string
  examples: string[]
  commonErrors?: string[]
  notes?: string
}

// ---------------------------------------------------------------------------
// Grammar data
// ---------------------------------------------------------------------------

export const GRAMMAR_DATA: GrammarRule[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // MỐC 1 — BẮT BUỘC: Band 4.0–5.0 — Grammar Foundation
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 't1',
    topic: 'Tenses',
    category: 'Present Simple',
    band: '4.0-5.0',
    priority: 'required',
    status: 'có',
    title: 'Present Simple',
    explanation: 'Diễn tả sự thật hiển nhiên, thói quen, lịch trình cố định, và quan điểm chung. Dùng rất nhiều trong IELTS Writing để trình bày sự thật và xu hướng hiện tại.',
    structure: 'S + V(s/es) | S + do/does + not + V | Do/Does + S + V?',
    examples: [
      'Water boils at 100°C under standard atmospheric pressure.',
      'The government implements new policies every year to address rising inequality.',
      'Many researchers argue that climate change poses an existential threat to humanity.',
      'Countries that invest in education tend to have stronger economies in the long run.',
    ],
    commonErrors: [
      '❌ She work hard → ✅ She works hard (third person singular +s)',
      '❌ He don\'t agree → ✅ He doesn\'t agree',
      '❌ The education is important → ✅ Education is important (general uncountable)',
    ],
    notes: 'Trong IELTS Writing Task 2, Present Simple là thì chủ đạo cho mọi lập luận, bằng chứng, và kết luận.',
  },
  {
    id: 't2',
    topic: 'Tenses',
    category: 'Present Continuous',
    band: '4.0-5.0',
    priority: 'required',
    status: 'có',
    title: 'Present Continuous',
    explanation: 'Diễn tả hành động đang xảy ra tại thời điểm nói, xu hướng đang thay đổi, hoặc sắp xếp trong tương lai gần.',
    structure: 'S + am/is/are + V-ing | S + am/is/are + not + V-ing',
    examples: [
      'The number of electric vehicles is growing rapidly across major economies.',
      'Governments worldwide are investing heavily in renewable energy infrastructure.',
      'Urban populations are increasingly moving to suburban areas due to high living costs.',
      'Scientists are currently studying the long-term effects of microplastics on human health.',
    ],
    commonErrors: [
      '❌ She is know the answer → ✅ She knows the answer (stative verbs không dùng continuous)',
      '❌ They are everyday going → ✅ They go every day',
    ],
    notes: 'Không dùng Present Continuous với stative verbs: know, believe, understand, want, seem, prefer, own.',
  },
  {
    id: 't4',
    topic: 'Tenses',
    category: 'Past Simple',
    band: '4.0-5.0',
    priority: 'required',
    status: 'có',
    title: 'Past Simple',
    explanation: 'Diễn tả hành động đã hoàn thành trong quá khứ tại một thời điểm cụ thể. Dùng trong IELTS để trình bày dữ liệu lịch sử và bằng chứng quá khứ.',
    structure: 'S + V2 | S + did not + V | Did + S + V?',
    examples: [
      'The Industrial Revolution transformed society fundamentally in the 18th century.',
      'Unemployment rates peaked at 25% during the Great Depression of the 1930s.',
      'Scientists first discovered the link between smoking and cancer in the 1950s.',
      'The government introduced a series of welfare reforms in response to growing inequality.',
    ],
    commonErrors: [
      '❌ He goed home → ✅ He went home',
      '❌ She didn\'t went → ✅ She didn\'t go',
      '❌ They have arrived yesterday → ✅ They arrived yesterday (specific past time = Past Simple, not Present Perfect)',
    ],
    notes: 'Khi có thời gian cụ thể (in 1990, last year, yesterday), dùng Past Simple, không dùng Present Perfect.',
  },
  {
    id: 'art1',
    topic: 'Articles',
    category: 'A/An/The',
    band: '4.0-5.0',
    priority: 'required',
    status: 'có',
    title: 'Articles — A, An, The',
    explanation: '"A/an" dùng khi nhắc đến danh từ lần đầu hoặc khi danh từ không cụ thể. "The" dùng khi danh từ đã được xác định, là duy nhất, hoặc đã biết ngữ cảnh. Đây là một trong những lỗi phổ biến nhất của người Việt học IELTS.',
    structure: 'a/an + N (đếm được, số ít, chưa xác định) | the + N (đã xác định, duy nhất)',
    examples: [
      'A government should prioritise the welfare of its citizens above all else.',
      'The internet has revolutionised the way people communicate and access information.',
      'Education plays a crucial role in a nation\'s long-term economic development.',
      'The gap between the rich and the poor is widening at an alarming rate.',
    ],
    commonErrors: [
      '❌ The education is important → ✅ Education is important (danh từ chung, bỏ article)',
      '❌ A internet → ✅ The internet (duy nhất)',
      '❌ I go to the school every day → ✅ I go to school every day (dùng như địa điểm chức năng)',
      '❌ Governments should invest in the technology → ✅ ...in technology',
    ],
    notes: 'Danh từ uncountable và plural danh từ chung không dùng "a/an": water, information, people, children.',
  },
  {
    id: 'sva1',
    topic: 'Nouns & Agreement',
    category: 'Subject-Verb Agreement',
    band: '4.0-5.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Subject–Verb Agreement',
    explanation: 'Động từ phải chia số (số ít/số nhiều) phù hợp với chủ ngữ. Đây là lỗi cơ bản làm giảm band Grammatical Range & Accuracy. Chủ ngữ số ít → động từ số ít; chủ ngữ số nhiều → động từ số nhiều.',
    structure: 'S (singular) + V-s/es | S (plural) + V (bare infinitive)',
    examples: [
      'The number of people living in poverty has decreased significantly over the past decade.',
      'A range of solutions is available to address this growing problem.',
      'Both governments and individuals need to take responsibility for environmental protection.',
      'The majority of students in developing countries lack access to quality education.',
    ],
    commonErrors: [
      '❌ The number of cars are increasing → ✅ The number of cars is increasing ("the number" = singular)',
      '❌ A number of issues has emerged → ✅ A number of issues have emerged ("a number of" = plural)',
      '❌ Each of the countries have → ✅ Each of the countries has',
      '❌ The data shows → ✅ The data show (data là plural trong học thuật)',
    ],
    notes: '"The number of" + plural noun → singular verb. "A number of" + plural noun → plural verb. "Each/Every" → singular verb.',
  },
  {
    id: 'cun1',
    topic: 'Nouns & Agreement',
    category: 'Countable & Uncountable',
    band: '4.0-5.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Countable & Uncountable Nouns',
    explanation: 'Danh từ đếm được có thể ở số ít hoặc số nhiều; danh từ không đếm được không có dạng số nhiều và không dùng với a/an. Lỗi này xuất hiện rất nhiều trong IELTS và ảnh hưởng trực tiếp đến band Lexical Resource.',
    structure: 'Countable: a/an + N, many/few + N-s | Uncountable: much/little + N (no plural)',
    examples: [
      'There is a great deal of evidence to suggest that poverty is linked to poor health outcomes.',
      'Many researchers have conducted studies on the effects of pollution on biodiversity.',
      'The government has invested significant resources in improving infrastructure.',
      'Access to clean water remains a critical challenge for millions of people in developing nations.',
    ],
    commonErrors: [
      '❌ an information → ✅ a piece of information / some information',
      '❌ many researches → ✅ much research / many research studies',
      '❌ a proof → ✅ evidence / proof (uncountable)',
      '❌ advices → ✅ advice (uncountable)',
      '❌ many equipments → ✅ much equipment / pieces of equipment',
    ],
    notes: 'Common uncountable nouns in IELTS: advice, evidence, information, research, progress, knowledge, work, furniture, equipment, traffic, money, news.',
  },
  {
    id: 'pln1',
    topic: 'Nouns & Agreement',
    category: 'Plural & Singular',
    band: '4.0-5.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Plural & Singular Nouns',
    explanation: 'Cách tạo số nhiều của danh từ và các trường hợp ngoại lệ (irregular plurals). Lỗi số nhiều rất phổ biến trong bài thi IELTS của người Việt.',
    structure: 'Regular: N + -s/-es/-ies | Irregular: child→children, person→people, criterion→criteria',
    examples: [
      'Children who grow up in poverty often face significant disadvantages in later life.',
      'The criteria for evaluating student performance should be transparent and consistent.',
      'Several phenomena have been observed that challenge conventional economic theories.',
      'The media play a significant role in shaping public opinion on key social issues.',
    ],
    commonErrors: [
      '❌ criterias → ✅ criteria',
      '❌ phenomenons → ✅ phenomena',
      '❌ childs → ✅ children',
      '❌ analysis → analyses (plural)',
      '❌ the medias → ✅ the media (already plural)',
    ],
    notes: 'Irregular plurals thường gặp trong IELTS Academic: criterion/criteria, phenomenon/phenomena, datum/data, analysis/analyses, thesis/theses, hypothesis/hypotheses.',
  },
  {
    id: 'prep1',
    topic: 'Prepositions',
    category: 'Basic Prepositions',
    band: '4.0-5.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Basic Prepositions',
    explanation: 'Giới từ chỉ thời gian (at, in, on), nơi chốn (at, in, on), và phương hướng (to, from, into). Dùng sai giới từ là lỗi rất phổ biến, đặc biệt với người Việt.',
    structure: 'Time: at + giờ, on + ngày, in + tháng/năm | Place: at + điểm, in + khu vực, on + bề mặt',
    examples: [
      'In recent years, significant progress has been made in addressing climate change.',
      'The policy was introduced at the beginning of the decade and has had mixed results.',
      'Pollution levels in major cities have risen by 30% over the past five years.',
      'Investment in education is widely regarded as the key to long-term economic growth.',
    ],
    commonErrors: [
      '❌ discuss about → ✅ discuss (no preposition)',
      '❌ benefit from → this is correct; ❌ benefit of → often wrong in context',
      '❌ in the morning of Monday → ✅ on Monday morning',
      '❌ depend of → ✅ depend on',
      '❌ arrive to → ✅ arrive at/in',
    ],
    notes: 'Collocations với prepositions hay gặp trong IELTS: result in, lead to, contribute to, invest in, focus on, depend on, associated with, responsible for.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MỐC 1 — BẮT BUỘC: Band 5.0–5.5 — Sentence Building
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 't3',
    topic: 'Tenses',
    category: 'Present Perfect',
    band: '5.0-5.5',
    priority: 'required',
    status: 'có',
    title: 'Present Perfect',
    explanation: 'Diễn tả hành động đã xảy ra trong quá khứ có liên quan đến hiện tại, kinh nghiệm sống, hoặc thay đổi theo thời gian. Cực kỳ phổ biến trong IELTS để dẫn số liệu và xu hướng.',
    structure: 'S + have/has + V3 | S + have/has + been + V-ing (for duration)',
    examples: [
      'Global temperatures have risen by 1.2°C since pre-industrial times.',
      'Researchers have conducted extensive studies on the long-term effects of social media.',
      'The government has recently introduced stricter environmental regulations to curb emissions.',
      'Living standards have improved significantly over the past three decades in many developing nations.',
    ],
    commonErrors: [
      '❌ I have went → ✅ I have gone',
      '❌ She has went to school → ✅ She has gone / been to school',
      '❌ They have arrived yesterday → ✅ They arrived yesterday (specific time = Past Simple)',
    ],
    notes: 'Trong IELTS Writing Task 1, Present Perfect dùng để mô tả xu hướng tới hiện tại: "has increased", "has declined". Trong Task 2, dùng để nêu bằng chứng: "research has shown that...".',
  },
  {
    id: 't6',
    topic: 'Tenses',
    category: 'Future Forms',
    band: '5.0-5.5',
    priority: 'required',
    status: 'có',
    title: 'Future Forms',
    explanation: 'Diễn tả dự đoán, kế hoạch, và xu hướng tương lai. IELTS Writing Task 2 thường yêu cầu thảo luận về tương lai và giải pháp.',
    structure: 'will + V (dự đoán) | be going to + V (kế hoạch) | will be + V-ing | will have + V3 (Future Perfect)',
    examples: [
      'Global population will reach approximately 10 billion by the year 2050.',
      'Renewable energy is going to replace fossil fuels as the primary energy source within decades.',
      'Automation will have displaced millions of manufacturing workers by 2040 if no action is taken.',
      'If current trends continue, sea levels will rise by up to one metre by the end of the century.',
    ],
    notes: '"will" cho dự đoán/quyết định tức thì; "be going to" cho kế hoạch có sẵn; "will have V3" (Future Perfect) cho IELTS band 7+ để dự đoán việc hoàn thành trong tương lai.',
  },
  {
    id: 'c1',
    topic: 'Conditionals',
    category: 'Zero Conditional',
    band: '5.0-5.5',
    priority: 'required',
    status: 'có',
    title: 'Zero Conditional — Sự thật tổng quát',
    explanation: 'Diễn tả quy luật tự nhiên, sự thật khoa học, và mối quan hệ nhân quả luôn đúng.',
    structure: 'If + S + V (present), S + V (present)',
    examples: [
      'If temperatures rise above a certain threshold, ice caps melt at an accelerating rate.',
      'If people lack access to quality education, poverty tends to persist across generations.',
      'When governments cut public spending, social inequality typically increases.',
    ],
    notes: 'Zero Conditional có thể dùng "when" thay vì "if" vì điều kiện luôn đúng.',
  },
  {
    id: 'c2',
    topic: 'Conditionals',
    category: 'First Conditional',
    band: '5.0-5.5',
    priority: 'required',
    status: 'có',
    title: 'First Conditional — Điều kiện thực tế',
    explanation: 'Diễn tả điều kiện có thể xảy ra trong tương lai và hậu quả tương ứng. Dùng trong IELTS để thảo luận giải pháp và hậu quả.',
    structure: 'If + S + V (present simple), S + will + V',
    examples: [
      'If governments invest substantially in renewable energy, carbon emissions will decrease significantly.',
      'If the current policy is implemented effectively, unemployment rates will fall within five years.',
      'If individuals reduce their meat consumption, the environmental impact of farming will diminish.',
    ],
    commonErrors: [
      '❌ If it will rain, we will cancel → ✅ If it rains, we will cancel',
      '❌ If they will invest → ✅ If they invest',
    ],
  },
  {
    id: 'g1',
    topic: 'Gerunds & Infinitives',
    category: 'Gerunds vs Infinitives',
    band: '5.0-5.5',
    priority: 'required',
    status: 'có',
    title: 'Gerunds & Infinitives',
    explanation: 'Gerund (V-ing) hoạt động như danh từ trong câu. Infinitive (to + V) diễn đạt mục đích hoặc theo sau một số động từ. Dùng đúng hai cấu trúc này thể hiện sự thành thạo ngữ pháp.',
    structure: 'V + -ing (gerund as subject/object) | V + to + V (infinitive after certain verbs)',
    examples: [
      'Investing in renewable energy tends to yield significant long-term economic and environmental benefits.',
      'Many individuals avoid using public transport due to inconvenience and unreliable schedules.',
      'Governments should consider implementing carbon taxes to incentivise businesses to reduce emissions.',
      'It is worth noting that poverty rates have declined substantially in East Asia over recent decades.',
    ],
    notes: 'Gerund sau: avoid, consider, recommend, suggest, involve, risk, enjoy, admit, deny. Infinitive sau: tend, aim, appear, seem, fail, manage, decide, agree, refuse.',
  },
  {
    id: 'comp1',
    topic: 'Sentence Structures',
    category: 'Comparatives & Superlatives',
    band: '5.0-5.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Comparatives & Superlatives',
    explanation: 'Dùng để so sánh dữ liệu, xu hướng, và chính sách trong IELTS Writing Task 1 và Task 2. So sánh hơn (comparative) và so sánh nhất (superlative) là cấu trúc không thể thiếu.',
    structure: 'Adj-er than / more + adj + than | the + adj-est / the most + adj',
    examples: [
      'Renewable energy sources are becoming increasingly more affordable than traditional fossil fuels.',
      'The most effective solution to poverty is to invest in universal education and healthcare.',
      'Urban areas tend to have significantly higher living costs than rural communities.',
      'In 2020, the proportion of internet users was considerably higher in Europe than in Africa.',
    ],
    commonErrors: [
      '❌ more better → ✅ better',
      '❌ more cheaper → ✅ cheaper',
      '❌ the most highest → ✅ the highest',
    ],
    notes: 'Trong IELTS Task 1, dùng so sánh để mô tả chênh lệch: "significantly higher than", "considerably lower than", "twice as much as".',
  },
  {
    id: 'mod1',
    topic: 'Modal Verbs',
    category: 'Ability, Obligation, Advice',
    band: '5.0-5.5',
    priority: 'required',
    status: 'chưa đủ',
    title: 'Modal Verbs — Ability, Obligation & Advice',
    explanation: 'Modal verbs diễn đạt khả năng (can/could), nghĩa vụ (must/have to), và lời khuyên (should/ought to). Dùng đúng modal verbs là nền tảng để học Advanced Hedging ở band cao hơn.',
    structure: 'S + can/could/must/have to/should/ought to + V (bare infinitive)',
    examples: [
      'Governments must take immediate and decisive action to combat rising inequality.',
      'Schools should provide students with practical life skills, not just academic knowledge.',
      'Individuals can make a meaningful contribution to environmental protection through small daily changes.',
      'Employers ought to offer flexible working arrangements to improve work-life balance.',
    ],
    commonErrors: [
      '❌ must to go → ✅ must go',
      '❌ can able to → ✅ can / is able to',
      '❌ should to study → ✅ should study',
    ],
    notes: 'Phân biệt: must (internal obligation/certainty) vs have to (external obligation); should (advice) vs must (strong obligation).',
  },
  {
    id: 'conj1',
    topic: 'Sentence Structures',
    category: 'Conjunctions',
    band: '5.0-5.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Conjunctions — and / but / so / because',
    explanation: 'Liên từ kết hợp các mệnh đề để tạo câu phức tạp hơn. Dùng đúng liên từ giúp bài viết mạch lạc (coherence) và gắn kết (cohesion) — hai tiêu chí quan trọng trong IELTS.',
    structure: 'Coordinating: and, but, so, or, yet, for, nor | Subordinating: because, although, while, since, unless',
    examples: [
      'Education is important, but it alone cannot solve the problem of structural unemployment.',
      'Poverty rates have fallen significantly, yet access to quality healthcare remains unequal.',
      'Governments should invest in public transport, as this would reduce traffic congestion and pollution.',
      'Many young people struggle to find employment because the education system fails to provide relevant skills.',
    ],
    commonErrors: [
      '❌ Although... but... → ✅ Although... (no "but") OR ...but... (no "although")',
      '❌ Because... so... → ✅ Because... (no "so") OR ...so... (no "because")',
      '❌ Despite but → ✅ Despite / However (separate sentences)',
    ],
    notes: 'Lỗi kép rất phổ biến: dùng cả "although" và "but" trong cùng câu, hoặc "because" và "so". Chỉ dùng một cái.',
  },
  {
    id: 'there1',
    topic: 'Sentence Structures',
    category: 'There is / There are',
    band: '5.0-5.5',
    priority: 'required',
    status: 'thiếu',
    title: 'There is / There are / There has been',
    explanation: 'Cấu trúc "there is/are" dùng để giới thiệu sự tồn tại của vật/người. "There has been" dùng để diễn đạt sự thay đổi hoặc xuất hiện gần đây. Hay dùng trong IELTS để mở đầu thảo luận.',
    structure: 'There is + singular N | There are + plural N | There has/have been + N',
    examples: [
      'There is a growing body of evidence suggesting that social media affects mental health negatively.',
      'There are numerous factors that contribute to the widening gap between rich and poor nations.',
      'There has been a significant increase in the number of people working remotely since 2020.',
      'There have been several attempts to reform the education system, with mixed results.',
    ],
    commonErrors: [
      '❌ There is many reasons → ✅ There are many reasons',
      '❌ There are a strong argument → ✅ There is a strong argument',
      '❌ There has a problem → ✅ There is a problem',
    ],
    notes: 'Chia số theo danh từ theo ngay sau "there is/are", không phải danh từ xa hơn trong câu.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MỐC 1 — BẮT BUỘC: Band 5.5–6.0 — Core IELTS Grammar
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'p1',
    topic: 'Passive Voice',
    category: 'Simple Passive',
    band: '5.5-6.0',
    priority: 'required',
    status: 'có',
    title: 'Passive Voice — Cơ bản',
    explanation: 'Dùng khi tân ngữ quan trọng hơn chủ thể, hoặc không biết/không cần đề cập chủ thể. Rất phổ biến trong IELTS Academic Writing vì mang tính khách quan.',
    structure: 'S + am/is/are/was/were + V3 (+ by + agent)',
    examples: [
      'Carbon emissions have been reduced by approximately 20% over the past decade.',
      'New regulations are being implemented across the country to address rising pollution levels.',
      'The policy was heavily criticised by both economists and environmental experts.',
      'It is widely believed that education is the most effective tool for combating poverty.',
    ],
    commonErrors: [
      '❌ The problem is solve → ✅ The problem is solved',
      '❌ It was wrote in 2020 → ✅ It was written in 2020',
      '❌ The report has been publishing → ✅ The report has been published',
    ],
    notes: 'Passive impersonal structures ("It is argued that...", "It has been found that...") là đặc trưng của IELTS Academic và giúp tăng tính khách quan.',
  },
  {
    id: 'r1',
    topic: 'Relative Clauses',
    category: 'Defining',
    band: '5.5-6.0',
    priority: 'required',
    status: 'có',
    title: 'Defining Relative Clauses',
    explanation: 'Xác định danh từ đang nhắc đến, không có dấu phẩy. Thiếu thông tin này, câu sẽ không rõ nghĩa. Dùng "that" hoặc "which" cho vật; "who" cho người.',
    structure: 'N + who/which/that/where/whose + clause',
    examples: [
      'Countries that invest heavily in education tend to have stronger and more resilient economies.',
      'The policy which was introduced last year has already shown measurable positive effects.',
      'People who lack access to quality healthcare face significant and lasting disadvantages.',
      'Communities where public transport is well-developed tend to have lower carbon footprints.',
    ],
    commonErrors: [
      '❌ The student which passed → ✅ The student who passed (people → who)',
      '❌ The book who I read → ✅ The book that/which I read (things → that/which)',
    ],
  },
  {
    id: 's1',
    topic: 'Sentence Structures',
    category: 'Subordinate Clauses',
    band: '5.5-6.0',
    priority: 'required',
    status: 'có',
    title: 'Subordinate Clauses — Mệnh đề phụ',
    explanation: 'Câu phức với mệnh đề phụ thể hiện quan hệ nhân quả, tương phản, điều kiện. Đây là nền tảng của Grammatical Range & Accuracy trong IELTS.',
    structure: 'although/while/whereas/since/because/as/given that/provided that + clause',
    examples: [
      'Although technology has created new employment opportunities, it has also displaced many traditional occupations.',
      'While urbanisation brings undeniable economic benefits, it also creates significant environmental challenges.',
      'Since the industrial revolution, greenhouse gas emissions have increased at an unprecedented rate.',
      'Given that natural resources are finite, transitioning to a circular economy is not merely desirable but essential.',
    ],
    commonErrors: [
      '❌ Although... but → ✅ Although... (remove "but")',
      '❌ Because... so → ✅ Because... (remove "so")',
    ],
  },
  {
    id: 'm1',
    topic: 'Modal Verbs',
    category: 'Certainty & Probability',
    band: '5.5-6.0',
    priority: 'required',
    status: 'có',
    title: 'Modals — Certainty & Probability',
    explanation: 'Dùng modal verbs để diễn đạt mức độ chắc chắn khi đưa ra lập luận. Dùng đúng modal verb thể hiện sự tinh tế trong lập luận học thuật.',
    structure: 'S + must/should/may/might/could/can + V',
    examples: [
      'Governments must take immediate and coordinated action to combat the effects of climate change.',
      'Increased investment in early childhood education may lead to significant long-term economic gains.',
      'This approach could prove counterproductive if implemented without adequate planning and resources.',
      'Technology should be regarded as a tool to enhance human capability, not replace human judgment.',
    ],
    notes: 'Thang độ chắc chắn: must/will (certainty) > should (expectation) > may (possibility) > might/could (remote possibility). Dùng đúng modal giúp tăng band Lexical Resource và GRAC.',
  },
  {
    id: 'cau1',
    topic: 'Sentence Structures',
    category: 'Cause & Effect',
    band: '5.5-6.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Cause & Effect Structures',
    explanation: 'Cấu trúc nhân quả là một trong những kết nối quan trọng nhất trong IELTS Writing Task 2. Bày tỏ nguyên nhân và hậu quả một cách rõ ràng giúp tăng Coherence & Cohesion.',
    structure: 'result in / lead to / cause / due to / as a result of / consequently / therefore',
    examples: [
      'Rapid industrialisation has led to a dramatic increase in greenhouse gas emissions worldwide.',
      'As a result of inadequate investment in public transport, traffic congestion has worsened significantly.',
      'Poverty often results in limited access to education, which perpetuates a cycle of disadvantage.',
      'Due to the ageing population, many developed nations are facing severe pension funding challenges.',
    ],
    commonErrors: [
      '❌ Due to the pollution increased → ✅ Due to the increase in pollution',
      '❌ Because of it caused → ✅ Because of this / This caused',
      '❌ Result in to → ✅ result in (no "to")',
    ],
    notes: 'Phân biệt: "due to" + noun phrase; "because" + clause; "result in" + noun/gerund; "consequently/therefore" đứng đầu câu với dấu phẩy sau.',
  },
  {
    id: 'purp1',
    topic: 'Sentence Structures',
    category: 'Purpose Structures',
    band: '5.5-6.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Purpose Structures',
    explanation: 'Cấu trúc diễn đạt mục đích cho biết lý do hoặc ý định của một hành động. Rất cần thiết trong IELTS khi thảo luận về giải pháp và chính sách.',
    structure: 'in order to + V | so as to + V | so that + clause | with the aim of + V-ing',
    examples: [
      'Governments should invest in public transport in order to reduce traffic congestion and air pollution.',
      'Many people choose to live in cities so as to access better employment opportunities.',
      'Carbon taxes have been introduced so that businesses are incentivised to reduce their emissions.',
      'Educational reforms were implemented with the aim of improving student outcomes and reducing inequality.',
    ],
    commonErrors: [
      '❌ in order to reducing → ✅ in order to reduce',
      '❌ so that reduce → ✅ so that they can reduce',
      '❌ for to study → ✅ in order to study / to study',
    ],
    notes: '"In order to" và "so as to" dùng với bare infinitive. "So that" + subject + modal/verb. Dùng "with the aim of" + gerund cho văn phong học thuật cao hơn.',
  },
  {
    id: 'cont1',
    topic: 'Sentence Structures',
    category: 'Contrast Structures',
    band: '5.5-6.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Contrast Structures',
    explanation: 'Cấu trúc đối chiếu dùng để thảo luận hai mặt của vấn đề — cực kỳ phổ biến trong IELTS Task 2 dạng Discuss Both Views, Advantages & Disadvantages.',
    structure: 'although / while / whereas / however / on the other hand / in contrast / despite + noun/gerund',
    examples: [
      'Although globalisation has created significant economic opportunities, it has also exacerbated inequality within nations.',
      'While cities offer better employment prospects, rural areas tend to provide a higher quality of life.',
      'In contrast to developed nations, many developing countries lack the infrastructure needed for renewable energy.',
      'Despite the clear economic benefits of tourism, the environmental costs should not be underestimated.',
    ],
    commonErrors: [
      '❌ Despite the fact of → ✅ Despite the fact that',
      '❌ However, but → ✅ However (one at a time)',
      '❌ While on the other hand → ✅ While / On the other hand (not both)',
    ],
    notes: 'Đừng trộn lẫn: "Although/While" ở đầu câu phức; "However/On the other hand/In contrast" ở đầu câu mới với dấu chấm.',
  },
  {
    id: 'compstr1',
    topic: 'Sentence Structures',
    category: 'Comparative Structures',
    band: '5.5-6.0',
    priority: 'required',
    status: 'thiếu',
    title: 'Comparative Structures (Academic)',
    explanation: 'So sánh học thuật dùng để phân tích dữ liệu và xu hướng trong IELTS. Vượt ra ngoài comparative/superlative đơn giản để sử dụng các cấu trúc phức tạp hơn.',
    structure: 'as + adj + as | twice/three times as much/many as | compared to/with | relative to',
    examples: [
      'The carbon footprint of air travel is approximately three times as large as that of rail travel.',
      'Compared to developed nations, developing countries contribute far less to global carbon emissions per capita.',
      'Urban areas consume significantly more energy relative to their population size than rural communities.',
      'The economic benefits of the policy are arguably far greater than the initial implementation costs.',
    ],
    notes: 'Trong Task 1, dùng: "significantly higher than", "nearly double", "roughly equivalent to", "in contrast to", "while X increased, Y declined".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MỐC 1 — BẮT BUỘC: Band 6.0–6.5 — Band 7 Core
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'c3',
    topic: 'Conditionals',
    category: 'Second Conditional',
    band: '6.0-6.5',
    priority: 'required',
    status: 'có',
    title: 'Second Conditional — Điều kiện giả định',
    explanation: 'Diễn tả tình huống giả định hoặc không có thật ở hiện tại/tương lai. Dùng trong IELTS để thảo luận về khả năng thay đổi chính sách và hậu quả giả định.',
    structure: 'If + S + V (past simple), S + would/could/might + V',
    examples: [
      'If every nation committed to reducing emissions by 50%, global warming would slow considerably.',
      'If education were free and universally accessible, social mobility would improve dramatically.',
      'If governments invested more in mental health services, overall productivity would likely increase.',
      'Were governments to prioritise renewable energy, the transition to a low-carbon economy would accelerate.',
    ],
    notes: 'Dạng đảo ngữ "Were + S + to V" thay cho "If + S + were to V" được dùng trong IELTS Writing để nâng band. Ví dụ: "Were this policy implemented..." = "If this policy were implemented...".',
  },
  {
    id: 'r2',
    topic: 'Relative Clauses',
    category: 'Non-defining',
    band: '6.0-6.5',
    priority: 'required',
    status: 'có',
    title: 'Non-defining Relative Clauses',
    explanation: 'Cung cấp thêm thông tin về danh từ đã được xác định rõ ràng. Có dấu phẩy hai bên. Không dùng "that". Thể hiện khả năng viết câu phức tạp và phong phú.',
    structure: 'N, + who/which/where/whose + clause, + rest of sentence',
    examples: [
      'Finland, which consistently ranks among the top nations in education, serves as a global model.',
      'The Industrial Revolution, which began in Britain in the late 18th century, transformed global society.',
      'Renewable energy, which is becoming increasingly affordable, offers a truly viable alternative to fossil fuels.',
      'The WHO, whose recommendations carry significant international weight, has urged governments to act urgently.',
    ],
    notes: 'Non-defining relative clauses thể hiện khả năng nhúng thông tin bổ sung — đây là cấu trúc điểm cao trong IELTS Writing band 7+. Luôn dùng dấu phẩy.',
  },
  {
    id: 'n1',
    topic: 'Reporting & Hedging',
    category: 'Reporting Verbs',
    band: '6.0-6.5',
    priority: 'required',
    status: 'có',
    title: 'Reporting Verbs & Hedging Language',
    explanation: 'Ngôn ngữ học thuật thường dùng hedging (diễn đạt không chắc chắn hoàn toàn) và reporting verbs để trình bày ý kiến khách quan và chuyên nghiệp.',
    structure: 'It is argued/suggested/claimed that... | Researchers contend/maintain/propose that...',
    examples: [
      'It is widely acknowledged that education is the cornerstone of sustainable development.',
      'Some experts argue that economic growth inevitably leads to environmental degradation.',
      'Research suggests that regular physical exercise significantly reduces the risk of chronic disease.',
      'It could be contended that the long-term benefits of globalisation outweigh its immediate drawbacks.',
    ],
    notes: 'Hedging verbs (mức độ tăng dần): suggest < argue < contend < claim < assert. Dùng passive impersonal (It is argued that) để tăng tính học thuật và tránh dùng "I think".',
  },
  {
    id: 'rrc1',
    topic: 'Relative Clauses',
    category: 'Reduced Relative Clauses',
    band: '6.0-6.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Reduced Relative Clauses',
    explanation: 'Rút gọn mệnh đề quan hệ bằng cách bỏ đại từ quan hệ và trợ động từ "to be". Giúp câu ngắn gọn và súc tích hơn — đặc trưng của văn phong học thuật.',
    structure: 'N + [who/which is/are] V-ing/V3 → N + V-ing/V3',
    examples: [
      'Countries lacking adequate healthcare infrastructure face disproportionately high mortality rates.',
      'Policies designed to reduce inequality often encounter significant political opposition.',
      'Students attending underfunded schools are at a considerable disadvantage in the job market.',
      'The data collected over the past decade clearly indicate a worrying upward trend in global temperatures.',
    ],
    commonErrors: [
      '❌ Countries which they are lacking → ✅ Countries lacking',
      '❌ The report that it was published → ✅ The report published / The report that was published',
    ],
    notes: 'Active reduced: N + V-ing (Countries producing emissions). Passive reduced: N + V3 (Policies implemented by governments). Đây là đặc trưng của văn Academic.',
  },
  {
    id: 'nc1',
    topic: 'Sentence Structures',
    category: 'Noun Clauses',
    band: '6.0-6.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Noun Clauses',
    explanation: 'Mệnh đề danh ngữ đóng vai trò như một danh từ trong câu (chủ ngữ, tân ngữ, bổ ngữ). Giúp câu trở nên phức tạp và học thuật hơn.',
    structure: 'that + clause | what/whether/how/why/who + clause',
    examples: [
      'What is particularly alarming is the rate at which biodiversity is being lost.',
      'Research has demonstrated that early childhood education yields the highest long-term returns.',
      'The question of whether economic growth can coexist with environmental sustainability remains contested.',
      'How governments respond to technological unemployment will define the social contract of the 21st century.',
    ],
    notes: '"What is notable/surprising/concerning is that..." là cấu trúc hay dùng để nhấn mạnh trong IELTS Writing Task 2.',
  },
  {
    id: 'cnp1',
    topic: 'Sentence Structures',
    category: 'Complex Noun Phrases',
    band: '6.0-6.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Complex Noun Phrases',
    explanation: 'Cụm danh từ phức tạp gồm danh từ chính được bổ nghĩa bởi tính từ, giới từ, mệnh đề. Rất hay dùng trong văn học thuật IELTS để nén nhiều thông tin vào một cụm từ.',
    structure: '[modifier(s)] + noun + [prepositional phrase / relative clause / participle]',
    examples: [
      'The growing concern over the long-term effects of social media on adolescent mental health is well-documented.',
      'A comprehensive government-funded initiative targeting early childhood development could yield significant benefits.',
      'The lack of affordable housing in major urban centres is a pressing social issue requiring urgent attention.',
      'An evidence-based approach to policy-making is essential for addressing complex societal challenges effectively.',
    ],
    notes: 'Nominalisation (turning verbs into nouns) creates complex noun phrases: "increase" (noun) instead of "increased", "development" instead of "develop". This is a hallmark of academic English.',
  },
  {
    id: 'ps1',
    topic: 'Sentence Structures',
    category: 'Parallel Structures',
    band: '6.0-6.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Parallel Structures',
    explanation: 'Các yếu tố được liệt kê trong câu phải có hình thức ngữ pháp tương đương (cùng là danh từ, cùng là V-ing, v.v.). Parallel structure tạo ra sự cân bằng và rõ ràng trong văn viết.',
    structure: 'X, Y, and Z (same grammatical form) | both X and Y | not only X but also Y',
    examples: [
      'Sustainable development requires reducing waste, conserving energy, and protecting natural habitats.',
      'Education benefits individuals not only by enhancing their career prospects but also by broadening their worldview.',
      'The policy aims to create jobs, reduce poverty, and improve living standards across all demographics.',
      'Both economic growth and environmental protection are achievable goals, provided the right policies are in place.',
    ],
    commonErrors: [
      '❌ She likes reading, to swim, and runs → ✅ She likes reading, swimming, and running',
      '❌ Not only is it cheap but also convenient → ✅ Not only is it cheap but it is also convenient',
    ],
    notes: 'Parallel structure is especially important in IELTS with "both...and", "not only...but also", "either...or", "neither...nor".',
  },
  {
    id: 'rt1',
    topic: 'Sentence Structures',
    category: 'Rather than / Instead of',
    band: '6.0-6.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Rather than / Instead of',
    explanation: 'Dùng để so sánh hai hành động, lựa chọn, hoặc ưu tiên. Rất hay dùng trong IELTS khi đề xuất giải pháp hoặc phê phán cách tiếp cận hiện tại.',
    structure: 'Rather than + V-ing/V, S + V | Instead of + V-ing, S + V | S + V rather than + V',
    examples: [
      'Rather than relying solely on economic incentives, governments should adopt a more holistic approach.',
      'Instead of focusing exclusively on GDP growth, policymakers should consider broader measures of well-being.',
      'Societies benefit more from investing in preventative healthcare rather than treating illness after the fact.',
      'Rather than punishing individuals for poor choices, society should address the structural causes of inequality.',
    ],
    notes: 'Sau "rather than" và "instead of" thường dùng V-ing khi là tân ngữ. "Rather than + bare infinitive" khi ở cuối câu để so sánh song song.',
  },
  {
    id: 'cc1',
    topic: 'Sentence Structures',
    category: 'Correlative Conjunctions',
    band: '6.0-6.5',
    priority: 'required',
    status: 'thiếu',
    title: 'Correlative Conjunctions',
    explanation: 'Cặp liên từ tương quan dùng để liên kết hai ý đối xứng. Thể hiện sự tinh tế và balance trong lập luận — đặc trưng của band 6.5+.',
    structure: 'both...and | not only...but also | either...or | neither...nor | whether...or',
    examples: [
      'Both economic development and environmental protection are achievable, provided policies are wisely designed.',
      'Not only does inequality undermine social cohesion, but it also stifles economic productivity.',
      'Governments must address either the supply side or the demand side of the housing crisis — ideally both.',
      'Neither economic growth alone nor environmental regulation in isolation can solve the climate crisis effectively.',
    ],
    notes: 'Lưu ý parallel structure sau correlative conjunctions: both + noun + and + noun; not only + clause + but also + clause.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MỐC 2 — NÂNG BAND: Band 6.5–7.0
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'p2',
    topic: 'Passive Voice',
    category: 'Perfect Passive',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'có',
    title: 'Perfect Passive',
    explanation: 'Kết hợp Present/Past Perfect với Passive Voice để diễn đạt kết quả đã xảy ra. Tạo ra văn phong học thuật cao và chuyên nghiệp.',
    structure: 'S + have/has/had + been + V3',
    examples: [
      'Significant progress has been made in the field of renewable energy over the past decade.',
      'Millions of jobs had been lost before adequate economic recovery measures were introduced.',
      'The issue of income inequality has long been debated by policymakers, academics, and activists worldwide.',
      'By 2030, it is hoped that a vaccine for malaria will have been developed and widely distributed.',
    ],
  },
  {
    id: 's2',
    topic: 'Sentence Structures',
    category: 'Participle Clauses',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'có',
    title: 'Participle Clauses — Mệnh đề phân từ',
    explanation: 'Rút gọn mệnh đề phụ bằng V-ing (present participle) hoặc V3 (past participle) để viết ngắn gọn, súc tích, và học thuật hơn. Đây là cấu trúc điểm cao trong IELTS.',
    structure: 'V-ing / V3 + ..., S + V... | S + ..., V-ing/V3 clause',
    examples: [
      'Facing increasing economic pressures, many governments have been forced to cut social welfare spending.',
      'Driven by rapid technological innovation, productivity has soared in many sectors over recent decades.',
      'Having identified the root causes of poverty, researchers proposed a comprehensive range of solutions.',
      'Lacking adequate financial resources, developing nations continue to struggle with implementing clean energy policies.',
    ],
    notes: 'Participle clauses rút gọn "Because/When/After/Having + S + V" — điều kiện: subject của hai mệnh đề phải giống nhau.',
  },
  {
    id: 'ah1',
    topic: 'Reporting & Hedging',
    category: 'Advanced Hedging',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Hedging Language',
    explanation: 'Hedging nâng cao sử dụng cấu trúc phức tạp hơn để diễn đạt sự không chắc chắn, khả năng, và giới hạn của lập luận. Đây là một trong những đặc trưng quan trọng nhất của văn học thuật band 7+.',
    structure: 'It would appear that... | There is a tendency for... | To some extent... | It is tempting to... | One might argue that...',
    examples: [
      'It would appear that the relationship between economic growth and happiness is far more complex than previously assumed.',
      'There is a tendency for governments to prioritise short-term economic gains over long-term environmental sustainability.',
      'To some extent, the widening inequality can be attributed to the rapid advance of automation and artificial intelligence.',
      'One might argue that the true cost of fossil fuels has never been fully reflected in market prices.',
    ],
    notes: 'Advanced hedging signals: "It would appear", "there is some evidence to suggest", "arguably", "to a considerable degree", "it is by no means certain that". Dùng hedging để tránh overgeneralisation.',
  },
  {
    id: 'conc1',
    topic: 'Sentence Structures',
    category: 'Concession Structures',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Concession Structures',
    explanation: 'Cấu trúc nhượng bộ thừa nhận một quan điểm đối lập trước khi đưa ra lập luận của mình. Đây là đặc trưng của văn nghị luận học thuật và giúp tăng tính thuyết phục.',
    structure: 'Admittedly, ... However, ... | While it is true that..., ... | Granted, ... Nevertheless, ... | Even if..., ...',
    examples: [
      'Admittedly, economic growth creates employment and reduces poverty. However, it must not come at the expense of environmental sustainability.',
      'While it is true that technology can displace workers, it simultaneously creates new industries and career pathways.',
      'Granted, implementing stricter environmental regulations may increase costs for businesses in the short term. Nevertheless, the long-term benefits far outweigh these initial expenses.',
      'Even if one accepts the argument that free trade benefits the economy overall, its uneven distribution of gains cannot be ignored.',
    ],
    notes: 'Cấu trúc "Admittedly/Granted + point, ...However/Nevertheless + counter-argument" là công thức vàng cho IELTS Task 2 band 7+.',
  },
  {
    id: 'nom1',
    topic: 'Sentence Structures',
    category: 'Nominalisation',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Nominalisation',
    explanation: 'Chuyển đổi động từ hoặc tính từ thành danh từ để tạo ra văn phong học thuật, trang trọng hơn. Nominalisation là một trong những đặc trưng nổi bật nhất của IELTS Academic band 7+.',
    structure: 'Verb → Noun: develop → development | Adj → Noun: important → importance | V → N: fail → failure',
    examples: [
      'The rapid development of artificial intelligence has raised profound ethical questions about employment and privacy.',
      'An understanding of the importance of cultural sensitivity is essential for effective international diplomacy.',
      'The implementation of stricter regulations has led to a significant reduction in industrial pollution.',
      'The government\'s failure to address affordable housing has contributed to rising levels of social inequality.',
    ],
    notes: 'Nominalisation patterns: -tion (implementation, reduction), -ment (development, improvement), -ance/-ence (importance, evidence), -ity (equality, complexity), -ness (awareness, effectiveness).',
  },
  {
    id: 'cleft1',
    topic: 'Sentence Structures',
    category: 'Cleft Sentences',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Cleft Sentences',
    explanation: 'Câu chẻ (It-cleft và Wh-cleft) dùng để nhấn mạnh một yếu tố cụ thể trong câu. Rất hay dùng trong IELTS để làm nổi bật lập luận chính.',
    structure: 'It is/was + [focus] + that/who + rest | What + clause + is/was + [focus]',
    examples: [
      'It is the lack of political will, rather than financial constraints, that prevents meaningful climate action.',
      'It was only after decades of scientific evidence that governments finally began to take climate change seriously.',
      'What makes this policy particularly effective is its ability to address both economic and environmental concerns simultaneously.',
      'What the data clearly demonstrate is that inequality has widened significantly over the past three decades.',
    ],
    notes: '"It is...that" clefts emphasise the subject or circumstances. "What...is/are" (pseudo-cleft) emphasises the predicate. Both signal sophistication in IELTS Writing.',
  },
  {
    id: 'emp1',
    topic: 'Sentence Structures',
    category: 'Emphasis Structures',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Emphasis Structures',
    explanation: 'Các cấu trúc nhấn mạnh ý kiến hoặc sự thật một cách mạnh mẽ và có tổ chức trong IELTS Academic Writing. Giúp tránh viết câu bằng phẳng thiếu sức thuyết phục.',
    structure: 'Indeed, ... | In fact, ... | It is worth noting that... | What is particularly striking is... | Above all,...',
    examples: [
      'Indeed, the evidence overwhelmingly supports the view that early intervention is far more cost-effective than remediation.',
      'What is particularly striking is the speed at which public opinion on climate change has shifted in recent years.',
      'It is worth emphasising that sustainable economic development and environmental protection are not mutually exclusive goals.',
      'Above all, what distinguishes truly progressive societies is their commitment to social equality and opportunity for all.',
    ],
    notes: '"It is worth + V-ing" and "What is particularly + adj + is that" are high-scoring emphasis structures frequently rewarded in IELTS band 7+ writing.',
  },
  {
    id: 'acnp1',
    topic: 'Sentence Structures',
    category: 'Advanced Complex Noun Phrases',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Complex Noun Phrases',
    explanation: 'Cụm danh từ phức tạp nhiều lớp với pre-modifier và post-modifier. Đây là cấu trúc điểm cao nhất trong IELTS Academic — thể hiện khả năng tổ chức thông tin tinh tế.',
    structure: '[adj/participle/noun] + noun + [of + NP] + [relative/participle clause]',
    examples: [
      'The unprecedented rate of technological change driven by artificial intelligence poses significant challenges for labour markets.',
      'A growing body of empirical evidence drawn from longitudinal studies supports the link between poverty and ill-health.',
      'The complex interplay of economic, social, and environmental factors underlying global inequality demands a nuanced policy response.',
      'The government\'s recently announced multi-billion-dollar investment package aimed at accelerating the green energy transition has been broadly welcomed.',
    ],
    notes: 'Build up complexity: "evidence" → "empirical evidence" → "a growing body of empirical evidence" → "a growing body of empirical evidence drawn from rigorous longitudinal studies".',
  },
  {
    id: 'ace1',
    topic: 'Sentence Structures',
    category: 'Advanced Cause-Effect',
    band: '6.5-7.0',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Cause–Effect Structures',
    explanation: 'Cấu trúc nhân quả nâng cao dùng trong văn học thuật để phân tích mối quan hệ phức tạp giữa các hiện tượng. Vượt qua "because/so" đơn giản.',
    structure: 'stem from | be attributed to | give rise to | be instrumental in | play a pivotal role in | have a profound impact on',
    examples: [
      'Rising inequality can largely be attributed to the globalisation of labour markets and the automation of routine tasks.',
      'The rapid urbanisation of the past century has given rise to a host of social and environmental challenges.',
      'Access to quality education has been instrumental in driving economic development in East Asian economies.',
      'The decline of manufacturing industries has had a profound and lasting impact on working-class communities.',
    ],
    notes: 'Academic cause-effect verbs: stem from, originate from, be rooted in (causes); give rise to, engender, precipitate, exacerbate (effects). Avoid "because of" in formal writing when possible.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MỐC 2 — NÂNG BAND: Band 7.0–7.5 — Advanced
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'ext1',
    topic: 'Advanced Structures',
    category: 'The extent to which',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'The extent to which...',
    explanation: 'Cấu trúc "the extent to which" dùng để thảo luận mức độ hoặc phạm vi mà một điều gì đó đúng hay xảy ra. Đây là một trong những cấu trúc đặc trưng nhất của IELTS band 7+.',
    structure: 'The extent to which + S + V + is + debatable/unclear/dependent on... | To what extent... | The degree to which...',
    examples: [
      'The extent to which technology is responsible for rising unemployment remains a matter of considerable debate.',
      'Whether globalisation has been a net positive force is determined largely by the extent to which its benefits have been equitably distributed.',
      'The degree to which governments should intervene in the economy is one of the most contested questions in modern political thought.',
      'The question of to what extent individual behaviour, rather than systemic factors, drives inequality is central to this debate.',
    ],
    notes: '"The extent to which" as a noun phrase is a sophisticated academic structure that signals critical thinking and nuanced analysis — key qualities for IELTS band 7+.',
  },
  {
    id: 'acomp1',
    topic: 'Advanced Structures',
    category: 'Advanced Comparative',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Comparative Structures',
    explanation: 'Cấu trúc so sánh nâng cao bao gồm "the more...the more", proportional comparatives, và các cụm so sánh phức tạp thường gặp trong IELTS band 7.5+.',
    structure: 'The more + S + V, the more + S + V | X is proportional to Y | far/considerably/substantially + comparative',
    examples: [
      'The more a society invests in education and healthcare, the more resilient and productive its economy becomes.',
      'The greater the investment in renewable energy infrastructure, the faster the transition away from fossil fuels.',
      'Economic inequality is far more pronounced in countries with weak institutions and inadequate social safety nets.',
      'The benefits of globalisation have been substantially less equitably distributed than its early proponents predicted.',
    ],
    notes: '"The more...the more" is a classic IELTS band 7 structure that demonstrates grammatical sophistication and logical argumentation simultaneously.',
  },
  {
    id: 'apc1',
    topic: 'Advanced Structures',
    category: 'Advanced Participial Clauses',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Participial Clauses',
    explanation: 'Mệnh đề phân từ nâng cao bao gồm "having been + V3" (passive perfect participle) và các cấu trúc phức tạp hơn thể hiện trình tự thời gian và quan hệ nhân quả.',
    structure: 'Having + V3 (active perfect) | Having been + V3 (passive perfect) | Being + V3 (passive present)',
    examples: [
      'Having been designed without sufficient environmental oversight, the dam caused irreparable ecological damage.',
      'Having failed to address the root causes of poverty, policymakers were forced to implement emergency measures.',
      'Being situated at the intersection of several major trade routes, the city developed into a prosperous commercial hub.',
      'Having exhausted all diplomatic options, the international community reluctantly considered punitive measures.',
    ],
    notes: '"Having been + V3" (passive perfect participle) is a relatively rare but high-scoring structure in IELTS that demonstrates command of complex temporal and passive relationships.',
  },
  {
    id: 'ams1',
    topic: 'Advanced Structures',
    category: 'Advanced Modal Structures',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Modal Structures',
    explanation: 'Modal structures nâng cao bao gồm modal perfects (should have, could have, might have) để thảo luận về quá khứ và cấu trúc modal passive phức tạp.',
    structure: 'modal + have + V3 | modal + be + V3 (passive) | modal + have + been + V-ing',
    examples: [
      'Governments should have taken decisive action on climate change decades ago, before the damage became irreversible.',
      'The economic crisis could have been averted had regulators imposed stricter controls on financial institutions.',
      'It might be argued that the prioritisation of economic growth over social welfare has been fundamentally misguided.',
      'The policy ought to have been more carefully considered before its rushed implementation.',
    ],
    notes: 'Modal perfect structures ("should have V3", "could have V3") are powerful tools for critical analysis of past decisions in IELTS Task 2 — they signal sophisticated evaluative thinking.',
  },
  {
    id: 'accs1',
    topic: 'Advanced Structures',
    category: 'Complex Concession',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Complex Concession Structures',
    explanation: 'Cấu trúc nhượng bộ phức tạp vượt ra ngoài "although/however" thông thường. Thể hiện khả năng tư duy phản biện và lập luận tinh tế.',
    structure: 'regardless of whether | irrespective of | much as | be that as it may | notwithstanding',
    examples: [
      'Regardless of whether one supports or opposes free trade, the need for a robust social safety net is undeniable.',
      'Irrespective of political persuasion, most economists agree that investment in infrastructure drives long-term growth.',
      'Much as one might sympathise with the argument for protectionism, the evidence suggests it ultimately harms consumers.',
      'The policy has its merits; be that as it may, its implementation costs are simply too high to justify its adoption.',
    ],
    notes: '"Regardless of whether", "irrespective of", "much as", and "notwithstanding" are high-level concession markers that distinguish IELTS band 7.5 writing.',
  },
  {
    id: 'ars1',
    topic: 'Relative Clauses',
    category: 'Advanced Relative',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Relative Structures',
    explanation: 'Mệnh đề quan hệ nâng cao bao gồm preposition + which, whereby, wherein, the former/latter. Đây là đặc trưng của văn học thuật rất cao cấp.',
    structure: 'Prep + which | by/through/from which | in/on which | whereby | wherein',
    examples: [
      'A circular economy is a system in which waste is minimised and resources are continuously reused and recycled.',
      'The UN established a framework through which nations can coordinate their responses to the climate crisis.',
      'A meritocracy is a society whereby individuals are rewarded based on their abilities and achievements, not their background.',
      'The report identified several key mechanisms by which technology could accelerate sustainable development.',
    ],
    notes: '"Whereby" = "by/through which"; "Wherein" = "in which". These are formal academic alternatives that signal a high level of written proficiency.',
  },
  {
    id: 'anc1',
    topic: 'Advanced Structures',
    category: 'Advanced Noun Clauses',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Noun Clauses',
    explanation: 'Mệnh đề danh ngữ nâng cao trong các cấu trúc phức tạp như "the fact that", "the notion that", "the argument that" — đặc trưng của văn học thuật cao cấp.',
    structure: 'the fact/notion/argument/claim/assumption + that + clause',
    examples: [
      'The notion that economic growth is inherently incompatible with environmental protection has been largely discredited.',
      'The fact that millions of children still lack access to basic education is a profound indictment of global priorities.',
      'The assumption that technology will automatically solve societal problems is naive and potentially dangerous.',
      'The claim that inequality is a necessary by-product of free-market capitalism deserves serious critical scrutiny.',
    ],
    notes: '"The fact/notion/argument/claim that" + clause creates sophisticated nominal structures that add analytical depth to IELTS writing.',
  },
  {
    id: 'aps1',
    topic: 'Advanced Structures',
    category: 'Advanced Parallel Structures',
    band: '7.0-7.5',
    priority: 'band-booster',
    status: 'thiếu',
    title: 'Advanced Parallel Structures',
    explanation: 'Parallel structure nâng cao dùng trong câu phức tạp nhiều tầng để tạo ra nhịp điệu và sức thuyết phục trong lập luận học thuật.',
    structure: 'X, Y, and Z (multi-element) | the + adj-er + N, the + adj-er + N | A is to B what C is to D',
    examples: [
      'A truly effective education system must be accessible, equitable, and responsive to the needs of a rapidly changing economy.',
      'The more transparent governments are, the more accountable their institutions become, and the more trusting their citizens grow.',
      'Investing in preventative healthcare is to public health what maintaining infrastructure is to economic productivity.',
      'Sustainable development requires not just policy innovation, but also changes in individual behaviour, corporate responsibility, and international cooperation.',
    ],
    notes: 'Multi-element parallel structures (three or more parallel elements) are highly valued in IELTS as they demonstrate syntactic control and argumentation clarity.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MỐC 3 — KHÔNG ƯU TIÊN: Band 7.5+
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 't5',
    topic: 'Tenses',
    category: 'Past Perfect',
    band: '7.5+',
    priority: 'low-priority',
    status: 'có',
    title: 'Past Perfect',
    explanation: 'Diễn tả hành động xảy ra trước một hành động khác trong quá khứ. Ít dùng hơn trong IELTS Task 2 nhưng hữu ích khi viết về lịch sử.',
    structure: 'S + had + V3',
    examples: [
      'By the time the environmental law was enacted, the irreversible damage had already been done.',
      'Scientists had warned about the dangers of climate change for decades before governments finally took action.',
      'The company had consistently failed to meet safety standards before the catastrophic accident occurred.',
    ],
  },
  {
    id: 'c4',
    topic: 'Conditionals',
    category: 'Third Conditional',
    band: '7.5+',
    priority: 'low-priority',
    status: 'có',
    title: 'Third Conditional — Điều kiện quá khứ',
    explanation: 'Diễn tả điều kiện không có thật trong quá khứ và hậu quả giả định. Hữu ích để phân tích các quyết định lịch sử trong IELTS.',
    structure: 'If + S + had + V3, S + would/could/might + have + V3',
    examples: [
      'Had governments acted decisively in the 1990s, the current environmental crisis would have been largely averted.',
      'If stricter financial regulations had been enforced, the global recession of 2008 would not have been so severe.',
      'Had the international community intervened earlier, countless lives could have been saved.',
    ],
    notes: 'Dạng đảo ngữ "Had + S + V3" thay cho "If + S + had + V3" là cấu trúc band 7.5+ đặc trưng.',
  },
  {
    id: 'i1',
    topic: 'Inversion',
    category: 'Negative Inversion',
    band: '7.5+',
    priority: 'low-priority',
    status: 'có',
    title: 'Negative Inversion (Đảo ngữ phủ định)',
    explanation: 'Đảo trợ động từ lên trước chủ ngữ khi mệnh đề bắt đầu bằng phó từ phủ định để nhấn mạnh. Đây là cấu trúc đặc trưng của văn viết trang trọng band 7.5+.',
    structure: 'Negative adverb/phrase + auxiliary + S + V',
    examples: [
      'Not only does education enhance employment prospects, but it also promotes social cohesion and civic engagement.',
      'Rarely has such a significant and far-reaching policy shift been witnessed in modern democratic history.',
      'Under no circumstances should governments neglect their fundamental environmental and social responsibilities.',
      'Only by investing substantially in renewable energy can nations realistically achieve long-term carbon neutrality.',
      'No sooner had the controversial law been enacted than widespread protests erupted across the country.',
    ],
    notes: 'Trigger words: Not only, Rarely, Never, Seldom, Only, Under no circumstances, No sooner, Hardly/Scarcely...when/before.',
  },
  {
    id: 'i2',
    topic: 'Inversion',
    category: 'Conditional Inversion',
    band: '7.5+',
    priority: 'low-priority',
    status: 'có',
    title: 'Conditional Inversion',
    explanation: 'Đảo ngữ trong câu điều kiện để văn viết trang trọng hơn và thể hiện sự thành thạo ngữ pháp cao. Thay thế "if" bằng cách đảo trợ động từ.',
    structure: 'Were + S + to V... | Had + S + V3... | Should + S + V...',
    examples: [
      'Were governments to implement truly stringent carbon regulations, pollution levels would fall dramatically within a decade.',
      'Had policymakers acted with greater urgency in the early stages, the humanitarian crisis could have been averted.',
      'Should this alarming trend continue unchecked, the social and economic consequences could prove catastrophic.',
    ],
  },
  {
    id: 'advinv1',
    topic: 'Inversion',
    category: 'Advanced Inversion',
    band: '7.5+',
    priority: 'low-priority',
    status: 'thiếu',
    title: 'Advanced Inversion Structures',
    explanation: 'Các cấu trúc đảo ngữ nâng cao bao gồm So/Such inversion và các cấu trúc nhấn mạnh khác. Dùng cẩn thận — một hoặc hai lần trong bài để tạo hiệu ứng mà không làm bài trở nên cứng nhắc.',
    structure: 'So + adj + be + S + that... | Such + be + N + that... | Not until + clause + auxiliary + S + V',
    examples: [
      'So profound is the impact of digital technology on modern society that it is difficult to imagine life without it.',
      'Such is the magnitude of the climate challenge that no single nation can address it alone.',
      'Not until governments fully acknowledge the severity of inequality will meaningful policy reform become possible.',
      'Rarely does a single policy decision have such far-reaching and long-lasting consequences for an entire generation.',
    ],
  },
  {
    id: 'subj1',
    topic: 'Advanced Structures',
    category: 'Subjunctive',
    band: '7.5+',
    priority: 'low-priority',
    status: 'thiếu',
    title: 'Subjunctive Structures',
    explanation: 'Subjunctive mood (cấu trúc cầu thì) dùng để diễn đạt sự cần thiết, khuyến nghị, hoặc điều ước sau một số động từ/tính từ nhất định. Ít phổ biến trong IELTS nhưng thể hiện trình độ ngữ pháp cao.',
    structure: 'It is essential/vital/important that + S + V (bare infinitive, no -s) | recommend/suggest/insist that + S + V',
    examples: [
      'It is essential that every government commit to reducing carbon emissions by at least 50% by 2030.',
      'Experts recommend that the education system be reformed to place greater emphasis on critical thinking.',
      'The committee insists that the policy be reviewed before its full-scale implementation.',
      'It is imperative that international cooperation on climate change not be allowed to falter.',
    ],
    notes: 'Subjunctive uses bare infinitive (without -s in third person singular): "it is essential that he be..." not "he is". Also common: "were it not for...", "if it were not for...".',
  },
]

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_TOPICS = [
  'All',
  'Tenses',
  'Articles',
  'Nouns & Agreement',
  'Prepositions',
  'Conditionals',
  'Passive Voice',
  'Modal Verbs',
  'Relative Clauses',
  'Sentence Structures',
  'Gerunds & Infinitives',
  'Reporting & Hedging',
  'Advanced Structures',
  'Inversion',
]

type ExtendedBandLevel = 'All' | BandLevel
const BANDS: ExtendedBandLevel[] = ['All', '4.0-5.0', '5.0-5.5', '5.5-6.0', '6.0-6.5', '6.5-7.0', '7.0-7.5', '7.5+']
const PRIORITIES: ('All' | Priority)[] = ['All', 'required', 'band-booster', 'low-priority']

const BAND_COLORS: Record<BandLevel, string> = {
  '4.0-5.0': 'bg-blue-100 text-blue-700',
  '5.0-5.5': 'bg-cyan-100 text-cyan-700',
  '5.5-6.0': 'bg-green-100 text-green-700',
  '6.0-6.5': 'bg-teal-100 text-teal-700',
  '6.5-7.0': 'bg-orange-100 text-orange-700',
  '7.0-7.5': 'bg-rose-100 text-rose-700',
  '7.5+': 'bg-red-100 text-red-700',
}

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  'có': { label: '✅ Có', className: 'bg-green-50 text-green-700 border border-green-200' },
  'thiếu': { label: '❌ Thiếu', className: 'bg-red-50 text-red-700 border border-red-200' },
  'chưa đủ': { label: '⚠️ Chưa đủ', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  'một phần': { label: '⚠️ Một phần', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
}

const PRIORITY_CONFIG: Record<Priority, { label: string; headerClass: string; dotClass: string }> = {
  'required': {
    label: '🔴 MỐC 1 — BẮT BUỘC',
    headerClass: 'bg-red-600 text-white',
    dotClass: 'bg-red-500',
  },
  'band-booster': {
    label: '🟠 MỐC 2 — NÂNG BAND',
    headerClass: 'bg-orange-500 text-white',
    dotClass: 'bg-orange-500',
  },
  'low-priority': {
    label: '⚫ MỐC 3 — KHÔNG ƯU TIÊN',
    headerClass: 'bg-gray-500 text-white',
    dotClass: 'bg-gray-400',
  },
}

// Band sub-groups within MỐC 1
const REQUIRED_BAND_GROUPS: { bands: BandLevel[]; label: string; subLabel: string }[] = [
  { bands: ['4.0-5.0'], label: 'Band 4.0–5.0', subLabel: 'Grammar Foundation' },
  { bands: ['5.0-5.5'], label: 'Band 5.0–5.5', subLabel: 'Sentence Building' },
  { bands: ['5.5-6.0'], label: 'Band 5.5–6.0', subLabel: 'Core IELTS Grammar' },
  { bands: ['6.0-6.5'], label: 'Band 6.0–6.5', subLabel: 'Band 7 Core' },
]

// ---------------------------------------------------------------------------
// GrammarCard component
// ---------------------------------------------------------------------------

function GrammarCard({ rule }: { rule: GrammarRule }) {
  const [expanded, setExpanded] = useState(false)
  const statusBadge = STATUS_BADGE[rule.status]

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BAND_COLORS[rule.band]}`}>
            Band {rule.band}
          </span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{rule.topic}</span>
          <h3 className="text-sm font-semibold text-gray-900">{rule.title}</h3>
        </div>
        <svg
          className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          <p className="text-sm text-gray-700">{rule.explanation}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Cấu trúc</p>
            <code className="block rounded-md bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm font-mono text-indigo-800">
              {rule.structure}
            </code>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Ví dụ IELTS</p>
            <ul className="space-y-1.5">
              {rule.examples.map((ex, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 text-indigo-400">▸</span>
                  <span className="italic">{ex}</span>
                </li>
              ))}
            </ul>
          </div>
          {rule.commonErrors && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Lỗi thường gặp</p>
              <ul className="space-y-1">
                {rule.commonErrors.map((err, i) => (
                  <li key={i} className="text-sm text-gray-600">{err}</li>
                ))}
              </ul>
            </div>
          )}
          {rule.notes && (
            <div className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">💡 Ghi chú IELTS</p>
              <p className="text-sm text-amber-800">{rule.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MilestoneSection component
// ---------------------------------------------------------------------------

function MilestoneSection({
  priority,
  rules,
  showBandGroups,
}: {
  priority: Priority
  rules: GrammarRule[]
  showBandGroups: boolean
}) {
  const config = PRIORITY_CONFIG[priority]
  if (rules.length === 0) return null

  return (
    <section className="mb-8">
      {/* Milestone header */}
      <div className={`rounded-xl px-5 py-3 mb-4 flex items-center justify-between ${config.headerClass}`}>
        <div>
          <h2 className="text-base font-bold">{config.label}</h2>
          {priority === 'required' && (
            <p className="text-xs opacity-90 mt-0.5">Chiếm 70% thời gian học grammar — nền tảng để đạt Band 7.0</p>
          )}
          {priority === 'band-booster' && (
            <p className="text-xs opacity-90 mt-0.5">Nâng từ Band 6.5 lên 7.0–7.5 — cấu trúc học thuật nâng cao</p>
          )}
          {priority === 'low-priority' && (
            <p className="text-xs opacity-90 mt-0.5">Band 7.5+ — cấu trúc đặc biệt, không cần ưu tiên lúc đầu</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          {rules.length} quy tắc
        </span>
      </div>

      {/* Content: grouped by band for required, flat for others */}
      {showBandGroups && priority === 'required' ? (
        <div className="space-y-6">
          {REQUIRED_BAND_GROUPS.map(group => {
            const groupRules = rules.filter(r => group.bands.includes(r.band))
            if (groupRules.length === 0) return null
            return (
              <div key={group.label}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-700">{group.label}</span>
                    <span className="ml-2 text-xs text-gray-400">— {group.subLabel}</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-3">
                  {groupRules.map(rule => <GrammarCard key={rule.id} rule={rule} />)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => <GrammarCard key={rule.id} rule={rule} />)}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main GrammarPage
// ---------------------------------------------------------------------------

export default function GrammarPage() {
  const [search, setSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [selectedBand, setSelectedBand] = useState<ExtendedBandLevel>('All')
  const [selectedPriority, setSelectedPriority] = useState<'All' | Priority>('All')

  const filtered = useMemo(() => {
    return GRAMMAR_DATA.filter(rule => {
      const matchesTopic = selectedTopic === 'All' || rule.topic === selectedTopic
      const matchesBand = selectedBand === 'All' || rule.band === selectedBand
      const matchesPriority = selectedPriority === 'All' || rule.priority === selectedPriority
      const q = search.toLowerCase()
      const matchesSearch = !q || (
        rule.title.toLowerCase().includes(q) ||
        rule.explanation.toLowerCase().includes(q) ||
        rule.examples.some(e => e.toLowerCase().includes(q)) ||
        rule.structure.toLowerCase().includes(q) ||
        rule.category.toLowerCase().includes(q)
      )
      return matchesTopic && matchesBand && matchesPriority && matchesSearch
    })
  }, [search, selectedTopic, selectedBand, selectedPriority])

  // Determine whether to show band subgroups (only when not filtering by band/topic)
  const showBandGroups = selectedBand === 'All' && selectedTopic === 'All' && selectedPriority !== 'band-booster' && selectedPriority !== 'low-priority'

  const requiredRules = filtered.filter(r => r.priority === 'required')
  const bandBoosterRules = filtered.filter(r => r.priority === 'band-booster')
  const lowPriorityRules = filtered.filter(r => r.priority === 'low-priority')

  const isFiltering = search || selectedTopic !== 'All' || selectedBand !== 'All' || selectedPriority !== 'All'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grammar Reference</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ngữ pháp IELTS theo 3 mốc ưu tiên — từ Band 4.0 đến 7.5+. Click để mở từng quy tắc.
        </p>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {(['required', 'band-booster', 'low-priority'] as Priority[]).map(p => (
            <div key={p} className="flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${PRIORITY_CONFIG[p].dotClass}`} />
              <span className="text-gray-600">
                {p === 'required' ? 'Bắt buộc (Band 7 target)' : p === 'band-booster' ? 'Nâng band 6.5–7.5' : 'Không ưu tiên (7.5+)'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm quy tắc, ví dụ, cấu trúc..."
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />

        {/* Priority filter */}
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map(p => {
            const label = p === 'All' ? 'Tất cả mốc' : p === 'required' ? '🔴 Bắt buộc' : p === 'band-booster' ? '🟠 Nâng band' : '⚫ Thấp'
            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  selectedPriority === p
                    ? p === 'required' ? 'bg-red-600 text-white' : p === 'band-booster' ? 'bg-orange-500 text-white' : p === 'low-priority' ? 'bg-gray-600 text-white' : 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Band filter */}
        <div className="flex flex-wrap gap-2">
          {BANDS.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBand(b)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                selectedBand === b
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {b === 'All' ? 'Tất cả Band' : `Band ${b}`}
            </button>
          ))}
        </div>

        {/* Topic filter */}
        <div className="flex flex-wrap gap-2">
          {ALL_TOPICS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTopic(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                selectedTopic === t
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 text-xs text-gray-400">
        {filtered.length} quy tắc{filtered.length !== GRAMMAR_DATA.length ? ` / ${GRAMMAR_DATA.length} tổng` : ''}
        {isFiltering && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSelectedTopic('All'); setSelectedBand('All'); setSelectedPriority('All') }}
            className="ml-2 text-indigo-600 hover:underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </p>

      {/* Rules list */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p>Không tìm thấy quy tắc phù hợp.</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setSelectedTopic('All'); setSelectedBand('All'); setSelectedPriority('All') }}
            className="mt-3 text-sm text-indigo-600 hover:underline"
          >
            Xoá bộ lọc
          </button>
        </div>
      ) : (
        <div>
          <MilestoneSection priority="required" rules={requiredRules} showBandGroups={showBandGroups} />
          <MilestoneSection priority="band-booster" rules={bandBoosterRules} showBandGroups={false} />
          <MilestoneSection priority="low-priority" rules={lowPriorityRules} showBandGroups={false} />
        </div>
      )}
    </div>
  )
}
