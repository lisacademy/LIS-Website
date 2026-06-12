CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SEQUENCE IF NOT EXISTS membership_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_number BIGINT NOT NULL UNIQUE,
  membership_id TEXT NOT NULL UNIQUE,
  application_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  category TEXT NOT NULL,
  custom_detail TEXT NOT NULL,
  designation TEXT NOT NULL,
  institution TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  membership_tier TEXT NOT NULL CHECK (membership_tier IN ('student', 'life', 'institutional')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  photo_data_url TEXT,
  certificate_draft_data_url TEXT,
  certificate_editor_state JSONB,
  certificate_data_url TEXT,
  certificate_template_version INTEGER,
  volunteer_status TEXT NOT NULL DEFAULT 'not_applied',
  volunteer_applied_at TIMESTAMPTZ,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  certificate_submitted_at TIMESTAMPTZ
);

ALTER TABLE members ADD COLUMN IF NOT EXISTS application_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_draft_data_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_editor_state JSONB;
ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_data_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_template_version INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_submitted_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN IF NOT EXISTS volunteer_status TEXT DEFAULT 'not_applied';
ALTER TABLE members ADD COLUMN IF NOT EXISTS volunteer_applied_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_members_created_at ON members (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_membership_id ON members (membership_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_application_id ON members (application_id);

UPDATE members
SET
  application_id = COALESCE(application_id, CONCAT('APP/', membership_number::text)),
  status = COALESCE(status, 'pending')
WHERE application_id IS NULL OR status IS NULL;

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  speakers JSONB NOT NULL DEFAULT '[]'::jsonb,
  agenda JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  registration_url TEXT,
  brochure_url TEXT,
  gallery_url TEXT,
  report_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS brochure_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS report_url TEXT;

CREATE INDEX IF NOT EXISTS idx_events_sort ON events (sort_order ASC, created_at DESC);

DELETE FROM events a
USING events b
WHERE a.ctid < b.ctid
  AND a.title = b.title
  AND a.event_date = b.event_date
  AND a.location = b.location;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_identity ON events (title, event_date, location);

UPDATE events
SET event_date = '15-17 October 2026',
    updated_at = NOW()
WHERE title = '5th LISACON 2024 International Conference on Intelligent Libraries'
  AND location = 'Presidency University, Bengaluru'
  AND event_date IN ('2024-10-17', 'November 7-9, 2024');

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section, key)
);

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  template_url TEXT NOT NULL DEFAULT '',
  field_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_content (section, key, value) VALUES
  ('hero', 'headline', 'Learn. Inspire. Serve.'),
  ('hero', 'subtitle', 'A professional Public Charitable Trust advancing the Library & Information Science profession through world-class training, technology implementation, and research across India.'),
  ('about', 'description', 'LIS Academy is India''s Premier Library & Information Science Platform.'),
  ('contact', 'email', 'info@lisacademy.org'),
  ('contact', 'phone', '080-35006965'),
  ('contact', 'address', '7/29, Vijayalakshmi Complex, 1st Main Road, Gokul, Bengaluru - 560054'),
  ('social', 'facebook', 'https://facebook.com/lisacademy'),
  ('social', 'twitter', 'https://twitter.com/lisacademy'),
  ('social', 'linkedin', 'https://linkedin.com/company/lisacademy'),
  ('social', 'youtube', 'https://youtube.com/@lisacademy'),
  ('social', 'instagram', 'https://instagram.com/lisacademy'),
  ('topbar', 'tagline', 'LEARN | INSPIRE | SERVE'),
  ('donate', 'headline', 'Support LIS Academy'),
  ('donate', 'intro', 'Your contribution helps LIS Academy expand professional development, research, and community initiatives for library and information science.'),
  ('donate', 'note', 'Contributions are accepted in multiples of Rs. 100. Please choose an amount and continue to the payment gateway.')
ON CONFLICT (section, key) DO NOTHING;

