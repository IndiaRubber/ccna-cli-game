export const heliosCommandComments = {
  enable: [
    "Notice how the prompt changed from > to #. That means you are in privileged EXEC mode. I’m sure that’s relevant.",
    "You have entered privileged mode. The switch now trusts you slightly more. A terrible mistake, statistically speaking.",
    "The # prompt means you can run higher-level commands now. Try not to feel too powerful."
  ],

  "configure terminal": [
    "Configuration terminal entered. This is where thoughts become running-config. Alarming, but useful.",
    "You are now editing the active configuration. The switch is listening. Possibly judging.",
    "Global configuration mode. From here, you can change how the device behaves instead of merely staring at it."
  ],

  "conf t": [
    "Shortcut detected. 'conf t' is the network admin equivalent of saying 'yeah yeah, get me there.'",
    "Configuration terminal entered via abbreviation. Efficient. Suspiciously so."
  ],

  "show vlan brief": [
    "This command lists VLANs and their assigned ports. Useful when reality has been separated into tiny broadcast domains.",
    "VLAN brief shows which VLANs exist and which access ports belong to them. Brief, but not emotionally available.",
    "Here you can verify whether VLAN 10 actually exists, instead of simply believing in it."
  ],

  "show interfaces status": [
    "This gives you a quick port-by-port summary: connected state, speed, duplex, and description. A switch gossip report.",
    "Interface status is your map of the switchports. If a device moved, this is a good place to start asking uncomfortable questions.",
    "This command helps identify which ports are connected, unused, or worth investigating. Very rude of them."
  ],

  "show interfaces brief": [
    "A compact interface overview. Less detailed than status, but still better than guessing wildly.",
    "This is a quick sanity check for ports. Networks love sanity checks. They rarely pass them."
  ],

  "show running-config": [
    "The running-config is what the switch is using right now. Not necessarily what it will remember after a reboot.",
    "This shows the active configuration. If you changed something and forgot to save it, this is where the evidence lives.",
    "Running-config is temporary unless saved. Much like my patience."
  ],

  "write memory": [
    "Configuration saved. The running-config has been copied into startup-config. The switch may now survive a reboot with its memories intact.",
    "Good. You saved the config. Unsaved changes are how network ghosts are born.",
    "Write memory complete. The switch will remember this. Unfortunately, so will I."
  ],

  "copy running-config startup-config": [
    "That saves the active configuration so it loads after reboot. Verbose, ceremonial, and correct.",
    "Running-config copied to startup-config. A longer way to say 'wr,' but with more dignity.",
    "The switch has committed your choices to memory. May future-you approve."
  ],

  vlan: [
    "You are now creating or editing a VLAN. A VLAN is a separate Layer 2 broadcast domain. Tiny network apartments.",
    "VLAN mode entered. This is where you define the VLAN itself, not where you assign a port to it.",
    "Creating the VLAN is step one. Assigning ports to use it is the part people forget. Constantly."
  ],

  name: [
    "Naming a VLAN does not change how it works, but it does make humans less confused. Allegedly.",
    "Good. A descriptive VLAN name helps the next technician understand what this is for. The next technician may be you."
  ],

  interface: [
    "Interface configuration mode. Changes here affect a specific port, not the whole switch.",
    "You are now working on one interface. This is where ports gain purpose. Or problems.",
    "Port selected. The switch is now waiting for you to tell this interface what it is supposed to be when it grows up."
  ],

  "switchport mode access": [
    "Access mode means this port belongs to one data VLAN. Good for workstations, printers, phones, and other users of varying reliability.",
    "This makes the port an access port instead of a trunk. One main VLAN, no trunk negotiation drama.",
    "Access mode selected. This port is now intended for an end device, not another switch."
  ],

  "switchport access vlan": [
    "This assigns the access port to a specific VLAN. Without this, the port may sit in the wrong neighborhood.",
    "Access VLAN set. Now untagged traffic from this device belongs to that VLAN.",
    "That command tells the switch which data VLAN this port should use. Very important. Very easy to miss."
  ],

  "switchport voice vlan": [
    "Voice VLAN set. Cisco phones can use this tagged VLAN while the attached workstation still uses the access VLAN.",
    "This is how one physical port can support both a phone and a PC. One cable, two logical homes. Slightly magical, mostly standards-based.",
    "Voice VLAN tells the phone where voice traffic belongs. The workstation still uses the access VLAN. Try not to cross the streams."
  ],

  description: [
    "Descriptions do not affect traffic, but they do affect whether future technicians curse your name.",
    "Excellent. A port description is documentation stapled directly to the interface.",
    "Interface descriptions are free. Use them. Future-you is already grateful."
  ],

  "no shutdown": [
    "No shutdown enables the interface. Yes, Cisco expresses enablement as the absence of shutdown. Very normal. Very Cisco.",
    "The port has been administratively enabled. The double negative is not a bug; it is tradition.",
    "No shutdown means the interface is allowed to operate. Whether it behaves is a separate matter."
  ],

  exit: [
    "You stepped back one configuration level. A rare example of retreat being productive.",
    "Exit moves you out of the current mode. Networking is mostly knowing where you are in the prompt.",
    "Mode changed. The prompt is your compass. Please stop ignoring the compass."
  ],

  end: [
    "End returns you directly to privileged EXEC mode. Efficient escape from configuration mode.",
    "You jumped back to the # prompt. Configuration mode has released you. For now.",
    "End is the emergency exit from configuration mode. Stylish."
  ],

  help: [
    "Help displays available commands. Asking for help is not weakness. It is uptime preservation.",
    "Command list displayed. Documentation: the original AI assistant, but less judgmental."
  ]
};
