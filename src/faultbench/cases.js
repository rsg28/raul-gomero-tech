/** Simulated service-bay faults. Teaching commentary, not exploits. */

export const TOOLS = [
  { id: 'eventlog', label: 'Eventos', cost: 8, hint: 'Visor de eventos' },
  { id: 'devmgmt', label: 'Dispositivos', cost: 5, hint: 'Administrador de dispositivos' },
  { id: 'smart', label: 'SMART', cost: 12, hint: 'Salud del disco' },
  { id: 'sensors', label: 'Sondas', cost: 6, hint: 'Temps, clocks, fans' },
  { id: 'net', label: 'Red', cost: 7, hint: 'ipconfig / ping / nslookup' },
  { id: 'memtest', label: 'Memtest', cost: 28, hint: 'Pasa 1, ~25 min' },
  { id: 'power', label: 'Energía', cost: 10, hint: 'Rails + Kernel-Power' },
  { id: 'time', label: 'Reloj', cost: 3, hint: 'Fecha, w32time' },
  { id: 'audio', label: 'Audio', cost: 4, hint: 'Dispositivo por defecto' },
  { id: 'bios', label: 'POST / BIOS', cost: 6, hint: 'Beep, boot order' },
];

export const GLOBAL_FIXES = [
  {
    id: 'reinstall_windows',
    label: 'Reinstalar Windows',
    cost: 180,
    blurb: 'Formatear C: y rehacer el perfil. Tres horas, mínimo.',
  },
  {
    id: 'chkdsk',
    label: 'chkdsk /f /r',
    cost: 45,
    blurb: 'Barrido de sistema de archivos. No sustituye un disco que ya está muriendo.',
  },
  {
    id: 'buy_ram',
    label: 'Comprar 32 GB más de RAM',
    cost: 55,
    blurb: 'Más capacidad no cura un DIMM que ya escribe mal.',
  },
];

const HEALTHY_EVENTS = [
  { t: '08:14:02', src: 'Service Control Manager', id: 7036, level: 'info', msg: 'The Print Spooler service entered the running state.' },
  { t: '08:14:11', src: 'Kernel-Power', id: 42, level: 'info', msg: 'The system is entering sleep. Sleep Reason: Application API.' },
  { t: '09:02:44', src: 'Winlogon', id: 7001, level: 'info', msg: 'User logon notification.' },
  { t: '10:21:08', src: 'Windows Update', id: 19, level: 'info', msg: 'Installation Successful: Windows updated KB504393.' },
];

const HEALTHY_DEVICES = [
  { bus: 'Display adapters', name: 'NVIDIA GeForce RTX 5060 Ti', status: 'ok' },
  { bus: 'Network adapters', name: 'Intel(R) Wi-Fi 7 BE200', status: 'ok' },
  { bus: 'Network adapters', name: 'Realtek PCIe 2.5GbE Family Controller', status: 'ok' },
  { bus: 'Disk drives', name: 'WD_BLACK SN850X 2000GB', status: 'ok' },
  { bus: 'Sound, video and game controllers', name: 'Realtek High Definition Audio', status: 'ok' },
  { bus: 'System devices', name: 'High Definition Audio Controller', status: 'ok' },
  { bus: 'Memory technology driver', name: 'Intel RST NVMe Controller', status: 'ok' },
];

const HEALTHY_SMART = [
  { id: 5, name: 'Reallocated_Sector_Ct', value: 100, worst: 100, raw: 0, thresh: 10, fail: false },
  { id: 9, name: 'Power_On_Hours', value: 98, worst: 98, raw: 1840, thresh: 0, fail: false },
  { id: 184, name: 'End-to-End_Error', value: 100, worst: 100, raw: 0, thresh: 99, fail: false },
  { id: 187, name: 'Reported_Uncorrect', value: 100, worst: 100, raw: 0, thresh: 0, fail: false },
  { id: 197, name: 'Current_Pending_Sector', value: 100, worst: 100, raw: 0, thresh: 0, fail: false },
  { id: 198, name: 'Offline_Uncorrectable', value: 100, worst: 100, raw: 0, thresh: 0, fail: false },
  { id: 194, name: 'Temperature_Celsius', value: 68, worst: 42, raw: 32, thresh: 0, fail: false },
  { id: 199, name: 'UDMA_CRC_Error_Count', value: 200, worst: 200, raw: 0, thresh: 0, fail: false },
];

