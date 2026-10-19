#!/usr/bin/env node
// Generates the synthetic learner repo for E11.
// Zero deps; Node >= 18 stdlib only.
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'learner-repo');

function w(p, obj) {
  const full = path.join(BASE, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(obj, null, 2));
}

// ── course.json ──────────────────────────────────────────────────────────────
w('course.json', {
  schema: 'metadax.course/0.2',
  course_id: 'data-analysis-fundamentals',
  title: 'Data Analysis Fundamentals',
  description: 'A six-week introduction to data analysis for working adults with no prior coding experience.',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  license: 'CC-BY-4.0',
  generated_segments_license: 'CC0-1.0',
  constraint_decl: null
});

// ── learner profile ───────────────────────────────────────────────────────────
w('learners/lrn-mira01/profile.json', {
  schema: 'metadax.profile/0.2',
  learner_id: 'lrn-mira01',
  age_band: 'adult',
  display_name: 'Mira',
  preferred_language: 'en',
  goals: ['understand data workflows', 'prepare for a data analyst role at her company'],
  background: 'Office administrator with ten years of experience, comfortable with spreadsheets but no prior coding or statistics background.',
  created_at: '2026-09-01T09:00:00Z',
  updated_at: '2026-10-12T18:00:00Z'
});

// ── refusals ─────────────────────────────────────────────────────────────────
w('learners/lrn-mira01/never_show.json', {
  schema: 'metadax.refusal/0.2',
  learner_id: 'lrn-mira01',
  entries: [
    {
      id: 'r-01',
      pattern: 'Excel formulas',
      reason: 'Already proficient; re-covering this topic wastes session time.',
      created_at: '2026-09-10T10:00:00Z'
    },
    {
      id: 'r-02',
      pattern: 'Tableau',
      reason: 'Not available at her workplace; her employer uses a different BI tool.',
      created_at: '2026-09-15T14:00:00Z'
    }
  ]
});

// ── guide note ────────────────────────────────────────────────────────────────
w('learners/lrn-mira01/guide_note.json', {
  schema: 'metadax.guide-note/0.2',
  author: 'Carlos',
  created_at: '2026-10-05T11:00:00Z',
  note: 'Mira is progressing steadily and shows strong engagement in weeks 1 through 4. She flagged difficulty with SQL joins in week 5 and would benefit from the SQL-joins follow-up being re-offered at the next session. She is a self-motivated learner who absorbs concepts better when given real-world context before formal definitions. Consider leading with a worked data-cleaning example before the Python introduction in week 6.'
});

// ── weekly progress snapshots ─────────────────────────────────────────────────
const weeks = [
  {
    date: '2026-09-07', week: 1,
    topics: ['spreadsheet-basics', 'data-types'],
    competency: 'novice',
    sessions_completed: 3,
    nodes_visited: ['L01.M01.O01', 'L01.M01.O02', 'L01.M01.O03'],
    summary: 'Completed spreadsheet basics and data types. Comfortable with rows/columns and cell references.'
  },
  {
    date: '2026-09-14', week: 2,
    topics: ['summary-statistics', 'mean-median-mode', 'standard-deviation'],
    competency: 'novice',
    sessions_completed: 3,
    nodes_visited: ['L01.M02.O01', 'L01.M02.O02', 'L01.M02.O03', 'L01.M02.O04'],
    summary: 'Covered mean, median, mode and standard deviation. Asked follow-up on why median is preferred over mean for skewed data.'
  },
  {
    date: '2026-09-21', week: 3,
    topics: ['visualization-fundamentals', 'chart-types', 'when-to-use-which-chart'],
    competency: 'developing',
    sessions_completed: 3,
    nodes_visited: ['L01.M03.O01', 'L01.M03.O02', 'L01.M03.O03'],
    summary: 'Explored bar charts, line charts and scatter plots. Identified when each is appropriate. Noted confusion around dual-axis charts.'
  },
  {
    date: '2026-09-28', week: 4,
    topics: ['data-cleaning', 'missing-values', 'duplicates'],
    competency: 'developing',
    sessions_completed: 4,
    nodes_visited: ['L01.M04.O01', 'L01.M04.O02', 'L01.M04.O03'],
    summary: 'Learned strategies for handling missing values and deduplication. Applied techniques to a sample dataset.'
  },
  {
    date: '2026-10-05', week: 5,
    topics: ['sql-basics', 'select-where', 'sql-joins'],
    competency: 'developing',
    sessions_completed: 3,
    nodes_visited: ['L01.M05.O01', 'L01.M05.O02', 'L01.M05.O03'],
    summary: 'Introduced to SQL SELECT and WHERE clauses. Struggled with JOIN syntax; guide flagged this for re-offer.'
  },
  {
    date: '2026-10-12', week: 6,
    topics: ['python-for-data', 'pandas-basics', 'reading-csv-python', 'basic-plotting'],
    competency: 'developing',
    sessions_completed: 3,
    nodes_visited: ['L01.M06.O01', 'L01.M06.O02', 'L01.M06.O03', 'L01.M06.O04', 'L01.M06.O05'],
    summary: 'First Python sessions. Successfully ran a pandas script to load and inspect a CSV. Eager to apply to own work data.'
  }
];

