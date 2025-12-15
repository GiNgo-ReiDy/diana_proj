--
-- PostgreSQL database dump
--

\restrict SDP5kz85h66Tq41joGOVK2TVZWh0wGaESQMVAEdpvJSJciHrSD2o4VtoM2NSJ4L

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

-- Started on 2025-12-14 23:13:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16464)
-- Name: program; Type: TABLE; Schema: public; Owner: uniuser
--

CREATE TABLE public.program (
    id integer NOT NULL,
    name character varying,
    university_id integer,
    mask_required_all integer,
    mask_required_any integer,
    program_url character varying
);


ALTER TABLE public.program OWNER TO uniuser;

--
-- TOC entry 221 (class 1259 OID 16463)
-- Name: program_id_seq; Type: SEQUENCE; Schema: public; Owner: uniuser
--

CREATE SEQUENCE public.program_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.program_id_seq OWNER TO uniuser;

--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 221
-- Name: program_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uniuser
--

ALTER SEQUENCE public.program_id_seq OWNED BY public.program.id;


--
-- TOC entry 220 (class 1259 OID 16455)
-- Name: subjects; Type: TABLE; Schema: public; Owner: uniuser
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name character varying
);


ALTER TABLE public.subjects OWNER TO uniuser;

--
-- TOC entry 219 (class 1259 OID 16454)
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: uniuser
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO uniuser;

--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 219
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uniuser
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- TOC entry 218 (class 1259 OID 16446)
-- Name: university; Type: TABLE; Schema: public; Owner: uniuser
--

CREATE TABLE public.university (
    id integer NOT NULL,
    name character varying,
    cities text[]
);


ALTER TABLE public.university OWNER TO uniuser;

--
-- TOC entry 217 (class 1259 OID 16445)
-- Name: university_id_seq; Type: SEQUENCE; Schema: public; Owner: uniuser
--

CREATE SEQUENCE public.university_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.university_id_seq OWNER TO uniuser;

--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 217
-- Name: university_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uniuser
--

ALTER SEQUENCE public.university_id_seq OWNED BY public.university.id;


--
-- TOC entry 4754 (class 2604 OID 16467)
-- Name: program id; Type: DEFAULT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.program ALTER COLUMN id SET DEFAULT nextval('public.program_id_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 16458)
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 16449)
-- Name: university id; Type: DEFAULT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.university ALTER COLUMN id SET DEFAULT nextval('public.university_id_seq'::regclass);


--
-- TOC entry 4912 (class 0 OID 16464)
-- Dependencies: 222
-- Data for Name: program; Type: TABLE DATA; Schema: public; Owner: uniuser
--

