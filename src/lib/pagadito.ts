/**
 * Pagadito Payment Gateway Integration
 */

const PAGADITO_BASE_URL = 'https://connect.pagadito.com/api/v2';
const UID = process.env.PAGADITO_UID;
const WSK = process.env.PAGADITO_WSK;
const EXCHANGE_RATE = parseFloat(process.env.PAGADITO_EXCHANGE_RATE || '24.7');

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
  let amountUSD = 0;
  
  const formattedDetails: PagaditoDetail[] = details.map(d => {
    // Convert HNL to USD and round to 2 decimals
    const priceUSD = parseFloat((d.priceInHNL / EXCHANGE_RATE).toFixed(2));
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

  const data: ExecTransResponse = await response.json();

  if (data.code !== 'PG1001') {
    throw new Error(`Error de Pagadito: ${data.message} (Código: ${data.code})`);
  }

  return data.value; // Redirect URL
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

  const data: GetStatusResponse = await response.json();

  if (data.code !== 'PG1001') {
    throw new Error(`Error al verificar estado en Pagadito: ${data.message} (Código: ${data.code})`);
  }

  return data.value;
}
