# Natural Language Processing Agent Early Test and Improvements

## Inputs and Outputs

Message 1: 

```text
"cn i buk a hairct for sat 9am? leo 0408 777 111"
```

```json
Parsed intent: {
  action: 'book',
  service: 'haircut',
  preferredDate: '2026-07-11',
  preferredTime: '09:00',
  clientName: 'leo',
  clientContact: '0408 777 111',
  confidence: 0.9
}
```

Message 2: 

```text
"Please cancel my appointment, I can’t make it anymore. My number is 0400 123 123."
```

```json
Parsed intent: {
  action: 'cancel',
  service: null,
  preferredDate: null,
  preferredTime: null,
  clientName: null,
  clientContact: '0400 123 123',
  confidence: 0.95
}
```

Message 3: 

```text
"Can I book a haircut or beard trim this Thursday at 11am?"
```

```json
Parsed intent: {
  action: 'book',
  service: 'haircut or beard trim',
  preferredDate: '2026-07-09',
  preferredTime: '11:00 AM',
  clientName: null,
  clientContact: null,
  confidence: 0.94
}
```

Message 4: 

```text
"Hey, wondering if you’ve got any spots for a haircut sometime next week? Name’s Tom."
```

```json
Parsed intent: {
  action: 'check availability',
  service: 'haircut',
  preferredDate: null,
  preferredTime: null,
  clientName: 'Tom',
  clientContact: null,
  confidence: 0.86
}
```

Message 5: 

```text
"I had a massage booked for Monday arvo but need to change it to Wednesday 10am. This is Rachel."
```

```json
Parsed intent: {
  action: 'reschedule',
  service: 'massage',
  preferredDate: '2026-07-08',
  preferredTime: '10:00 AM',
  clientName: 'Rachel',
  clientContact: null,
  confidence: 0.95
}
```

---

## Improvements

- Add notes about having slangs and abbreviations.
- If the time is generic. For example: afternoon, morning, or evening: Set the `preferredTime` to `null`
- If the date is generic or unclear. For example: tomorrow, this friday, saturaday: Set the `preferredDate` to `null`
- `action` is limited to only: book, cancel, reschedule, check availability, and general inquiry