COPY public.program (id, name, university_id, mask_required_all, mask_required_any, program_url) FROM stdin;
53	Факультет физмат и компьютерных наук	6	328	0	https://spb.hse.ru/shift/1c/facultet
54	Высшая школа бизнеса	6	324	0	https://gsb.hse.ru/
3	Физический факультет	2	832	0	https://www.phys.msu.ru/
4	Факультет наук о материалах	2	832	0	https://msu.ru/divisions/faculteti/colmat
5	Факультет вычислительной математики и кибернетики	2	320	520	https://cs.msu.ru/node/3163
6	Биологический факультет	2	320	1025	https://bio.msu.ru/
7	Химический факультет	2	1344	513	https://www.chem.msu.ru/
8	Факультет почвоведения	2	1	1610	https://soil.msu.ru/
9	Факультет биоинженерии и биоинформатики	2	1345	0	https://fbb.msu.ru/
10	Филологический факультет	2	288	20	https://www.philol.msu.ru/
11	Факультет журналистики	2	288	148	https://www.journ.msu.ru/
12	Факультет психологии	2	385	0	https://psy-msu.ru/
13	Экономический факультет	2	320	140	https://www.econ.msu.ru/
14	Механико-математический факультет	2	832	0	https://msu.ru/divisions/faculteti/mechmath
15	Факультет мировой политики	2	272	134	https://fmp.msu.ru/
16	Информатика и системы управления	3	320	520	https://bmstu.ru/faculty/iu
17	Инженерный бизнес и менеджмент	3	320	136	https://bmstu.ru/faculty/ebm
18	Машиностроительные технологии	3	832	0	http://mt.bmstu.ru/
19	Специальное машиностроение	3	320	520	https://sm.bmstu.ru/
20	Биомедицинская техника	3	320	513	http://www.bmt.bmstu.ru/
21	Радиоэлектроника и лазерная техника	3	832	0	https://rlm.bmstu.ru/f_rl.html
22	Энергомашиностроение	3	832	0	http://energet.bmstu.ru/
23	Робототехника и комплексная автоматизация	3	832	0	http://rk.bmstu.ru/
24	Фундаментальные науки	3	320	520	https://bmstu.ru/faculty/fn
25	Лингвистика	3	260	144	https://bmstu.ru/faculty/lingvistika
26	Безопасность в цифровом мире	3	320	520	https://bmstu.ru/faculty/ur
27	Социальные и гуманитарные науки	3	385	92	http://fsgn.bmstu.ru/
28	Гуманитарный институт	4	388	0	https://hum.spbstu.ru/
29	Инженерно-строительный институт	4	832	0	https://ice.spbstu.ru/
30	Институт биомедицинских систем и биотехнологий	4	320	1537	https://ibmst.spbstu.ru/
31	Институт компьютерных наук и кибербезопасности	4	320	520	https://iccs.spbstu.ru/
32	Институт машиностроения, материалов и транспорта	4	320	520	https://immit.spbstu.ru/
33	Институт физики и математики	4	320	520	https://phmath.spbstu.ru/
34	Институт физической культуры, спорта и туризма	4	385	0	https://ifkst.spbstu.ru/
35	Институт электроники и телекоммуникаций	4	320	520	https://et.spbstu.ru/
36	Институт энергетики	4	832	0	https://ie.spbstu.ru/
37	Физико-механический институт	4	320	520	https://physmech.spbstu.ru/
38	Институт промышленного менеджмента, экономики и торговли	4	320	520	https://imet.spbstu.ru/
39	Факультет международных отношений	5	276	0	https://mgimo.ru/study/faculty/mo/
40	Международно-правовой факультет	5	388	0	https://mgimo.ru/study/faculty/mp/
41	Факультет международных экономических отношений	5	324	0	https://mgimo.ru/study/faculty/meo/
42	Факультет международной журналистики	5	292	0	https://mgimo.ru/study/faculty/journalism/
43	Факультет международного бизнеса	5	324	0	https://mgimo.ru/study/faculty/mbda/
44	Факультет международной торговли и устойчивого развития	5	324	0	https://mgimo.ru/study/faculty/imtur/
45	Факультет управления и политики	5	276	0	https://mgimo.ru/study/faculty/sgp/
46	Международный институт энергетической политики и дипломатии	5	276	0	https://mgimo.ru/study/faculty/miep/
47	Факультет лингвистики и межкультурной коммуникации	5	260	48	https://mgimo.ru/study/faculty/flmk/
48	Факультет финансовой экономики	5	324	0	https://mgimo.ru/study/faculty/ffe/
49	Факультет маркетинга и предпринимательства	5	324	0	https://mgimo.ru/study/faculty/marketing/
50	Факультет математики	6	320	520	https://math.hse.ru/
51	Факультет экономических наук	6	320	140	https://economics.hse.ru/
52	Московский институт электроники и математики им А.Н.Тихонова	6	832	0	https://miem.hse.ru/
55	Факультет права	6	384	20	https://pravo.hse.ru/
56	Высшая школа юриспруденции и администрирования	6	384	28	https://law.hse.ru/
57	Факультет гуманитарных наук	6	384	52	https://hum.hse.ru/
58	Факультет социальных наук	6	448	0	https://social.hse.ru/
59	Факультет креативных индустрий	6	304	132	https://cmd.hse.ru/
60	Факультет мировой экономики и мировой политики	6	320	140	https://we.hse.ru/
61	Факультет физики	6	832	0	https://physics.hse.ru/
63	Факультет городского и регионального развития	6	384	84	https://gorod.hse.ru/
65	Факультет биологии и биотехнологии	6	257	1088	https://biology.hse.ru/
67	Школа иностранных языков	6	388	0	https://lang.hse.ru/
69	Банковский институт	6	320	140	https://binst.hse.ru/
73	Факультет безопасности и таможни	7	384	92	https://spb.ranepa.ru/faculty/fbt/
71	Факультет государственного и муниципального управления	7	384	84	https://spb.ranepa.ru/faculty/fgmu/
75	Факультет международных отношений и политических исследований	7	272	134	https://spb.ranepa.ru/faculty/fmopi/
78	Факультет информационных технологий и анализа больших данных	8	320	520	https://www.fa.ru/university/structure/scientific-educational-departments/itabd/
80	Факультет налогов, аудита и бизнес-анализа	8	320	148	https://www.fa.ru/university/structure/scientific-educational-departments/naba/
82	Факультет экономики и бизнеса	8	320	140	https://www.fa.ru/university/structure-scientific-educational-departments/eib/
84	Юридический факультет	8	384	28	https://www.fa.ru/university/structure-scientific-educational-departments/ui/
86	Институт лазерных и плазменных технологий	9	320	520	http://laplas.mephi.ru/
88	Институт нанотехнологий в электронике, спинтронике и фотонике	9	320	520	https://nespi.mephi.ru/
90	Институт физико-технических интеллектуальных систем	9	320	520	http://iftis.mephi.ru/
92	Институт международных отношений	9	276	130	https://iirmephi.ru/website/ru/home
62	Международный институт экономики и финансов	6	324	0	https://icef.hse.ru/
64	Факультет химии	6	1344	0	https://chemistry.hse.ru/
66	Факультет географии и геоинформационных технологий	6	320	10	https://geography.hse.ru/
68	Институт статистических исследований и экономики знаний	6	448	0	https://issek.hse.ru/
70	Школа инноватики и предпринимательства	6	320	132	https://www.hse.ru/inman/
72	Факультет экономики и финансов	7	320	142	https://spb.ranepa.ru/faculty/fef/
74	Юридический факультет	7	400	0	https://spb.ranepa.ru/faculty/yuf/
76	Факультет социальных технологий	7	400	0	https://spb.ranepa.ru/faculty/fst/
77	Высшая школа управления	8	320	156	https://www.fa.ru/university/structure-scientific-educational-departments/vsu/
79	Факультет международных экономических отношений	8	320	148	https://www.fa.ru/university/structure-scientific-educational-departments/meo/
81	Факультет социальных наук и массов коммуникаций	8	384	92	https://www.fa.ru/university/structure-scientific-educational-departments/snmk/
83	Финансовый университет	8	320	148	https://www.fa.ru/university/structure-scientific-educational-departments/ff/

