/* 4barrel OS — data layer. KV-first (/api/data) with a localStorage fallback + sample
   inventory so the hub is fully clickable the moment it deploys, before any keys are set.
   Collections: vehicles (the lot spine), buyers (CRM), deals (sold + gross), recon (shop).
   Accelerated Experiences, LLC. */
window.SR = (function () {
  var SESS = (new URLSearchParams(location.search).get("sess")) || (function(){try{return localStorage.getItem("hub_sess")||"";}catch(e){return "";}})();
  var VSTATUS = ["Available","Reconditioning","Pending","Sold"];
  var STAGES  = ["Lead","Contacted","Test Drive","Financing","Sold"];
  var RSTATUS = ["In shop","Waiting parts","Ready"];
  var SEED_VERSION = "2026-07-16-4barrel-1";

  var SEED_VEHICLES = [
    { id:"v1",  stock:"S1042", year:2021, make:"Porsche",   model:"Macan",              trim:"S",              body:"SUV",   color:"Carrara White",   mileage:28400, price:52900, cost:44500, reconCost:1200, status:"Available",       acquired:"Trade-in",    vin:"…KLB417", daysOnLot:9,  notes:"One owner, clean. Premium Plus package." },
    { id:"v2",  stock:"S1039", year:2020, make:"Tesla",     model:"Model 3",            trim:"Long Range AWD", body:"Sedan", color:"Midnight Silver", mileage:33900, price:28400, cost:23800, reconCost:600,  status:"Available",       acquired:"Auction",     vin:"…JF2210", daysOnLot:14, notes:"New tires; software up to date." },
    { id:"v3",  stock:"S1051", year:2023, make:"Mazda",     model:"CX-5",               trim:"Premium",        body:"SUV",   color:"Soul Red",        mileage:12100, price:28900, cost:25200, reconCost:400,  status:"Available",       acquired:"Trade-in",    vin:"…N9M884", daysOnLot:4,  notes:"Like new; still under factory warranty." },
    { id:"v4",  stock:"S1017", year:2019, make:"Toyota",    model:"4Runner",            trim:"TRD Off-Road",   body:"SUV",   color:"Cement",          mileage:61200, price:34900, cost:29500, reconCost:900,  status:"Available",       acquired:"Trade-in",    vin:"…H5K077", daysOnLot:22, notes:"KDSS; well maintained, records on file." },
    { id:"v5",  stock:"S1044", year:2018, make:"BMW",       model:"M240i",              trim:"",               body:"Coupe", color:"Estoril Blue",    mileage:41000, price:31900, cost:27000, reconCost:1500, status:"Reconditioning", acquired:"Auction",     vin:"…P2J561", daysOnLot:6,  notes:"In shop — brakes + detail." },
    { id:"v6",  stock:"S1031", year:2016, make:"Chevrolet", model:"Corvette",           trim:"Stingray 2LT",   body:"Coupe", color:"Torch Red",       mileage:33200, price:44900, cost:38000, reconCost:800,  status:"Available",       acquired:"Consignment", vin:"…G1F903", daysOnLot:31, notes:"Showpiece for the front row." },
    { id:"v7",  stock:"S1048", year:2021, make:"Subaru",    model:"Outback",            trim:"Onyx XT",        body:"Wagon", color:"Magnetite Gray",  mileage:38700, price:27800, cost:24000, reconCost:500,  status:"Available",       acquired:"Trade-in",    vin:"…C4T219", daysOnLot:11, notes:"Turbo; popular locally." },
    { id:"v8",  stock:"S1022", year:2020, make:"Ford",      model:"F-150",              trim:"Lariat 4x4",     body:"Truck", color:"Agate Black",     mileage:48100, price:38500, cost:33000, reconCost:1100, status:"Pending",         acquired:"Trade-in",    vin:"…B8R640", daysOnLot:18, notes:"Deposit taken; financing in progress." },
    { id:"v9",  stock:"S1009", year:2017, make:"Lexus",     model:"RX 350",             trim:"",               body:"SUV",   color:"Nebula Gray",     mileage:72400, price:26400, cost:22500, reconCost:700,  status:"Available",       acquired:"Auction",     vin:"…D3M118", daysOnLot:27, notes:"Rock-solid; great value SUV." },
    { id:"v10", stock:"S1046", year:2022, make:"Audi",      model:"Q5",                 trim:"Premium Plus",   body:"SUV",   color:"Mythos Black",    mileage:26100, price:36900, cost:31500, reconCost:900,  status:"Reconditioning", acquired:"Trade-in",    vin:"…F7K552", daysOnLot:5,  notes:"In shop — tires + software." },
    { id:"v11", stock:"S1002", year:2019, make:"Jeep",      model:"Wrangler Unlimited", trim:"Sahara",         body:"SUV",   color:"Bikini Pearl",    mileage:55300, price:32900, cost:28000, reconCost:600,  status:"Available",       acquired:"Trade-in",    vin:"…A1J904", daysOnLot:40, notes:"Aging — consider a price move." },
    { id:"v12", stock:"S1053", year:2023, make:"Honda",     model:"CR-V",               trim:"EX-L",           body:"SUV",   color:"Sonic Gray",      mileage:21800, price:29500, cost:25800, reconCost:350,  status:"Available",       acquired:"Trade-in",    vin:"…E6N330", daysOnLot:3,  notes:"Fresh trade; will move fast." }
  ];
  var SEED_BUYERS = [
    { id:"b1", name:"Marcus & Lena Hill", phone:"(208) 555-0143", email:"hills@example.com",   interest:"S1042 Porsche Macan S", stage:"Test Drive", source:"Website",   budget:55000, notes:"Coming Saturday 11am for a drive." },
    { id:"b2", name:"Derek Olsen",        phone:"(208) 555-0187", email:"dolsen@example.com",  interest:"S1022 F-150 Lariat",   stage:"Financing",  source:"Cars.com",  budget:40000, notes:"Deposit down; credit app submitted." },
    { id:"b3", name:"Priya Raman",        phone:"(208) 555-0166", email:"praman@example.com",  interest:"3-row SUV under $30k", stage:"Contacted",  source:"Referral",  budget:30000, notes:"Wants CR-V or RX; sent both." },
    { id:"b4", name:"Tyler Brooks",       phone:"(208) 555-0120", email:"tbrooks@example.com", interest:"S1031 Corvette",       stage:"Lead",       source:"Instagram", budget:45000, notes:"Follow up once." },
    { id:"b5", name:"Angela Ruiz",        phone:"(208) 555-0158", email:"aruiz@example.com",   interest:"S1051 CX-5 Premium",   stage:"Test Drive", source:"Website",   budget:30000, notes:"Loved it; deciding on color." },
    { id:"b6", name:"The Nguyens",        phone:"(208) 555-0134", email:"nguyens@example.com", interest:"Outback or 4Runner",   stage:"Lead",       source:"Walk-in",   budget:35000, notes:"Comparing AWD wagons vs SUV." },
    { id:"b7", name:"Sam Whitfield",      phone:"(208) 555-0176", email:"swhit@example.com",   interest:"S1002 Wrangler",       stage:"Contacted",  source:"Website",   budget:33000, notes:"Asked about trade value on his Tacoma." }
  ];
  var SEED_DEALS = [
    { id:"d1", stock:"S0998", vehicle:"2020 Audi A4 Premium",     buyer:"Karen Diaz",  salePrice:29900, cost:24800, reconCost:700,  gross:4400, soldDate:"2026-07-12", salesperson:"Jordan", fi:1200, notes:"Extended warranty added." },
    { id:"d2", stock:"S0991", vehicle:"2018 Toyota Tacoma TRD",   buyer:"Erik Sund",   salePrice:33400, cost:28900, reconCost:600,  gross:3900, soldDate:"2026-07-09", salesperson:"Casey",  fi:900,  notes:"Cash deal." },
    { id:"d3", stock:"S0985", vehicle:"2021 Honda Accord Sport",  buyer:"Mia Cole",    salePrice:26900, cost:23100, reconCost:500,  gross:3300, soldDate:"2026-07-05", salesperson:"Jordan", fi:1500, notes:"Financed, in-house lender." },
    { id:"d4", stock:"S0979", vehicle:"2019 GMC Sierra SLT",      buyer:"Dan Pruitt",  salePrice:41900, cost:35800, reconCost:1100, gross:5000, soldDate:"2026-06-30", salesperson:"Casey",  fi:1800, notes:"Trade + finance; strong gross." },
    { id:"d5", stock:"S0972", vehicle:"2022 Kia Telluride SX",    buyer:"The Alberts", salePrice:42500, cost:37200, reconCost:800,  gross:4500, soldDate:"2026-06-24", salesperson:"Jordan", fi:1300, notes:"Waitlist buyer." }
  ];
  var SEED_RECON = [
    { id:"r1", stock:"S1044", vehicle:"2018 BMW M240i",             tech:"Miguel", checklist:{ inspection:true, mechanical:true,  detail:false, tires:true,  photos:false }, reconCost:1500, status:"In shop",       notes:"Front brakes done; detail + photos left." },
    { id:"r2", stock:"S1046", vehicle:"2022 Audi Q5 Premium+",      tech:"Dana",   checklist:{ inspection:true, mechanical:false, detail:false, tires:false, photos:false }, reconCost:900,  status:"Waiting parts", notes:"Rear tires on order." },
    { id:"r3", stock:"S1039", vehicle:"2020 Tesla Model 3 LR",      tech:"Miguel", checklist:{ inspection:true, mechanical:true,  detail:true,  tires:true,  photos:true  }, reconCost:600,  status:"Ready",         notes:"Cleared for the line." },
    { id:"r4", stock:"S1017", vehicle:"2019 Toyota 4Runner TRD",    tech:"Dana",   checklist:{ inspection:true, mechanical:true,  detail:true,  tires:false, photos:true  }, reconCost:900,  status:"In shop",       notes:"Needs one tire; then done." }
  ];

  var SEEDS = { vehicles:SEED_VEHICLES, buyers:SEED_BUYERS, deals:SEED_DEALS, recon:SEED_RECON };

  function lkey(c){ return "sr:"+c; }
  function seedIfEmpty(){
    try{
      if(localStorage.getItem("sr:seed_version")!==SEED_VERSION){
        Object.keys(SEEDS).forEach(function(c){ localStorage.setItem(lkey(c), JSON.stringify(SEEDS[c])); });
        localStorage.setItem("sr:seed_version", SEED_VERSION); return;
      }
      Object.keys(SEEDS).forEach(function(c){ if(!localStorage.getItem(lkey(c))) localStorage.setItem(lkey(c), JSON.stringify(SEEDS[c])); });
    }catch(e){}
  }
  function lget(c){ try{ return JSON.parse(localStorage.getItem(lkey(c))||"[]"); }catch(e){ return []; } }
  function lset(c,a){ try{ localStorage.setItem(lkey(c), JSON.stringify(a)); }catch(e){} }

  async function api(action, body){
    return fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({action:action,sess:SESS},body))}).then(function(r){return r.json();});
  }
  async function list(c){
    try{ var j=await api("list",{collection:c}); if(j&&j.ok){ lset(c,j.records); return j.records; } }catch(e){}
    seedIfEmpty(); return lget(c);
  }
  async function save(c,rec){
    try{ var j=await api("save",{collection:c,record:rec}); if(j&&j.ok){ return j; } }catch(e){}
    var a=lget(c), now=new Date().toISOString();
    if(!rec.id){ rec.id="r"+Date.now().toString(36); rec.createdAt=now; rec.updatedAt=now; a.push(rec); }
    else{ var i=a.findIndex(function(x){return x.id===rec.id;}); rec.updatedAt=now; if(i>=0)a[i]=Object.assign({},a[i],rec); else a.push(rec); }
    lset(c,a); return {ok:true,id:rec.id,local:true};
  }
  async function del(c,id){
    try{ var j=await api("delete",{collection:c,id:id}); if(j&&j.ok)return j; }catch(e){}
    lset(c, lget(c).filter(function(x){return x.id!==id;})); return {ok:true,local:true};
  }
  return { list:list, save:save, del:del, VSTATUS:VSTATUS, STAGES:STAGES, RSTATUS:RSTATUS, SESS:SESS };
})();