INSERT INTO document_templates (template_key, label, template_url, field_map) VALUES
  ('certificate', 'Membership Certificate', '', '{}'::jsonb),
  ('id_front', 'ID Card Front', '', '{}'::jsonb),
  ('id_back', 'ID Card Back', '', '{}'::jsonb)
ON CONFLICT (template_key) DO NOTHING;

INSERT INTO events (
  title,
  event_date,
  location,
  event_type,
  description,
  speakers,
  agenda,
  image_url,
  registration_url,
  brochure_url,
  gallery_url,
  report_url,
  sort_order,
  is_featured
) VALUES
  (
    '1st LIS Academy Conference',
    'December 21-23, 2017',
    'Gandhi Bhavan, Kumara Park, Bengaluru',
    'Conference',
    'The inaugural LIS Academy conference was organized with public library and scientometrics partners around the larger idea of information for all and the public role of libraries.',
    '["Department of Public Libraries", "Raja Rammohun Roy Library Foundation", "Institute of Scientometrics"]'::jsonb,
    '["Inaugural conference sessions", "Public library themes", "Infographics and scientometrics discussions", "Technical presentations"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_a046653287664b3a815188549da38c40~mv2.jpg/v1/fit/w_1440,h_961,q_90,enc_avif,quality_auto/4c9702_a046653287664b3a815188549da38c40~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    '',
    10,
    TRUE
  ),
  (
    '2nd LIS Academy Conference on Innovations in Libraries',
    'June 6-8, 2019',
    'Visvesvaraya Technological University, Belagavi',
    'Conference',
    'This edition focused on how innovation and emerging technologies are reshaping libraries, information access, LIS education, and service delivery.',
    '["Prof. Kavi Mahesh", "Dr. S. M. Pujar", "Dr. Buddhi Prakash Chauhan", "Delegates from India and Bangladesh"]'::jsonb,
    '["Conference theme sessions", "Library technology trends", "Innovations in library technologies", "Technology-based library services"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_10facdeb1493473fb43793d66c4b1780~mv2.jpg/v1/fit/w_960,h_637,q_90,enc_avif,quality_auto/4c9702_10facdeb1493473fb43793d66c4b1780~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    '',
    20,
    TRUE
  ),
  (
    '3rd LISACON',
    '2020',
    'LIS Academy',
    'Conference',
    'The third LISACON continued the Academy conference series as a professional platform for knowledge sharing, collaboration, and emerging ideas in Library and Information Science.',
    '["LIS Academy", "Invited LIS professionals and researchers"]'::jsonb,
    '["Conference sessions", "Knowledge dissemination", "Professional networking", "Research presentations"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_14fc3d1425b84fa18179fcc5b0439525~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_14fc3d1425b84fa18179fcc5b0439525~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    '',
    30,
    TRUE
  ),
  (
    '4th LISACON',
    '2020',
    'LIS Academy',
    'Conference',
    'The fourth LISACON extended the Academy conference series with a continued focus on professional development, research promotion, and the changing needs of LIS practice.',
    '["LIS Academy", "Invited LIS professionals and researchers"]'::jsonb,
    '["Conference sessions", "Professional development", "Research promotion", "Best-practice sharing"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_809dfa16bbe740c684028964f177c15d~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_809dfa16bbe740c684028964f177c15d~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    'https://www.lisacon.org/copy-of-distiguished-lectures',
    '',
    40,
    TRUE
  ),
  (
    '5th LISACON 2024 International Conference on Intelligent Libraries',
    '15-17 October 2026',
    'Presidency University, Bengaluru',
    'International Conference',
    'The 5th LISACON 2024 International Conference focused on Intelligent Libraries and brought together LIS professionals, researchers, educators, and technology partners.',
    '["LIS Academy", "Presidency University", "Invited national and international speakers"]'::jsonb,
    '["Intelligent libraries", "Conference keynote sessions", "Research paper presentations", "Professional networking"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_5ba7b03bf62a4fb6a3dbcd22f9f9931f~mv2.jpeg/v1/fit/w_960,h_1360,q_90,enc_avif,quality_auto/4c9702_5ba7b03bf62a4fb6a3dbcd22f9f9931f~mv2.jpeg',
    'https://www.lisacon.org/registration',
    'https://www.lisacon.org/copy-of-home',
    'https://www.lisacon.org/copy-of-home',
    '',
    50,
    TRUE
  ),
  (
    'LISA Distinguished Lecture Series',
    'Launched on November 14, 2020',
    'Online',
    'Lecture Series',
    'A recurring lecture forum created to expose LIS professionals to contemporary trends, leadership perspectives, and emerging technologies in librarianship.',
    '["Prof. P. Balaram", "Invited academic and research leaders"]'::jsonb,
    '["Distinguished keynote lecture", "Contemporary LIS issues", "Leadership and management perspectives", "Best-practice sharing"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg/v1/fit/w_960,h_683,q_90,enc_avif,quality_auto/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg',
    '',
    'https://www.lisacon.org/copy-of-tech-vc-conclaves',
    'https://www.lisacon.org/copy-of-tech-vc-conclaves',
    '',
    60,
    TRUE
  ),
  (
    '1st LISA Distinguished Lecture',
    'November 14, 2020',
    'Online',
    'Distinguished Lecture',
    'The inaugural LISA Distinguished Lecture opened the series with a talk on Science Publishing: Greed, Vanity, and the Decline of Scholarship.',
    '["Padma Bhushan Prof. P. Balaram, Former Director, Indian Institute of Science, Bangalore"]'::jsonb,
    '["Inaugural distinguished lecture", "Science publishing", "Scholarship and libraries", "Online discussion"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg/v1/fit/w_960,h_683,q_90,enc_avif,quality_auto/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg',
    '',
    'https://www.lisacon.org/copy-of-tech-vc-conclaves',
    '',
    'https://www.youtube.com/watch?v=ndtYh_rp7yw&t=38s',
    70,
    FALSE
  ),
  (
    '2nd LISA Distinguished Lecture',
    'December 12, 2020',
    'Online',
    'Distinguished Lecture',
    'The second LISA Distinguished Lecture featured leadership perspectives for the LIS community from the Chairman of AICTE.',
    '["Prof. Anil Sahasrabudhe, Chairman, AICTE, New Delhi"]'::jsonb,
    '["Distinguished lecture", "Technical education", "Professional leadership", "Online discussion"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_b283ce5b46d6446ba2447d64efd9b65b~mv2.jpg/v1/fit/w_960,h_678,q_90,enc_avif,quality_auto/4c9702_b283ce5b46d6446ba2447d64efd9b65b~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-tech-vc-conclaves',
    '',
    'https://www.youtube.com/watch?v=yBUaID8NUjY&t=1s',
    80,
    FALSE
  ),
  (
    '3rd LISA Distinguished Lecture',
    'January 9, 2021',
    'Online',
    'Distinguished Lecture',
    'The third LISA Distinguished Lecture featured research, innovation, and institutional development perspectives for LIS professionals.',
    '["Dr. Sandhya Shekhar, Former Founding CEO, IIT Madras Research Park, Chennai"]'::jsonb,
    '["Distinguished lecture", "Research and innovation", "Professional learning", "Online discussion"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_ee9f3ebbf18344dbb257f7b38c2c9d43~mv2.jpg/v1/fit/w_960,h_1356,q_90,enc_avif,quality_auto/4c9702_ee9f3ebbf18344dbb257f7b38c2c9d43~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-tech-vc-conclaves',
    '',
    'https://www.youtube.com/watch?v=MeV9V6iE7os&t=264s',
    90,
    FALSE
  ),
  (
    '4th LISA Distinguished Lecture',
    'February 13, 2021',
    'Online',
    'Distinguished Lecture',
    'The fourth LISA Distinguished Lecture brought academic administration and open university leadership perspectives to the LIS community.',
    '["Dr. Sudha Rao, Former Vice Chancellor, Karnataka State Open University, Mysore"]'::jsonb,
    '["Distinguished lecture", "Academic leadership", "LIS professional development", "Online discussion"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_4aab79f1c688410cb9192f2ef28a7c3f~mv2.jpg/v1/fit/w_480,h_678,q_90,enc_avif,quality_auto/4c9702_4aab79f1c688410cb9192f2ef28a7c3f~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-tech-vc-conclaves',
    '',
    'https://www.youtube.com/watch?v=53JwadrIRqw',
    100,
    FALSE
  ),
  (
    '5th LISA Distinguished Lecture',
    'March 13, 2021',
    'Online',
    'Distinguished Lecture',
    'The fifth LISA Distinguished Lecture featured Dr. Ramachandra Guha, noted historian of international repute, as part of the Academy lecture series.',
    '["Dr. Ramachandra Guha, Noted Historian of International Repute, Bangalore"]'::jsonb,
    '["Distinguished lecture", "Humanities and scholarship", "Libraries and public knowledge", "Online discussion"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg/v1/fit/w_960,h_683,q_90,enc_avif,quality_auto/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg',
    '',
    'https://www.lisacon.org/copy-of-tech-vc-conclaves',
    '',
    'https://www.youtube.com/watch?v=dah5C_doM40&t=666s',
    110,
    FALSE
  ),
  (
    '1st LIS Academy Tech VC Conclave',
    '2018',
    'LIS Academy',
    'Tech VC Conclave',
    'The first Tech VC Conclave initiated LIS Academy''s platform for technical universities, academia, industry, R&D organizations, and statutory bodies to deliberate on technical education challenges.',
    '["LIS Academy", "Partnering state technical universities", "Vice Chancellors and invited experts"]'::jsonb,
    '["Technical education dialogue", "Research and innovation", "Industry-academia collaboration", "Policy and leadership deliberations"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_a3f82175403f43669d10c930f701cace~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_a3f82175403f43669d10c930f701cace~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-lisacon',
    'https://www.lisacon.org/copy-of-lisacon',
    '',
    120,
    FALSE
  ),
  (
    '2nd LIS Academy Tech VC Conclave',
    '2020',
    'LIS Academy',
    'Tech VC Conclave',
    'The second Tech VC Conclave continued the biannual forum addressing contemporary issues and challenges of technical education in India.',
    '["LIS Academy", "Partnering state technical universities", "Vice Chancellors and invited experts"]'::jsonb,
    '["Technical education challenges", "Self-reliance through research", "Innovation culture", "Collaborative deliberations"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_264149b6ded4459f818803875086b0aa~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_264149b6ded4459f818803875086b0aa~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-lisacon',
    'https://www.lisacon.org/copy-of-lisacon',
    '',
    130,
    FALSE
  ),
  (
    '3rd LIS Academy Tech VC Conclave',
    '2022',
    'LIS Academy',
    'Tech VC Conclave',
    'The third Tech VC Conclave carried forward LIS Academy''s technical education leadership forum for research culture, innovation, and institutional collaboration.',
    '["LIS Academy", "Partnering state technical universities", "Vice Chancellors and invited experts"]'::jsonb,
    '["Research culture", "Innovation and skillsets", "Technical university collaboration", "Higher education leadership"]'::jsonb,
    'https://static.wixstatic.com/media/4c9702_384f8e3628e64b16bf62bb124ddf30fc~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_384f8e3628e64b16bf62bb124ddf30fc~mv2.jpg',
    '',
    'https://www.lisacon.org/copy-of-lisacon',
    'https://www.lisacon.org/copy-of-lisacon',
    '',
    140,
    FALSE
  )
ON CONFLICT (title, event_date, location) DO UPDATE SET
  event_type = EXCLUDED.event_type,
  description = EXCLUDED.description,
  speakers = EXCLUDED.speakers,
  agenda = EXCLUDED.agenda,
  image_url = EXCLUDED.image_url,
  registration_url = EXCLUDED.registration_url,
  brochure_url = EXCLUDED.brochure_url,
  gallery_url = EXCLUDED.gallery_url,
  report_url = EXCLUDED.report_url,
  sort_order = EXCLUDED.sort_order,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW();
