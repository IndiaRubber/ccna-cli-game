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
  }
];