import { socket } from "../../../shared/api/socket.js";
import { useEffect, useMemo, useState } from 'react';
import { SOCKET_EVENTS } from "../../../shared/api/socketEvents.js";
import './MessageInbox.css';
import { useConversations } from "../hooks/useConversations.js";
import { useConversationMessages } from "../hooks/useConversationMessages.js";

function getClientName(conversation) {
  const client = conversation?.clientId;

  if (client && typeof client === "object") {
    return [
      client.firstName,
      client.lastName
    ]
      .filter(Boolean)
      .join(" ") || "Customer";
  }

  return "Customer";
}

function getInitials(name) {
  return name 
    .split(/\s+/)
    .filter(Boolean)
    .slice(0,2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function formatTimestamp(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

export default function MessageInbox() {
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState("");
  const [showDraft, setShowDraft] = useState(false);

  const {
    conversations,
    isLoading: isLoadingConversations,
    isLoadingMore,
    error: conversationError,
    hasMore: hasMoreConversations,
    loadMore: loadMoreConversations,
    retry: retryConversations,
    upsertConversation
  } = useConversations();

  const {
    messages,
    isLoading: isLoadingMessages,
    isLoadingOlder,
    isSending,
    error: messageError,
    hasMore: hasOlderMessages,
    loadOlder,
    sendMessage,
    markRead,
    retry: retryMessages,
    upsertMessage,
    updateMessageStatus,
  } = useConversationMessages(selectedId);

  async function handleSubmit(event) {
    event.preventDefault();

    const body = reply.trim();

    if (!body || isSending) return;

    try {
      await sendMessage(body);
      setReply("");
    } catch {
      // The hook exposes the error.
      // Keep the text so the user can retry.
    }
  }

  // Select the first server conversation
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(String(conversations[0]._id));
    }
  }, [conversations, selectedId]);


  // Implement frontend event handlers
  /**
   * subscribe when mounted
   * unsubscribe when unmounted
   */
  useEffect(() => {
    const handleMessageCreated = ({ message, conversation }) => {
      if (conversation) {
        upsertConversation(conversation);
      }

      if (message && String(message.conversationId) === String(selectedId)) {
        upsertMessage(message);
      }
    };

    const handleProcessing = ({ messageId, processingStatus }) => {
      updateMessageStatus(messageId, processingStatus);
    }

    const handleIntentReady = ({ message }) => {
      if (message && String(message.conversationId) === String(selectedId)) {
        upsertMessage(message);
      }
    };

    const handleProcessingFailed = ({ messageId, processingStatus, processingError }) => {
      updateMessageStatus(
        messageId,
        processingStatus,
        { processingError }
      );
    };

    socket.on(
      SOCKET_EVENTS.MESSAGE_CREATED,
      handleMessageCreated
    );
    socket.on(
      SOCKET_EVENTS.MESSAGE_PROCESSING,
      handleProcessing
    );
    socket.on(
      SOCKET_EVENTS.MESSAGE_INTENT_READY,
      handleIntentReady
    );
    socket.on(
      SOCKET_EVENTS.MESSAGE_PROCESSING_FAILED,
      handleProcessingFailed
    );

    // Because autoConnect is set to false
    socket.connect();

    // In a useEffect, the returned function is the cleanup function 
    // runs when MessageInbox unmounts.
    return () => {
      socket.off(
        SOCKET_EVENTS.MESSAGE_CREATED,
        handleMessageCreated
      );
      socket.off(
        SOCKET_EVENTS.MESSAGE_PROCESSING,
        handleProcessing
      );
      socket.off(
        SOCKET_EVENTS.MESSAGE_INTENT_READY,
        handleIntentReady
      );
      socket.off(
        SOCKET_EVENTS.MESSAGE_PROCESSING_FAILED,
        handleProcessingFailed
      );
    };
  }, [
    selectedId,
    upsertConversation,
    upsertMessage,
    updateMessageStatus
  ]);

  /**
   * DEPENDENCY RULE __
   * If a value or function from outside the `useEffect` is used inside the effect,
   * it should normally be included in the dependency array
   */

  // Join the selected conversation room
  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const joinConversation = () => {
      socket.emit(
        SOCKET_EVENTS.CONVERSATION_JOIN,
        {
          conversationId: selectedId
        },
        (response) => {
          if (!response?.success) {
            console.error("Could not join conversation");
          }
        }
      )
    };

    if (socket.connected) {
      joinConversation();
    } else {
      socket.once("connect", joinConversation);
    }

    return () => {
      socket.off("connect", joinConversation);

      if (socket.connected) {
        socket.emit(
          SOCKET_EVENTS.CONVERSATION_LEAVE,
          {
            conversationId: selectedId
          }
        );
      }
    };
  }, [selectedId]);

  // Mark selected conversations as read
  useEffect(() => {
    if (!selectedId) return;

    markRead().catch(() => {
      // might be error 
    });
  }, [selectedId, markRead])

  const selectedConversation = useMemo(() => 
      conversations.find(
        (conversation) => String(conversation._id) === String(selectedId)
      ) ?? null
    ,[conversations, selectedId],
  );

  function sendAiDraft() {
    sendMessage(
      `Hi ${selectedConversation.name.split(' ')[0]}, I can check the terrace availability for tonight at 7:30 PM. We currently have one large table open near the main entrance. Would you like me to move you there?`,
    );
    setShowDraft(false);
  }

  if (isLoadingConversations) {
    return (
      <main
        className="message-page-state"
        aria-busy="true"
      >
        <p>Loading conversations</p>
      </main>
    );
  }

  if (conversationError) {
    return (
      <main
        className="message-page-state"
        role="alert"
      >
        <h1>
          {conversationError.type === "unauthorized"
            ? "Access unavailable"
            : "Messages could not be loaded"
          }
        </h1>

        <p>{conversationError.message}</p>

        {conversationError.type !== "unauthorized" && (
          <button 
            type="button"
            onClick={retryConversations}
          >
            Try again
          </button>
        )}

      </main>
    );
  }

  if (conversations.length === 0) {
    return (
      <main className="message-page-state">
        <h1>No conversations yet</h1>
        <p>
          New customer messages will appear here.
        </p>
      </main>
    )
  }

  if (!selectedConversation) {
    return (
      <main
        className="message-page-state"
        aria-busy="true"
      >
        <p>Opening conversation...</p>
      </main>
    )
  }

  const selectedCustomerName = getClientName(selectedConversation);
  const selectedCustomerInitials = getInitials(selectedCustomerName);

  const latestIntentMessage = [...messages]
    .reverse()
    .find((message) => message.parsedIntent);
  
  const parsedIntent = latestIntentMessage?.parsedIntent ?? null;

  return (
    <main className="message-page">

      <section className="conversation-list-panel">
        <header className="message-topbar">
          <label className="conversation-search">
            <span aria-hidden="true">⌕</span>
            <input placeholder="Search conversations..." aria-label="Search conversations" />
          </label>
        </header>

        <div className="conversation-tabs" role="tablist" aria-label="Conversation filters">
          <button className="selected" type="button" role="tab">All</button>
          <button type="button" role="tab">Unread</button>
          <button type="button" role="tab">Pending</button>
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => {
            const conversationId = String(conversation._id);

            const customerName = getClientName(conversation);

            return (
              <button
                key={conversationId}
                type="button"
                className={`conversation-row ${
                  String(selectedId) === String(conversationId)
                    ? "selected"
                    : ""
                }`}
                onClick = {() => {
                  setSelectedId(conversationId);
                  setShowDraft(false);
                }}
              >
                <div className="conversation-row-header">
                  <strong>{customerName}</strong>

                  <time>
                    {formatTimestamp(conversation.lastMessageAt)}
                  </time>
                </div>

                <p>{conversation.lastMessagePreview || "No message yet"}</p>

                <div className="conversation-tags">
                  <span className="conversation-tag inquiry">{conversation.status}</span>

                  {conversation.unreadCount > 0 && (
                    <span className="conversation-tag urgent">
                      {conversation.unreadCount} unread
                    </span>
                  )}
                </div>
              </button>
            )
          })}

          {hasMoreConversations && (
            <button
              type="button"
              className="load-more-button"
              onClick={loadMoreConversations}
              disabled={isLoadingMore}
            >
              {isLoadingMore 
                ? "Loading..."
                : "Load more"
              }
            </button>
          )}
        </div>
      </section>

      <section 
        className="message-thread-panel" 
        aria-label={`Conversation with ${selectedCustomerName}`}
      >
        <header className="thread-header">
          <span className="customer-avatar">{selectedCustomerInitials}</span>

          <div className="thread-customer">
            <strong>{selectedCustomerName}</strong>
            <span>{selectedConversation.channel ?? "web"}</span>
          </div>

          <button className="outline-button" type="button">View History</button>
          <button className="more-button" type="button" aria-label="More conversation options">
            ⋮
          </button>
        </header>

        <div
          className="thread-content"
          aria-busy={isLoadingMessages}
        >
          {hasOlderMessages && (
            <button
              type="button"
              onClick={loadOlder}
              disable={isLoadingOlder}
            >
              {isLoadingOlder
                ? "Loading older messages..."
                : "Load earlier messages"
              }
            </button>
          )}

          {isLoadingMessages ? (
            <p>Loading messages...</p>
          ) : messageError ? (
            <div>
              <p>{messageError.messages}</p>
              <button
                type="button"
                onClick={retryMessages}
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <p>No messages in this conversation.</p>
          ) : (
            messages.map((message) => (
              <article
                className={`chat-bubble ${message.direction === "outbound" ? "outgoind" : "incoming"}`}
                key={message._id}
              >
                <p>{message.body}</p>

                <time dateTime={message.createdAt}>
                  {formatTimestamp(message.createdAt)}
                </time>
              </article>
            ))
          )}
        </div>

        <form
          className="message-composer"
          onSubmit={handleSubmit}
        >
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Type your response..."
            aria-label="Message response"
          />

          <div className="composer-actions">
            <button className="ai-assist-button" type="button" onClick={() => setShowDraft(true)}>
              AI assist enabled
            </button>
            <button 
              className="send-message-button" 
              type="submit"
              disabled={isSending || !reply.trim()}
            >
              {isSending ? "Sending" : "Send message"}
            </button>
          </div>

        </form>
      </section>

      <aside className="ai-context-panel">
        <header className="ai-context-header">
          <strong>AI Context</strong>
        </header>

        <div className="ai-context-content">
          {selectedConversation.appointmentId ? (
            <div className="booking-summary">
              <span>Linked appointment</span>
              <strong>
                {typeof selectedConversation.appointmentId === "object"
                  ? selectedConversation.appointmentId._id 
                  : selectedConversation.appointmentId
                }
              </strong>
            </div>
          ) : (
            <div className="no-booking-context">
              <strong>No linked booking</strong>
              <p>This conversation is not linked to an active booking</p>
            </div>
          )}
        </div>

        <div className="ai-interpretation-result">
          <h2>Interpretation Result</h2>
          <div className="interpretation-list">
            <div><span>Action</span><strong>{parsedIntent?.action}</strong></div>
            <div><span>Service</span><strong>{parsedIntent?.service}</strong></div>
            <div><span>Requested date</span><strong>{parsedIntent?.preferredDate}</strong></div>
            <div><span>Requested time</span><strong>{parsedIntent?.preferredTime}</strong></div>

          </div>
        </div>

        <footer className="context-footer">
          <button type="button">Open full booking card</button>
        </footer>
      </aside>
    </main>
  );
}
