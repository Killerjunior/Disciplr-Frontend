import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WalletProvider, useWallet } from '../WalletContext';
import { USDC_ISSUERS } from '../../utils/horizon';

const freighterMocks = vi.hoisted(() => ({
    isAllowed: vi.fn(),
    setAllowed: vi.fn(),
    requestAccess: vi.fn(),
    getAddress: vi.fn(),
    getNetworkDetails: vi.fn(),
}));

vi.mock('@stellar/freighter-api', () => freighterMocks);

function mockResponse(status: number, body: unknown) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: vi.fn().mockResolvedValue(body),
    } as unknown as Response;
}

function WalletProbe() {
    const wallet = useWallet();

    return (
        <div>
            <button type="button" onClick={wallet.connect}>
                Connect
            </button>
            <button type="button" onClick={wallet.disconnect}>
                Disconnect
            </button>
            <div data-testid="address">{wallet.address ?? ''}</div>
            <div data-testid="network">{wallet.network ?? ''}</div>
            <div data-testid="balance">{wallet.balance ?? ''}</div>
            <div data-testid="balanceStatus">{wallet.balanceStatus}</div>
            <div data-testid="balanceError">{wallet.balanceError ?? ''}</div>
            <div data-testid="connectionError">{wallet.error ?? ''}</div>
        </div>
    );
}

function UnsafeProbe() {
    useWallet();
    return null;
}

function renderWallet() {
    return render(
        <WalletProvider>
            <WalletProbe />
        </WalletProvider>,
    );
}

describe('WalletContext Horizon USDC balance path', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        vi.resetAllMocks();
        freighterMocks.isAllowed.mockResolvedValue(false);
        freighterMocks.setAllowed.mockResolvedValue(undefined);
        freighterMocks.requestAccess.mockResolvedValue(true);
        freighterMocks.getAddress.mockResolvedValue({ address: 'GCONNECTED', error: null });
        freighterMocks.getNetworkDetails.mockResolvedValue({ network: 'TESTNET' });
        globalThis.fetch = vi.fn();
    });

    afterAll(() => {
        globalThis.fetch = originalFetch;
    });

    test('loads the real USDC balance after connecting', async () => {
        let resolveFetch: (value: Response) => void = () => undefined;
        vi.mocked(globalThis.fetch).mockReturnValue(
            new Promise<Response>((resolve) => {
                resolveFetch = resolve;
            }),
        );

        renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() => expect(screen.getByTestId('balanceStatus')).toHaveTextContent('loading'));

        resolveFetch(
            mockResponse(200, {
                balances: [
                    {
                        asset_type: 'credit_alphanum4',
                        asset_code: 'USDC',
                        asset_issuer: USDC_ISSUERS.TESTNET,
                        balance: '42.2500000',
                    },
                ],
            }),
        );

        await waitFor(() => expect(screen.getByTestId('balanceStatus')).toHaveTextContent('success'));
        expect(screen.getByTestId('address')).toHaveTextContent('GCONNECTED');
        expect(screen.getByTestId('network')).toHaveTextContent('TESTNET');
        expect(screen.getByTestId('balance')).toHaveTextContent('42.2500000');
        expect(globalThis.fetch).toHaveBeenCalledWith('https://horizon-testnet.stellar.org/accounts/GCONNECTED');
    });

    test('marks no-trustline when a connected public account has no Circle USDC balance line', async () => {
        freighterMocks.isAllowed.mockResolvedValue(true);
        freighterMocks.getNetworkDetails.mockResolvedValue({ network: 'PUBLIC' });
        vi.mocked(globalThis.fetch).mockResolvedValue(
            mockResponse(200, {
                balances: [{ asset_type: 'native', balance: '10.0000000' }],
            }),
        );

        renderWallet();

        await waitFor(() => expect(screen.getByTestId('balanceStatus')).toHaveTextContent('no_trustline'));
        expect(screen.getByTestId('network')).toHaveTextContent('PUBLIC');
        expect(screen.getByTestId('balance')).toHaveTextContent('0.00');
    });

    test('surfaces Horizon errors without keeping a stale balance', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(500, {}));

        renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() => expect(screen.getByTestId('balanceStatus')).toHaveTextContent('error'));
        expect(screen.getByTestId('balance')).toHaveTextContent('');
        expect(screen.getByTestId('balanceError')).toHaveTextContent('Horizon balance request failed with status 500.');

        error.mockRestore();
    });

    test('uses the generic balance error when network details throw a non-Error value', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        freighterMocks.getNetworkDetails.mockRejectedValue('offline');

        renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() => expect(screen.getByTestId('balanceStatus')).toHaveTextContent('error'));
        expect(screen.getByTestId('balanceError')).toHaveTextContent('Unable to load USDC balance.');

        error.mockRestore();
    });

    test('surfaces wallet access denial and address errors', async () => {
        freighterMocks.requestAccess.mockResolvedValueOnce(false);

        const { rerender } = renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() => expect(screen.getByTestId('connectionError')).toHaveTextContent('Wallet access denied.'));

        freighterMocks.requestAccess.mockResolvedValueOnce(true);
        freighterMocks.getAddress.mockResolvedValueOnce({ address: null, error: 'Address unavailable.' });

        rerender(
            <WalletProvider>
                <WalletProbe />
            </WalletProvider>,
        );
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() => expect(screen.getByTestId('connectionError')).toHaveTextContent('Address unavailable.'));
    });

    test('uses the fallback address error when Freighter returns no address message', async () => {
        freighterMocks.getAddress.mockResolvedValueOnce({ address: null, error: null });

        renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() =>
            expect(screen.getByTestId('connectionError')).toHaveTextContent('Failed to get wallet address.'),
        );
    });

    test('logs automatic connection-check errors without crashing the provider', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        freighterMocks.isAllowed.mockRejectedValue(new Error('Freighter unavailable.'));

        renderWallet();

        await waitFor(() => expect(error).toHaveBeenCalledWith('Check connection error', expect.any(Error)));
        expect(screen.getByTestId('balanceStatus')).toHaveTextContent('idle');

        error.mockRestore();
    });

    test('uses the generic connection error when Freighter throws a non-Error value', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        freighterMocks.setAllowed.mockRejectedValue('locked');

        renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() =>
            expect(screen.getByTestId('connectionError')).toHaveTextContent(
                'Failed to connect wallet. Make sure Freighter is installed and unlocked.',
            ),
        );

        error.mockRestore();
    });

    test('surfaces Freighter Error messages during connect', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        freighterMocks.setAllowed.mockRejectedValue(new Error('Freighter is locked.'));

        renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() => expect(screen.getByTestId('connectionError')).toHaveTextContent('Freighter is locked.'));

        error.mockRestore();
    });

    test('disconnect resets the loaded balance state', async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue(
            mockResponse(200, {
                balances: [
                    {
                        asset_type: 'credit_alphanum4',
                        asset_code: 'USDC',
                        asset_issuer: USDC_ISSUERS.TESTNET,
                        balance: '9.0000000',
                    },
                ],
            }),
        );

        renderWallet();
        fireEvent.click(screen.getByRole('button', { name: /^connect$/i }));

        await waitFor(() => expect(screen.getByTestId('balanceStatus')).toHaveTextContent('success'));

        fireEvent.click(screen.getByRole('button', { name: /disconnect/i }));

        expect(screen.getByTestId('address')).toHaveTextContent('');
        expect(screen.getByTestId('network')).toHaveTextContent('');
        expect(screen.getByTestId('balance')).toHaveTextContent('');
        expect(screen.getByTestId('balanceStatus')).toHaveTextContent('idle');
    });

    test('throws when useWallet is rendered outside the provider', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        expect(() => render(<UnsafeProbe />)).toThrow('useWallet must be used within a WalletProvider');

        error.mockRestore();
    });
});

