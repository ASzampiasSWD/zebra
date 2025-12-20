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
 printer_type varchar(50) PRIMARY KEY,
 printer_manufacturer varchar(50) NOT NULL,
 current_cost numeric(10, 2) DEFAULT 0.00,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printers(
 serial_number_id varchar(50) PRIMARY KEY,
 printer_type varchar(100) REFERENCES printer_types(printer_type),
 warranty_start_date date DEFAULT NULL,
 warranty_end_date date DEFAULT NULL,
 is_active boolean DEFAULT true,
 decommissioned_date date DEFAULT NULL,
 times_worked_on integer DEFAULT 0,
 money_spent_on_repairs numeric(10, 2) DEFAULT 0.00,
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printer_parts(
 printer_part_id varchar(50) PRIMARY KEY,
 printer_part_name varchar(100) NOT NULL, 
 printer_type varchar(50) REFERENCES printer_types(printer_type),
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
 printer_type varchar(100) REFERENCES printer_types(printer_type) NOT NULL,
 user_id varchar(100) REFERENCES users(user_id) NOT NULL,
 assist_id varchar(100) REFERENCES users(user_id) DEFAULT NULL,
 printer_location varchar(100) NOT NULL,
 station_number varchar(50) NULL, 
 time_worked_on integer NOT NULL,
 comments varchar(100),
 money_saved numeric(10, 2) DEFAULT 0.00, 
 date_time_fixed timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO organizations VALUES ('ORF3', '2020 Northgate Commerce Pkwy', 'Suffolk', 'VA', '23435', 'USA');
INSERT INTO organizations VALUES ('ORF2', '5045 Portsmouth Blvd', 'Chesapeake', 'VA', '23321', 'USA');
INSERT INTO organizations VALUES ('ORF4', '1795 Dam Neck Rd', 'Virginia Beach', 'VA', '23453', 'USA');
INSERT INTO organizations VALUES ('SVA2', '2000 Enterprise Pkwy', 'Hampton', 'VA', '23666', 'USA');
INSERT INTO users VALUES ('szampiam', 'ORF3', 'Amanda', 'Szampias');
INSERT INTO printer_types VALUES ('SLAM Printer', 'Zebra', '2200');
INSERT INTO printer_types VALUES ('RFID Printer', 'Zebra', '1000');
INSERT INTO printer_types VALUES ('PSlip Printer', 'Zebra', '2200');
INSERT INTO printer_types VALUES ('ASIN Mobile Carts Printer', 'Zebra', '700');
INSERT INTO ISSUES VALUES (DEFAULT, 'Dirty Roller');
INSERT INTO ISSUES VALUES (DEFAULT, 'Broken Media Rewind Spindle');
INSERT INTO ISSUES VALUES (DEFAULT, 'Configuration Issue');
INSERT INTO ISSUES VALUES (DEFAULT, 'Calibration Issue');
INSERT INTO printer_parts VALUES ('P1058930-058', 'Media Rewind Spindle', 'SLAM Printer', '263.55', 1);
INSERT INTO printer_parts VALUES ('P1058930-078', 'Printer Boots', 'SLAM Printer', '12.00', 1);
INSERT INTO printer_parts VALUES ('P1058930-010', 'Printhead 300DPI', 'SLAM Printer', '213.70', 1);
INSERT INTO printer_parts VALUES ('P1058930-080', 'Platen Roller', 'SLAM Printer', '61.91', 1);
INSERT INTO printer_parts VALUES ('79867M', 'Driver Belt 300DPI', 'SLAM Printer', '30.96', 1);
INSERT INTO printers VALUES ('99J204901059', 'SLAM Printer', '2021-01-13', '2022-01-13');
INSERT INTO repairs VALUES (DEFAULT, '99J204901059', 'SLAM Printer', 'szampiam', NULL, 'IT Cage', NULL, 45, NULL, 263.55);
INSERT INTO repairs VALUES (DEFAULT, '99J204901059', 'SLAM Printer', 'szampiam', NULL, 'Singles', '4-11', 45, 'boots', 555.55);