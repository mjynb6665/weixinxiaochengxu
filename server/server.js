const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

app.use(bodyParser.json());

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_school'
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 修改visits表结构
const createVisitsStructure = `
ALTER TABLE visits 
ADD COLUMN registration_id int(11) DEFAULT NULL,
ADD COLUMN treatment_advice text,
ADD COLUMN medical_history text,
ADD COLUMN prescription text,
ADD COLUMN examination_results text,
ADD FOREIGN KEY (registration_id) REFERENCES registrations(id);
`;

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    
    connection.query(createVisitsStructure, (error) => {
        connection.release();
        if (error && !error.message.includes('Duplicate column name')) {
            console.error('Error updating visits table:', error);
        }
    });
});

// 工具函数
function formatDate(dateStr) {
    if (!dateStr) return null;
    return dateStr.slice(0, 10);
}

// 封装数据库查询函数
function queryDatabase(sql, params, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return callback({ code: 2, msg: '数据库错误' });
        }
        connection.query(sql, params, (error, results) => {
            connection.release();
            if (error) {
                console.error('Query error:', error);
                return callback({ code: 2, msg: '数据库错误' });
            }
            callback(null, results);
        });
    });
}

// 病人登录
app.post('/api/patient/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        return res.json({ code: 1, msg: '手机号和密码不能为空' });
    }
    const sql = 'SELECT * FROM patients WHERE phone = ? AND password = ?';
    queryDatabase(sql, [phone, password], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) return res.json({ code: 3, msg: '手机号或密码错误' });
        res.json({ code: 0, msg: '登录成功', data: results[0] });
    });
});

// 管理员登录
app.post('/api/admin/login', (req, res) => {
    const { adminAccount, password } = req.body;
    if (!adminAccount || !password) {
        return res.json({ code: 1, msg: '账号和密码不能为空' });
    }
    const sql = 'SELECT * FROM admin WHERE username = ? AND password = ?';
    queryDatabase(sql, [adminAccount, password], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) return res.json({ code: 3, msg: '账号或密码错误' });
        res.json({ code: 0, msg: '登录成功', data: results[0] });
    });
});

// 医生登录
app.post('/api/doctor/login', (req, res) => {
    const { staffId, password } = req.body;
    if (!staffId || !password) {
        return res.json({ code: 1, msg: '工号和密码不能为空' });
    }
    const sql = 'SELECT * FROM doctors WHERE id = ? AND password = ?';
    queryDatabase(sql, [staffId, password], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) return res.json({ code: 3, msg: '工号或密码错误' });
        res.json({ code: 0, msg: '登录成功', data: results[0] });
    });
});

// 查找病人接口（根据ID或姓名，返回所有匹配项）
app.get('/api/patient/search', (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.json({ code: 1, msg: '缺少参数' });
    }
    const sql = 'SELECT * FROM patients WHERE id = ? OR name = ?';
    queryDatabase(sql, [keyword, keyword], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) {
            return res.json({ code: 404, msg: '未找到' });
        }
        res.json({ code: 0, data: results });
    });
});

// 查询所有病人
app.get('/api/patient/all', (req, res) => {
    queryDatabase('SELECT * FROM patients', [], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, data: results });
    });
});

// 增加病人接口
app.post('/api/patient/add', (req, res) => {
    let { phone, password, name, id_card, gender, birth_date } = req.body;
    if (!phone || !password || !name) {
        return res.json({ code: 1, msg: '缺少必要参数' });
    }
    birth_date = formatDate(birth_date);
    const sql = 'INSERT INTO patients (phone, password, name, id_card, gender, birth_date) VALUES (?, ?, ?, ?, ?, ?)';
    queryDatabase(sql, [phone, password, name, id_card, gender, birth_date], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, msg: '添加成功', id: results.insertId });
    });
});

// 删除病人接口（只根据name删除）
app.post('/api/patient/delete', (req, res) => {
    const { keyword } = req.body;
    if (!keyword) {
        return res.json({ code: 1, msg: '缺少参数' });
    }
    // 先查找病人
    queryDatabase('SELECT * FROM patients WHERE name = ?', [keyword], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) {
            return res.json({ code: 404, msg: '未找到要删除的病人' });
        }
        const patientId = results[0].id;
        // 删除 visits 相关记录
        queryDatabase('DELETE FROM visits WHERE patient_id=?', [patientId], (err) => {
            if (err) return res.json(err);
            // 删除 registrations 相关记录
            queryDatabase('DELETE FROM registrations WHERE patient_id=?', [patientId], (err) => {
                if (err) return res.json(err);
                // 删除病人
                queryDatabase('DELETE FROM patients WHERE id=?', [patientId], (err) => {
                    if (err) return res.json(err);
                    res.json({ code: 0, msg: '删除成功' });
                });
            });
        });
    });
});

