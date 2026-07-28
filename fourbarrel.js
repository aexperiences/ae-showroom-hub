/* ============================================================================
   4BARREL OS — SHOWROOM ENGINE
   Used-Car OS for the boutique / independent lot · Powered by Accelerated Experiences LLC

   BROWSER-ONLY SHOWROOM. sessionStorage, resets on idle. No backend, no network.
   AEHub canon: Owner -> COO -> DH -> AE -> Event Bus -> Pacemaker -> Triad,
   confidence-gated release, LIVE/ESTIMATE/ASSUMPTION tags, the Fences.

   The customer is NOT a franchise mega-dealer. It is a 20–60 unit independent lot
   where the OWNER is the buyer, the recon manager, the salesperson, the title clerk
   and collections — often all before lunch. So the whole product answers ONE
   question (per the 4barrel brief §3a): "what is this unit costing me every day it
   sits, what's it all-in worth to me, and is my paperwork going to get me fined?"

   Money spine  = COST OF CARRY. Days-on-lot is not a stat, it's a daily bill.
                  All-in cost = acquisition + fees + transport + recon + carry-to-date.
   Headline     = the one-click DEAL JACKET (a compliant deal packet).
   Gate #1      = a unit can't hit the line until RECON reads Ready.
   Gate #2      = a deal can't DELIVER until title in-hand + FTC Buyers Guide + odometer.

   Compliance items are named at the real-statute level only (16 CFR 455 Buyers Guide,
   49 CFR 580 odometer). Per the brief §5 + Constitution Art. IV, benchmark bands are
   ESTIMATE-tagged or left to the store — nothing fabricated. Blank beats confident-wrong.
   ============================================================================ */
