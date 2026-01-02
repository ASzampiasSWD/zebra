CREATE TABLE organizations(
 org_id varchar(20) PRIMARY KEY,
 street_name varchar(50) NOT NULL,
 city varchar(50) NOT NULL,
 us_state varchar(2), 
 zip_code varchar(11) NOT NULL,
 country varchar(50) NOT NULL, 
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
 user_id varchar(50) PRIMARY KEY,
 org_id varchar(20) REFERENCES organizations(org_id) NOT NULL,
 first_name varchar(100) NOT NULL,
 last_name varchar(100) NOT NULL,
 is_active boolean DEFAULT TRUE,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printer_types(
 printer_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 printer_type_name varchar(50) UNIQUE NOT NULL,
 printer_manufacturer varchar(50) NOT NULL,
 current_cost numeric(10, 2) DEFAULT 0.00,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printers(
 serial_number_id varchar(50) PRIMARY KEY,
 printer_type_id int REFERENCES printer_types(printer_type_id),
 warranty_start_date date DEFAULT NULL,
 warranty_end_date date DEFAULT NULL,
 is_active boolean DEFAULT true,
 decommissioned_date date DEFAULT NULL,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printer_parts(
 printer_part_id varchar(50) PRIMARY KEY,
 printer_type_id int REFERENCES printer_types(printer_type_id),
 printer_part_name varchar(100) NOT NULL, 
 current_cost numeric(10, 2) DEFAULT 0.00,
 popularity_score int NOT NULL, 
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
 UNIQUE (printer_part_name, printer_type_id)
);

CREATE TABLE issues(
 issue_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 issue_description varchar(50) UNIQUE NOT NULL,
 popularity_score int NOT NULL
);

CREATE TABLE repairs(
 repair_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 serial_number_id varchar(50) REFERENCES printers(serial_number_id) NOT NULL,
 user_id varchar(100) REFERENCES users(user_id) NOT NULL,
 assist_id varchar(100) REFERENCES users(user_id) DEFAULT NULL,
 printer_location varchar(100) NOT NULL,
 station_number varchar(50) NULL, 
 time_worked_on integer NOT NULL,
 comments varchar(100),
 repair_cost numeric(10, 2) DEFAULT 0.00,
 money_saved numeric(10, 2) DEFAULT 0.00, 
 date_time_fixed timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE issues_resolved_on_repair(
 repair_id int REFERENCES repairs(repair_id) NOT NULL,
 issue_id int REFERENCES issues(issue_id) NOT NULL,
 UNIQUE (repair_id, issue_id)
);

CREATE TABLE printer_parts_used_for_repair(
 repair_id int REFERENCES repairs(repair_id) NOT NULL,
 printer_part_id varchar(50) REFERENCES printer_parts(printer_part_id) NOT NULL,
 UNIQUE (repair_id, printer_part_id)
);


INSERT INTO organizations VALUES ('ORF3', '2020 Northgate Commerce Pkwy', 'Suffolk', 'VA', '23435', 'USA');
INSERT INTO organizations VALUES ('ORF2', '5045 Portsmouth Blvd', 'Chesapeake', 'VA', '23321', 'USA');
INSERT INTO organizations VALUES ('ORF4', '1795 Dam Neck Rd', 'Virginia Beach', 'VA', '23453', 'USA');
INSERT INTO organizations VALUES ('SVA2', '2000 Enterprise Pkwy', 'Hampton', 'VA', '23666', 'USA');
INSERT INTO users VALUES ('szampiam', 'ORF3', 'Amanda', 'Szampias');
INSERT INTO printer_types VALUES (DEFAULT, 'SLAM Printer', 'Zebra', '1402.00');
INSERT INTO printer_types VALUES (DEFAULT, 'RFID Printer', 'Zebra', '2443.00');
INSERT INTO printer_types VALUES (DEFAULT, 'PSlip Printer', 'Zebra', '341.66');
INSERT INTO printer_types VALUES (DEFAULT, 'ASIN Mobile Carts Printer', 'Zebra', '333.35');
INSERT INTO ISSUES VALUES (DEFAULT, 'Broken Parts', 10);
INSERT INTO ISSUES VALUES (DEFAULT, 'Dirty Roller', 20);
INSERT INTO ISSUES VALUES (DEFAULT, 'Config and Calibration Issue', 30);
INSERT INTO ISSUES VALUES (DEFAULT, 'Speed Settings', 40);
INSERT INTO printer_parts VALUES ('P1058930-010', 1, 'Printhead', '213.70', 10);
INSERT INTO printer_parts VALUES ('P1058930-080', 1, 'Platen Roller', '61.91', 20);
INSERT INTO printer_parts VALUES ('79867M', 1, 'Driver Belt', '30.96', 30);
INSERT INTO printer_parts VALUES ('P1105147-007', 1, 'Motherboard', '249.00', 40);
INSERT INTO printer_parts VALUES ('P1058930-058', 1, 'Media Rewind Spindle', '263.55', 50);
INSERT INTO printer_parts VALUES ('P1058930-078', 1, 'Printer Boots', '12.00', 500);
INSERT INTO printers VALUES ('99J204901059', 1, '2021-01-13', '2022-01-13');
INSERT INTO repairs VALUES (DEFAULT, '99J204901059', 'szampiam', NULL, 'IT Cage', NULL, 45, NULL, 263.55);
INSERT INTO repairs VALUES (DEFAULT, '99J204901059', 'szampiam', NULL, 'Singles', '4-11', 45, 'boots', 555.55);