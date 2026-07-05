const messages = [
    "Hi, I would like to book a haircut for tomorrow afternoon. My name is Anna and my phone number is 0412345678.",
    "Can I book a massage this Friday morning? My name is Sarah and my number is 0400111222.",
    "Do you have any available slots for a haircut tomorrow evening? My name is Daniel.",
    "Hello, I need to book nail services for Saturday afternoon. You can contact me on 0411555666.",
    "Hi, I want to make an appointment for a facial next Monday at 2pm. This is Emily, 0498765432."
]

module.exports = {
    messages
}

// {
//   action: 'book',
//   service: 'haircut',
//   preferredDate: 'tomorrow',
//   preferredTime: 'afternoon',
//   clientName: 'Anna',
//   clientContact: '0412345678',
//   confidence: 0.98
// }
//--------------------------------------
// {
//   action: 'book',
//   service: 'massage',
//   preferredDate: 'this Friday',
//   preferredTime: 'morning',
//   clientName: 'Sarah',
//   clientContact: '0400111222',
//   confidence: 0.98
// }
//--------------------------------------
// {
//   action: 'check availability',
//   service: 'haircut',
//   preferredDate: 'tomorrow',
//   preferredTime: 'evening',
//   clientName: 'Daniel',
//   clientContact: null,
//   confidence: 0.95
// }
//--------------------------------------
// {
//   action: 'book',
//   service: 'nail services',
//   preferredDate: 'Saturday',
//   preferredTime: 'afternoon',
//   clientName: null,
//   clientContact: '0411555666',
//   confidence: 0.95
// }
//--------------------------------------
// {
//   action: 'make an appointment',
//   service: 'facial',
//   preferredDate: 'next Monday',
//   preferredTime: '2pm',
//   clientName: 'Emily',
//   clientContact: '0498765432',
//   confidence: 0.98
// }