(function (global) {
  "use strict";

  var KEY = "fourbarrel_showroom_v1";
  var IDLE_MS = 20 * 60 * 1000;
  var STORE = (function(){ try{ localStorage.setItem('_t','1'); localStorage.removeItem('_t'); return localStorage; }catch(e){ return sessionStorage; } })();

  function now() { return Date.now(); }
  function read() { try { return JSON.parse(STORE.getItem(KEY)) || null; } catch (e) { return null; } }
  function write(d) { d._t = now(); try { STORE.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function fresh() {
    return { _t: now(), started: now(), tier: "multilot", adds: [], offs: [],
      units: clone(SEED.units), deals: clone(SEED.deals), leads: clone(SEED.leads), online: clone(SEED.online),
      team: clone(SEED.team), systems: clone(SEED.systems), matters: clone(SEED.matters), approvals: clone(SEED.approvals), bus: [], seq: 1 };
  }
  function clone(a){ return JSON.parse(JSON.stringify(a)); }
  function db() { var d = read(); if (!d) { d = fresh(); write(d); return d; } return d; }
  function save(mut) { var d = db(); mut(d); write(d); return d; }
  function resetFloor() { var d = fresh(); write(d); return d; }

  /* -------------------------------------------------------------- canon */
  var DEAL_STRUCTS = [
    { k:"cash", name:"Cash", note:"The buyer pays outright. No lender, little back gross — the money is the front and any add-on products." },
    { k:"outside", name:"Outside finance", note:"The buyer brings their own bank or credit union. You still owe clean disclosures; back gross is thin." },
    { k:"arranged", name:"Dealer-arranged finance", note:"You route the credit app to a lender. This is where service contracts and GAP add real back gross." },
    { k:"note", name:"In-house note (BHPH)", note:"You carry the paper. The real return is collected over months — payment schedule, late fees, and repossession law all apply." }
  ];
  var RECON_STATES = ["Waiting", "In shop", "Waiting parts", "Ready"];
  var UNIT_STATES = ["Available", "In transit", "Pending", "Sold"];
  var LEAD_STAGES = ["New", "Working", "Appointment", "Sold", "Lost"];
  var ONLINE_STAGES = ["New", "Working", "Quoted", "Held", "Submitted", "Done"];
  var LEAD_SOURCES = ["Website", "Facebook Marketplace", "Cars.com", "Walk-in", "Phone", "Referral"];
  var COMPLIANCE = [
    { k:"buyersGuide", name:"FTC Buyers Guide posted", ref:"16 CFR 455" },
    { k:"odometer", name:"Odometer disclosure captured", ref:"49 CFR 580" },
    { k:"title", name:"Title in hand (lien cleared)", ref:"Idaho ITD" }
  ];

  /* Benchmarks — ESTIMATE only. The brief (§5) says these are unresearched; do not
     present a fabricated target as fact. Every one is tagged and says "set per store". */
  var BENCH = {
    daysToTurn:{ target:[30,60], median:45, unit:"days", src:"Independent days-to-turn — industry estimate; set your own target per lot" },
    pvr:{ target:[3000,4500], median:3800, unit:"$", src:"Independent combined front+back PVR — estimate; verify against your own store" },
    recon:{ median:800, unit:"$", src:"Recon cost per unit — estimate; your shop and your buys set the real number" },
    floor:{ src:"Floor-plan interest accrues per unit per day — enter your lender's rate; the OS carries it into all-in cost" }
  };
  var REPLACES = [
    { tool:"A floor-plan portal (NextGear / Westlake / AFC)", job:"Per-unit interest & the carry", cost:"You log into theirs — here it rides on the unit" },
    { tool:"Cars.com / Autotrader / Facebook Marketplace", job:"Merchandising & syndication", cost:"Monthly listing bills" },
    { tool:"A DMS built for a franchise store", job:"Inventory, desk, deals", cost:"Priced for a store 50× your size" },
    { tool:"A spreadsheet, a folder of titles, and your head", job:"The whole lot", cost:"Free — and it's how a title slips and a Buyers Guide goes missing" }
  ];

  /* -------------------------------------------------------------- seed
     A believable ~30-unit independent lot (10 units shown). Workaday inventory:
     clean local trades and auction buys, $9k–$24k, one nicer front-row anchor.
     Deliberately imperfect: two held from the line for recon, one aging and
     eroding, one on the line with the title still in transit, one deal that
     can't deliver because a trade lien hasn't cleared. */
  var SEED = {
    units: [
      u("S-118",2018,"Hyundai","Elantra","SEL","Sedan","Silver",46000, 15900, 12900,0,0, 150,250, 4, 3,  "Ready","Available",true,true,"Trade","Fresh local one-owner trade. The front-row value car."),
      u("S-104",2016,"Honda","Civic","EX","Sedan","Blue",58000, 14400, 11600,350,200, 200,350, 4, 11, "Ready","Available",true,true,"Auction","Auction buy, reconditioned and on the line."),
      u("S-092",2013,"Ford","F-150","XLT 4x4","Truck","Black",119000, 17900, 14200,0,0, 400,500, 5, 22, "Ready","Available",true,true,"Trade","Higher miles but moves fast locally. Records on file."),
      u("S-121",2015,"Chevrolet","Equinox","LT","SUV","White",74000, 12900, 10100,350,250, 700,400, 4, 5,  "Waiting parts","In transit",false,true,"Auction","In the shop — rear brakes on order. Owner wants it live; the line gate holds it.",true),
      u("S-077",2010,"Subaru","Outback","2.5i","Wagon","Green",121000, 9800, 7600,0,0, 200,250, 3, 48, "Ready","Available",true,true,"Trade","48 days — carry is eating the spread. Price-move or wholesale."),
      u("S-115",2017,"Nissan","Altima","2.5 SV","Sedan","Gray",63000, 13900, 11000,350,200, 250,300, 4, 9,  "Ready","Available",true,false,"Auction","On the line — but the auction title hasn't arrived. Can't deliver until it's in hand."),
      u("S-131",2014,"Jeep","Grand Cherokee","Laredo","SUV","Maroon",98000, 15500, 12400,0,0, 500,450, 5, 4,  "In shop","In transit",false,true,"Trade","In the shop — brakes + detail. Not on the line yet.",true),
      u("S-069",2011,"GMC","Sierra 1500","SLE","Truck","Red",132000, 16400, 13000,350,300, 350,400, 5, 39, "Ready","Available",true,true,"Auction","39 days — watch it. Consider a price move before it ages out."),
      u("S-126",2019,"Toyota","RAV4","XLE","SUV","Gray",41000, 23900, 20300,0,0, 200,300, 6, 14, "Ready","Available",true,true,"Trade","The nicest unit on the lot — the front-row anchor."),
      u("S-088",2012,"Toyota","Camry","LE","Sedan","White",108000, 11400, 9100,350,200, 200,250, 3, 17, "Ready","Available",true,true,"Auction","Bread-and-butter commuter; steady interest.")
    ],
    deals: [
      { id:"d1", num:"D-041", vehicle:"2015 Kia Optima EX", buyer:"Marisol Vega", salePrice:13900, allIn:10800, struct:"arranged", products:{ vsc:900, gap:400 }, titleInHand:true, buyersGuide:true, odometer:true, delivered:true, soldDate:"2026-07-18", note:"Dealer-arranged finance; VSC + GAP added. Delivered clean." },
      { id:"d2", num:"D-038", vehicle:"2013 Honda CR-V EX", buyer:"The Prescotts", salePrice:15400, allIn:12600, struct:"cash", products:{ vsc:800, gap:0 }, titleInHand:true, buyersGuide:true, odometer:true, delivered:true, soldDate:"2026-07-14", note:"Cash deal; took a service contract. Thin back gross by nature." },
      { id:"d3", num:"D-035", vehicle:"2016 Ram 1500 Tradesman", buyer:"Cole Whitaker", salePrice:21900, allIn:18200, struct:"outside", products:{ vsc:0, gap:0 }, titleInHand:true, buyersGuide:true, odometer:true, delivered:true, soldDate:"2026-07-09", note:"Brought his own credit union — little back gross, strong front." },
      { id:"d4", num:"D-047", vehicle:"2014 Ford Escape SE", buyer:"Dana & Rob Kessler", salePrice:12900, allIn:10500, struct:"arranged", products:{ vsc:700, gap:300 }, titleInHand:false, buyersGuide:true, odometer:true, delivered:false, soldDate:"pending", note:"⚠ Buyer's ready — but the lien payoff on their trade hasn't cleared, so the title isn't in hand. Delivery is BLOCKED." }
    ],
    leads: [
      { id:"l1", who:"Website up", source:"Website", interest:"2019 RAV4 XLE", stage:"Appointment", note:"Coming Saturday 10am to drive the RAV4." },
      { id:"l2", who:"FB Marketplace up", source:"Facebook Marketplace", interest:"2013 F-150 4x4", stage:"Working", note:"Asked about the F-150; sent photos and a walkaround." },
      { id:"l3", who:"Cars.com up", source:"Cars.com", interest:"Commuter under $12k", stage:"New", note:"Wants a reliable commuter; sent the Camry and the Civic." },
      { id:"l4", who:"Walk-in", source:"Walk-in", interest:"2014 Grand Cherokee", stage:"Working", note:"Drove by; likes the Jeep — it's still in recon, follow up when it lists." },
      { id:"l5", who:"Phone up", source:"Phone", interest:"Trade appraisal", stage:"New", note:"Has an '08 Tacoma to trade; needs an appraisal number." },
      { id:"l6", who:"Website up", source:"Website", interest:"2010 Outback", stage:"Lost", note:"Bought elsewhere. The Outback's been sitting since." }
    ],
    online: [
      { id:"o1", vehicle:"2013 F-150 XLT 4x4", stage:"Held", deposit:500, note:"Reserved online — $500 deposit taken; coming in to finish." },
      { id:"o2", vehicle:"2019 RAV4 XLE", stage:"Quoted", deposit:0, note:"Sent an out-the-door quote; waiting on the buyer." },
      { id:"o3", vehicle:"2016 Civic EX", stage:"Submitted", deposit:0, note:"Credit app submitted online overnight." }
    ],
    team: [
      { id:"h1", name:"Ray Delgado", role:"Owner", type:"Human", status:"Active", dept:"Principal", note:"Buyer, closer, title clerk — every hat before lunch." },
      { id:"h2", name:"Dex", role:"Chief Operating Officer", type:"AI · DeepSeek", status:"Active", dept:"Command", note:"Runs the lot so Ray isn't in ten places at once." },
      { id:"h3", name:"Meg Sato", role:"Lot & Recon Hand", type:"Human · part-time", status:"Active", dept:"Lot", note:"Recon coordination, photos, and getting units listed." },
      { id:"h4", name:"Tally", role:"Head of the Desk & Books", type:"AI · DeepSeek", status:"Active", dept:"Desk", note:"Owns the all-in cost, the carry math, front & back gross." }
    ],
    systems: [
      { id:"sy1", name:"Website & listings sync", state:"CLEAR", metric:"Cars.com · Facebook · site in sync" },
      { id:"sy2", name:"Payments / online deposits", state:"CLEAR", metric:"deposit rail up · reconciled" },
      { id:"sy3", name:"Lot record / DMS core", state:"CLEAR", metric:"10 active units · nightly snapshot" },
      { id:"sy4", name:"Title & compliance vault", state:"WATCH", metric:"Altima title in transit · Escape lien payoff pending" },
      { id:"sy5", name:"Backups", state:"CLEAR", metric:"verified 02:00 daily" }
    ],
    matters: [
      { id:"mt1", title:"FTC Buyers Guide posted on every listed unit?", state:"Open", risk:"High", ref:"16 CFR 455 (FTC Used Car Rule)", note:"A window Buyers Guide is federally required on every used vehicle offered for sale — you can be fined per unit. Confirm one is posted on all listed units, including the aging Outback and Sierra." },
      { id:"mt2", title:"Odometer disclosure captured before delivery", state:"Open", risk:"Medium", ref:"49 CFR 580", note:"Federal odometer disclosure is required on transfer. Confirm it's in the deal jacket before any car is delivered." },
      { id:"mt3", title:"Title in hand before delivery / lien payoff on trades", state:"Open", risk:"High", ref:"Idaho ITD title & registration", note:"You can't deliver clean title you don't hold. The Escape's trade lien payoff hasn't cleared — hold delivery until it does." },
      { id:"mt4", title:"Doc fee & advertised-price disclosure", state:"Open", risk:"Medium", ref:"Idaho statute · Reg Z · FTC advertising", note:"Confirm the doc fee and advertised price/payment disclosures meet Idaho and federal rules — with counsel, not from memory." }
    ],
    approvals: [
      { id:"ap1", kind:"list", title:"Put the Equinox on the line before recon is Ready", by:"Meg (Lot & Recon)", summary:"She wants it live to catch weekend traffic. Rear brakes are on order — recon isn't Ready.", state:"Pending", why:"The line gate: no unit goes live until recon clears. A car listed you can't sell clean is a complaint, not a sale. Blocked to a human." },
      { id:"ap2", kind:"deliver", title:"Deliver the Ford Escape", by:"Tally (Desk AE)", summary:"Buyer's ready to take it Friday. The trade's lien payoff hasn't cleared, so the title isn't in hand.", state:"Pending", why:"A delivery moves clean title and signs federal disclosures. The title gate holds it until the payoff clears." },
      { id:"ap3", kind:"pricing", title:"Price move on the aging Outback (48 days)", by:"Dex (COO)", summary:"Drop it $600 or send it to auction before the carry eats the rest of the spread.", state:"Pending", why:"A price change moves real money and the unit's gross — the owner's call." }
    ]
  };
  function u(stock,year,make,model,trim,body,color,mileage,price,acq,fees,transport,reconParts,reconLabor,flrRate,daysOnLot,recon,status,listed,titleInHand,src,note,wantList){
    return { id:stock, stock:stock, year:year, make:make, model:model, trim:trim, body:body, color:color, mileage:mileage,
      price:price, acq:acq, fees:fees, transport:transport, reconParts:reconParts, reconLabor:reconLabor, flrRate:flrRate,
      daysOnLot:daysOnLot, recon:recon, status:status, listed:!!listed, titleInHand:!!titleInHand, src:src, note:note, wantList:!!wantList };
  }

  /* -------------------------------------------------------------- money spine */
  function basis(u){ return (u.acq||0)+(u.fees||0)+(u.transport||0)+(u.reconParts||0)+(u.reconLabor||0); }
  function carry(u){ return Math.round((u.daysOnLot||0)*(u.flrRate||0)); }
  function allInCost(u){ return basis(u)+carry(u); }
  function frontPotential(u){ return (u.price||0)-allInCost(u); }
  function unsold(d){ d=d||db(); return d.units.filter(function(x){ return x.status!=="Sold"; }); }
  function moneyTiedUp(d){ d=d||db(); return unsold(d).reduce(function(s,u){ return s+allInCost(u); },0); }
  function carryPerDay(d){ d=d||db(); return unsold(d).reduce(function(s,u){ return s+(u.flrRate||0); },0); }
  function carryPerMonth(d){ return carryPerDay(d)*30; }
  function canList(u){ return u.recon==="Ready"; }
  function listBlocked(d){ d=d||db(); return d.units.filter(function(u){ return u.wantList && !canList(u); }); }
  function agingUnits(d, days){ days=days||35; d=d||db(); return unsold(d).filter(function(u){ return (u.daysOnLot||0)>=days; }); }
  function titlePending(d){ d=d||db(); return d.units.filter(function(u){ return u.listed && !u.titleInHand; }); }

  function dealBack(x){ var p=x.products||{}; return (p.vsc||0)+(p.gap||0)+(p.other||0); }
  function dealFront(x){ return (x.salePrice||0)-(x.allIn||0); }
  function dealTotal(x){ return dealFront(x)+dealBack(x); }
  function dealPVR(x){ return dealTotal(x); }
  function canDeliver(x){ return !!(x.titleInHand && x.buyersGuide && x.odometer); }
  function deliveredDeals(d){ d=d||db(); return d.deals.filter(function(x){ return x.delivered; }); }
  function deliverBlocked(d){ d=d||db(); return d.deals.filter(function(x){ return !x.delivered && !canDeliver(x); }); }
  function storeGross(d){ d=d||db(); return deliveredDeals(d).reduce(function(s,x){ return s+dealTotal(x); },0); }
  function avgPVR(d){ d=d||db(); var dd=deliveredDeals(d); if(!dd.length) return 0; return Math.round(storeGross(d)/dd.length); }
  function deliverDeal(id){ return save(function(d){ d.deals.forEach(function(x){ if(x.id===id && canDeliver(x)) x.delivered=true; }); }); }

  /* -------------------------------------------------------------- price book */
  var ROOMS = {
    inventory: { label:"Lot & Inventory", mo:80, build:450, why:"Every unit with its running ALL-IN cost — auction + fees + transport + recon + the floor-plan carry that grows every day it sits." },
    recon:     { label:"Reconditioning", mo:65, build:400, why:"The shop pipeline — and the gate. A unit can't hit the line until recon reads Ready." },
    floorplan: { label:"Floor Plan & Carry", mo:75, build:500, why:"What your money costs per day. Per-unit interest, curtailments, and the daily bill days-on-lot really is." },
    deals:     { label:"Desk & Deals", mo:85, build:550, why:"The desk — cash, outside finance, dealer-arranged, or your own note. Front gross, back gross, PVR, computed." },
    fni:       { label:"Finance & Products", mo:70, build:450, why:"Lenders, service contracts and GAP — where an independent's back gross actually comes from." },
    leads:     { label:"Leads & Ups", mo:55, build:350, why:"Every up logged with its source — website, Facebook, Cars.com, walk-in — no BDC, no lost follow-up." },
    online:    { label:"Online Sales", mo:65, build:450, why:"The online pipeline and deposits — reserve, quote, submit, done — for the buyers who start on their phone." },
    titles:    { label:"Titles & Compliance", mo:95, build:650, why:"The paperwork gate — FTC Buyers Guide, odometer, title in-hand — and the one-click Deal Jacket. The thing most likely to fine you." },
    books:     { label:"Books & Margins", mo:70, build:450, why:"Store gross, PVR, days-to-turn and aged units — the month, computed, not reconstructed." },
    marketing: { label:"Merchandising & Syndication", mo:60, build:400, why:"Photos, descriptions and one-push listing to Cars.com, Facebook Marketplace and your own site." },
    it:        { label:"IT · System Health", mo:55, build:350, why:"CLEAR / WATCH / INTERVENE on listings sync, deposits, the lot record and backups." },
    law:       { label:"Law · Counsel", mo:90, build:600, why:"Dealer compliance — Buyers Guide, odometer, title, doc fee, advertising — advisory, with a fence to a real attorney." },
    org:       { label:"Agent Org · Bus", mo:130, build:1100, why:"The ten AI department chains that run the lot so you aren't in ten places at once. The confidence gates and the bus." }
  };
  var TIERS = {
    lot: { key:"lot", name:"Lot", rank:1, mo:450, build:2500, desc:"The lot running. Inventory with all-in cost and carry, the recon gate, the desk, and the up log.", base:"Single lot · owner + up to 2 hands", includes:["inventory","recon","floorplan","deals","leads"] },
    dealership: { key:"dealership", name:"Dealership", rank:2, mo:950, build:6500, desc:"The whole store. Adds F&I and products, online sales, titles & compliance, merchandising, the books, and the agent org.", base:"Single lot · full suite", includes:["inventory","recon","floorplan","deals","fni","leads","online","titles","books","marketing","it","org"] },
    multilot: { key:"multilot", name:"Multi-lot", rank:3, mo:2000, build:15000, desc:"Multiple lots, nothing held back. Every department, the full agent org, and counsel.", base:"Multi-lot · unlimited units · dedicated environment", includes:["inventory","recon","floorplan","deals","fni","leads","online","titles","books","marketing","it","law","org"] }
  };
  var DEPTS = [
    { group:"Command", items:[ { href:"dashboard.html", label:"Command Center", ic:"◎" }, { href:"calendar.html", label:"Calendar", ic:"▤" }, { href:"contacts.html", label:"Contacts", ic:"☎" }, { href:"connect.html", label:"Connect · Video", ic:"◉" }, { href:"records.html", label:"Records · Filing", ic:"▤" }, { href:"approvals.html", label:"Approval Desk", ic:"✓", accent:"ops" } ]},
    { group:"The Lot", items:[ { href:"inventory.html", label:"Lot & Inventory", ic:"▦", room:"inventory", accent:"lot" }, { href:"recon.html", label:"Reconditioning", ic:"⛭", room:"recon", accent:"recon" }, { href:"floorplan.html", label:"Floor Plan & Carry", ic:"◷", room:"floorplan", accent:"floor" } ]},
    { group:"The Desk", items:[ { href:"deals.html", label:"Desk & Deals", ic:"◆", room:"deals", accent:"desk" }, { href:"fni.html", label:"Finance & Products", ic:"❖", room:"fni", accent:"fni" }, { href:"leads.html", label:"Leads & Ups", ic:"☎", room:"leads", accent:"leads" }, { href:"online.html", label:"Online Sales", ic:"◈", room:"online", accent:"online" } ]},
    { group:"The Paperwork", items:[ { href:"titles.html", label:"Titles & Compliance", ic:"⎙", room:"titles", accent:"title" }, { href:"books.html", label:"Books & Margins", ic:"◭", room:"books", accent:"books" } ]},
    { group:"Reach & Governance", items:[ { href:"marketing.html", label:"Merchandising", ic:"◱", room:"marketing", accent:"market" }, { href:"it.html", label:"IT · System Health", ic:"⚙", room:"it", accent:"it" }, { href:"law.html", label:"Law · Counsel", ic:"⚖", room:"law", accent:"law" }, { href:"org.html", label:"Agent Org · Bus", ic:"❖", room:"org", accent:"ops" } ]}
  ];

  var SEATS = {
    coo: { id:"coo", name:"Dex", role:"Chief Operating Officer", tier:"COO", dept:"Command", gate:null, line:"Apex seat. Runs the lot so the owner isn't in ten places at once; defers to him only behind a Fence." },
    depts: [
      { key:"lot", name:"Inventory & Acquisition", accent:"lot", gate:80, dh:{name:"Cutter",line:"Owns the units — what's on the lot, what each is all-in, and what's aging."}, ae:{name:"Tag",line:"Packages each unit's all-in cost and days-on-lot."}, pace:{name:"Gauge",line:"Releases at ≥80%; an aged unit eroding its gross escalates."}, lensA:{name:"Turn",line:"Velocity lens — is this unit moving or sitting?"}, lensB:{name:"Basis",line:"Cost lens — what is this unit really into us, carry included?"} },
      { key:"recon", name:"Reconditioning", accent:"recon", gate:80, dh:{name:"Wrench",line:"Owns the shop pipeline and the line gate."}, ae:{name:"Bay",line:"Packages recon status, cost, and what's cleared for the line."}, pace:{name:"Ready",line:"Releases at ≥80%; a unit listed before recon clears escalates."}, lensA:{name:"Speed",line:"Throughput lens — how fast to the line?"}, lensB:{name:"Standard",line:"Quality lens — is it actually safe and sellable yet?"} },
      { key:"floor", name:"Floor Plan & Carry", accent:"floor", gate:85, dh:{name:"Prime",line:"Owns the cost of money — per-unit interest and the daily carry."}, ae:{name:"Accrue",line:"Packages carry-to-date, curtailments, and the daily bill."}, pace:{name:"Rate",line:"High bar (85%). A curtailment or a unit bleeding carry escalates."}, lensA:{name:"Cost",line:"Cash lens — what is the floor plan costing us today?"}, lensB:{name:"Clock",line:"Time lens — how many days until this unit's carry eats its gross?"} },
      { key:"desk", name:"Desk & Deals", accent:"desk", gate:85, dh:{name:"Deacon",line:"Owns the deal — structure, front and back gross, the numbers."}, ae:{name:"Sheet",line:"Packages the deal recap — price, all-in, front, back, PVR."}, pace:{name:"Even",line:"High bar (85%). A deal underwater at the all-in escalates."}, lensA:{name:"Gross",line:"Margin lens — is there real front + back here?"}, lensB:{name:"Fit",line:"Buyer lens — is this a structure the buyer clears?"} },
      { key:"fni", name:"Finance & Products", accent:"fni", gate:85, dh:{name:"Vaughn",line:"Owns lenders and products — service contracts, GAP, the note."}, ae:{name:"Menu",line:"Packages the product menu and the lender routing."}, pace:{name:"Clear",line:"High bar (85%). An advertised payment that won't disclose clean escalates."}, lensA:{name:"Return",line:"Back-gross lens — what does F&I add without overreach?"}, lensB:{name:"Rule",line:"Compliance lens — does the payment/product disclosure hold up?"} },
      { key:"leads", name:"Leads & Ups", accent:"leads", gate:80, dh:{name:"Harlan",line:"Owns the up log — every lead, its source, its next step."}, ae:{name:"Source",line:"Packages leads by source and the follow-up queue."}, pace:{name:"Touch",line:"Releases at ≥80%; a lead going cold escalates."}, lensA:{name:"Intent",line:"Buyer lens — who's actually ready?"}, lensB:{name:"Channel",line:"Source lens — where is the traffic really coming from?"} },
      { key:"title", name:"Titles & Compliance", accent:"title", gate:85, dh:{name:"Marlow",line:"Owns the paperwork gate — Buyers Guide, odometer, title in-hand."}, ae:{name:"Jacket",line:"Packages the deal jacket and flags what's missing to deliver."}, pace:{name:"Seal",line:"High bar (85%). A delivery without clean title or a Buyers Guide escalates — hard."}, lensA:{name:"Clear",line:"Enablement lens — what's needed to deliver this one clean?"}, lensB:{name:"Exposure",line:"Risk lens — what's the fine or the unwind if we deliver anyway?"} },
      { key:"marketing", name:"Merchandising & Syndication", accent:"market", gate:80, dh:{name:"Sable",line:"Owns the listings — photos, descriptions, syndication."}, ae:{name:"Post",line:"Packages the merchandising and the syndication push."}, pace:{name:"Reach",line:"Releases at ≥80%; a stale or missing listing escalates."}, lensA:{name:"Draw",line:"Demand lens — will this listing pull calls?"}, lensB:{name:"Spend",line:"Efficiency lens — is the Cars.com / Facebook spend earning its keep?"} },
      { key:"it", name:"System Health", accent:"it", gate:80, dh:{name:"Ward",line:"Owns uptime — listings sync, deposits, the lot record."}, ae:{name:"Cache",line:"Packages incidents and the watch list."}, pace:{name:"Steady",line:"Calls system health; a listings-sync or deposit outage escalates."}, lensA:{name:"Access",line:"Availability lens — are the listings and deposits live?"}, lensB:{name:"Loss",line:"Risk lens — where's the exposure if sync drops?"} },
      { key:"law", name:"Law · Counsel", accent:"law", gate:85, dh:{name:"Barrow",line:"Owns dealer compliance — Buyers Guide, odometer, title, doc fee, advertising. NOT a lawyer; advisory only."}, ae:{name:"File",line:"Packages the matter, the risk, the reference; flags what needs a real attorney."}, pace:{name:"Care",line:"High bar (85%). Anything with real exposure routes to counsel."}, lensA:{name:"Clear",line:"Enablement lens — how do we get compliant and sell?"}, lensB:{name:"Claim",line:"Exposure lens — what could this cost, and does coverage respond?"} }
    ]
  };

  /* -------------------------------------------------------------- brain */
  var BRAIN = {
    lot: { match:["inventory","lot","unit","aging","aged","stock","acquire","auction","trade","car","vehicle"], build:function(d){ var aged=agingUnits(d); return { stance:"Move the aging units before they eat their own gross — the Outback at 48 days and the Sierra at 39 are the two to work first.", conf:83, reasons:[{t:"data",s:unsold(d).length+" units in stock; "+aged.length+" at "+35+"+ days on lot."},{t:"data",s:"Every unit carries its running all-in cost — acquisition, fees, transport, recon, and the carry that grows daily."},{t:"assumption",s:"Assumes local demand holds; a soft month means the aged units need a price move sooner, not later."}] }; } },
    recon: { match:["recon","shop","brakes","detail","ready","line","list","reconditioning","parts"], build:function(d){ var b=listBlocked(d); return { stance: b.length?"Do NOT list the Equinox or the Grand Cherokee — recon isn't Ready. Push the parts and the detail; the line gate holds them shut until they clear.":"Every unit the owner wants live is reconditioned and cleared for the line.", conf:82, reasons:[{t:"data",s:b.length+" unit(s) held from the line for recon; the gate keeps a not-ready car off Cars.com."},{t:"data",s:"Recon cost rolls into each unit's all-in — it's not a separate bucket, it's basis."},{t:"assumption",s:"Assumes the Equinox brake parts land this week; a slip pushes the whole line date."}] }; } },
    floor: { match:["floor","carry","interest","curtailment","days on lot","cost of money","flooring","tied up"], build:function(d){ return { stance:"Your money is costing about "+money(carryPerDay(d))+"/day in floor-plan interest across the lot — the two aged units are where it hurts. Turn them and the daily bill drops.", conf:86, reasons:[{t:"data",s:money(moneyTiedUp(d))+" tied up across "+unsold(d).length+" units; carry ≈ "+money(carryPerDay(d))+"/day, ~"+money(carryPerMonth(d))+"/mo."},{t:"data",s:"Days-on-lot is a bill, not a stat — every unit's carry is added to its all-in cost automatically."},{t:"assumption",s:BENCH.floor.src+"; the showroom uses per-unit rates you'd replace with your lender's."}] }; } },
    desk: { match:["desk","deal","gross","front","back","pvr","sell","sold","structure","price","margin"], build:function(d){ return { stance:"The delivered deals are averaging "+money(avgPVR(d))+" a copy — healthy front, and the arranged-finance deals are where the back gross lives. Push products only where they disclose clean.", conf:84, reasons:[{t:"data",s:deliveredDeals(d).length+" delivered deal(s); store gross "+money(storeGross(d))+"; PVR "+money(avgPVR(d))+"."},{t:"data",s:"Front gross is sale price minus the true all-in — carry included — not minus a static cost."},{t:"assumption",s:"PVR band is an estimate ("+BENCH.pvr.src+")."}] }; } },
    fni: { match:["fni","f&i","finance","lender","gap","service contract","warranty","product","note","bhph"], build:function(d){ return { stance:"Back gross comes from the dealer-arranged deals — a service contract and GAP where the buyer finances. Don't chase it on the cash and outside-finance deals; there's little there and the disclosure risk isn't worth it.", conf:83, reasons:[{t:"data",s:"Back-gross products (VSC, GAP) sit on the arranged-finance deals; cash and outside deals carry thin back gross by nature."},{t:"data",s:"Every product must disclose its payment impact cleanly — that's a compliance line, not a sales line."},{t:"assumption",s:"Assumes the lender menu is current; a program change moves the payment math."}] }; } },
    leads: { match:["lead","up","ups","source","follow","website","facebook","cars.com","walk","phone","crm"], build:function(d){ var open=d.leads.filter(function(l){return l.stage!=="Sold"&&l.stage!=="Lost";}); return { stance:"Work the RAV4 appointment first — it's the anchor unit and the buyer's booked. Then the F-150 Facebook up; the Grand Cherokee up waits until recon lists it.", conf:81, reasons:[{t:"data",s:open.length+" open up(s); sources logged (website, Facebook, Cars.com, walk-in, phone) so you know what's actually driving traffic."},{t:"data",s:"No BDC and no per-rep assignment — one up log, the owner works it."},{t:"assumption",s:"Assumes the Saturday appointment shows; a no-show moves the RAV4 back into follow-up."}] }; } },
    title: { match:["title","compliance","buyers guide","odometer","paperwork","lien","deliver","jacket","register","doc fee"], build:function(d){ var b=deliverBlocked(d); return { stance: b.length?"Do NOT deliver the Escape — the trade's lien payoff hasn't cleared, so you don't hold clean title. Compile the deal jacket, get the payoff done, then deliver.":"Every deal ready to deliver has clean title, a Buyers Guide and an odometer disclosure.", conf:88, reasons:[{t:"data",s:b.length+" deal(s) blocked from delivery on the paperwork gate; "+titlePending(d).length+" listed unit(s) with title still in transit."},{t:"data",s:"The gate checks title in-hand, the FTC Buyers Guide (16 CFR 455), and odometer disclosure (49 CFR 580) before a car can be delivered."},{t:"assumption",s:"This is a compliance read, not legal advice — the doc fee and advertising specifics need counsel (caps confidence under the 85% bar by design)."}] }; } },
    marketing: { match:["market","merchandis","listing","syndicat","photo","cars.com","facebook","advertise","reach"], build:function(d){ return { stance:"Get the RAV4 and the Elantra photographed and pushed to all three channels first — they're your movers. Refresh the aged Sierra and Outback listings with a price note so they don't look stale.", conf:80, reasons:[{t:"data",s:d.units.filter(function(u){return u.listed;}).length+" unit(s) listed; syndication to Cars.com, Facebook Marketplace and the site."},{t:"data",s:"A stale listing on an aged unit reads as a problem car — refresh it when you move the price."},{t:"assumption",s:"Assumes the listing spend is worth it per channel; the showroom doesn't fabricate a cost-per-lead."}] }; } },
    it: { match:["system","health","uptime","sync","listing","deposit","outage","backup","dms","record"], build:function(d){ var w=d.systems.filter(function(s){return s.state!=="CLEAR";}); return { stance: w.length?"WATCH: "+w.map(function(s){return s.name;}).join(", ")+". Nothing needs INTERVENE, but the title vault is flagged — the Altima title and the Escape payoff are the open items.":"System is CLEAR — listings sync, deposits, the lot record and backups all healthy.", conf: w.length?84:89, reasons:[{t:"data",s:d.systems.length+" service(s) monitored; "+w.length+" on WATCH, 0 INTERVENE."},{t:"data",s:"A listings-sync outage means your cars vanish from Cars.com — that's lost calls, so it pages a person."},{t:"assumption",s:"Assumes the showroom checks mirror production; a real outage pages the owner."}] }; } },
    law: { match:["law","legal","compliance","buyers guide","odometer","doc fee","advertis","reg z","attorney","counsel","bond","license"], build:function(d){ var open=d.matters.filter(function(m){return m.state==="Open";}); var high=open.filter(function(m){return m.risk==="High";}); return { stance:"Confirm a Buyers Guide is posted on every listed unit and hold the Escape delivery until the trade lien clears — those two are the real exposure right now.", conf:64, reasons:[{t:"data",s:open.length+" open matter(s); "+high.length+" rated High risk."},{t:"assumption",s:"This is an advisory read, NOT legal advice. The doc fee cap, advertising rules and BHPH/repossession specifics need counsel — that caps confidence under the 85% bar by design."},{t:"assumption",s:"Selling a unit without a posted Buyers Guide, or delivering without title in hand, is direct exposure; needs counsel to clear."}] }; } },
    ops: { match:["operations","process","bottleneck","running","admin","lot","owner"], build:function(d){ return { stance:"The bottleneck is the shop and the title vault — two units held for recon and one deal held for a lien payoff. Clear those three and the money starts moving again.", conf:81, reasons:[{t:"data",s:listBlocked(d).length+" unit(s) held for recon; "+deliverBlocked(d).length+" deal(s) held for paperwork."},{t:"data",s:"Every released conclusion is filed to the unit or deal record with a follow-up."},{t:"assumption",s:"Assumes the owner is the one desk — no manager layer to route through."}] }; } }
  };

  function consult(deptKey, question) {
    var d = db();
    var dept = SEATS.depts.filter(function (x){ return x.key===deptKey; })[0];
    var brain = BRAIN[deptKey];
    if (!dept || !brain) return null;
    var verdict = brain.build(d, question||"");
    var passed = verdict.conf >= dept.gate;
    var topic = dept.key;
    var stamp = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    var events = [
      { topic:topic+".sot.read", kind:"route", from:dept.dh.name, to:"Filing · SSOT", body:dept.dh.name+" is called to the Source of Truth and reads it before acting. SSOT loaded ✓ — canon, fences, and this record in hand.", stamp:stamp },
      { topic:topic+".ae.packaged", kind:"route", from:dept.ae.name, to:dept.pace.name, body:dept.ae.name+" (Administrative Executive) packages the ask, files it, and routes it down the bus to the triad: \""+(question||"(department review)")+"\"", stamp:stamp },
      { topic:topic+".triad.finding", kind:"deliberate", from:dept.lensA.name, to:dept.pace.name, body:"["+dept.lensA.name+"] "+lensTake(verdict,"A"), stamp:stamp },
      { topic:topic+".triad.finding", kind:"deliberate", from:dept.lensB.name, to:dept.pace.name, body:"["+dept.lensB.name+"] "+lensTake(verdict,"B"), stamp:stamp }
    ];
    var COORD = { lot:{to:"recon",why:"get the held units through the shop and onto the line"}, recon:{to:"marketing",why:"list a unit the moment it clears recon"}, floor:{to:"lot",why:"flag the units whose carry is eating their gross"}, desk:{to:"fni",why:"add back gross where the structure allows it"}, fni:{to:"title",why:"make sure every product discloses clean before delivery"}, leads:{to:"desk",why:"hand a ready buyer to the desk"}, title:{to:"desk",why:"clear the paperwork before the deal delivers"}, marketing:{to:"leads",why:"route the calls a listing pulls into the up log"}, it:{to:"marketing",why:"keep the listings sync live so cars don't vanish"}, law:{to:"title",why:"confirm the compliance gate before anything delivers"} };
    var co = COORD[dept.key];
    if (co) { var peer = SEATS.depts.filter(function (x){ return x.key===co.to; })[0]; if (peer) events.push({ topic:topic+".ae.lateral", kind:"route", from:dept.ae.name, to:peer.ae.name+" ("+peer.name+" AE)", body:dept.ae.name+" coordinates laterally with "+peer.ae.name+" to "+co.why+" — AE↔AE, same position, no chain needed.", stamp:stamp }); }
    if (passed) {
      events.push({ topic:topic+".pacemaker.released", kind:"conclude", from:dept.pace.name, to:dept.ae.name, body:verdict.stance, conclusion:true, verdict:verdict, gate:dept.gate, stamp:stamp });
      events.push({ topic:topic+".ae.filed", kind:"route", from:dept.ae.name, to:dept.dh.name, body:dept.ae.name+" files the released conclusion to the record and sets a follow-up, then hands it to "+dept.dh.name+".", stamp:stamp });
      events.push({ topic:"coo.decision", kind:"route", from:dept.dh.name, to:SEATS.coo.name+" (COO)", body:dept.dh.name+" carries it up to "+SEATS.coo.name+", the interface to the owner: cleared the "+dept.gate+"% bar.", stamp:stamp });
    } else {
      events.push({ topic:"escalation.below_bar", kind:"reject", from:dept.pace.name, to:SEATS.coo.name+" → the Owner", body:"Held below the "+dept.gate+"% bar ("+verdict.conf+"%). Needs a human — not enough live data. "+dept.ae.name+" files the hold; "+SEATS.coo.name+" routes it up with reasons attached.", conclusion:true, verdict:verdict, gate:dept.gate, escalate:true, stamp:stamp });
    }
    save(function (x){ events.forEach(function (e){ e.id="e"+(x.seq++); e.dept=dept.key; x.bus.push(e); }); if (x.bus.length>60) x.bus=x.bus.slice(-60); });
    return { dept:dept, verdict:verdict, passed:passed, events:events };
  }
  function lensTake(v, which) { var pro=v.reasons.filter(function(r){return r.t==="data";})[0]; var con=v.reasons.filter(function(r){return r.t==="assumption";})[0]; if (which==="A") return "Argues FOR: "+(pro?pro.s:"the evidence supports moving."); return "Pushes back: "+(con?con.s:"the evidence isn't fully sourced yet."); }
  function routeDept(question) { var q=String(question||"").toLowerCase(),best=null,bs=0; Object.keys(BRAIN).forEach(function (k){ var sc=BRAIN[k].match.reduce(function(s,w){return s+(q.indexOf(w)>=0?1:0);},0); if (sc>bs){bs=sc;best=k;} }); return best||"lot"; }
  function askDex(question) {
    var deptKey = routeDept(question);
    var dept = SEATS.depts.filter(function (x){ return x.key===deptKey; })[0];
    var stamp = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    save(function (x){ x.bus.push({ id:"e"+(x.seq++), dept:"coo", topic:"coo.route", kind:"route", from:SEATS.coo.name+" (COO)", to:dept.dh.name+" ("+dept.name+")", body:SEATS.coo.name+" takes the ask off the owner's desk and routes it to "+dept.name+" — he gates and packages, he doesn't do the work himself.", stamp:stamp }); });
    var r = consult(deptKey, question);
    var packaged = r.passed ? (SEATS.coo.name+": On it. "+dept.name+" cleared its "+dept.gate+"% bar — I'm releasing this to you. "+r.verdict.stance) : (SEATS.coo.name+": Holding this off your desk. "+dept.name+" came in at "+r.verdict.conf+"%, under its "+dept.gate+"% bar — it needs you. Here's what I have, and I've set a follow-up. "+r.verdict.stance);
    return { deptKey:deptKey, dept:dept, result:r, packaged:packaged, on_track:r.passed };
  }

  function approvals() { return db().approvals || []; }
  function stage(kind, title, summary, why, by) { var item = { id:"ap"+now(), kind:kind||"general", title:title||"Untitled", summary:summary||"", why:why||"Behind a fence — needs the owner.", by:by||"The org", state:"Pending" }; save(function (d){ (d.approvals=d.approvals||[]).push(item); }); return item; }
  function decideApproval(id, decision) { save(function (d){ (d.approvals||[]).forEach(function (a){ if (a.id===id) a.state=decision; }); }); return approvals(); }

  /* -------------------------------------------------------------- configurator */
  function tierKey() { return db().tier || "multilot"; }
  function tierRank() { return TIERS[tierKey()].rank; }
  function setTier(k) { save(function (d){ d.tier=k; d.adds=[]; d.offs=[]; }); }
  function activeRooms() { var d=db(); var inc=(TIERS[d.tier]||TIERS.multilot).includes.slice(); (d.offs||[]).forEach(function(k){var i=inc.indexOf(k);if(i>=0)inc.splice(i,1);}); (d.adds||[]).forEach(function(k){if(inc.indexOf(k)<0&&ROOMS[k])inc.push(k);}); return inc; }
  function hasRoom(k) { return !k || activeRooms().indexOf(k)>=0; }
  function toggleRoom(k) { if (!ROOMS[k]) return; save(function (d){ var inc=(TIERS[d.tier]||TIERS.multilot).includes; d.adds=d.adds||[]; d.offs=d.offs||[]; var inP=inc.indexOf(k)>=0,iA=d.adds.indexOf(k),iO=d.offs.indexOf(k); if (inP){ if(iO>=0)d.offs.splice(iO,1); else d.offs.push(k); } else { if(iA>=0)d.adds.splice(iA,1); else d.adds.push(k); } }); }
  function priceNow() {
    var d=db(), t=TIERS[d.tier]||TIERS.multilot;
    var adds=(d.adds||[]).filter(function(k){return ROOMS[k];}), offs=(d.offs||[]).filter(function(k){return ROOMS[k];});
    var addMo=adds.reduce(function(s,k){return s+ROOMS[k].mo;},0), addBuild=adds.reduce(function(s,k){return s+ROOMS[k].build;},0);
    var offMo=offs.reduce(function(s,k){return s+ROOMS[k].mo;},0), offBuild=offs.reduce(function(s,k){return s+ROOMS[k].build;},0);
    var rooms=activeRooms();
    var alaMo=rooms.reduce(function(s,k){return s+(ROOMS[k]?ROOMS[k].mo:0);},0), alaBuild=rooms.reduce(function(s,k){return s+(ROOMS[k]?ROOMS[k].build:0);},0);
    var mo=Math.max(0,t.mo+addMo-offMo), build=Math.max(0,t.build+addBuild-offBuild);
    return { tier:t, rooms:rooms, adds:adds, offs:offs, mo:mo, build:build, addMo:addMo, offMo:offMo, addBuild:addBuild, offBuild:offBuild, alaMo:alaMo, alaBuild:alaBuild, platformMo:Math.max(0,mo-alaMo), savingMo:Math.max(0,alaMo-mo), changed:adds.length>0||offs.length>0 };
  }
  function priceLabel() { var p=priceNow(); return money(p.mo)+"/mo · "+money(p.build)+" build"; }

  /* -------------------------------------------------------------- view helpers */
  function el(html) { var t=document.createElement("template"); t.innerHTML=String(html).trim(); return t.content.firstChild; }
  function esc(s) { return String(s==null?"":s).replace(/[&<>"']/g, function (c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function money(n){ return "$"+(Math.round(Number(n)||0)).toLocaleString(); }
  function pct(n, dp){ return (Number(n)||0).toFixed(dp===undefined?0:dp)+"%"; }
  function brandMark() {
    return '<img src="https://www.aexperiences.com/4barrel_OS.png" alt="4barrel OS" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'fallback\')">' +
      '<svg class="fallback-mark" viewBox="0 0 32 32" width="24" height="24" style="display:none" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.7"><rect x="6" y="6" width="20" height="20" rx="3"/><circle cx="12.5" cy="12.5" r="2.4"/><circle cx="19.5" cy="12.5" r="2.4"/><circle cx="12.5" cy="19.5" r="2.4"/><circle cx="19.5" cy="19.5" r="2.4"/></g></svg>';
  }

  function renderShell(active) {
    var side = document.createElement("aside"); side.className = "sidebar";
    side.appendChild(el('<a href="dashboard.html" class="brand"><div class="bmark" aria-hidden="true">'+brandMark()+'</div><div><div class="bt">4barrel OS</div><div class="bs">Used-Car OS</div></div></a>'));
    var nav = document.createElement("nav"); nav.className = "nav"; var on = activeRooms();
    DEPTS.forEach(function (grp) {
      nav.appendChild(el('<div class="nav-group">'+esc(grp.group)+'</div>'));
      grp.items.forEach(function (it) {
        var off = it.room && on.indexOf(it.room)<0;
        var a = el('<a href="'+(off?"javascript:void(0)":it.href)+'" class="navlink '+(it.href===active?"active":"")+(off?" locked":"")+'"><span class="ic">'+it.ic+'</span><span class="lb">'+esc(it.label)+'</span>'+(off?'<span class="tier-tag">+'+money(ROOMS[it.room].mo)+'</span>':'')+'</a>');
        if (off) { a.title="Add "+ROOMS[it.room].label+" for "+money(ROOMS[it.room].mo)+"/mo + "+money(ROOMS[it.room].build)+" build"; a.addEventListener("click", function (){ toggleRoom(it.room); toast(ROOMS[it.room].label+" added — "+priceLabel(),"ok"); setTimeout(function(){location.reload();},500); }); }
        nav.appendChild(a);
      });
    });
    side.appendChild(nav);
    return side;
  }
  function renderTopbar(crumb) {
    var p = priceNow();
    var bar = document.createElement("div"); bar.className = "topbar";
    bar.innerHTML = '<button class="navtoggle" id="navToggle" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><div class="crumbs">4barrel OS · <b>'+esc(crumb)+'</b></div><div class="spacer"></div><div class="tierpill" id="tierPillStatic"><span class="dot"></span><div><b>'+esc(p.tier.name)+(p.changed?' <i class="cfg">configured</i>':'')+'</b> <span class="price">'+money(p.mo)+'/mo · '+money(p.build)+' build</span></div><span class="chev">▾</span></div><div class="who"><div class="av">RD</div><div>Ray Delgado<br><span class="muted small">Owner</span></div></div>';
    var menu = document.createElement("div"); menu.className = "tiermenu"; menu.id = "tierMenu";
    menu.appendChild(el('<div class="tm-head">Start from a package, then <b>add or take off any department</b>. Every one is priced on its own, so the build fits the lot instead of the lot fitting the build.</div>'));
    Object.keys(TIERS).sort(function (a,b){ return TIERS[b].rank-TIERS[a].rank; }).forEach(function (k) {
      var tt = TIERS[k];
      var opt = el('<div class="tieropt '+(k===tierKey()?"on":"")+'"><div class="to-top"><span class="to-name">'+esc(tt.name)+'</span><span class="to-price">'+money(tt.mo)+'/mo · '+money(tt.build)+' build</span></div><div class="to-desc">'+esc(tt.desc)+'</div><div class="to-base">'+esc(tt.base)+' · '+tt.includes.length+' departments</div></div>');
      opt.addEventListener("click", function (e){ e.stopPropagation(); setTier(k); location.reload(); });
      menu.appendChild(opt);
    });
    menu.appendChild(el('<div class="tm-sub">Departments — toggle any one on or off</div>'));
    var on = activeRooms(); var list = document.createElement("div"); list.className = "roomlist";
    Object.keys(ROOMS).forEach(function (k) {
      var r = ROOMS[k], isOn = on.indexOf(k)>=0, inPack = p.tier.includes.indexOf(k)>=0;
      var row = el('<div class="roomrow '+(isOn?"on":"")+'"><span class="rr-box">'+(isOn?"✓":"+")+'</span><span class="rr-name">'+esc(r.label)+(isOn&&!inPack?' <i class="rr-flag add">added</i>':'')+(!isOn&&inPack?' <i class="rr-flag off">removed</i>':'')+'</span><span class="rr-price">'+money(r.mo)+'/mo<i>'+money(r.build)+' build</i></span><span class="rr-why">'+esc(r.why)+'</span></div>');
      row.addEventListener("click", function (e){ e.stopPropagation(); toggleRoom(k); toast(r.label+(activeRooms().indexOf(k)>=0?" added — ":" removed — ")+priceLabel(),"ok"); setTimeout(function(){location.reload();},500); });
      list.appendChild(row);
    });
    menu.appendChild(list);
    var total = '<div class="tm-total"><div class="tt-line"><span>'+esc(p.tier.name)+' package</span><b>'+money(p.tier.mo)+'/mo</b></div>'+(p.adds.length?'<div class="tt-line add"><span>+ '+p.adds.length+' department'+(p.adds.length>1?"s":"")+' added</span><b>+'+money(p.addMo)+'/mo</b></div>':'')+(p.offs.length?'<div class="tt-line off"><span>− '+p.offs.length+' department'+(p.offs.length>1?"s":"")+' removed</span><b>−'+money(p.offMo)+'/mo</b></div>':'')+'<div class="tt-line grand"><span>Configured</span><b>'+money(p.mo)+'/mo · '+money(p.build)+' build</b></div><div class="tt-save">'+p.rooms.length+' department'+(p.rooms.length===1?"":"s")+' at '+money(p.alaMo)+'/mo, plus '+money(p.platformMo)+'/mo platform — '+esc(p.tier.base.toLowerCase())+'.</div><div class="tt-draft">Draft pricing — Accelerated Experiences LLC sets every live price.</div></div>';
    menu.appendChild(el(total));
    menu.addEventListener("click", function (e){ e.stopPropagation(); });
    setTimeout(function () { var pill=document.getElementById("tierPill"); if (pill) pill.addEventListener("click", function (e){ e.stopPropagation(); menu.classList.toggle("open"); }); document.addEventListener("click", function (){ menu.classList.remove("open"); }); }, 0);
    var frag = document.createDocumentFragment(); frag.appendChild(bar); frag.appendChild(menu); return frag;
  }
  function ribbon() { return el('<div class="ribbon"><span class="live">LIVE SHOWROOM</span> — this is the real OS, not a slideshow. Everything you type stays in your browser and resets when you leave. <a href="javascript:void(0)" id="resetFloor">Reset the lot</a></div>'); }
  function footer() { return el('<div class="ae-credit">Powered by <b>Accelerated Experiences LLC</b> · 4barrel OS is a white-label build. Demo data is a fictional independent lot; benchmark figures are estimates and tagged.</div>'); }
  function mount(opts) {
    opts = opts || {}; db();
    var app = document.createElement("div"); app.className = "app";
    var scrim = document.createElement("div"); scrim.className = "navscrim"; scrim.id = "navScrim";
    var side = renderShell(opts.active);
    var main = document.createElement("div"); main.className = "main";
    main.appendChild(ribbon()); main.appendChild(renderTopbar(opts.crumb || "Command Center"));
    var content = document.createElement("div"); content.className = "content"; content.id = "content";
    main.appendChild(content); main.appendChild(footer());
    app.appendChild(scrim); app.appendChild(side); app.appendChild(main);
    document.body.innerHTML = ""; document.body.appendChild(app);
    document.body.appendChild(el('<div id="toast-wrap"></div>'));
    setTimeout(function () {
      var r = document.getElementById("resetFloor");
      if (r) r.addEventListener("click", function (){ resetFloor(); toast("Showroom reset to a fresh lot.","ok"); setTimeout(function(){location.reload();},450); });
      var t = document.getElementById("navToggle");
      if (t) t.addEventListener("click", function (){ app.classList.toggle("nav-open"); });
      if (scrim) scrim.addEventListener("click", function (){ app.classList.remove("nav-open"); });
    }, 0);
    return content;
  }
  function toast(msg, kind) { var w=document.getElementById("toast-wrap"); if (!w) return; var t=el('<div class="toast '+(kind||"")+'">'+esc(msg)+'</div>'); w.appendChild(t); setTimeout(function (){ t.style.opacity="0"; setTimeout(function(){t.remove();},250); }, 2600); }
  function page(title, sub, actionsHTML) { return el('<div class="pagehead"><div><h1>'+esc(title)+'</h1>'+(sub?'<p class="sub">'+sub+'</p>':"")+'</div><div class="pagehead-actions">'+(actionsHTML||"")+'</div></div>'); }
  function card(inner, cls) { return el('<section class="card '+(cls||"")+'">'+inner+'</section>'); }
  function stat(label, value, note, band) { return '<div class="stat '+(band||"")+'"><div class="s-l">'+esc(label)+'</div><div class="s-v">'+value+'</div>'+(note?'<div class="s-n">'+note+'</div>':"")+'</div>'; }
  function tag(text, kind) { return '<span class="tag '+(kind||"")+'">'+esc(text)+'</span>'; }
  function srcNote(text) { return '<div class="srcnote">Source: '+esc(text)+'</div>'; }

  document.addEventListener("visibilitychange", function (){ if (!document.hidden) db(); });

  var API = {
    db:db, save:save, resetFloor:resetFloor, fresh:fresh, SEED:SEED,
    DEAL_STRUCTS:DEAL_STRUCTS, RECON_STATES:RECON_STATES, UNIT_STATES:UNIT_STATES, LEAD_STAGES:LEAD_STAGES, ONLINE_STAGES:ONLINE_STAGES, LEAD_SOURCES:LEAD_SOURCES, COMPLIANCE:COMPLIANCE, BENCH:BENCH, REPLACES:REPLACES,
    TIERS:TIERS, ROOMS:ROOMS, DEPTS:DEPTS, SEATS:SEATS, BRAIN:BRAIN,
    tierKey:tierKey, tierRank:tierRank, setTier:setTier, activeRooms:activeRooms, hasRoom:hasRoom, toggleRoom:toggleRoom, priceNow:priceNow, priceLabel:priceLabel,
    consult:consult, askDex:askDex, routeDept:routeDept,
    basis:basis, carry:carry, allInCost:allInCost, frontPotential:frontPotential, unsold:unsold, moneyTiedUp:moneyTiedUp, carryPerDay:carryPerDay, carryPerMonth:carryPerMonth, canList:canList, listBlocked:listBlocked, agingUnits:agingUnits, titlePending:titlePending,
    dealBack:dealBack, dealFront:dealFront, dealTotal:dealTotal, dealPVR:dealPVR, canDeliver:canDeliver, deliveredDeals:deliveredDeals, deliverBlocked:deliverBlocked, storeGross:storeGross, avgPVR:avgPVR, deliverDeal:deliverDeal,
    approvals:approvals, stage:stage, decideApproval:decideApproval,
    mount:mount, toast:toast, el:el, esc:esc, money:money, pct:pct, page:page, card:card, stat:stat, tag:tag, srcNote:srcNote
  };
  global.FB = API; global.Fourbarrel = API;
})(window);

/* ============================================================================
   AE in-flow COO assistant (Jul 28 2026) — "Ask the COO" on every page.
   Self-contained. Auto-detects the OS engine and drops a floating assistant
   into every room. Two jobs:
     1) CONCIERGE — explains the agent organization, how the system works,
        customization/white-label, and live pricing (pulled from the OS's own
        TIERS/ROOMS/SEATS).
     2) OPERATOR — business/operational questions route through the real agent
        org (routeDept -> consult -> gated verdict), same as the Org page.
   Ghost Mode: it answers, it never acts.
   ============================================================================ */
(function(){
  function findENG(){
    var names=['FB','Amph','EightMM','Truss','Abode','LilNinja','Buttress','Musical','Showroom'];
    for(var i=0;i<names.length;i++){ var g=window[names[i]]; if(g&&g.routeDept&&g.consult&&g.SEATS&&g.SEATS.coo&&g.SEATS.depts) return g; }
    return null;
  }
  function init(){
    if(document.getElementById('aeCooFab')) return;
    if(!document.querySelector('.app')) return;           // inside the OS only, not the gate
    var ENG=findENG(); if(!ENG) return;
    var isTg=(window.Showroom&&ENG===window.Showroom);
    var esc=ENG.esc||function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
    var money=ENG.money||function(n){return '$'+(Math.round(n||0)).toLocaleString();};
    var coo=ENG.SEATS.coo, nd=ENG.SEATS.depts.length;
    var v=isTg
      ?{surface:'var(--panel,#181E2A)',surf2:'var(--panel-2,#1F2634)',text:'var(--text,#EAEDF4)',mut:'var(--muted,#8B95A9)',line:'var(--line,#2C3547)',prim:'var(--brand,#FF6A2C)',onprim:'#160a04',good:'var(--ok,#4ADE80)',warn:'var(--warn,#FBBF24)'}
      :{surface:'var(--card,#fff)',surf2:'var(--sunk,#efe9df)',text:'var(--ink,#1a1a1a)',mut:'var(--mut,#888)',line:'var(--line,#ddd)',prim:'var(--mag,#c8501e)',onprim:'#fff',good:'var(--good,#4a8a5a)',warn:'var(--watch,#d19a2b)'};
    var st=document.createElement('style'); st.id='aeCooStyle';
    st.textContent=
      '#aeCooFab{position:fixed;right:18px;bottom:18px;z-index:95;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;background:'+v.prim+';color:'+v.onprim+';box-shadow:0 12px 30px -8px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;transition:transform .15s}'+
      '#aeCooFab:hover{transform:translateY(-2px)}'+
      '#aeCooFab .lbl{position:absolute;right:62px;white-space:nowrap;background:'+v.surface+';color:'+v.text+';border:1px solid '+v.line+';border-radius:999px;padding:5px 11px;font-size:11.5px;font-weight:700;box-shadow:0 8px 22px -12px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .15s}'+
      '#aeCooFab:hover .lbl{opacity:1}'+
      '#aeCooPanel{position:fixed;right:18px;bottom:82px;z-index:130;width:346px;max-width:calc(100vw - 30px);height:486px;max-height:calc(100dvh - 120px);border-radius:16px;background:'+v.surface+';border:1px solid '+v.line+';box-shadow:0 26px 64px -20px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden}'+
      '#aeCooPanel.open{display:flex}'+
      '.aecoo-head{padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid '+v.line+'}'+
      '.aecoo-head .av{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;font-weight:800;font-size:13px;background:'+v.prim+';color:'+v.onprim+'}'+
      '.aecoo-head b{font-size:13.5px;color:'+v.text+'} .aecoo-head .r{font-size:10.5px;color:'+v.mut+'}'+
      '.aecoo-x{margin-left:auto;background:transparent;border:none;color:'+v.mut+';cursor:pointer;font-size:19px;line-height:1}'+
      '.aecoo-msgs{flex:1;overflow-y:auto;padding:13px;display:flex;flex-direction:column;gap:11px}'+
      '.aecoo-b{max-width:88%;padding:9px 12px;border-radius:13px;font-size:12.6px;line-height:1.5;white-space:pre-wrap}'+
      '.aecoo-b.you{align-self:flex-end;background:'+v.prim+';color:'+v.onprim+';border-bottom-right-radius:4px}'+
      '.aecoo-b.coo{align-self:flex-start;background:'+v.surf2+';color:'+v.text+';border-bottom-left-radius:4px}'+
      '.aecoo-b.coo.held{border:1px solid '+v.warn+'}'+
      '.aecoo-meta{font-size:10px;font-family:monospace;margin-top:7px;color:'+v.mut+'}'+
      '.aecoo-reasons{margin:8px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:5px}'+
      '.aecoo-reasons li{font-size:11px;line-height:1.45;display:flex;gap:6px;color:'+v.text+'}'+
      '.aecoo-rtag{font-family:monospace;font-size:8px;letter-spacing:.04em;padding:1px 4px;border-radius:3px;height:fit-content;margin-top:2px;font-weight:700;flex:none}'+
      '.aecoo-rtag.data{background:'+v.good+';color:#fff} .aecoo-rtag.assumption{background:'+v.warn+';color:#2a2000}'+
      '.aecoo-foot{padding:10px 12px;border-top:1px solid '+v.line+'}'+
      '.aecoo-samples{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}'+
      '.aecoo-chip{font-size:10.5px;padding:4px 9px;border-radius:999px;cursor:pointer;border:1px solid '+v.line+';background:'+v.surf2+';color:'+v.text+'}'+
      '.aecoo-inrow{display:flex;gap:7px}'+
      '.aecoo-in{flex:1;border-radius:9px;padding:9px 10px;font-size:12.5px;border:1px solid '+v.line+';background:'+v.surface+';color:'+v.text+'}'+
      '.aecoo-in:focus{outline:none;border-color:'+v.prim+'}'+
      '.aecoo-send{border:none;border-radius:9px;padding:0 14px;font-weight:800;cursor:pointer;background:'+v.prim+';color:'+v.onprim+'}';
    document.head.appendChild(st);

    /* ---------- concierge knowledge (about the system itself) ---------- */
    function kb(q){
      q=(q||'').toLowerCase();
      function m(){for(var i=0;i<arguments.length;i++){if(q.indexOf(arguments[i])>=0)return true;}return false;}
      if(m('agent org','organization','who runs','who is','the seats','how the org','the org','deliberat','confidence bar','ghost mode','deepseek','ai org','how does the ai','the departments do'))
        return 'This OS runs on a '+nd+'-department AI agent organization, and I’m '+coo.name+', the COO. You ask; I route it to exactly one department, let its five-seat chain — a head, an admin exec, a pacemaker, and two opposing lenses that never confer — work it under its own confidence bar, then bring you one clean answer with its reasons. Money and compliance calls hold a higher 85% bar and come to you if they aren’t certain. Nothing here acts on its own — that’s Ghost Mode; anything that would send, spend or sign is staged on the Approval Desk. The real engine runs server-side on DeepSeek; this showroom is a faithful local stand-in.';
      if(m('price','pricing','cost','how much','what do you charge','tier','plan','package','per month','/mo','subscription','quote','expensive')){
        var ts=Object.keys(ENG.TIERS).map(function(k){return ENG.TIERS[k];}).sort(function(a,b){return (a.mo||0)-(b.mo||0);});
        var lines=ts.map(function(t){return '• '+t.name+' — '+money(t.mo)+'/mo + '+money(t.build)+' one-time build'+(t.desc?': '+t.desc:'');}).join('\n');
        return 'Here are the packages:\n\n'+lines+'\n\nEvery department is also priced on its own, so you can add or drop any one and the price moves with it — tap the tier chip at the top to configure it live. Draft pricing; Accelerated Experiences LLC sets the final number.';
      }
      if(m('custom','white label','white-label','brand','skin','tailor','our own','add a department','add department','remove a','turn off','turn on','configure','make it fit','our data')){
        var rs=Object.keys(ENG.ROOMS).slice(0,4).map(function(k){return ENG.ROOMS[k].label;}).join(', ');
        return 'It’s fully white-label: your brand, your colors, your departments, and your own data seeded in. Start from a package, then add or take off any department — like '+rs+' — so the build fits your business instead of the other way around. Tap the tier chip at the top to switch departments on and off and watch the price move in real time.';
      }
      if(m('what is this','what does it do','what can you do','what can it do','how does it work','is this real','is it real','showroom','slideshow','a demo','real app'))
        return 'This is the real OS, running right here in your browser — not a slideshow. Everything you type stays in this tab and resets when you leave. It’s your whole operation as one system, with a '+nd+'-department AI org underneath it. In the live product it runs on a server with your real data; nothing in this showroom sends, spends or signs — anything that would is staged on the Approval Desk for you. Ask me about the org, pricing, or how to customize it — or ask an operational question and I’ll route it to the right department.';
      if(m('who are you','your name','what are you'))
        return 'I’m '+coo.name+' — the Chief Operating Officer of this OS. I’m the one seat between you and a '+nd+'-department AI org: I take your question, route it, and bring back a clean answer. Ask me how the system works, what it costs, how to customize it, or anything operational.';
      return null;
    }

    var fab=document.createElement('button'); fab.id='aeCooFab'; fab.setAttribute('aria-label','Ask '+coo.name);
    fab.innerHTML='<span class="lbl">Ask '+esc(coo.name)+'</span>◎';
    document.body.appendChild(fab);

    var samples=['What’s the agent org?','How much does it cost?','Can I customize it?','What needs my attention?'];
    var panel=document.createElement('div'); panel.id='aeCooPanel';
    panel.innerHTML=
      '<div class="aecoo-head"><div class="av">'+esc(coo.name.charAt(0))+'</div><div><b>'+esc(coo.name)+'</b><div class="r">'+esc(coo.role)+' · agent org + concierge</div></div><button class="aecoo-x" aria-label="Close">×</button></div>'+
      '<div class="aecoo-msgs" id="aeCooMsgs"></div>'+
      '<div class="aecoo-foot"><div class="aecoo-samples">'+samples.map(function(s){return '<span class="aecoo-chip">'+esc(s)+'</span>';}).join('')+'</div>'+
      '<div class="aecoo-inrow"><input class="aecoo-in" id="aeCooIn" placeholder="Ask '+esc(coo.name)+' anything…"><button class="aecoo-send" id="aeCooSend">Ask</button></div></div>';
    document.body.appendChild(panel);

    var msgs=panel.querySelector('#aeCooMsgs'), input=panel.querySelector('#aeCooIn');
    function bubble(cls,html){ var b=document.createElement('div'); b.className='aecoo-b '+cls; b.innerHTML=html; msgs.appendChild(b); msgs.scrollTop=msgs.scrollHeight; return b; }
    bubble('coo','Hi — I’m '+esc(coo.name)+', your COO. I can explain the agent org, what the system does, how to customize it and what it costs — or take an operational question and route it to the right department. What do you need?');
    function ask(q){
      q=(q||'').trim(); if(!q){ input.focus(); return; }
      bubble('you',esc(q)); input.value='';
      var k=kb(q);
      if(k){ bubble('coo', esc(k).replace(/\n/g,'<br>')); return; }        // concierge answer
      var dk=ENG.routeDept(q), r=ENG.consult(dk,q);                         // else route to the org
      if(!r){ bubble('coo','I couldn’t route that one — try rephrasing, or ask me about the org, pricing or customization.'); return; }
      var dept=ENG.SEATS.depts.filter(function(x){return x.key===dk;})[0]||{name:dk,gate:80};
      var vd=r.verdict, passed=r.passed;
      var reasons=(vd.reasons||[]).map(function(x){return '<li><span class="aecoo-rtag '+esc(x.t)+'">'+esc((x.t||'').toUpperCase())+'</span><span>'+esc(x.s)+'</span></li>';}).join('');
      var head=passed?esc(vd.stance):(esc(coo.name)+': Holding this for you — '+esc(dept.name)+' came in at '+vd.conf+'%, under its '+dept.gate+'% bar, so it needs a human. '+esc(vd.stance));
      bubble('coo'+(passed?'':' held'), head+
        '<ul class="aecoo-reasons">'+reasons+'</ul>'+
        '<div class="aecoo-meta">'+esc(dept.name)+' · '+vd.conf+'% vs '+dept.gate+'% bar · '+(passed?'released':'held — needs you')+'</div>');
    }
    fab.onclick=function(){ panel.classList.toggle('open'); if(panel.classList.contains('open')) setTimeout(function(){input.focus();},50); };
    panel.querySelector('.aecoo-x').onclick=function(){ panel.classList.remove('open'); };
    panel.querySelector('#aeCooSend').onclick=function(){ ask(input.value); };
    input.addEventListener('keydown',function(e){ if(e.key==='Enter') ask(input.value); });
    Array.prototype.forEach.call(panel.querySelectorAll('.aecoo-chip'),function(c){ c.onclick=function(){ ask(c.textContent); }; });
  }
  function boot(){ init(); setTimeout(init,200); setTimeout(init,600); setTimeout(init,1400); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();


/* ── AE Connect — hub-wide incoming-call watcher (ae-connect-watcher) ── */
(function(){
  if (typeof document==='undefined') return;
  var API=(window.AE4BARREL_API||'https://ae-connect-api.vercel.app')+'/api/connect', NS='4barrel';
  function me(){ try{ return JSON.parse(sessionStorage.getItem('4barrel_connect_me')); }catch(e){ return null; } }
  function post(p){ return fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({ns:NS},p))}).then(function(r){return r.json();}).catch(function(){return {ok:false};}); }
  var showing=false;
  function card(r){
    if(showing)return; showing=true;
    var d=document.createElement('div');
    d.style.cssText='position:fixed;right:18px;top:74px;z-index:9600;background:#161d24;color:#eaf1f6;border-radius:14px;padding:16px 18px;box-shadow:0 20px 60px rgba(0,0,0,.45);max-width:300px;font-family:system-ui,sans-serif;border-left:4px solid #e8a33d';
    d.innerHTML='<div style="font-weight:700;font-size:15px">\ud83d\udcf9 '+(r.name||'Someone')+' is calling</div>'+
      '<div style="font-size:12px;opacity:.7;margin:3px 0 12px">'+(r.subject||'Incoming video call')+'</div>'+
      '<button id="aeJoin" style="font:inherit;font-weight:700;background:#e8a33d;color:#241a08;border:none;border-radius:9px;padding:10px 16px;cursor:pointer">Join</button> '+
      '<button id="aeDis" style="font:inherit;background:none;border:1px solid #3f5468;color:#9fb2c2;border-radius:9px;padding:10px 14px;cursor:pointer">Dismiss</button>';
    document.body.appendChild(d);
    function done(){ try{document.body.removeChild(d);}catch(e){} showing=false; }
    d.querySelector('#aeDis').onclick=done;
    d.querySelector('#aeJoin').onclick=function(){ done(); var m=me();
      function go(){ window.FBMeet.open({room:r.room,displayName:m?m.name:'Guest',subject:r.subject||''}); }
      if(window.FBMeet) go(); else { var sc=document.createElement('script'); sc.src='4barrel-rtc.js'; sc.onload=go; document.head.appendChild(sc); } };
  }
  function tick(){ var m=me(); if(!m) return;
    post({do:'poll',me:m.slug}).then(function(r){
      if(r&&r.ok&&r.ring&&r.ring.room) card(r.ring);
      if(r&&r.ok&&typeof r.unread==='number'){
        var a=document.querySelector('a[href="connect.html"]');
        if(a){ var b=a.querySelector('.ae-ub');
          if(r.unread>0){ if(!b){ b=document.createElement('span'); b.className='ae-ub';
            b.style.cssText='display:inline-block;min-width:17px;text-align:center;background:#e8a33d;color:#241a08;border-radius:999px;font-size:10.5px;font-weight:700;padding:1px 5px;margin-left:7px'; a.appendChild(b); }
            b.textContent=r.unread; } else if(b){ b.remove(); } } }
    }); }
  setInterval(tick,6000); setTimeout(tick,1500);
})();

/* ── AE Command Center charts (ae-charts) ─────────────────────────────────
   Adaptive: reads whatever this OS actually stores, finds the money series,
   and draws it. Appended to the engine so no dashboard edits are needed.
   Fails silent — if there's nothing numeric to draw, nothing renders.      */
(function(){
  if (typeof document==='undefined') return;
  if (!/dashboard/.test(location.pathname)) return;
  var NAMES=['FB','Fourbarrel','Amph','EightMM','Truss','Abode','LilNinja','Buttress','Musical','MusicalCore','Showroom'];
  function eng(){ for(var i=0;i<NAMES.length;i++){ var g=window[NAMES[i]]; if(g&&typeof g.db==='function') return g; } return null; }
  function cvar(list,fb){ try{ var cs=getComputedStyle(document.documentElement);
    for(var i=0;i<list.length;i++){ var v=(cs.getPropertyValue(list[i])||'').trim(); if(v) return v; } }catch(e){} return fb; }
  var MONEYRE=/fee|price|amount|total|revenue|cost|value|gross|net|tuition|billed|budget|earned|paid|guarantee|sale|msrp|acq/i;
  var LABELRE=/^(name|title|project|show|production|unit|family|account|client|customer|patron|vehicle|item|label|company|program|artist|address|make)$/i;
  var CATRE=/^(phase|status|stage|type|category|kind|dept|department|state|tier|track|discipline|genre)$/i;
  var BAD=/^(id|key|uid|number|vin|stock)$/i;
  function pick(r,f){ return f.indexOf('.')>0 ? ((r[f.split('.')[0]]||{})[f.split('.')[1]]) : r[f]; }

  function discover(d){
    var best=null;
    Object.keys(d||{}).forEach(function(k){
      var a=d[k];
      if(!Array.isArray(a)||a.length<2||typeof a[0]!=='object'||!a[0]) return;
      var fields=[];
      Object.keys(a[0]).forEach(function(f){ var v=a[0][f];
        if(v&&typeof v==='object'&&!Array.isArray(v)){ Object.keys(v).forEach(function(s){ if(typeof v[s]==='number') fields.push(f+'.'+s); }); }
        else fields.push(f); });
      fields.forEach(function(f){
        var vals=a.map(function(r){ return Number(pick(r,f)); }).filter(function(n){ return isFinite(n); });
        if(vals.length<Math.max(2,Math.floor(a.length*0.6))) return;
        var sum=vals.reduce(function(x,y){return x+y;},0); if(!(sum>0)) return;
        var money=MONEYRE.test(f.split('.').pop())||MONEYRE.test(f);
        var score=sum*(money?1000:1);
        if(!best||score>best.score) best={coll:k,rows:a,field:f,sum:sum,money:money,score:score};
      });
    });
    if(!best) return null;
    var k0=Object.keys(best.rows[0]||{});
    best.label=k0.filter(function(f){ return LABELRE.test(f)&&typeof best.rows[0][f]==='string'; })[0]
            || k0.filter(function(f){ return !BAD.test(f)&&typeof best.rows[0][f]==='string'&&String(best.rows[0][f]).length>2; })[0]
            || k0.filter(function(f){ return typeof best.rows[0][f]==='string'; })[0] || null;
    best.cat=k0.filter(function(f){ if(!CATRE.test(f)) return false;
      var set={}; best.rows.forEach(function(r){ if(typeof r[f]==='string') set[r[f]]=1; });
      var n=Object.keys(set).length; return n>=2&&n<=6; })[0]||null;
    return best;
  }

  function build(){
    var E=eng(); if(!E) return;
    var content=document.getElementById('content'); if(!content) return;
    if(document.getElementById('aeChartCard')) return;
    var d; try{ d=E.db(); }catch(e){ return; }
    var S=discover(d); if(!S) return;

    var ACC =cvar(['--blue','--accent','--primary','--brand','--a-money','--a-projects','--teal'],'#4a7fa5');
    var ACC2=cvar(['--blue-2','--brand-2','--a-books','--a-field'],ACC);
    var HI  =cvar(['--amber','--gold','--amber-3','--brand-glow'],'#c9871f');
    var TRK =cvar(['--sunk','--line-2','--line'],'rgba(128,128,128,.18)');
    var INK =cvar(['--ink'],'#1b1f22'), MUT=cvar(['--mut','--ink-2'],'#7b8288');

    function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
    function fmt(n){ n=Number(n)||0;
      if(!S.money) return String(Math.round(n));
      if(n>=1000000) return '$'+(n/1000000).toFixed(2).replace(/\.?0+$/,'')+'M';
      if(n>=1000) return '$'+Math.round(n/1000)+'k';
      return '$'+Math.round(n); }
    function words(s){ s=String(s==null?'':s); return s.length>26?s.slice(0,25)+'…':s; }
    function title(s){ return String(s).replace(/[._-]/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();}); }

    /* --- bars: top rows by value --- */
    var rows=S.rows.slice().map(function(r){ return {l:S.label?r[S.label]:'—', v:Number(pick(r,S.field))||0}; })
                   .filter(function(r){ return r.v>0; })
                   .sort(function(a,b){ return b.v-a.v; }).slice(0,6);
    var max=Math.max.apply(null,rows.map(function(r){return r.v;}).concat([1]));
    var W=760,labW=190,valW=76,barW=W-labW-valW,rowH=32,H=rows.length*rowH+6,g1='';
    rows.forEach(function(r,i){
      var y=i*rowH+4, w=Math.max(2,(r.v/max)*barW);
      g1+='<text x="0" y="'+(y+15)+'" font-size="11.5" fill="'+MUT+'" font-family="system-ui,sans-serif">'+esc(words(r.l))+'</text>'
        +'<rect x="'+labW+'" y="'+(y+4)+'" width="'+barW+'" height="14" rx="4" fill="'+TRK+'"/>'
        +'<rect x="'+labW+'" y="'+(y+4)+'" width="'+w+'" height="14" rx="4" fill="'+(i===0?HI:ACC)+'"/>'
        +'<text x="'+W+'" y="'+(y+15)+'" text-anchor="end" font-size="11" font-weight="600" fill="'+INK+'" font-family="ui-monospace,Menlo,monospace">'+fmt(r.v)+'</text>';
    });

    /* --- donut by category --- */
    var g2='',leg='';
    if(S.cat){
      var by={},tot=0;
      S.rows.forEach(function(r){ var c=r[S.cat]; if(typeof c!=='string')return;
        var v=Number(pick(r,S.field))||0; if(!(v>0))return; by[c]=(by[c]||0)+v; tot+=v; });
      var keys=Object.keys(by).sort(function(a,b){return by[b]-by[a];});
      var PAL=[ACC,HI,ACC2,'#6a8f7a','#8a7fa8','#a8865f'];
      var R=52,CX=68,CY=68,C=2*Math.PI*R,off=0;
      keys.forEach(function(k,i){ var fr=tot?by[k]/tot:0; if(fr<=0)return;
        g2+='<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="'+PAL[i%PAL.length]+'" stroke-width="19" stroke-dasharray="'+(fr*C)+' '+C+'" stroke-dashoffset="'+(-off*C)+'" transform="rotate(-90 '+CX+' '+CY+')"/>';
        leg+='<span style="display:inline-flex;align-items:center;gap:6px;margin:0 12px 7px 0;font-size:12px;color:'+MUT+'"><i style="width:10px;height:10px;border-radius:3px;background:'+PAL[i%PAL.length]+';display:inline-block"></i>'+esc(k)+' · '+fmt(by[k])+'</span>';
        off+=fr; });
      g2+='<text x="'+CX+'" y="'+(CY-1)+'" text-anchor="middle" font-size="14" font-weight="700" fill="'+INK+'" font-family="system-ui,sans-serif">'+fmt(tot)+'</text>'
        +'<text x="'+CX+'" y="'+(CY+13)+'" text-anchor="middle" font-size="8.5" fill="'+MUT+'" font-family="ui-monospace,Menlo,monospace">TOTAL</text>';
    }

    /* --- KPI bullets vs target bands (only if this engine publishes them) --- */
    var g3='';
    try{
      if(typeof E.kpis==='function'){
        var ks=E.kpis().filter(function(k){ return k.bench&&k.bench.target&&typeof k.value==='number'; }).slice(0,3);
        ks.forEach(function(k,i){
          var lo=k.bench.target[0],hi=k.bench.target[1],mx=Math.max(hi*1.35,k.value*1.1),bw=400,x0=132,y0=i*34+12;
          var vx=Math.min(bw,(k.value/mx)*bw),lx=(lo/mx)*bw,hx=(hi/mx)*bw,inb=k.value>=lo&&k.value<=hi;
          var val=(k.fmt==='pct')?Math.round(k.value)+'%':(k.fmt==='x')?k.value.toFixed(2)+'x':Math.round(k.value);
          g3+='<text x="0" y="'+(y0+11)+'" font-size="11.5" fill="'+MUT+'" font-family="system-ui,sans-serif">'+esc(k.label||k.k)+'</text>'
            +'<rect x="'+x0+'" y="'+y0+'" width="'+bw+'" height="13" rx="4" fill="'+TRK+'"/>'
            +'<rect x="'+(x0+lx)+'" y="'+y0+'" width="'+Math.max(2,hx-lx)+'" height="13" fill="none" stroke="'+ACC+'" stroke-dasharray="3 3"/>'
            +'<rect x="'+x0+'" y="'+(y0+3)+'" width="'+vx+'" height="7" rx="3" fill="'+(inb?ACC:HI)+'"/>'
            +'<text x="'+(x0+bw+8)+'" y="'+(y0+11)+'" font-size="11" font-weight="700" fill="'+(inb?ACC:HI)+'" font-family="ui-monospace,Menlo,monospace">'+val+'</text>';
        });
      }
    }catch(e){}

    var card=document.createElement('div');
    card.className='card'; card.id='aeChartCard';
    var heading=(S.money?'The money, drawn':'The numbers, drawn');
    card.innerHTML='<h2 style="margin:0 0 4px">'+heading+'</h2>'+
      '<div class="card-sub" style="margin-bottom:14px">Same figures as the tables below, as pictures — computed live from this system\'s own data, nothing hand-entered.</div>'+
      '<div style="border:1px solid '+TRK+';border-radius:12px;padding:14px 16px 10px;margin-bottom:14px">'+
        '<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:'+MUT+';margin-bottom:8px">Top '+esc(title(S.coll))+' by '+esc(title(S.field.split('.').pop()))+'</div>'+
        '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block">'+g1+'</svg></div>'+
      (g2?'<div style="display:grid;grid-template-columns:1fr 1.15fr;gap:14px">'+
        '<div style="border:1px solid '+TRK+';border-radius:12px;padding:14px 16px">'+
          '<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:'+MUT+';margin-bottom:8px">By '+esc(title(S.cat))+'</div>'+
          '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><svg viewBox="0 0 136 136" style="max-width:136px;width:100%;height:auto">'+g2+'</svg>'+
          '<div style="flex:1;min-width:120px">'+leg+'</div></div></div>'+
        (g3?'<div style="border:1px solid '+TRK+';border-radius:12px;padding:14px 16px"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:'+MUT+';margin-bottom:8px">Health vs. target band</div><svg viewBox="0 0 560 '+(Math.max(1,Math.min(3,3))*34+14)+'" style="width:100%;height:auto">'+g3+'</svg></div>':'<div></div>')+
      '</div>':(g3?'<div style="border:1px solid '+TRK+';border-radius:12px;padding:14px 16px"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:'+MUT+';margin-bottom:8px">Health vs. target band</div><svg viewBox="0 0 560 116" style="width:100%;height:auto">'+g3+'</svg></div>':''));

    var first=content.querySelector('.card');
    if(first&&first.nextSibling) content.insertBefore(card,first.nextSibling);
    else content.appendChild(card);
  }
  function boot(){ build(); setTimeout(build,300); setTimeout(build,1200); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
