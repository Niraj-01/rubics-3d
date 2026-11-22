'use client';

import { useState, type FormEvent } from 'react';
import { enquiry } from '@/content';
import Section from './Section';

type Field = 'name' | 'phone' | 'email' | 'project';
type Values = Record<Field, string>;

const EMPTY: Values = { name: '', phone: '', email: '', project: '' };

function validate(v: Values): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name.';
  const digits = v.phone.replace(/[\s-]/g, '');
  if (!/^(\+91)?[6-9]\d{9}$/.test(digits)) e.phone = 'Enter a 10-digit Indian mobile number, optionally with +91.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!v.project) e.project = 'Choose a project.';
  return e;
}

export default function Enquiry() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const errors = validate(values);
  const valid = Object.keys(errors).length === 0;

  const bind = (f: Field) => ({
    id: `enq-${f}`,
    name: f,
    value: values[f],
    onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [f]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [f]: true })),
    'aria-invalid': touched[f] && errors[f] ? true : undefined,
    'aria-describedby': touched[f] && errors[f] ? `enq-${f}-err` : undefined,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, project: true });
    if (!valid || status !== 'idle') return;
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 800);
  };

  const fieldError = (f: Field) =>
    touched[f] && errors[f] ? (
      <p id={`enq-${f}-err`} className="mt-1.5 text-[12px] text-[#e8a090]">
        {errors[f]}
      </p>
    ) : null;

  return (
    <Section id="enquiry" eyebrow="Enquire" title={enquiry.title}>
      {status === 'sent' ? (
        <div className="animate-[fadeUp_0.8s_cubic-bezier(0.22,1,0.36,1)] py-8" role="status">
          <div className="mb-5 h-px w-16 bg-gold" />
          <p className="font-serif text-[26px] font-light leading-snug text-cream sm:text-3xl">{enquiry.success}</p>
          <button
            type="button"
            className="btn btn-ghost mt-8"
            onClick={() => {
              setValues(EMPTY);
              setTouched({});
              setStatus('idle');
            }}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="enq-name" className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted">
              Name
            </label>
            <input {...bind('name')} type="text" autoComplete="name" placeholder="Name" className="field" />
            {fieldError('name')}
          </div>
          <div>
            <label htmlFor="enq-phone" className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted">
              Phone
            </label>
            <input {...bind('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98XXX XXXXX" className="field" />
            {fieldError('phone')}
          </div>
          <div>
            <label htmlFor="enq-email" className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted">
              Email
            </label>
            <input {...bind('email')} type="email" inputMode="email" autoComplete="email" placeholder="Email" className="field" />
            {fieldError('email')}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="enq-project" className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted">
              Project of interest
            </label>
            <select {...bind('project')} className="field appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
              <option value="" disabled>
                Select a project
              </option>
              {enquiry.projects.map((p) => (
                <option key={p} value={p} className="bg-ink">
                  {p}
                </option>
              ))}
            </select>
            {fieldError('project')}
          </div>
          <div className="pt-2 sm:col-span-2">
            <button type="submit" disabled={!valid || status === 'sending'} className="btn btn-gold w-full sm:w-auto sm:min-w-44">
              {status === 'sending' ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-label="Sending" />
              ) : (
                enquiry.submit
              )}
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Demo build for review. Enquiries here aren&rsquo;t sent anywhere; nothing you type leaves this page.
            </p>
          </div>
        </form>
      )}
    </Section>
  );
}