export const HEALTHY = {
  eventlog: HEALTHY_EVENTS,
  devmgmt: HEALTHY_DEVICES,
  smart: HEALTHY_SMART,
  sensors: { cpu: 47, gpu: 41, cpuClock: 4200, gpuClock: 2550, cpuFan: 820, gpuFan: 900, hotspot: 52, load: false },
  net: {
    media: 'Ethernet',
    link: true,
    dhcp: true,
    ip: '192.168.1.47',
    mask: '255.255.255.0',
    gw: '192.168.1.1',
    dns: ['192.168.1.1', ''],
    mac: 'A8-5E-45-9C-21-07',
    hosts: {
      '127.0.0.1': { ok: true, ms: 0 },
      'localhost': { ok: true, ms: 0 },
      '192.168.1.1': { ok: true, ms: 1 },
      '8.8.8.8': { ok: true, ms: 14 },
      '1.1.1.1': { ok: true, ms: 11 },
      'google.com': { ok: true, ms: 18, resolve: '142.250.217.14' },
      'gmail.com': { ok: true, ms: 21, resolve: '142.251.41.5' },
      'banco.example': { ok: true, ms: 24, resolve: '203.0.113.40' },
    },
  },
  memtest: { errors: 0, slot: null, note: 'Pass 1/1  0 errors. 32 GB OK (A1+A2).' },
  power: {
    event41: false,
    rails: { '12V': 12.08, '5V': 5.02, '3.3V': 3.31 },
    loadRails: { '12V': 11.94, '5V': 4.98, '3.3V': 3.28 },
    eps: 'seated',
    pcie8: 'seated',
    note: 'Rails estables en idle y en carga. EPS 8-pin y PCIe 8-pin clickeados.',
  },
  time: { ok: true, service: 'running', drift: 0 },
  audio: {
    devices: [
      { name: 'Speakers (Realtek High Definition Audio)', def: true, enabled: true },
      { name: 'NVIDIA Output (HDMI)', def: false, enabled: true },
    ],
    exclusive: false,
  },
  bios: {
    post: '00',
    beep: '1 corto',
    boot: ['Windows Boot Manager (WD_BLACK SN850X)', 'USB Key', 'Network PXE'],
    message: 'POST OK. Arranque en 11 s.',
  },
};

