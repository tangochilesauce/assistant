-- Financial Events table
-- Every income/expense item, recurring or one-time.
-- Calendar reads from this. Financial page reads from this.

create table financial_events (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  amount numeric not null,                -- positive = income, negative = expense
  category text not null default 'personal',  -- 'income' | 'personal' | 'business' | 'production'
  recurring boolean not null default true,
  due_day integer,                        -- for recurring: day of month (1-28)
  due_date text,                          -- for one-time: YYYY-MM-DD
  recurrence text not null default 'monthly', -- 'monthly' | 'weekly' | 'biweekly' | 'quarterly'
  status text not null default 'active',  -- 'active' | 'paused' | 'unpaid' | 'paid' | 'overdue'
  vendor text,
  notes text,
  color text,                             -- hex color for calendar pill
  project_slug text,                      -- link to a PL8 project
  paid_date text,                         -- when a one-time bill was actually paid
  created_at text not null default now()::text,
  updated_at text not null default now()::text
);

-- Index for calendar queries (recurring items by due_day, one-time by due_date)
create index idx_financial_events_due_day on financial_events (due_day) where recurring = true;
create index idx_financial_events_due_date on financial_events (due_date) where recurring = false;
create index idx_financial_events_status on financial_events (status);

-- RLS: allow all for authenticated users (single-user app)
alter table financial_events enable row level security;

create policy "Allow all for anon" on financial_events
  for all using (true) with check (true);
