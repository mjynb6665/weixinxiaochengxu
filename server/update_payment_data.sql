-- 更新system_settings表中的支付方式配置
UPDATE system_settings 
SET pay_types = '微信支付,支付宝支付,医保卡支付'
WHERE id = 1;

-- 更新registrations表中的记录
UPDATE registrations 
SET pay_type = '微信支付',
    pay_status = '未支付',
    status = '待就诊'
WHERE id = 2;

UPDATE registrations 
SET pay_type = '微信支付',
    pay_status = '未支付',
    status = '待就诊'
WHERE id = 7;

-- 添加新的挂号记录（确保使用存在的外键ID）
INSERT INTO registrations 
(patient_id, doctor_id, department_id, date, time_slot, status, pay_status, pay_type) 
VALUES 
(3, 2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '上午', '待就诊', '已支付', '微信支付'),
(1, 1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '下午', '待就诊', '已支付', '支付宝支付'),
(4, 3, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '上午', '待就诊', '已支付', '医保卡支付');