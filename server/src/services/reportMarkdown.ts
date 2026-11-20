import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: false, linkify: true });
type Token = ReturnType<typeof markdown.parse>[number];
const ink = "#17201b";
const linkColor = "#255847";
const bodySize = 10.5;

type Span = { text: string; font: string; link: string | null };

function inline(tokens: Token[]): Span[] {
  let bold = 0;
  let italic = 0;
  let link: string | null = null;
  const spans: Span[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "strong_open": bold += 1; break;
      case "strong_close": bold -= 1; break;
      case "em_open": italic += 1; break;
      case "em_close": italic -= 1; break;
      case "link_open": {
        const href = token.attrGet("href");
        link = typeof href === "string" && /^https?:\/\//i.test(href) && URL.canParse(href) ? href : null;
        break;
      }
      case "link_close": link = null; break;
      case "text":
      case "code_inline":
      case "image":
      case "softbreak":
      case "hardbreak": {
        const text = token.type.endsWith("break") ? "\n" : token.content;
        if (text) spans.push({
          text,
          font: bold ? (italic ? "boldItalic" : "bold") : (italic ? "italic" : "regular"),
          link,
        });
        break;
      }
    }
  }
  return spans;
}

function writeInline(document: PDFKit.PDFDocument, spans: Span[], x: number, size: number, heading: boolean) {
  const width = document.page.width - document.page.margins.right - x;
  document.x = x;
  spans.forEach((span, index) => {
    document.font(heading ? "bold" : span.font).fontSize(size)
      .fillColor(span.link ? linkColor : ink)
      .text(span.text, {
        width,
        continued: index < spans.length - 1,
        lineGap: 3,
        link: span.link,
        underline: Boolean(span.link),
      });
  });
  document.x = document.page.margins.left;
}

function writeTable(document: PDFKit.PDFDocument, tokens: Token[]) {
  const rows: Span[][][] = [];
  for (const token of tokens) {
    if (token.type === "tr_open") rows.push([]);
    if (token.type === "inline") rows.at(-1)?.push(inline(token.children ?? []));
  }
  const columns = rows[0]?.map(cell => cell.map(span => span.text).join("")) ?? [];
  const ledger = columns.length === 4 && columns[1] === "Source";
  const metrics = columns.length === 3 && ["Score", "Value"].includes(columns[1] ?? "");
  const width = document.page.width - document.page.margins.left - document.page.margins.right;
  const fractions = ledger ? [0.25, 0.16, 0.45, 0.14] : metrics ? [0.34, 0.14, 0.52] : columns.map(() => 1 / columns.length);
  const widths = fractions.map(fraction => fraction * width);
  const cells = rows.map((row, index) => row.map(spans => {
    const text = spans.map(span => span.text).join("");
    const links = new Set(spans.flatMap(span => span.link ? [span.link] : []));
    const href = links.size === 1 ? links.values().next().value : undefined;
    const label = href === text ? new URL(href).hostname : text;
    return {
      text: label,
      backgroundColor: index === 0 ? "#e4ede7" : index % 2 === 0 ? "#f5f8f6" : "#ffffff",
      font: { src: index === 0 ? "bold" : "regular", size: 9 },
      ...(href ? { textColor: linkColor, textOptions: { link: href, underline: true } } : {}),
    };
  }));
  const header = cells[0];
  if (!header?.length) return;
  if (cells.length === 1) {
    writeInline(document, [{ text: columns.join(" · "), font: "bold", link: null }], document.x, 9, false);
    document.moveDown(0.7);
    return;
  }
  const height = (row: typeof header) => Math.max(0, ...row.map((cell, index) =>
    document.font(cell.font.src).fontSize(9).heightOfString(cell.text, { width: Math.max(1, (widths[index] ?? width) - 14) })
  )) + 14;
  const headerHeight = height(header);
  let table: PDFKit.Mixins.PDFTableObject | undefined;
  for (const [index, row] of cells.slice(1).entries()) {
    const rowHeight = height(row);
    const pageHeight = document.page.maxY() - document.page.margins.top;
    const original = rows[index + 1]!;
    const mixedLinks = original.some(spans => new Set(spans.map(span => span.link).filter(Boolean)).size > 1);
    if (mixedLinks || widths.some(columnWidth => columnWidth < 32) || headerHeight + rowHeight + 4 > pageHeight) {
      // PDFKit clips cells that exceed a page, so give oversized rows normal paragraph flow.
      table?.end();
      table = undefined;
      original.forEach((spans, columnIndex) => {
        writeInline(document, [
          { text: `${columns[columnIndex]}: `, font: "bold", link: null },
          ...spans,
        ], document.page.margins.left, 9, false);
      });
      document.moveDown(0.5);
      continue;
    }
    const needed = rowHeight + (table ? 0 : headerHeight);
    if (document.y + needed + 4 > document.page.maxY()) {
      table?.end();
      table = undefined;
      document.addPage();
    }
    if (!table) {
      table = document.table({
        columnStyles: widths,
        defaultStyle: { padding: 7, border: 0.5, borderColor: "#d5ded8", textColor: ink },
      });
      table.row(header);
    }
    table.row(row);
  }
  table?.end();
  document.moveDown(0.7);
}

export function writeReportMarkdown(document: PDFKit.PDFDocument, content: string) {
  const tokens = markdown.parse(content, {});
  const lists: (number | null)[] = [];
  let prefix = "";
  let quoteDepth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    const margin = document.page.margins.left;
    switch (token.type) {
      case "table_open": {
        const end = tokens.findIndex((item, position) => position > index && item.type === "table_close");
        writeTable(document, tokens.slice(index + 1, end));
        index = end;
        break;
      }
      case "blockquote_open": quoteDepth += 1; break;
      case "blockquote_close": quoteDepth -= 1; break;
      case "bullet_list_open": lists.push(null); break;
      case "ordered_list_open": lists.push(Number(token.attrGet("start") ?? 1)); break;
      case "bullet_list_close":
      case "ordered_list_close": lists.pop(); break;
      case "list_item_open": {
        const number = lists.at(-1);
        prefix = number == null ? "•  " : `${number}.  `;
        if (number != null) lists[lists.length - 1] = number + 1;
        break;
      }
      case "inline": {
        const parent = tokens[index - 1];
        const heading = parent?.type === "heading_open";
        const size = heading ? ({ h1: 19, h2: 15, h3: 12 }[parent.tag] ?? 11) : bodySize;
        const spans = inline(token.children ?? []);
        if (prefix) {
          spans.unshift({ text: prefix, font: "regular", link: null });
          prefix = "";
        }
        if (!spans.length) break;
        if (heading) {
          document.font("bold").fontSize(size);
          const headingHeight = document.heightOfString(spans.map(span => span.text).join(""));
          if (document.y + headingHeight + 32 > document.page.maxY()) document.addPage();
          document.moveDown(0.35);
        }
        writeInline(document, spans, margin + 12 * Math.min(lists.length + quoteDepth, 8), size, heading);
        document.moveDown(lists.length ? 0.18 : 0.5);
        break;
      }
      case "fence":
      case "code_block":
        document.font("regular").fontSize(9).fillColor(ink).text(token.content.trimEnd(), { lineGap: 2 }).moveDown(0.5);
        break;
    }
  }
}
