export const buildingHotspots = [
  {
    id: 'office-4b',
    floor: 'floor-3',
    x: 78.1,
    y: 44,
    label: 'Office 4B',
    missionIds: ['mission-0', 'mission-1', 'mission-2'],
    status: 'warning',
    actionId: 'map-office-4b-button'
  },
  {
    id: 'relocated-printer',
    floor: 'floor-1',
    x: 66.6,
    y: 68,
    label: 'Relocated Printer',
    missionIds: ['mission-3'],
    status: 'warning'
  },
  {
    id: 'warehouse-scanner',
    floor: 'floor-2',
    x: 35.5,
    y: 56,
    label: 'Warehouse Scanner',
    missionIds: ['mission-4'],
    status: 'warning'
  },
  {
    id: 'rear-door-camera',
    floor: 'floor-1',
    x: 86.1,
    y: 68,
    label: 'Rear Door Camera',
    missionIds: ['mission-5'],
    status: 'critical'
  }
];

let hotspotLayer = null;

function buildingSvg() {
  return `
    <svg class="district-building" viewBox="0 0 960 700" role="img" aria-labelledby="building-title building-description" shape-rendering="crispEdges">
      <title id="building-title">District 3 facility mission hub</title>
      <desc id="building-description">A side-view cutaway of five office floors and a basement IT datacenter.</desc>
      <defs>
        <pattern id="brick-grid" width="16" height="8" patternUnits="userSpaceOnUse">
          <rect width="16" height="8" fill="#151e2d"/>
          <path d="M0 0H16M0 8H16M8 0V4M0 4H16M4 4V8M12 4V8" stroke="#202c3d" stroke-width="1"/>
        </pattern>
        <pattern id="floor-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#101827"/>
          <path d="M0 12H12M12 0V12" stroke="#1e2b3d" stroke-width="1"/>
        </pattern>
        <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect width="960" height="700" fill="#07101c"/>
      <g class="night-sky" aria-hidden="true">
        <rect x="82" y="68" width="3" height="3" fill="#64748b"/><rect x="121" y="142" width="2" height="2" fill="#94a3b8"/>
        <rect x="842" y="89" width="3" height="3" fill="#64748b"/><rect x="885" y="176" width="2" height="2" fill="#94a3b8"/>
        <rect x="54" y="250" width="2" height="2" fill="#475569"/><rect x="916" y="270" width="3" height="3" fill="#475569"/>
        <path d="M0 474H42V442H78V462H110V410H146V515H0ZM810 515V425H846V391H878V447H910V417H944V515Z" fill="#0a1421"/>
        <path d="M19 488H134M825 476H944" stroke="#172437" stroke-width="4"/>
      </g>
      <rect y="515" width="960" height="185" fill="#090d15"/>
      <g class="skyline" opacity=".55">
        <rect x="20" y="390" width="90" height="125" fill="#0c1624"/>
        <rect x="830" y="350" width="110" height="165" fill="#0c1624"/>
        <rect x="42" y="420" width="8" height="8" fill="#334155"/><rect x="68" y="420" width="8" height="8" fill="#334155"/>
        <rect x="858" y="386" width="8" height="8" fill="#334155"/><rect x="892" y="386" width="8" height="8" fill="#334155"/>
      </g>
      <path d="M0 515H960" stroke="#475569" stroke-width="6"/>
      <path d="M0 524H154M806 524H960" stroke="#1e293b" stroke-width="10"/>
      <path d="M50 539H146M814 539H910" stroke="#253247" stroke-width="3" stroke-dasharray="14 8"/>

      <g class="floor-labels" aria-hidden="true">
        <path d="M24 122H151V148H24ZM24 202H151V228H24ZM24 282H151V308H24ZM24 362H151V388H24ZM24 446H151V472H24ZM24 548H151V578H24Z" fill="#0b1421" stroke="#334155" stroke-width="2"/>
        <path d="M24 122H31V148H24ZM24 202H31V228H24ZM24 282H31V308H24ZM24 362H31V388H24ZM24 446H31V472H24Z" fill="#475569"/>
        <path d="M24 548H31V578H24Z" fill="#0ea5e9"/>
        <text x="39" y="140">05  ADMIN</text>
        <text x="39" y="220">04  TRAINING</text>
        <text x="39" y="300" textLength="105" lengthAdjust="spacingAndGlyphs">03  OPERATIONS</text>
        <text x="39" y="380">02  USERS</text>
        <text x="39" y="464">01  LOBBY</text>
        <text x="39" y="568">B1  IT / MDF</text>
      </g>

      <g id="district-3-building" transform="translate(-23.1 0) scale(1.15 1)">
        <rect x="154" y="92" width="652" height="564" fill="#101722" stroke="#536276" stroke-width="6"/>
        <rect x="160" y="98" width="18" height="546" fill="url(#brick-grid)"/>
        <rect x="782" y="98" width="18" height="546" fill="url(#brick-grid)"/>
        <rect x="166" y="92" width="628" height="564" fill="url(#brick-grid)" stroke="#536276" stroke-width="6"/>
        <rect x="178" y="104" width="604" height="540" fill="#0b1320"/>

        <g id="roof" data-room-id="roof">
          <path d="M150 92H810L780 68H180Z" fill="#263447" stroke="#536276" stroke-width="4"/>
          <rect x="252" y="48" width="92" height="36" fill="#1e293b" stroke="#64748b" stroke-width="4"/>
          <rect x="264" y="56" width="68" height="18" fill="#0f172a"/>
          <path d="M279 56V74M298 56V74M317 56V74" stroke="#475569" stroke-width="4"/>
          <rect x="644" y="50" width="72" height="34" fill="#1e293b" stroke="#64748b" stroke-width="4"/>
          <path d="M680 50V18M664 28H696M680 18L672 30M680 18L688 30" stroke="#94a3b8" stroke-width="4"/>
          <circle cx="680" cy="17" r="4" fill="#ef4444" class="antenna-light"/>
        </g>

        <g id="floor-5" data-room-id="floor-5">
          <rect x="180" y="106" width="600" height="76" fill="#16202f"/>
          <rect x="198" y="119" width="80" height="44" fill="#0b1828" stroke="#314159" stroke-width="3"/>
          <rect x="210" y="130" width="56" height="22" fill="#162d43"/>
          <rect x="327" y="145" width="106" height="10" fill="#475569"/><rect x="342" y="155" width="8" height="16" fill="#334155"/><rect x="410" y="155" width="8" height="16" fill="#334155"/>
          <rect x="352" y="126" width="34" height="19" fill="#0c2134" stroke="#38bdf8" stroke-width="2" class="monitor-screen"/>
          <rect x="488" y="118" width="3" height="54" fill="#334155"/>
          <rect x="528" y="145" width="92" height="10" fill="#475569"/><rect x="548" y="155" width="8" height="16" fill="#334155"/>
          <rect x="650" y="119" width="105" height="44" fill="#111c2c" stroke="#314159" stroke-width="3"/>
          <path d="M662 151L680 129L698 151L716 126L742 151" fill="none" stroke="#475569" stroke-width="3"/>
          <path d="M304 108V174M470 108V174M636 108V174" stroke="#28374a" stroke-width="5"/>
          <path d="M305 153V174H326M636 153V174H657" fill="none" stroke="#64748b" stroke-width="4"/>
          <rect x="218" y="109" width="42" height="5" fill="#dbeafe" opacity=".68" class="ceiling-light"/>
          <rect x="390" y="109" width="42" height="5" fill="#dbeafe" opacity=".68" class="ceiling-light"/>
          <rect x="696" y="109" width="42" height="5" fill="#dbeafe" opacity=".68" class="ceiling-light"/>
          <g class="pixel-chair" fill="#334155"><rect x="366" y="158" width="18" height="8"/><rect x="370" y="166" width="10" height="7"/><rect x="551" y="158" width="18" height="8"/><rect x="555" y="166" width="10" height="7"/></g>
        </g>

        <g id="floor-4" data-room-id="floor-4">
          <rect x="180" y="186" width="600" height="76" fill="#141d2b"/>
          <rect x="205" y="218" width="132" height="10" fill="#536276"/><rect x="220" y="228" width="8" height="23" fill="#334155"/><rect x="314" y="228" width="8" height="23" fill="#334155"/>
          <rect x="231" y="199" width="26" height="19" fill="#10283c" stroke="#60a5fa" stroke-width="2" class="monitor-screen"/>
          <rect x="405" y="218" width="132" height="10" fill="#536276"/><rect x="420" y="228" width="8" height="23" fill="#334155"/><rect x="514" y="228" width="8" height="23" fill="#334155"/>
          <rect x="453" y="198" width="34" height="20" fill="#10283c" stroke="#60a5fa" stroke-width="2"/>
          <rect x="592" y="198" width="158" height="50" fill="#101826" stroke="#314159" stroke-width="3"/>
          <rect x="607" y="210" width="128" height="26" fill="#18283a"/>
          <path d="M620 229L639 216L658 226L677 213L698 224L721 216" fill="none" stroke="#5eead4" stroke-width="3"/>
          <path d="M374 188V254M568 188V254" stroke="#28374a" stroke-width="5"/>
          <path d="M374 233V254H394M568 233V254H588" fill="none" stroke="#64748b" stroke-width="4"/>
          <rect x="233" y="189" width="48" height="5" fill="#dbeafe" opacity=".62" class="ceiling-light"/>
          <rect x="433" y="189" width="48" height="5" fill="#dbeafe" opacity=".62" class="ceiling-light"/>
          <rect x="654" y="189" width="48" height="5" fill="#dbeafe" opacity=".62" class="ceiling-light"/>
          <g fill="#3a485a"><rect x="238" y="231" width="16" height="9"/><rect x="242" y="240" width="8" height="10"/><rect x="438" y="231" width="16" height="9"/><rect x="442" y="240" width="8" height="10"/><rect x="492" y="231" width="16" height="9"/><rect x="496" y="240" width="8" height="10"/></g>
        </g>

        <g id="floor-3" data-room-id="floor-3">
          <rect x="180" y="266" width="600" height="76" fill="#111c2a"/>
          <rect x="202" y="278" width="112" height="50" fill="#172334" stroke="#334155" stroke-width="3"/>
          <rect x="224" y="309" width="68" height="8" fill="#475569"/><rect x="235" y="289" width="26" height="18" fill="#0c263a" stroke="#38bdf8" stroke-width="2" class="monitor-screen"/>
          <rect x="339" y="278" width="150" height="50" fill="#172334" stroke="#334155" stroke-width="3"/>
          <rect x="354" y="290" width="48" height="28" fill="#0f172a"/><rect x="416" y="290" width="56" height="28" fill="#0f172a"/>
          <rect x="514" y="278" width="158" height="50" fill="#162337" stroke="#3b82f6" stroke-width="3" class="office-4b-room"/>
          <rect x="532" y="307" width="74" height="8" fill="#536276"/><rect x="546" y="287" width="27" height="18" fill="#102c40" stroke="#38bdf8" stroke-width="2"/>
          <rect x="690" y="278" width="72" height="50" fill="#09111d" stroke="#475569" stroke-width="3"/>
          <rect x="701" y="286" width="50" height="34" fill="#101c2b" stroke="#64748b" stroke-width="2"/>
          <g class="switch-leds"><circle cx="710" cy="296" r="2"/><circle cx="718" cy="296" r="2"/><circle cx="726" cy="296" r="2"/><circle cx="734" cy="296" r="2"/></g>
          <path d="M326 268V334M500 268V334M680 268V334" stroke="#29394c" stroke-width="5"/>
          <path d="M326 312V334H346M500 312V334H520M680 312V334H696" fill="none" stroke="#64748b" stroke-width="4"/>
          <rect x="225" y="269" width="44" height="5" fill="#bfdbfe" opacity=".62" class="ceiling-light"/>
          <rect x="382" y="269" width="44" height="5" fill="#bfdbfe" opacity=".62" class="ceiling-light"/>
          <rect x="548" y="269" width="44" height="5" fill="#bfdbfe" opacity=".62" class="ceiling-light"/>
          <path d="M712 304h28M712 311h28M712 318h28" stroke="#475569" stroke-width="3"/>
        </g>

        <g id="floor-2" data-room-id="floor-2">
          <rect x="180" y="346" width="600" height="76" fill="#15202d"/>
          <rect x="201" y="358" width="172" height="50" fill="#172434" stroke="#334155" stroke-width="3" class="warehouse-zone"/>
          <rect x="218" y="390" width="58" height="8" fill="#475569"/><rect x="289" y="390" width="58" height="8" fill="#475569"/>
          <rect x="230" y="370" width="23" height="18" fill="#102c40" stroke="#38bdf8" stroke-width="2"/>
          <rect x="402" y="358" width="170" height="50" fill="#172434" stroke="#334155" stroke-width="3"/>
          <rect x="422" y="390" width="54" height="8" fill="#475569"/><rect x="491" y="390" width="54" height="8" fill="#475569"/>
          <path d="M451 374h12v14h-12zM520 374h12v14h-12z" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
          <rect x="603" y="358" width="146" height="50" fill="#121c29" stroke="#334155" stroke-width="3"/>
          <g><rect x="622" y="373" width="34" height="26" fill="#29384b" stroke="#64748b" stroke-width="3"/>
          <rect x="630" y="365" width="18" height="9" fill="#cbd5e1"/>
          <rect x="629" y="384" width="20" height="5" fill="#111827"/></g>
          <path d="M386 348V414M586 348V414" stroke="#29394c" stroke-width="5"/>
          <path d="M386 393V414H406M586 393V414H606" fill="none" stroke="#64748b" stroke-width="4"/>
          <rect x="234" y="349" width="44" height="5" fill="#dbeafe" opacity=".58" class="ceiling-light"/>
          <rect x="455" y="349" width="44" height="5" fill="#dbeafe" opacity=".58" class="ceiling-light"/>
          <rect x="667" y="349" width="44" height="5" fill="#dbeafe" opacity=".58" class="ceiling-light"/>
          <path d="M208 378H365M208 402H365" stroke="#263447" stroke-width="3"/><path d="M255 358V408M313 358V408" stroke="#263447" stroke-width="3"/>
        </g>

        <g id="floor-1" data-room-id="floor-1">
          <rect x="180" y="426" width="600" height="86" fill="#17212c"/>
          <rect x="199" y="439" width="127" height="59" fill="#1a2735" stroke="#334155" stroke-width="3"/>
          <rect x="215" y="473" width="92" height="10" fill="#64748b"/><rect x="230" y="483" width="8" height="14" fill="#475569"/>
          <rect x="249" y="451" width="27" height="20" fill="#102c40" stroke="#38bdf8" stroke-width="2" class="monitor-screen"/>
          <rect x="349" y="439" width="95" height="59" fill="#101925" stroke="#334155" stroke-width="3"/>
          <path d="M367 488V454H426V488" fill="none" stroke="#64748b" stroke-width="5"/>
          <rect x="468" y="439" width="178" height="59" fill="#172334" stroke="#334155" stroke-width="3"/>
          <g class="printer-device"><rect x="493" y="470" width="42" height="28" fill="#29384b" stroke="#64748b" stroke-width="3"/><rect x="501" y="461" width="25" height="10" fill="#cbd5e1"/></g>
          <rect x="670" y="439" width="92" height="59" fill="#0e1723" stroke="#334155" stroke-width="3"/>
          <g class="rear-camera-device"><rect x="738" y="451" width="8" height="8" fill="#ef4444" class="camera-light"/><path d="M701 461h35l10 9h-45z" fill="#64748b"/></g>
          <path d="M338 428V504M455 428V504M658 428V504" stroke="#29394c" stroke-width="5"/>
          <path d="M338 481V504H358M455 481V504H475M658 481V504H678" fill="none" stroke="#64748b" stroke-width="4"/>
          <rect x="227" y="429" width="44" height="5" fill="#dbeafe" opacity=".64" class="ceiling-light"/>
          <rect x="512" y="429" width="44" height="5" fill="#dbeafe" opacity=".64" class="ceiling-light"/>
          <path d="M372 493V449H423V493M397 449V493" fill="#0a1421" stroke="#94a3b8" stroke-width="4"/><rect x="391" y="470" width="5" height="5" fill="#38bdf8"/>
          <g fill="#334155"><rect x="545" y="477" width="31" height="10"/><rect x="550" y="487" width="6" height="10"/><rect x="565" y="487" width="6" height="10"/></g>
        </g>

        <g id="basement" data-room-id="basement">
          <rect x="180" y="516" width="600" height="128" fill="url(#floor-grid)"/>
          <rect x="180" y="516" width="600" height="10" fill="#253247"/>
          <rect x="180" y="526" width="600" height="4" fill="#0ea5e9" opacity=".42"/>
          <path d="M192 539H500V532H615V540H770" fill="none" stroke="#64748b" stroke-width="5"/>
          <path d="M192 546H456V540H590" fill="none" stroke="#334155" stroke-width="3"/>
          <rect x="212" y="518" width="56" height="6" fill="#cffafe" opacity=".62" class="ceiling-light"/>
          <rect x="420" y="518" width="56" height="6" fill="#cffafe" opacity=".62" class="ceiling-light"/>
          <rect x="648" y="518" width="56" height="6" fill="#cffafe" opacity=".62" class="ceiling-light"/>
          <rect x="194" y="528" width="92" height="102" fill="#080e17" stroke="#64748b" stroke-width="4"/>
          <rect x="204" y="540" width="72" height="18" fill="#1e293b"/><rect x="204" y="563" width="72" height="18" fill="#1e293b"/><rect x="204" y="586" width="72" height="18" fill="#1e293b"/>
          <g class="rack-leds"><circle cx="214" cy="549" r="3"/><circle cx="226" cy="549" r="3"/><circle cx="214" cy="572" r="3"/><circle cx="226" cy="572" r="3"/><circle cx="214" cy="595" r="3"/><circle cx="226" cy="595" r="3"/></g>
          <rect x="300" y="528" width="92" height="102" fill="#080e17" stroke="#64748b" stroke-width="4"/>
          <path d="M312 546H380M312 563H380M312 580H380M312 597H380" stroke="#334155" stroke-width="8"/>
          <g class="switch-leds"><circle cx="321" cy="546" r="2"/><circle cx="331" cy="546" r="2"/><circle cx="341" cy="546" r="2"/><circle cx="351" cy="546" r="2"/></g>
          <path d="M315 616H376" stroke="#1e293b" stroke-width="8"/><path d="M320 616h6m8 0h6m8 0h6m8 0h6" stroke="#38bdf8" stroke-width="3"/>
          <rect x="408" y="552" width="74" height="78" fill="#171f2c" stroke="#64748b" stroke-width="4"/><rect x="420" y="566" width="50" height="16" fill="#0c1624"/><rect x="420" y="590" width="50" height="24" fill="#252f3e"/>
          <text x="426" y="578" class="ups-label">UPS</text><circle cx="462" cy="575" r="3" fill="#22c55e" class="rack-leds"/>
          <rect x="526" y="588" width="128" height="10" fill="#536276"/><rect x="544" y="598" width="8" height="31" fill="#334155"/><rect x="631" y="598" width="8" height="31" fill="#334155"/>
          <rect x="555" y="545" width="70" height="41" fill="#07111d" stroke="#38bdf8" stroke-width="3" class="terminal-screen"/>
          <path d="M566 558h26M566 567h42M566 576h18" stroke="#67e8f9" stroke-width="3" class="terminal-lines"/>
          <rect x="608" y="599" width="20" height="9" fill="#263447"/><rect x="612" y="608" width="12" height="28" fill="#334155"/>
          <g class="operator-sprite" transform="translate(661 527) scale(1.32)">
            <rect x="12" y="0" width="20" height="18" fill="#c7a889"/><rect x="8" y="4" width="28" height="8" fill="#1e293b"/>
            <rect x="13" y="8" width="4" height="4" fill="#111827"/><rect x="27" y="8" width="4" height="4" fill="#111827"/>
            <rect x="8" y="18" width="28" height="38" fill="#334155"/><rect x="0" y="23" width="8" height="28" fill="#475569"/><rect x="36" y="23" width="8" height="28" fill="#475569"/>
            <rect x="10" y="56" width="10" height="28" fill="#1e293b"/><rect x="24" y="56" width="10" height="28" fill="#1e293b"/>
            <rect x="8" y="84" width="14" height="7" fill="#111827"/><rect x="22" y="84" width="14" height="7" fill="#111827"/>
            <rect x="14" y="25" width="16" height="12" fill="#0f7490"/><rect x="18" y="28" width="8" height="3" fill="#67e8f9"/>
          </g>
          <path d="M282 617C315 635 348 617 408 621M392 535C430 518 482 532 526 551" fill="none" stroke="#2563eb" stroke-width="3"/>
          <path d="M286 623C325 641 373 625 417 629" fill="none" stroke="#f59e0b" stroke-width="2"/>
          <path d="M194 635H770" stroke="#475569" stroke-width="5"/><path d="M202 640H762" stroke="#1e293b" stroke-width="4" stroke-dasharray="18 6"/>
          <text x="505" y="623" class="mdf-label">DISTRICT 3 // IT MDF</text>
        </g>

        <path class="floor-slabs" d="M174 180H786V190H174ZM174 260H786V270H174ZM174 340H786V350H174ZM174 420H786V430H174ZM174 508H786V518H174Z" fill="#354357"/>
        <path d="M178 181H782M178 261H782M178 341H782M178 421H782M178 509H782" stroke="#718096" stroke-width="2"/>
      </g>
    </svg>`;
}

