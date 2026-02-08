#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const DOCS_ROOT = path.join(ROOT, "content", "docs");
const OUTPUT_DIR = process.env.WORD_EXPORT_DIR
  ? path.resolve(ROOT, process.env.WORD_EXPORT_DIR)
  : path.join(ROOT, "exports", "word");
const MERMAID_ASSETS_DIR = path.join(OUTPUT_DIR, "assets");

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function sanitizeFileName(input) {
  return input
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) {
    return { title: "", body: raw };
  }

  const frontmatter = match[1];
  const body = raw.slice(match[0].length);
  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
  const title = titleMatch
    ? titleMatch[1].trim().replace(/^['"]|['"]$/g, "")
    : "";
  return { title, body };
}

function dedentBlock(input) {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }
  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }
  if (!lines.length) {
    return "";
  }

  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    const match = line.match(/^[ \t]*/);
    const indent = match ? match[0].length : 0;
    minIndent = Math.min(minIndent, indent);
  }
  if (!Number.isFinite(minIndent) || minIndent <= 0) {
    return lines.join("\n");
  }

  return lines
    .map((line) => {
      if (!line.trim()) {
        return "";
      }
      return line.slice(Math.min(minIndent, line.length));
    })
    .join("\n");
}

function convertCallouts(input) {
  return input.replace(
    /<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g,
    (_, attrs, content) => {
      const titleMatch = attrs.match(/title=(?:"([^"]*)"|'([^']*)')/);
      const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
      const text = dedentBlock(content);

      if (!title && !text) {
        return "\n";
      }

      if (title && text) {
        return `\n#### ${title}\n\n${text}\n`;
      }

      if (title) {
        return `\n#### ${title}\n`;
      }

      return `\n${text}\n`;
    },
  );
}

function convertTabs(input) {
  let output = input
    .replace(/<Tabs\b[^>]*>/g, "")
    .replace(/<\/Tabs>/g, "");

  output = output.replace(
    /<Tab\b[^>]*value=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/Tab>/g,
    (_, valueA, valueB, content) => {
      const value = (valueA || valueB || "选项").trim();
      const text = dedentBlock(content);
      return `\n### ${value}\n\n${text}\n`;
    },
  );

  return output;
}

function convertStepsBlock(inner) {
  const matches = [...inner.matchAll(/<Step>([\s\S]*?)<\/Step>/g)];
  if (!matches.length) {
    return inner;
  }
  const lines = [];
  for (let i = 0; i < matches.length; i += 1) {
    const content = dedentBlock(matches[i][1]);
    if (!content) {
      continue;
    }
    const contentLines = content.split(/\r?\n/);
    const first = contentLines[0].trim();
    const rest = contentLines.slice(1);
    lines.push(`${i + 1}. ${first}`);
    for (const restLine of rest) {
      lines.push(restLine.trim() ? `   ${restLine}` : "");
    }
    lines.push("");
  }
  return lines.join("\n");
}

function convertSteps(input) {
  return input.replace(/<Steps>([\s\S]*?)<\/Steps>/g, (_, inner) =>
    convertStepsBlock(inner),
  );
}

function convertAccordionsBlock(inner) {
  const matches = [
    ...inner.matchAll(
      /<Accordion\b[^>]*title=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/Accordion>/g,
    ),
  ];
  if (!matches.length) {
    return inner;
  }

  const lines = [];
  for (const match of matches) {
    const title = (match[1] || match[2] || "问答").trim();
    const content = dedentBlock(match[3]);
    lines.push(`### ${title}`);
    lines.push("");
    lines.push(content);
    lines.push("");
  }
  return lines.join("\n");
}

function convertAccordions(input) {
  return input.replace(/<Accordions>([\s\S]*?)<\/Accordions>/g, (_, inner) =>
    convertAccordionsBlock(inner),
  );
}

