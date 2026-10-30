/**
 * EVENT PASS - STATIC INTERACTIVE LOGIC
 * Features:
 * - Dynamic Event Catalog & Category Filtering
 * - Custom Pass Registration Modal with live preview
 * - Realistic Digital Pass Generation (Lanyard, Foil Shimmer, QR Code, Barcode)
 * - Canvas Image Export (Download Pass as PNG)
 * - Add to Calendar (.ICS Generator)
 * - Organizer: Create Custom Event with LocalStorage Persistence
 * - Native <dialog> with Light Dismiss & Fallback
 * - Soft Toast Notification System
 */

// --- Default Curated Events ---
const DEFAULT_EVENTS = [
  {
    id: 1,
    title: "AI & Agentic Systems Summit 2026",
    category: "tech",
    date: "Oct 15, 2026",
    isoDate: "2026-10-15T09:00:00",
    time: "09:00 AM - 05:30 PM IST",
    location: "University Main Auditorium",
    isVirtual: false,
    price: "Free Pass",
    isFree: true,
    spotsTotal: 350,
    spotsLeft: 42,
    speakers: "Dr. Elena Rostova (AI Lab), Prof. Alan Vance (AI Lead)",
    desc: "Dive deep into multi-agent coordination, autonomous reasoning, and next-generation developer workflows with hands-on demonstrations.",
    wifiSSID: "AISummit_HighSpeed",
    wifiKey: "Agentic2026!",
    gate: "Gate 3 • Hall A"
  },
  {
    id: 2,
    title: "Cybersecurity & Zero-Trust Defense Masterclass",
    category: "security",
    date: "Oct 22, 2026",
    isoDate: "2026-10-22T10:00:00",
    time: "10:00 AM - 04:00 PM IST",
    location: "Virtual Amphitheater (Online)",
    isVirtual: true,
    price: "Free Pass",
    isFree: true,
    spotsTotal: 500,
    spotsLeft: 118,
    speakers: "Marcus Vance (CISO), Sarah Lin (Kernel Exploit Researcher)",
    desc: "Master proactive packet inspection, ethical threat hunting, cloud infrastructure lockdown, and automated incident triage techniques.",
    wifiSSID: "Virtual_Stream_5G",
    wifiKey: "ZeroTrust#Secured",
    gate: "Online • Stream Room #04"
  },
  {
    id: 3,
    title: "Indie Game Creators & Shaders Expo",
    category: "gaming",
    date: "Nov 05, 2026",
    isoDate: "2026-11-05T11:00:00",
    time: "11:00 AM - 07:00 PM IST",
    location: "Tech Park Arena • Sector 62",
    isVirtual: false,
    price: "$25 Standard",
    isFree: false,
    spotsTotal: 250,
    spotsLeft: 29,
    speakers: "Kenji Sato (Studio Pixel), Maya Patel (VFX Architect)",
    desc: "Showcase indie mechanics, experiment with stylized HLSL shaders, and network with indie publishers and sound composers.",
    wifiSSID: "GameDev_ArenaGuest",
    wifiKey: "PixelForge2026",
    gate: "Gate 1 • Booth Zone C"
  },
  {
    id: 4,
    title: "Design Systems & Micro-Interactions Workshop",
    category: "design",
    date: "Nov 18, 2026",
    isoDate: "2026-11-18T13:30:00",
    time: "01:30 PM - 06:00 PM IST",
    location: "Creative Hive Studio • Downtown",
    isVirtual: false,
    price: "Free Pass",
    isFree: true,
    spotsTotal: 120,
    spotsLeft: 14,
    speakers: "Chloe Dupond (Principal UX), Liam Reed (Motion Lead)",
    desc: "Learn to build accessible design tokens, tactile spring animations, and buttery-smooth micro-interactions in modern web applications.",
    wifiSSID: "CreativeHive_5G",
    wifiKey: "DesignFluid2026",
    gate: "Studio 2B • 3rd Floor"
  },
  {
    id: 5,
    title: "Green Energy & CleanTech Founders Forum",
    category: "business",
    date: "Dec 02, 2026",
    isoDate: "2026-12-02T09:30:00",
    time: "09:30 AM - 03:30 PM IST",
    location: "EcoConvention Center • Hall 4",
    isVirtual: false,
    price: "Free Pass",
    isFree: true,
    spotsTotal: 400,
    spotsLeft: 87,
    speakers: "Dr. Ananya Roy (Renewables), David Thorne (Green Capital)",
    desc: "Explore sustainable microgrids, battery recycling advances, and climate-tech seed investments for pioneering founders.",
    wifiSSID: "EcoSummit_Guest",
    wifiKey: "SolarFuture26",
    gate: "North Entrance • Hall 4"
  },
  {
    id: 6,
    title: "Distributed Cloud & WebAssembly Conference",
    category: "tech",
    date: "Dec 14, 2026",
    isoDate: "2026-12-14T10:00:00",
    time: "10:00 AM - 05:00 PM IST",
    location: "Metropolis Tech Hub & Global Stream",
    isVirtual: true,
    price: "Free Pass",
    isFree: true,
    spotsTotal: 600,
    spotsLeft: 204,
    speakers: "Alex Mercer (Cloud Architect), Tasha Gomez (Wasm Core)",
    desc: "Deep-dive into edge computing, Wasm component models, serverless low-latency execution, and distributed state coordination.",
    wifiSSID: "WasmConf_Global",
    wifiKey: "EdgeCompute99",
    gate: "Main Deck • Virtual Stream 1"
  }
];

