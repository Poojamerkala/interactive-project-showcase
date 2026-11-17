import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Compass,
  Factory,
  FilePlus2,
  Filter,
  Leaf,
  LocateFixed,
  MapPin,
  Menu,
  PackageCheck,
  Recycle,
  Search,
  Sparkles,
  Truck,
  Upload,
  Waves,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import recoveryPhoto from "@/assets/blue-loop-recovery.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blueloop | A better loop for every resource" },
      {
        name: "description",
        content: "Identify waste, discover useful next steps, and find a recycling partner in this Blueloop demo.",
      },
      { property: "og:title", content: "Blueloop | A better loop for every resource" },
      {
        property: "og:description",
        content: "Identify waste, discover useful next steps, and find a recycling partner in this Blueloop demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlueloopHome,
});

const categories = ["Plastic", "Paper", "Glass", "E-waste", "Textile", "Metal", "Coastal"];
const categoriesWithIcons = [
  { name: "Plastic", icon: Recycle, color: "text-primary", amount: "36.8 kg" },
  { name: "Paper", icon: FilePlus2, color: "text-amber", amount: "28.4 kg" },
  { name: "Glass", icon: CircleDot, color: "text-water", amount: "18.2 kg" },
  { name: "E-waste", icon: Sparkles, color: "text-foreground", amount: "12.6 kg" },
  { name: "Textile", icon: Waves, color: "text-water", amount: "9.8 kg" },
  { name: "Metal", icon: Factory, color: "text-muted-foreground", amount: "7.4 kg" },
  { name: "Coastal", icon: Leaf, color: "text-primary", amount: "4.8 kg" },
];

type Status = "Matched" | "In progress" | "Awaiting pickup";
type RequestItem = {
  id: string;
  category: string;
  material: string;
  quantity: number;
  unit: string;
  location: string;
  status: Status;
  partner: string;
  date: string;
  initials: string;
};

const initialRequests: RequestItem[] = [
  { id: "BL-0248", category: "Plastic", material: "PET bottles", quantity: 18, unit: "kg", location: "Kadri, Mangaluru", status: "Matched", partner: "Coastline Recyclers", date: "Today, 10:42 am", initials: "CR" },
  { id: "BL-0247", category: "Paper", material: "Cardboard & paper", quantity: 32, unit: "kg", location: "Bejai, Mangaluru", status: "In progress", partner: "GreenFold Paper Works", date: "Today, 9:16 am", initials: "GF" },
  { id: "BL-0246", category: "E-waste", material: "Small electronics", quantity: 6, unit: "kg", location: "Bendoor, Mangaluru", status: "Awaiting pickup", partner: "ReCircuit Karnataka", date: "Yesterday", initials: "RK" },
  { id: "BL-0245", category: "Glass", material: "Mixed glass bottles", quantity: 14, unit: "kg", location: "Derebail, Mangaluru", status: "Matched", partner: "Coastline Recyclers", date: "Yesterday", initials: "CR" },
];

const partners = [
  { name: "Coastline Recyclers", kind: "Plastic · Glass · Coastal", distance: "2.4 km", match: 96, initials: "CR", color: "bg-leaf text-primary" },
  { name: "GreenFold Paper Works", kind: "Paper · Cardboard", distance: "4.1 km", match: 91, initials: "GF", color: "bg-amber/35 text-foreground" },
  { name: "ReCircuit Karnataka", kind: "E-waste · Electronics", distance: "6.8 km", match: 87, initials: "RK", color: "bg-water/20 text-water" },
];

const workflow = [
  { label: "Identify", icon: Sparkles },
  { label: "Find a new use", icon: Compass },
  { label: "Match a partner", icon: Factory },
  { label: "Close the loop", icon: Recycle },
];

