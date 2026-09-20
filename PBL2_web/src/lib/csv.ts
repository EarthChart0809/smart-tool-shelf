// 引用符・改行を含むフィールドにも対応した簡易CSVパーサー
// (外部ライブラリを追加せずに済ませるための最小実装)
export function parseCsv(text: string): string[][] {
  // BOM(Excelが付与することがある)を除去
  const input = text.replace(/^\uFEFF/, "");

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field.trim());
      field = "";
    } else if (char === "\n") {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  // 空行を除去
  return rows.filter((r) => r.some((cell) => cell !== ""));
}

// 1行目をヘッダーとして、オブジェクトの配列に変換する
export function parseCsvToObjects(text: string): Record<string, string>[] {
  const rows = parseCsv(text);

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];

  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? "";
    });
    return obj;
  });
}

// オブジェクトの配列をCSV文字列に変換する
// (フィールドにカンマ・改行・ダブルクォートが含まれていても壊れないようエスケープする)
export function toCsv(rows: Record<string, string | number>[], headers: string[]): string {
  const escapeField = (value: string | number) => {
    const str = String(value);

    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  };

  const headerLine = headers.join(",");

  const bodyLines = rows.map((row) =>
    headers.map((header) => escapeField(row[header] ?? "")).join(","),
  );

  // Excelで文字化けしないようBOMを付与する
  return "\uFEFF" + [headerLine, ...bodyLines].join("\n");
}