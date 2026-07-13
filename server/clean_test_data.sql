-- 清理测试数据
UPDATE registrations 
SET pay_type = NULL,
    pay_status = '未支付'
WHERE id IN (2, 7);

-- 删除测试插入的记录
DELETE FROM registrations 
WHERE date > CURDATE() 
AND pay_type IN ('微信支付', '支付宝支付', '医保卡支付');

-- 重置支付方式配置
UPDATE system_settings 
SET pay_types = '微信支付,支付宝支付,医保卡支付'
WHERE id = 1;