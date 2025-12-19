CREATE TABLE organizations(
 org_id varchar(20) PRIMARY KEY,
 street_name varchar(50) NOT NULL,
 city varchar(50) NOT NULL,
 us_state varchar(2), 
 zip_code varchar(11) NOT NULL,
 country varchar(50) NOT NULL, 
 total_it_employees integer DEFAULT 0,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
 user_id varchar(50) PRIMARY KEY,
 org_id varchar(20) REFERENCES organizations(org_id) NOT NULL,
 first_name varchar(100) NOT NULL,
 last_name varchar(100) NOT NULL,
 is_active boolean DEFAULT TRUE,
 total_printers_saved integer DEFAULT 0,
 total_money_saved numeric(10, 2) DEFAULT 0.00,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printer_types(
 printer_type_id varchar(50) PRIMARY KEY,
 printer_manufacturer varchar(50) NOT NULL,
 current_cost numeric(10, 2) DEFAULT 0.00,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printers(
 serial_number_id varchar(50) PRIMARY KEY,
 printer_type varchar(100) REFERENCES printer_types(printer_type_id),
 times_worked_on integer DEFAULT 0,
 money_spent_on_repairs numeric(10, 2) DEFAULT 0.00,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printer_parts(
 printer_part_id varchar(50) PRIMARY KEY,
 printer_part_name varchar(100) NOT NULL, 
 printer_type varchar(50) REFERENCES printer_types(printer_type_id),
 current_cost numeric(10, 2) DEFAULT 0.00,
 total_printer_parts integer DEFAULT 0,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
 UNIQUE (printer_part_name, printer_type)
);

CREATE TABLE issues(
 issue_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 issue_description varchar(50) UNIQUE NOT NULL
);

CREATE TABLE repairs(
 repair_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 serial_number_id varchar(50) REFERENCES printers(serial_number_id) NOT NULL,
 printer_type varchar(100) REFERENCES printer_types(printer_type_id) NOT NULL,
 user_id varchar(100) REFERENCES users(user_id) NOT NULL,
 assist_id varchar(100) REFERENCES users(user_id) DEFAULT NULL,
 printer_part_id varchar(100) REFERENCES printer_parts(printer_part_id) DEFAULT NULL,
 printer_location varchar(100) NOT NULL,
 station_number varchar(50) NULL, 
 time_worked_on integer NOT NULL,
 issue_id integer REFERENCES issues(issue_id) NOT NULL,
 money_saved numeric(10, 2) DEFAULT 0.00, 
 date_time_fixed timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO organizations VALUES ('ORF3', '2020 Northgate Commerce Pkwy', 'Suffolk', 'VA', '23435', 'USA');
INSERT INTO organizations VALUES ('ORF2', '5045 Portsmouth Blvd', 'Chesapeake', 'VA', '23321', 'USA');
INSERT INTO organizations VALUES ('ORF4', '1795 Dam Neck Rd', 'Virginia Beach', 'VA', '23453', 'USA');
INSERT INTO organizations VALUES ('SVA2', '2000 Enterprise Pkwy', 'Hampton', 'VA', '23666', 'USA');
INSERT INTO users VALUES ('szampiam', 'ORF3', 'Amanda', 'Szampias');
INSERT INTO printer_types VALUES ('ZT411 SLAM Printer', 'Zebra');
INSERT INTO printer_types VALUES ('ZT411 RFID Printer', 'Zebra');
INSERT INTO printer_types VALUES ('ZD261 PSlip Printer', 'Zebra');
INSERT INTO printer_types VALUES ('ZD620 ASIN Mobile Carts Printer', 'Zebra');
INSERT INTO ISSUES VALUES (DEFAULT, 'Dirty Roller');
INSERT INTO ISSUES VALUES (DEFAULT, 'Broken Media Rewind Spindle');
INSERT INTO ISSUES VALUES (DEFAULT, 'Configuration Issue');
INSERT INTO ISSUES VALUES (DEFAULT, 'Calibration Issue');
INSERT INTO printer_parts VALUES ('P1058930-058', 'Media Rewind Spindle', 'ZT411', '263.55', 1);
INSERT INTO printers VALUES ('ZT92022290', 'ZT411');
INSERT INTO repairs VALUES (DEFAULT, 'ZT92022290', 'ZT411', 'szampiam', NULL, 'P1058930-058', 'IT Cage', NULL, 45, 1, 263.55);