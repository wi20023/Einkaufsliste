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
-- Tabellenstruktur für Tabelle `list2`
--

CREATE TABLE `list2` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `list2`
--

INSERT INTO `list2` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES
(1, 'Shampoo', '1', 'Stück', '2022-03-17');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `list3`
--

CREATE TABLE `list3` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `list3`
--

INSERT INTO `list3` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES
(1, 'Shampoo', '1', 'Stück', '2022-03-17'),
(2, 'Bodylotion', '2', 'Stück', '2022-03-17'),
(3, 'Duschgel', '5', 'Stück', '2022-03-17');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `mainList`
--

CREATE TABLE `mainList` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `created_at` date NOT NULL DEFAULT '2022-03-17'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `mainList`
--

INSERT INTO `mainList` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES
(1, 'Bananen', '6', 'Stück', '2020-04-09'),
(2, 'Brot', '1', 'Stück', '2020-04-09');

-- --------------------------------------------------------

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `list2`
--
ALTER TABLE `list2`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `list3`
--
ALTER TABLE `list3`
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
-- AUTO_INCREMENT für Tabelle `list2`
--
ALTER TABLE `list2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `list3`
--
ALTER TABLE `list3`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `mainList`
--
ALTER TABLE `mainList`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- ------------------------Table user - because LoginDB not works ----------------------------------------

-- CREATE TABLE `user` (
--   `id` int(11) NOT NULL,
--   `username` varchar(255) NOT NULL,
--   `password` varchar(255) NOT NULL,
--   `created_at` date NOT NULL DEFAULT current_timestamp()
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --
-- -- Daten für Tabelle `user`
-- --

-- INSERT INTO `user` (`id`, `username`, `password`) VALUES
-- (1, 'Jana', '123'),
-- (2, 'Katharina', '1234'),
-- (3, 'Tijana', '12345');

-- --
-- -- Indizes der exportierten Tabellen
-- --

-- --
-- -- Indizes für die Tabelle `user`
-- --
-- ALTER TABLE `user`
--   ADD PRIMARY KEY (`id`);

-- --
-- -- AUTO_INCREMENT für exportierte Tabellen
-- --

-- --
-- -- AUTO_INCREMENT für Tabelle `user`
-- --
-- ALTER TABLE `user`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--   ------------------------Table user end ----------------------------------------

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;