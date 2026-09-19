import { createHoneypotHandler } from '../../lib/security/honeypot';

// Endpoint umpan kedua - "export" adalah nama yang sering ditebak scraper
// yang nyari cara narik data masal. Nggak pernah dipanggil app ini sendiri.
export default createHoneypotHandler('honeypot_export');
