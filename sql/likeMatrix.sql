-- -----------------------------------------------------
-- Procedure `countDB`.`LikeMatrix`
-- -----------------------------------------------------

DELIMITER //
DROP PROCEDURE IF EXISTS countDB.LikeMatrix //
CREATE DEFINER=countDB@localhost PROCEDURE countDB.LikeMatrix(IN startDate VARCHAR(40), IN endDate VARCHAR(40))
BEGIN

IF(endDate = '%') THEN
        SET endDate = NOW();
    END IF;

IF EXISTS (select u.name from (select distinct target_id as id from likeview where date between startDate and endDate union select distinct source_id from likeview where date between startDate and endDate) tmp join users u on tmp.id = u.id order by tmp.id) THEN
select u.name from (select distinct target_id as id from likeview where date between startDate and endDate union select distinct source_id from likeview where date between startDate and endDate) tmp join users u on tmp.id = u.id order by tmp.id;

SET group_concat_max_len = 10000;    
SET @sql = NULL;
SELECT
  GROUP_CONCAT(
    CONCAT(
      'COALESCE(SUM(l.source_id = ''',
      id,
      '''),0) AS ''',
      id,
      ''''
    )
  order by id)
INTO @sql
FROM
  (select distinct target_id as id from likeview where date between startDate and endDate union select distinct source_id from likeview where date between startDate and endDate order by id) tmp;

SET @sql = CONCAT('select ', @sql, 'from (select distinct target_id as id from likeview where date between ''', startDate, ''' and ''', endDate, ''' union select distinct source_id from likeview where date between ''', startDate, ''' and ''', endDate, ''') tmp left join likeview l on tmp.id = l.target_id and l.date between ''', startDate, ''' and ''', endDate, ''' group by tmp.id order by tmp.id');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
END IF;

END //
DELIMITER ;