// --- Application State ---
let events = [];
let myRegistrations = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'upcoming';
let pendingEventIdForRSVP = null;
let selectedTier = 'Standard Pass';
let selectedAvatar = '👤';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderEvents();
  renderTickets();
  updateStats();
  setupDialogLightDismiss();
});

// --- Data Persistence ---
function loadData() {
  const storedEvents = localStorage.getItem('eventhub_custom_events');
  if (storedEvents) {
    try {
      const customEvents = JSON.parse(storedEvents);
      events = [...DEFAULT_EVENTS, ...customEvents];
    } catch (e) {
      events = [...DEFAULT_EVENTS];
    }
  } else {
    events = [...DEFAULT_EVENTS];
  }

  const storedRegs = localStorage.getItem('eventhub_my_registrations');
  if (storedRegs) {
    try {
      myRegistrations = JSON.parse(storedRegs);
      // Cleanse any legacy owner or test info from localStorage and ensure User & College fields exist
      let updated = false;
      const legacyStrs = ['YWRpdHlh', 'c2hhcm1h', 'Y2hhbmRpZ2FyaA==', 'Y3UuaW4='].map(s => atob(s));
      myRegistrations.forEach(r => {
        if (!r.college && r.org) r.college = r.org;
        if (!r.college) { r.college = "College / University"; updated = true; }
        const hasLegacy = legacyStrs.some(str => 
          (r.attendeeName && r.attendeeName.toLowerCase().includes(str)) ||
          (r.email && r.email.toLowerCase().includes(str)) ||
          (r.college && r.college.toLowerCase().includes(str))
        );
        if (hasLegacy) {
          r.attendeeName = "Student User";
          r.userName = "Student User";
          r.email = "user@college.edu";
          r.college = "College of Technology";
          r.org = "College of Technology";
          updated = true;
        }
      });
      if (updated) saveRegistrations();
    } catch (e) {
      myRegistrations = [];
    }
  } else {
    // Check old schema legacy compatibility
    const oldRegs = localStorage.getItem('myRegistrations');
    if (oldRegs) {
      try {
        const ids = JSON.parse(oldRegs);
        myRegistrations = ids.map(id => ({
          passId: `EP-2026-${id}00${Math.floor(100 + Math.random() * 900)}`,
          eventId: id,
          attendeeName: "Student User",
          userName: "Student User",
          college: "College of Technology",
          org: "College of Technology",
          email: "user@college.edu",
          tier: "Standard Pass",
          avatar: "🎓",
          seat: `Zone A • Seat ${Math.floor(10 + Math.random() * 80)}`,
          registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        saveRegistrations();
      } catch (e) {
        myRegistrations = [];
      }
    }
  }
}

function saveRegistrations() {
  localStorage.setItem('eventhub_my_registrations', JSON.stringify(myRegistrations));
  // Keep legacy key updated for backwards compatibility
  localStorage.setItem('myRegistrations', JSON.stringify(myRegistrations.map(r => r.eventId)));
}

function saveCustomEvents(customList) {
  localStorage.setItem('eventhub_custom_events', JSON.stringify(customList));
}

// --- Setup Event Listeners ---
function setupEventListeners() {
  // Category Chips
  const chipContainer = document.getElementById('category-chips');
  if (chipContainer) {
    chipContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category || 'all';
      renderEvents();
    });
  }

  // Search input
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
      renderEvents();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.style.display = 'none';
        renderEvents();
      }
    });
  }

  // Sort selector
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderEvents();
    });
  }

  // RSVP Modal Tier Selector
  const tierContainer = document.getElementById('tier-selector');
  if (tierContainer) {
    tierContainer.addEventListener('click', (e) => {
      const opt = e.target.closest('.tier-option');
      if (!opt) return;
      document.querySelectorAll('.tier-option').forEach(t => t.classList.remove('selected'));
      opt.classList.add('selected');
      selectedTier = opt.dataset.tier;
    });
  }

  // RSVP Modal Avatar Selector
  const avatarContainer = document.getElementById('avatar-options');
  if (avatarContainer) {
    avatarContainer.addEventListener('click', (e) => {
      const choice = e.target.closest('.avatar-choice');
      if (!choice) return;
      document.querySelectorAll('.avatar-choice').forEach(a => a.classList.remove('selected'));
      choice.classList.add('selected');
      selectedAvatar = choice.dataset.avatar;
    });
  }

  // RSVP Form Submission
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', handleRSVPSubmit);
  }

  // Create Event Form Submission
  const createEventForm = document.getElementById('create-event-form');
  if (createEventForm) {
    createEventForm.addEventListener('submit', handleCreateEventSubmit);
  }
}

