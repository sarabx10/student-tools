// ============================================================
//  Word-level diff (LCS) used to highlight mistakes.
// ------------------------------------------------------------
//  diffTokens(a, b) -> array of ops:
//    { type: 'equal' | 'del' | 'ins', text }
//  'del' = in original but removed (a mistake) -> show red
//  'ins' = added in the corrected text          -> show green
// ============================================================

// Split into words AND whitespace so we can rejoin exactly.
function tokenize(s) {
  return s.split(/(\s+)/).filter((t) => t.length > 0);
}

export function diffTokens(a, b) {
  const at = tokenize(a);
  const bt = tokenize(b);
  const n = at.length;
  const m = bt.length;

  // Very long inputs: skip the diff (too heavy) — caller shows plain text.
  if (n > 1500 || m > 1500) return null;

  // LCS length table.
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = at[i] === bt[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (at[i] === bt[j]) {
      ops.push({ type: 'equal', text: at[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'del', text: at[i] });
      i++;
    } else {
      ops.push({ type: 'ins', text: bt[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: 'del', text: at[i++] });
  while (j < m) ops.push({ type: 'ins', text: bt[j++] });
  return ops;
}

// Group consecutive del/ins runs into readable "from -> to" changes.
export function buildChanges(ops) {
  if (!ops) return [];
  const changes = [];
  let from = '';
  let to = '';
  const flush = () => {
    if (from.trim() || to.trim()) changes.push({ from: from.trim(), to: to.trim() });
    from = '';
    to = '';
  };
  for (const op of ops) {
    if (op.type === 'equal') flush();
    else if (op.type === 'del') from += op.text;
    else if (op.type === 'ins') to += op.text;
  }
  flush();
  return changes;
}
