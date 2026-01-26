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
 assigned_to varchar(100) NOT NULL,
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
 image_url varchar(200) DEFAULT NULL,
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
INSERT INTO users VALUES ('shecacho', 'ORF3', 'Shenna', 'Cacho');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'SLAM Printer', '1269.79', '2026-01-01 00:00:00.000000+00', NULL, 'DSCS', 'images/prices/SLAM-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 1, 'SLAM Printer', 'Zebra');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'RFID Printer', '1895.17', '2026-01-01 00:00:00.000000+00', NULL, 'DSCS', 'images/prices/RFID-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 2, 'RFID Printer', 'Zebra');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'PSlip Printer', '355.33', '2026-01-01 00:00:00.000000+00', NULL, 'DSCS', 'images/prices/PSlip-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 3, 'PSlip Printer', 'Zebra');

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'ASIN Mobile Carts Printer', '346.56', '2026-01-01 00:00:00.000000+00', NULL, 'DSCS', 'images/prices/ASIN-MC-Printer_01-18-2026.png');
INSERT INTO printer_types VALUES (DEFAULT, 4, 'ASIN Mobile Carts Printer', 'Zebra');

INSERT INTO ISSUES VALUES (DEFAULT, 'Broken Parts', 10);
INSERT INTO ISSUES VALUES (DEFAULT, 'Dirty Roller', 20);
INSERT INTO ISSUES VALUES (DEFAULT, 'Config and Calibration Issue', 30);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'P1058930-010', '213.70', '2026-01-01 00:00:00.000000+00', NULL, 'DSCS', 'images/prices/P1058930-010_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-010', 5, 'Printhead', 10); /* SLAM Printer, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-010', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-010', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'P1058930-080', '33.07', '2026-01-01 00:00:00.000000+00', NULL, 'DSCS', 'images/prices/P1058930-080_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-080', 6, 'Platen Roller', 20);  /* SLAM Printer, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-080', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-080', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam',  '79867M', '30.96', '2026-01-01 00:00:00.000000+00', NULL, 'Coupa', 'images/prices/79867M_01-18-2026.png');
INSERT INTO printer_parts VALUES ('79867M', 7, 'Driver Belt', 30); /* SLAM Printer, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('79867M', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('79867M', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'P1105147-007', '262.00', '2026-01-01 00:00:00.000000+00', NULL, 'Coupa', 'images/prices/P1105147-007_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1105147-007', 8, 'Motherboard', 40); /* SLAM Printer, RFID Printer?? */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1105147-007', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1105147-007', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'P1058930-058', '274.99', '2026-01-01 00:00:00.000000+00', NULL, 'Coupa', 'images/prices/P1058930-058_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-058', 9, 'Media Rewind Spindle', 50); /* SLAM Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-058', 1);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', '77197M', '32.16', '2026-01-01 00:00:00.000000+00', NULL, 'Coupa', 'images/prices/77197M_01-24-2026.png');
INSERT INTO printer_parts VALUES ('77197M', 10, 'Peel Assembly Roller', 60); /* SLAM Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('77197M', 1);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'P1058930-078', '12.00', '2026-01-01 00:00:00.000000+00', NULL, 'Zebra Store', 'images/prices/P1058930-078_01-18-2026.png');
INSERT INTO printer_parts VALUES ('P1058930-078', 11, 'Printer Boots', 500); /* SLAM PRINTER, RFID Printer */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-078', 1);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1058930-078', 2);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'P1112640-241', '161.27', '2026-01-01 00:00:00.000000+00', NULL, 'DSCS', 'images/prices/P1112640-241_01-18-2026.png');
INSERT INTO printer_parts VALUES('P1112640-241', 12, 'Printhead', 10);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-241', 3);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-241', 4);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'P1112640-251', '29.90', '2026-01-01 00:00:00.000000+00', NULL, 'Coupa', 'images/prices/P1112640-251_01-18-2026.png');
INSERT INTO printer_parts VALUES('P1112640-251', 13, 'Platen Roller', 20); /* PSlip Printer, ASIN MC */
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-251', 3);
INSERT INTO printer_parts_used_for_printer_type VALUES ('P1112640-251', 4);

INSERT INTO product_prices VALUES (DEFAULT, 'szampiam', 'PSprings-PSlip-MC', '5.00', '2026-01-01 00:00:00.000000+00', NULL, 'Coupa', 'images/prices/PSprings-PSlip-MC_01-18-2026.png');
INSERT INTO printer_parts VALUES('PSprings-PSlip-MC', 14, 'Springs', 30); /* PSlip Printer, ASIN MC */
INSERT INTO printer_parts_used_for_printer_type VALUES ('PSprings-PSlip-MC', 3);
INSERT INTO printer_parts_used_for_printer_type VALUES ('PSprings-PSlip-MC', 4);