function convertFilesBlock(inner) {
  const lines = inner.split(/\r?\n/);
  const stack = [];
  const tree = [];
  for (const raw of lines) {
    const line = raw.trim();
    const openFolder = line.match(
      /^<Folder\b[^>]*name=(?:"([^"]*)"|'([^']*)')[^>]*>/,
    );
    if (openFolder) {
      const name = openFolder[1] || openFolder[2] || "folder";
      tree.push(`${"  ".repeat(stack.length)}${name}/`);
      stack.push(name);
      continue;
    }

    if (/^<\/Folder>/.test(line)) {
      stack.pop();
      continue;
    }

    const fileMatch = line.match(
      /^<File\b[^>]*name=(?:"([^"]*)"|'([^']*)')[^>]*\/?>/,
    );
    if (fileMatch) {
      const name = fileMatch[1] || fileMatch[2] || "file";
      tree.push(`${"  ".repeat(stack.length)}${name}`);
    }
  }

  if (!tree.length) {
    return "";
  }

  return `文件结构：\n\n\`\`\`text\n${tree.join("\n")}\n\`\`\`\n`;
}

function convertFiles(input) {
  return input.replace(/<Files>([\s\S]*?)<\/Files>/g, (_, inner) =>
    convertFilesBlock(inner),
  );
}

function formatQuizMarkdown(questions) {
  const lines = ["## 自测 Quiz（Word 版）", ""];
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i] || {};
    lines.push(`${i + 1}. ${String(q.question || "").trim()}`);
    const options = Array.isArray(q.options) ? q.options : [];
    for (let j = 0; j < options.length; j += 1) {
      const option = options[j] || {};
      const letter = String.fromCharCode(65 + j);
      const correct = option.correct ? "（正确）" : "";
      lines.push(`   - ${letter}. ${String(option.label || "").trim()}${correct}`);
    }
    if (q.explanation) {
      lines.push(`   - 解析：${String(q.explanation).trim()}`);
    }
    lines.push("");
  }
  return `\n${lines.join("\n")}\n`;
}

function convertQuiz(input) {
  return input.replace(
    /<Quiz\s+questions=\{([\s\S]*?)\}\s*\/>/g,
    (_, expression) => {
      try {
        const questions = Function(
          `"use strict"; return (${expression.trim()});`,
        )();
        if (Array.isArray(questions)) {
          return formatQuizMarkdown(questions);
        }
      } catch (_error) {
        // Fallback below.
      }

      return "\n## 自测 Quiz（Word 版）\n\n（交互题已转换为静态文档，未保留点击交互。）\n";
    },
  );
}

function convertCodeFenceTitles(input) {
  return input.replace(
    /^```([a-zA-Z0-9_-]+)\s+title=(?:"([^"]*)"|'([^']*)')\s*$/gm,
    (_, lang, titleA, titleB) => {
      const title = (titleA || titleB || "").trim();
      if (!title) {
        return `\`\`\`${lang}`;
      }
      return `#### ${title}\n\n\`\`\`${lang}`;
    },
  );
}

function removeImports(input) {
  return input.replace(
    /^import\s+.+\s+from\s+['"][^'"]+['"];?\s*$/gm,
    "",
  );
}

function stripResidualJsx(input) {
  return input.replace(
    /^\s*<\/?[A-Z][A-Za-z0-9]*(?:\s+[^>]*)?\/?>\s*$/gm,
    "",
  );
}

function cleanupSpacing(input) {
  let output = input.replace(/\r\n/g, "\n");
  output = output.replace(/\n{3,}/g, "\n\n");
  return `${output.trim()}\n`;
}

function stripBoldInLine(line) {
  let output = line;
  let previous = "";
  while (output !== previous) {
    previous = output;
    output = output.replace(/\*\*([^*]+)\*\*/g, "$1");
    output = output.replace(/__([^_]+)__/g, "$1");
  }
  output = output.replace(/<strong>(.*?)<\/strong>/gi, "$1");
  output = output.replace(/<b>(.*?)<\/b>/gi, "$1");
  return output;
}

function stripBoldMarkdown(input) {
  const lines = input.split("\n");
  let inFence = false;
  const output = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    output.push(stripBoldInLine(line));
  }

  return output.join("\n");
}

function escapeMarkdownAltText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

