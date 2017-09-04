DELIMITER //
DROP PROCEDURE IF EXISTS countDB.GetCounts //
CREATE DEFINER=countDB@localhost PROCEDURE countDB.GetCounts(IN userName VARCHAR(45), IN startDate VARCHAR(45), IN endDate VARCHAR(45), IN queryText VARCHAR(255))
BEGIN
SET @g = '';
SET @sql = NULL;
SET @name = 'u.name as name, ';

IF(userName = '%') THEN
  SET @name = '';
END IF;

IF(userName = 'ALL') THEN
        SET @g = 'group by u.id ';
        SET userName = '%';
    END IF;

SELECT name from users where name like userName;

SET @sql = CONCAT('SELECT ', @name, 'COUNT(COALESCE(m.text, '''')) AS count FROM users u JOIN messages m ON u.id = m.user_id AND name like ''', userName, ''' AND m.created_at BETWEEN ''', startDate, ''' AND ''', endDate, ''' AND COALESCE(m.text, '''') like ''%', queryText, '%''', @g, 'order by count desc');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

END //
DELIMITER ;