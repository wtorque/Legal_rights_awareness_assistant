import type { EmergencyContact } from "@/types/emergency";

/**
 * Numbers only appear here if an official Government of India page or press release states them
 * (checked 2026-10-31). 112 is the pan-India emergency number covering police, fire and medical help;
 * a separate police number is deliberately not listed because it was not verified.
 * Rollout and call routing differ by State or UT, which each note says where the source says so.
 */
export const emergencyContacts: EmergencyContact[] = [
  {
    id: "in-112",
    category: "emergency",
    name: "Emergency response (police, fire, medical)",
    number: "112",
    description: "India's single emergency number under the Emergency Response Support System. Use it if someone is in danger now.",
    note: "Rollout was reported as operational in 28 States and UTs in 2020. If it does not connect, try your local police.",
    officialUrl: "https://112.gov.in/",
    verification: { checkedOn: "2026-10-31", source: "112.gov.in and PIB press releases describe 112 as the single emergency number for police, fire, health and disaster services." },
  },
  {
    id: "in-181",
    category: "women",
    name: "Women Helpline",
    number: "181",
    description: "National helpline for women affected by violence, run through State departments.",
    note: "A second number, 1091, is listed in official ERSS material as a women-in-distress line. Availability and who answers differ by State.",
    officialUrl: "https://www.myscheme.gov.in/schemes/whl-181",
    verification: { checkedOn: "2026-10-31", source: "Ministry of Women and Child Development scheme listing on myScheme; PIB ERSS material names 181 and 1091." },
  },
  {
    id: "in-1091",
    category: "women",
    name: "Women in distress (police)",
    number: "1091",
    description: "Women's distress line named in official ERSS-112 integration plans.",
    note: "Older and mixed sources. If it does not connect, call 112 or 181.",
    officialUrl: "https://112.gov.in/",
    verification: { checkedOn: "2026-10-31", source: "PIB description of ERSS-112 lists women helplines 1091 and 181 for integration." },
  },
  {
    id: "in-1098",
    category: "child",
    name: "Child Helpline (CHILDLINE)",
    number: "1098",
    description: "Free 24-hour helpline for children in need of care or protection.",
    note: "Calls are moving to State and district control rooms under Mission Vatsalya and linking to 112 for emergencies.",
    officialUrl: "https://wcd.gov.in/",
    verification: { checkedOn: "2026-10-31", source: "wcd.gov.in lists Child Helpline 1098; PIB release describes its integration with ERSS-112." },
  },
  {
    id: "in-1930",
    category: "cyber",
    name: "Cyber crime helpline (financial fraud)",
    number: "1930",
    description: "Report online financial fraud quickly, ideally within hours, so the transfer can be frozen. Then complete the complaint on the national portal.",
    note: "Fraud that is not financial is reported on the portal. The helpline was earlier 155260.",
    officialUrl: "https://cybercrime.gov.in/",
    verification: { checkedOn: "2026-10-31", source: "I4C (Ministry of Home Affairs) and PIB state 1930 as the toll-free helpline for financial cyber fraud in all States and UTs." },
  },
  {
    id: "in-15100",
    category: "legal-aid",
    name: "NALSA legal aid helpline",
    number: "15100",
    description: "Toll-free helpline of the National Legal Services Authority for information on free legal aid.",
    note: null,
    officialUrl: "https://nalsa.gov.in/",
    verification: { checkedOn: "2026-10-31", source: "nalsa.gov.in homepage shows “NALSA Helpline Toll-Free Number 15100”." },
  },
];