\.


--
-- TOC entry 4910 (class 0 OID 16455)
-- Dependencies: 220
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: uniuser
--

COPY public.subjects (id, name) FROM stdin;
\.


--
-- TOC entry 4908 (class 0 OID 16446)
-- Dependencies: 218
-- Data for Name: university; Type: TABLE DATA; Schema: public; Owner: uniuser
--

COPY public.university (id, name, cities) FROM stdin;
2	МГУ	{Пекин,Харбин,Синьчжу,Шанхай,Сычуань,Тяньцзинь,Ухань}
3	МГТУ им.Н.Э.Баумана	{Шанхай,Чунцин,Пекин,Харбин,Тяньцзинь,Гуанси,Сиань}
4	СПбПУ им.Петра Великого	{Пекин,Шанхай,Гонконг,Сиань,Харбин,Нанкин,Хунань}
8	Финансовый университет при Правительстве РФ	{Далянь,Ухань,Наньчан,Шаньдунь,Чанчунь,Далянь,Ляонин}
5	МГИМО МИД России	{Хейлунцзян,Гуанчжоу,Шанхай,Ухань,Гонконг,Сиань,Пекин,Казань}
6	НИУ "Высшая школа экономики"	{Пекин,Шанхай,Харбин,Гуанчжоу,Шэньчжэнь,Москва,Санкт-Петербург}
7	РАНХиГС при Президенте РФ	{Гуанчжоу,Шанхай,Пекин,Москва,Новосибирск,Сочи,Уфа,Санкт-Петербург}
9	НИЯУ МИФИ	{Москва,Астрахань,Брянск,Волгоград,Воронеж,Казань,Мурманск,"Нижний Новгород",Челябинск,Пермь,Омск,Санкт-Петербург,Сочи,Уфа}
10	ИТМО	{Пекин,Далянь,Шанхай,Нанкин,Наньчан,Гуанчжоу,Харбин,Ухань,Чанчунь}
\.


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 221
-- Name: program_id_seq; Type: SEQUENCE SET; Schema: public; Owner: uniuser
--

