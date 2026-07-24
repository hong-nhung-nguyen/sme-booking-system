import { useState } from 'react';
import { createAppointment } from '../api/appointment.api';
import './NewBookingModal.css';

export default function NewBookingModal({
    open,
    booking = null,
    onClose,
    onSaved,
    selectedDate,
    locationId,
    services,
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceId: '',
    time: '18:00',
    partySize: 2,
    note: '',
    staffName: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function update(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === 'partySize' ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.phone && !form.email) {
      setError('Enter a phone number or email address.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const service = services.find(
        (item) => item.id === form.serviceId
      );

      await createAppointment({
        locationId,
        clientFirstName: form.firstName.trim(),
        clientLastName: form.lastName.trim() || undefined,
        clientPhone: form.phone.trim() || undefined,
        clientEmail: form.email.trim() || undefined,
        serviceId: form.serviceId,
        date: selectedDate,
        startTime: new Date(
          `${selectedDate}T${form.time}:00`
        ).toISOString(),
        durationMins: service?.defaultDurationMinutes || 90,
        partySize: form.partySize,
        channel: 'manual',
        note: form.note.trim() || undefined,
        createdBy: form.staffName.trim(),
      });

      await onSaved(); // reload calendar appointments
      onClose();
    } catch (requestError) {
      setError(requestError.message || 'Unable to save booking.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="booking-modal-backdrop">
      <section
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
      >
        <header>
          <h2 id="booking-title">New Reservation</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close booking form"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          {error && <p role="alert">{error}</p>}

          <label>
            Date
            <input type="date" value={selectedDate} readOnly />
          </label>

          <label>
            Service
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={update}
              required
            >
              <option value="">Select a service</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Start time
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={update}
              required
            />
          </label>

          <label>
            Covers
            <input
              name="partySize"
              type="number"
              min="1"
              value={form.partySize}
              onChange={update}
              required
            />
          </label>

          <label>
            First name *
            <input
              name="firstName"
              value={form.firstName}
              onChange={update}
              required
            />
          </label>

          <label>
            Last name
            <input
              name="lastName"
              value={form.lastName}
              onChange={update}
            />
          </label>

          <label>
            Phone number
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={update}
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
            />
          </label>

          <label>
            Booking notes
            <textarea
              name="note"
              value={form.note}
              onChange={update}
            />
          </label>

            <label>
                Staff name *
                <input
                    name="staffName"
                    value={form.staffName}
                    onChange={update}
                    disabled={saving}
                    placeholder="e.g. Rose Nguyen"
                    required
                />
            </label>

            <section className="booking-change-log">
                <h3>Changes</h3>

                {!booking?.changeHistory?.length ? (
                    <p>No changes yet. History appears after the booking is saved.</p>
                ) : (
                    <ol>
                    {booking.changeHistory.map((entry, index) => (
                        <li key={entry._id || index}>
                        <strong>{entry.updatedBy || 'System'}</strong>
                        <span>
                            {new Date(entry.updatedAt).toLocaleString('en-AU')}
                        </span>

                        <ul>
                            {entry.changes.map((change, changeIndex) => (
                            <li key={changeIndex}>
                                {change.field}: {String(change.oldValue ?? '—')} →{' '}
                                {String(change.newValue ?? '—')}
                            </li>
                            ))}
                        </ul>
                        </li>
                    ))}
                    </ol>
                )}
            </section>

            <footer>
                <button type="button" onClick={onClose} disabled={saving}>
                    Cancel
                </button>

                <button type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save booking'}
                </button>
            </footer>
        </form>
      </section>
    </div>
  );
}