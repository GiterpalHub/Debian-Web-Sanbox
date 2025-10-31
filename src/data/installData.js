export const fakeSystemInstallLogs = [
  "Running debootstrap...",
  "Retrieving Release",
  "Retrieving InRelease",
  "Retrieving Packages (1/5)...",
  "Validating Packages...",
  "Installing base-files...",
  "Installing coreutils...",
  "Installing systemd...",
  "Installing libc6...",
  "Installing apt...",
  "Installing dpkg...",
  "Installing login...",
  "Installing mount...",
  "Installing util-linux...",
  "Configuring network...",
  "Setting up timezone data...",
  "Generating locales (en_US.UTF-8)...",
  "Locales generated.",
  "Base system installation complete."
];

export const fakeGrubInstallLogs = [
  "Installing grub-pc package...",
  "Running grub-install /dev/sda",
  "Installing for i386-pc platform.",
  "Installation finished. No error reported.",
  "Generating grub configuration file ...",
  "Found linux image: /boot/vmlinuz-6.1.0-20-amd64",
  "Found initrd image: /boot/initrd.img-6.1.0-20-amd64",
  "Warning: os-prober will not beP run to detect other bootable partitions.",
  "done"
];

export const fakeFinalConfigLogs = [
  "Setting up base-files...",
  "Configuring apt...",
  "Processing triggers for libc-bin...",
  "Unpacking libssl3:amd64...",
  "Setting up libcrypt1:amd64...",
  "Preparing to unpack login_4.13+... ",
  "Unpacking login (4.13+dfsg1-1)...",
  "Setting up login (4.13+dfsg1-1)...",
  "Finding optimal mirror...",
  "Connecting to deb.debian.org...",
  "Downloading packages (1/158)...",
  "Configuring tasksel...",
  "Finishing up the installation...",
  "Cleaning up temporary files...",
  "done",
];

export const bootLines = [
  "Loading, please wait...",
  "[  0.218540] pci 0000:00:07.0: D-state_change event received",
  "[  0.220133] pci 0000:00:03.0: D-state_change event received",
  "[  1.332410] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null)",
  "Starting systemd-udevd...",
  "Started Journal Service.",
  "Finished Create Volatile Files and Directories.",
  "Starting Network Name Resolution...",
  "Reached target Network.",
  "Thanks for attending this workshop by HIMA TRPL",
  "Welcome to Debian GNU/Linux 12 (bookworm)!",
  "Debian GNU/Linux 12 debian tty1"
];

export const installSteps = [
  {
    title: "Debian Installer",
    text: "Select a language.",
    type: "options",
    options: ["English", "French", "German", "Spanish"],
    default: "English",
    error: "Selected language isn't available. Please select 'English'."
  },
  {
    title: "Debian Installer",
    text: "Select your location.",
    type: "options",
    options: ["United States", "United Kingdom", "Canada", "Other"],
    default: "United States",
    error: "Selected location isn't available."
  },
  {
    title: "Debian Installer",
    text: "Configure the keyboard.",
    type: "options",
    options: ["American English", "British English", "Canadian French"],
    default: "American English",
    error: "Selected keyboard layout isn't available."
  },
  {
    title: "Configuring Network",
    text: "Please enter the hostname for this system.",
    type: "input",
    prompt: "Hostname:",
    key: "hostname",
    default: "debian"
  },
  {
    title: "Set up users",
    text: "Please enter the new user's full name.",
    type: "input",
    prompt: "Full name:",
    key: "fullname",
    default: "User"
  },
  {
    title: "Set up users",
    text: "Please enter the username for the account.",
    type: "input",
    prompt: "Username:",
    key: "username",
    default: "user"
  },
  {
    title: "[!!] Partition disks",
    text: "This is an overview of your currently configured partitions...",
    type: "partitionMenu"
  },
  {
    title: "Installing System",
    text: "Installing the base system... (this is simulated)",
    type: "installing",
    logKey: "system"
  },
  {
    title: "Installing GRUB",
    text: "Installing GRUB boot loader... (this is simulated)",
    type: "installing",
    logKey: "grub"
  },
  {
    title: "Running Installation...",
    text: "This may take a moment. Running final configurations...",
    type: "installing",
    logKey: "finalConfig"
  },
  {
    title: "Installation Complete",
    text: "Installation is complete. Press 'Continue' to reboot.",
    type: "info"
  }
];