function BlueloopHome() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requests, setRequests] = useState(initialRequests);
  const [categoryFilter, setCategoryFilter] = useState("All materials");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Plastic");
  const [quantity, setQuantity] = useState("18");
  const [condition, setCondition] = useState("Clean & sorted");
  const [location, setLocation] = useState("Kadri, Mangaluru");
  const [fileName, setFileName] = useState("");
  const [scanState, setScanState] = useState<"idle" | "done">("idle");
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filteredRequests = useMemo(
    () => requests.filter((request) => {
      const matchesCategory = categoryFilter === "All materials" || request.category === categoryFilter;
      const matchesSearch = `${request.id} ${request.material} ${request.location} ${request.partner}`
        .toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }),
    [categoryFilter, requests, searchTerm],
  );

  function openNewRequest() {
    setIsDialogOpen(true);
    setScanState("idle");
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setScanState("idle");
    }
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return;
    const nextId = `BL-${String(248 + requests.length - initialRequests.length + 1).padStart(4, "0")}`;
    const materialNames: Record<string, string> = {
      Plastic: "PET bottles", Paper: "Cardboard & paper", Glass: "Mixed glass bottles",
      "E-waste": "Small electronics", Textile: "Reusable fabric", Metal: "Mixed metal scraps", Coastal: "Coastal cleanup material",
    };
    const partner = partners.find((item) => item.kind.toLowerCase().includes(category.toLowerCase()));
    const newRequest: RequestItem = {
      id: nextId,
      category,
      material: materialNames[category] ?? category,
      quantity: parsedQuantity,
      unit: "kg",
      location: location.trim() || "Mangaluru",
      status: "Matched",
      partner: partner?.name ?? "Coastline Recyclers",
      date: "Just now",
      initials: partner?.initials ?? "CR",
    };
    setRequests((current) => [newRequest, ...current]);
    setIsDialogOpen(false);
    setActiveTab("Requests");
    setToastMessage(`${newRequest.id} added to your requests`);
    window.setTimeout(() => setToastMessage(""), 3200);
    setFileName("");
  }

  function navigate(tab: string) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }

  const tabs = [
    { label: "Overview", icon: BarChart3 },
    { label: "Requests", icon: PackageCheck },
    { label: "Partners", icon: Factory },
    { label: "Impact", icon: Leaf },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[242px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
          <Brand />
          <div className="mx-5 mt-9 rounded-md border border-primary/15 bg-background/65 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" /> Community hub
            </div>
            <p className="mt-2 text-sm font-semibold">Mangaluru, Karnataka</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" /> Local demo network</p>
          </div>
          <p className="mb-2 mt-8 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
          <nav className="space-y-1 px-3" aria-label="Main navigation">
            {tabs.map((tab) => (
              <button key={tab.label} onClick={() => navigate(tab.label)} className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${activeTab === tab.label ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"}`}>
                <tab.icon className="size-4" /> {tab.label}
                {tab.label === "Requests" && <span className={`ml-auto text-xs ${activeTab === tab.label ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{requests.length}</span>}
              </button>
            ))}
          </nav>
          <div className="mx-5 mt-auto mb-5 rounded-md bg-secondary/75 p-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-background text-primary"><Waves className="size-4" /></div>
            <p className="mt-3 text-sm font-semibold">Every kilo counts.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Small local actions add up to a cleaner coastline.</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary"><Leaf className="size-3.5" /> Keep the loop going</div>
          </div>
          <div className="flex items-center gap-3 border-t border-sidebar-border px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Leaf className="size-4" /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Community account</p><p className="text-xs text-muted-foreground">Mangaluru hub</p></div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <button aria-label="Open navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"><Menu className="size-5" /></button>
              <div className="lg:hidden"><Brand compact /></div>
              <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span>Community</span><ChevronRight className="size-3.5" /><span className="font-medium text-foreground">{activeTab}</span></div>
              <div className="sm:hidden text-sm font-semibold">{activeTab}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-primary sm:flex"><span className="size-1.5 rounded-full bg-primary" /> Demo workspace</span>
              <button aria-label="Notifications" title="Notifications" className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"><Bell className="size-[18px]" /><span className="absolute right-[7px] top-[7px] size-1.5 rounded-full bg-amber" /></button>
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Leaf className="size-4" /></div>
            </div>
          </header>
          {mobileMenuOpen && <nav className="absolute z-40 w-full space-y-1 border-b border-border bg-background p-3 shadow-md lg:hidden" aria-label="Mobile navigation">{tabs.map((tab) => <button key={tab.label} onClick={() => navigate(tab.label)} className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium ${activeTab === tab.label ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted"}`}><tab.icon className="size-4" />{tab.label}</button>)}</nav>}

          <main className="mx-auto max-w-[1220px] px-4 pb-14 pt-7 sm:px-8 sm:pt-9">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.13em] text-primary">Mangaluru community</p><h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[34px]">A better loop for every resource</h1><p className="mt-1.5 text-sm text-muted-foreground">A little less waste. A lot more possibility.</p></div>
              <Button onClick={openNewRequest} className="h-10 gap-2"><FilePlus2 className="size-4" /> New waste request</Button>
            </div>

            {activeTab === "Overview" && <OverviewView requests={requests} onNewRequest={openNewRequest} onNavigate={navigate} onShowAll={() => setShowAllRequests(true)} />}
            {activeTab === "Requests" && <RequestsView requests={filteredRequests} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onNewRequest={openNewRequest} />}
            {activeTab === "Partners" && <PartnersView />}
            {activeTab === "Impact" && <ImpactView />}
          </main>
        </div>
      </div>

      {isDialogOpen && <NewRequestDialog category={category} setCategory={setCategory} quantity={quantity} setQuantity={setQuantity} condition={condition} setCondition={setCondition} location={location} setLocation={setLocation} fileName={fileName} scanState={scanState} setScanState={setScanState} onFileChange={selectImage} onClose={() => setIsDialogOpen(false)} onSubmit={submitRequest} />}
      {showAllRequests && <AllRequestsDialog requests={requests} onClose={() => setShowAllRequests(false)} onNavigate={() => { setShowAllRequests(false); navigate("Requests"); }} />}
      {toastMessage && <div role="status" className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-md border border-primary/25 bg-card px-4 py-3 text-sm font-medium shadow-lg"><CheckCircle2 className="size-4 text-primary" />{toastMessage}</div>}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`flex items-center gap-2.5 ${compact ? "" : "px-5 pt-6"}`}><div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Recycle className="size-[21px]" /></div><div className="leading-none"><span className="font-display text-[19px] font-bold tracking-tight">blue<span className="text-primary">loop</span></span>{!compact && <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.17em] text-muted-foreground">A circular future</p>}</div></div>;
}

function OverviewView({ requests, onNewRequest, onNavigate, onShowAll }: { requests: RequestItem[]; onNewRequest: () => void; onNavigate: (tab: string) => void; onShowAll: () => void }) {
  return <>
    <section className="relative mb-6 min-h-[246px] overflow-hidden rounded-md bg-forest sm:min-h-[266px]">
      <img src={recoveryPhoto} alt="Community volunteers sorting reusable materials at a coastal recovery point" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/15" />
      <div className="relative z-10 flex min-h-[246px] max-w-[580px] flex-col items-start justify-center px-6 py-7 text-primary-foreground sm:min-h-[266px] sm:px-9">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 bg-foreground/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"><Waves className="size-3.5" /> Mangaluru community loop</span>
        <h2 className="font-display max-w-[480px] text-3xl font-semibold leading-tight sm:text-[38px]">What if nothing went to waste?</h2>
        <p className="mt-2 max-w-[370px] text-sm leading-relaxed text-primary-foreground/85">Turn everyday materials into someone else’s starting point.</p>
        <Button variant="secondary" onClick={onNewRequest} className="mt-5 h-9 gap-2">Find a new use <ArrowRight className="size-4" /></Button>
      </div>
      <div className="absolute bottom-3 right-4 z-10 hidden items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium text-foreground sm:flex"><MapPin className="size-3 text-primary" /> Coastal Karnataka</div>
    </section>

    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard label="Materials recovered" value="118.4" suffix="kg" detail="Across 7 material types" icon={Recycle} iconTone="text-primary" trend="↑ 18%" trendTone="text-primary" />
      <MetricCard label="Requests this month" value="24" suffix="" detail="4 need your attention" icon={PackageCheck} iconTone="text-water" trend="+6" trendTone="text-water" />
      <MetricCard label="Active partner matches" value="12" suffix="" detail="Within 10 km of you" icon={Factory} iconTone="text-amber" trend="Nearby" trendTone="text-foreground" />
      <MetricCard label="CO₂ kept out" value="86" suffix="kg" detail="Estimated community impact" icon={Leaf} iconTone="text-primary" trend="↑ 12%" trendTone="text-primary" />
    </div>

    <section className="mb-6 grid gap-5 lg:grid-cols-[1.58fr_1fr]">
      <div className="min-w-0 rounded-md border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold">Your material loop</h2><p className="mt-1 text-xs text-muted-foreground">A simple path from waste to worth</p></div><span className="rounded-sm bg-secondary px-2 py-1 text-[10px] font-medium text-primary">DEMO WORKFLOW</span></div>
        <div className="grid grid-cols-4 gap-2">{workflow.map((item, index) => <div key={item.label} className="relative min-w-0"><div className="mb-2 flex items-center"><div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${index < 3 ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"}`}><item.icon className="size-4" /></div>{index < workflow.length - 1 && <div className={`h-px flex-1 ${index < 2 ? "bg-primary/35" : "bg-border"}`}><ArrowRight className="relative -right-1 -top-2.5 float-right size-3.5 text-muted-foreground" /></div>}</div><p className="pr-1 text-[10px] font-medium leading-snug sm:text-xs">{item.label}</p></div>)}</div>
        <div className="mt-5 rounded-sm bg-secondary/65 px-3.5 py-3"><div className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="size-3.5 text-primary" /> Possible next use: recycled PET flakes</div><p className="mt-1 pl-[22px] text-[11px] leading-relaxed text-muted-foreground">Sorted bottles can become fibre, packaging, or new containers.</p></div>
      </div>
      <div className="rounded-md border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between"><div><h2 className="text-base font-semibold">Material mix</h2><p className="mt-1 text-xs text-muted-foreground">This month · Mangaluru demo</p></div><button aria-label="See impact" onClick={() => onNavigate("Impact")} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" title="See impact"><ArrowUpRight className="size-4" /></button></div>
        <div className="space-y-3.5">{categoriesWithIcons.slice(0, 4).map((item, i) => <div key={item.name}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="flex items-center gap-2 font-medium"><item.icon className={`size-3.5 ${item.color}`} />{item.name}</span><span className="text-muted-foreground">{item.amount}</span></div><Progress value={[78, 58, 38, 26][i]} className="h-1.5 bg-muted [&>div]:bg-primary" /></div>)}</div>
        <button onClick={() => onNavigate("Impact")} className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Explore community impact <ArrowRight className="size-3" /></button>
      </div>
    </section>

    <section className="mb-6 grid gap-5 lg:grid-cols-[1.58fr_1fr]">
      <div className="min-w-0 rounded-md border border-border bg-card">
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-6"><div><h2 className="text-base font-semibold">Recent requests</h2><p className="mt-1 text-xs text-muted-foreground">Your latest material hand-offs</p></div><button onClick={onShowAll} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">View all <ArrowRight className="size-3" /></button></div>
        <RequestTable requests={requests.slice(0, 3)} />
      </div>
      <div className="rounded-md border border-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-semibold">Around your area</h2><p className="mt-1 text-xs text-muted-foreground">Recycling partners · demo directory</p></div><div className="flex size-8 items-center justify-center rounded-full bg-secondary text-primary"><LocateFixed className="size-4" /></div></div>
        <div className="space-y-4">{partners.slice(0, 3).map((partner) => <div key={partner.name} className="flex items-center gap-3"><div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${partner.color}`}>{partner.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{partner.name}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{partner.kind}</p></div><span className="shrink-0 text-[10px] text-muted-foreground">{partner.distance}</span></div>)}</div>
        <Button variant="outline" onClick={() => onNavigate("Partners")} className="mt-4 h-8 w-full text-xs">Browse partner directory <ArrowRight className="size-3" /></Button>
      </div>
    </section>

    <footer className="flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-[10px] text-muted-foreground sm:flex-row"><p>BLUELOOP · Built for circular communities</p><p className="flex items-center gap-1"><Sparkles className="size-3 text-primary" /> All activity shown is sample demo data</p></footer>
  </>;
}

function MetricCard({ label, value, suffix, detail, icon: Icon, iconTone, trend, trendTone }: { label: string; value: string; suffix: string; detail: string; icon: typeof Recycle; iconTone: string; trend: string; trendTone: string }) {
  return <div className="min-h-[127px] rounded-md border border-border bg-card px-4 py-4 sm:px-5"><div className="mb-3 flex items-center justify-between gap-1"><p className="text-[11px] leading-tight text-muted-foreground sm:text-xs">{label}</p><Icon className={`size-4 shrink-0 ${iconTone}`} /></div><div className="flex flex-wrap items-baseline gap-1.5"><span className="font-display text-[26px] font-semibold leading-none">{value}</span>{suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}<span className={`ml-auto hidden items-center gap-0.5 text-[10px] font-semibold sm:flex ${trendTone}`}><ArrowUpRight className="size-3" />{trend}</span></div><p className="mt-2 text-[10px] text-muted-foreground">{detail}</p></div>;
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Matched: "bg-secondary text-primary",
    "In progress": "bg-water/15 text-water",
    "Awaiting pickup": "bg-amber/25 text-foreground",
  };
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-1 text-[10px] font-medium ${styles[status]}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

function RequestTable({ requests }: { requests: RequestItem[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[540px] border-collapse text-left"><thead><tr className="border-y border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><th className="px-5 py-2.5 font-medium sm:px-6">Material</th><th className="px-3 py-2.5 font-medium">Quantity</th><th className="px-3 py-2.5 font-medium">Partner</th><th className="px-3 py-2.5 font-medium">Status</th><th className="px-5 py-2.5 font-medium sm:px-6">Ref.</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-b border-border/70 last:border-0"><td className="px-5 py-3 sm:px-6"><div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-secondary/70 text-primary"><Recycle className="size-3.5" /></span><span><span className="block text-xs font-medium">{request.material}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{request.category} · {request.location.split(",")[0]}</span></span></div></td><td className="px-3 py-3 text-xs">{request.quantity} {request.unit}</td><td className="px-3 py-3 text-xs">{request.partner}</td><td className="px-3 py-3"><StatusBadge status={request.status} /></td><td className="px-5 py-3 text-[10px] text-muted-foreground sm:px-6">{request.id}</td></tr>)}</tbody></table>{requests.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No requests to show yet.</div>}</div>;
}

function RequestsView({ requests, categoryFilter, setCategoryFilter, searchTerm, setSearchTerm, onNewRequest }: { requests: RequestItem[]; categoryFilter: string; setCategoryFilter: (value: string) => void; searchTerm: string; setSearchTerm: (value: string) => void; onNewRequest: () => void }) {
  return <div>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">Your activity</span><h2 className="mt-1 font-display text-2xl font-semibold">Waste requests</h2><p className="mt-1 text-sm text-muted-foreground">Follow each material from submission to recovery.</p></div><Button onClick={onNewRequest} className="h-9 gap-2"><FilePlus2 className="size-4" /> New request</Button></div>
    <div className="mb-4 flex flex-wrap items-center gap-2.5"><div className="relative min-w-[200px] flex-1 sm:max-w-[340px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search requests" placeholder="Search materials or location" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-9 pl-9" /></div><div className="flex items-center gap-2"><Filter className="size-4 text-muted-foreground" /><select aria-label="Filter by material" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-ring"><option>All materials</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div><span className="ml-auto text-xs text-muted-foreground">{requests.length} requests</span></div>
    <div className="overflow-hidden rounded-md border border-border bg-card"><RequestTable requests={requests} /></div>
    <div className="mt-5 flex items-start gap-3 rounded-md border border-border bg-secondary/45 p-4"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-primary"><Truck className="size-4" /></div><div><p className="text-sm font-medium">Every match starts with a local hand-off.</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Partner and pickup details are illustrative in this demo. No real collection has been scheduled.</p></div></div>
  </div>;
}

function PartnersView() {
  return <div><div className="mb-6"><span className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">Local network</span><h2 className="mt-1 font-display text-2xl font-semibold">Meet your recycling partners</h2><p className="mt-1 text-sm text-muted-foreground">A sample directory of circular businesses around Mangaluru.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{partners.map((partner) => <article key={partner.name} className="rounded-md border border-border bg-card p-5"><div className="flex items-start justify-between"><div className={`flex size-11 items-center justify-center rounded-full text-xs font-bold ${partner.color}`}>{partner.initials}</div><span className="flex items-center gap-1 text-[10px] font-medium text-primary"><MapPin className="size-3" />{partner.distance}</span></div><h3 className="mt-4 text-sm font-semibold">{partner.name}</h3><p className="mt-1 text-xs text-muted-foreground">{partner.kind}</p><div className="mt-4 border-t border-border pt-3"><div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Material match</span><span className="font-semibold text-primary">{partner.match}%</span></div><Progress value={partner.match} className="mt-2 h-1.5 bg-muted [&>div]:bg-primary" /></div><div className="mt-4 flex items-center gap-1.5 rounded-sm bg-secondary/65 px-2.5 py-2 text-[10px] text-primary"><CheckCircle2 className="size-3.5" />Example verified partner · demo only</div></article>)}</div></div>;
}

function ImpactView() {
  const impacts = [
    { title: "A cleaner coastline", text: "Local recovery helps keep valuable materials out of waterways and coastal habitats.", icon: Waves, color: "text-water", stat: "4.8 kg", detail: "coastal materials" },
    { title: "Less new material", text: "Sorted recyclables can become useful feedstock for the next product in the loop.", icon: Recycle, color: "text-primary", stat: "118.4 kg", detail: "recovered materials" },
    { title: "Stronger local links", text: "Better connections make it easier for communities and recyclers to work together.", icon: Factory, color: "text-amber", stat: "12", detail: "sample partner matches" },
  ];
  return <div><div className="mb-6"><span className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">Measuring what matters</span><h2 className="mt-1 font-display text-2xl font-semibold">Impact, in a better loop</h2><p className="mt-1 text-sm text-muted-foreground">An illustrative snapshot of the difference local recovery can make.</p></div><div className="mb-5 rounded-md bg-forest px-6 py-7 text-primary-foreground sm:px-8"><div className="flex flex-wrap items-center justify-between gap-5"><div><span className="text-xs font-medium uppercase tracking-[0.12em] text-primary-foreground/70">Community demo total</span><div className="mt-2 flex items-baseline gap-2"><span className="font-display text-5xl font-semibold">118.4</span><span className="text-base">kg recovered</span></div><p className="mt-2 max-w-md text-xs leading-relaxed text-primary-foreground/75">Sample figures for this prototype, not independently measured or tied to actual pickups.</p></div><div className="flex size-16 items-center justify-center rounded-full border border-primary-foreground/25 bg-primary-foreground/10"><Leaf className="size-7" /></div></div><div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-primary-foreground/20 pt-4 text-xs"><span className="flex items-center gap-2"><Check className="size-3.5 text-leaf" /> Better recovery habits</span><span className="flex items-center gap-2"><Check className="size-3.5 text-leaf" /> More reusable resources</span><span className="flex items-center gap-2"><Check className="size-3.5 text-leaf" /> Healthier local waterways</span></div></div><div className="grid gap-4 md:grid-cols-3">{impacts.map((impact) => <article key={impact.title} className="rounded-md border border-border bg-card p-5"><impact.icon className={`size-5 ${impact.color}`} /><h3 className="mt-4 text-sm font-semibold">{impact.title}</h3><p className="mt-1 min-h-10 text-xs leading-relaxed text-muted-foreground">{impact.text}</p><div className="mt-4 border-t border-border pt-3"><span className="font-display text-2xl font-semibold">{impact.stat}</span><p className="mt-0.5 text-[10px] text-muted-foreground">{impact.detail}</p></div></article>)}</div><div className="mt-5 rounded-md border border-border bg-card p-5"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-md bg-amber/30 text-foreground"><Leaf className="size-4" /></div><div><h3 className="text-sm font-semibold">Designed around the circular economy</h3><p className="mt-1 text-xs text-muted-foreground">Blueloop’s mission aligns with SDGs 11, 12, 13 and 14.</p></div></div></div></div>;
}

function NewRequestDialog({ category, setCategory, quantity, setQuantity, condition, setCondition, location, setLocation, fileName, scanState, setScanState, onFileChange, onClose, onSubmit }: { category: string; setCategory: (value: string) => void; quantity: string; setQuantity: (value: string) => void; condition: string; setCondition: (value: string) => void; location: string; setLocation: (value: string) => void; fileName: string; scanState: "idle" | "done"; setScanState: (value: "idle" | "done") => void; onFileChange: (event: ChangeEvent<HTMLInputElement>) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [step, setStep] = useState(1);
  const recommendations: Record<string, string> = {
    Plastic: "PET flakes for new containers or textile fibre", Paper: "Recycled paper and new cardboard", Glass: "Reprocessed glass containers and aggregate", "E-waste": "Careful sorting for component and metal recovery", Textile: "Reusable fabric goods or reclaimed fibre", Metal: "Recovered metal feedstock for new parts", Coastal: "Recovered plastics and other sorted shoreline materials",
  };
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="request-title" className="max-h-[94vh] w-full max-w-[590px] overflow-y-auto rounded-t-md border border-border bg-background shadow-xl sm:rounded-md">
      <div className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-6"><div><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Create a new listing</span><h2 id="request-title" className="mt-1 text-lg font-semibold">Give materials a second life</h2><p className="mt-1 text-xs text-muted-foreground">Add a few details so the right recycling option can be found.</p></div><Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onClose}><X className="size-4" /></Button></div>
      <div className="px-5 pt-4 sm:px-6"><div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground"><span className={`flex size-5 items-center justify-center rounded-full ${step === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>{step > 1 ? <Check className="size-3" /> : "1"}</span><span className={step === 1 ? "text-foreground" : ""}>Material details</span><span className="mx-1 h-px w-8 bg-border" /><span className={`flex size-5 items-center justify-center rounded-full ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span><span className={step === 2 ? "text-foreground" : ""}>Review & match</span></div></div>
      {step === 1 ? <form onSubmit={(event) => { event.preventDefault(); setStep(2); }} className="space-y-4 px-5 py-4 sm:px-6">
        <div><label htmlFor="waste-photo" className="mb-1.5 block text-xs font-medium">Photo <span className="text-muted-foreground">(optional)</span></label><label htmlFor="waste-photo" className="flex min-h-[62px] cursor-pointer items-center gap-3 rounded-md border border-dashed border-primary/30 bg-secondary/35 px-4 py-3 transition-colors hover:bg-secondary/60"><span className="flex size-9 items-center justify-center rounded-md bg-background text-primary"><Upload className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{fileName || "Choose a photo to add"}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">A photo can help us show a sample material identification</span></span><span className="rounded-sm border border-border bg-card px-2.5 py-1.5 text-[10px] font-medium">Browse</span><input id="waste-photo" aria-label="Add a waste photo" type="file" accept="image/*" className="sr-only" onChange={onFileChange} /></label><div className="mt-2 flex items-center gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setScanState("done")} className="h-7 text-[10px]"><Sparkles className="size-3" /> Simulate sample scan</Button>{scanState === "done" && <span role="status" className="text-[10px] font-medium text-primary">Sample identification ready</span>}</div></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="waste-category" className="mb-1.5 block text-xs font-medium">Material category</label><select id="waste-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-ring">{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="waste-condition" className="mb-1.5 block text-xs font-medium">Condition</label><select id="waste-condition" value={condition} onChange={(event) => setCondition(event.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-ring"><option>Clean & sorted</option><option>Mixed materials</option><option>Needs sorting</option><option>Damaged / unusable</option></select></div></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="waste-quantity" className="mb-1.5 block text-xs font-medium">Approximate quantity</label><div className="flex gap-2"><Input id="waste-quantity" aria-label="Approximate quantity in kilograms" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-9" required /><span className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-xs text-muted-foreground">kg</span></div></div><div><label htmlFor="waste-location" className="mb-1.5 block text-xs font-medium">Pickup area</label><Input id="waste-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Kadri, Mangaluru" className="h-9" /></div></div>
        <div className="flex justify-end gap-2 border-t border-border pt-3"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" className="gap-2">Review matches <ArrowRight className="size-4" /></Button></div>
      </form> : <form onSubmit={onSubmit} className="px-5 py-4 sm:px-6">
        <div className="mb-4 flex items-start gap-3 rounded-md border border-primary/15 bg-secondary/45 p-3.5"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-primary"><Sparkles className="size-4" /></div><div><p className="text-xs font-semibold">Suggested next use</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{recommendations[category] ?? recommendations["Plastic"]}</p></div></div>
        <div className="mb-4 rounded-md border border-border bg-card p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Best nearby sample match</p><div className="mt-3 flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary">{partners.find((item) => item.kind.toLowerCase().includes(category.toLowerCase()))?.initials ?? "CR"}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{partners.find((item) => item.kind.toLowerCase().includes(category.toLowerCase()))?.name ?? "Coastline Recyclers"}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Sample match · 2.4 km away</p></div><span className="rounded-sm bg-secondary px-2 py-1 text-[10px] font-semibold text-primary">Strong match</span></div></div>
        <dl className="mb-4 grid grid-cols-2 gap-3 text-xs"><div className="rounded-sm bg-muted/70 p-3"><dt className="text-[10px] text-muted-foreground">Material</dt><dd className="mt-1 font-medium">{category} · {condition}</dd></div><div className="rounded-sm bg-muted/70 p-3"><dt className="text-[10px] text-muted-foreground">Amount & location</dt><dd className="mt-1 font-medium">{quantity || 0} kg · {location || "Mangaluru"}</dd></div></dl>
        <p className="mb-4 text-[10px] leading-relaxed text-muted-foreground">This interactive demo simulates identification and partner matches. It does not send your photo or arrange a real pickup.</p>
        <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3"><Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-1.5"><ArrowDownLeft className="size-3.5" /> Edit details</Button><div className="flex gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!Number(quantity) || Number(quantity) < 1} className="gap-2">Create demo request <Check className="size-4" /></Button></div></div>
      </form>}
    </section>
  </div>;
}

function AllRequestsDialog({ requests, onClose, onNavigate }: { requests: RequestItem[]; onClose: () => void; onNavigate: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="all-requests-title" className="w-full max-w-[700px] overflow-hidden rounded-md border border-border bg-background shadow-xl"><div className="flex items-start justify-between border-b border-border px-5 py-4"><div><h2 id="all-requests-title" className="text-base font-semibold">Recent requests</h2><p className="mt-1 text-xs text-muted-foreground">{requests.length} sample requests in your community.</p></div><Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onClose}><X className="size-4" /></Button></div><div className="max-h-[55vh] overflow-y-auto"><RequestTable requests={requests} /></div><div className="flex justify-end border-t border-border px-5 py-3"><Button onClick={onNavigate} className="h-8 gap-2 text-xs">Open all requests <ArrowRight className="size-3.5" /></Button></div></section></div>;
}