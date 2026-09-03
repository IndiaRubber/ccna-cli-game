export const emails = [
  {
    id: 'welcome',
    from: 'Network Engineering',
    subject: 'Welcome to District 3',
    preview: 'Start here, new hire.',
    body: `
      <p>
        Welcome to the District 3 Satellite Office. Due to a very normal and not at all concerning staffing shortage,
        you have been temporarily assigned to assist with basic network operations.
      </p>

      <p>
        HELIOS-CLI has been assigned as your infrastructure assistant. It is obsolete, overconfident, and technically
        still within support parameters.
      </p>

      <p>
        Review your inbox, read the training brief, then open your first ticket.
      </p>
    `
  },

  {
    id: 'training',
    unlockAfterQuest: 'mission-0',
    from: 'HELIOS-CLI',
    subject: 'Training Brief: Switch Access Ports',
    preview: 'Useful commands for your first assignment.',
    body: `
        <p>
            Access ports connect end-user devices to a specific VLAN. Unlike trunk ports, they carry traffic for one primary VLAN.
        </p>

        <p>
            For your first assignment, you may need to inspect interface status, enter configuration mode, choose the correct
            interface, set it as an access port, assign the correct VLAN, add a useful description, and save the configuration.
        </p>

        <p>
            Useful commands may include:
        </p>

        <pre><code>enable
show interfaces status
configure terminal
interface g#/#
switchport mode access
switchport access vlan 10
description Office 4B Workstation
end
write memory</code></pre>

        <p>
            HELIOS note: blindly configuring ports without reading the ticket is an excellent way to create more tickets.
        </p>
    `,
    notebookEntry: {
        id: 'switch-access-port-basics',
        title: 'Switch Access Port Basics',
        body: `
            <p>
                Access ports connect end-user devices to one primary VLAN.
                Certain commands can only be run in privileged EXEC mode, while others require global configuration or interface configuration mode.
                
            </p>

            <h4>Useful Commands</h4>

            <pre><code>enable
show interfaces status
configure terminal
interface g#/#
switchport mode access
switchport access vlan 10
description Office 4B Workstation
end
write memory</code></pre>

            <h4>Reminder</h4>

            <p>
                Use <code>show interfaces status</code> to identify ports by description before configuring them.
            </p>
        `
  }
},

  {
    id: 'ticket-office4b',
    missionId: 'mission-1',
    unlockAfterQuest: 'mission-0',
    from: 'Helpdesk Queue',
    subject: 'Ticket: Office 4B New Hire Port',
    preview: 'User reports workstation offline.',
    body: `
      <p>
        A new hire in Office 4B reports that their workstation is connected but has no network access.
      </p>

      <p>
        The desk was recently moved, and the device appears to be patched into an available switchport in IDF-3A.
        Please inspect the switch and configure the appropriate port for workstation access.
      </p>

      <p>
        The workstation should be placed on the standard user access network.
      </p>

      <p>
        Ticket priority: Medium.
      </p>

      <button id="email-start-ticket-button" class="email-action-button">
        Open Terminal for This Ticket
      </button>
    `
  },

  {
    id: 'ticket-office4b-observation',
    missionId: 'mission-0',
    from: 'Facilities Support Queue',
    subject: 'Ticket: Verify Office 4B Connection',
    preview: 'Confirm the physical switch connection before activation.',
    heliosMessage:
      'Before we touch anything, let\'s see what the switch thinks is happening.',
    body: `
      <p>
        Facilities reports that the new workstation for Office 4B has been connected in IDF-3A.
      </p>

      <p>
        Before anyone activates or changes the port, inspect D8SW1 and identify which switch interface is carrying
        the Office 4B connection. Record the finding for the next technician.
      </p>

      <p>Ticket priority: Low.</p>

      <button id="email-start-ticket-button" class="email-action-button">
        Open Terminal for This Ticket
      </button>
    `
  },

  {
    id: 'corporate',
    from: 'Facilities',
    subject: 'Reminder: Do Not Block IDF Doors',
    preview: 'Apparently this needed to be said again.',
    body: `
      <p>
        Please do not block IDF doors with chairs, carts, boxes, discarded monitors, holiday decorations, or mystery equipment
        labeled "probably still important."
      </p>

      <p>
        Network closets require clear access for maintenance, emergency response, and the occasional ritual appeasement of
        legacy switching hardware.
      </p>

      <p>
        Thank you for your cooperation.
      </p>
    `
  },

  {
    id: 'mission0-debrief',
    unlockAfterQuest: 'mission-0',
    from: 'Network Operations Training',
    subject: 'RE: Office 4B Connection Verified',
    preview: 'Nothing changed. That was the point.',
    heliosMessage:
      'Physical path verified. We learned what the switch sees before asking it to do anything new.',
    body: `
      <p>
        You confirmed that Office 4B is physically connected through Gi1/0/12 on D8SW1.
        No configuration changes were made during this check.
      </p>

      <p>
        Keep the habit: observe first, understand what the device reports, then make the smallest change that solves
        the actual ticket.
      </p>
    `,
    notebookEntry: {
      id: 'office4b-switch-connection',
      title: 'Office 4B Switch Connection',
      body: `
        <p>Office 4B → D8SW1 → Gi1/0/12</p>
        <p>Verified from the switch interface-status output before configuration.</p>
      `
    }
  },

  {
    id: 'mission1-debrief',
    unlockAfterQuest: 'mission-1',
    from: 'Mara Voss — Network Administration',
    subject: 'RE: Office 4B — Acceptable Recovery',
    preview: 'You inspected the port and only broke the problem you were assigned.',
    heliosMessage:
      'A compliment from Network Administration has arrived wearing several layers of protective sarcasm.',
    body: `
      <p>
        The Office 4B workstation is online. You inspected the switch, changed the intended interface,
        and saved the configuration. That clears the current standard for "did not create an outage elsewhere."
      </p>

      <p>
        Keep the sequence: inspect, identify, change, verify, save. Experienced operators still follow it;
        they are simply faster at pretending it was obvious.
      </p>

      <p>— Mara Voss, Senior Network Administrator</p>
    `,
    notebookEntry: {
      id: 'change-verification-workflow',
      title: 'Change and Verification Workflow',
      body: `
        <ol>
          <li>Inspect the current device state.</li>
          <li>Identify the exact interface or configuration involved.</li>
          <li>Make the smallest required change.</li>
          <li>Verify the running configuration and operational result.</li>
          <li>Save only after the intended configuration is confirmed.</li>
        </ol>
      `
    }
  },

  {
    id: 'ticket-office4b-phone',
    missionId: 'mission-2',
    unlockAfterQuest: 'mission-1',
    from: 'Helpdesk Queue',
    subject: 'Ticket: Office 4B Desk Phone Offline',
    preview: 'The workstation works, but the phone will not register.',
    heliosMessage:
      'The workstation is online, so the physical link and data configuration are probably not our first suspects.',
    body: `
      <p>
        The new hire in Office 4B can reach the network from their workstation, but the IP phone at the same desk
        displays "Network Unavailable" and will not register.
      </p>

      <p>
        The workstation and phone share the desk connection through Gi1/0/12 on D8SW1. Inspect the existing
        switchport configuration before making changes, restore phone service, and verify the result.
      </p>

      <p>Ticket priority: Medium.</p>

      <button id="email-start-ticket-button" class="email-action-button">
        Open Terminal for This Ticket
      </button>
    `,
    notebookEntry: {
      id: 'voice-vlan-basics',
      title: 'Voice VLAN Basics',
      body: `
        <p>
          A workstation and an IP phone can share one physical switchport while using different logical networks.
          The access VLAN carries ordinary workstation traffic; a separately configured voice VLAN identifies the
          phone's voice traffic.
        </p>
      `
    }
  },

  {
    id: 'mission2-debrief',
    unlockAfterQuest: 'mission-2',
    from: 'Mara Voss — Network Administration',
    subject: 'RE: Office 4B Phone — Service Restored',
    preview: 'One port, two logical networks, and no unnecessary outage.',
    heliosMessage:
      'Phone service restored. The physical port was shared; the missing distinction was logical. Networking remains committed to abstraction.',
    body: `
      <p>
        The Office 4B workstation remained on DATA VLAN 10 while the desk phone was restored on VOICE VLAN 20.
        Both devices can share the same physical switchport while belonging to separate logical networks.
      </p>

      <p>
        You used the working workstation as evidence, inspected before changing, corrected only the missing voice
        configuration, verified the result, and saved the switch configuration.
      </p>

      <p>— Mara Voss, Senior Network Administrator</p>
    `
  },

  {
    id: 'ticket-relocated-printer',
    missionId: 'mission-3',
    unlockAfterQuest: 'mission-2',
    from: 'Facilities Support Queue',
    subject: 'Ticket: Relocated Department Printer Offline',
    preview: 'The printer moved. Its network configuration did not.',
    heliosMessage:
      'Facilities moved hardware without moving its network configuration. A timeless collaboration strategy.',
    body: `
      <p>
        A department printer stopped working after an office move. Facilities confirms the printer is now connected
        to a spare wall jack, but no network move request was submitted.
      </p>

      <p>
        Inspect the switch to determine which printer port went offline and which spare connection is now active.
        Use the old printer port as a known-good comparison, shut down the abandoned port, then restore service
        on the new connection using the dedicated Printer VLAN 15. Verify the result and save the configuration.
      </p>

      <p>Suggested command sequence:</p>

      <pre><code>enable
show interfaces status
show running-config interface g0/6
show running-config interface g0/13
configure terminal
interface g0/6
shutdown
interface g0/13
switchport mode access
switchport access vlan 15
description Records Printer
end
show running-config interface g0/13
write memory</code></pre>

      <p>Ticket priority: Medium.</p>

      <button id="email-start-ticket-button" class="email-action-button">
        Open Terminal for This Ticket
      </button>
    `,
    notebookEntry: {
      id: 'relocated-printer-recovery',
      title: 'Relocated Printer Recovery',
      body: `
        <p>
          Compare the disconnected old printer port with the newly connected spare port. After confirming the move,
          shut down the abandoned port, configure the new port for Printer VLAN 15, document its location, verify, and save.
        </p>

        <h4>Suggested Commands</h4>

        <pre><code>enable
show interfaces status
show running-config interface g0/6
show running-config interface g0/13
configure terminal
interface g0/6
shutdown
interface g0/13
switchport mode access
switchport access vlan 15
description Records Printer
end
show running-config interface g0/13
write memory</code></pre>
      `
    }
  },

  {
    id: 'mission3-debrief',
    unlockAfterQuest: 'mission-3',
    from: 'Mara Voss — Network Administration',
    subject: 'RE: Relocated Printer — Service Restored',
    preview: 'The configuration stayed with the port, not the printer.',
    heliosMessage:
      'Printer service restored. The endpoint moved; the switchport configuration did not. This is why comparisons matter.',
    body: `
      <p>
        You used the old known-good printer port as evidence, configured the new connection on Printer VLAN 15,
        documented its location, verified the result, and saved the switch configuration.
      </p>

      <p>
        The abandoned port remains configured for its former device. We will cover cleanup and unused-port protection
        in a later exercise.
      </p>
    `,
    notebookEntry: {
      id: 'relocated-printer-workflow',
      title: 'Relocated Printer Workflow',
      body: `
        <p>
          Endpoint movement does not move switchport configuration. Inspect the disconnected old port, compare its
          known-good settings with the newly connected port, then configure and verify the replacement.
        </p>
      `
    }
  },

  {
    id: 'ticket-warehouse-endpoint',
    missionId: 'mission-4',
    unlockAfterQuest: 'mission-3',
    from: 'Warehouse Support Queue',
    subject: 'Ticket: Warehouse Scanner Connection Record',
    preview: 'The scanner works. The port record does not.',
    heliosMessage:
      'The endpoint is online, so this is a trace-and-document ticket. Resist the urge to repair what is not broken.',
    body: `
      <p>
        Warehouse support has a scanner that is currently online and communicating normally, but the cabling records
        do not identify which D8SW1 switchport serves it.
      </p>

      <p>
        The scanner MAC address is <code>00aa.bbcc.dd21</code>. Use the switch's learned MAC information to locate
        the connection, inspect the interface, and correct the stale documentation. Do not change working network
        settings unless your inspection provides evidence that something is wrong.
      </p>

      <p>Ticket priority: Low.</p>

      <button id="email-start-ticket-button" class="email-action-button">
        Open Terminal for This Ticket
      </button>
    `
  },

  {
    id: 'mission4-debrief',
    unlockAfterQuest: 'mission-4',
    from: 'Mara Voss — Network Administration',
    subject: 'RE: Warehouse Scanner Connection Record',
    preview: 'The scanner stayed online, and now the record is useful.',
    heliosMessage:
      'MAC evidence located the interface. Documentation improved without disturbing a working endpoint.',
    body: `
      <p>
        You used the scanner's MAC address to locate its learned switchport, confirmed the existing access VLAN 10
        configuration, corrected the interface description, verified the result, and saved the switch configuration.
      </p>

      <p>
        A switch learns source MAC addresses and associates them with interfaces. That makes the MAC address table
        a useful starting point when physical documentation is incomplete.
      </p>
    `,
    notebookEntry: {
      id: 'mac-address-table-reference',
      title: 'MAC Address Table Reference',
      body: `
        <p>
          Switches learn source MAC addresses and associate each learned address with a VLAN and interface.
          One physical interface can have more than one learned MAC address, such as a workstation and phone.
        </p>

        <pre><code>show mac address-table
show mac address-table address &lt;mac&gt;
show mac address-table interface &lt;interface&gt;</code></pre>

        <p>
          If you only know an IP address, an additional lookup step is needed before a switchport can be identified.
        </p>
      `
    }
  },

  {
    id: 'ticket-rear-door-camera',
    missionId: 'mission-5',
    unlockAfterQuest: 'mission-4',
    from: 'Security Operations',
    subject: 'Ticket: Rear Door Camera Offline',
    preview: 'One camera is down. The neighboring one is not.',
    heliosMessage:
      'The front camera is still online, which makes a total switch failure less fashionable as a theory.',
    body: `
      <p>
        Security reports that the rear-door camera is unreachable. The front-door camera remains operational,
        and Facilities confirms the rear camera is still physically connected to D8SW1.
      </p>

      <p>
        Please confirm that D8SW1 itself is healthy, determine why the rear camera is offline, restore service,
        verify power and connectivity, and save the configuration. The camera's Ethernet configuration should
        be treated as working unless your evidence shows otherwise.
      </p>

      <p>Ticket priority: High.</p>

      <button id="email-start-ticket-button" class="email-action-button">
        Open Terminal for This Ticket
      </button>
    `
  },

  {
    id: 'mission5-debrief',
    unlockAfterQuest: 'mission-5',
    from: 'Mara Voss — Network Administration',
    subject: 'RE: Rear Door Camera — Service Restored',
    preview: 'The switch was healthy. The port simply stopped providing power.',
    heliosMessage:
      'The switch itself was healthy, and the smallest interface-level correction restored the camera.',
    body: `
      <p>
        You confirmed the switch environment was healthy, compared the working front camera with the rear camera,
        and found that the rear port's PoE delivery had been disabled. Restoring automatic inline power brought the
        camera back online without changing its VLAN or other interface settings.
      </p>

      <p>
        This is a useful Layer 1 reminder: a powered Ethernet endpoint can disappear when its network connection
        remains physically present but no longer supplies electrical power.
      </p>
    `,
    notebookEntry: {
      id: 'poe-troubleshooting-reference',
      title: 'PoE Troubleshooting Reference',
      body: `
        <p>
          PoE means Power over Ethernet. Phones, access points, cameras, and other endpoints may receive electrical
          power through the same Ethernet connection that carries their data.
        </p>

        <pre><code>show power inline
show power inline &lt;interface&gt;
power inline auto
power inline never
show environment</code></pre>

        <p>
          <strong>Admin</strong> is the configured PoE behavior. <strong>Oper</strong> is the actual delivery state.
          Admin <code>never</code>, Oper <code>off</code>, and 0 watts can explain why a PoE-dependent endpoint is offline.
        </p>
      `
    }
  },

  {
    id: 'postmission-corporate-survey',
    unlockAfterQuest: 'mission-1',
    from: 'People Operations',
    subject: 'Required: Infrastructure Wellness Pulse Survey',
    preview: 'Please rate how supported your cables feel.',
    heliosMessage:
      'The survey contains no questions about network availability. This may explain several organizational trends.',
    body: `
      <p>
        People Operations invites all infrastructure personnel to complete this quarter's mandatory wellness survey.
        Please rate rack airflow, cable morale, and your sense of belonging within the change-control process.
      </p>

      <p>
        Responses are anonymous except for name, department, employee number, device fingerprint, and manager approval code.
      </p>
    `
  },

  {
    id: 'postmission-operations-brief',
    unlockAfterQuest: 'mission-2',
    from: 'District 3 Operations Queue',
    subject: 'Shift Brief: Unknown Endpoint Reports',
    preview: 'Future tickets may not include a room or switchport.',
    heliosMessage:
      'Operations has discovered that users do not label devices for our convenience. A bold new obstacle.',
    body: `
      <p>
        Upcoming endpoint investigations may provide only a hardware address instead of a room or switchport.
        Record identifiers exactly as reported and inspect device tables before making configuration changes.
      </p>

      <p>
        A switch can associate a learned source MAC address with the interface where frames arrived. This is evidence,
        not permission to reconfigure the port. Confirm the physical context first.
      </p>
    `,
    notebookEntry: {
      id: 'endpoint-identification-basics',
      title: 'Endpoint Identification Basics',
      body: `
        <p>
          A switch learns source MAC addresses and associates them with interfaces. When a ticket supplies a MAC address,
          preserve it accurately, inspect the switch's MAC address table, and verify the resulting interface against the
          physical location before changing configuration.
        </p>
      `
    }
  }
];