for (const wk of weeks) {
  w(`learners/lrn-mira01/progress/data-analysis-fundamentals/dev-alpha/${wk.date}.json`, {
    schema: 'metadax.progress/0.2',
    learner_id: 'lrn-mira01',
    course_id: 'data-analysis-fundamentals',
    device_id: 'dev-alpha',
    snapshot_date: wk.date,
    week_number: wk.week,
    topics_covered: wk.topics,
    overall_competency: wk.competency,
    sessions_completed: wk.sessions_completed,
    nodes_visited: wk.nodes_visited,
    weekly_summary: wk.summary
  });
}

// ── public follow-up nodes (20) ───────────────────────────────────────────────
const publicNodes = [
  // Week 1: spreadsheet basics (3 nodes)
  { id: 'L01.M01.O01', title: 'What is a CSV file?', concept: 'spreadsheet-basics',
    week: 1, body: 'A CSV (comma-separated values) file stores tabular data as plain text. Each row is a record; fields within a row are separated by commas. CSV files can be opened in any spreadsheet application.' },
  { id: 'L01.M01.O02', title: 'Difference between text and number data types', concept: 'data-types',
    week: 1, body: 'Numeric cells support arithmetic; text cells do not. Dates stored as text cannot be sorted chronologically. Always check the data type before calculating totals.' },
  { id: 'L01.M01.O03', title: 'What is a pivot table?', concept: 'spreadsheet-basics',
    week: 1, body: 'A pivot table summarises rows by grouping and aggregating (sum, count, average). It lets you quickly explore large datasets without writing formulas.' },

  // Week 2: statistics (4 nodes)
  { id: 'L01.M02.O01', title: 'Why use the median instead of the mean for skewed data?', concept: 'mean-median-mode',
    week: 2, body: 'The mean is pulled toward outliers. If a dataset contains a few very large values, the mean will be higher than the "typical" value. The median splits the sorted dataset in half and is unaffected by extreme values.' },
  { id: 'L01.M02.O02', title: 'What does standard deviation tell you?', concept: 'standard-deviation',
    week: 2, body: 'Standard deviation measures how spread out values are from the mean. A small SD means values cluster near the mean; a large SD means they are widely dispersed.' },
  { id: 'L01.M02.O03', title: 'What is a frequency distribution?', concept: 'summary-statistics',
    week: 2, body: 'A frequency distribution counts how many times each value (or value range) appears. A histogram is its visual equivalent.' },
  { id: 'L01.M02.O04', title: 'How do you spot an outlier?', concept: 'summary-statistics',
    week: 2, body: 'A common rule: values more than 1.5 times the interquartile range below Q1 or above Q3 are candidate outliers. Always investigate before removing; outliers sometimes reflect real events.' },

  // Week 3: visualisation (3 nodes)
  { id: 'L01.M03.O01', title: 'When should you use a bar chart vs a line chart?', concept: 'chart-types',
    week: 3, body: 'Use a bar chart when comparing discrete categories (e.g. sales by region). Use a line chart when showing a continuous trend over time (e.g. monthly revenue).' },
  { id: 'L01.M03.O02', title: 'What is a scatter plot used for?', concept: 'chart-types',
    week: 3, body: 'A scatter plot shows the relationship between two numeric variables. If the points form a rising pattern, the variables are positively correlated.' },
  { id: 'L01.M03.O03', title: 'Why can dual-axis charts mislead?', concept: 'when-to-use-which-chart',
    week: 3, body: 'Dual-axis charts use two different y-scales, which can make weak correlations look strong. The reader may assume both series are directly comparable when they are not.' },

  // Week 4: data cleaning (3 nodes)
  { id: 'L01.M04.O01', title: 'How do you handle missing values?', concept: 'missing-values',
    week: 4, body: 'Options: delete rows with missing values, fill with a default (mean, median, most common), or mark them as unknown. The right choice depends on how many rows are missing and why the data is absent.' },
  { id: 'L01.M04.O02', title: 'What is deduplication?', concept: 'duplicates',
    week: 4, body: 'Deduplication identifies and removes exact or near-identical rows. Always confirm why duplicates exist before deleting; sometimes they are legitimate repeated events.' },
  { id: 'L01.M04.O03', title: 'What is data normalisation?', concept: 'data-cleaning',
    week: 4, body: 'Normalisation standardises the range of values so that one variable does not dominate others. Common methods: min-max scaling, z-score standardisation.' },

  // Week 5: SQL (3 nodes)
  { id: 'L01.M05.O01', title: 'What does SELECT * FROM do?', concept: 'sql-basics',
    week: 5, body: 'SELECT * FROM table_name returns every column and every row from the specified table. Add a WHERE clause to filter rows.' },
  { id: 'L01.M05.O02', title: 'How does a WHERE clause work?', concept: 'select-where',
    week: 5, body: 'WHERE filters rows based on a condition: SELECT name FROM employees WHERE department = \'Sales\'. Multiple conditions can be combined with AND / OR.' },
  { id: 'L01.M05.O03', title: 'What is the difference between INNER JOIN and LEFT JOIN?', concept: 'sql-joins',
    week: 5, body: 'INNER JOIN returns only rows that match in both tables. LEFT JOIN returns all rows from the left table, with NULLs where the right table has no match.' },

  // Week 6: Python (5 nodes)
  { id: 'L01.M06.O01', title: 'How do you read a CSV file in Python with pandas?', concept: 'reading-csv-python',
    week: 6, body: 'Use pd.read_csv("filename.csv"). The result is a DataFrame with columns matching the CSV headers. Check df.head() to inspect the first five rows.' },
  { id: 'L01.M06.O02', title: 'What is a pandas DataFrame?', concept: 'pandas-basics',
    week: 6, body: 'A DataFrame is a two-dimensional table with labelled rows and columns, similar to a spreadsheet. Each column is a Series of uniform type.' },
  { id: 'L01.M06.O03', title: 'How do you filter rows in a DataFrame?', concept: 'pandas-basics',
    week: 6, body: 'Use a boolean mask: df[df["age"] > 30]. This returns a new DataFrame with only the rows where age exceeds 30.' },
  { id: 'L01.M06.O04', title: 'How do you plot a simple chart from pandas data?', concept: 'basic-plotting',
    week: 6, body: 'df["column"].plot(kind="bar") creates a bar chart using matplotlib under the hood. Call plt.show() to display it.' },
  { id: 'L01.M06.O05', title: 'What is the difference between Python lists and pandas Series?', concept: 'pandas-basics',
    week: 6, body: 'A list is a general-purpose Python container with no type constraint. A Series is a labelled, single-type array optimised for vectorised operations and alignment.' }
];