export const CASES = [
  {
    id: 'dns-dead',
    bay: 'Mesa 2',
    machine: 'ThinkPad E14 Gen 5',
    customer: 'Marta · contabilidad',
    difficulty: 1,
    tags: ['red', 'dns'],
    ticket:
      'Desde esta mañana no entra a nada. Ni Gmail, ni el banco, ni “ni google”. El icono de red sale con acceso. Dice que ayer funcionaba. Ya reinició dos veces. “Arregle el internet”.',
    rootFix: 'set_dns_public',
    rootTheory: 'dns',
    theories: [
      { id: 'dns', label: 'El DNS no resuelve nombres' },
      { id: 'cable', label: 'Cable o link caído' },
      { id: 'nic', label: 'Driver de la NIC' },
      { id: 'isp', label: 'El ISP está caído' },
      { id: 'malware', label: 'Malware / proxy' },
    ],
    fixes: [
      { id: 'set_dns_public', label: 'Poner DNS 1.1.1.1 / 8.8.8.8 en el adaptador', cost: 6 },
      { id: 'replace_cable', label: 'Cambiar el cable Ethernet', cost: 8 },
      { id: 'reinstall_nic', label: 'Desinstalar y reescanear la NIC', cost: 18 },
      { id: 'reset_winsock', label: 'netsh winsock reset + reboot', cost: 14 },
    ],
    tools: {
      eventlog: [
        { t: '08:44:19', src: 'DNS Client Events', id: 1014, level: 'warn', msg: 'Name resolution for google.com timed out after none of the configured DNS servers responded.' },
        { t: '08:44:31', src: 'DNS Client Events', id: 1014, level: 'warn', msg: 'Name resolution for outlook.office.com timed out.' },
        { t: '08:51:02', src: 'WinHTTP', id: 15005, level: 'warn', msg: 'PAC script download failed — fallback to direct (still needs DNS).' },
        ...HEALTHY_EVENTS,
      ],
      net: {
        media: 'Ethernet',
        link: true,
        dhcp: true,
        ip: '192.168.1.47',
        mask: '255.255.255.0',
        gw: '192.168.1.1',
        dns: ['192.168.1.1', ''],
        mac: 'A8-5E-45-9C-21-07',
        hosts: {
          '127.0.0.1': { ok: true, ms: 0 },
          '192.168.1.1': { ok: true, ms: 1 },
          '8.8.8.8': { ok: true, ms: 14 },
          '1.1.1.1': { ok: true, ms: 11 },
          'google.com': { ok: false, reason: 'nx' },
          'gmail.com': { ok: false, reason: 'nx' },
          'banco.example': { ok: false, reason: 'nx' },
        },
        nslookupNote: 'DNS request timed out. timeout was 2 seconds. Server: 192.168.1.1',
      },
      sensors: { cpu: 44, gpu: 38, cpuClock: 2300, gpuClock: 210, cpuFan: 640, gpuFan: 0, hotspot: 41, load: false },
    },
    wrong: {
      replace_cable: 'El link ya estaba up. El cable nuevo no cambia un DNS muerto en el router.',
      reinstall_nic: 'La NIC está bien. Sigue sin resolver google.com. Perdiste 18 minutos.',
      reset_winsock: 'Winsock no era el problema. ipconfig sigue con DNS 192.168.1.1 y ese servidor no contesta.',
      reinstall_windows: 'Tres horas. El router sigue sin DNS. Marta sigue sin Gmail.',
      chkdsk: 'El disco está sano. El síntoma es de nombres, no de sectores.',
      buy_ram: 'No es memoria. ping 8.8.8.8 ya demuestra capa 3.',
    },
    debrief: {
      cause: 'El router entrega DHCP bien, pero su DNS interno no responde. IP y gateway viven; los nombres no.',
      herring: 'El icono de red “con acceso” miente: Windows marca acceso si hay gateway, no si hay DNS.',
      method: 'Identificaste el síntoma (“no entra a nada”). Probaste: loopback, gateway, IP pública, luego un nombre. Ese orden es el mapa OSI, no un quiz.',
    },
  },
  {
    id: 'nvme-dying',
    bay: 'Mesa 1',
    machine: 'ARMOURY tower · cliente interno',
    customer: 'Diego · diseño',
    difficulty: 2,
    tags: ['almacenamiento', 'smart'],
    ticket:
      'Se congela al guardar PSD grandes. Ayer no arrancó hasta el tercer intento. “Huele a quemado” — no huele a nada. Copia de fotos de la boda de su hermana está en D:… que es el mismo disco. Quiere que “lo formatees y ya”.',
    rootFix: 'replace_nvme',
    rootTheory: 'disk_dying',
    theories: [
      { id: 'disk_dying', label: 'El NVMe está fallando (SMART)' },
      { id: 'overheat', label: 'Ahogo térmico' },
      { id: 'ram', label: 'RAM defectuosa' },
      { id: 'os_corrupt', label: 'Windows corrupto' },
      { id: 'psu', label: 'La fuente se cae' },
    ],
    fixes: [
      { id: 'replace_nvme', label: 'Backup YA + sustituir NVMe + restaurar', cost: 70 },
      { id: 'clone_only', label: 'Clonar encima del mismo disco “para ahorrar”', cost: 40 },
      { id: 'disable_write_cache', label: 'Desactivar caché de escritura', cost: 8 },
    ],
    tools: {
      eventlog: [
        { t: '19:41:08', src: 'disk', id: 153, level: 'error', msg: 'The IO operation at logical block address 0x4e21c00 for Disk 0 was retried.' },
        { t: '19:41:09', src: 'disk', id: 153, level: 'error', msg: 'The IO operation at logical block address 0x4e21c80 for Disk 0 was retried.' },
        { t: '19:44:12', src: 'ntfs', id: 55, level: 'error', msg: 'The file system structure on the disk is corrupt and unusable. A chkdsk may be required.' },
        { t: '07:12:03', src: 'Kernel-PnP', id: 219, level: 'warn', msg: 'Failed to start StorNVMe after delay during boot.' },
        { t: '07:12:44', src: 'disk', id: 157, level: 'warn', msg: 'Disk 0 has been surprise removed.' },
        ...HEALTHY_EVENTS,
      ],
      smart: [
        { id: 5, name: 'Reallocated_Sector_Ct', value: 62, worst: 62, raw: 184, thresh: 10, fail: true },
        { id: 9, name: 'Power_On_Hours', value: 94, worst: 94, raw: 6120, thresh: 0, fail: false },
        { id: 187, name: 'Reported_Uncorrect', value: 1, worst: 1, raw: 47, thresh: 0, fail: true },
        { id: 197, name: 'Current_Pending_Sector', value: 44, worst: 44, raw: 12, thresh: 0, fail: true },
        { id: 198, name: 'Offline_Uncorrectable', value: 48, worst: 48, raw: 9, thresh: 0, fail: true },
        { id: 194, name: 'Temperature_Celsius', value: 65, worst: 40, raw: 41, thresh: 0, fail: false },
        { id: 199, name: 'UDMA_CRC_Error_Count', value: 200, worst: 200, raw: 0, thresh: 0, fail: false },
      ],
      sensors: { cpu: 51, gpu: 44, cpuClock: 4100, gpuClock: 2400, cpuFan: 900, gpuFan: 880, hotspot: 56, load: false },
    },
    wrong: {
      chkdsk: 'chkdsk marca 9 clusters y “termina”. Al guardar el siguiente PSD, disk 153 vuelve. El silicio está muerto; el filesystem es el síntoma.',
      clone_only: 'Clonaste un disco que ya reubica sectores encima de sí mismo. El clon nace enfermo.',
      disable_write_cache: 'Menos caché, mismos 184 reallocates. Solo hiciste los cuelgues más evidentes.',
      reinstall_windows: 'Windows nuevo sobre NAND podrida. El StorNVMe sigue surprise-removing Disk 0.',
      buy_ram: 'Memtest no se ha quejado. Los Event ID 153 son del disco.',
    },
    debrief: {
      cause: 'NVMe con reallocates, pending y uncorrectables. Temperatura normal: no es calor, es el NAND.',
      herring: 'ntfs 55 invita a chkdsk. chkdsk arregla el mapa, no el plato — aquí ni plato hay, hay celdas que ya no sostienen carga.',
      method: 'Síntoma (cuelgues al escribir) → eventos disk/ntfs → SMART. Sustituir es el implement. Backup es el plan, no un extra.',
    },
  },
  {
    id: 'thermal-paste',
    bay: 'Mesa 4',
    machine: 'Custom ITX · 5800X',
    customer: 'Leo · streamer',
    difficulty: 2,
    tags: ['térmico', 'cpu'],
    ticket:
      'A los diez minutos de Warzone “se pone a 40 fps y el audio se corta”. En el escritorio va fino. Abrió el lateral y el cooler gira. “Debe ser Windows 11”. Lleva la pasta de 2021 y un filtro que parece una manta.',
    rootFix: 'repaste_clean',
    rootTheory: 'thermal',
    theories: [
      { id: 'thermal', label: 'CPU se ahoga (pasta / flujo de aire)' },
      { id: 'gpu_driver', label: 'Driver de GPU' },
      { id: 'ram', label: 'RAM inestable en XMP' },
      { id: 'os', label: 'Windows 11' },
      { id: 'net', label: 'Packet loss del Wi-Fi' },
    ],
    fixes: [
      { id: 'repaste_clean', label: 'Limpiar filtros + rehacer pasta + apriete del cooler', cost: 35 },
      { id: 'undervolt_only', label: 'Solo undervolt en BIOS, sin abrir', cost: 12 },
      { id: 'reinstall_gpu_driver', label: 'DDU + driver de GPU', cost: 22 },
      { id: 'disable_xmp', label: 'Bajar RAM a JEDEC', cost: 8 },
    ],
    tools: {
      eventlog: [
        { t: '22:18:41', src: 'Microsoft-Windows-WHEA-Logger', id: 18, level: 'warn', msg: 'A corrected hardware error occurred. Source: Processor Core. Type: Internal Timer. Status: Thermal event.' },
        { t: '22:18:55', src: 'Kernel-Processor-Power', id: 37, level: 'info', msg: 'Processor 0 parked / P-state dropped to 0.79 GHz (thermal).' },
        { t: '22:19:02', src: 'nvlddmkm', id: 14, level: 'warn', msg: 'A single TDR recovered. GPU temp 71 C — not the limiter.' },
        ...HEALTHY_EVENTS,
      ],
      sensors: { cpu: 97, gpu: 71, cpuClock: 790, gpuClock: 2280, cpuFan: 2400, gpuFan: 1600, hotspot: 101, load: true },
      smart: HEALTHY_SMART,
    },
    wrong: {
      undervolt_only: 'Bajó 8 °C y sigue tocando 92 en raid boss. El cooler está montado sobre pasta seca. El undervolt es un parche, no el arreglo.',
      reinstall_gpu_driver: 'Un TDR aislado. El WHEA es del CPU. La GPU está a 71 °C, el 5800X a 97.',
      disable_xmp: 'Memtest está limpio. El clock del CPU se cae a 790 MHz: eso es thermal throttle, no RAM.',
      reinstall_windows: 'Windows 11 no cuece un CCD. La pasta de 2021 sí.',
      chkdsk: 'SMART verde. El cuello está en el IHS, no en el NVMe.',
      buy_ram: 'No falta capacidad. Falta contacto térmico.',
    },
    debrief: {
      cause: 'Pasta seca + filtro tapado. El cooler gira (por eso Leo no “ve” el fallo) y aun así el IHS no entrega calor. 97 °C → 790 MHz.',
      herring: 'Un TDR de GPU. Fácil irse al driver. Las sondas y el WHEA del procesador cuentan otra historia.',
      method: 'El síntoma es temporal (minutos de carga). Eso pide sondas bajo load, no un format.',
    },
  },
  {
    id: 'bad-dimm',
    bay: 'Mesa 3',
    machine: 'Dell OptiPlex 7010',
    customer: 'HR · planta 2',
    difficulty: 2,
    tags: ['memoria', 'bsod'],
    ticket:
      'Chrome se cierra solo. Excel “deja de funcionar”. Ayer BSOD MEMORY_MANAGEMENT. IT de la planta ya “actualizó Windows”. Sigue igual. Hay dos sticks, no saben de qué lado.',
    rootFix: 'replace_dimm_a2',
    rootTheory: 'dimm',
    theories: [
      { id: 'dimm', label: 'Un módulo de RAM está malo' },
      { id: 'disk_dying', label: 'Disco' },
      { id: 'os_corrupt', label: 'Perfil de Windows' },
      { id: 'gpu_driver', label: 'Driver de vídeo' },
      { id: 'overheat', label: 'Temperatura' },
    ],
    fixes: [
      { id: 'replace_dimm_a2', label: 'Aislar y sustituir DIMM A2', cost: 25 },
      { id: 'reseat_both', label: 'Reseat de ambos sticks y listo', cost: 10 },
      { id: 'sfc', label: 'sfc /scannow + DISM', cost: 30 },
    ],
    tools: {
      eventlog: [
        { t: '11:02:18', src: 'Microsoft-Windows-WER-SystemErrorReporting', id: 1001, level: 'error', msg: 'The computer has rebooted from a bugcheck. The bugcheck was: 0x0000001A (MEMORY_MANAGEMENT).' },
        { t: '11:07:44', src: 'Application Error', id: 1000, level: 'error', msg: 'Faulting application chrome.exe, faulting module ntdll.dll, exception code 0xc0000005.' },
        { t: '11:12:01', src: 'WHEA-Logger', id: 19, level: 'error', msg: 'A fatal hardware error has occurred. Reported by component: Memory Hierarchy. Physical Address: 0x000000024A3C0000.' },
        ...HEALTHY_EVENTS,
      ],
      memtest: { errors: 1422, slot: 'A2', note: 'Pass 1 halted. 1422 errors starting 2.41 GB. Pattern: stick in slot A2. A1 se prueba solo: 0 errors.' },
      sensors: { cpu: 46, gpu: 39, cpuClock: 3600, gpuClock: 400, cpuFan: 780, gpuFan: 0, hotspot: 49, load: false },
    },
    wrong: {
      reseat_both: 'Reseat: el contacto estaba bien. Memtest sigue pintando A2. Hay que aislar, no “mover un poco”.',
      sfc: 'ntdll 0xc0000005 aquí es el síntoma de RAM, no de un DLL faltante. sfc sale limpio y Chrome se vuelve a caer.',
      reinstall_windows: 'El bugcheck 0x1A sobrevive a una ISO nueva. Es el silicio del stick.',
      chkdsk: 'SMART en verde. WHEA dice Memory Hierarchy.',
      buy_ram: 'Comprar más sin sacar el malo es mezclar un stick podrido con dos buenos. Sigue el 0x1A.',
    },
    debrief: {
      cause: 'DIMM A2 lanza errores a 2.41 GB. A1 está limpio. El BSOD 0x1A y el 0xc0000005 de chrome son la misma herida.',
      herring: 'IT “actualizó Windows”. El software se siente culpable cuando ntdll aparece en el log. Memtest decide.',
      method: 'Síntoma (apps + MEMORY_MANAGEMENT) → WHEA memoria → memtest por slot. Aislar es el test de la teoría.',
    },
  },
  {
    id: 'gpu-driver',
    bay: 'Mesa 5',
    machine: 'Vanguard I-358',
    customer: 'Raul · lab',
    difficulty: 2,
    tags: ['gpu', 'driver'],
    ticket:
      'Pantalla negra un segundo en Marvel Rivals y en un encode de Premiere. El Event Viewer se llena. Temps “normales”. Ayer Windows Update metió un driver de Microsoft Basic Display y luego “el de NVIDIA”. Código 43 al volver del negro.',
    rootFix: 'ddu_clean_driver',
    rootTheory: 'gpu_driver',
    theories: [
      { id: 'gpu_driver', label: 'Driver de GPU corrupto / mixto' },
      { id: 'thermal', label: 'GPU se ahoga' },
      { id: 'psu', label: 'La fuente no aguanta' },
      { id: 'cable', label: 'Cable DisplayPort' },
      { id: 'ram', label: 'RAM' },
    ],
    fixes: [
      { id: 'ddu_clean_driver', label: 'DDU en modo seguro + driver del fabricante', cost: 28 },
      { id: 'rma_gpu', label: 'RMA de la 5060 Ti', cost: 90 },
      { id: 'swap_dp', label: 'Cambiar el DisplayPort', cost: 6 },
      { id: 'reseat_gpu', label: 'Reseat de la GPU y del 8-pin', cost: 15 },
    ],
    tools: {
      eventlog: [
        { t: '21:03:11', src: 'nvlddmkm', id: 14, level: 'error', msg: 'The description for Event ID 14 from source nvlddmkm cannot be found. (TDR)' },
        { t: '21:03:11', src: 'Display', id: 4101, level: 'error', msg: 'Display driver nvlddmkm stopped responding and has successfully recovered.' },
        { t: '21:03:18', src: 'Kernel-PnP', id: 219, level: 'warn', msg: 'NVIDIA GeForce RTX 5060 Ti failed to start. Device status 0xC0000490 (Code 43).' },
        { t: '18:44:00', src: 'Windows Update', id: 19, level: 'info', msg: 'Installed NVIDIA Display Adapter from Windows Update (DCH, 32.0.15.6094) over OEM 32.0.15.8088.' },
        ...HEALTHY_EVENTS,
      ],
      devmgmt: [
        { bus: 'Display adapters', name: 'NVIDIA GeForce RTX 5060 Ti', status: 'warn', code: '43' },
        { bus: 'Display adapters', name: 'Microsoft Basic Display Adapter', status: 'ok' },
        { bus: 'Network adapters', name: 'Intel(R) Wi-Fi 7 BE200', status: 'ok' },
        { bus: 'Network adapters', name: 'Realtek PCIe 2.5GbE Family Controller', status: 'ok' },
        { bus: 'Disk drives', name: 'WD_BLACK SN850X 2000GB', status: 'ok' },
        { bus: 'Sound, video and game controllers', name: 'Realtek High Definition Audio', status: 'ok' },
      ],
      sensors: { cpu: 54, gpu: 68, cpuClock: 4300, gpuClock: 0, cpuFan: 1100, gpuFan: 0, hotspot: 70, load: false },
      power: {
        event41: false,
        rails: { '12V': 12.06, '5V': 5.01, '3.3V': 3.30 },
        loadRails: { '12V': 11.91, '5V': 4.97, '3.3V': 3.27 },
        eps: 'seated',
        pcie8: 'seated',
        note: 'Rails firmes. El 8-pin está clickeado. No hay Kernel-Power 41.',
      },
    },
    wrong: {
      rma_gpu: 'La GPU pasa un artifact test en otro driver. RMA es caro y lento cuando Device Manager grita Code 43 después de un DCH de Windows Update.',
      swap_dp: 'El TDR también pasa en Premiere a un archivo, no solo al monitor. El cable no explica el 0xC0000490.',
      reseat_gpu: 'Reseat limpio. Sigue el 43. El hardware estaba sentado; el stack de drivers no.',
      reinstall_windows: 'Funciona, y también funciona DDU en 28 minutos. No quemes el perfil por un driver.',
      buy_ram: 'No hay WHEA de memoria. Hay nvlddmkm 14.',
    },
    debrief: {
      cause: 'Windows Update pisó el driver OEM con un DCH viejo. Quedó un stack mixto y Code 43.',
      herring: 'Temps “un poco altas” y la tentación del RMA. 68 °C no es un thermal throttle; clock 0 MHz con fan 0 es un dispositivo que ni arrancó.',
      method: 'Síntoma TDR → evento nvlddmkm + PnP 43 → historial de Windows Update. DDU es el implement, no “a ver si se va”.',
    },
  },
  {
    id: 'kernel-power',
    bay: 'Mesa 6',
    machine: 'Rig 2022 · 850 W no-name',
    customer: 'Sam · ranked',
    difficulty: 3,
    tags: ['energía', 'gpu'],
    ticket:
      'Se apaga solo en partidas. No hay BSOD. “Ni siquiera minidump”. Al encender, Windows dice que no se apagó correctamente. Idle está perfecto. Movió el tower y “un cable se sintió flojo”, pero no recuerda cuál.',
    rootFix: 'reseat_pcie8',
    rootTheory: 'gpu_power',
    theories: [
      { id: 'gpu_power', label: 'PCIe 8-pin de la GPU flojo / PSU débil bajo carga' },
      { id: 'overheat', label: 'Térmico' },
      { id: 'os_corrupt', label: 'Windows' },
      { id: 'ram', label: 'RAM' },
      { id: 'disk_dying', label: 'Disco' },
    ],
    fixes: [
      { id: 'reseat_pcie8', label: 'Reseat del 8-pin PCIe hasta el click + brida', cost: 12 },
      { id: 'replace_psu', label: 'Cambiar la fuente de 850 W no-name', cost: 50 },
      { id: 'disable_cstates', label: 'Desactivar C-states en BIOS', cost: 8 },
    ],
    tools: {
      eventlog: [
        { t: '20:16:02', src: 'Kernel-Power', id: 41, level: 'error', msg: 'The system has rebooted without cleanly shutting down first. BugcheckCode: 0. PowerButtonTimestamp: 0. SleepInProgress: 0.' },
        { t: '20:16:02', src: 'Kernel-Power', id: 109, level: 'info', msg: 'The kernel power manager has initiated a shutdown transition. (previous record missing — hard cut)' },
        { t: '19:44:00', src: 'Kernel-Processor-Power', id: 37, level: 'info', msg: 'Normal P-states. No thermal park in the last session.' },
        ...HEALTHY_EVENTS,
      ],
      sensors: { cpu: 62, gpu: 74, cpuClock: 4450, gpuClock: 2610, cpuFan: 1400, gpuFan: 1700, hotspot: 82, load: true },
      power: {
        event41: true,
        rails: { '12V': 12.04, '5V': 5.00, '3.3V': 3.29 },
        loadRails: { '12V': 10.38, '5V': 4.91, '3.3V': 3.22 },
        eps: 'seated',
        pcie8: 'loose',
        note: 'Idle OK. En carga el 12V se cae a 10.38 V. El conector PCIe 8-pin de la GPU no está asentado del todo (pin 3/4 intermitente). EPS de CPU firme.',
      },
      smart: HEALTHY_SMART,
    },
    wrong: {
      replace_psu: 'Podría ser la fuente, sí. En banco, esa 850 W sostiene 12.1 V. El 8-pin no estaba clickeado. Devolver una fuente buena es teatro caro.',
      disable_cstates: 'No es un idle hang. Se muere en ranked, bajo carga. C-states no explican el 12V a 10.38.',
      reinstall_windows: 'BugcheckCode 0 + PowerButtonTimestamp 0 es corte de energía, no un ntoskrnl malito.',
      chkdsk: 'SMART limpio. El corte es previo al filesystem.',
      buy_ram: 'Sin 0x1A. Sin WHEA de memoria. Hay un rail que se cae.',
    },
    debrief: {
      cause: 'El 8-pin de la GPU no estaba clickeado. En idle el rail aguanta; en load el 12V se va a 10.38 y el board se corta. Kernel-Power 41 con BugcheckCode 0.',
      herring: 'La PSU no-name es un sospechoso justo. Siempre mide antes de comprar. El cliente incluso dijo “un cable flojo”.',
      method: 'Síntoma (hard power-off, sin dump) → Event 41 → sondas en carga → conector. Reseat es el test más barato de la teoría.',
    },
  },
  {
    id: 'apipa-dhcp',
    bay: 'Mesa 2',
    machine: 'HP EliteDesk 800',
    customer: 'Recepción',
    difficulty: 1,
    tags: ['red', 'dhcp'],
    ticket:
      'No hay red. “Ni el router”. El cable está puesto. El switch del armario parpadea. Wi-Fi del teléfono funciona. Un compañero de IT le puso “IP fija un día para una feria” hace meses.',
    rootFix: 'dhcp_auto',
    rootTheory: 'static',
    theories: [
      { id: 'static', label: 'IP estática vieja / DHCP Client parado' },
      { id: 'cable', label: 'Cable cortado' },
      { id: 'dns', label: 'DNS' },
      { id: 'switch', label: 'El switch está malo' },
      { id: 'nic', label: 'NIC quemada' },
    ],
    fixes: [
      { id: 'dhcp_auto', label: 'Volver a DHCP automático + arrancar DHCP Client + /renew', cost: 8 },
      { id: 'replace_cable', label: 'Cambiar el patch cord', cost: 8 },
      { id: 'replace_nic', label: 'Sustituir la NIC', cost: 40 },
      { id: 'set_dns_public', label: 'Poner 8.8.8.8 a mano', cost: 5 },
    ],
    tools: {
      eventlog: [
        { t: '09:01:12', src: 'Dhcp-Client', id: 1001, level: 'warn', msg: 'Your computer was assigned an address from the network, but the DHCP service is not running. Using Automatic Private IP (169.254.x.x) because a static config is incomplete.' },
        { t: '09:01:14', src: 'Tcpip', id: 4199, level: 'warn', msg: 'The system detected an IP address conflict OR no gateway on this interface.' },
        { t: '08:55:00', src: 'Service Control Manager', id: 7036, level: 'info', msg: 'The DHCP Client service entered the stopped state.' },
        ...HEALTHY_EVENTS,
      ],
      net: {
        media: 'Ethernet',
        link: true,
        dhcp: false,
        ip: '169.254.22.10',
        mask: '255.255.0.0',
        gw: '',
        dns: ['', ''],
        mac: 'B4-2E-99-10-AA-02',
        staticLeftover: '192.168.0.50 / 255.255.255.0 (feria, otra red)',
        hosts: {
          '127.0.0.1': { ok: true, ms: 0 },
          '192.168.1.1': { ok: false, reason: 'dest' },
          '8.8.8.8': { ok: false, reason: 'dest' },
          'google.com': { ok: false, reason: 'nx' },
        },
      },
      bios: {
        post: '00',
        beep: '1 corto',
        boot: ['Windows Boot Manager', 'USB Key'],
        message: 'POST OK. Link LED del NIC: on. Activity: none (no DHCP).',
      },
    },
    wrong: {
      replace_cable: 'El LED de link está on y el switch parpadea. Capa 1 está viva. 169.254 no se arregla con otro patch cord.',
      replace_nic: 'La NIC negocia link. El servicio DHCP Client está stopped y hay una estática de otra feria.',
      set_dns_public: 'Sin gateway no hay DNS que valga. Primero una IP real.',
      reinstall_windows: 'Es un checkbox de IPv4. No es un OS.',
      chkdsk: 'No es disco.',
      buy_ram: 'No es RAM.',
    },
    debrief: {
      cause: 'DHCP Client parado + restos de una IP estática de otra red. Windows se fue a APIPA (169.254). Link físico OK.',
      herring: '“Ni el router” suena a cable. El teléfono en Wi-Fi y el LED de link te ahorran el tester si miras.',
      method: 'ipconfig /all antes de cambiar cobre. 169.254 es un diagnóstico, no una IP.',
    },
  },
  {
    id: 'clock-ssl',
    bay: 'Mesa 1',
    machine: 'Latitude 5440',
    customer: 'Nuria · legal',
    difficulty: 1,
    tags: ['tiempo', 'certificados'],
    ticket:
      'Chrome dice que Gmail y el banco no son seguros. El antivirus “está al día”. Ping a 8.8.8.8 le funciona (lo hizo su sobrino). La CMOS battery del portátil tiene cinco años. La hora de la bandeja: 12 de marzo de 2019.',
    rootFix: 'fix_time',
    rootTheory: 'clock',
    theories: [
      { id: 'clock', label: 'Reloj / CMOS / w32time' },
      { id: 'cert', label: 'Certificados raíz corruptos' },
      { id: 'av', label: 'El antivirus intercepta HTTPS' },
      { id: 'dns', label: 'DNS' },
      { id: 'malware', label: 'Malware de proxy' },
    ],
    fixes: [
      { id: 'fix_time', label: 'Poner hora correcta + arrancar w32time + CMOS si deriva', cost: 10 },
      { id: 'reinstall_chrome', label: 'Reinstalar Chrome', cost: 15 },
      { id: 'disable_av', label: 'Desactivar el antivirus “a ver”', cost: 8 },
      { id: 'reset_trust', label: 'Reinstalar certificados raíz a mano', cost: 25 },
      { id: 'set_dns_public', label: 'Poner DNS 8.8.8.8', cost: 5 },
    ],
    tools: {
      time: { ok: false, service: 'stopped', drift: -2200, shown: '2019-03-12 09:14:08' },
      net: {
        ...HEALTHY.net,
        sslNote: 'TLS handshake fails: certificate is not yet valid (notBefore 2024-11-01 > system 2019-03-12).',
      },
      eventlog: [
        { t: '09:14:08', src: 'Time-Service', id: 36, level: 'warn', msg: 'The time service has not synchronized for 1922 days. The Time-Service is stopped.' },
        { t: '09:15:22', src: 'Schannel', id: 36882, level: 'error', msg: 'The received certificate has failed the time validity check.' },
        { t: '09:15:22', src: 'CAPI2', id: 11, level: 'error', msg: 'Failed extract of third-party root: not yet valid.' },
        ...HEALTHY_EVENTS,
      ],
      bios: {
        post: '00',
        beep: '1 corto',
        boot: ['Windows Boot Manager'],
        message: 'POST OK. BIOS clock: 2019-03-12. CMOS battery voltage 1.8 V (low).',
      },
    },
    wrong: {
      reinstall_chrome: 'Chrome nuevo, mismos certificados, mismo 2019. El notBefore sigue en el futuro.',
      disable_av: 'El AV no está interceptando. Schannel es del OS. Además dejaste un portátil de legal sin AV.',
      reset_trust: 'Los raíces están bien. El reloj no. Reinstalar raíces en 2019 no adelanta el calendario.',
      reinstall_windows: 'Windows 11 instalado “hoy” con BIOS en 2019 nace igual de incrédulo.',
      set_dns_public: 'google.com resuelve. El fallo es TLS, no el nombre.',
    },
    debrief: {
      cause: 'CMOS battery agotada + w32time stopped. El sistema vive en 2019. Todo certificado posterior “aún no es válido”.',
      herring: 'El mensaje de Chrome parece un problema de “seguridad / antivirus / certificados”. Es un reloj de 3 dólares.',
      method: 'Mira la bandeja. Luego el servicio. Luego la pila. El sobrino que hizo ping demostró que la red vive.',
    },
  },
];

export const byId = Object.fromEntries(CASES.map((c) => [c.id, c]));

export function allFixes(c) {
  const seen = new Set();
  const out = [];
  for (const f of [...(c.fixes || []), ...GLOBAL_FIXES]) {
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    out.push(f);
  }
  return out;
}