INSERT INTO printers VALUES ('99J204901059',1,'2021-01-13','2022-01-13','t',null,'2026-01-02 15:30:18.294452+00');
INSERT INTO printers VALUES ('99J211101461',1,'2021-03-24','2022-03-24','t',null,'2026-01-03 07:55:26.971852+00');
INSERT INTO printers VALUES ('99J204800860',1,'2021-01-13','2022-01-13','t',null,'2026-01-08 03:43:17.192834+00');
INSERT INTO printers VALUES ('99J214102237',1,'2021-10-21','2022-10-21','t',null,'2026-01-08 05:20:48.186693+00');
INSERT INTO printers VALUES ('99J210302311',1,'2021-03-24','2022-03-24','t',null,'2026-01-08 08:59:11.15549+00');
INSERT INTO printers VALUES ('99J212401998',1,'2021-06-23','2022-06-23','t',null,'2026-01-03 06:11:32.381418+00');
INSERT INTO printers VALUES ('99J211101525',1,'2021-03-24','2022-03-24','t',null,'2026-01-15 05:42:04.879819+00');
INSERT INTO printers VALUES ('99J211101415',1,'2021-03-24','2022-03-24','t',null,'2026-01-11 08:20:43.279916+00');
INSERT INTO printers VALUES ('99J210302310',1,'2021-03-24','2022-03-24','t',null,'2026-01-16 05:53:35.234438+00');
INSERT INTO printers VALUES ('99J211101523',1,'2021-03-24','2022-03-24','t',null,'2026-01-16 06:46:42.448888+00');
INSERT INTO printers VALUES ('99N223900939',1,'2022-11-07','2023-11-07','t',null,'2026-01-22 02:54:16.794326+00');
INSERT INTO printers VALUES ('99N223900833',1,'2022-11-07','2023-11-07','t',null,'2026-01-23 02:20:18.628705+00');
INSERT INTO printers VALUES ('99N223900948',1,'2022-11-07','2023-11-07','t',null,'2026-01-23 03:06:31.358925+00');
INSERT INTO printers VALUES ('99J211101433',1,'2021-03-24','2022-03-24','t',null,'2026-01-24 03:51:42.157192+00');
INSERT INTO printers VALUES ('99J204901067',1,'2021-01-13','2022-01-13','t',null,'2026-01-24 08:19:10.352412+00');
INSERT INTO printers VALUES ('99N223900954',1,'2022-11-07','2023-11-07','t',null,'2026-01-25 01:27:49.671638+00');

INSERT INTO repairs VALUES (DEFAULT,'99J212401998','szampiam',null,'IT Cage',null,20,'Squeaky media spindle. Loose handle fixed. Password set.',0.00,1269.79,'2026-01-03 06:11:32.383487+00');
INSERT INTO repairs VALUES (DEFAULT,'99J211101461','szampiam',null,'Jackpot','East 3',50,'Bent pieces at printhead. Took two items from another printer.',33.07,1236.72,'2026-01-03 07:55:26.973906+00');
INSERT INTO repairs VALUES (DEFAULT,'99J204800860','szampiam',null,'IT Cage',null,45,null,262.00,1007.79,'2026-01-08 03:43:17.198215+00');
INSERT INTO repairs VALUES (DEFAULT,'99J214102237','szampiam',null,'IT Cage',null,45,'Will need a new printhead soon',262.00,1007.79,'2026-01-08 05:20:48.193117+00');
INSERT INTO repairs VALUES (DEFAULT,'99J210302311','szampiam',null,'IT Cage',null,55,'New printhead installed. Old printhead saved. User error.',262.00,1007.79,'2026-01-08 08:59:11.160549+00');
INSERT INTO repairs VALUES (DEFAULT,'99J212401998','szampiam',null,'Jackpot','East 3',45,'Found at Jackpot East 3. Desk is on a slant. Printer broken in less than 2 week period.',475.70,794.09,'2026-01-11 02:03:45.197619+00');
INSERT INTO repairs VALUES (DEFAULT,'99J211101415','szampiam',null,'Singles-Mix-Kickout','5-05',20,'The printhead clear plastic attachment is broken. Printer can still be used.',0.00,1269.79,'2026-01-11 08:20:43.286217+00');
INSERT INTO repairs VALUES (DEFAULT,'99J211101525','szampiam',null,'IT Cage',null,15,'Just a config issue. Printhead will need replaced soon.',0.00,1269.79,'2026-01-15 05:42:04.895337+00');
INSERT INTO repairs VALUES (DEFAULT,'99J211101415','shecacho','szampiam','Singles-Mix-Kickout',7,20,'Plastic holder on the printhead is broken but still works\nPrinthead might need to be changed soon',0.00,1269.79,'2026-01-16 01:10:58.429052+00');
INSERT INTO repairs VALUES (DEFAULT,'99J210302310','szampiam',null,'IT Cage',null,20,'Sitting on bottom row IT cage. Put on top row.',0.00,1269.79,'2026-01-16 05:53:35.240792+00');
INSERT INTO repairs VALUES (DEFAULT,'99J211101523','szampiam',null,'IT Cage',null,35,'Decorative orange sheet removed.',244.66,1025.13,'2026-01-16 06:46:42.454005+00');
INSERT INTO repairs VALUES (DEFAULT,'99N223900939','szampiam',null,'Singles-Mix-Kickout','5-12',30,'Found at Singles 5-12. Belt was a bit frayed on the outside. Roller had dents. ',64.03,1205.76,'2026-01-22 02:54:16.812974+00');
INSERT INTO repairs VALUES (DEFAULT,'99N223900833','szampiam',null,'IT Cage',null,25,'Was sitting in IT cage for awhile. Works good. ',274.99,994.80,'2026-01-23 02:20:18.636023+00');
INSERT INTO repairs VALUES (DEFAULT,'99N223900948','szampiam',null,'IT Cage',null,40,'Needs to be at 2.5 for toggle bar. ',488.69,781.10,'2026-01-23 03:06:31.363665+00');
INSERT INTO repairs VALUES (DEFAULT,'99J211101433','szampiam',null,'IT Cage',null,30,'Platen roller and printhead were in bad condition! ',246.77,1023.02,'2026-01-24 03:51:42.168679+00');
INSERT INTO repairs VALUES (DEFAULT,'99J204901067','szampiam',null,'IT Cage',null,60,'NEW PART: 77197M',32.16,1237.63,'2026-01-24 08:19:10.357521+00');
INSERT INTO repairs VALUES (DEFAULT,'99N223900954','szampiam',null,'IT Cage',null,45,'Will need a new printhead soon. Valentine/Heart edition',308.06,961.73,'2026-01-25 01:27:49.67782+00');

