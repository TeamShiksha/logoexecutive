import { expect, describe, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Documentation from "../../../src/page/documentation/Documentation";
import { DOCUMENTATION } from "../../../src/utils/Constants";
import { BrowserRouter } from "react-router-dom";
import { getBaseApiUrl } from "../../../src/utils/Helpers";
import { ToastProvider } from "../../../src/contexts/ToastContext";

describe("Documentation Component", () => {
  it("renders the introduction heading, text, and base URL", () => {
    render(
      <BrowserRouter>
        <Documentation />
      </BrowserRouter>
    );

    const heading = screen.getByText(DOCUMENTATION.introduction.heading);
    const text = screen.getByText(DOCUMENTATION.introduction.text);
    const baseUrl = screen.getByText(DOCUMENTATION.localUrl);
    const notice = screen.getByText(/We've recently updated our search/);

    expect(heading).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(baseUrl).toBeInTheDocument();
    expect(notice).toBeInTheDocument();
  });

  it("returns correct BASE API URL for different environments", () => {
    expect(getBaseApiUrl("http://localhost:3000")).toBe(DOCUMENTATION.localUrl);
    expect(getBaseApiUrl("https://stage-openlogo.vercel.app")).toBe(
      DOCUMENTATION.baseStageUrl
    );
    expect(getBaseApiUrl("https://openlogo.fyi")).toBe(
      DOCUMENTATION.baseProdUrl
    );
  });

  it("renders all API features with headings, descriptions, and endpoints", () => {
    render(
      <BrowserRouter>
        <Documentation />
      </BrowserRouter>
    );

    DOCUMENTATION.apiDocs.forEach((feature) => {
      const featureHeading = screen.getByText(feature.heading);
      const featureText = screen.getByText(feature.text);
      const endpointText = screen.getByText(feature.endPoint);

      expect(featureHeading).toBeInTheDocument();
      expect(featureText).toBeInTheDocument();
      expect(endpointText).toBeInTheDocument();
    });

    const responseHeaders = screen.getAllByText("JSON RESPONSE");
    expect(responseHeaders).toHaveLength(DOCUMENTATION.apiDocs.length);
  });

  it("displays and closes the contact form modal when clicking 'contact us'", () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <Documentation />
        </ToastProvider>
      </BrowserRouter>
    );

    const contactUsLink = screen.getByText("contact us");
    expect(contactUsLink).toBeInTheDocument();
    fireEvent.click(contactUsLink);

    const closeModalButton = screen.getByText("×");
    expect(closeModalButton).toBeInTheDocument();
    fireEvent.click(closeModalButton);
    expect(closeModalButton).not.toBeInTheDocument();
  });
});
