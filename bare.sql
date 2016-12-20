--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: email_tokens; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE email_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    date_created timestamp with time zone DEFAULT now() NOT NULL,
    date_cancelled timestamp with time zone,
    date_consumed timestamp with time zone
);


ALTER TABLE email_tokens OWNER TO millerkonsult_supreme;

--
-- Name: email_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: millerkonsult_supreme
--

CREATE SEQUENCE email_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE email_tokens_id_seq OWNER TO millerkonsult_supreme;

--
-- Name: email_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: millerkonsult_supreme
--

ALTER SEQUENCE email_tokens_id_seq OWNED BY email_tokens.id;


--
-- Name: invite_roles; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE invite_roles (
    invite_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE invite_roles OWNER TO millerkonsult_supreme;

--
-- Name: invites; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE invites (
    id integer NOT NULL,
    email text NOT NULL,
    date_created timestamp with time zone DEFAULT now() NOT NULL,
    created_by_id integer,
    date_modified timestamp with time zone,
    date_consumed timestamp with time zone,
    token text NOT NULL
);


ALTER TABLE invites OWNER TO millerkonsult_supreme;

--
-- Name: invites_id_seq; Type: SEQUENCE; Schema: public; Owner: millerkonsult_supreme
--

CREATE SEQUENCE invites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invites_id_seq OWNER TO millerkonsult_supreme;

--
-- Name: invites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: millerkonsult_supreme
--

ALTER SEQUENCE invites_id_seq OWNED BY invites.id;


--
-- Name: password_tokens; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE password_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    date_created timestamp with time zone DEFAULT now() NOT NULL,
    date_cancelled timestamp with time zone,
    date_consumed timestamp with time zone
);


ALTER TABLE password_tokens OWNER TO millerkonsult_supreme;

--
-- Name: password_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: millerkonsult_supreme
--

CREATE SEQUENCE password_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE password_tokens_id_seq OWNER TO millerkonsult_supreme;

--
-- Name: password_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: millerkonsult_supreme
--

ALTER SEQUENCE password_tokens_id_seq OWNED BY password_tokens.id;


