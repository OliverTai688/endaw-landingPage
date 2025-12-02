export const products = [
  // 產品一 ─────────────────────────────────────────────
  {
    id: "tributary-pebble-5",
    name: "Tributary Pebble 5",
    slogan: "Small board, ready for the big stage",
    price: "$129 USD",

images: [
  "/products/pebble5/01_pebble5.webp",
  "/products/pebble5/02_pebble5.webp",
  "/products/pebble5/03_pebble5.webp",
  "/products/pebble5/04_pebble5.webp",
  "/products/pebble5/05_pebble5.webp",
  "/products/pebble5/06_pebble5.webp",
  "/products/pebble5/07_pebble5.webp",
  "/products/pebble5/08_pebble5.webp",
  "/products/pebble5/09_pebble5.webp",
  "/products/pebble5/10_pebble5.webp",
  "/products/pebble5/11_pebble5.webp",
  "/products/pebble5/12_pebble5.webp",
  "/products/pebble5/13_pebble5.webp",
  "/products/pebble5/14_pebble5.webp",
  "/products/pebble5/15_pebble5.webp",
  "/products/pebble5/16_pebble5.webp",
  "/products/pebble5/17_pebble5.webp",
  "/products/pebble5/18_pebble5.webp",
  "/products/pebble5/19_pebble5.webp",
],


    shortDescription: "Incredible Size. Incredible Tone. Your perfect small pedalboard.",

    description: `
What every guitarist really needs is a small board.
It is true that we always think about getting another pedal. Guitar players never stop exploring a new tone. But as we all know, it is often pointless to bring along every single pedal. Similar effects, which are hardly used, put together only contributes to more signal loss.

If 15 or even 20 pedals are what you need for a gig, then by all means use a large board. But what about other occasions? What you need is the perfect small board.

Incredible Size. Incredible Tone.
Less is more. Start with Pebble-5.
`,

    variants: {
      colors: ["Green", "Purple", "Silver-Gray"],
      kits: ["Valcro", "Power-Gray"],
    },

    specs: [
      "Swift — Unique grip allows for one-hand carrying",
      "Anodized sandblasted aluminum (Green/Purple finish)",
      "Socket for smart phones and tablets",
      "SLIP-CLIP system — DC/Patch cables run underneath tracks; adjustable for neat cable management",
      "Soft case — Three carrying modes (Vertical / Horizontal / Backpack)",
      "Soft case includes 3+1 pockets + waterproof cover",
      "SLIP-CLIP x 5",
      "Foot pad x 4",
      "Anti-slip pads for phone socket",
      "Size (board only): 440mm × 130mm × 17mm",
      "Size (with grip): 514mm × 130mm × 185mm",
      "Dry Weight: 0.85 kg",
    ],
  },

  // 產品二 ─────────────────────────────────────────────
  {
    id: "slip-clip-pebble5",
    name: "Slip-Clip™ for Pebble 5",
    slogan: "Incredible little boxes with two features. Space-saving and versatile.",
    price: "$9 USD",

    images: [
      "/products/slipclip/01.jpeg",
      "/products/slipclip/02.jpeg",
      "/products/slipclip/03.jpeg",
    ],

    shortDescription: "5 pieces a set. The perfect way to organize and secure your cables.",

    description: `
SLIP-CLIP — a system that makes life just a little better.

You probably already know that DC cables and patch cables usually run underneath the board. Yet loose and unfixed cables can cause trouble — come off, or even short-circuit.

The new SLIP-CLIP system secures your cables and is easy to remove, slide, and adjust.
`,

    specs: [
      "5 pieces a set",
      "Specialized openings allow up to two DC cables (or one patch cable)",
      "Operate with one finger",
      "Slide left or right to fit your cable layout needs",
    ],
  },

  // 產品三 ─────────────────────────────────────────────
  {
    id: "jo-one",
    name: "JO-ONE",
    slogan: "Always reliable as the first pedal onboard",
    price: "$119 USD",

    images: [
      "/products/jo_one/Jo_one01.jpeg",
      "/products/jo_one/Jo_one02.jpeg",
      "/products/jo_one/Jo_one03.jpeg",
      "/products/jo_one/Jo_one04.jpeg",
    ],

    shortDescription: "Patchbay / Buffer / Booster all in one — only 3 × 9 cm.",

    description: `
Patchbay, Buffer, and Booster — all in one tiny 3 × 9 cm box.

Disappointed at your tone when using pedalboards with long un-buffered cable runs? Suffering signal loss? JO-ONE maintains the highest fidelity of your audio signal, minimizing loss while also providing a clean booster for volume adjustment.

How to use:
Connect guitar to JO-ONE’s "in/send" → first pedal → return from last pedal to JO-ONE → "out" to amp input.
`,

    specs: [
      "Acts as I/O interface — quick setup",
      "Buffer eliminates signal loss, preserves original tone",
      "Booster: Perfect when running 8+ effects",
      "Works with JO-COOL or other switch pedals to toggle booster on/off",
      "Boost range: +0 dB ~ +13 dB",
      "BPS (Bypass Switch): 3.5mm mono phone jack",
      "Power Input: 9VDC–18VDC (2.1mm, negative tip)",
      "Power Through available to supply other pedals",
      "Dimensions: 9 cm × 3 cm × 3 cm",
    ],
  },

  // 產品四 ─────────────────────────────────────────────
  {
    id: "jo-cool",
    name: "JO-COOL",
    slogan: "Not another switch box",
    price: "$59 USD",

    images: [
      "/products/jo_cool/Jo_cool01.jpeg",
      "/products/jo_cool/Jo_cool02.jpeg",
      "/products/jo_cool/Jo_cool03.jpeg",
      "/products/jo_cool/Jo_cool04.jpeg",
    ],

    shortDescription:
      "A tiny switcher & true-bypass looper — control multiple pedals or amp channels at once.",

    description: `
Imagine a tiny switch — step on it to switch amp channels and turn on a reverb pedal, or activate your compressor, EQ, and JO-ONE booster all at once.

Introducing JO-COOL — the second box in the JO series.

Other than a switcher for your amp or effects (with remote SW jack), JO-COOL also works as a true-bypass looper.
`,

    specs: [
      "True-bypass looper",
      "Switcher for amps or effects (remote SW jack)",
      "Connected to JO-ONE → Boost volume + loop on",
      "Connected to amp → Switch channels + loop on",
      "SW jack: 3.5mm mono phone jack",
      "Dimensions: 9 cm × 4 cm × 3 cm",
    ],
  },
];
