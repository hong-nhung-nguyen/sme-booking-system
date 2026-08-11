import { useCallback, useEffect, useState } from "react";
import { getConversations } from "../api/message.api";
import { classifyMessageError } from "../lib/messageError";

export function useConversations({ status } = {}) {
    const [conversations, setConversations] = useState([]);

    const [pagination, setPagination] = useState({
        hasMore: false,
        nextCursor: null
    });

    const [isLoading, setIsLoading] = useState(true);

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [error, setError] = useState(null);

    const loadInitial = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getConversations({
                status,
                limit: 20
            });

            setConversations(
                data.conversations ?? []
            );

            setPagination(
                data.pagination ?? {
                    hasMore: false,
                    nextCursor: null
                }
            );
        } catch (requestError) {
            setError(classifyMessageError(requestError));
        } finally {
            setIsLoading(false);
        }
    }, [status]);

    const loadMore = useCallback(async () => {
        if (
            isLoadingMore ||
            !pagination.hasMore ||
            !pagination.nextCursor
        ) {
            return;
        }

        setIsLoadingMore(true);
        setError(null);

        try {
            const data = await getConversations({
                status,
                limit: 20,
                cursor: pagination.nextCursor
            });

            setConversations(
                (previousConversations) => [
                    ...previousConversations,
                    ...(data.conversations ?? [])
                ]
            );

            setPagination(
                data.pagination ?? {
                    hasMore: false,
                    nextCursor: null
                }
            );
        } catch (requestError) {
            setError(classifyMessageError(requestError));
        } finally {
            setIsLoadingMore(false);
        }
    }, [
        status,
        isLoadingMore,
        pagination
    ]);

    const upsertConversation = useCallback((incomingConversation) => {
        setConversations(
            (previousConversations) => {
                const incomingId = String(incomingConversation._id);

                const exists = previousConversations.some(
                    (conversation) => String(conversation._id) === incomingId
                );

                if (!exists) {
                    return [
                        incomingConversation,
                        ...previousConversations
                    ]
                }

                return previousConversations.map(
                    (conversation) => String(conversation._id) === incomingId 
                        ? {
                            ...conversation,
                            ...incomingConversation
                        }
                        : conversation
                )
            }
        );
    }, []);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    return {
        conversations,
        isLoading,
        isLoadingMore,
        error,
        hasMore: pagination.hasMore,
        loadMore,
        retry: loadInitial,
        upsertConversation
    }
}

