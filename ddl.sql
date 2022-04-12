CREATE SCHEMA `todoapp` DEFAULT CHARACTER SET utf8 ;

CREATE TABLE `todoapp`.`t_task` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NULL,
  `task_name` VARCHAR(255) NOT NULL,
  `deadline` TIMESTAMP NULL,
  `task_status` INT(10) NOT NULL DEFAULT 3,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `todoapp`.`m_category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`, `category_name`));