SELECT pg_catalog.setval('public.program_id_seq', 104, true);


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 219
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: uniuser
--

SELECT pg_catalog.setval('public.subjects_id_seq', 1, false);


--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 217
-- Name: university_id_seq; Type: SEQUENCE SET; Schema: public; Owner: uniuser
--

SELECT pg_catalog.setval('public.university_id_seq', 10, true);


--
-- TOC entry 4760 (class 2606 OID 16471)
-- Name: program program_pkey; Type: CONSTRAINT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.program
    ADD CONSTRAINT program_pkey PRIMARY KEY (id);


--
-- TOC entry 4758 (class 2606 OID 16462)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- TOC entry 4756 (class 2606 OID 16453)
-- Name: university university_pkey; Type: CONSTRAINT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.university
    ADD CONSTRAINT university_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 16472)
-- Name: program program_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.program
    ADD CONSTRAINT program_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.university(id);


-- Completed on 2025-12-14 23:13:57

--
-- PostgreSQL database dump complete
--

\unrestrict SDP5kz85h66Tq41joGOVK2TVZWh0wGaESQMVAEdpvJSJciHrSD2o4VtoM2NSJ4L



--
-- PostgreSQL database dump
--

\restrict SDP5kz85h66Tq41joGOVK2TVZWh0wGaESQMVAEdpvJSJciHrSD2o4VtoM2NSJ4L

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

-- Started on 2025-12-14 23:13:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16464)
-- Name: program; Type: TABLE; Schema: public; Owner: uniuser
--

CREATE TABLE public.program (
    id integer NOT NULL,
    name character varying,
    university_id integer,
    mask_required_all integer,
    mask_required_any integer,
    program_url character varying
);


ALTER TABLE public.program OWNER TO uniuser;

--
-- TOC entry 221 (class 1259 OID 16463)
-- Name: program_id_seq; Type: SEQUENCE; Schema: public; Owner: uniuser
--

CREATE SEQUENCE public.program_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.program_id_seq OWNER TO uniuser;

--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 221
-- Name: program_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uniuser
--

ALTER SEQUENCE public.program_id_seq OWNED BY public.program.id;


--
-- TOC entry 220 (class 1259 OID 16455)
-- Name: subjects; Type: TABLE; Schema: public; Owner: uniuser
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name character varying
);


ALTER TABLE public.subjects OWNER TO uniuser;

--
-- TOC entry 219 (class 1259 OID 16454)
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: uniuser
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO uniuser;

--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 219
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uniuser
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- TOC entry 218 (class 1259 OID 16446)
-- Name: university; Type: TABLE; Schema: public; Owner: uniuser
--

CREATE TABLE public.university (
    id integer NOT NULL,
    name character varying,
    cities text[]
);


ALTER TABLE public.university OWNER TO uniuser;

--
-- TOC entry 217 (class 1259 OID 16445)
-- Name: university_id_seq; Type: SEQUENCE; Schema: public; Owner: uniuser
--

CREATE SEQUENCE public.university_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.university_id_seq OWNER TO uniuser;

--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 217
-- Name: university_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uniuser
--

ALTER SEQUENCE public.university_id_seq OWNED BY public.university.id;


--
-- TOC entry 4754 (class 2604 OID 16467)
-- Name: program id; Type: DEFAULT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.program ALTER COLUMN id SET DEFAULT nextval('public.program_id_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 16458)
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 16449)
-- Name: university id; Type: DEFAULT; Schema: public; Owner: uniuser
--

ALTER TABLE ONLY public.university ALTER COLUMN id SET DEFAULT nextval('public.university_id_seq'::regclass);


--
-- TOC entry 4912 (class 0 OID 16464)
-- Dependencies: 222
-- Data for Name: program; Type: TABLE DATA; Schema: public; Owner: uniuser
--

