import { render, screen, fireEvent } from "@testing-library/react";
import Pricing from "../../src/components/pricing/Pricing";
import { BUTTON_TEXT, PRICING } from "../../src/utils/Constants";
import "@testing-library/jest-dom";
import { expect, describe, it, vi } from "vitest";

const openCloseAuthModal = vi.fn();

const getPriceParts = (plan) => ({
  price: plan.pricing === 0 ? "Free" : `$${plan.pricing}`,
  period:
    plan.pricing === 0
      ? "forever"
      : plan.tagline.replace(`$${plan.pricing} `, ""),
});

describe("Pricing Component", () => {
  it("renders Pricing component with heading and summary", () => {
    render(<Pricing openAuthModal={openCloseAuthModal} />);

    const pricing = screen.getByTestId("pricing");
    const pricing_heading = screen.getByText(PRICING.heading);
    const pricing_summary = screen.getByText(PRICING.summary);

    expect(pricing).toBeInTheDocument();
    expect(pricing_heading).toBeInTheDocument();
    expect(pricing_summary).toBeInTheDocument();
  });

  it("renders correct number of PricingCard components", () => {
    render(<Pricing openAuthModal={openCloseAuthModal} />);

    PRICING.plans.forEach((plan) => {
      const titleElement = screen.getByText(plan.name);
      expect(titleElement).toBeInTheDocument();

      if (plan.index === 1) {
        // PRO card shows placeholders, no real price/period/keypoints
        expect(screen.getByText("Coming Soon")).toBeInTheDocument();
        expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
      } else {
        const { price, period } = getPriceParts(plan);
        expect(screen.getByText(price)).toBeInTheDocument();
        expect(screen.getByText(period)).toBeInTheDocument();
        plan.keypoints.forEach((keypoint) => {
          const plan_keypoint = screen.getByText(keypoint);
          expect(plan_keypoint).toBeInTheDocument();
        });
      }
    });
  });

  it("Openmodal function is called", () => {
    render(<Pricing openAuthModal={openCloseAuthModal} />);

    const getStartedButton = screen.getByText(BUTTON_TEXT.getStarted);
    fireEvent.click(getStartedButton);
    expect(openCloseAuthModal).toHaveBeenCalled();
  });
});
