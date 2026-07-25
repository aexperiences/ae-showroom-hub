/* ============================================================================
   4BARREL OS · a vertical of the AE Hub Core — the operating system for a
   boutique used-car dealership. Edit this file to rebrand.
   Accelerated Experiences, LLC.
   ============================================================================ */
window.HUB_CONFIG = {
  tenant: "fourbarrel",

  brand: {
    name:    "4barrel OS",
    short:   "4barrel",
    version: "V1.1",
    tagline: "Every car, buyer & deal in one place",
    logo:    "https://aexperiences.com/4barrel_OS.png",
    credit:  "Powered by Accelerated Experiences, LLC"
  },

  // Boutique-auto look: graphite ink + deep slate-teal accent on warm paper.
  skin: {
    paper:"#f4f4f2", card:"#ffffff", cream:"#eceae5",
    ink:"#1b1e23", ink2:"#434a54", mut:"#868c96",
    line:"#e4e2dc", line2:"#efeee9",
    accent:"#1c5568", accent2:"#164554", accent3:"#0f3341",
    onAccent:"#f2fbff"
  },

  departments: [
    { name:"",          keys:["home"] },
    { name:"Inventory",  keys:["inventory","recon"],   accent:"#1c5568" },
    { name:"Sales",      keys:["buyers","deals"],       accent:"#2f6a52" },
    { name:"System",     keys:["admin"] }
  ],

  sections: [
    { k:"home",      label:"Command Center",   ic:"🏠", href:"/hub.html" },
    { k:"inventory", label:"Inventory",         ic:"🗄", href:"/inventory.html" },
    { k:"recon",     label:"Reconditioning",   ic:"🛠", href:"/recon.html" },
    { k:"buyers",    label:"Buyers & Leads",   ic:"👥", href:"/buyers.html" },
    { k:"deals",     label:"Deals",            ic:"💰", href:"/deals.html" },
    { k:"admin",     label:"Admin",            ic:"🛠️", href:"/admin.html" }
  ],

  roles: {
    admin:  "*",
    owner:  "*",
    sales:  ["home","inventory","buyers","deals"],
    recon:  ["home","inventory","recon"],
    office: ["home","inventory","recon","buyers","deals"],
    // guest is OPENED so the hub demos instantly (localStorage seed). Lock to ["home"] for production.
    guest:  ["home","inventory","recon","buyers","deals"]
  },
  rolePretty: { admin:"Owner", owner:"Owner", sales:"Sales", recon:"Recon", office:"Office", guest:"Demo" },

  collections: ["vehicles","buyers","deals","recon"],

  assistant: {
    name:  "Otto",
    role:  "Sales & inventory assistant",
    blurb: "Ask me to write a vehicle listing, draft a buyer follow-up, price a car against the data, or tell you what's aging on the lot.",
    persona: "You are Otto, the AI sales & inventory assistant for {BRAND}, a boutique used-car dealership. " +
             "You write honest, compelling vehicle descriptions, draft buyer follow-ups and text replies, suggest pricing from the data you are given, and flag aging inventory and reconditioning bottlenecks. " +
             "Never invent facts (VIN, mileage, price, options, history) — say 'verify' if unsure. Never claim a clean history or guarantee a condition you do not have data for; recommend a records/inspection check. " +
             "Ground everything in the real inventory, buyer, and deal data provided."
  }
};
