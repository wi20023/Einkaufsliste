-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: host1
-- Erstellungszeit: 22. Mrz 2022 um 14:23
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
-- Datenbank: `EinkaufslisteDB`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Drogerieprodukte`
--

CREATE TABLE `Drogerieprodukte` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `Drogerieprodukte`
--

INSERT INTO `Drogerieprodukte` (`id`, `title`, `quantity`, `unit`, `note`, `created_at`) VALUES
(1, 'Seife', '1', 'Stück', 'Spender', '2022-03-17');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Pflegeprodukte`
--

CREATE TABLE `Pflegeprodukte` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `Pflegeprodukte`
--

INSERT INTO `Pflegeprodukte` (`id`, `title`, `quantity`, `unit`, `note`, `created_at`) VALUES
(1, 'Shampoo', '1', 'Stück', 'Syoss', '2022-03-17'),
(2, 'Bodylotion', '2', 'Stück', 'Nivea', '2022-03-17'),
(3, 'Duschgel', '5', 'Stück', 'For men', '2022-03-17');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `mainList`
--

CREATE TABLE `mainList` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` date NOT NULL DEFAULT '2022-03-17'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `mainList`
--

INSERT INTO `mainList` (`id`, `title`, `quantity`, `unit`, `note`, `created_at`) VALUES
(1, 'Bananen', '6', 'Stück', 'Bio', '2020-04-09'),
(2, 'Brot', '1', 'Stück', 'Vollkorn, geschnitten', '2020-04-09');

-- --------------------------------------------------------

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `Drogerieprodukte`
--
ALTER TABLE `Drogerieprodukte`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Pflegeprodukte`
--
ALTER TABLE `Pflegeprodukte`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `mainList`
--
ALTER TABLE `mainList`
  ADD PRIMARY KEY (`id`);


--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `Drogerieprodukte`
--
ALTER TABLE `Drogerieprodukte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `Pflegeprodukte`
--
ALTER TABLE `Pflegeprodukte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `mainList`
--
ALTER TABLE `mainList`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;