async function renderMermaidPng(diagramCode, outputFilePath) {
  try {
    await fs.access(outputFilePath);
    return;
  } catch {
    // Continue rendering.
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let response;

  try {
    response = await fetch("https://kroki.io/mermaid/png", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Accept: "image/png",
      },
      body: diagramCode,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Kroki ${response.status}: ${body.slice(0, 120)}`);
  }

  const pngBuffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputFilePath, pngBuffer);
}

async function convertMermaidBlocks(input, chapterKey) {
  const regex =
    /```mermaid(?:\s+title=(?:"([^"]*)"|'([^']*)'))?\s*\r?\n([\s\S]*?)\r?\n```/g;
  let output = "";
  let lastIndex = 0;
  let count = 0;
  let rendered = 0;
  let failed = 0;

  for (const match of input.matchAll(regex)) {
    const fullMatch = match[0];
    const start = match.index ?? 0;
    output += input.slice(lastIndex, start);
    lastIndex = start + fullMatch.length;
    count += 1;

    const title = (match[1] || match[2] || "").trim();
    const diagramCode = dedentBlock(match[3]);
    const hash = crypto
      .createHash("sha1")
      .update(diagramCode)
      .digest("hex")
      .slice(0, 12);
    const fileName = `${chapterKey}-mermaid-${String(count).padStart(2, "0")}-${hash}.png`;
    const filePath = path.join(MERMAID_ASSETS_DIR, fileName);
    const markdownImagePath = path
      .relative(ROOT, filePath)
      .replace(/\\/g, "/");
    const altText = escapeMarkdownAltText(title || `Mermaid 图 ${count}`);

    try {
      await renderMermaidPng(diagramCode, filePath);
      rendered += 1;
      output += `\n![${altText}](${markdownImagePath})\n`;
    } catch (error) {
      failed += 1;
      console.warn(
        `Mermaid render failed (${chapterKey}#${count}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      output += `\n${fullMatch}\n`;
    }
  }

  output += input.slice(lastIndex);
  return { content: output, count, rendered, failed };
}

async function mdxToWordMarkdown(raw, title, chapterKey) {
  let body = removeImports(raw);
  body = convertQuiz(body);
  body = convertFiles(body);
  body = convertSteps(body);
  body = convertAccordions(body);
  body = convertTabs(body);
  body = convertCallouts(body);
  const mermaid = await convertMermaidBlocks(body, chapterKey);
  body = mermaid.content;
  body = convertCodeFenceTitles(body);
  body = stripBoldMarkdown(body);
  body = stripResidualJsx(body);
  body = cleanupSpacing(body);
  return {
    markdown: `# ${title}\n\n${body}`,
    mermaid,
  };
}

function toChapterEntries(meta, moduleName, moduleIndex) {
  const chapterPages = (meta.pages || []).filter(
    (page) => page !== "index" && page !== "labs",
  );

  return chapterPages.map((page, chapterIndex) => ({
    moduleName,
    page,
    moduleIndex,
    chapterIndex: chapterIndex + 1,
    sourcePath: path.join(DOCS_ROOT, moduleName, `${page}.mdx`),
  }));
}

async function collectChapters() {
  const rootMeta = await readJson(path.join(DOCS_ROOT, "meta.json"));
  const modules = (rootMeta.pages || []).filter((page) => page !== "index");
  const entries = [];

  for (let i = 0; i < modules.length; i += 1) {
    const moduleName = modules[i];
    const moduleMetaPath = path.join(DOCS_ROOT, moduleName, "meta.json");
    const moduleMeta = await readJson(moduleMetaPath);
    entries.push(...toChapterEntries(moduleMeta, moduleName, i + 1));
  }

  return entries;
}

function runPandoc(markdown, outputPath) {
  const result = spawnSync(
    "pandoc",
    ["-f", "gfm", "-t", "docx", "-o", outputPath],
    {
      input: markdown,
      encoding: "utf8",
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || `pandoc failed: ${outputPath}`);
  }
}

function postProcessDocx(outputPath) {
  const escapedPath = outputPath.replace(/'/g, "''");
  const powershell = `
$path='${escapedPath}';
Add-Type -AssemblyName System.IO.Compression;
Add-Type -AssemblyName System.IO.Compression.FileSystem;
$zip=[System.IO.Compression.ZipFile]::Open($path,[System.IO.Compression.ZipArchiveMode]::Update);
try {
  # 1) Remove bold style markers from styles.xml
  $styleEntry=$zip.GetEntry('word/styles.xml');
  if ($null -ne $styleEntry) {
    $styleReader=New-Object System.IO.StreamReader($styleEntry.Open());
    $styleXml=$styleReader.ReadToEnd();
    $styleReader.Close();

    $styleXml=[regex]::Replace($styleXml,'<w:b\\b[^>]*/>','');
    $styleXml=[regex]::Replace($styleXml,'<w:bCs\\b[^>]*/>','');
    $styleXml=[regex]::Replace($styleXml,'<w:b\\b[^>]*>.*?</w:b>','');
    $styleXml=[regex]::Replace($styleXml,'<w:bCs\\b[^>]*>.*?</w:bCs>','');

    # 1.1) Style code blocks (SourceCode) with gray background + border box
    $codeBlockBorder='<w:pBdr><w:top w:val="single" w:sz="4" w:space="0" w:color="D0D0D0"/><w:left w:val="single" w:sz="4" w:space="0" w:color="D0D0D0"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="D0D0D0"/><w:right w:val="single" w:sz="4" w:space="0" w:color="D0D0D0"/></w:pBdr>';
    $styleXml=[regex]::Replace(
      $styleXml,
      '<w:style[^>]*w:styleId="SourceCode"[^>]*>[\\s\\S]*?</w:style>',
      {
        param($m)
        $s=$m.Value;
        if ($s -notmatch '<w:pPr>') {
          $s=$s -replace '</w:style>','<w:pPr></w:pPr></w:style>';
        }
        if ($s -notmatch '<w:pBdr>') {
          $s=$s -replace '<w:pPr>',('<w:pPr>' + $codeBlockBorder);
        }
        if ($s -notmatch '<w:shd\\b') {
          $s=$s -replace '<w:pPr>','<w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>';
        } else {
          $s=[regex]::Replace($s,'<w:shd\\b[^>]*/>','<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>');
        }
        return $s;
      }
    );

    # 1.2) Style inline code (VerbatimChar and derived token styles) with gray background
    $styleXml=[regex]::Replace(
      $styleXml,
      '<w:style[^>]*w:styleId="VerbatimChar"[^>]*>[\\s\\S]*?</w:style>',
      {
        param($m)
        $s=$m.Value;
        if ($s -notmatch '<w:rPr>') {
          $s=$s -replace '</w:style>','<w:rPr></w:rPr></w:style>';
        }
        if ($s -notmatch '<w:shd\\b') {
          $s=$s -replace '<w:rPr>','<w:rPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>';
        } else {
          $s=[regex]::Replace($s,'<w:shd\\b[^>]*/>','<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>');
        }
        return $s;
      }
    );

    $styleEntry.Delete();
    $newStyleEntry=$zip.CreateEntry('word/styles.xml');
    $styleWriter=New-Object System.IO.StreamWriter($newStyleEntry.Open());
    $styleWriter.Write($styleXml);
    $styleWriter.Close();
  }

  # 2) Force all table borders visible in document.xml
  $docEntry=$zip.GetEntry('word/document.xml');
  if ($null -ne $docEntry) {
    $docReader=New-Object System.IO.StreamReader($docEntry.Open());
    $docXml=$docReader.ReadToEnd();
    $docReader.Close();

    $tblBorders='<w:tblBorders><w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="8" w:space="0" w:color="000000"/></w:tblBorders>';

    $docXml=[regex]::Replace($docXml,'<w:tblBorders>[\\s\\S]*?</w:tblBorders>',$tblBorders);
    $docXml=[regex]::Replace(
      $docXml,
      '<w:tblPr>([\\s\\S]*?)</w:tblPr>',
      {
        param($m)
        $inner=$m.Groups[1].Value;
        if ($inner -match '<w:tblBorders>') {
          return $m.Value;
        }
        return '<w:tblPr>' + $inner + $tblBorders + '</w:tblPr>';
      }
    );

    $docEntry.Delete();
    $newDocEntry=$zip.CreateEntry('word/document.xml');
    $docWriter=New-Object System.IO.StreamWriter($newDocEntry.Open());
    $docWriter.Write($docXml);
    $docWriter.Close();
  }
}
finally {
  $zip.Dispose();
}
`;

  const result = spawnSync("powershell", ["-NoProfile", "-Command", powershell], {
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || `failed to post-process docx: ${outputPath}`);
  }
}

async function writeStrategyFile() {
  const strategy = `# Word 导出组件转换策略

为保证 Word 文档可读性并保持实现稳定性，导出时采用以下“简化转换”：

1. \`Callout\` -> 转为普通小标题 + 段落（不使用引用样式）。
2. \`Tabs/Tab\` -> 展平为普通小节标题（\`### 选项名\`）。
3. \`Steps/Step\` -> 展平为编号列表。
4. \`Accordions/Accordion\` -> 展平为问答小节标题 + 内容。
5. \`Files/Folder/File\` -> 转为文本树结构代码块。
6. \`Quiz\` -> 提取题干、选项、解析为静态列表（移除交互）。
7. \`mermaid\` 代码块 -> 渲染为 PNG 图片并插入 Word（渲染失败时保留代码块）。
8. Markdown 粗体（\`**文本**\` / \`__文本__\`）-> 转为普通文本。
9. DOCX 样式中的粗体定义会在导出后清理（包括标题样式），保持整体简洁。
10. 代码样式统一设置为灰色底纹；代码块额外添加浅灰边框。
11. 表格统一开启完整边框（外框 + 内横线 + 内竖线）。
12. \`ipynb\` 不参与导出，仅导出理论章节 MDX 内容。
`;

  await fs.writeFile(path.join(OUTPUT_DIR, "README.md"), strategy, "utf8");
}

async function main() {
  const chapters = await collectChapters();
  if (chapters.length !== 20) {
    throw new Error(`期望 20 个理论章节，实际发现 ${chapters.length} 个。`);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(MERMAID_ASSETS_DIR, { recursive: true });
  await writeStrategyFile();

  const manifest = [];
  let mermaidTotal = 0;
  let mermaidRendered = 0;
  let mermaidFailed = 0;

  for (let i = 0; i < chapters.length; i += 1) {
    const chapter = chapters[i];
    const sourceRaw = await fs.readFile(chapter.sourcePath, "utf8");
    const { title, body } = parseFrontmatter(sourceRaw);
    const chapterTitle = title || `${chapter.moduleName}/${chapter.page}`;
    const chapterPrefix = `${chapter.moduleIndex}.${chapter.chapterIndex}`;
    const chapterKey = `${chapter.moduleIndex}_${chapter.chapterIndex}-${chapter.moduleName}-${chapter.page}`
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_");
    const conversion = await mdxToWordMarkdown(body, chapterTitle, chapterKey);
    const markdown = conversion.markdown;
    mermaidTotal += conversion.mermaid.count;
    mermaidRendered += conversion.mermaid.rendered;
    mermaidFailed += conversion.mermaid.failed;
    const fileBase = `${chapterPrefix}-${sanitizeFileName(chapterTitle)}`;
    const outputPath = path.join(OUTPUT_DIR, `${fileBase}.docx`);
    const debugMdPath = path.join(OUTPUT_DIR, `${fileBase}.md`);

    runPandoc(markdown, outputPath);
    postProcessDocx(outputPath);
    if (process.env.EXPORT_WORD_DEBUG_MD === "1") {
      await fs.writeFile(debugMdPath, markdown, "utf8");
    }

    manifest.push({
      index: i + 1,
      chapterPrefix,
      title: chapterTitle,
      source: path.relative(ROOT, chapter.sourcePath),
      output: path.relative(ROOT, outputPath),
    });
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Export complete: ${manifest.length} files -> ${path.relative(ROOT, OUTPUT_DIR)} | Mermaid: ${mermaidRendered}/${mermaidTotal} rendered, ${mermaidFailed} failed`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
