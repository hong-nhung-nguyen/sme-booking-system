import { socket } from "../../../shared/api/socket.js";
import { NavLink } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import NavSider from '../../../shared/ui/NavSider/NavSider';
import { SOCKET_EVENTS } from "../../../shared/api/socketEvents.js";
import './MessageInbox.css';

const conversations = [
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    time: '2m ago',
    preview: 'Is it possible to move my table for 6 to the terrace area?',
    label: 'Booking request',
    labelType: 'booking',
    urgent: true,
    booking: {
      code: '#RES-98211',
      date: 'Tonight',
      time: '7:30 PM',
      guests: '6 people',
      area: 'Main Room',
      status: 'Confirmed',
    },
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: "Hello! I have a booking for 6 people tonight at 7:30 PM under 'Jenkins'. Is it possible to move my table to the terrace area? We'd prefer to be outside if there’s space.",
        time: '7:14 PM',
      },
      {
        id: 2,
        sender: 'staff',
        text: 'Checking that for you right now, Sarah. One moment while I verify the floor plan.',
        time: '7:15 PM',
      },
    ],
  },
  {
    id: 'david',
    name: 'David Chen',
    initials: 'DC',
    time: '15m ago',
    preview: 'Confirming our anniversary dinner for tonight...',
    label: 'Confirmation',
    labelType: 'confirmation',
    urgent: false,
    booking: {
      code: '#RES-98212',
      date: 'Tonight',
      time: '8:00 PM',
      guests: '2 people',
      area: 'Window table',
      status: 'Pending',
    },
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Hi, I would like to confirm our anniversary dinner booking for tonight.',
        time: '7:02 PM',
      },
    ],
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    initials: 'ER',
    time: '1h ago',
    preview: 'I need to cancel my reservation for Friday.',
    label: 'Cancellation',
    labelType: 'cancellation',
    urgent: false,
    booking: {
      code: '#RES-98213',
      date: 'Friday',
      time: '6:30 PM',
      guests: '4 people',
      area: 'Main Room',
      status: 'Confirmed',
    },
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'I need to cancel my reservation for Friday.',
        time: '6:10 PM',
      },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Thompson',
    initials: 'MT',
    time: '3h ago',
    preview: 'Do you have gluten-free options on the tasting menu?',
    label: 'Inquiry',
    labelType: 'inquiry',
    urgent: false,
    booking: null,
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Do you have gluten-free options on the tasting menu?',
        time: '4:20 PM',
      },
    ],
  },
];

const navItems = [
  ['Dashboard', '/schedule-calendar'],
  ['Schedule', '/schedule-calendar'],
  ['History', '#'],
  ['AI Messaging', '/messages'],
  ['Floor Plan', '#'],
  ['Service Management', '#'],
];

