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
  pages: {
    servicesTitle: string;
    servicesSubtitle: string;
    servicesBookLabel: string;
    portfolioTitle: string;
    portfolioSubtitle: string;
    classesTitle: string;
    classesBody: string;
    durationUnitShort: string;
  };
  admin: {
    signIn: {
      title: string;
      emailLabel: string;
      submit: string;
      submitting: string;
      checkEmailTitle: string;
      checkEmailBody: string;
      errors: {
        generic: string;
        expired: string;
      };
    };
    header: {
      brand: string;
      signedInAs: string;
      signOut: string;
    };
    revenue: {
      thisMonth: string;
      confirmed: string;
      pending: string;
      upcoming: string;
    };
    tabs: {
      pending: string;
      upcoming: string;
      past: string;
    };
    search: {
      placeholder: string;
      submit: string;
      noResults: string;
    };
    pagination: {
      previous: string;
      next: string;
      pageOf: string;
    };
    booking: {
      durationUnit: string;
      statusLabels: {
        pending: string;
        confirmed: string;
        rejected: string;
        completed: string;
        cancelled: string;
        no_show: string;
      };
      locationLabels: {
        studio: string;
        home: string;
        venue: string;
      };
      customerNoteHeader: string;
      adminNoteHeader: string;
      auditTrailHeader: string;
      confirmAction: string;
      rejectAction: string;
      confirming: string;
      rejecting: string;
      rejectReasonLabel: string;
      rejectReasonPlaceholder: string;
      rejectSubmit: string;
      rejectCancel: string;
      notifyFailedBanner: string;
      resendAction: string;
      alreadyHandled: string;
    };
    actions: {
      confirmHeading: string;
      confirmBody: string;
      confirmButton: string;
      confirmedHeading: string;
      confirmedBodyWithNotifyOk: string;
      confirmedBodyWithNotifyFail: string;
      rejectHeading: string;
      rejectBody: string;
      rejectButton: string;
      rejectedHeading: string;
      invalidLink: string;
      expiredLink: string;
      notFound: string;
    };
    audit: {
      events: {
        booking_created: string;
        booking_confirmed: string;
        booking_rejected: string;
        notify_sent: string;
        notify_failed: string;
      };
    };
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
  pages: {
    servicesTitle: 'Services',
    servicesSubtitle: 'Full pricing across every look.',
    servicesBookLabel: 'Book',
    portfolioTitle: 'Portfolio',
    portfolioSubtitle: 'A glimpse of recent work.',
    classesTitle: 'Classes',
    classesBody:
      "Kiki's Korean makeup classes are launching soon. Check back in a few weeks, or follow on Instagram for announcements.",
    durationUnitShort: 'min',
  },
  admin: {
    signIn: {
      title: 'Admin sign in',
      emailLabel: 'Email',
      submit: 'Send sign-in link',
      submitting: 'Sending…',
      checkEmailTitle: 'Check your email',
      checkEmailBody: 'If that email is on the allow-list, a sign-in link was sent. It expires in 15 minutes.',
      errors: {
        generic: 'Something went wrong. Try again.',
        expired: 'That link has expired. Request a new one.',
      },
    },
    header: {
      brand: 'Kiki Studio Admin',
      signedInAs: 'Signed in as',
      signOut: 'Sign out',
    },
    revenue: {
      thisMonth: 'This month',
      confirmed: 'confirmed',
      pending: 'pending',
      upcoming: 'upcoming',
    },
    tabs: {
      pending: 'Pending',
      upcoming: 'Upcoming',
      past: 'Past',
    },
    search: {
      placeholder: 'Search by name, phone, or service…',
      submit: 'Search',
      noResults: 'No bookings match your search.',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      pageOf: 'Page {current} of {total}',
    },
    booking: {
      durationUnit: 'min',
      statusLabels: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        rejected: 'Rejected',
        completed: 'Completed',
        cancelled: 'Cancelled',
        no_show: 'No-show',
      },
      locationLabels: {
        studio: 'Studio',
        home: 'Home',
        venue: 'Venue',
      },
      customerNoteHeader: 'Customer note',
      adminNoteHeader: 'Admin note',
      auditTrailHeader: 'Audit trail',
      confirmAction: 'Confirm',
      rejectAction: 'Reject',
      confirming: 'Confirming…',
      rejecting: 'Rejecting…',
      rejectReasonLabel: 'Reason (optional — shared with the customer)',
      rejectReasonPlaceholder: 'Fully booked that weekend…',
      rejectSubmit: 'Confirm rejection',
      rejectCancel: 'Cancel',
      notifyFailedBanner: 'Customer notification failed for {name}.',
      resendAction: 'Resend',
      alreadyHandled: 'This booking has already been handled.',
    },
    actions: {
      confirmHeading: 'Confirm this booking?',
      confirmBody: 'Tapping the button below will mark the booking as confirmed and email the customer.',
      confirmButton: 'Confirm booking',
      confirmedHeading: 'Booking confirmed',
      confirmedBodyWithNotifyOk: 'The customer has been notified.',
      confirmedBodyWithNotifyFail: 'Confirmed, but we could not send the customer notification email. Sign in to the dashboard to retry.',
      rejectHeading: 'Reject this booking?',
      rejectBody: 'Optionally share a short reason with the customer, then tap the button below.',
      rejectButton: 'Confirm rejection',
      rejectedHeading: 'Booking rejected',
      invalidLink: 'This link is invalid or has been tampered with.',
      expiredLink: 'This link has expired. Sign in to the dashboard to act on this booking.',
      notFound: 'We could not find that booking.',
    },
    audit: {
      events: {
        booking_created: 'Booking created',
        booking_confirmed: 'Confirmed',
        booking_rejected: 'Rejected',
        notify_sent: 'Customer notified',
        notify_failed: 'Customer notification failed',
      },
    },
  },
};
