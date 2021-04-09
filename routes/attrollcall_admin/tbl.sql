 CREATE TABLE IF NOT EXISTS `act`.`attrollcall_attend` (
  `aa_id` int NOT NULL AUTO_INCREMENT,
  `al_id` int DEFAULT NULL,
  `act_c_id` int DEFAULT NULL,
  `stud_ref` varchar(45) DEFAULT NULL,
  `classno` varchar(45) DEFAULT NULL,
  `seat` varchar(45) DEFAULT NULL,
  `c_name` varchar(45) DEFAULT NULL,
  `in_type` varchar(45) DEFAULT NULL,
  `in_time` varchar(45) DEFAULT NULL,
  `out_type` varchar(45) DEFAULT NULL,
  `out_time` varchar(45) DEFAULT NULL,
  `hours` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`aa_id`),
  KEY `aakey` (`al_id`,`stud_ref`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `act`.`attrollcall_course_def` (
  `act_c_id` int NOT NULL AUTO_INCREMENT,
  `activeName` varchar(30) NOT NULL DEFAULT '',
  `teacher` varchar(8) NOT NULL DEFAULT '',
  `SPK` smallint NOT NULL DEFAULT '1',
  `pwd` varchar(45) DEFAULT NULL,
  `pwd_adm` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`act_c_id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `act`.`attrollcall_lesson` (
  `al_id` int NOT NULL AUTO_INCREMENT,
  `act_c_id` int DEFAULT NULL,
  `al_datetime` varchar(45) DEFAULT NULL,
  `lesson` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`al_id`),
  KEY `alkey` (`act_c_id`,`al_datetime`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `act`.`attrollcall_stud` (
  `as_id` int NOT NULL AUTO_INCREMENT,
  `act_c_id` int NOT NULL,
  `activeName` varchar(45) DEFAULT NULL,
  `stud_ref` varchar(45) NOT NULL,
  `classno` varchar(45) DEFAULT NULL,
  `seat` int DEFAULT NULL,
  `c_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`as_id`),
  KEY `askey` (`act_c_id`,`stud_ref`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `act`.`studinfo` (
  `stud_ref` varchar(11) NOT NULL,
  `dsej_ref` varchar(11) DEFAULT NULL,
  `c_name` varchar(45) DEFAULT NULL,
  `curr_class` varchar(45) DEFAULT NULL,
  `curr_seat` int DEFAULT NULL,
  PRIMARY KEY (`stud_ref`),
  KEY `cno_seat` (`curr_class`,`curr_seat`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;