function controlsMarkup() {
  return `
    <button id="floor-3-button" class="hub-floor-control" type="button" aria-expanded="false">
      <span>FLOOR 3</span><span class="floor-expand-indicator">Expand</span>
    </button>
    <div class="map-node-row hub-node-menu hidden" id="floor-3-node-row">
      <button class="map-node" id="map-office-4b-button" type="button">Office 4B</button>
      <button class="map-node" id="map-idf-3a-button" type="button">IDF-3A</button>
      <button class="map-node primary-node" id="map-switch-d8sw1-button" type="button">Switch D8SW1</button>
    </div>`;
}

export function setBuildingHotspots(hotspots = []) {
  if (!hotspotLayer) return;

  hotspotLayer.innerHTML = '';

  for (const hotspot of hotspots) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `building-hotspot status-${hotspot.status ?? 'normal'}`;
    button.dataset.hotspotId = hotspot.id;
    button.dataset.floor = hotspot.floor;
    button.style.setProperty('--hotspot-x', `${hotspot.x}%`);
    button.style.setProperty('--hotspot-y', `${hotspot.y}%`);
    button.setAttribute('aria-label', `${hotspot.label}: ${hotspot.status ?? 'normal'}`);
    button.title = hotspot.label;
    button.disabled = !hotspot.active && hotspot.status === 'normal';
    button.innerHTML = `
      <span class="hotspot-symbol" aria-hidden="true"></span>
      <span class="hotspot-label">${hotspot.label}</span>
    `;

    if (hotspot.actionId) {
      button.addEventListener('click', () => {
        document.getElementById(hotspot.actionId)?.click();
      });
    }

    hotspotLayer.appendChild(button);
  }
}

