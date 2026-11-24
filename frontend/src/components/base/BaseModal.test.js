import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseModal from './BaseModal.vue';

async function openModal(wrapper) {
  await wrapper.setProps({ show: true });
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await wrapper.vm.$nextTick();
}

function pressOnDocument(key, options = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
}

describe('BaseModal', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.body.innerHTML = '';
  });

  it('nie renderuje dialogu, gdy `show` jest false', () => {
    const wrapper = mount(BaseModal, { props: { show: false } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('po otwarciu ma semantykę dialogu i blokuje przewijanie tła', async () => {
    const wrapper = mount(BaseModal, {
      props: { show: false },
      slots: { header: 'Tytuł modala', default: '<p>Treść</p>' },
      attachTo: document.body,
    });

    await openModal(wrapper);

    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes('aria-modal')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');
    expect(dialog.element.contains(document.activeElement)).toBe(true);
  });

  it('zamyka się klawiszem Escape', async () => {
    const wrapper = mount(BaseModal, { props: { show: false }, attachTo: document.body });
    await openModal(wrapper);

    pressOnDocument('Escape');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('zamyka się kliknięciem w tło', async () => {
    const wrapper = mount(BaseModal, { props: { show: false }, attachTo: document.body });
    await openModal(wrapper);

    await wrapper.find('[role="presentation"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('Tab z ostatniego elementu wraca do pierwszego, Shift+Tab odwrotnie', async () => {
    const wrapper = mount(BaseModal, {
      props: { show: false },
      slots: {
        header: 'Tytuł',
        default: '<button id="inside-a">A</button><button id="inside-b">B</button>',
      },
      attachTo: document.body,
    });
    await openModal(wrapper);

    const dialog = wrapper.find('[role="dialog"]').element;
    const focusable = [...dialog.querySelectorAll('button')].filter(
      (el) => el.offsetParent !== null
    );
    expect(focusable.length).toBeGreaterThanOrEqual(2);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    pressOnDocument('Tab');
    expect(document.activeElement).toBe(first);

    first.focus();
    pressOnDocument('Tab', { shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('po zamknięciu przywraca fokus do elementu, który otworzył modal', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Otwórz';
    document.body.appendChild(trigger);
    trigger.focus();

    const wrapper = mount(BaseModal, { props: { show: false }, attachTo: document.body });
    await openModal(wrapper);

    expect(document.activeElement).not.toBe(trigger);

    await wrapper.setProps({ show: false });
    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
