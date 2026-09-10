# Medikiosk UI Color Palette

This document outlines the accessibility-first color palette for the hospital medikiosk interface, designed to prioritize clarity, trust, and usability under varying lighting conditions.

## Primary Palette

| Visual Sample | Role | Hex Code | Purpose & Psychology |
| :---: | :--- | :--- | :--- |
| <img src="https://placehold.co/120x60/0056B3/0056B3.png" width="120" height="60" alt="Clinical Blue" /> | **Primary Base** | `#0056B3` | Instills trust and reliability. Ideal for headers and primary navigation. |
| <img src="https://placehold.co/120x60/17A2B8/17A2B8.png" width="120" height="60" alt="Calming Teal" /> | **Secondary Accent** | `#17A2B8` | Softens the interface, helping to reduce patient anxiety. |
| <img src="https://placehold.co/120x60/F8F9FA/F8F9FA.png" width="120" height="60" style="border: 1px solid #ccc;" alt="Off-White/Gray" /> | **Background** | `#F8F9FA` | Minimizes screen glare (pure white `#FFFFFF` can cause eye strain). |
| <img src="https://placehold.co/120x60/2C3E50/2C3E50.png" width="120" height="60" alt="Deep Charcoal" /> | **Primary Text** | `#2C3E50` | Ensures high-contrast readability; softer on the eyes than pure black. |

## Semantic Action Colors

| Visual Sample | Role | Hex Code | Usage |
| :---: | :--- | :--- | :--- |
| <img src="https://placehold.co/120x60/28A745/28A745.png" width="120" height="60" alt="Success Green" /> | **Success / Proceed** | `#28A745` | Vibrant green for primary actions (Check-In, Confirm, Print). |
| <img src="https://placehold.co/120x60/DC3545/DC3545.png" width="120" height="60" alt="Warning Red" /> | **Warning / Help** | `#DC3545` | Distinct red for critical errors, "Cancel," or "Call for Assistance". |
| <img src="https://placehold.co/120x60/E9ECEF/E9ECEF.png" width="120" height="60" style="border: 1px solid #ccc;" alt="Disabled Gray" /> | **Disabled State** | `#E9ECEF` | Flat, muted gray for inactive buttons to prevent frustrated tapping. |

## Implementation Notes
* **Contrast Compliance:** Ensure text-to-background contrast ratio meets WCAG AAA standards (at least 7:1 for normal text).
* **Color Blindness Accessibility:** Do not rely on color alone; always pair semantic colors with clear icons (e.g., checkmarks, warning triangles).
* **Touch Targets:** Make sure all interactive elements are large enough for users with limited motor skills.