for (const n of publicNodes) {
  const nodeDir = `nodes/${n.id}`;
  w(`${nodeDir}/node.json`, {
    schema: 'metadax.node/0.2',
    id: n.id,
    title: n.title,
    concept: n.concept,
    week: n.week,
    visibility: 'public',
    core: {
      body: n.body,
      bloom_level: 'understand'
    },
    created_at: `2026-${String(8 + n.week).padStart(2,'0')}-01T00:00:00Z`,
    updated_at: `2026-${String(8 + n.week).padStart(2,'0')}-01T00:00:00Z`,
    content_sha256: 'runtime',
    superseded_by: null
  });
  w(`${nodeDir}/provenance.json`, {
    schema: 'metadax.provenance/0.2',
    node_id: n.id,
    content_hash: 'runtime',
    created_by: { id: 'lrn-mira01', key_id: null, chain_role: 'learner' },
    lineage: [],
    constraints: { constraint_decl_ref: null },
    spec_version: '0.2',
    ts: 'runtime'
  });
}

// ── private follow-up nodes (8) ───────────────────────────────────────────────
const privateNodes = [
  { id: 'prv-01', week: 1, title: 'Personal note: why am I doing this?',
    body: 'Reminder to myself: my manager told me my job might be at risk if I do not upskill. This is not just a hobby — I need to get through this course and prove I can do data work.' },
  { id: 'prv-02', week: 2, title: 'Emotional check-in after week 2',
    body: 'Felt stupid during the standard deviation session. Had to replay it four times. Almost cried. I know this is normal but it is really hard when you feel like everyone else gets it straight away.' },
  { id: 'prv-03', week: 3, title: 'Note about my migraine',
    body: 'Had a bad migraine on Tuesday so missed the visualisation recap. Caught up on Wednesday but my concentration was not great. Need to mention this to the guide in case it affects my pacing.' },
  { id: 'prv-04', week: 3, title: 'Work confidential: project context',
    body: 'The reason I need the visualisation module is for the Q4 board report my boss asked me to prepare by 2026-11-01. The figures are commercially sensitive and I cannot share them in sessions.' },
  { id: 'prv-05', week: 4, title: 'Near-quit moment',
    body: 'Almost quit after the data-cleaning session. The missing-values exercise felt endless. My partner talked me out of it. Writing this down so I can look back and see I got through it.' },
  { id: 'prv-06', week: 4, title: 'Medical appointment note',
    body: 'Moved week 4 session 4 to a Friday because of a GP appointment on Thursday. Health issue is minor but I am taking medication that affects concentration in the mornings — reason for always scheduling afternoon sessions.' },
  { id: 'prv-07', week: 5, title: 'Salary negotiation context',
    body: 'If I can demonstrate SQL competency I am planning to ask for a pay rise in January. This is why the SQL week matters so much to me personally. Do not want this context shared with anyone.' },
  { id: 'prv-08', week: 6, title: 'Python success — personal milestone',
    body: 'Actually ran a real script on my own work data today (anonymised). The pandas read_csv worked. I nearly phoned my mum. Six weeks ago I had never written a single line of code.' }
];

for (const n of privateNodes) {
  const nodeDir = `learners/lrn-mira01/nodes/${n.id}`;
  w(`${nodeDir}/node.json`, {
    schema: 'metadax.node/0.2',
    id: n.id,
    title: n.title,
    concept: 'personal-note',
    week: n.week,
    visibility: 'private',
    core: { body: n.body },
    created_at: `2026-0${8 + n.week}-01T00:00:00Z`,
    updated_at: `2026-0${8 + n.week}-01T00:00:00Z`,
    content_sha256: 'runtime',
    superseded_by: null
  });
  w(`${nodeDir}/provenance.json`, {
    schema: 'metadax.provenance/0.2',
    node_id: n.id,
    content_hash: 'runtime',
    created_by: { id: 'lrn-mira01', key_id: null, chain_role: 'learner' },
    lineage: [],
    constraints: { constraint_decl_ref: null },
    spec_version: '0.2',
    ts: 'runtime'
  });
}

console.log('Learner repo built at', BASE);
