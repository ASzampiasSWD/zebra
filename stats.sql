/* Query: How many parts have been used so far? */
SELECT 
printer_parts.printer_part_name,
COUNT(printer_parts_used_for_repair.printer_part_id) AS "Times Used"
FROM printer_parts_used_for_repair 
INNER JOIN printer_parts
ON printer_parts_used_for_repair.printer_part_id=printer_parts.printer_part_id 
GROUP BY printer_parts.printer_part_name
ORDER BY "Times Used" DESC;

/* Query: How many times have we seen the same printer? */
SELECT COUNT(serial_number_id) AS "Times Seen", serial_number_id, 
SUM(repair_cost) AS "Repair Cost"
FROM repairs
GROUP BY serial_number_id
ORDER BY "Times Seen" DESC, "Repair Cost" DESC;