// 文字列の差分を検出し、マークアップするためのユーティリティ

export interface DiffChunk {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  line?: number;
}

export interface DiffResult {
  chunks: DiffChunk[];
  hasChanges: boolean;
}

// 簡易的な行単位での差分検出
export function detectLineDiff(original: string, modified: string): DiffResult {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  const chunks: DiffChunk[] = [];
  let hasChanges = false;
  
  // 簡単なLCS（最長共通部分列）アルゴリズムで差分を検出
  const matrix = createLCSMatrix(originalLines, modifiedLines);
  const diffSequence = buildDiffSequence(originalLines, modifiedLines, matrix);
  
  diffSequence.forEach(chunk => {
    if (chunk.type !== 'unchanged') {
      hasChanges = true;
    }
    chunks.push(chunk);
  });
  
  return { chunks, hasChanges };
}

// LCS行列を作成
function createLCSMatrix(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const matrix: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }
  
  return matrix;
}

// 差分シーケンスを構築
function buildDiffSequence(a: string[], b: string[], matrix: number[][]): DiffChunk[] {
  const chunks: DiffChunk[] = [];
  let i = a.length;
  let j = b.length;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      chunks.unshift({ type: 'unchanged', content: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      chunks.unshift({ type: 'added', content: b[j - 1] });
      j--;
    } else if (i > 0) {
      chunks.unshift({ type: 'removed', content: a[i - 1] });
      i--;
    }
  }
  
  return chunks;
}

// マークダウンテキストを差分表示用にマークアップ
export function markupDiffForDisplay(chunks: DiffChunk[]): string {
  return chunks.map(chunk => {
    switch (chunk.type) {
      case 'added':
        return `<span data-diff="added">${chunk.content}</span>`;
      case 'removed':
        return `<span data-diff="removed">${chunk.content}</span>`;
      case 'unchanged':
        return chunk.content;
      default:
        return chunk.content;
    }
  }).join('\n');
}

// 変更承認後のクリーンなテキストを生成
export function generateCleanText(chunks: DiffChunk[]): string {
  return chunks
    .filter(chunk => chunk.type !== 'removed')
    .map(chunk => chunk.content)
    .join('\n');
}