// 修改病人接口（根据name修改）
app.post('/api/patient/edit', (req, res) => {
    let { name, phone, password, id_card, gender, birth_date } = req.body;
    if (!name) {
        return res.json({ code: 1, msg: '缺少病人姓名' });
    }
    birth_date = formatDate(birth_date);
    const sql = 'UPDATE patients SET phone=?, password=?, id_card=?, gender=?, birth_date=? WHERE name=?';
    queryDatabase(sql, [phone, password, id_card, gender, birth_date, name], (err, results) => {
        if (err) return res.json(err);
        if (results.affectedRows === 0) {
            return res.json({ code: 404, msg: '未找到要修改的病人' });
        }
        res.json({ code: 0, msg: '修改成功' });
    });
});

// 查询所有科室
app.get('/api/departments', (req, res) => {
    queryDatabase('SELECT * FROM departments', [], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, data: results });
    });
});

// 查询所有医生（可加条件筛选）
app.get('/api/doctors', (req, res) => {
    const department_id = req.query.department_id;
    let sql = 'SELECT * FROM doctors';
    const params = [];
    if (department_id) {
        sql += ' WHERE department_id = ?';
        params.push(department_id);
    }
    queryDatabase(sql, params, (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, data: results });
    });
});

// 添加医生
app.post('/api/doctors/add', (req, res) => {
    const { name, title, specialty, schedule, department_id, status } = req.body;
    const sql = 'INSERT INTO doctors (name, title, specialty, schedule, department_id, status) VALUES (?, ?, ?, ?, ?, ?)';
    queryDatabase(sql, [name, title, specialty, schedule, department_id, status ?? 1], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, msg: '添加成功' });
    });
});

// 编辑医生
app.post('/api/doctors/edit', (req, res) => {
    const { id, name, title, specialty, schedule, department_id, status } = req.body;
    const sql = 'UPDATE doctors SET name=?, title=?, specialty=?, schedule=?, department_id=?, status=? WHERE id=?';
    queryDatabase(sql, [name, title, specialty, schedule, department_id, status, id], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, msg: '编辑成功' });
    });
});

// 删除医生
app.post('/api/doctors/delete', (req, res) => {
    const { id } = req.body;
    queryDatabase('DELETE FROM doctors WHERE id=?', [id], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, msg: '删除成功' });
    });
});

// 上下架医生
app.post('/api/doctors/status', (req, res) => {
    const { id, status } = req.body;
    const sql = 'UPDATE doctors SET status=? WHERE id=?';
    queryDatabase(sql, [status, id], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, msg: '操作成功' });
    });
});

// 查询医生挂号规则
app.get('/api/registration_rules', (req, res) => {
    const { doctor_id } = req.query;
    if (!doctor_id) return res.json({ code: 1, msg: '缺少doctor_id' });
    const sql = 'SELECT * FROM registration_rules WHERE doctor_id = ?';
    queryDatabase(sql, [doctor_id], (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, data: results });
    });
});

// 检查挂号数量
app.get('/api/registration/check', (req, res) => {
    const { doctor_id, department_id, date, time_slot } = req.query;
    if (!doctor_id || !department_id || !date || !time_slot) {
        return res.json({ code: 1, msg: '缺少必要参数' });
    }
    const sql = 'SELECT COUNT(*) as count FROM registrations WHERE doctor_id = ? AND department_id = ? AND date = ? AND time_slot = ?';
    queryDatabase(sql, [doctor_id, department_id, date, time_slot], (err, results) => {
        if (err) return res.json(err);
        const maxCount = 10; // 假设最大挂号数为10
        const available = maxCount - results[0].count;
        res.json({ code: 0, data: { available } });
    });
});