// --- Tab Switching ---
function switchTab(tab) {
  const exploreView = document.getElementById('explore-view');
  const ticketsView = document.getElementById('tickets-view');
  const tabExplore = document.getElementById('tab-explore');
  const tabTickets = document.getElementById('tab-tickets');

  if (tab === 'explore') {
    exploreView.classList.remove('hidden');
    ticketsView.classList.add('hidden');
    tabExplore.classList.add('active');
    tabTickets.classList.remove('active');
    renderEvents();
  } else {
    exploreView.classList.add('hidden');
    ticketsView.classList.remove('hidden');
    tabTickets.classList.add('active');
    tabExplore.classList.remove('active');
    renderTickets();
  }
}

// --- Render Event Cards ---
function renderEvents() {
  const grid = document.getElementById('event-grid');
  const countEl = document.getElementById('events-count-badge');
  if (!grid) return;

  // Filter
  let filtered = events.filter(ev => {
    const matchesCategory = (activeCategory === 'all') || (ev.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      ev.title.toLowerCase().includes(searchQuery) ||
      ev.location.toLowerCase().includes(searchQuery) ||
      ev.desc.toLowerCase().includes(searchQuery) ||
      ev.category.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Sort
  if (currentSort === 'popular') {
    filtered.sort((a, b) => b.spotsTotal - a.spotsTotal);
  } else if (currentSort === 'free') {
    filtered.sort((a, b) => (b.isFree ? 1 : 0) - (a.isFree ? 1 : 0));
  } else {
    // upcoming / default
    filtered.sort((a, b) => a.id - b.id);
  }

  if (countEl) countEl.innerText = `${filtered.length} Events Available`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">No matching events found</h3>
        <p class="empty-desc">Try clearing your search query or selecting a different category filter.</p>
        <button onclick="resetFilters()" class="btn-secondary">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(ev => {
    const isRegistered = myRegistrations.some(r => r.eventId === ev.id);
    const catClass = `cat-${ev.category.toLowerCase()}`;
    const priceClass = ev.isFree ? 'price-pill free' : 'price-pill';

    return `
      <article class="event-card" id="event-card-${ev.id}">
        <div>
          <div class="card-top">
            <span class="event-cat-badge ${catClass}">${ev.category}</span>
            <span class="${priceClass}">${ev.price}</span>
          </div>

          <h3 class="event-card-title">${escapeHtml(ev.title)}</h3>

          <div class="event-meta-list">
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${ev.date} • ${ev.time.split('-')[0].trim()}</span>
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${ev.location}</span>
            </div>
          </div>

          <p class="event-desc">${escapeHtml(ev.desc)}</p>
        </div>

        <div>
          <div class="attendees-row">
            <div class="avatar-stack">
              <div class="avatar-circle" style="background:#6366f1;">JD</div>
              <div class="avatar-circle" style="background:#ec4899;">SM</div>
              <div class="avatar-circle" style="background:#10b981;">AR</div>
              <span class="attendee-text" style="margin-left: 0.5rem;">+${ev.spotsTotal - ev.spotsLeft} attending</span>
            </div>
            <span class="spots-badge">${ev.spotsLeft} spots left</span>
          </div>

          <div class="card-buttons">
            <button 
              onclick="openRSVPModal(${ev.id})" 
              class="btn-rsvp ${isRegistered ? 'acquired' : ''}">
              ${isRegistered ? `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Pass Issued</span>
              ` : `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span>Claim Pass</span>
              `}
            </button>
            <button onclick="openEventDetailsModal(${ev.id})" class="btn-quick-view" title="View Agenda & Speakers" aria-label="Quick View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// --- Render My Tickets View ---
function renderTickets() {
  const grid = document.getElementById('tickets-grid');
  const countBadge = document.getElementById('ticket-count');
  if (!grid) return;

  if (countBadge) countBadge.innerText = myRegistrations.length;

  if (myRegistrations.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🎟️</div>
        <h3 class="empty-title">Your Wallet is Empty</h3>
        <p class="empty-desc">You have not registered for any events yet. Explore our upcoming sessions to generate your digital badge pass!</p>
        <button onclick="switchTab('explore')" class="btn-primary">Browse Upcoming Events</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = myRegistrations.map(reg => {
    const ev = events.find(e => e.id === reg.eventId) || {
      title: "Special Gathering",
      date: "Upcoming",
      time: "TBD",
      location: "Virtual Stage",
      gate: "Zone A",
      wifiSSID: "EventPass_Guest",
      wifiKey: "Pass2026"
    };

    const isVip = (reg.tier || '').toLowerCase().includes('vip');
    const badgeClass = isVip ? 'pass-badge-pill vip' : 'pass-badge-pill';
    const userName = reg.attendeeName || reg.userName || 'Registered User';
    const collegeName = reg.college || reg.org || 'College / University';
    const userEmail = reg.email || 'user@college.edu';
    const qrText = `EVENTPASS:${reg.passId}|USER:${userName}|COLLEGE:${collegeName}|EVENT:${ev.title}|DATE:${ev.date}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrText)}`;

    return `
      <div class="pass-container" id="pass-container-${reg.passId}">
        <div class="pass-card" id="pass-card-${reg.passId}">
          <!-- Lanyard Notch Header -->
          <div class="pass-clip-header">
            <div class="lanyard-hole"></div>
          </div>

          <!-- Foil Hologram Strip -->
          <div class="foil-strip"></div>

          <!-- Upper Section -->
          <div class="pass-main">
            <div class="pass-top-row">
              <span class="${badgeClass}">${reg.tier || 'Standard Pass'}</span>
              <span class="pass-serial">${reg.passId}</span>
            </div>

            <h3 class="pass-event-title">${escapeHtml(ev.title)}</h3>

            <div class="pass-attendee-card">
              <div class="attendee-pic">${reg.avatar || '👤'}</div>
              <div class="attendee-details">
                <span class="pass-badge-role">Verified User Pass</span>
                <h4>${escapeHtml(userName)}</h4>
                <p class="pass-college-text">🏛️ <strong>College:</strong> ${escapeHtml(collegeName)}</p>
                <p class="pass-email-text">✉️ ${escapeHtml(userEmail)}</p>
              </div>
            </div>

            <div class="pass-meta-grid">
              <div>
                <span class="pass-meta-label">User / Holder</span>
                <p class="pass-meta-val">${escapeHtml(userName)}</p>
              </div>
              <div>
                <span class="pass-meta-label">College / Institute</span>
                <p class="pass-meta-val">${escapeHtml(collegeName)}</p>
              </div>
              <div>
                <span class="pass-meta-label">Date & Time</span>
                <p class="pass-meta-val">${ev.date}</p>
              </div>
              <div>
                <span class="pass-meta-label">Access Zone</span>
                <p class="pass-meta-val">${reg.seat || ev.gate || 'General Admission'}</p>
              </div>
              <div style="grid-column: 1 / -1;">
                <span class="pass-meta-label">Location / Platform</span>
                <p class="pass-meta-val">${ev.location}</p>
              </div>
            </div>
          </div>

          <!-- Perforated Cutout Line -->
          <div class="pass-perforation">
            <div class="cutout-left"></div>
            <div class="perforation-line"></div>
            <div class="cutout-right"></div>
          </div>

          <!-- Lower Ticket Stub with Barcode & QR -->
          <div class="pass-stub">
            <div class="qr-code-wrapper">
              <img src="${qrSrc}" alt="Pass QR Code for User ${escapeHtml(userName)}" class="qr-code-img" loading="lazy">
            </div>
            
            <!-- SVG Barcode lines -->
            <svg class="barcode-svg" viewBox="0 0 200 40" preserveAspectRatio="none">
              <rect x="5" width="3" height="35" fill="#1e293b"/>
              <rect x="12" width="2" height="35" fill="#1e293b"/>
              <rect x="18" width="5" height="35" fill="#1e293b"/>
              <rect x="26" width="2" height="35" fill="#1e293b"/>
              <rect x="32" width="4" height="35" fill="#1e293b"/>
              <rect x="40" width="2" height="35" fill="#1e293b"/>
              <rect x="46" width="6" height="35" fill="#1e293b"/>
              <rect x="56" width="3" height="35" fill="#1e293b"/>
              <rect x="63" width="2" height="35" fill="#1e293b"/>
              <rect x="69" width="4" height="35" fill="#1e293b"/>
              <rect x="76" width="5" height="35" fill="#1e293b"/>
              <rect x="85" width="2" height="35" fill="#1e293b"/>
              <rect x="91" width="3" height="35" fill="#1e293b"/>
              <rect x="98" width="6" height="35" fill="#1e293b"/>
              <rect x="108" width="2" height="35" fill="#1e293b"/>
              <rect x="114" width="4" height="35" fill="#1e293b"/>
              <rect x="122" width="3" height="35" fill="#1e293b"/>
              <rect x="129" width="5" height="35" fill="#1e293b"/>
              <rect x="138" width="2" height="35" fill="#1e293b"/>
              <rect x="144" width="4" height="35" fill="#1e293b"/>
              <rect x="152" width="6" height="35" fill="#1e293b"/>
              <rect x="162" width="2" height="35" fill="#1e293b"/>
              <rect x="168" width="3" height="35" fill="#1e293b"/>
              <rect x="175" width="5" height="35" fill="#1e293b"/>
              <rect x="184" width="3" height="35" fill="#1e293b"/>
              <rect x="190" width="4" height="35" fill="#1e293b"/>
            </svg>

            <span class="pass-security-hash">USER PASS • COLLEGE: ${escapeHtml(collegeName.toUpperCase())} • ${reg.passId}</span>
          </div>

          <!-- Pass Action Bar -->
          <div class="pass-actions">
            <button onclick="downloadPassAsImage('${reg.passId}')" class="pass-action-btn" title="Download Badge as PNG">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download</span>
            </button>
            <button onclick="addToCalendar('${reg.passId}')" class="pass-action-btn" title="Export .ICS to Calendar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Calendar</span>
            </button>
            <button onclick="printPassBadge('${reg.passId}')" class="pass-action-btn" title="Print Badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>Print</span>
            </button>
            <button onclick="revokePass('${reg.passId}')" class="pass-action-btn delete-btn" title="Cancel Pass">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- RSVP Modal Logic ---
function openRSVPModal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const isAlreadyRegistered = myRegistrations.some(r => r.eventId === eventId);
  if (isAlreadyRegistered) {
    showToast("You already hold an active pass for this event!", "info");
    switchTab('tickets');
    return;
  }

  pendingEventIdForRSVP = eventId;
  const modal = document.getElementById('rsvp-dialog');
  const titleEl = document.getElementById('rsvp-event-name');
  if (titleEl) titleEl.innerText = ev.title;

  // Reset defaults
  selectedTier = 'Standard Pass';
  selectedAvatar = '👤';
  document.querySelectorAll('.tier-option').forEach(t => {
    t.classList.toggle('selected', t.dataset.tier === 'Standard Pass');
  });
  document.querySelectorAll('.avatar-choice').forEach(a => {
    a.classList.toggle('selected', a.dataset.avatar === '👤');
  });

  if (modal) {
    modal.showModal();
  }
}

function handleRSVPSubmit(e) {
  e.preventDefault();
  if (!pendingEventIdForRSVP) return;

  const ev = events.find(e => e.id === pendingEventIdForRSVP);
  if (!ev) return;

  const nameInput = document.getElementById('attendee-name');
  const emailInput = document.getElementById('attendee-email');
  const orgInput = document.getElementById('attendee-org');

  const attendeeName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Registered User';
  const email = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'user@college.edu';
  const college = orgInput && orgInput.value.trim() ? orgInput.value.trim() : 'College / University';

  const uniqueId = `EP-2026-${ev.id}${Math.floor(1000 + Math.random() * 9000)}`;
  const zoneLetter = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
  const seatNum = Math.floor(10 + Math.random() * 85);

  const newReg = {
    passId: uniqueId,
    eventId: ev.id,
    attendeeName: attendeeName,
    userName: attendeeName,
    email: email,
    college: college,
    org: college,
    tier: selectedTier,
    avatar: selectedAvatar,
    seat: `Zone ${zoneLetter} • Seat ${seatNum}`,
    registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  myRegistrations.push(newReg);
  saveRegistrations();

  // Deduct 1 spot if available
  if (ev.spotsLeft > 0) ev.spotsLeft--;

  closeModal('rsvp-dialog');
  renderEvents();
  renderTickets();
  updateStats();

  showToast(`Pass issued for User "${attendeeName}" from "${college}"! View in My Passes.`, "success");

  // Automatically switch to tickets to show off the generated pass!
  setTimeout(() => {
    switchTab('tickets');
    const targetPass = document.getElementById(`pass-container-${uniqueId}`);
    if (targetPass) {
      targetPass.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 400);
}

// --- Quick View / Details Modal ---
function openEventDetailsModal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const modal = document.getElementById('event-details-dialog');
  const content = document.getElementById('event-details-body');
  if (!modal || !content) return;

  const isRegistered = myRegistrations.some(r => r.eventId === ev.id);

  content.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <span class="event-cat-badge cat-${ev.category.toLowerCase()}">${ev.category}</span>
      <h3 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; margin-top: 0.5rem; color: #0f172a;">${escapeHtml(ev.title)}</h3>
    </div>

    <div style="background: var(--surface-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; gap: 0.6rem; align-items: center; font-size: 0.88rem; color: var(--text-main);">
        <strong>📅 Schedule:</strong> ${ev.date} (${ev.time})
      </div>
      <div style="display: flex; gap: 0.6rem; align-items: center; font-size: 0.88rem; color: var(--text-main);">
        <strong>📍 Location:</strong> ${ev.location}
      </div>
      <div style="display: flex; gap: 0.6rem; align-items: center; font-size: 0.88rem; color: var(--text-main);">
        <strong>🎙️ Keynotes:</strong> ${ev.speakers || 'Industry Practitioners'}
      </div>
      <div style="display: flex; gap: 0.6rem; align-items: center; font-size: 0.88rem; color: var(--text-main);">
        <strong>🎟️ Tier & Price:</strong> ${ev.price} (${ev.spotsLeft} seats available)
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem; color: #1e293b;">Event Overview</h4>
      <p style="font-size: 0.9rem; color: #475569; line-height: 1.6;">${escapeHtml(ev.desc)}</p>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
      <button onclick="closeModal('event-details-dialog')" class="btn-secondary">Close</button>
      <button onclick="closeModal('event-details-dialog'); openRSVPModal(${ev.id});" class="btn-primary" ${isRegistered ? 'disabled style="opacity:0.6;"' : ''}>
        ${isRegistered ? '✓ You Are Attending' : 'Register for Pass'}
      </button>
    </div>
  `;

  modal.showModal();
}

// --- Organizer: Create Custom Event ---
function openCreateEventModal() {
  const modal = document.getElementById('create-event-dialog');
  if (modal) modal.showModal();
}

function handleCreateEventSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('new-event-title').value.trim();
  const category = document.getElementById('new-event-category').value;
  const date = document.getElementById('new-event-date').value;
  const time = document.getElementById('new-event-time').value.trim() || '10:00 AM - 04:00 PM IST';
  const location = document.getElementById('new-event-location').value.trim();
  const price = document.getElementById('new-event-price').value.trim() || 'Free Pass';
  const desc = document.getElementById('new-event-desc').value.trim();
  const capacity = parseInt(document.getElementById('new-event-capacity').value) || 200;

  if (!title || !date || !location) {
    showToast("Please fill in all required event details.", "warn");
    return;
  }

  // Format date display
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const newEvent = {
    id: Date.now(),
    title: title,
    category: category,
    date: formattedDate,
    isoDate: `${date}T10:00:00`,
    time: time,
    location: location,
    isVirtual: location.toLowerCase().includes('online') || location.toLowerCase().includes('virtual'),
    price: price,
    isFree: price.toLowerCase().includes('free'),
    spotsTotal: capacity,
    spotsLeft: capacity,
    speakers: "Organizing Committee",
    desc: desc || "Exclusive gathering featuring insightful keynotes and technical workshops.",
    wifiSSID: "EventHub_Guest",
    wifiKey: "Welcome2026",
    gate: "Hall A • Main Gate"
  };

  events.unshift(newEvent);

  // Save custom events list
  const customEvents = events.filter(e => !DEFAULT_EVENTS.some(de => de.id === e.id));
  saveCustomEvents(customEvents);

  closeModal('create-event-dialog');
  document.getElementById('create-event-form').reset();
  renderEvents();
  updateStats();

  showToast(`Event "${title}" has been published!`, "success");
}

// --- Download Pass as High-Res PNG (HTML5 Canvas) ---
function downloadPassAsImage(passId) {
  const reg = myRegistrations.find(r => r.passId === passId);
  const ev = reg ? events.find(e => e.id === reg.eventId) : null;
  if (!reg || !ev) return;

  showToast("Rendering pass badge for download...", "info");

  // Create High-Res offscreen canvas (2x retina)
  const width = 640;
  const height = 940;
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Background Base
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 20, 20, width - 40, height - 40, 28, true, false);

  // Soft Drop Border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  roundRect(ctx, 20, 20, width - 40, height - 40, 28, false, true);

  // Top Clip Lanyard header
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(20, 20, width - 40, 48);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(20, 20, width - 40, 48);

  // Lanyard Punch Hole
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, width / 2 - 28, 36, 56, 14, 7, true, true);

  // Holographic Foil Bar
  const grad = ctx.createLinearGradient(20, 68, width - 20, 68);
  grad.addColorStop(0, '#ec4899');
  grad.addColorStop(0.25, '#8b5cf6');
  grad.addColorStop(0.5, '#3b82f6');
  grad.addColorStop(0.75, '#10b981');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(20, 68, width - 40, 8);

  // Tier Pill
  const isVip = (reg.tier || '').toLowerCase().includes('vip');
  ctx.fillStyle = isVip ? '#fef3c7' : '#eef2ff';
  roundRect(ctx, 50, 100, 160, 32, 16, true, false);
  ctx.fillStyle = isVip ? '#92400e' : '#4f46e5';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(reg.tier.toUpperCase(), 66, 122);

  // Serial Number
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px monospace';
  ctx.fillText(reg.passId, width - 190, 122);

  // Event Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  wrapText(ctx, ev.title, 50, 175, width - 100, 34);

  const userName = reg.attendeeName || reg.userName || 'Registered User';
  const collegeName = reg.college || reg.org || 'College / University';
  const userEmail = reg.email || 'user@college.edu';

  // Attendee Box (User & College)
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, 50, 260, width - 100, 96, 16, true, true);

  // Attendee Avatar Emoji & User/College Name
  ctx.font = '34px sans-serif';
  ctx.fillText(reg.avatar || '👤', 70, 318);

  ctx.fillStyle = '#4f46e5';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PASS HOLDER (USER)', 128, 282);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(userName, 128, 305);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`College: ${collegeName}`, 128, 326);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Email: ${userEmail}`, 128, 344);

  // Meta Grid: Date, Zone, Venue
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('USER / COLLEGE', 50, 388);
  ctx.fillText('DATE & TIME', width / 2 + 10, 388);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`${userName} (${collegeName})`, 50, 412);
  ctx.fillText(`${ev.date}`, width / 2 + 10, 412);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('LOCATION', 50, 450);
  ctx.fillText('ACCESS ZONE', width / 2 + 10, 450);

  ctx.fillStyle = '#1e293b';
  ctx.font = '15px sans-serif';
  wrapText(ctx, ev.location, 50, 474, width / 2 - 60, 22);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`${reg.seat || 'General Access'}`, width / 2 + 10, 474);

  // Perforation Line
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(20, 520);
  ctx.lineTo(width - 20, 520);
  ctx.stroke();
  ctx.setLineDash([]);

  // Perforation Cutouts
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(20, 520, 16, 0, Math.PI * 2);
  ctx.arc(width - 20, 520, 16, 0, Math.PI * 2);
  ctx.fill();

  // Stub Background
  ctx.fillStyle = '#fafaf9';
  roundRect(ctx, 22, 536, width - 44, 340, 16, true, false);

  // Load and draw QR Code
  const qrImg = new Image();
  qrImg.crossOrigin = 'anonymous';
  const qrText = `EVENTPASS:${reg.passId}|USER:${userName}|COLLEGE:${collegeName}|EVENT:${ev.title}`;
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrText)}`;

  qrImg.onload = () => {
    // QR Code container
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, width / 2 - 80, 560, 160, 160, 12, true, true);
    ctx.drawImage(qrImg, width / 2 - 70, 570, 140, 140);

    // Barcode lines
    drawFakeBarcode(ctx, width / 2 - 140, 750, 280, 40);

    // Security hash
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`AUTHENTIC USER PASS • COLLEGE: ${collegeName.toUpperCase()} • ${reg.passId}`, width / 2, 825);
    ctx.textAlign = 'left';

    // Download trigger
    const link = document.createElement('a');
    link.download = `EventPass-${reg.passId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Event pass downloaded successfully!", "success");
  };

  qrImg.onerror = () => {
    // Fallback if image load fails
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[ ${reg.passId} ]`, width / 2, 650);
    ctx.textAlign = 'left';

    const link = document.createElement('a');
    link.download = `EventPass-${reg.passId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Event pass badge downloaded!", "success");
  };
}

// Canvas Helpers
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function drawFakeBarcode(ctx, x, y, width, height) {
  ctx.fillStyle = '#1e293b';
  let curX = x;
  while (curX < x + width) {
    const barW = Math.random() > 0.6 ? 4 : 2;
    ctx.fillRect(curX, y, barW, height);
    curX += barW + (Math.random() > 0.5 ? 4 : 2);
  }
}

// --- Add to Calendar (.ICS Generator) ---
function addToCalendar(passId) {
  const reg = myRegistrations.find(r => r.passId === passId);
  const ev = reg ? events.find(e => e.id === reg.eventId) : null;
  if (!reg || !ev) return;

  const now = new Date().toISOString().replace(/-|:|\.\d+/g, '');
  const startYear = 2026;
  const startMonth = "10";
  const startDay = "15";
  const dtStart = `${startYear}${startMonth}${startDay}T090000Z`;
  const dtEnd = `${startYear}${startMonth}${startDay}T170000Z`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventPass Portal//Static Edition//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${reg.passId}@eventpass.local`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.location}`,
    `DESCRIPTION:User / Pass Holder: ${reg.attendeeName || 'Registered User'}\\nCollege: ${reg.college || reg.org || 'College / University'}\\nTier: ${reg.tier}\\nPass ID: ${reg.passId}\\nAccess: ${reg.seat}\\n${ev.desc}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${ev.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Calendar invite (.ics) created and downloaded!", "success");
}

// --- Print Badge ---
function printPassBadge(passId) {
  showToast("Opening print dialogue for badge pass...", "info");
  setTimeout(() => {
    window.print();
  }, 300);
}

// --- Revoke / Cancel Pass ---
function revokePass(passId) {
  const index = myRegistrations.findIndex(r => r.passId === passId);
  if (index === -1) return;

  const pass = myRegistrations[index];
  const ev = events.find(e => e.id === pass.eventId);

  if (confirm(`Are you sure you want to surrender your pass for "${ev ? ev.title : 'this event'}"?`)) {
    myRegistrations.splice(index, 1);
    saveRegistrations();
    if (ev) ev.spotsLeft++;
    renderEvents();
    renderTickets();
    updateStats();
    showToast("Pass has been successfully cancelled.", "info");
  }
}

// --- Stats Row Counter ---
function updateStats() {
  const totalEventsEl = document.getElementById('stat-total-events');
  const totalPassesEl = document.getElementById('stat-my-passes');
  const vipPassesEl = document.getElementById('stat-vip-passes');

  if (totalEventsEl) totalEventsEl.innerText = events.length;
  if (totalPassesEl) totalPassesEl.innerText = myRegistrations.length;
  if (vipPassesEl) {
    const vipCount = myRegistrations.filter(r => (r.tier || '').toLowerCase().includes('vip')).length;
    vipPassesEl.innerText = vipCount;
  }
}

function resetFilters() {
  activeCategory = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.category === 'all');
  });
  renderEvents();
}

// --- Dialog Modal Helpers & Light Dismiss (Modern Web Guidance) ---
function closeModal(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) dialog.close();
}

function setupDialogLightDismiss() {
  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dialog => {
    // If browser lacks native closedby support, provide click-outside fallback
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          dialog.close();
        }
      });
    }
  });
}

// --- Toast System ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'warn' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// --- XSS Protection Helper ---
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
