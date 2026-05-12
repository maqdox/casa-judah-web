/**
 * Pagadito Payment Gateway Integration
 */

const PAGADITO_BASE_URL = 'https://connect.pagadito.com/api/v2';
const UID = process.env.PAGADITO_UID;
const WSK = process.env.PAGADITO_WSK;
const FALLBACK_RATE = parseFloat(process.env.PAGADITO_EXCHANGE_RATE || '26.5');

// Cache the exchange rate for 12 hours to avoid unnecessary API calls
let cachedRate: { value: number; fetchedAt: number } | null = null;
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

async function getExchangeRate(): Promise<number> {
  // Return cached rate if still fresh
  if (cachedRate && (Date.now() - cachedRate.fetchedAt) < CACHE_DURATION_MS) {
    return cachedRate.value;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { 
      next: { revalidate: 43200 } // 12h cache for Next.js
    });
    const data = await res.json();
    
    if (data.result === 'success' && data.rates?.HNL) {
      cachedRate = { value: data.rates.HNL, fetchedAt: Date.now() };
      console.log(`[Pagadito] Tasa de cambio actualizada: 1 USD = L ${data.rates.HNL}`);
      return data.rates.HNL;
    }
  } catch (err) {
    console.warn('[Pagadito] No se pudo obtener la tasa de cambio en tiempo real, usando fallback:', FALLBACK_RATE);
  }

  return FALLBACK_RATE;
}

// Helper for Basic Auth
const getAuthHeaders = () => {
  if (!UID || !WSK) throw new Error('Faltan credenciales de Pagadito en las variables de entorno.');
  const token = Buffer.from(`${UID}:${WSK}`).toString('base64');
  return {
    'Authorization': `Basic ${token}`,
    'Content-Type': 'application/json'
  };
};

export interface PagaditoDetail {
  quantity: number;
  description: string;
  price: number; // In USD
  url_product: string;
}

export interface ExecTransResponse {
  code: string;
  message: string;
  value: string; // The URL to redirect to
}

export interface GetStatusResponse {
  code: string;
  message: string;
  value: {
    status: string; // "COMPLETED", "REGISTERED", etc.
    reference: string; // The ERN we sent
    date_trans: string;
    amount: string;
  };
}

/**
 * Executes a transaction request to Pagadito and returns the payment URL.
 */
export async function execTrans(ern: string, details: { quantity: number, description: string, priceInHNL: number }[]): Promise<string> {
  const exchangeRate = await getExchangeRate();
  let amountUSD = 0;
  
  const formattedDetails: PagaditoDetail[] = details.map(d => {
    // Convert HNL to USD and round to 2 decimals
    const priceUSD = parseFloat((d.priceInHNL / exchangeRate).toFixed(2));
    amountUSD += priceUSD * d.quantity;
    
    return {
      quantity: d.quantity,
      description: d.description,
      price: priceUSD,
      url_product: 'https://www.casajudahfarmhotel.com'
    };
  });

  // Ensure total amount matches sum of details
  amountUSD = parseFloat(amountUSD.toFixed(2));

  const response = await fetch(`${PAGADITO_BASE_URL}/exec-trans`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ern: ern,
      amount: amountUSD,
      details: formattedDetails
    })
  });

  const data = await response.json();

  if (data.code !== 'PG1002' && data.code !== 'PG1001') {
    throw new Error(`Error de Pagadito: ${data.message} (Código: ${data.code})`);
  }

  // PG1002 returns the URL inside data.data.url
  return data.data?.url || data.value;
}

/**
 * Checks the status of a transaction token after user returns.
 */
export async function getStatus(token: string): Promise<GetStatusResponse['value']> {
  const response = await fetch(`${PAGADITO_BASE_URL}/get-status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ token })
  });

  const data = await response.json();

  if (data.code !== 'PG1001' && data.code !== 'PG1002') {
    throw new Error(`Error al verificar estado en Pagadito: ${data.message} (Código: ${data.code})`);
  }

  return data.data || data.value;
}