// 修改后的挂号和支付接口
app.post('/api/registration/add', (req, res) => {
    console.log('Received registration request:', req.body); // 记录请求参数
    let { doctor_id, department_id, date, time_slot, pay_type, patient_id, patient_name, proxy_patient_id } = req.body;
    console.log('department_id:', department_id); // 输出 department_id 的值
    if (!doctor_id || !department_id || !date || !time_slot || !pay_type) {
        return res.json({ code: 1, msg: '缺少必要参数' });
    }

    // 确保 department_id 不是 undefined
    department_id = department_id === 'undefined' ? null : department_id;

    // 开始事务
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return res.json({ code: 2, msg: '数据库错误' });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Begin transaction error:', err); // 记录错误日志
                connection.release();
                return res.json({ code: 2, msg: '数据库错误' });
            }

            let sql;
            let params;

            if (patient_name && proxy_patient_id) {
                // 使用代理挂号
                sql = 'INSERT INTO registrations (doctor_id, department_id, date, time_slot, pay_type, patient_name, proxy_patient_id, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                params = [doctor_id, department_id, date, time_slot, pay_type, patient_name, proxy_patient_id, proxy_patient_id]; // 使用 proxy_patient_id 作为 patient_id
            } else if (patient_id) {
                // 使用病人 ID 挂号
                sql = 'INSERT INTO registrations (doctor_id, department_id, date, time_slot, pay_type, patient_id) VALUES (?, ?, ?, ?, ?, ?)';
                params = [doctor_id, department_id, date, time_slot, pay_type, patient_id];
            } else {
                connection.rollback(() => {
                    connection.release();
                    return res.json({ code: 1, msg: '缺少病人ID或被挂号人姓名和代理病人ID' });
                });
                return;
            }

            // 增加判断，确保 patient_id 不为 NULL
            if (!patient_name && !patient_id) {
                connection.rollback(() => {
                    connection.release();
                    return res.json({ code: 1, msg: '缺少病人ID' });
                });
                return;
            }

            // 执行挂号插入
            connection.query(sql, params, (error, results) => {
                if (error) {
                    console.error('Insert registration error:', error); // 记录错误日志
                    console.error('SQL:', sql); // 记录 SQL 语句
                    console.error('Params:', params); // 记录参数
                    connection.rollback(() => {
                        connection.release();
                        return res.json({ code: 2, msg: '挂号失败' });
                    });
                    return;
                }

                const registrationId = results.insertId;

                // 查询系统支持的支付方式
                connection.query('SELECT pay_types FROM system_settings LIMIT 1', (error, settingsResults) => {
                    if (error) {
                        connection.rollback(() => {
                            connection.release();
                            return res.json({ code: 2, msg: '数据库错误' });
                        });
                        return;
                    }

                    if (settingsResults.length === 0) {
                        connection.rollback(() => {
                            connection.release();
                            return res.json({ code: 3, msg: '系统设置未配置' });
                        });
                        return;
                    }

                    const allowedPayTypes = settingsResults[0].pay_types.split(',');
                    if (!allowedPayTypes.includes(pay_type)) {
                        connection.rollback(() => {
                            connection.release();
                            return res.json({ code: 4, msg: '不支持的支付方式' });
                        });
                        return;
                    }

                    // 更新挂号记录的支付状态
                    const updateSql = 'UPDATE registrations SET pay_status = ?, pay_type = ? WHERE id = ?';
                    connection.query(updateSql, ['已支付', pay_type, registrationId], (updateError, updateResults) => {
                        if (updateError) {
                            connection.rollback(() => {
                                connection.release();
                                return res.json({ code: 2, msg: '支付失败' });
                            });
                            return;
                        }

                        if (updateResults.affectedRows === 0) {
                            connection.rollback(() => {
                                connection.release();
                                return res.json({ code: 4, msg: '支付失败，请检查挂号记录状态（可能未找到该挂号记录，或者该记录已支付）' });
                            });
                            return;
                        }

                        // 提交事务
                        connection.commit((err) => {
                            if (err) {
                                console.error('Transaction commit error:', err); // 记录错误日志
                                connection.rollback(() => {
                                    connection.release();
                                    return res.json({ code: 2, msg: '事务提交失败' });
                                });
                                return;
                            }
                            
                            connection.release();
                            res.json({ code: 0, msg: '挂号并支付成功', id: registrationId });
                        });
                    });
                });
            });
        });
    });
});