INSERT INTO printer_parts_used_for_repair VALUES (2, 'P1058930-080');
INSERT INTO printer_parts_used_for_repair VALUES (3, 'P1105147-007');
INSERT INTO printer_parts_used_for_repair VALUES (4, 'P1105147-007');
INSERT INTO printer_parts_used_for_repair VALUES (5, 'P1105147-007');
INSERT INTO printer_parts_used_for_repair VALUES (6, 'P1058930-010');
INSERT INTO printer_parts_used_for_repair VALUES (6, 'P1105147-007');
INSERT INTO printer_parts_used_for_repair VALUES (11, 'P1058930-010');
INSERT INTO printer_parts_used_for_repair VALUES (11, '79867M');
INSERT INTO printer_parts_used_for_repair VALUES (12, 'P1058930-080');
INSERT INTO printer_parts_used_for_repair VALUES (12, '79867M');
INSERT INTO printer_parts_used_for_repair VALUES (13, 'P1058930-058');
INSERT INTO printer_parts_used_for_repair VALUES (14, 'P1058930-010');
INSERT INTO printer_parts_used_for_repair VALUES (14, 'P1058930-058');
INSERT INTO printer_parts_used_for_repair VALUES (15, 'P1058930-010');
INSERT INTO printer_parts_used_for_repair VALUES (15, 'P1058930-080');
INSERT INTO printer_parts_used_for_repair VALUES (16, '77197M');
INSERT INTO printer_parts_used_for_repair VALUES (17, 'P1058930-080');
INSERT INTO printer_parts_used_for_repair VALUES (17, 'P1058930-058');

INSERT INTO issues_resolved_on_repair VALUES (1,2); 
INSERT INTO issues_resolved_on_repair VALUES (1,3);
INSERT INTO issues_resolved_on_repair VALUES (2,1);
INSERT INTO issues_resolved_on_repair VALUES (3,1);
INSERT INTO issues_resolved_on_repair VALUES (4,1);
INSERT INTO issues_resolved_on_repair VALUES (5,1);
INSERT INTO issues_resolved_on_repair VALUES (6,1);
INSERT INTO issues_resolved_on_repair VALUES (7,3);
INSERT INTO issues_resolved_on_repair VALUES (8,3);
INSERT INTO issues_resolved_on_repair VALUES (9,3);
INSERT INTO issues_resolved_on_repair VALUES (10,3);
INSERT INTO issues_resolved_on_repair VALUES (11,1);
INSERT INTO issues_resolved_on_repair VALUES (12,1);
INSERT INTO issues_resolved_on_repair VALUES (13,1);
INSERT INTO issues_resolved_on_repair VALUES (14,1);
INSERT INTO issues_resolved_on_repair VALUES (15,1);
INSERT INTO issues_resolved_on_repair VALUES (16,1);
INSERT INTO issues_resolved_on_repair VALUES (17,1);