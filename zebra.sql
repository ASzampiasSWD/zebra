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

CREATE TABLE product_prices(
 product_price_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 updated_by varchar(100) REFERENCES users(user_id) NOT NULL,
 price numeric(10, 2) NOT NULL,
 start_date timestamp DEFAULT CURRENT_TIMESTAMP,
 end_date timestamp DEFAULT NULL,
 referer varchar(200) DEFAULT NULL,
 url_location varchar(200) DEFAULT NULL
);

CREATE TABLE printer_types(
 printer_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 product_price_id int REFERENCES product_prices(product_price_id),
 printer_type_name varchar(50) UNIQUE NOT NULL,
 printer_manufacturer varchar(50) NOT NULL,
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
 product_price_id int REFERENCES product_prices(product_price_id),
 printer_part_name varchar(100) NOT NULL, 
 popularity_score int NOT NULL, 
 created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE printer_parts_used_for_printer_type(
  printer_part_id varchar(50) REFERENCES printer_parts(printer_part_id) NOT NULL,
  printer_type_id int REFERENCES printer_types(printer_type_id) NOT NULL,
  UNIQUE (printer_part_id, printer_type_id)
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
INSERT INTO organizations VALUES ('ORF5', '2150 Enterprise Dr', 'Suffolk', 'VA', '23434', 'USA');
INSERT INTO organizations VALUES ('SVA2', '2000 Enterprise Pkwy', 'Hampton', 'VA', '23666', 'USA');
INSERT INTO users VALUES ('szampiam', 'ORF3', 'Amanda', 'Szampias');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '1269.79', DEFAULT, NULL, 'DSCS', 'images/prices/SLAM-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 1, 'SLAM Printer', 'Zebra');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '1895.17', DEFAULT, NULL, 'DSCS', 'images/prices/RFID-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 2, 'RFID Printer', 'Zebra');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '355.33', DEFAULT, NULL, 'DSCS', 'images/prices/PSlip-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 3,  'PSlip Printer', 'Zebra');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '346.56', DEFAULT, NULL, 'DSCS', 'images/prices/ASIN-MC-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 4, 'ASIN Mobile Carts Printer', 'Zebra');

INSERT INTO ISSUES VALUES (DEFAULT, 'Broken Parts', 10);
INSERT INTO ISSUES VALUES (DEFAULT, 'Dirty Roller', 20);
INSERT INTO ISSUES VALUES (DEFAULT, 'Config and Calibration Issue', 30);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '213.70', DEFAULT, NULL, 'DSCS', 'images/prices/P1058930-010_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-010', 5, 'Printhead', 10); /* SLAM Printer, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-010', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-010', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '33.07', DEFAULT, NULL, 'DSCS', 'images/prices/P1058930-080_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-080', 6, 'Platen Roller', 20);  /* SLAM Printer, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-080', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-080', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '30.96', DEFAULT, NULL, 'Coupa', 'images/prices/79867M_01-18-2026.png');
INSERT INTO printer_parts VALUES ('79867M', 7, 'Driver Belt', 30); /* SLAM Printer, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('79867M', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('79867M', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '262.00', DEFAULT, NULL, 'Coupa', 'images/prices/P1105147-007_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1105147-007', 8, 'Motherboard', 40); /* SLAM Printer, RFID Printer?? */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1105147-007', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1105147-007', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '274.99', DEFAULT, NULL, 'Coupa', 'images/prices/P1058930-058_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-058', 9, 'Media Rewind Spindle', 50); /* SLAM Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-058', 1);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '12.00', DEFAULT, NULL, 'Zebra Store', 'images/prices/P1058930-078_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-078', 10, 'Printer Boots', 500); /* SLAM PRINTER, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-078', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-078', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '161.27', DEFAULT, NULL, 'DSCS', 'images/prices/P1112640-241_01-18-2026.png');
INSERT INTO printer_parts VALUES('P1112640-241', 11, 'Printhead', 10);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-241', 3);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-241', 4);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '29.90', DEFAULT, NULL, 'Coupa', 'images/prices/P1112640-251_01-18-2026.png');
INSERT INTO printer_parts VALUES('P1112640-251', 12, 'Platen Roller', 20); /* PSlip Printer, ASIN MC */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-251', 3);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-251', 4);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '5.00', DEFAULT, NULL, 'Coupa', 'images/prices/PSprings-PSlip-MC_01-18-2026.png');
INSERT INTO printer_parts VALUES('PSprings-PSlip-MC', 13, 'Springs', 30); /* PSlip Printer, ASIN MC */
INSERT INTO printer_parts_used_for_printer_type VALUES ('PSprings-PSlip-MC', 3);
INSERT INTO printer_parts_used_for_printer_type VALUES ('PSprings-PSlip-MC', 4);
