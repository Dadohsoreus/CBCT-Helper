import { usLocations } from './locations.mjs';

const endpoint = 'https://cbct-helper-forms.odex---------ecision--enter.workers.dev';
for (const form of document.querySelectorAll('[data-outreach]')) {
  const type = form.dataset.outreach;
  const button = form.querySelector('button[type=submit]');
  const status = form.querySelector('[role=status]');
  const state = form.elements.namedItem('state');
  let sending = false;
  function updateAvailability() {
    const outside = state?.value === 'outside';
    if (state) form.querySelector('.location-note').hidden = !outside;
    button.disabled = sending || outside;
  }
  if (state) {
    for (const [code, name] of Object.entries(usLocations)) {
      state.add(new Option(name, code), state.options.length - 1);
    }
  }
  updateAvailability();
  form.addEventListener('input', () => {
    status.textContent = '';
    updateAvailability();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || state?.value === 'outside' || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    for (const field of form.querySelectorAll('[required]')) {
      if (!field.value.trim()) {
        field.setCustomValidity('Please complete this field.');
        field.reportValidity();
        field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
        return;
      }
    }
    sending = true;
    // Keep entries intact on failure and protect edits while a send is in progress.
    for (const field of form.elements) field.disabled = true;
    status.textContent = 'Sending…';
    status.classList.remove('is-error');
    try {
      const response = await fetch(endpoint + '/' + type, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'omit', referrerPolicy: 'no-referrer', body: JSON.stringify(values),
        signal: AbortSignal.timeout(55000)
      });
      if (response.status !== 200) {
        const errors = {
          400: 'Check your email address and the required fields.',
          422: 'We couldn’t confirm a U.S. location for this connection. Contact requests are available only in the United States.',
          429: 'You’ve sent several messages. Please wait a minute and try again.'
        };
        throw new Error(errors[response.status] || 'We couldn’t confirm delivery. Your entries are still here. Please try again later.');
      }
      const { alias, mail } = await response.json();
      if (!/^[a-f0-9]{32}$/i.test(alias) || !mail) throw new Error('Email delivery is temporarily unavailable. Please try again later.');
      const delivery = await fetch('https://formsubmit.co/ajax/' + alias, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'omit', referrerPolicy: 'origin', body: JSON.stringify(mail), signal: AbortSignal.timeout(90000)
      });
      if (!delivery.ok) throw new Error('We couldn’t confirm delivery. Your entries are still here. Please try again later.');
      const receipt = await delivery.json();
      if (receipt.success !== true && receipt.success !== 'true') throw new Error('The email service couldn’t accept your message. Your entries are still here.');
      form.reset();
      status.textContent = type === 'feedback' ? 'Thank you for the feedback!' : 'Thank you. Your contact request has been sent to Dan.';
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error.name === 'Error' ? error.message : 'We couldn’t confirm delivery. Your entries are still here. Please try again.';
    } finally {
      sending = false;
      for (const field of form.elements) field.disabled = false;
      updateAvailability();
    }
  });
}