export default function MessageInbox() {
  const [liveMessages, setLiveMessages] = useState([]);
  const [selectedId, setSelectedId] = useState('sarah');
  const [reply, setReply] = useState('');
  const [showDraft, setShowDraft] = useState(true);
  const [sentMessages, setSentMessages] = useState([]);
  const [navigationOpen, setNavigationOpen] = useState(true);

  const upsertMessage = (incomingMessage) => {
    const incomingId = String(incomingMessage._id);

    setLiveMessages((currentMessages) => {
      const existingIndex = currentMessages.findIndex(
        (message) => String(message._id) === incomingId
      );

      // check if the incoming message is a new message
      // or already exists and needs updating 
      if (existingIndex === -1) {
        return [...currentMessages, incomingMessage];
      }

      return currentMessages.map((message, index) => 
        index === existingIndex 
          /**
           * Start with the old message, then overwrite 
           * any matching properties with the new values.
           */
          ? {
            ...message,
            ...incomingMessage
          }
          // Keep the original message 
          : messageId  
      );
    });
  };

  // Status-only events
  const updateMessageStatus = (messageId, processingStatus, extra = {}) => {
    setLiveMessages((currentMessages) => currentMessages.map(
      (message) => String(message._id) === String(messageId)
        ? {
          ...message,
          processingStatus,
          ...extra
        }
        : message
    ));
  };

  // Implement frontend event handlers
  /**
   * subscribe when mounted
   * unsubscribe when unmounted
   */
  useEffect(() => {
    const handleMessageCreated = ({ messageId, message }) => {
      if (String(messageId) !== String(message._id)) return;

      upsertMessage(message);
    };

    const handleProcessing = ({ messageId, processingStatus }) => {
      updateMessageStatus(messageId, processingStatus);
    }

    const handleIntentReady = ({ messageId, message }) => {
      if (String(messageId) !== String(message._id)) return;

      upsertMessage(message);
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
      socket.disconnect();
    };
  }, []);

  // Join the selected conversation room
  useEffect(() => {
    if (!socket.connected || !selectedId) {
      return;
    }

    socket.emit(
      SOCKET_EVENTS.CONVERSATION_JOIN,
      {
        conversationId: selectedId
      },
      (response) => {
        if (!response.success) {
          console.error("Could not join conversation");
        }
      }
    );

    return () => {
      socket.emit(
        SOCKET_EVENTS.CONVERSATION_LEAVE,
        {
          conversationId: selectedId
        }
      );
    };
  }, [selectedId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId),
    [selectedId],
  );

  const threadMessages = [
    ...selectedConversation.messages,
    ...sentMessages.filter((message) => message.conversationId === selectedId),
  ];

  function sendMessage(text = reply) {
    const trimmedText = text.trim();

    if (!trimmedText) return;

    setSentMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        conversationId: selectedId,
        sender: 'staff',
        text: trimmedText,
        time: 'Just now',
      },
    ]);

    setReply('');
  }

  function sendAiDraft() {
    sendMessage(
      `Hi ${selectedConversation.name.split(' ')[0]}, I can check the terrace availability for tonight at 7:30 PM. We currently have one large table open near the main entrance. Would you like me to move you there?`,
    );
    setShowDraft(false);
  }

  return (
    <main className={`message-page ${navigationOpen ? '' : 'navigation-closed'}`}>
      {navigationOpen ? (
        <NavSider onShowBookings={() => setNavigationOpen(false)} />
      ) : (
        <button className="reopen-navigation" type="button" onClick={() => setNavigationOpen(true)} aria-label="Open navigation">
          <span /><span /><span />
        </button>
      )}
      <aside className="message-sidebar">
        <div className="message-brand">
          <span className="brand-mark" aria-hidden="true">R</span>
          <div>
            <strong>Reserva</strong>
            <small>RESTAURANT SAAS</small>
          </div>
        </div>

        <button className="new-reservation-button" type="button">
          + New Reservation
        </button>

        <nav className="message-nav" aria-label="Main navigation">
          {navItems.map(([label, path]) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `message-nav-link ${isActive && label === 'AI Messaging' ? 'active' : ''}`
              }
            >
              <span className="nav-icon" aria-hidden="true">□</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="message-sidebar-bottom">
          <button type="button">Settings</button>
          <button type="button">Support</button>
        </div>
      </aside>

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
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className={`conversation-row ${selectedId === conversation.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedId(conversation.id);
                setShowDraft(conversation.id === 'sarah');
              }}
            >
              <div className="conversation-row-header">
                <strong>{conversation.name}</strong>
                <time>{conversation.time}</time>
              </div>

              <p>{conversation.preview}</p>

              <div className="conversation-tags">
                <span className={`conversation-tag ${conversation.labelType}`}>
                  {conversation.label}
                </span>
                {conversation.urgent && <span className="conversation-tag urgent">Urgent</span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="message-thread-panel" aria-label={`Conversation with ${selectedConversation.name}`}>
        <header className="thread-header">
          <span className="customer-avatar">{selectedConversation.initials}</span>

          <div className="thread-customer">
            <strong>{selectedConversation.name}</strong>
            <span>Platinum Member · 12 Visits</span>
          </div>

          <button className="outline-button" type="button">View History</button>
          <button className="more-button" type="button" aria-label="More conversation options">
            ⋮
          </button>
        </header>

        <div className="thread-content">
          {threadMessages.map((message) => (
            <article
              className={`chat-bubble ${message.sender === 'staff' ? 'outgoing' : 'incoming'}`}
              key={message.id}
            >
              <p>{message.text}</p>
              <time>{message.time}</time>
            </article>
          ))}

          {showDraft && selectedId === 'sarah' && (
            <section className="ai-draft" aria-label="AI assistant draft">
              <div className="ai-draft-divider">
                <span>AI assistant draft</span>
              </div>

              <div className="ai-draft-card">
                <strong>✦ Contextual draft</strong>
                <p>
                  Hi Sarah, I see your reservation. Let me check the terrace
                  availability for tonight at 7:30 PM. We currently have one
                  large table open near the main entrance. Would you like me to
                  move you there?
                </p>

                <div className="ai-draft-actions">
                  <button className="primary-small" type="button" onClick={sendAiDraft}>
                    Send draft
                  </button>
                  <button
                    className="secondary-small"
                    type="button"
                    onClick={() => setReply('Hi Sarah, I can check the terrace availability for you.')}
                  >
                    Edit reply
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        <form
          className="message-composer"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
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
            <button className="send-message-button" type="submit">
              Send message
            </button>
          </div>
        </form>
      </section>

      <aside className="ai-context-panel">
        <header className="ai-context-header">
          <strong>AI Context</strong>
        </header>

        <div className="ai-context-content">
          {selectedConversation.booking ? (
            <>
              <section>
                <h2>Active booking</h2>
                <div className="booking-summary">
                  <div className="booking-code-row">
                    <span>Reservation ID</span>
                    <em>{selectedConversation.booking.status}</em>
                  </div>

                  <strong>{selectedConversation.booking.code}</strong>

                  <dl>
                    <div>
                      <dt>Date</dt>
                      <dd>{selectedConversation.booking.date}</dd>
                    </div>
                    <div>
                      <dt>Time</dt>
                      <dd>{selectedConversation.booking.time}</dd>
                    </div>
                    <div>
                      <dt>Guests</dt>
                      <dd>{selectedConversation.booking.guests}</dd>
                    </div>
                    <div>
                      <dt>Area</dt>
                      <dd className="link-text">{selectedConversation.booking.area}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section>
                <h2>Interpretation result</h2>
                <div className="interpretation-list">
                  <div><span>Action</span><strong>Book</strong></div>
                  <div><span>Service</span><strong>Breakfast</strong></div>
                  <div><span>Requested date</span><strong>2026-07-26</strong></div>
                  <div><span>Requested time</span><strong>10:00 AM</strong></div>
                </div>
              </section>

              <button className="context-action-button" type="button">
                Approve and resolve
              </button>
              <button className="context-action-button" type="button">
                Mark as resolved
              </button>
            </>
          ) : (
            <div className="no-booking-context">
              <strong>No active booking</strong>
              <p>Use this conversation to create a new booking when the guest is ready.</p>
              <button className="context-action-button" type="button">
                Create booking
              </button>
            </div>
          )}
        </div>

        <footer className="context-footer">
          <button type="button">Open full booking card</button>
        </footer>
      </aside>
    </main>
  );
}
