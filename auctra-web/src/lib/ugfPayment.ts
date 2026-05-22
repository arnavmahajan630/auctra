import { UGFClient } from '@tychilabs/ugf-testnet-js';
import { ethers } from 'ethers';

export type UGFStage = 'login' | 'quote' | 'payment' | 'execute';

export interface GaslessExecutionResult {
  digest: string;
  userTxHash: string;
}

export const UGF_TESTNET_PAYMENT_COIN = 'TYI_MOCK_USD';

export async function executeUgfTransaction(params: {
  ugf: UGFClient;
  signer: ethers.Signer;
  payerAddress: string;
  tx: ethers.TransactionRequest;
  token?: string;
}): Promise<GaslessExecutionResult> {
  let quote;
  try {
    quote = await params.ugf.quote.get({
      payer_address: params.payerAddress,
      tx_object: JSON.stringify({
        from: params.payerAddress,
        to: params.tx.to,
        data: params.tx.data || '0x',
        value: params.tx.value?.toString() || '0',
      }),
    });
  } catch (err: unknown) {
    throw new Error(mapUgfError('quote', err));
  }

  try {
    await params.ugf.payment.x402.execute({
      quote,
      signer: params.signer,
      token: params.token || UGF_TESTNET_PAYMENT_COIN,
    });
  } catch (err: unknown) {
    throw new Error(mapUgfError('payment', err));
  }

  try {
    const { userTxHash } = await params.ugf.chains.evm.sponsorAndExecute(quote.digest, params.signer, async () => ({
      to: params.tx.to,
      data: params.tx.data || '0x',
      value: params.tx.value || BigInt(0),
    }));
    await params.signer.provider?.waitForTransaction(userTxHash, 1, 120_000);
    return { digest: quote.digest, userTxHash };
  } catch (err: unknown) {
    throw new Error(mapUgfError('execute', err));
  }
}

export function mapUgfError(stage: UGFStage, err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown UGF error';

  if (stage === 'login') {
    return `UGF login was not completed: ${message}`;
  }
  if (stage === 'quote') {
    return `UGF quote failed. The destination action may be reverting before sponsorship: ${message}`;
  }
  if (stage === 'payment') {
    return `UGF payment authorization failed. Check your Mock USD balance and try again: ${message}`;
  }
  return `UGF sponsored execution failed after payment authorization: ${message}`;
}