--
-- Name: permission_roles; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE permission_roles (
    permission_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE permission_roles OWNER TO millerkonsult_supreme;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE permissions (
    id integer NOT NULL,
    regex text NOT NULL,
    date_created timestamp with time zone DEFAULT now(),
    created_by_id integer NOT NULL,
    date_modified timestamp with time zone
);


ALTER TABLE permissions OWNER TO millerkonsult_supreme;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: millerkonsult_supreme
--

CREATE SEQUENCE permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE permissions_id_seq OWNER TO millerkonsult_supreme;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: millerkonsult_supreme
--

ALTER SEQUENCE permissions_id_seq OWNED BY permissions.id;


--
-- Name: publishers; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE publishers (
    id integer NOT NULL,
    name character varying(64) NOT NULL,
    legal_name character varying(64),
    url character varying(128) NOT NULL,
    date_created timestamp with time zone DEFAULT now() NOT NULL,
    created_by_id integer NOT NULL,
    date_modified timestamp with time zone
);


ALTER TABLE publishers OWNER TO millerkonsult_supreme;

--
-- Name: publishers_id_seq; Type: SEQUENCE; Schema: public; Owner: millerkonsult_supreme
--

CREATE SEQUENCE publishers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE publishers_id_seq OWNER TO millerkonsult_supreme;

--
-- Name: publishers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: millerkonsult_supreme
--

ALTER SEQUENCE publishers_id_seq OWNED BY publishers.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE roles (
    id integer NOT NULL,
    name character varying(64) NOT NULL,
    date_created timestamp with time zone DEFAULT now() NOT NULL,
    created_by_id integer NOT NULL,
    date_modified timestamp with time zone
);


ALTER TABLE roles OWNER TO millerkonsult_supreme;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: millerkonsult_supreme
--

CREATE SEQUENCE roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE roles_id_seq OWNER TO millerkonsult_supreme;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: millerkonsult_supreme
--

ALTER SEQUENCE roles_id_seq OWNED BY roles.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE user_roles OWNER TO millerkonsult_supreme;

--
-- Name: users; Type: TABLE; Schema: public; Owner: millerkonsult_supreme
--

CREATE TABLE users (
    id integer NOT NULL,
    given_name character varying(64) NOT NULL,
    family_name character varying(64) NOT NULL,
    email character varying(254) NOT NULL,
    password character varying(256) NOT NULL,
    last_activity timestamp without time zone,
    last_login timestamp without time zone,
    date_created timestamp without time zone DEFAULT timezone('utc'::text, now()),
    login_attempts integer DEFAULT 0,
    date_banned timestamp without time zone,
    banned_by_id integer,
    date_blocked timestamp without time zone,
    blocked_by_id integer,
    date_muted timestamp without time zone,
    muted_by_id integer,
    date_verified timestamp without time zone,
    verified_by_id integer,
    date_email_verified timestamp with time zone
);


ALTER TABLE users OWNER TO millerkonsult_supreme;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: millerkonsult_supreme
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO millerkonsult_supreme;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: millerkonsult_supreme
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: email_tokens id; Type: DEFAULT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY email_tokens ALTER COLUMN id SET DEFAULT nextval('email_tokens_id_seq'::regclass);


--
-- Name: invites id; Type: DEFAULT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY invites ALTER COLUMN id SET DEFAULT nextval('invites_id_seq'::regclass);


--
-- Name: password_tokens id; Type: DEFAULT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY password_tokens ALTER COLUMN id SET DEFAULT nextval('password_tokens_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY permissions ALTER COLUMN id SET DEFAULT nextval('permissions_id_seq'::regclass);


--
-- Name: publishers id; Type: DEFAULT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY publishers ALTER COLUMN id SET DEFAULT nextval('publishers_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY roles ALTER COLUMN id SET DEFAULT nextval('roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: email_tokens email_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY email_tokens
    ADD CONSTRAINT email_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_tokens email_tokens_unique; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY email_tokens
    ADD CONSTRAINT email_tokens_unique UNIQUE (user_id, email);


--
-- Name: invite_roles invite_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY invite_roles
    ADD CONSTRAINT invite_roles_pkey PRIMARY KEY (invite_id, role_id);


--
-- Name: invites invites_email_key; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY invites
    ADD CONSTRAINT invites_email_key UNIQUE (email);


--
-- Name: invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: password_tokens password_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY password_tokens
    ADD CONSTRAINT password_tokens_pkey PRIMARY KEY (id);

--
-- Name: permission_roles permission_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY permission_roles
    ADD CONSTRAINT permission_roles_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (id);


--
-- Name: publishers publishers_url_key; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY publishers
    ADD CONSTRAINT publishers_url_key UNIQUE (url);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: fki_roles_created_by_id_fkey; Type: INDEX; Schema: public; Owner: millerkonsult_supreme
--

CREATE INDEX fki_roles_created_by_id_fkey ON roles USING btree (created_by_id);


--
-- Name: fki_user_roles_role_fkey; Type: INDEX; Schema: public; Owner: millerkonsult_supreme
--

CREATE INDEX fki_user_roles_role_fkey ON user_roles USING btree (role_id);


--
-- Name: email_tokens email_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY email_tokens
    ADD CONSTRAINT email_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invite_roles invite_roles_invite_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY invite_roles
    ADD CONSTRAINT invite_roles_invite_id_fkey FOREIGN KEY (invite_id) REFERENCES invites(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invite_roles invite_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY invite_roles
    ADD CONSTRAINT invite_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invites invites_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY invites
    ADD CONSTRAINT invites_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: password_tokens password_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY password_tokens
    ADD CONSTRAINT password_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: permission_roles permission_roles_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY permission_roles
    ADD CONSTRAINT permission_roles_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permission_roles permission_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY permission_roles
    ADD CONSTRAINT permission_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions permissions_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY permissions
    ADD CONSTRAINT permissions_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: publishers publishers_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY publishers
    ADD CONSTRAINT publishers_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: roles roles_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_banned_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_banned_by_id_fkey FOREIGN KEY (banned_by_id) REFERENCES users(id);


--
-- Name: users users_blocked_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_blocked_by_id_fkey FOREIGN KEY (blocked_by_id) REFERENCES users(id);


--
-- Name: users users_muted_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_muted_by_id_fkey FOREIGN KEY (muted_by_id) REFERENCES users(id);


--
-- Name: users users_verified_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: millerkonsult_supreme
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_verified_by_id_fkey FOREIGN KEY (verified_by_id) REFERENCES users(id);


--
-- PostgreSQL database dump complete
--

