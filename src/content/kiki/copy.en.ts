export const copyEn = {
  nav: {
    home: 'Home',
    services: 'Services',
    portfolio: 'Portfolio',
    classes: 'Classes',
    book: 'Book now',
  },
  landing: {
    heroHeadline: 'Korean-style bridal & event makeup',
    heroSub: 'Soft, camera-ready looks for your big day. Studio-based in Kepong, KL.',
    heroCta: 'Book your session',
  },
  booking: {
    title: 'Book your session',
    stepService: 'Pick a service',
    stepSlot: 'Choose a time',
    stepDetails: 'Your details',
    stepReview: 'Review and confirm',
    nameLabel: 'Full name',
    phoneLabel: 'WhatsApp number',
    emailLabel: 'Email (optional)',
    notesLabel: 'Anything we should know?',
    submit: 'Request booking',
    submittingFallback: 'Submitting…',
    successTitle: 'Thanks — your request is in',
    successBody: 'Kiki will confirm via WhatsApp shortly. Keep an eye on your phone.',
    errorTitle: 'Something went wrong',
    errorSlotTaken: 'That time just got booked. Please pick another slot.',
  },
  footer: {
    rights: '© Kiki Studio',
  },
} as const;

export type Copy = typeof copyEn;
