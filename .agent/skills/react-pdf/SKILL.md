---
name: react-pdf
description: Comprehensive guide to creating PDF documents in React using @react-pdf/renderer. Covers core components, styling API, flexbox layout, page wrapping, dynamic content, and on-the-fly client-side downloading with hooks.
---

# React-PDF (renderer) — Complete Guide

`@react-pdf/renderer` is a library for creating PDF files on the browser and server using React. It provides a set of layout primitives that mirror React Native (View, Text, Image) and uses Yoga for Flexbox layout.

> **Note:** This is for _generating_ PDFs from React. If you want to _display_ an existing PDF file, you should use `react-pdf` (the viewer library), not `@react-pdf/renderer`.

---

## 1. Installation

```bash
bun add @react-pdf/renderer
# or
yarn add @react-pdf/renderer
# or
pnpm add @react-pdf/renderer
```

---

## 2. Core Components

React-PDF relies on specific primitives. You **cannot** use standard DOM elements like `<div>`, `<span>`, or `<p>`.

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  Note,
} from "@react-pdf/renderer";
```

### Components Reference

| Component      | Description                                                               | Rules                                           |
| -------------- | ------------------------------------------------------------------------- | ----------------------------------------------- |
| `<Document />` | The root of the PDF document.                                             | Only accepts `<Page />` components as children. |
| `<Page />`     | Represents a single page (or sequence of pages if content wraps).         | Must be a direct child of `<Document />`.       |
| `<View />`     | The fundamental container, similar to `<div>` or React Native's `<View>`. | Excellent for Flexbox layouts.                  |
| `<Text />`     | Displays text content.                                                    | All strings must be wrapped in a `<Text>` node. |
| `<Image />`    | Displays an image (network URL, base64, buffer, or local path).           | -                                               |
| `<Link />`     | Create hyperlinks (internal or external).                                 | Can be nested inside `<Text>`.                  |
| `<Note />`     | Displays a PDF note annotation.                                           | -                                               |
| `<Canvas />`   | Freely draw using pdfkit methods.                                         | Must have explicit width/height in `style`.     |

### Basic Example

```tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

export const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
      </View>
      <View style={styles.section}>
        <Text>Section #2</Text>
      </View>
    </Page>
  </Document>
);
```

---

## 3. Styling

Styling is achieved using a subset of CSS, translated to PDF layout via the Yoga layout engine.

### `StyleSheet.create()`

The recommended way to define styles. Returns an object of immutable style mappings.

```tsx
const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    color: "tomato",
    marginBottom: 10,
    textAlign: "center",
  },
});

// Usage
<Text style={styles.heading}>Welcome to the Report</Text>;
```

### Mixing Styles (Arrays)

Similar to React Native, you can pass an array to the `style` prop to combine styles or override them conditionally.

```tsx
<View style={[styles.card, isActive && styles.cardActive, { marginTop: 20 }]}>
  <Text>Dynamic styles applied</Text>
</View>
```

### Valid CSS Properties

React-PDF supports a robust subset of CSS:

- **Flexbox:** `flexDirection`, `justifyContent`, `alignItems`, `flexWrap`, `flexGrow`, `gap`, `rowGap`, `columnGap`
- **Box Model:** `margin`, `padding`, `width`, `height`, `minWidth`, `maxHeight`
- **Typography:** `color`, `fontSize`, `fontFamily`, `lineHeight`, `textAlign`, `textDecoration`, `letterSpacing`, `textTransform`
- **Borders:** `border`, `borderRadius`, `borderColor`, `borderWidth`
- **Positioning:** `position` (`absolute`, `relative`), `top`, `bottom`, `left`, `right`, `zIndex`
- **Transformations:** `transform: rotate`, `scale`, `translate`, `transformOrigin`

### Valid Units

- `pt` (Default. Based on 72 dpi)
- `in` (Inches)
- `mm` (Millimeters)
- `cm` (Centimeters)
- `%` (Percentage of parent block)
- `vw` / `vh` (Viewport / Page width or height)

### Media Queries

React-PDF supports media queries directly in the StyleSheet definition!

```tsx
const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    "@media max-width: 400": {
      width: 300,
    },
    "@media orientation: landscape": {
      width: 400,
    },
  },
});
```

---

## 4. Page Layout and Wrapping

By default, React-PDF enables automatic page wrapping. When content exceeds the bounds of a page, it automatically creates a new page and continues rendering.

### Breakable vs. Unbreakable

- **Breakable:** `<View>`, `<Text>`, `<Link>`. They will split across pages if needed.
- **Unbreakable:** `<Image>`. If there isn't enough space at the bottom of the page, the whole image moves to the next page.

### Controlling Page Breaks

```tsx
// 1. Disable wrapping for the whole page
<Page wrap={false}>...</Page>

