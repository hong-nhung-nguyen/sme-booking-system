## Floor Plan feature Document

## POST /floorplans/create

- Create sections as part of the new floor plan
- Allow users to select existing table resources or create new ones
- Store only the visual placement of each table in `tableLayouts`

### Current ownership

```text
Location
├── Table resources
│   ├── T1
│   ├── T2
│   └── T3
│
└── Floor plan
    ├── Sections created for this layout
    │   ├── Dining Room
    │   └── Patio
    │
    └── Table placements
        ├── T1 → Dining Room at x/y
        └── T2 → Patio at x/y
```

### Current creation flow

1. Define canvas dimensions.
2. Create new sections.
3. Fetch existing table resources for the selected location.
4. Select existing tables to place.
5. Optionally create new table resources.
6. Position selected and newly created tables.
7. Save the resources and floor plan atomically. 

### Sections

- Sections are embedded in and owned by one FloorPlan

- When creating a new floor plan, create new sections. Do not select sections from another floor plan because their identities and layouts are location-specific.

- Can provided suggested names such as Dining Room, Patio, and Bar, but they should become new embedded sections 

### Table Resources

- Tables are operational resources belonging to a location. They should exist independently of their visual placement. 

- Resource ownership:

```js
businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
    index: true
},
locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
    index: true
}
```

- A table resource contains operational information: 

```js
{
    businessId,
    locationId,
    number: "T1",
    maxCapacity: 4,
    status: "available"
}
```

- The FloorPlan stores only how that resource appears - This separation means changing a table's position does not modify its booking identity. 

```js
{
    resourceId,
    sectionId,
    x: 100,
    y: 80,
    width: 90,
    height: 70,
    shape: "rectangle",
    rotation: 0,
    zIndex: 0,
    status: "active"
}
```

