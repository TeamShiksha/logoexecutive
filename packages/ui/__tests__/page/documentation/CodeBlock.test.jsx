import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CodeBlock from "../../../src/page/documentation/CodeBlock";
import { CODEBLOCK } from "../../../src/utils/Constants";
import { useState } from "react";
import PropTypes from "prop-types";

const mockCodeExamples = {
  javascript: "const a = 1;\nconsole.log(a);",
  python: "print('Hello, Python!')",
  java: "System.out.println('Hello, Java!');",
};

const CodeBlockTestComponent = ({ initial = "javascript" }) => {
  const [lang, setLang] = useState(initial);
  return (
    <CodeBlock
      id="test"
      codeExamples={mockCodeExamples}
      selectedLanguage={lang}
      setSelectedLanguage={setLang}
    />
  );
};

CodeBlockTestComponent.propTypes = {
  initial: PropTypes.string,
};

describe("CodeBlock component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("Defaults to JavaScript on initial render", () => {
    render(<CodeBlockTestComponent />);

    expect(screen.getByText("const a = 1;")).toBeInTheDocument();
    expect(screen.getByText("console.log(a);")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("Copies code to clipboard and shows copied feedback", async () => {
    const clipboardSpy = vi.spyOn(navigator.clipboard, "writeText");
    render(<CodeBlockTestComponent />);

    const copyButton = screen.getByRole("button", { name: /copy/i });
    const copyIcon = screen.getByRole("img", { name: /tick-copy-code/i });

    expect(copyIcon.src).toContain(CODEBLOCK.copycodeicon);
    fireEvent.click(copyButton);

    expect(clipboardSpy).toHaveBeenCalledWith(mockCodeExamples.javascript);

    await waitFor(() => {
      const tickIcon = screen.getByRole("img", { name: /tick-copy-code/i });
      expect(tickIcon.src).toContain(CODEBLOCK.tick);
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("Changes displayed code when clicking on language icon", () => {
    render(<CodeBlockTestComponent />);

    const pythonButton = screen.getByRole("button", { name: /python logo/i });
    fireEvent.click(pythonButton);
    const pythonCode = screen.getByText(mockCodeExamples.python);
    expect(pythonCode).toBeInTheDocument();

    const javaButton = screen.getByRole("button", { name: /java logo/i });
    fireEvent.click(javaButton);
    const javaCode = screen.getByText(mockCodeExamples.java);
    expect(javaCode).toBeInTheDocument();
  });

  it("Renders buttons for all available languages", () => {
    render(<CodeBlockTestComponent />);

    Object.keys(mockCodeExamples).forEach((lang) => {
      const button = screen.getByRole("button", {
        name: new RegExp(`${lang} logo`, "i"),
      });
      expect(button).toBeInTheDocument();
    });
  });
});
