-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema including flashcards, generations, and error logs tables
-- with proper constraints, indexes and row level security policies.

-- Note: The auth.users table is managed by Supabase Auth and is already created

-- Create flashcards table
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null check (char_length(front) <= 200),
    back varchar(500) not null check (char_length(back) <= 500),
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    generation_id bigint null,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

-- Create generations table
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

-- Create generation_error_logs table
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamp not null default now()
);

-- Add foreign key constraint for flashcards.generation_id after both tables exist
alter table flashcards 
    add constraint flashcards_generation_id_fkey 
    foreign key (generation_id) 
    references generations(id) 
    on delete cascade;

-- Create indexes for better query performance
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);
create index generations_user_id_idx on generations(user_id);
create index generation_error_logs_user_id_idx on generation_error_logs(user_id);

-- Enable Row Level Security on all tables
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- Create RLS policies for flashcards table
create policy "Users can view their own flashcards" 
    on flashcards for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards" 
    on flashcards for insert 
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards" 
    on flashcards for update 
    using (auth.uid() = user_id);

create policy "Users can delete their own flashcards" 
    on flashcards for delete 
    using (auth.uid() = user_id);

-- Create RLS policies for generations table
create policy "Users can view their own generations" 
    on generations for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own generations" 
    on generations for insert 
    with check (auth.uid() = user_id);

create policy "Users can update their own generations" 
    on generations for update 
    using (auth.uid() = user_id);

create policy "Users can delete their own generations" 
    on generations for delete 
    using (auth.uid() = user_id);

-- Create RLS policies for generation_error_logs table
create policy "Users can view their own error logs" 
    on generation_error_logs for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs" 
    on generation_error_logs for insert 
    with check (auth.uid() = user_id);

-- Note: Update and Delete policies for error_logs are intentionally omitted 
-- as these records should be immutable 