describe('WalletContext mount-time auto-restore (checkConnection)', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        vi.resetAllMocks();
        freighterMocks.isAllowed.mockResolvedValue(false);
        freighterMocks.getAddress.mockResolvedValue({ address: null, error: null });
        freighterMocks.getNetworkDetails.mockResolvedValue({ network: 'TESTNET' });
        globalThis.fetch = vi.fn();
    });

    afterAll(() => {
        globalThis.fetch = originalFetch;
    });

    test('restores address and balance when isAllowed returns true', async () => {
        freighterMocks.isAllowed.mockResolvedValue(true);
        freighterMocks.getAddress.mockResolvedValue({ address: 'GAUTO123', error: null });
        vi.mocked(globalThis.fetch).mockResolvedValue(
            mockResponse(200, {
                balances: [
                    {
                        asset_type: 'credit_alphanum4',
                        asset_code: 'USDC',
                        asset_issuer: USDC_ISSUERS.TESTNET,
                        balance: '55.0000000',
                    },
                ],
            }),
        );

        renderWallet();

        await waitFor(() => expect(screen.getByTestId('address')).toHaveTextContent('GAUTO123'));
        expect(screen.getByTestId('balance')).toHaveTextContent('55.0000000');
        expect(screen.getByTestId('balanceStatus')).toHaveTextContent('success');
    });

    test('stays disconnected when isAllowed returns false', async () => {
        renderWallet();

        // Let the mount effect settle
        await waitFor(() => expect(freighterMocks.isAllowed).toHaveBeenCalledTimes(1));
        expect(screen.getByTestId('address')).toHaveTextContent('');
        expect(screen.getByTestId('balanceStatus')).toHaveTextContent('idle');
    });

    test('does not set address when getAddress returns an error', async () => {
        freighterMocks.isAllowed.mockResolvedValue(true);
        freighterMocks.getAddress.mockResolvedValue({ address: null, error: 'Key unavailable.' });

        renderWallet();

        await waitFor(() => expect(freighterMocks.getAddress).toHaveBeenCalledTimes(1));
        expect(screen.getByTestId('address')).toHaveTextContent('');
        expect(screen.getByTestId('balanceStatus')).toHaveTextContent('idle');
    });

    test('swallows a thrown error from checkConnection and logs it', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        freighterMocks.isAllowed.mockRejectedValue(new Error('Freighter crashed.'));

        renderWallet();

        await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith('Check connection error', expect.any(Error)),
        );
        expect(screen.getByTestId('address')).toHaveTextContent('');
        expect(screen.getByTestId('balanceStatus')).toHaveTextContent('idle');

        consoleSpy.mockRestore();
    });
});
