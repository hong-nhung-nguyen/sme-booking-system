import { useCallback, useEffect, useState } from "react";
import {
    getConversationMessages,
    markConversationRead,
    sendConversationMessag,
    sendConversationMessage
} from "../api/message.api";
import { classifyMessageError } from "../lib/messageError";

export function useConversationMessages(conversationId) {
    const [messages, setMessages] = useState([]);

    const [pagination, setPagination] = useState({
        hasMore: false,
        nextCursor: null
    });

    const [isLoading, setIsLoading] = useState(false);

    const [isLoadingOlder, setIsLoadingOlder] = useState(false);

    const [isSending, setIsSending] = useState(false);

    const [error, setError] = useState(null);

    const loadInitial = useCallback(async () => {
        if (!conversationId) {
            setMessages([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await getConversationMessage(conversationId, { limit: 30 });

            setMessages(data.messages ?? []);

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
    }, [conversationId]);

    const loadOlder = useCallback(async () => {
        if (
            !conversationId ||
            isLoadingOlder ||
            !pagination.hasMore ||
            !pagination.nextCursor
        ) {
            return;
        }

        setIsLoadingOlder(true);
        setError(null);

        try {
            const data = await getConversationMessages(conversationId, {
                limit: 30,
                before: pagination.nextCursor
            });

            setMessages(
                (previousMessages) => [
                    ...(data.messages ?? []),
                    ...previousMessages
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
            setIsLoadingOlder(false);
        }
    }, [
        conversationId,
        isLoadingOlder,
        pagination
    ]);

    const sendMessage = useCallback(async (body) => {
        const trimmedBody = body.trim();

        if (!conversationId || !trimmedBody) return null;

        setIsSending(true);
        setError(null);

        try {
            const data = await sendConversationMessage(conversationId, trimmedBody);

            upsertMessage(data.message);

            return data.message;
        } catch (requestError) {
            setError(classifyMessageError(requestError));
            throw requestError;
        } finally {
            setIsSending(false);
        }
    }, [conversationId]);

    const markRead = useCallback(async () => {
        if (!conversationId) return;

        await markConversationRead(conversationId);
    }, [conversationId]);

    const upsertMessage = useCallback((incomingMessage) => {
        if (!incomingMessage._id) return;

        const incomingId = String(incomingMessage._id);

        setMessage((previousMessages) => {
            const exist = previousMessages.some(
                (message) => message._id === incomingId
            );

            if (!exist) {
                return [
                    ...previousMessages,
                    incomingMessage
                ]
            }

            return previousMessages.map(
                (message) => String(message._id) === incomingId 
                    ? {
                        ...message,
                        ...incomingMessage
                    }
                    : message
            );
        });
    }, []);

    const updateMessageStatus = useCallback(
        (
            messageId,
            processingStatus,
            extra = {}
        ) => {
            setMessages((previousMessages) => 
                previousMessages.map((message) => 
                    String(message._id) === messageId  
                        ? {
                            ...message,
                            processingStatus,
                            extra
                        }
                        : message
                )
            );
        },
        []
    );

    // Run loadInitial when the component first renders
    // and run it again if the loadInitial function changes 
    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    /**
     * Keep the internal implementation hidden while giving the component
     * only what it needs
     * 
     * e.g __
     * const { retry } = useMessages();
     * retry();
     */
    return {
        messages,
        isLoading,
        isLoadingOlder,
        isSending,
        error,
        hasMore: pagination.hasMore,
        loadOlder,
        sendMessage,
        markRead,
        retry: loadInitial,
        upsertMessage,
        updateMessageStatus
    };
}