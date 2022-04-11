-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: host2
-- Erstellungszeit: 11. Apr 2022 um 10:10
-- Server-Version: 10.7.3-MariaDB-1:10.7.3+maria~focal
-- PHP-Version: 8.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `LoginDB`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE `user` (
  `uuid` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `user`
--

INSERT INTO `user` (`uuid`, `username`, `password`, `created_at`) VALUES
('745cdc24-b97f-11ec-9939-0242ac140007', 'Jana', '$2a$10$bIBxtLSDiJzl0N6KWXeqceFDFDrz7dy4kjSo4DbPQ/BjLIJO98Z/q', '2022-04-11'),
('7cc26007-b97f-11ec-9939-0242ac140007', 'Katharina', '$2a$10$gviTzjUGq6SQWT6nvL7JpO/LbFzM4LOVZq2YzKj0NWFV7TP06o5PC', '2022-04-11'),
('850018a5-b97f-11ec-9939-0242ac140007', 'Tijana', '$2a$10$kaIpZWWiCR3y1bIJK2FaRusKSlNaYDnjCpM9tdKh5UESGJrg.WZRm', '2022-04-11');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `username` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