// 添加 /api/settings 接口
app.get('/api/settings', (req, res) => {
    const sql = 'SELECT * FROM system_settings';
    queryDatabase(sql, [], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) {
            return res.json({ code: 404, msg: '未找到设置信息' });
        }
        const settings = results[0];
        res.json({ 
            code: 0, 
            data: {
                hospital_name: settings.hospital_name,
                hospital_address: settings.hospital_address,
                hospital_phone: settings.hospital_phone,
                register_notify_type: settings.register_notify_type,
                visit_notify_type: settings.visit_notify_type,
                pay_types: settings.pay_types,
                max_reg_count: settings.max_reg_count,
                allow_cancel: settings.allow_cancel
            } 
        });
    });
});

// 添加 /api/doctor/detail 接口
app.get('/api/doctor/detail', (req, res) => {
    const doctorId = req.query.id;
    if (!doctorId) {
        return res.json({ code: 1, msg: '缺少医生ID' });
    }
    const sql = 'SELECT d.*, dep.name AS department_name FROM doctors d LEFT JOIN departments dep ON d.department_id=dep.id WHERE d.id = ?';
    queryDatabase(sql, [doctorId], (err, results) => {
        if (err) return res.json(err);
        if (results.length === 0) {
            return res.json({ code: 404, msg: '未找到该医生信息' });
        }
        const doctor = results[0];
        const responseData = { // 将返回数据赋值给一个变量
            code: 0,
            data: {
                id: doctor.id,
                name: doctor.name,
                title: doctor.title,
                specialty: doctor.specialty,
                department_name: doctor.department_name,
                schedule: doctor.schedule,
                status: doctor.status,
                max_registrations: doctor.max_registrations,
                department_id: doctor.department_id // 确保返回 department_id
            }
        };
        console.log('API /api/doctor/detail response:', responseData); // 打印返回数据
        res.json(responseData);
    });
});

// 查询所有医生（包括所有状态的医生）
app.get('/api/doctors/all', (req, res) => {
    const department_id = req.query.department_id;
    let sql = 'SELECT * FROM doctors';
    const params = [];
    if (department_id) {
        sql += ' WHERE department_id=?';
        params.push(department_id);
    }
    queryDatabase(sql, params, (err, results) => {
        if (err) return res.json(err);
        res.json({ code: 0, data: results });
    });
});

// 设置医生最大挂号数
app.post('/api/doctors/setMaxRegistrations', (req, res) => {
    const { id, max_registrations } = req.body;
    if (!id || !max_registrations) {
        return res.json({ code: 1, msg: '缺少必要参数' });
    }
    const sql = 'UPDATE doctors SET max_registrations = ? WHERE id = ?';
    queryDatabase(sql, [max_registrations, id], (err, results) => {
        if (err) return res.json(err);
        if (results.affectedRows === 0) return res.json({ code: 3, msg: '未找到该医生' });
        res.json({ code: 0, msg: '设置成功' });
    });
});

// 更新挂号状态
app.post('/api/registration/update_status', (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
        return res.json({ code: 1, msg: '缺少必要参数' });
    }
    
    const sql = 'UPDATE registrations SET status = ? WHERE id = ?';
    queryDatabase(sql, [status, id], (err, results) => {
        if (err) return res.json(err);
        if (results.affectedRows === 0) {
            return res.json({ code: 404, msg: '未找到该挂号记录' });
        }
        res.json({ code: 0, msg: '状态更新成功' });
    });
});