// 2. Prevent a specific block from splitting across pages
<View wrap={false}>...</View>

// 3. Force a hard page break before this element
<View break>...</View>

// 4. Fixed elements (Repeat on EVERY page — e.g., Headers/Footers)
<View fixed style={styles.footer}>
  <Text render={({ pageNumber, totalPages }) => (
    `${pageNumber} / ${totalPages}`
  )} />
</View>
```

---

## 5. Rendering in the Browser (Web Only)

If you are using React on the web, there are three primary ways to handle the generated document.

### A. `<PDFDownloadLink />` — Provide a download button

Generates the PDF in the background and provides an anchor tag for the user to download it.

```tsx
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyDocument } from "./MyDocument";

const App = () => (
  <PDFDownloadLink document={<MyDocument />} fileName="invoice.pdf">
    {({ blob, url, loading, error }) =>
      loading ? "Preparing document..." : "Download Invoice"
    }
  </PDFDownloadLink>
);
```

### B. `<PDFViewer />` — Display inline in an iFrame

Embeds the generated PDF directly inside the UI.

```tsx
import { PDFViewer } from "@react-pdf/renderer";

const App = () => (
  // Must provide explicit width/height
  <PDFViewer width="100%" height={800}>
    <MyDocument />
  </PDFViewer>
);
```

### C. `usePDF` Hook — Fine-grained control

Get direct object access to the generated blob/url for custom integrations (e.g. uploading the blob directly to an API, or triggering the download manually with a custom `<button>`).

```tsx
import { usePDF } from "@react-pdf/renderer";
import { MyDocument } from "./MyDocument";

const App = () => {
  const [instance, updateInstance] = usePDF({ document: <MyDocument /> });

  if (instance.loading) return <div>Rendering...</div>;

  return (
    <>
      <a href={instance.url} download="report.pdf">
        Download
      </a>

      {/* Or manually trigger a re-render if props/data changed */}
      <button onClick={updateInstance}>Refresh PDF</button>
    </>
  );
};
```

---

## 6. Custom Fonts

React-PDF comes with standard fonts (Helvetica, Times, Courier), but you'll almost always want to load custom fonts for your layout.

```tsx
import { Font } from "@react-pdf/renderer";

// Register font family
Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

// Or register multiple weights
Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/Roboto-Italic.ttf", fontStyle: "italic" },
  ],
});

// Usage
const styles = StyleSheet.create({
  title: {
    fontFamily: "Oswald",
  },
});
```

> **Important:** Network fonts via URL must include proper CORS headers if fetching cross-origin.

---

## 7. Dynamic Content (Page Numbers)

Use the `render` prop pattern on `<Text>` to evaluate context-aware variables like page numbers.

```tsx
const Footer = () => (
  <Text
    style={styles.pageNumber}
    render={({ pageNumber, totalPages }) =>
      `Page ${pageNumber} of ${totalPages}`
    }
    fixed
  />
);
```

---

## 8. Common Gotchas & Troubleshooting

1. **"Text is cut off" or "Text doesn't wrap":** Make sure nothing is using absolute sizing incorrectly. Text automatically wraps in Flexbox contexts, but long unbroken strings might need `hyphenationCallback` customized if overflowing.
2. **Missing string inside Text error:** `Error: Text children must be strings...` — Ensure you aren't doing `{value && <Text>{value}</Text>}`, which sometimes passes boolean `false` as a child node. Use `{value ? <Text>{value}</Text> : null}`.
3. **Invalid DOM element error:** You placed a `<div>` inside your `<Document>`. Remove all HTML tags and use `<View>`, `<Text>`, etc.
4. **CORS issues with `<Image>`:** If loading images from an external server (like AWS S3 or Unsplash), the server must reply with open CORS headers, otherwise the browser will block the Canvas API from rendering it into the PDF blob.
5. **Slow rendering on the web:** Moving generation to a Web Worker is possible but complicated. Consider using `usePDF` carefully to avoid re-triggering generation on every keystroke if the document data depends on a form.
