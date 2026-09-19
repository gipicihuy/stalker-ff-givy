import { createHoneypotHandler } from '../../lib/security/honeypot';

// Endpoint umpan - nggak pernah dipanggil oleh app ini sendiri. Namanya
// sengaja masuk akal ("bulk lookup") buat mancing scraper yang nebak path.
export default createHoneypotHandler('honeypot_bulk');
