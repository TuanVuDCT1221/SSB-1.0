// db/sql.js
const { Connection, Request } = require('tedious');
require('dotenv').config();

// Cấu hình kết nối từ file .env
const config = {
    server: process.env.DB_SERVER, 
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER, 
            password: process.env.DB_PASSWORD,
        }
    },
    options: {
        database: process.env.DB_DATABASE,
        trustServerCertificate: true, // Chỉ dùng cho môi trường phát triển (localhost)
        encrypt: false,
        rowCollectionOnRequestCompletion: true, // Trả về kết quả dưới dạng mảng
        tdsVersion: '7_4'
    }
};

/**
 * Mở kết nối đến SQL Server và thực thi truy vấn.
 * @param {string} sqlQuery - Câu truy vấn SQL.
 * @returns {Promise<Array<Object>>} - Trả về mảng các dòng dữ liệu.
 */
const executeQuery = (sqlQuery, params = []) => {
    return new Promise((resolve, reject) => {
        const connection = new Connection(config);

        connection.on('connect', (err) => {
            if (err) {
                console.error("Lỗi kết nối CSDL:", err.message);
                return reject({ status: 500, message: "Lỗi kết nối CSDL." });
            }
            
            console.log("Kết nối DB thành công.");
            
            const request = new Request(sqlQuery, (err, rowCount, rows) => {
                if (err) {
                    console.error("Lỗi thực thi truy vấn:", err.message);
                    connection.close();
                    return reject({ status: 500, message: "Lỗi truy vấn SQL." });
                }
                
                // Lấy mảng dữ liệu từ Tedious, chuyển đổi cấu trúc nếu cần
                // Tedious trả về `rows[i][j].value`, cần chuyển thành object đơn giản hơn
                const result = rows.map(row => {
                    const obj = {};
                    row.forEach(col => {
                        obj[col.metadata.colName] = col.value;
                    });
                    return obj;
                });

                connection.close();
                resolve(result);
            });

            // Thêm tham số nếu có (chưa dùng trong phiên bản MVP này nhưng là best practice)
            // params.forEach(p => request.addParameter(p.name, p.type, p.value));

            connection.execSql(request);
        });

        connection.on('error', (err) => {
            console.error("Lỗi kết nối chung:", err.message);
            reject({ status: 500, message: "Lỗi hệ thống CSDL." });
        });

        connection.connect();
    });
};

module.exports = { executeQuery };