export function getCampaignHotspots(state = {}) {
  const completed = new Set(state.completedQuests ?? []);
  if (state.questCompleted && state.currentQuestId) completed.add(state.currentQuestId);

  return buildingHotspots.map((hotspot) => {
    const completedHere = hotspot.missionIds.every((missionId) => completed.has(missionId));
    const active = hotspot.missionIds.includes(state.currentQuestId) && !completedHere;

    return {
      ...hotspot,
      active,
      status: completedHere ? 'resolved' : active ? hotspot.status : 'normal'
    };
  });
}

export function updateBuildingHub(state) {
  setBuildingHotspots(getCampaignHotspots(state));
}

export function initBuildingHub(root, state = {}) {
  if (!root) return;

  root.innerHTML = `
    <div class="building-stage">
      ${buildingSvg()}
      <div class="building-hotspot-layer" aria-label="Facility alerts"></div>
      ${controlsMarkup()}
    </div>
    <div class="building-legend" aria-label="Facility status legend">
      <span><i class="legend-light status-normal"></i>Normal</span>
      <span><i class="legend-light status-warning"></i>Warning</span>
      <span><i class="legend-light status-critical"></i>Critical</span>
      <span><i class="legend-light status-resolved"></i>Resolved</span>
      <strong>HOME BASE: B1 IT MDF</strong>
    </div>`;

  hotspotLayer = root.querySelector('.building-hotspot-layer');
  updateBuildingHub(state);
}
