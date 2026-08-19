import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { API_BASE_URL } from "@config/api.js";

import {
    groupAccounts,
    getAccountId,
    createAccountPayload,
    updateAccountPayload,
} from "../utils/accountUtils.js";

function getToken() {
    return localStorage.getItem("authToken");
}

async function request(endpoint, options = {}) {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        credentials: options.credentials ?? "include",
    });

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
        ? await response.json().catch(() => ({}))
        : {};

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}.`,
        );
    }

    return data;
}

export function useAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);   // initial/full load only
    const [mutating, setMutating] = useState(false); // create/update/delete in flight
    const [error, setError] = useState("");

    // Guards against setState after unmount and against a stale fetch
    // resolving after a newer one has already started.
    const isMountedRef = useRef(true);
    const fetchIdRef = useRef(0);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // silent=true skips toggling `loading`, used after mutations so the
    // list refreshes in the background without flashing a full loading state.
    const fetchAccounts = useCallback(async ({ silent = false } = {}) => {
        const fetchId = ++fetchIdRef.current;

        if (!silent) setLoading(true);
        setError("");

        try {
            const data = await request("/api/users/all");

            // Bail out if a newer fetch started or the component unmounted
            // while this request was in flight.
            if (!isMountedRef.current || fetchId !== fetchIdRef.current) return;

            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            if (!isMountedRef.current || fetchId !== fetchIdRef.current) return;

            setError(err.message || "Failed to fetch account directory.");
        } finally {
            if (isMountedRef.current && fetchId === fetchIdRef.current && !silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const createAccount = useCallback(
        async (formData) => {
            setMutating(true);
            setError("");

            try {
                await request("/api/users/register", {
                    method: "POST",
                    body: JSON.stringify(createAccountPayload(formData)),
                });

                await fetchAccounts({ silent: true });
            } catch (err) {
                if (isMountedRef.current) {
                    setError(err.message || "Failed to create account.");
                }
                throw err; // let the caller react (e.g. keep a form open) if it wants to
            } finally {
                if (isMountedRef.current) setMutating(false);
            }
        },
        [fetchAccounts],
    );

    const updateAccount = useCallback(
        async (formData) => {
            setMutating(true);
            setError("");

            try {
                await request("/api/profile/update", {
                    method: "PUT",
                    body: JSON.stringify(updateAccountPayload(formData)),
                });

                await fetchAccounts({ silent: true });
            } catch (err) {
                if (isMountedRef.current) {
                    setError(err.message || "Failed to update account.");
                }
                throw err;
            } finally {
                if (isMountedRef.current) setMutating(false);
            }
        },
        [fetchAccounts],
    );

    const deleteAccount = useCallback(async (accountId) => {
        setMutating(true);
        setError("");

        try {
            await request(`/api/users/delete/${accountId}`, {
                method: "DELETE",
            });

            if (isMountedRef.current) {
                setAccounts((current) =>
                    current.filter((account) => getAccountId(account) !== accountId),
                );
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err.message || "Failed to delete account.");
            }
            throw err;
        } finally {
            if (isMountedRef.current) setMutating(false);
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