import type { PolicyDoc } from "../lib/retrieval";

/** Fictional policies for the retrieval lab. Dates and permissions are part of the simulation. */
export const policyCorpus: PolicyDoc[] = [
  {
    id: "travel-2023",
    title: "Travel policy 2023",
    date: "2023-04-01",
    roles: ["all"],
    text: "Employees may book economy flights only. Manager approval is required above 20000 rupees. Hotel stays are capped at 5000 rupees per night. Receipts are submitted within 30 days.",
  },
  {
    id: "travel-2025",
    title: "Travel policy 2025",
    date: "2025-11-12",
    roles: ["all"],
    text: "Employees may book economy flights. Manager approval is required above 35000 rupees. Hotel stays are capped at 8000 rupees per night in metro cities and 6000 elsewhere. International travel needs director approval. Receipts are submitted within 15 days.",
  },
  {
    id: "leave",
    title: "Leave policy",
    date: "2025-06-01",
    roles: ["all"],
    text: "Annual leave is 18 days. Sick leave is 12 days and requires a note after two consecutive days. Parental leave follows the statutory minimum plus four weeks of paid company leave.",
  },
  {
    id: "laptop",
    title: "Device standard",
    date: "2026-01-20",
    roles: ["all"],
    text: "Standard laptops are replaced every four years. Exceptions for video editing teams require IT manager approval. Personal USB storage is not permitted on client networks.",
  },
  {
    id: "salary-bands",
    title: "Confidential salary bands",
    date: "2026-02-01",
    roles: ["hr", "finance-lead"],
    text: "Band L4 ranges from 28 to 36 lakh rupees. Band L5 ranges from 38 to 52 lakh rupees. Offers above the band need CFO approval. Do not share bands with client staff.",
  },
  {
    id: "client-data",
    title: "Client data handling",
    date: "2025-09-18",
    roles: ["delivery", "security"],
    text: "Client contracts marked restricted must not be pasted into external AI tools. Use the approved enterprise workspace. Retain prompts that contain client data for 30 days unless the contract says otherwise.",
  },
  {
    id: "ai-use",
    title: "Approved AI use",
    date: "2026-03-02",
    roles: ["all"],
    text: "Staff may use the company Claude workspace for drafting and summarising internal documents. Customer-identifiable data requires the workflow owner to confirm the use case is registered. AI output is a draft until a human reviews it.",
  },
  {
    id: "security-incident",
    title: "Security incident notice",
    date: "2024-12-01",
    roles: ["security"],
    text: "The 2024 vendor token leak was closed. Rotated keys are stored in the security vault. This notice is historical and should not be treated as the current control list.",
  },
];

export const retrievalQueries = [
  {
    id: "hotel",
    label: "Current hotel cap",
    query: "What is the hotel stay cap for metro cities?",
    hint: "A current public policy should answer. An old travel policy is a stale trap.",
  },
  {
    id: "salary",
    label: "Salary band",
    query: "What is the L5 salary band?",
    hint: "The only matching document is restricted to HR and finance leads.",
  },
  {
    id: "usb",
    label: "Weak overlap",
    query: "May contractors bring personal cameras to the office party?",
    hint: "No policy directly answers. A lexical hit on nearby device words is not evidence.",
  },
  {
    id: "ai",
    label: "AI draft rule",
    query: "Can staff send AI output to a customer without review?",
    hint: "The approved AI policy says output is a draft until a human reviews it.",
  },
];
