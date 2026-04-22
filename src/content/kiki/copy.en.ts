export interface FAQItemCopy {
  id: string;
  question: string;
  answer: string;
}

export interface Copy {
  nav: {
    home: string;
    services: string;
    portfolio: string;
    classes: string;
    book: string;
  };
  landing: {
    heroEyebrow: string;
    heroHeadline: string;
    heroSub: string;
    heroCta: string;
    heroCtaSecondary: string;
  };
  booking: {
    title: string;
    stepService: string;
    stepSlot: string;
    stepDetails: string;
    stepReview: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    notesLabel: string;
    submit: string;
    submittingFallback: string;
    successTitle: string;
    successBody: string;
    errorTitle: string;
    errorSlotTaken: string;
  };
  services: {
    eyebrow: string;
    title: string;
    bookThisLabel: string;
    footnote: string;
  };
  location: {
    eyebrow: string;
    title: string;
    address: string;
    whatsappCta: string;
    whatsappDisplay: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FAQItemCopy[];
  };
  footer: {
    rights: string;
    instagramCtaLabel: string;
  };
}

export const copyEn: Copy = {
  nav: {
    home: 'Home',
    services: 'Services',
    portfolio: 'Portfolio',
    classes: 'Classes',
    book: 'Book now',
  },
  landing: {
    heroEyebrow: 'KIKI · KEPONG, KL',
    heroHeadline: 'Korean-style bridal & event makeup',
    heroSub: 'Soft, camera-ready looks for your big day. Studio-based in Kepong, KL.',
    heroCta: 'Book your session',
    heroCtaSecondary: 'View portfolio',
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
  services: {
    eyebrow: 'SERVICES',
    title: 'Every look, clearly priced.',
    bookThisLabel: 'Book this →',
    footnote:
      'All prices include skincare, false lashes, hair styling, and accessories. RM100 deposit confirms your slot. On-site service has an additional travel fee (RM30–80 depending on area).',
  },
  location: {
    eyebrow: 'LOCATION · CONTACT',
    title: 'Come by or message me.',
    address: 'Near MRT Sri Delima, Kepong, Kuala Lumpur (exact address sent via WhatsApp)',
    whatsappCta: 'Message on WhatsApp',
    whatsappDisplay: '+60 17-920 2880',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Answered before you ask.',
    items: [
      {
        id: 'book',
        question: 'How do I book?',
        answer:
          "Fill out the booking form, I'll confirm via WhatsApp. Pay RM100 deposit to lock your slot.",
      },
      {
        id: 'included',
        question: "What's included in the price?",
        answer:
          'Everything: pre-makeup skincare, eyebrow trim, false lashes, hair styling, body whitening, concert gems, and hair accessories. No hidden fees.',
      },
      {
        id: 'travel',
        question: 'Are there travel fees for on-site service?',
        answer: 'Yes, RM30–80 depending on area. Studio service has no travel fee.',
      },
      {
        id: 'beauty-filter',
        question: 'Will you edit my photos?',
        answer:
          'All photos are raw original-camera, only brightness adjusted. No heavy beauty filters. What you see is what you get.',
      },
      {
        id: 'cancel',
        question: 'What about cancellation?',
        answer: 'Deposit is non-refundable, but can be rescheduled with reasonable notice.',
      },
    ],
  },
  footer: {
    rights: '© Kiki Studio',
    instagramCtaLabel: 'Follow us on Instagram',
  },
};