COPY public.program (id, name, university_id, mask_required_all, mask_required_any, program_url) FROM stdin;
53	Факультет физмат и компьютерных наук	6	328	0	https://spb.hse.ru/shift/1c/facultet
54	Высшая школа бизнеса	6	324	0	https://gsb.hse.ru/
3	Физический факультет	2	832	0	https://www.phys.msu.ru/
4	Факультет наук о материалах	2	832	0	https://msu.ru/divisions/faculteti/colmat
5	Факультет вычислительной математики и кибернетики	2	320	520	https://cs.msu.ru/node/3163
6	Биологический факультет	2	320	1025	https://bio.msu.ru/
7	Химический факультет	2	1344	513	https://www.chem.msu.ru/
8	Факультет почвоведения	2	1	1610	https://soil.msu.ru/
9	Факультет биоинженерии и биоинформатики	2	1345	0	https://fbb.msu.ru/
10	Филологический факультет	2	288	20	https://www.philol.msu.ru/
11	Факультет журналистики	2	288	148	https://www.journ.msu.ru/
12	Факультет психологии	2	385	0	https://psy-msu.ru/
13	Экономический факультет	2	320	140	https://www.econ.msu.ru/
14	Механико-математический факультет	2	832	0	https://msu.ru/divisions/faculteti/mechmath
15	Факультет мировой политики	2	272	134	https://fmp.msu.ru/
16	Информатика и системы управления	3	320	520	https://bmstu.ru/faculty/iu
17	Инженерный бизнес и менеджмент	3	320	136	https://bmstu.ru/faculty/ebm
18	Машиностроительные технологии	3	832	0	http://mt.bmstu.ru/
19	Специальное машиностроение	3	320	520	https://sm.bmstu.ru/
20	Биомедицинская техника	3	320	513	http://www.bmt.bmstu.ru/
21	Радиоэлектроника и лазерная техника	3	832	0	https://rlm.bmstu.ru/f_rl.html
22	Энергомашиностроение	3	832	0	http://energet.bmstu.ru/
23	Робототехника и комплексная автоматизация	3	832	0	http://rk.bmstu.ru/
24	Фундаментальные науки	3	320	520	https://bmstu.ru/faculty/fn
25	Лингвистика	3	260	144	https://bmstu.ru/faculty/lingvistika
26	Безопасность в цифровом мире	3	320	520	https://bmstu.ru/faculty/ur
27	Социальные и гуманитарные науки	3	385	92	http://fsgn.bmstu.ru/
28	Гуманитарный институт	4	388	0	https://hum.spbstu.ru/
29	Инженерно-строительный институт	4	832	0	https://ice.spbstu.ru/
30	Институт биомедицинских систем и биотехнологий	4	320	1537	https://ibmst.spbstu.ru/
31	Институт компьютерных наук и кибербезопасности	4	320	520	https://iccs.spbstu.ru/
32	Институт машиностроения, материалов и транспорта	4	320	520	https://immit.spbstu.ru/
33	Институт физики и математики	4	320	520	https://phmath.spbstu.ru/
34	Институт физической культуры, спорта и туризма	4	385	0	https://ifkst.spbstu.ru/
35	Институт электроники и телекоммуникаций	4	320	520	https://et.spbstu.ru/
36	Институт энергетики	4	832	0	https://ie.spbstu.ru/
37	Физико-механический институт	4	320	520	https://physmech.spbstu.ru/
38	Институт промышленного менеджмента, экономики и торговли	4	320	520	https://imet.spbstu.ru/
39	Факультет международных отношений	5	276	0	https://mgimo.ru/study/faculty/mo/
40	Международно-правовой факультет	5	388	0	https://mgimo.ru/study/faculty/mp/
41	Факультет международных экономических отношений	5	324	0	https://mgimo.ru/study/faculty/meo/
42	Факультет международной журналистики	5	292	0	https://mgimo.ru/study/faculty/journalism/
43	Факультет международного бизнеса	5	324	0	https://mgimo.ru/study/faculty/mbda/
44	Факультет международной торговли и устойчивого развития	5	324	0	https://mgimo.ru/study/faculty/imtur/
45	Факультет управления и политики	5	276	0	https://mgimo.ru/study/faculty/sgp/
46	Международный институт энергетической политики и дипломатии	5	276	0	https://mgimo.ru/study/faculty/miep/
47	Факультет лингвистики и межкультурной коммуникации	5	260	48	https://mgimo.ru/study/faculty/flmk/
48	Факультет финансовой экономики	5	324	0	https://mgimo.ru/study/faculty/ffe/
49	Факультет маркетинга и предпринимательства	5	324	0	https://mgimo.ru/study/faculty/marketing/
50	Факультет математики	6	320	520	https://math.hse.ru/
51	Факультет экономических наук	6	320	140	https://economics.hse.ru/
52	Московский институт электроники и математики им А.Н.Тихонова	6	832	0	https://miem.hse.ru/
55	Факультет права	6	384	20	https://pravo.hse.ru/
56	Высшая школа юриспруденции и администрирования	6	384	28	https://law.hse.ru/
57	Факультет гуманитарных наук	6	384	52	https://hum.hse.ru/
58	Факультет социальных наук	6	448	0	https://social.hse.ru/
59	Факультет креативных индустрий	6	304	132	https://cmd.hse.ru/
60	Факультет мировой экономики и мировой политики	6	320	140	https://we.hse.ru/
61	Факультет физики	6	832	0	https://physics.hse.ru/
63	Факультет городского и регионального развития	6	384	84	https://gorod.hse.ru/
65	Факультет биологии и биотехнологии	6	257	1088	https://biology.hse.ru/
67	Школа иностранных языков	6	388	0	https://lang.hse.ru/
69	Банковский институт	6	320	140	https://binst.hse.ru/
73	Факультет безопасности и таможни	7	384	92	https://spb.ranepa.ru/faculty/fbt/
71	Факультет государственного и муниципального управления	7	384	84	https://spb.ranepa.ru/faculty/fgmu/
75	Факультет международных отношений и политических исследований	7	272	134	https://spb.ranepa.ru/faculty/fmopi/
78	Факультет информационных технологий и анализа больших данных	8	320	520	https://www.fa.ru/university/structure/scientific-educational-departments/itabd/
80	Факультет налогов, аудита и бизнес-анализа	8	320	148	https://www.fa.ru/university/structure/scientific-educational-departments/naba/
82	Факультет экономики и бизнеса	8	320	140	https://www.fa.ru/university/structure/scientific-educational-departments/eib/
84	Юридический факультет	8	384	28	https://www.fa.ru/university/structure/scientific-educational-departments/ui/
86	Институт лазерных и плазменных технологий	9	320	520	http://laplas.mephi.ru/
88	Институт нанотехнологий в электронике, спинтронике и фотонике	9	320	520	https://nespi.mephi.ru/
90	Институт физико-технических интеллектуальных систем	9	320	520	http://iftis.mephi.ru/
92	Институт международных отношений	9	276	130	https://iirmephi.ru/website/ru/home
62	Международный институт экономики и финансов	6	324	0	https://icef.hse.ru/
64	Факультет химии	6	1344	0	https://chemistry.hse.ru/
66	Факультет географии и геоинформационных технологий	6	320	10	https://geography.hse.ru/
68	Институт статистических исследований и экономики знаний	6	448	0	https://issek.hse.ru/
70	Школа инноватики и предпринимательства	6	320	132	https://www.hse.ru/inman/
72	Факультет экономики и финансов	7	320	142	https://spb.ranepa.ru/faculty/fef/
74	Юридический факультет	7	400	0	https://spb.ranepa.ru/faculty/yuf/
76	Факультет социальных технологий	7	400	0	https://spb.ranepa.ru/faculty/fst/
77	Высшая школа управления	8	320	156	https://www.fa.ru/university/structure/scientific-educational-departments/vsu/
79	Факультет международных экономических отношений	8	320	148	https://www.fa.ru/university/structure/scientific-educational-departments/meo/
81	Факультет социальных наук и массов коммуникаций	8	384	92	https://www.fa.ru/university/structure/scientific-educational-departments/snmk/
83	Финансовый университет	8	320	148	https://www.fa.ru/university/structure-scientific-educational-departments/ff/