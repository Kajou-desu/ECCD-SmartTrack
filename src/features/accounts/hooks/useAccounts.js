import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { apiClient } from "@api/client.js";

import {
    groupAccounts,
    getAccountId,
    createAccountPayload,
    updateAccountPayload,
} from "../utils/accountUtils.js";

// apiClient.js intentionally reduces every failed response to a generic
// "Something went wrong." (so raw server/internal errors never reach the
// user), but keeps the real parsed response body on `err.details`. Account
// management needs the actual validation message (e.g. "Email already in
// use"), so pull it from there when the backend provided one.
function getErrorMessage(err, fallback) {
    return err?.details?.message || err?.details?.error || fallback;
}

export default function useAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mutating, setMutating] = useState(false);
    const [error, setError] = useState("");

    const isMountedRef = useRef(true);
    const fetchIdRef = useRef(0);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchAccounts = useCallback(async ({ silent = false } = {}) => {
        const fetchId = ++fetchIdRef.current;

        try {
            const data = await apiClient.getAccounts();

            if (
                !isMountedRef.current ||
                fetchId !== fetchIdRef.current
            ) {
                return;
            }

            setAccounts(Array.isArray(data) ? data : []);
            setError("");
        } catch (err) {
            if (
                !isMountedRef.current ||
                fetchId !== fetchIdRef.current
            ) {
                return;
            }

            setError(getErrorMessage(err, "Failed to fetch account directory."));
        } finally {
            if (
                isMountedRef.current &&
                fetchId === fetchIdRef.current &&
                !silent
            ) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const startFetch = async () => {
            await Promise.resolve();
            await fetchAccounts();
        };

        void startFetch();
    }, [fetchAccounts]);

    const createAccount = useCallback(
        async (formData) => {
            setMutating(true);
            setError("");

            try {
                await apiClient.createAccount(createAccountPayload(formData));

                await fetchAccounts({ silent: true });
            } catch (err) {
                if (isMountedRef.current) {
                    setError(getErrorMessage(err, "Failed to create account."));
                }

                throw err;
            } finally {
                if (isMountedRef.current) {
                    setMutating(false);
                }
            }
        },
        [fetchAccounts],
    );

    const updateAccount = useCallback(
        async (formData) => {
            setMutating(true);
            setError("");

            try {
                await apiClient.updateAccount(updateAccountPayload(formData));

                await fetchAccounts({ silent: true });
            } catch (err) {
                if (isMountedRef.current) {
                    setError(getErrorMessage(err, "Failed to update account."));
                }

                throw err;
            } finally {
                if (isMountedRef.current) {
                    setMutating(false);
                }
            }
        },
        [fetchAccounts],
    );

    const deleteAccount = useCallback(async (accountId) => {
        setMutating(true);
        setError("");

        try {
            await apiClient.deleteAccount(accountId);

            if (isMountedRef.current) {
                setAccounts((current) =>
                    current.filter(
                        (account) => getAccountId(account) !== accountId,
                    ),
                );
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(getErrorMessage(err, "Failed to delete account."));
            }

            throw err;
        } finally {
            if (isMountedRef.current) {
                setMutating(false);
            }
        }
    }, []);

    const groupedAccounts = useMemo(
        () => groupAccounts(accounts),
        [accounts],
    );

    return {
        accounts,
        groupedAccounts,
        loading,
        mutating,
        error,
        retry: fetchAccounts,
        createAccount,
        updateAccount,
        deleteAccount,
    };
}