// 查询挂号记录
app.get('/api/registrations', (req, res) => {
    const { status, date } = req.query;
    let sql = `
        SELECT r.*,
               d.name as doctor_name,
               d.title as doctor_title,
               dep.name as department_name,
               p.name as patient_name
        FROM registrations r
        LEFT JOIN doctors d ON r.doctor_id = d.id
        LEFT JOIN departments dep ON r.department_id = dep.id
        LEFT JOIN patients p ON r.patient_id = p.id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        sql += ' AND r.status = ?';
        params.push(status);
    }
    if (date) {
        sql += ' AND r.date = ?';
        params.push(date);
    }

    sql += ' ORDER BY r.date DESC, r.time_slot ASC';

    queryDatabase(sql, params, (err, results) => {
        if (err) return res.json(err);
        
        results = results.map(item => ({
            ...item,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : null
        }));
        
        res.json({ code: 0, data: results });
    });
});

app.get('/api/registration/list', (req, res) => {
    const { patient_id } = req.query;
    if (!patient_id) {
        return res.json({ code: 1, msg: '缺少病人ID' });
    }

    const sql = `
        SELECT r.*,
               d.name as doctor_name,
               d.title as doctor_title,
               dep.name as department_name
        FROM registrations r
        LEFT JOIN doctors d ON r.doctor_id = d.id
        LEFT JOIN departments dep ON r.department_id = dep.id
        WHERE r.patient_id = ?
        ORDER BY r.date DESC, r.time_slot ASC
    `;

    queryDatabase(sql, [patient_id], (err, results) => {
        if (err) return res.json(err);

        results = results.map(item => ({
            id: item.id,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : null,
            time_slot: item.time_slot,
            doctor_name: item.doctor_name,
            doctor_title: item.doctor_title,
            department_name: item.department_name,
            status: item.status,
            pay_status: item.pay_status
        }));

        res.json({ code: 0, data: results });
    });
});

app.get('/api/visit/history', (req, res) => {
    const { patient_id } = req.query;
    if (!patient_id) {
        return res.json({ code: 1, msg: '缺少病人ID' });
    }

    const sql = `
        SELECT r.*,
               d.name as doctor_name,
               d.title as doctor_title,
               d.specialty as doctor_specialty,
               dep.name as department_name,
               v.diagnosis_result,
               v.treatment_advice,
               v.medical_history,
               v.prescription,
               v.examination_results,
               v.id as visit_id
        FROM registrations r
        LEFT JOIN doctors d ON r.doctor_id = d.id
        LEFT JOIN departments dep ON r.department_id = dep.id
        LEFT JOIN visits v ON r.id = v.registration_id
        WHERE r.patient_id = ? 
        AND r.status = '已就诊'
        ORDER BY r.date DESC, r.time_slot ASC
    `;

    queryDatabase(sql, [patient_id], (err, results) => {
        if (err) return res.json(err);

        results = results.map(item => ({
            id: item.id,
            visit_id: item.visit_id,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : null,
            time_slot: item.time_slot,
            doctor_name: item.doctor_name,
            doctor_title: item.doctor_title,
            doctor_specialty: item.doctor_specialty,
            department_name: item.department_name,
            diagnosis_result: item.diagnosis_result,
            treatment_advice: item.treatment_advice,
            medical_history: item.medical_history,
            prescription: item.prescription,
            examination_results: item.examination_results,
            status: item.status,
            pay_status: item.pay_status
        }));

        res.json({ code: 0, data: results });
    });
});

// 处理支付请求
app.post('/api/registration/pay', (req, res) => {
    const { registration_id, pay_type } = req.body;
    if (!registration_id || !pay_type) {
        return res.json({ code: 1, msg: '缺少必要参数' });
    }

    // 先检查支付方式是否有效
    queryDatabase('SELECT pay_types FROM system_settings LIMIT 1', [], (err, results) => {
        if (err) return res.json(err);

        if (results.length === 0 || !results[0].pay_types.includes(pay_type)) {
            return res.json({ code: 3, msg: '不支持的支付方式' });
        }

        // 检查是否已经支付
        queryDatabase('SELECT pay_status FROM registrations WHERE id = ?', [registration_id], (checkError, checkResults) => {
            if (checkError) return res.json(checkError);

            if (checkResults.length === 0) {
                return res.json({ code: 404, msg: '未找到该挂号记录' });
            }

            if (checkResults[0].pay_status === '已支付') {
                return res.json({ code: 0, msg: '已支付，请勿重复支付' });
            }

            // 更新挂号记录的支付状态
            const updateSql = 'UPDATE registrations SET pay_status = ?, pay_type = ? WHERE id = ? AND pay_status = ?';
            queryDatabase(updateSql, ['已支付', pay_type, registration_id, '未支付'], (updateError, updateResults) => {
                if (updateError) return res.json(updateError);

                if (updateResults.affectedRows === 0) {
                    return res.json({ code: 4, msg: '支付失败，请检查挂号记录状态（可能未找到该挂号记录，或者该记录已支付）' });
                }

                res.json({ code: 0, msg: '支付成功' });
            });
        });
    });
});

// 启动服务器
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});